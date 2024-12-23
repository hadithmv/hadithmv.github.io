package com.hadithmv.hmv

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
    private val applicationUrl = "file:///android_asset/index.html"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


        val webView = WebView(this).apply {
            webViewClient = WebViewClient()
            settings.apply {
                javaScriptEnabled = true
                allowFileAccess = true
                domStorageEnabled = true
                // added
                allowFileAccessFromFileURLs = true
                // https://developer.android.com/reference/android/webkit/WebSettings
                // https://chromium.googlesource.com/chromium/src/+/HEAD/android_webview/docs/cors-and-webview-api.md
                // https://docs.jumio.com/production/Content/Integration/Integration%20Channels/Android%20WebView.htm
            }
            loadUrl(applicationUrl)
        }
        setContentView(webView)
    }
}
