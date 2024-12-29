package com.hadithmv.hmv

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

/**
 * MainActivity serves as the primary activity for the WebView-based application.
 * It handles URL loading, state persistence, and back button navigation with
 * improved memory management and state handling.
 */
class MainActivity : ComponentActivity() {
    // Constants
    companion object {
        // Maximum size for saved state bundle (500KB)
        private const val MAX_STATE_SIZE_BYTES = 500 * 1024
        // Key for WebView state bundle
        private const val WEBVIEW_STATE_KEY = "webview_state"
        // Key for last URL in preferences and saved state
        private const val LAST_URL_KEY = "last_url"
        // Key for SharedPreferences file
        private const val PREFS_NAME = "WebViewPrefs"
        // Default URL pointing to local assets
        private const val DEFAULT_URL = "file:///android_asset/books/index.html"
    }

    // WebView instance that will be used throughout the activity's lifecycle
    private lateinit var webView: WebView

    // SharedPreferences instance for persisting the last visited URL
    private lateinit var prefs: SharedPreferences

    /**
     * Initialize the activity and set up the WebView with all necessary configurations.
     * This includes setting up URL handling, WebView settings, and back navigation.
     *
     * @param savedInstanceState Bundle containing the activity's previously saved state
     */
    @SuppressLint("SetJavaScriptEnabled")  // Suppress JavaScript warning as it's required for our app
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize SharedPreferences for storing the last visited URL
        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)

        // Create and configure the WebView
        webView = WebView(this).apply {
            // Configure the WebViewClient to handle URL loading
            webViewClient = object : WebViewClient() {
                /**
                 * Handle URL loading requests. External URLs are opened in the browser,
                 * while local files are handled within the WebView.
                 *
                 * @param view The WebView that is initiating the callback
                 * @param request Object containing the details of the request
                 * @return true if the host application wants to handle the key event,
                 *         false otherwise
                 */
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val url = request?.url?.toString()
                    return when {
                        // No URL provided, let WebView handle it
                        url == null -> false
                        // Local file, let WebView handle it
                        url.startsWith("file://") -> false
                        else -> {
                            try {
                                // External URL: open in browser
                                startActivity(
                                    Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                )
                                true
                            } catch (e: Exception) {
                                // If no app can handle the URL, let WebView try
                                false
                            }
                        }
                    }
                }

                /**
                 * Called when a page finishes loading. Save the URL to preferences
                 * for persistence across app restarts.
                 *
                 * @param view The WebView that is initiating the callback
                 * @param url The URL of the page that just finished loading
                 */
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    url?.let { saveLastUrl(it) }
                }
            }

            // Configure WebView settings
            settings.apply {
                // Enable JavaScript execution (required for modern web apps)
                javaScriptEnabled = true

                // Enable access to local files
                allowFileAccess = true

                // Enable DOM storage API (required for many web apps)
                domStorageEnabled = true

                // Allow local files to access other local files
                allowFileAccessFromFileURLs = true

                // Allow access to content providers
                allowContentAccess = true

                // Prevent mixed content (HTTP content in HTTPS pages)
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW

                // Enable caching for better performance
                cacheMode = WebSettings.LOAD_DEFAULT

                // Enable database storage API
                databaseEnabled = true
            }

            // Load either the last visited URL or the default URL
            loadUrl(getLastUrl())
        }

        // Set the WebView as the content view
        setContentView(webView)

        // Configure back button handling
        setupBackNavigation()
    }

    /**
     * Sets up the back button navigation behavior for the WebView.
     * If the WebView can go back, it will navigate to the previous page.
     * Otherwise, it will exit the app.
     */
    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                when {
                    webView.canGoBack() -> webView.goBack()
                    else -> {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                }
            }
        })
    }

    /**
     * Save the last visited URL to SharedPreferences.
     *
     * @param url The URL to save
     */
    private fun saveLastUrl(url: String) {
        prefs.edit().apply {
            putString(LAST_URL_KEY, url)
            apply()  // Asynchronously save changes
        }
    }

    /**
     * Retrieve the last visited URL from SharedPreferences.
     *
     * @return The last visited URL or the default application URL if none exists
     */
    private fun getLastUrl(): String {
        return prefs.getString(LAST_URL_KEY, DEFAULT_URL) ?: DEFAULT_URL
    }

    /**
     * Saves the WebView state with size limits and cleanup if needed.
     * If the state is too large, only essential data (last URL) is saved.
     *
     * @param outState Bundle to save the state into
     */
    private fun saveWebViewState(outState: Bundle) {
        // Create a bundle for WebView state
        val webViewState = Bundle()
        webView.saveState(webViewState)

        // Check bundle size (approximate)
        if (webViewState.size() <= MAX_STATE_SIZE_BYTES) {
            // Save full state if within size limit
            outState.putBundle(WEBVIEW_STATE_KEY, webViewState)
        } else {
            // If state is too large, save only essential data
            outState.putString(LAST_URL_KEY, webView.url)
            // Clear WebView history to free up memory
            webView.clearHistory()
        }
    }

    /**
     * Save WebView state before the activity might be destroyed.
     *
     * @param outState Bundle to save the state into
     */
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        saveWebViewState(outState)
    }

    /**
     * Restore WebView state when the activity is recreated.
     * Handles both full state restoration and fallback to last URL.
     *
     * @param savedInstanceState Bundle containing the saved state
     */
    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)

        // Try to restore full WebView state
        val webViewState = savedInstanceState.getBundle(WEBVIEW_STATE_KEY)
        if (webViewState != null) {
            webView.restoreState(webViewState)
        } else {
            // Fallback to last URL if full state wasn't saved
            val lastUrl = savedInstanceState.getString(LAST_URL_KEY)
            if (lastUrl != null) {
                webView.loadUrl(lastUrl)
            }
        }
    }

    /**
     * Clean up WebView resources when the activity is destroyed.
     * This prevents memory leaks and ensures proper cleanup.
     */
    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}