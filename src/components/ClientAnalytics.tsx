'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const GA_ID = 'G-9NKK8JNLRH';

/**
 * Loads Google Analytics only in browser (not in Capacitor WebView) to avoid
 * WKWebView failures and black screen.
 */
export function ClientAnalytics() {
  const [isCapacitor, setIsCapacitor] = useState<boolean | null>(null);

  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: unknown }).Capacitor;
    setIsCapacitor(Boolean(cap));
  }, []);

  if (isCapacitor === null || isCapacitor) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
