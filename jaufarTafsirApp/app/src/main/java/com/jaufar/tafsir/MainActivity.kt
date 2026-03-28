package com.jaufar.tafsir

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import android.content.Intent
import android.net.Uri
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import androidx.activity.OnBackPressedCallback
import android.content.SharedPreferences
import android.content.res.Configuration
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import android.webkit.JavascriptInterface
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import android.graphics.Color

/**
 * MainActivity serves as the primary activity for the WebView-based application.
 */
class MainActivity : ComponentActivity() {
    companion object {
        private const val MAX_STATE_SIZE_BYTES = 500 * 1024
        private const val WEBVIEW_STATE_KEY = "webview_state"
        private const val LAST_URL_KEY = "last_url"
        private const val PREFS_NAME = "WebViewPrefs"
        private const val DEFAULT_URL = "file:///android_asset/books/index.html"
        private const val ERROR_404_URL = "file:///android_asset/page/404.html"
    }

    private lateinit var webView: WebView
    private lateinit var prefs: SharedPreferences

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)

        webView = WebView(this).apply {
            // Set background color immediately to prevent white flash
            setBackgroundColor(Color.parseColor("#0A1628"))

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val url = request?.url?.toString()
                    return when {
                        url == null -> false
                        url.startsWith("file://") -> false
                        else -> {
                            try {
                                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                                true
                            } catch (e: Exception) {
                                false
                            }
                        }
                    }
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    if (url != null && !url.endsWith("404.html")) {
                        saveLastUrl(url)
                    }
                }

                @Deprecated("Deprecated in Java")
                override fun onReceivedError(
                    view: WebView?,
                    errorCode: Int,
                    description: String?,
                    failingUrl: String?
                ) {
                    if (errorCode == ERROR_FILE_NOT_FOUND ||
                        errorCode == ERROR_HOST_LOOKUP ||
                        description?.contains("net::ERR_FILE_NOT_FOUND") == true) {
                        saveLastUrl(DEFAULT_URL)
                        view?.loadUrl(ERROR_404_URL)
                    } else {
                        super.onReceivedError(view, errorCode, description, failingUrl)
                    }
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: android.webkit.WebResourceError?
                ) {
                    if (request?.isForMainFrame == true) {
                        error?.let {
                            onReceivedError(view, it.errorCode, it.description?.toString(), request.url?.toString())
                        }
                    }
                }
            }

            settings.apply {
                // Enable dark mode support
                if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK) &&
                    WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK_STRATEGY)) {
                    when (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) {
                        Configuration.UI_MODE_NIGHT_YES -> {
                            WebSettingsCompat.setForceDark(this, WebSettingsCompat.FORCE_DARK_ON)
                            WebSettingsCompat.setForceDarkStrategy(
                                this,
                                WebSettingsCompat.DARK_STRATEGY_WEB_THEME_DARKENING_ONLY
                            )
                        }
                        else -> {
                            WebSettingsCompat.setForceDark(this, WebSettingsCompat.FORCE_DARK_OFF)
                        }
                    }
                }

                // Enable JavaScript execution (required for modern web apps)
                javaScriptEnabled = true
                mediaPlaybackRequiresUserGesture = false
                allowFileAccess = true
                domStorageEnabled = true
                allowFileAccessFromFileURLs = true
                allowUniversalAccessFromFileURLs = true
                allowContentAccess = true
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                cacheMode = WebSettings.LOAD_DEFAULT
                databaseEnabled = true
            }

            addJavascriptInterface(object {
                @JavascriptInterface
                fun isDarkMode(): Boolean {
                    return resources.configuration.uiMode and
                            Configuration.UI_MODE_NIGHT_MASK ==
                            Configuration.UI_MODE_NIGHT_YES
                }
            }, "Android")

            loadUrl(getLastUrl())
        }

        setContentView(webView)
        setupBackNavigation()
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack()
                else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun saveLastUrl(url: String) {
        prefs.edit().putString(LAST_URL_KEY, url).apply()
    }

    private fun getLastUrl(): String = prefs.getString(LAST_URL_KEY, DEFAULT_URL) ?: DEFAULT_URL

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        val webViewState = Bundle()
        webView.saveState(webViewState)
        if (webViewState.size() <= MAX_STATE_SIZE_BYTES) {
            outState.putBundle(WEBVIEW_STATE_KEY, webViewState)
        } else {
            outState.putString(LAST_URL_KEY, webView.url)
            webView.clearHistory()
        }
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        val webViewState = savedInstanceState.getBundle(WEBVIEW_STATE_KEY)
        if (webViewState != null) webView.restoreState(webViewState)
        else savedInstanceState.getString(LAST_URL_KEY)?.let { webView.loadUrl(it) }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
