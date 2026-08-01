// Knowledge base for the site-guide chatbot.
//
// Intent-matched against real site features — it navigates, it does not answer
// technical product questions. Those go to /assistant, which queries the
// database. Keeping the two separate means the guide can never invent a part.

export type GuideTopic = {
  id: string;
  keywords: string[];        // matched case-insensitively against the message
  en: { label: string; reply: string; links?: { label: string; href: string }[] };
  ar: { label: string; reply: string; links?: { label: string; href: string }[] };
};

export const guideTopics: GuideTopic[] = [
  {
    id: "find-part",
    keywords: ["find", "search", "looking for", "need a", "where can i", "part", "بحث", "ابحث", "أبحث", "اجد", "أجد", "محتاج"],
    en: {
      label: "Find a part",
      reply: "Three ways, depending on what you have. If you know roughly what you need technically, the AI assistant turns a requirement into filtered results. If you have a part number, use search — it also matches competitor part numbers. If you'd rather browse by specification, go to a category and use the filter sidebar.",
      links: [
        { label: "AI technical assistant", href: "/assistant" },
        { label: "Search by part number", href: "/search" },
        { label: "Browse categories", href: "/" },
      ],
    },
    ar: {
      label: "ابحث عن قطعة",
      reply: "ثلاث طرق حسب ما لديك. إذا كنت تعرف احتياجك فنيًا، فالمساعد الذكي يحوّل المتطلب إلى نتائج مفلترة. وإذا كان لديك كود القطعة، استخدم البحث — وهو يطابق أكواد المنافسين أيضًا. وإذا فضّلت التصفح بالمواصفات، ادخل الفئة واستخدم الفلاتر الجانبية.",
      links: [
        { label: "المساعد الفني الذكي", href: "/assistant" },
        { label: "ابحث بكود القطعة", href: "/search" },
        { label: "تصفح الفئات", href: "/" },
      ],
    },
  },
  {
    id: "cross-reference",
    keywords: ["cross", "equivalent", "alternative", "competitor", "replace", "obsolete", "بديل", "مكافئ", "منافس", "متوقف"],
    en: {
      label: "Find an equivalent part",
      reply: "Paste the competitor or obsolete part number into search. If we don't stock that exact number, the cross-reference engine looks for equivalents and tells you what it found. If nothing matches, send it to us — sourcing obsolete parts is something we do.",
      links: [
        { label: "Search", href: "/search" },
        { label: "Ask us to source it", href: "/systems#enquire" },
      ],
    },
    ar: {
      label: "ابحث عن بديل مكافئ",
      reply: "الصق كود المنافس أو القطعة المتوقفة في البحث. فإن لم يكن الكود لدينا، يبحث محرك المطابقة عن البدائل ويخبرك بما وجده. وإن لم يوجد شيء، أرسله لنا — توريد القطع المتوقفة من عملنا.",
      links: [
        { label: "البحث", href: "/search" },
        { label: "اطلب منا توريدها", href: "/systems#enquire" },
      ],
    },
  },
  {
    id: "bom",
    keywords: ["bom", "bill of materials", "upload", "csv", "excel", "list of parts", "import", "قائمة مواد", "رفع", "استيراد"],
    en: {
      label: "Upload a BOM",
      reply: "Create a project, then paste your list or upload a CSV. Any column layout works — you pick which column holds the part number and which holds the quantity, and a preview shows exactly what will import before you commit. Once loaded you can price it, add it all to the cart, or request a quote.",
      links: [
        { label: "Projects / BOMs", href: "/projects" },
        { label: "Quick order pad", href: "/quick-order" },
      ],
    },
    ar: {
      label: "ارفع قائمة مواد",
      reply: "أنشئ مشروعًا، ثم الصق قائمتك أو ارفع ملف CSV. أي ترتيب للأعمدة مقبول — تختار عمود كود القطعة وعمود الكمية، وتظهر معاينة لما سيُستورد قبل التنفيذ. وبعد التحميل يمكنك تسعيرها أو إضافتها للسلة أو طلب عرض سعر.",
      links: [
        { label: "المشاريع / قوائم المواد", href: "/projects" },
        { label: "الطلب السريع", href: "/quick-order" },
      ],
    },
  },
  {
    id: "quote",
    keywords: ["quote", "quotation", "price", "discount", "bulk", "volume", "عرض سعر", "تسعير", "خصم", "كمية", "جملة"],
    en: {
      label: "Request a quote",
      reply: "Add what you need to the cart, then choose 'Request a quote'. We price each line individually and come back with lead times. Volume pricing tiers show on product pages too — for larger quantities a quote usually beats them.",
      links: [
        { label: "Cart", href: "/cart" },
        { label: "My quotes", href: "/account/quotes" },
      ],
    },
    ar: {
      label: "اطلب عرض سعر",
      reply: "أضف ما تحتاجه إلى السلة، ثم اختر «اطلب عرض سعر». نسعّر كل سطر على حدة ونعود إليك بمدد التوريد. وأسعار الكميات تظهر أيضًا في صفحات المنتجات — وللكميات الكبيرة يكون عرض السعر أفضل عادة.",
      links: [
        { label: "السلة", href: "/cart" },
        { label: "عروض أسعاري", href: "/account/quotes" },
      ],
    },
  },
  {
    id: "order",
    keywords: ["order", "buy", "checkout", "purchase", "delivery", "shipping", "طلب", "شراء", "شحن", "توصيل", "دفع"],
    en: {
      label: "Place an order",
      reply: "You can check out as a guest — no account needed. Shipping is flat rate and free over $1,000, with 14% VAT added. Payment is currently by invoice: we contact you within one business day with bank transfer, card link or Fawry options.",
      links: [
        { label: "Cart", href: "/cart" },
        { label: "My orders", href: "/account/orders" },
      ],
    },
    ar: {
      label: "إتمام طلب",
      reply: "يمكنك الطلب كضيف دون حساب. الشحن بسعر ثابت ومجاني للطلبات فوق ١٠٠٠ دولار، مع إضافة ١٤٪ ضريبة. والدفع حاليًا بالفاتورة: نتواصل معك خلال يوم عمل بخيارات التحويل البنكي أو رابط البطاقة أو فوري.",
      links: [
        { label: "السلة", href: "/cart" },
        { label: "طلباتي", href: "/account/orders" },
      ],
    },
  },
  {
    id: "systems",
    keywords: ["system", "scada", "retrofit", "integration", "project", "install", "panel", "نظام", "أنظمة", "تكامل", "مشروع", "تركيب"],
    en: {
      label: "System solutions",
      reply: "We cover eight areas: SCADA and telemetry, PLC retrofit, motor control and VFD panels, energy monitoring, water and wastewater, machine safety, industrial networking, and process instrumentation. Each page explains what the system does, what it requires, and how a project runs.",
      links: [{ label: "System solutions", href: "/systems" }],
    },
    ar: {
      label: "حلول الأنظمة",
      reply: "نغطي ثمانية مجالات: SCADA والقياس عن بُعد، وتحديث الـPLC، ولوحات التحكّم والمغيّرات، ومراقبة الطاقة، والمياه والصرف، وأمان الماكينات، والشبكات الصناعية، وأجهزة قياس العمليات. وكل صفحة تشرح النظام ومتطلباته وكيف يسير المشروع.",
      links: [{ label: "حلول الأنظمة", href: "/systems" }],
    },
  },
  {
    id: "account",
    keywords: ["account", "login", "sign in", "register", "password", "حساب", "دخول", "تسجيل"],
    en: {
      label: "Account",
      reply: "An account lets you keep order history, save BOM projects, store searches and track quotes. You don't need one to browse, see prices or check out.",
      links: [
        { label: "Sign in", href: "/login" },
        { label: "Create account", href: "/register" },
      ],
    },
    ar: {
      label: "الحساب",
      reply: "الحساب يحفظ سجل طلباتك ومشاريع قوائم المواد وعمليات البحث وعروض الأسعار. ولا تحتاجه للتصفح أو رؤية الأسعار أو إتمام الطلب.",
      links: [
        { label: "تسجيل الدخول", href: "/login" },
        { label: "إنشاء حساب", href: "/register" },
      ],
    },
  },
  {
    id: "brands",
    keywords: ["brand", "manufacturer", "siemens", "abb", "schneider", "omron", "delta", "ماركة", "علامة", "مصنع"],
    en: {
      label: "Brands we stock",
      reply: "Over 50 manufacturers, with Siemens, ABB, Schneider Electric, Allen-Bradley, Delta, Omron, Mitsubishi and Danfoss making up most of what moves in this region. Every brand page lists its products.",
      links: [{ label: "All brands", href: "/brands" }],
    },
    ar: {
      label: "الماركات المتوفرة",
      reply: "أكثر من ٥٠ شركة مصنّعة، وتمثّل سيمنس وABB وشنايدر وألن-برادلي ودلتا وأومرون وميتسوبيشي ودانفوس معظم الحركة في المنطقة. وكل صفحة ماركة تعرض منتجاتها.",
      links: [{ label: "كل الماركات", href: "/brands" }],
    },
  },
  {
    id: "contact",
    keywords: ["contact", "talk", "call", "phone", "whatsapp", "email", "human", "support", "تواصل", "اتصال", "هاتف", "واتساب", "بريد", "دعم"],
    en: {
      label: "Talk to a person",
      reply: "Use the contact buttons on the right of the screen for phone, WhatsApp or email. For a project enquiry the form on any system page reaches our engineering team directly.",
      links: [{ label: "Send an enquiry", href: "/systems#enquire" }],
    },
    ar: {
      label: "تحدّث مع شخص",
      reply: "استخدم أزرار التواصل على يمين الشاشة للهاتف أو واتساب أو البريد. ولطلبات المشاريع، النموذج في أي صفحة نظام يصل فريقنا الهندسي مباشرة.",
      links: [{ label: "أرسل طلبًا", href: "/systems#enquire" }],
    },
  },
];

export const guideFallback = {
  en: {
    reply: "I can point you to the right part of the site. For a technical requirement — a rating, a voltage, an IP class — the AI assistant searches the catalogue properly.",
    links: [
      { label: "AI technical assistant", href: "/assistant" },
      { label: "Search", href: "/search" },
      { label: "Talk to us", href: "/systems#enquire" },
    ],
  },
  ar: {
    reply: "يمكنني إرشادك إلى القسم المناسب في الموقع. وللمتطلبات الفنية — قدرة أو جهد أو درجة حماية — يبحث المساعد الذكي في الكتالوج بشكل دقيق.",
    links: [
      { label: "المساعد الفني الذكي", href: "/assistant" },
      { label: "البحث", href: "/search" },
      { label: "تواصل معنا", href: "/systems#enquire" },
    ],
  },
};
