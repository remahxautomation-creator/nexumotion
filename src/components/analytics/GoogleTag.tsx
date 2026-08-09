import Script from "next/script";

/**
 * Google Ads global site tag.
 *
 * The ID is not a secret — it ships in the page source of every site that uses
 * one — so it lives here rather than in an environment variable, which on
 * Cloudflare would also have to be set as a *build* variable to reach client
 * code and is a step that silently no-ops when missed.
 *
 * Loaded with next/script at afterInteractive rather than pasted into <head>
 * as Google's instructions describe. In the App Router there is no <head> to
 * paste into, and a blocking third-party script in the critical path costs
 * page speed on exactly the mobile connections this audience is on. gtag
 * queues calls into dataLayer, so events fired before the script arrives are
 * still delivered.
 *
 * Disabled outside production so local and preview traffic does not land in
 * the ad account's data.
 */
export const GOOGLE_ADS_ID = "AW-18380279878";

export default function GoogleTag() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
