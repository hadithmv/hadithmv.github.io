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

class MainActivity : ComponentActivity() {
    private val applicationUrl = "file:///android_asset/books/index.html"
    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
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
            }

            settings.apply {
                javaScriptEnabled = true
                allowFileAccess = true
                domStorageEnabled = true
                allowFileAccessFromFileURLs = true
                allowContentAccess = true
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                cacheMode = WebSettings.LOAD_DEFAULT
                databaseEnabled = true
            }
            loadUrl(applicationUrl)
        }
        setContentView(webView)

        // Handle back button press
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

    // Optional: Save WebView state
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    // Optional: Restore WebView state
    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        webView.restoreState(savedInstanceState)
    }
}