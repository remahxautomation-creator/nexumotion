import { contact, formatAddress } from "@/content/site-content";

/**
 * Privacy policy and terms of sale, in both languages.
 *
 * Written to what the site actually does, not copied from a template: an
 * inquiry/quote flow with pay-on-invoice, USD list prices, mostly backorder
 * stock, GA4/Ads tags, an AI assistant that forwards questions to a third-party
 * model, and hosting on Cloudflare. If any of those change, change the text —
 * a policy that describes a site other than this one is worse than none.
 *
 * `updated` is the date of the last substantive edit and is shown on the page.
 * Bump it when the wording changes, not on every deploy.
 */

export type LegalSection = { heading: string; paragraphs: string[]; bullets?: string[] };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

export const LEGAL_UPDATED = "2026-09-16";

const EMAIL = contact.email;
const PHONE = contact.phone;

export const privacy: Record<"en" | "ar", LegalDoc> = {
  en: {
    title: "Privacy Policy",
    intro:
      `NexuMotion (“we”, “us”) supplies industrial automation parts from ${formatAddress("en")}. This policy explains what personal data we collect through nexumotion.com, why, how long we keep it and what rights you have. It is written to comply with Egypt's Personal Data Protection Law No. 151 of 2020.`,
    sections: [
      {
        heading: "1. What we collect",
        paragraphs: ["We only collect what is needed to answer you and fulfil an order:"],
        bullets: [
          "Enquiry and quote forms: your name, company, email, phone, country and the message or part numbers you send.",
          "Account registration: name, company, email, phone, country and a password (stored only as a salted hash — we cannot read it).",
          "Orders: the items, quantities, delivery details and invoicing details you provide at checkout.",
          "AI assistant: the questions you type. They are sent to a third-party language-model provider to generate an answer and are not linked to your account.",
          "Technical data: IP address, browser type, pages visited and referring page, collected by our hosting provider and analytics (see section 4).",
        ],
      },
      {
        heading: "2. Why we use it",
        paragraphs: ["We process personal data on the following bases:"],
        bullets: [
          "To respond to an enquiry, prepare a quotation or fulfil an order you asked for (performance of a contract or pre-contract steps).",
          "To keep records of quotations, orders and invoices as required by Egyptian commercial and tax law (legal obligation).",
          "To protect the site against abuse, fraud and automated traffic (legitimate interest).",
          "To measure which pages and advertisements bring visitors, so we can improve the catalogue (legitimate interest; you can opt out of analytics cookies in your browser).",
        ],
        },
      {
        heading: "3. Marketing",
        paragraphs: [
          "We do not send marketing email or WhatsApp messages unless you have asked to receive them. A reply to your enquiry or an update on your order is not marketing. You can ask us to stop any communication at any time by writing to the address in section 9.",
        ],
      },
      {
        heading: "4. Cookies and analytics",
        paragraphs: [
          "The site sets a cookie to remember your language choice and, if you sign in, a session cookie. We use Google Analytics 4 and Google Ads conversion tracking to understand how visitors reach the site and whether an advertisement led to an enquiry. These set Google cookies and send your IP address and page activity to Google, which may process it outside Egypt under its own privacy policy. You can block these cookies in your browser without losing any function of the site.",
        ],
      },
      {
        heading: "5. Who we share data with",
        paragraphs: ["We do not sell personal data. We share it only with processors that help us run the site:"],
        bullets: [
          "Cloudflare, Inc. — hosting, database and email delivery. Data may be stored and processed in data centres outside Egypt.",
          "Google LLC — analytics and advertising measurement, as described in section 4.",
          "A language-model provider (Anthropic, Groq or OpenAI, depending on configuration) — receives only the text you type into the AI assistant.",
          "Couriers and freight forwarders — receive the name, address and phone number needed to deliver an order.",
          "Manufacturers or authorised distributors — where a quotation requires checking availability with them, we share the part number and quantity only, never your identity, unless you ask us to.",
        ],
      },
      {
        heading: "6. How long we keep it",
        paragraphs: [],
        bullets: [
          "Enquiries and quotations that do not become orders: 24 months, then deleted.",
          "Orders and invoices: 5 years after the transaction, as required by Egyptian tax law.",
          "Accounts: until you ask us to delete the account, or after 3 years without sign-in.",
          "AI assistant questions: not stored by us beyond the request; retention by the model provider is governed by its policy.",
          "Server and security logs: up to 30 days.",
        ],
      },
      {
        heading: "7. Security",
        paragraphs: [
          "All traffic to the site is encrypted (HTTPS). Passwords are hashed, never stored in plain text. Access to customer records is limited to staff who need it to process orders. No system is perfectly secure; if we become aware of a breach affecting your data we will notify you and the Personal Data Protection Centre as the law requires.",
        ],
      },
      {
        heading: "8. Your rights",
        paragraphs: ["Under Law 151/2020 you may:"],
        bullets: [
          "Ask what personal data we hold about you and receive a copy.",
          "Ask us to correct data that is inaccurate or incomplete.",
          "Ask us to delete your data, unless we must keep it to comply with the law or to complete an order in progress.",
          "Object to, or withdraw consent for, any processing that is based on consent.",
          "Lodge a complaint with the Egyptian Personal Data Protection Centre.",
        ],
      },
      {
        heading: "9. Contact",
        paragraphs: [
          `To exercise any right or ask a question about this policy, email ${EMAIL} or call ${PHONE}. We answer within 10 business days. Our address is ${formatAddress("en")}.`,
        ],
      },
      {
        heading: "10. Changes",
        paragraphs: [
          "If we change this policy we will update the date at the top of the page. Material changes to how we use data already collected will be announced on this page before they take effect.",
        ],
      },
    ],
  },
  ar: {
    title: "سياسة الخصوصية",
    intro:
      `نكسوموشن («نحن») تورّد قطع غيار الأتمتة الصناعية من ${formatAddress("ar")}. توضح هذه السياسة ما نجمعه من بيانات شخصية عبر موقع nexumotion.com، ولماذا، ومدة الاحتفاظ بها، وما لك من حقوق. وقد كُتبت وفقًا لقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020.`,
    sections: [
      {
        heading: "1. ما نجمعه",
        paragraphs: ["نجمع فقط ما يلزم للرد عليك وتنفيذ طلبك:"],
        bullets: [
          "نماذج الاستفسار وطلب عرض السعر: الاسم، الشركة، البريد الإلكتروني، الهاتف، الدولة، ونص الرسالة أو أرقام القطع التي ترسلها.",
          "تسجيل الحساب: الاسم، الشركة، البريد الإلكتروني، الهاتف، الدولة، وكلمة مرور (تُخزَّن كتجزئة مشفّرة فقط، ولا يمكننا قراءتها).",
          "الطلبات: الأصناف والكميات وبيانات التسليم والفوترة التي تدخلها عند إتمام الطلب.",
          "المساعد الذكي: الأسئلة التي تكتبها. تُرسل إلى مزوّد نموذج لغوي خارجي لتوليد الإجابة ولا تُربط بحسابك.",
          "بيانات تقنية: عنوان IP، نوع المتصفح، الصفحات التي زرتها والصفحة المحيلة، يجمعها مزوّد الاستضافة وأدوات التحليلات (انظر البند 4).",
        ],
      },
      {
        heading: "2. لماذا نستخدمها",
        paragraphs: ["نعالج البيانات الشخصية على الأسس التالية:"],
        bullets: [
          "للرد على استفسارك أو إعداد عرض سعر أو تنفيذ طلب طلبته أنت (تنفيذ عقد أو خطوات سابقة على التعاقد).",
          "لحفظ سجلات عروض الأسعار والطلبات والفواتير وفق ما يقتضيه القانون التجاري والضريبي المصري (التزام قانوني).",
          "لحماية الموقع من إساءة الاستخدام والاحتيال وحركة المرور الآلية (مصلحة مشروعة).",
          "لقياس الصفحات والإعلانات التي تجلب الزوار بهدف تحسين الكتالوج (مصلحة مشروعة؛ يمكنك إيقاف ملفات تعريف الارتباط التحليلية من متصفحك).",
        ],
      },
      {
        heading: "3. التسويق",
        paragraphs: [
          "لا نرسل رسائل تسويقية عبر البريد الإلكتروني أو واتساب إلا إذا طلبت استلامها. الرد على استفسارك أو تحديث حالة طلبك ليس تسويقًا. يمكنك أن تطلب منا إيقاف أي تواصل في أي وقت بالكتابة إلى العنوان الوارد في البند 9.",
        ],
      },
      {
        heading: "4. ملفات تعريف الارتباط والتحليلات",
        paragraphs: [
          "يضع الموقع ملف تعريف ارتباط لتذكّر اللغة التي اخترتها، وملف جلسة عند تسجيل الدخول. نستخدم Google Analytics 4 وتتبع تحويلات Google Ads لفهم كيف يصل الزوار إلى الموقع وما إذا كان إعلان ما قد أدى إلى استفسار. تضع هذه الأدوات ملفات تعريف ارتباط من Google وترسل عنوان IP ونشاط الصفحات إلى Google، التي قد تعالجها خارج مصر وفق سياسة الخصوصية الخاصة بها. يمكنك حظر هذه الملفات من متصفحك دون فقدان أي وظيفة في الموقع.",
        ],
      },
      {
        heading: "5. مع من نشارك البيانات",
        paragraphs: ["لا نبيع البيانات الشخصية. نشاركها فقط مع مزوّدي الخدمات الذين يساعدوننا في تشغيل الموقع:"],
        bullets: [
          "Cloudflare, Inc. — الاستضافة وقاعدة البيانات وإرسال البريد الإلكتروني. قد تُخزَّن البيانات وتُعالج في مراكز بيانات خارج مصر.",
          "Google LLC — التحليلات وقياس الإعلانات كما هو موضح في البند 4.",
          "مزوّد نموذج لغوي (Anthropic أو Groq أو OpenAI حسب الإعداد) — يتلقى فقط النص الذي تكتبه في المساعد الذكي.",
          "شركات الشحن والتخليص — تتلقى الاسم والعنوان ورقم الهاتف اللازمة لتسليم الطلب.",
          "المصنّعون أو الموزعون المعتمدون — عندما يتطلب عرض السعر التحقق من التوافر لديهم، نشارك رقم القطعة والكمية فقط، ولا نكشف هويتك إلا بطلب منك.",
        ],
      },
      {
        heading: "6. مدة الاحتفاظ",
        paragraphs: [],
        bullets: [
          "الاستفسارات وعروض الأسعار التي لا تتحول إلى طلبات: 24 شهرًا ثم تُحذف.",
          "الطلبات والفواتير: 5 سنوات بعد المعاملة وفق ما يقتضيه قانون الضرائب المصري.",
          "الحسابات: حتى تطلب حذف الحساب، أو بعد 3 سنوات دون تسجيل دخول.",
          "أسئلة المساعد الذكي: لا نخزنها بعد انتهاء الطلب؛ ويخضع احتفاظ مزوّد النموذج بها لسياسته.",
          "سجلات الخادم والأمان: حتى 30 يومًا.",
        ],
      },
      {
        heading: "7. الأمان",
        paragraphs: [
          "كل حركة المرور إلى الموقع مشفّرة (HTTPS). كلمات المرور مجزّأة ولا تُخزَّن أبدًا كنص واضح. الوصول إلى سجلات العملاء مقصور على الموظفين الذين يحتاجونه لمعالجة الطلبات. لا يوجد نظام آمن تمامًا؛ وإذا علمنا بخرق يمس بياناتك فسنخطرك ونخطر مركز حماية البيانات الشخصية وفق ما يقتضيه القانون.",
        ],
      },
      {
        heading: "8. حقوقك",
        paragraphs: ["بموجب القانون 151/2020 يحق لك:"],
        bullets: [
          "معرفة البيانات الشخصية التي نحتفظ بها عنك والحصول على نسخة منها.",
          "طلب تصحيح البيانات غير الدقيقة أو غير المكتملة.",
          "طلب حذف بياناتك، ما لم يكن علينا الاحتفاظ بها للامتثال للقانون أو لإتمام طلب قيد التنفيذ.",
          "الاعتراض على أي معالجة تقوم على الموافقة أو سحب تلك الموافقة.",
          "تقديم شكوى إلى مركز حماية البيانات الشخصية المصري.",
        ],
      },
      {
        heading: "9. التواصل",
        paragraphs: [
          `لممارسة أي حق أو الاستفسار عن هذه السياسة، راسلنا على ${EMAIL} أو اتصل على ${PHONE}. نرد خلال 10 أيام عمل. عنواننا: ${formatAddress("ar")}.`,
        ],
      },
      {
        heading: "10. التغييرات",
        paragraphs: [
          "إذا غيّرنا هذه السياسة فسنحدّث التاريخ أعلى الصفحة. وأي تغيير جوهري في طريقة استخدام البيانات المجمّعة سابقًا سيُعلن في هذه الصفحة قبل سريانه.",
        ],
      },
    ],
  },
};

export const terms: Record<"en" | "ar", LegalDoc> = {
  en: {
    title: "Terms & Conditions of Sale",
    intro:
      "These terms apply to every quotation, order and sale made through nexumotion.com or by email with NexuMotion. By requesting a quotation or placing an order you accept them. The site is a business-to-business catalogue; if you are buying as a consumer, Egyptian consumer-protection law applies in addition to these terms.",
    sections: [
      {
        heading: "1. Catalogue information",
        paragraphs: [
          "Product names, part numbers, specifications and datasheets are taken from manufacturers' published documentation and are provided to help you identify the correct part. We check them carefully but cannot guarantee they are free of errors. Always confirm a part against the manufacturer's datasheet before ordering it for a safety-related or critical application. Cross-reference and “replacement for” suggestions are guidance only; you are responsible for verifying fit, form and function in your installation.",
          "Manufacturer names and logos are used only to identify the parts we supply. NexuMotion is an independent supplier and is not an authorised distributor of any brand unless stated on the product page.",
        ],
      },
      {
        heading: "2. Prices and quotations",
        paragraphs: [],
        bullets: [
          "Prices on the site are list prices in US dollars, exclusive of VAT, delivery and any customs duties. They are indicative and may change without notice.",
          "The binding price is the one stated in a written quotation from us. A quotation is valid for 7 days unless it states otherwise, and is subject to the goods remaining available.",
          "A price of 0 or “request a quote” means the part is priced on request.",
          "Egyptian VAT is added at the rate in force on the invoice date. Payment in Egyptian pounds is converted at the rate stated on the quotation.",
        ],
      },
      {
        heading: "3. Orders and acceptance",
        paragraphs: [
          "An order placed on the site, by email or by WhatsApp is an offer to buy. A contract is formed only when we confirm the order in writing. We may decline an order — for example if the part is no longer available, the price was shown in error or the buyer cannot be verified — and will tell you promptly if we do.",
        ],
      },
      {
        heading: "4. Payment",
        paragraphs: [
          "Orders on the site are placed on a pay-on-invoice basis: we contact you within one business day with the invoice and payment options (bank transfer, card payment link or Fawry). Unless a credit account has been agreed in writing, goods are dispatched after payment is received in full. Title to the goods passes to you on full payment; risk passes on delivery.",
        ],
      },
      {
        heading: "5. Availability and lead times",
        paragraphs: [
          "Stock status on the site (In stock, Low stock, Backorder) is updated regularly but is not a guarantee. Most parts are sourced to order and the lead time is stated on the quotation. Lead times are estimates based on manufacturer and freight information and are not binding delivery dates; we will tell you as soon as we learn of a delay, and if a delay exceeds 30 days beyond the quoted lead time you may cancel the affected line for a full refund of any payment made for it.",
        ],
      },
      {
        heading: "6. Delivery",
        paragraphs: [
          "Delivery within Egypt is by courier to the address you give; the cost is stated on the quotation. Export shipments to the GCC and Africa are quoted per order. The buyer is the importer of record and responsible for import licences, duties and taxes in the destination country. Please inspect goods on receipt and report any shortage or transit damage within 3 business days.",
        ],
      },
      {
        heading: "7. Returns and cancellation",
        paragraphs: [],
        bullets: [
          "Parts sourced to order (most of the catalogue) cannot be cancelled once we have placed the order with our supplier, and cannot be returned unless faulty or supplied in error.",
          "Stocked parts may be returned within 14 days of delivery if unused, undamaged and in their original sealed packaging. A restocking charge of up to 20% may apply and return freight is at your cost.",
          "Parts supplied in error by us, or damaged in transit when reported under section 6, are replaced or refunded at our cost.",
          "Firmware-locked, cut-to-length, programmed or special-order items are not returnable.",
        ],
      },
      {
        heading: "8. Warranty",
        paragraphs: [
          "Goods are new and genuine unless the product page states otherwise, and carry the manufacturer's standard warranty, which is typically 12 months from delivery. Warranty claims are handled through us: contact us with the invoice number, part number and a description of the fault. The warranty does not cover damage from incorrect installation, wiring, over-voltage, environmental conditions outside the datasheet ratings, or modification. Our liability under warranty is limited to repair, replacement or refund of the affected part.",
        ],
      },
      {
        heading: "9. Limitation of liability",
        paragraphs: [
          "To the extent permitted by Egyptian law, we are not liable for loss of production, loss of profit, downtime, or any indirect or consequential loss arising from the goods or from information on the site, and our total liability for any order is limited to the price paid for it. Nothing in these terms excludes liability that cannot be excluded by law.",
        ],
      },
      {
        heading: "10. Accounts and acceptable use",
        paragraphs: [
          "You are responsible for keeping your account password confidential and for orders placed under it. Do not use automated tools to scrape the catalogue, submit fraudulent enquiries or attempt to interfere with the site. The AI assistant gives general guidance from catalogue data and is not a substitute for the manufacturer's documentation or a qualified engineer's judgement.",
        ],
      },
      {
        heading: "11. Governing law",
        paragraphs: [
          "These terms are governed by the laws of the Arab Republic of Egypt. Disputes that cannot be settled amicably fall under the jurisdiction of the courts of Sharqia Governorate, without prejudice to any mandatory consumer-protection rights.",
        ],
      },
      {
        heading: "12. Contact",
        paragraphs: [`NexuMotion, ${formatAddress("en")}. Email ${EMAIL}, phone ${PHONE}. Questions about these terms are answered within 3 business days.`],
      },
    ],
  },
  ar: {
    title: "الشروط والأحكام",
    intro:
      "تسري هذه الشروط على كل عرض سعر وطلب وعملية بيع تتم عبر موقع nexumotion.com أو بالبريد الإلكتروني مع نكسوموشن. وبطلبك عرض سعر أو تقديم طلب فإنك تقبلها. الموقع كتالوج للتعامل بين الشركات؛ وإذا كنت تشتري بصفتك مستهلكًا فيسري قانون حماية المستهلك المصري بالإضافة إلى هذه الشروط.",
    sections: [
      {
        heading: "1. معلومات الكتالوج",
        paragraphs: [
          "أسماء المنتجات وأرقام القطع والمواصفات وأوراق البيانات مأخوذة من وثائق المصنّعين المنشورة، وتُقدَّم لمساعدتك على تحديد القطعة الصحيحة. نراجعها بعناية لكن لا نضمن خلوها من الأخطاء. تحقق دائمًا من القطعة مقابل ورقة بيانات المصنّع قبل طلبها لتطبيق حرج أو متعلق بالسلامة. اقتراحات المرجع البديل و«بديل لـ» إرشادية فقط؛ وأنت المسؤول عن التحقق من الملاءمة الشكلية والوظيفية في تركيبك.",
          "تُستخدم أسماء وشعارات المصنّعين فقط لتحديد القطع التي نورّدها. نكسوموشن مورّد مستقل وليست موزعًا معتمدًا لأي علامة ما لم يُذكر ذلك في صفحة المنتج.",
        ],
      },
      {
        heading: "2. الأسعار وعروض الأسعار",
        paragraphs: [],
        bullets: [
          "الأسعار المعروضة على الموقع أسعار قائمة بالدولار الأمريكي، غير شاملة ضريبة القيمة المضافة والتوصيل وأي رسوم جمركية. وهي استرشادية وقابلة للتغيير دون إشعار.",
          "السعر الملزم هو المذكور في عرض سعر كتابي منا. يسري عرض السعر لمدة 7 أيام ما لم يُذكر خلاف ذلك، ويخضع لاستمرار توافر البضاعة.",
          "السعر 0 أو «اطلب عرض سعر» يعني أن القطعة تُسعَّر عند الطلب.",
          "تُضاف ضريبة القيمة المضافة المصرية بالنسبة السارية في تاريخ الفاتورة. ويُحوَّل السداد بالجنيه المصري وفق السعر المذكور في عرض السعر.",
        ],
      },
      {
        heading: "3. الطلبات والقبول",
        paragraphs: [
          "الطلب المقدَّم عبر الموقع أو البريد الإلكتروني أو واتساب هو عرض للشراء. ولا ينعقد العقد إلا عند تأكيدنا الطلب كتابيًا. يجوز لنا رفض الطلب — مثلًا إذا لم تعد القطعة متاحة، أو عُرض السعر خطأً، أو تعذر التحقق من المشتري — وسنخبرك فورًا في هذه الحالة.",
        ],
      },
      {
        heading: "4. الدفع",
        paragraphs: [
          "تُقدَّم الطلبات على الموقع على أساس الدفع بالفاتورة: نتواصل معك خلال يوم عمل واحد بالفاتورة وخيارات الدفع (تحويل بنكي، رابط دفع بالبطاقة، أو فوري). وما لم يُتفق كتابيًا على حساب ائتماني، تُشحن البضاعة بعد استلام كامل المبلغ. تنتقل ملكية البضاعة إليك عند السداد الكامل؛ وتنتقل المخاطر عند التسليم.",
        ],
      },
      {
        heading: "5. التوافر ومدد التوريد",
        paragraphs: [
          "حالة المخزون على الموقع (متوفر، كمية محدودة، طلب مسبق) تُحدَّث بانتظام لكنها ليست ضمانًا. معظم القطع تُورَّد حسب الطلب وتُذكر مدة التوريد في عرض السعر. مدد التوريد تقديرات مبنية على معلومات المصنّع والشحن وليست مواعيد تسليم ملزمة؛ سنخبرك فور علمنا بأي تأخير، وإذا تجاوز التأخير 30 يومًا عن المدة المذكورة يحق لك إلغاء البند المتأثر واسترداد كامل ما دفعته عنه.",
        ],
      },
      {
        heading: "6. التسليم",
        paragraphs: [
          "التوصيل داخل مصر عبر شركة شحن إلى العنوان الذي تحدده؛ وتُذكر التكلفة في عرض السعر. شحنات التصدير إلى الخليج وأفريقيا تُسعَّر لكل طلب. المشتري هو المستورد المسؤول عن تراخيص الاستيراد والرسوم والضرائب في بلد الوصول. يرجى فحص البضاعة عند الاستلام والإبلاغ عن أي نقص أو تلف أثناء النقل خلال 3 أيام عمل.",
        ],
      },
      {
        heading: "7. الإرجاع والإلغاء",
        paragraphs: [],
        bullets: [
          "القطع المورَّدة حسب الطلب (معظم الكتالوج) لا يمكن إلغاؤها بعد تقديم طلبنا للمورّد، ولا يمكن إرجاعها إلا إذا كانت معيبة أو ورِّدت خطأً.",
          "القطع المخزّنة يمكن إرجاعها خلال 14 يومًا من التسليم إذا كانت غير مستخدمة وغير تالفة وفي عبوتها الأصلية المغلقة. قد تُطبَّق رسوم إعادة تخزين تصل إلى 20% وتكون أجرة الإرجاع على نفقتك.",
          "القطع التي ورّدناها خطأً، أو تلفت أثناء النقل وأُبلغ عنها وفق البند 6، تُستبدل أو يُرد ثمنها على نفقتنا.",
          "الأصناف المقفلة برمجيًا أو المقطوعة بالطول أو المبرمجة أو ذات الطلب الخاص غير قابلة للإرجاع.",
        ],
      },
      {
        heading: "8. الضمان",
        paragraphs: [
          "البضاعة جديدة وأصلية ما لم تذكر صفحة المنتج خلاف ذلك، وتحمل ضمان المصنّع القياسي وهو عادةً 12 شهرًا من التسليم. تُعالج مطالبات الضمان من خلالنا: تواصل معنا برقم الفاتورة ورقم القطعة ووصف العطل. لا يغطي الضمان الأضرار الناتجة عن التركيب أو التوصيل الخاطئ، أو الجهد الزائد، أو ظروف بيئية خارج قيم ورقة البيانات، أو التعديل. وتقتصر مسؤوليتنا بموجب الضمان على إصلاح القطعة المتأثرة أو استبدالها أو رد ثمنها.",
        ],
      },
      {
        heading: "9. تحديد المسؤولية",
        paragraphs: [
          "في الحدود التي يسمح بها القانون المصري، لا نتحمل مسؤولية خسارة الإنتاج أو الأرباح أو التوقف أو أي خسارة غير مباشرة أو تبعية تنشأ عن البضاعة أو عن المعلومات الواردة في الموقع، وتقتصر مسؤوليتنا الإجمالية عن أي طلب على الثمن المدفوع عنه. ولا يستبعد أي مما في هذه الشروط مسؤولية لا يجوز استبعادها قانونًا.",
        ],
      },
      {
        heading: "10. الحسابات والاستخدام المقبول",
        paragraphs: [
          "أنت مسؤول عن سرية كلمة مرور حسابك وعن الطلبات المقدَّمة من خلاله. لا تستخدم أدوات آلية لنسخ الكتالوج، ولا تقدّم استفسارات احتيالية، ولا تحاول التدخل في عمل الموقع. المساعد الذكي يقدّم إرشادات عامة من بيانات الكتالوج وليس بديلًا عن وثائق المصنّع أو تقدير مهندس مؤهل.",
        ],
      },
      {
        heading: "11. القانون الواجب التطبيق",
        paragraphs: [
          "تخضع هذه الشروط لقوانين جمهورية مصر العربية. والنزاعات التي يتعذر تسويتها وديًا تختص بها محاكم محافظة الشرقية، دون الإخلال بأي حقوق إلزامية لحماية المستهلك.",
        ],
      },
      {
        heading: "12. التواصل",
        paragraphs: [`نكسوموشن، ${formatAddress("ar")}. البريد الإلكتروني ${EMAIL}، الهاتف ${PHONE}. نجيب عن الأسئلة المتعلقة بهذه الشروط خلال 3 أيام عمل.`],
      },
    ],
  },
};
