import Script from "next/script";

/**
 * Google Tag Manager container.
 *
 * GTM is a container, not a measurement tag — it fires whatever tags you
 * configure in its web UI. That makes it easy to double-count: this site
 * ALREADY loads Google Ads (AW-18380279878) directly in GoogleTag.tsx, with
 * GA4 (G-Z2J00HQYH9) riding it as a linked destination. Adding a GA4 or Ads
 * tag inside the GTM workspace as well would report every page view twice.
 *
 * So: use this container for tags the site does not already load — Meta
 * pixel, LinkedIn Insight, a heatmap tool — or move Ads and GA4 into GTM and
 * delete GoogleTag.tsx. Do not do both for the same destination.
 *
 * Loaded at afterInteractive rather than "as high in <head> as possible" as
 * Google's snippet describes: the App Router has no <head> to paste into, and
 * this is what @next/third-parties does for the same reason. Tags fire a
 * moment later; the dataLayer queue means nothing is dropped.
 *
 * Disabled outside production so local traffic stays out of the reports. GTM's
 * own Preview mode still works against the deployed site.
 */
export const GTM_ID = "GTM-P7MDK5VS";

/**
 * Off until the container has something in it.
 *
 * gtm.js is 114 KB over the wire, on top of the 180 KB gtag.js already loads
 * for Ads and GA4. An empty container spends that on every visit and returns
 * nothing — and page speed feeds Google's Quality Score, which feeds
 * cost-per-click, so it is charged for twice over while ads are running.
 *
 * Flip to true the moment there is a tag to serve — a Meta or TikTok pixel,
 * a heatmap, anything the site does not already load. The container itself is
 * installed and verified working; this only decides whether the script ships.
 *
 * Note the "Container quality: No Recent Data" warning in the GTM console is
 * expected while this is false, and was expected while it was true and empty.
 * It reports tag firings, and there are no tags.
 */
const GTM_ENABLED = false;

export default function GoogleTagManager() {
  if (!GTM_ENABLED) return null;
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {/* The noscript iframe Google asks for immediately after <body>. It only
          does anything for visitors with JavaScript disabled — who cannot use
          this site at all, since the catalogue, cart and search are React. Kept
          because it costs nothing and GTM's container health check looks for
          it. */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>

      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
    </>
  );
}
