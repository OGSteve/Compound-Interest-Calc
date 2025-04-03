"use client";

import Script from "next/script";

export default function GoogleAnalytics({
  measurementId,
}: {
  measurementId: string;
}) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              debug_mode: true,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}
