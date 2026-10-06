/**
 * Cookie consent state.
 *
 * Three cookies exist on this site and only one of them needs asking about:
 *
 *   locale            strictly necessary — the page cannot render in the right
 *                     language without it, and it holds nothing about a person.
 *   next-auth session strictly necessary — it exists only once you sign in,
 *                     which is itself the request to be remembered.
 *   _ga / _gcl_*      analytics and advertising. These identify a browser
 *                     across visits and are shared with Google. These are the
 *                     ones consent governs.
 *
 * The choice is kept in a first-party cookie rather than localStorage so the
 * server can read it too, and so clearing site data clears the consent with
 * everything else it applies to — a consent record that outlives the cookies
 * it covers is the wrong way round.
 */
export const CONSENT_COOKIE = "nx-consent";
export type ConsentValue = "granted" | "denied";

/** Six months. Long enough not to nag, short enough that consent is renewed. */
const MAX_AGE = 60 * 60 * 24 * 182;

export function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  const v = m?.[1];
  return v === "granted" || v === "denied" ? v : null;
}

export function writeConsent(value: ConsentValue) {
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${MAX_AGE}; samesite=lax${
    location.protocol === "https:" ? "; secure" : ""
  }`;
  applyConsent(value);
}

/**
 * Tells Google the decision, in the vocabulary Consent Mode v2 expects.
 *
 * `ad_user_data` and `ad_personalization` are the two signals Google made
 * mandatory in 2024: without them, conversions from the EEA and UK are not
 * recorded at all, consented or not. They are sent together with the storage
 * ones so there is a single source of truth for the whole decision.
 */
export function applyConsent(value: ConsentValue) {
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    // gtag() is `function gtag(){dataLayer.push(arguments)}`. Pushing the
    // arguments object is what Google's own snippet does, and this has to work
    // whether or not gtag.js has loaded yet — before it arrives, the queue is
    // all there is.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function gtag(...args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    }
    gtag("consent", "update", {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value,
    });
  } catch {
    // A consent signal that throws must not take the page down with it.
  }
}

/**
 * The inline script that runs before any tag loads.
 *
 * Everything is denied by default and only raised if a previous visit left a
 * "granted" cookie. Order matters: if the default arrived after gtag.js, the
 * first page view would already have written cookies, and an opt-in that
 * happens after the fact is not an opt-in.
 */
export const CONSENT_BOOTSTRAP = `(function(){
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{var m=document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]*)/);
if(m&&m[1]==='granted'){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'})}}catch(e){}
})()`;
