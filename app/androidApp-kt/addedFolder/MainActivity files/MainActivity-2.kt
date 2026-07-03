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
 * It handles URL loading, state persistence, and back button navigation.
 */
class MainActivity : ComponentActivity() {
    // Base URL for the application's local HTML content in the assets folder
    private val applicationUrl = "file:///android_asset/books/index.html"

    // WebView instance that will be used throughout the activity's lifecycle
    private lateinit var webView: WebView

    // SharedPreferences instance for persisting the last visited URL
    private lateinit var prefs: SharedPreferences

    // Key used to store and retrieve the last visited URL in SharedPreferences
    private val LAST_URL_KEY = "last_url"

    /**
     * Initialize the activity and set up the WebView with all necessary configurations.
     * @param savedInstanceState Bundle containing the activity's previously saved state
     */
    @SuppressLint("SetJavaScriptEnabled")  // Suppress JavaScript warning as it's required for our app
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize SharedPreferences for storing the last visited URL
        prefs = getSharedPreferences("WebViewPrefs", MODE_PRIVATE)

        // Create and configure the WebView
        webView = WebView(this).apply {
            // Configure the WebViewClient to handle URL loading
            webViewClient = object : WebViewClient() {
                /**
                 * Handle URL loading requests. External URLs are opened in the browser,
                 * while local files are handled within the WebView.
                 */
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString()
                    return when {
                        url == null -> false  // No URL provided, let WebView handle it
                        url.startsWith("file://") -> false  // Local file, let WebView handle it
                        else -> {
                            try {
                                // External URL: open in browser
                                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                                true
                            } catch (e: Exception) {
                                // If no app can handle the URL, let WebView try to handle it
                                false
                            }
                        }
                    }
                }

                /**
                 * Called when a page finishes loading. Save the URL to preferences
                 * for persistence across app restarts.
                 */
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    url?.let { saveLastUrl(it) }
                }
            }

            // Configure WebView settings
            settings.apply {
                javaScriptEnabled = true  // Enable JavaScript execution
                allowFileAccess = true    // Allow access to local files
                domStorageEnabled = true  // Enable DOM storage API
                allowFileAccessFromFileURLs = true  // Allow local files to access other local files
                allowContentAccess = true // Allow access to content providers

                // Prevent mixed content (HTTP content in HTTPS pages)
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW

                // Enable caching
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
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            /**
             * Handle back button press:
             * - If WebView can go back, navigate to previous page
             * - Otherwise, exit the app
             */
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
     * @return The last visited URL or the default application URL if none exists
     */
    private fun getLastUrl(): String {
        return prefs.getString(LAST_URL_KEY, applicationUrl) ?: applicationUrl
    }

    /**
     * Save WebView state when the activity is paused.
     */
    override fun onPause() {
        super.onPause()
        webView.saveState(Bundle())
    }

    /**
     * Save WebView state before the activity might be destroyed.
     */
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    /**
     * Restore WebView state when the activity is recreated.
     */
    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        webView.restoreState(savedInstanceState)
    }
}