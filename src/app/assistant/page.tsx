import { Sparkles, ShieldCheck } from "lucide-react";
import TechAssistant from "@/components/assistant/TechAssistant";
import { getT, getLocale } from "@/i18n/server";
import { aiEnabled } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("assistant.title"), description: t("assistant.lead") };
}

const EXAMPLES_EN = [
  "22 kW VFD, 380V three phase, Profinet",
  "IP67 inductive proximity sensor, PNP output",
  "safety relay for an e-stop circuit",
  "10 inch HMI with Modbus",
  "24V DC power supply, 10A, DIN rail",
  "ABB drive between 10 and 30 kW in stock",
];

const EXAMPLES_AR = [
  "مغيّر سرعة ٢٢ كيلوواط، ٣٨٠ فولت، Profinet",
  "حساس اقتراب IP67 بخرج PNP",
  "مرحّل أمان لدائرة توقف طارئ",
  "شاشة HMI ١٠ بوصة بـ Modbus",
  "مصدر طاقة ٢٤ فولت، ١٠ أمبير، DIN",
  "مغيّر ABB بين ١٠ و٣٠ كيلوواط متوفر",
];

export default async function AssistantPage() {
  const { t } = await getT();
  const locale = await getLocale();
  const hasAi = aiEnabled();

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="bg-gradient-to-br from-[#0A6286] to-[#063B54] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-6 h-6" />
            <span className="text-xs font-semibold uppercase tracking-wide bg-white/15 border border-white/25 rounded-full px-3 py-1">
              {hasAi ? t("assistant.badgeAi") : t("assistant.badgeSpec")}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("assistant.title")}</h1>
          <p className="mt-3 text-blue-100 max-w-2xl">{t("assistant.lead")}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-md px-3 py-2.5 mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{t("assistant.dataNote")}</span>
        </div>

        <TechAssistant examples={locale === "ar" ? EXAMPLES_AR : EXAMPLES_EN} />
      </div>
    </div>
  );
}
