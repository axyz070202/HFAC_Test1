import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hfac.audiopoc',
  appName: 'HFAC',
  webDir: 'dist',
  android: {
    // getUserMedia inside the WebView needs an HTTPS-equivalent origin, same as the
    // browser dev/gh-pages testing did — Capacitor's "https://localhost" virtual
    // scheme (the default since Capacitor 3) satisfies that without any real cert.
    allowMixedContent: false,
  },
};

export default config;
