package com.hadithmv.hmv

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
// added
import android.content.Intent
import android.net.Uri

class MainActivity : ComponentActivity() {
    // private val applicationUrl = "file:///android_asset/index.html"
    private val applicationUrl = "file:///android_asset/books/index.html"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


        val webView = WebView(this).apply {

//            old code
//            webViewClient = WebViewClient()

//
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    if (url != null && !url.startsWith("file://")) {
                        // Open external URLs in browser
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    }
                    // Let WebView handle local file URLs
                    return false
                }
            }
//


            settings.apply {
                javaScriptEnabled = true
                allowFileAccess = true
                domStorageEnabled = true
                // added
                allowFileAccessFromFileURLs = true
                // https://developer.android.com/reference/android/webkit/WebSettings
                // https://chromium.googlesource.com/chromium/src/+/HEAD/android_webview/docs/cors-and-webview-api.md
                // https://docs.jumio.com/production/Content/Integration/Integration%20Channels/Android%20WebView.htm
                // added
            }
            loadUrl(applicationUrl)
        }
        setContentView(webView)
    }
}
