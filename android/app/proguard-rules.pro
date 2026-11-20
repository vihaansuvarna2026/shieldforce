# The app has no JavaScript interface, so nothing needs keeping for @JavascriptInterface.
# Keep WebView client callbacks that the framework resolves reflectively.
-keepclassmembers class * extends android.webkit.WebViewClient {
    public *** shouldInterceptRequest(...);
    public *** shouldOverrideUrlLoading(...);
}
