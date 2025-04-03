"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GoogleAnalytics({
  measurementId,
}: {
  measurementId: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views and time spent
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      // Track page view
      (window as any).gtag("event", "page_view", {
        page_path: pathname + searchParams.toString(),
        page_title: document.title,
      });

      // Track time spent on page
      const startTime = Date.now();
      return () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000); // Convert to seconds
        (window as any).gtag("event", "time_spent", {
          time_spent: timeSpent,
          page_path: pathname + searchParams.toString(),
        });
      };
    }
  }, [pathname, searchParams]);

  // Track user interactions
  useEffect(() => {
    if (typeof window === "undefined") return;

    const trackInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Get the most specific identifier for the element
      const elementId = target.id || target.getAttribute("data-ga-id");
      const elementClass = target.className;
      const elementText = target.textContent?.trim();

      // Only track if we have some identifying information
      if (elementId || elementClass || elementText) {
        (window as any).gtag("event", "user_interaction", {
          event_category: "engagement",
          event_label: elementId || elementClass || elementText,
          interaction_type: event.type,
          page_path: pathname + searchParams.toString(),
        });
      }
    };

    // Track button clicks and form submissions
    window.addEventListener("click", trackInteraction);
    window.addEventListener("submit", trackInteraction);

    return () => {
      window.removeEventListener("click", trackInteraction);
      window.removeEventListener("submit", trackInteraction);
    };
  }, [pathname, searchParams]);

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
              send_page_view: true,
              page_path: window.location.pathname + window.location.search,
              page_title: document.title
            });
          `,
        }}
      />
    </>
  );
}
