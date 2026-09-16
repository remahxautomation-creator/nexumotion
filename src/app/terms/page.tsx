import LegalDocument from "@/components/layout/LegalDocument";
import { terms } from "@/content/legal";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { locale } = await getT();
  return {
    title: terms[locale].title,
    description: terms[locale].intro.slice(0, 155),
  };
}

export default async function TermsPage() {
  const { locale, t } = await getT();
  return (
    <LegalDocument
      doc={terms[locale]}
      locale={locale}
      updatedLabel={t("legal.updated")}
      otherHref="/privacy"
      otherLabel={t("footer.privacy")}
    />
  );
}
