import LegalDocument from "@/components/layout/LegalDocument";
import { privacy } from "@/content/legal";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { locale } = await getT();
  return {
    title: privacy[locale].title,
    description: privacy[locale].intro.slice(0, 155),
  };
}

export default async function PrivacyPage() {
  const { locale, t } = await getT();
  return (
    <LegalDocument
      doc={privacy[locale]}
      locale={locale}
      updatedLabel={t("legal.updated")}
      otherHref="/terms"
      otherLabel={t("footer.terms")}
    />
  );
}
