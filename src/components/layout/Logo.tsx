import Image from "next/image";

/**
 * The NexuMotion lockup.
 *
 * Two files, not one: the wordmark is #085868, which disappears against the
 * dark-mode header (#131c2e) and the always-dark footer. The reversed variant
 * covers those. Both are rendered and swapped in CSS rather than picked in JS,
 * because the theme is applied by an inline script before hydration — reading
 * it during render would produce a server/client mismatch and a visible flash.
 *
 * `alwaysLight` forces the reversed variant for surfaces that are dark in both
 * themes, such as the footer.
 */
export default function Logo({
  className = "h-11 w-auto",
  priority = false,
  alwaysLight = false,
}: {
  className?: string;
  priority?: boolean;
  alwaysLight?: boolean;
}) {
  const common = {
    width: 560,
    height: 249,
    priority,
    // next/image optimisation is inert on Workers without an IMAGES binding,
    // and these are already sized for their slots — going through the
    // optimiser would only add a round trip.
    unoptimized: true,
    alt: "NexuMotion",
  };

  if (alwaysLight) {
    return <Image {...common} src="/logo-light.png" className={className} />;
  }

  return (
    <>
      <Image {...common} src="/logo.png" className={`${className} dark-hidden`} />
      <Image {...common} src="/logo-light.png" className={`${className} light-hidden`} aria-hidden />
    </>
  );
}
