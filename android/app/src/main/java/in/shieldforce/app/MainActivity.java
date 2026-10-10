package in.shieldforce.app;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // System Back (button or gesture) steps back through the app's screens, like the
        // app bar's back arrow. Only on the first screen is it left to Android, which closes
        // the app with the usual predictive-back animation.
        OnBackPressedCallback back = new OnBackPressedCallback(false) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge().getWebView();
                if (webView.canGoBack()) {
                    webView.goBack();
                }
            }
        };
        getOnBackPressedDispatcher().addCallback(this, back);

        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public void onPageLoaded(WebView webView) {
                back.setEnabled(webView.canGoBack());
            }
        });
    }
}
