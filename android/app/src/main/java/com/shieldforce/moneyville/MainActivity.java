package com.shieldforce.moneyville;

import android.annotation.SuppressLint;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewFeature;

/**
 * MoneyVille runs entirely on the device. Every file the game needs ships
 * inside the APK and is served to the WebView by {@link WebViewAssetLoader}
 * over a virtual https:// origin, so the page gets a secure context (which
 * localStorage, used for every save slot, requires) without the app holding
 * the INTERNET permission at all.
 *
 * <p>No permission means no network traffic is possible, which is the point:
 * this is a children's game, so the simplest honest answer on Google Play's
 * Data Safety form is that nothing is collected and nothing is transmitted.
 */
public class MainActivity extends AppCompatActivity {

    /** The origin {@link WebViewAssetLoader} serves on; not a real host. */
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String START_URL = ORIGIN + "/assets/www/index.html";

    /**
     * Android scales web text by the system font setting. The game's layout is
     * sized in rem, so it follows that scale — welcome up to a point, but an
     * extreme setting would push the level map apart. Honour the user's choice
     * within a range the layout is verified to survive.
     */
    private static final int MIN_TEXT_ZOOM = 85;
    private static final int MAX_TEXT_ZOOM = 130;

    private WebView webView;
    private boolean pageReady = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        // Hold the splash screen until the game has actually painted, so the
        // player never sees a white flash between the two.
        SplashScreen splash = SplashScreen.installSplashScreen(this);
        splash.setKeepOnScreenCondition(() -> !pageReady);

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        applyWindowInsets();

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        // Every save slot, cosmetic and progress record lives in localStorage.
        settings.setDomStorageEnabled(true);
        // Nothing is loaded from disk or from content:// providers.
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        // Sound effects should play without a separate tap.
        settings.setMediaPlaybackRequiresUserGesture(false);
        // The page is already laid out for the viewport; let it be.
        settings.setUseWideViewPort(false);
        settings.setLoadWithOverviewMode(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setTextZoom(clampTextZoom(settings.getTextZoom()));

        // The game ships one light theme. Without this, WebView may invert it
        // on a device in dark mode and wreck the artwork.
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(settings, false);
        }

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // Everything the game links to is inside the bundle. Anything
                // else is refused rather than silently opened.
                return !ORIGIN.equals(request.getUrl().getScheme() + "://" + request.getUrl().getHost());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pageReady = true;
            }
        });

        // Back should walk the game's own screens before it leaves the app.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
            pageReady = true;
        } else {
            webView.loadUrl(START_URL);
        }
    }

    /**
     * From Android 15 apps draw edge to edge, so the activity is responsible
     * for keeping its content clear of the status and navigation bars. The
     * blue scrim fills the status bar area with the game's brand colour; the
     * WebView is inset below it.
     */
    private void applyWindowInsets() {
        final View root = findViewById(R.id.root);
        final View scrim = findViewById(R.id.status_scrim);
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, windowInsets) -> {
            Insets bars = windowInsets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            ViewGroup.LayoutParams lp = scrim.getLayoutParams();
            lp.height = bars.top;
            scrim.setLayoutParams(lp);
            webView.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
    }

    private static int clampTextZoom(int zoom) {
        return Math.max(MIN_TEXT_ZOOM, Math.min(MAX_TEXT_ZOOM, zoom));
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onPause() {
        webView.onPause();
        webView.pauseTimers();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.resumeTimers();
        webView.onResume();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            // Detach before destroying or WebView leaks the activity.
            ((ViewGroup) webView.getParent()).removeView(webView);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
