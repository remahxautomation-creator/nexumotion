// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM SOLUTIONS
//
// The eight integration systems most in demand across the Egypt → MENA → Africa
// corridor, per Mordor Intelligence MEA automation reporting, Schneider's 2026
// modernization-as-a-service push, and the service mix published by Egyptian
// integrators (SysTech, SCOVA, ATECH, EMtech).
//
// Content is bilingual inline rather than in the dictionary because it is
// long-form copy that changes as a block. `categorySlugs` wires each system to
// real catalogue categories so the pages sell parts, not just words.
// ─────────────────────────────────────────────────────────────────────────────

export type DiagramLayer = { label: string; nodes: string[] };

export type SystemCopy = {
  name: string;
  tagline: string;
  summary: string;
  explanation: string[];
  requirements: { title: string; items: string[] }[];
  howTo: { title: string; body: string }[];
  outcomes: string[];
};

export type SystemSolution = {
  slug: string;
  icon: string;
  accent: string;
  categorySlugs: string[];
  brands: string[];
  diagram: DiagramLayer[];
  en: SystemCopy;
  ar: SystemCopy;
};

export const systems: SystemSolution[] = [
  // ── 1. SCADA & Telemetry ─────────────────────────────────────────────────
  {
    slug: "scada-telemetry",
    icon: "Server",
    accent: "#0052CC",
    categorySlugs: ["dcs-scada", "plc-controllers", "industrial-networking", "hmi-visualization"],
    brands: ["Siemens", "Schneider Electric", "ABB", "Advantech"],
    diagram: [
      { label: "Supervision", nodes: ["SCADA server", "Operator client", "Historian"] },
      { label: "Network", nodes: ["Managed switch", "Fibre ring", "Cellular / radio"] },
      { label: "Control", nodes: ["RTU / PLC", "Remote site PLC", "Gateway"] },
      { label: "Field", nodes: ["Flow meter", "Level probe", "Pump starter", "Valve"] },
    ],
    en: {
      name: "SCADA & Telemetry",
      tagline: "See and control every remote site from one screen",
      summary:
        "Supervisory control for distributed assets — pump stations, reservoirs, substations and pipelines — with alarms, trends and historical data in one place.",
      explanation: [
        "A SCADA system sits above your PLCs and RTUs, collecting process data from every site and presenting it as live mimics, alarms and trends. Operators see the whole network on one screen instead of driving between stations.",
        "For utilities in Egypt and across Africa, the value is usually in the telemetry layer: sites are far apart, cellular or radio links are the only practical connection, and store-and-forward at the RTU keeps data intact when the link drops.",
        "Modern platforms expose data over OPC UA and MQTT, so the same tags feeding your control room can feed a maintenance dashboard or an energy report without a second data-collection layer.",
      ],
      requirements: [
        {
          title: "Field & control layer",
          items: [
            "PLC or RTU at each remote site with enough spare I/O for future points",
            "Instruments with 4-20 mA or HART output — flow, level, pressure, quality",
            "Local UPS sized for the controller and the communications radio",
          ],
        },
        {
          title: "Communications",
          items: [
            "Cellular router, licensed radio or fibre depending on site distance",
            "Static addressing or APN from the carrier for reliable reconnection",
            "Store-and-forward buffering at the RTU for link outages",
          ],
        },
        {
          title: "Supervision",
          items: [
            "Server or industrial PC sized for tag count and history retention",
            "Redundant server pair if the process cannot tolerate downtime",
            "Defined tag list, alarm priorities and operator access levels",
          ],
        },
      ],
      howTo: [
        { title: "Survey and tag list", body: "Walk every site, record existing instruments and panel space, and agree the point list. This is the document everything else is priced from." },
        { title: "Comms trial", body: "Prove the link from the most difficult site before ordering hardware. Signal strength on paper and signal strength on the roof differ." },
        { title: "Controller and instrument selection", body: "Choose the RTU/PLC platform and instruments, keeping one family across sites so spares and programming stay common." },
        { title: "Panel build and staging", body: "Build the site panels and stage them connected to the SCADA server in the workshop. Find the problems where you have a bench, not on site." },
        { title: "Site installation and commissioning", body: "Install, verify each point end to end, and confirm alarms annunciate correctly at the control room." },
        { title: "Operator handover", body: "Train on the mimics, alarm response and reporting, then run a supported period before signing off." },
      ],
      outcomes: [
        "Whole network visible from one control room",
        "Alarms reach operators in seconds, not on the next site visit",
        "Historical trends for regulatory reporting and leak detection",
      ],
    },
    ar: {
      name: "أنظمة SCADA والقياس عن بُعد",
      tagline: "راقب وتحكّم في كل موقع بعيد من شاشة واحدة",
      summary:
        "تحكّم إشرافي للأصول الموزّعة — محطات الضخ والخزانات والمحطات الفرعية وخطوط الأنابيب — مع الإنذارات والرسوم البيانية والبيانات التاريخية في مكان واحد.",
      explanation: [
        "يعمل نظام SCADA فوق وحدات PLC وRTU، فيجمع بيانات العملية من كل موقع ويعرضها كشاشات حيّة وإنذارات ورسوم بيانية. يرى المشغّل الشبكة كاملة على شاشة واحدة بدلًا من التنقّل بين المحطات.",
        "بالنسبة لمرافق المياه في مصر وأفريقيا، القيمة الأكبر في طبقة القياس عن بُعد: المواقع متباعدة، والاتصال الخلوي أو اللاسلكي هو الخيار العملي الوحيد، والتخزين المؤقت في وحدة RTU يحافظ على البيانات عند انقطاع الاتصال.",
        "المنصات الحديثة تتيح البيانات عبر OPC UA وMQTT، فتغذّي نفس الإشارات غرفة التحكم ولوحة الصيانة وتقارير الطاقة دون طبقة تجميع بيانات ثانية.",
      ],
      requirements: [
        {
          title: "طبقة الميدان والتحكم",
          items: [
            "وحدة PLC أو RTU في كل موقع مع مداخل ومخارج احتياطية للتوسعة",
            "أجهزة قياس بخرج ٤-٢٠ مللي أمبير أو HART — تدفق ومستوى وضغط وجودة",
            "مصدر طاقة احتياطي UPS يكفي المتحكّم وجهاز الاتصال",
          ],
        },
        {
          title: "الاتصالات",
          items: [
            "راوتر خلوي أو راديو مرخّص أو ألياف بحسب بُعد الموقع",
            "عنوان ثابت أو APN من مشغّل الشبكة لضمان إعادة الاتصال",
            "تخزين مؤقت في وحدة RTU لفترات انقطاع الاتصال",
          ],
        },
        {
          title: "الإشراف",
          items: [
            "خادم أو حاسب صناعي مناسب لعدد الإشارات ومدة حفظ البيانات",
            "خادمان متكرران إذا كانت العملية لا تحتمل التوقف",
            "قائمة إشارات محددة وأولويات إنذار ومستويات صلاحية للمشغّلين",
          ],
        },
      ],
      howTo: [
        { title: "المسح وقائمة الإشارات", body: "زر كل موقع، وسجّل الأجهزة القائمة والمساحة داخل اللوحات، واتفق على قائمة النقاط. هذه الوثيقة يُبنى عليها التسعير كله." },
        { title: "تجربة الاتصال", body: "أثبت جودة الاتصال من أصعب موقع قبل شراء الأجهزة. قوة الإشارة على الورق تختلف عنها على السطح." },
        { title: "اختيار المتحكّمات والأجهزة", body: "اختر منصة RTU/PLC والأجهزة، مع توحيد العائلة بين المواقع لتبقى قطع الغيار والبرمجة مشتركة." },
        { title: "تصنيع اللوحات والاختبار", body: "صنّع لوحات المواقع واختبرها موصولة بخادم SCADA في الورشة. اكتشف المشاكل حيث تتوفر لك منضدة عمل، لا في الموقع." },
        { title: "التركيب والتشغيل", body: "ركّب، وتحقق من كل نقطة من الطرف للطرف، وتأكد من ظهور الإنذارات في غرفة التحكم." },
        { title: "تسليم المشغّلين", body: "درّب على الشاشات والاستجابة للإنذارات والتقارير، ثم شغّل فترة مدعومة قبل التسليم النهائي." },
      ],
      outcomes: [
        "الشبكة كاملة مرئية من غرفة تحكم واحدة",
        "الإنذارات تصل للمشغّلين خلال ثوانٍ لا في الزيارة التالية",
        "رسوم بيانية تاريخية للتقارير الرقابية وكشف التسريبات",
      ],
    },
  },

  // ── 2. PLC Retrofit & Migration ──────────────────────────────────────────
  {
    slug: "plc-retrofit-migration",
    icon: "Replace",
    accent: "#FF6B00",
    categorySlugs: ["plc-controllers", "i-o-modules", "hmi-visualization", "cables-connectors"],
    brands: ["Siemens", "Allen-Bradley", "Schneider Electric", "Mitsubishi Electric"],
    diagram: [
      { label: "New control", nodes: ["S7-1500 / ControlLogix", "New HMI", "Ethernet"] },
      { label: "Interface", nodes: ["Adapter terminals", "Marshalling", "Signal check"] },
      { label: "Preserved", nodes: ["Existing field wiring", "Existing instruments", "Existing motors"] },
    ],
    en: {
      name: "PLC Retrofit & Migration",
      tagline: "Replace obsolete control without rewiring the plant",
      summary:
        "Migration from end-of-life platforms — S5, S7-300, legacy PLC-5 and SLC — to current controllers, preserving field wiring and cutting downtime to a planned shutdown.",
      explanation: [
        "Obsolete controllers fail on spare-part availability long before they fail electrically. Once a platform goes end-of-life, a single failed CPU can stop a line for weeks while you hunt the used market.",
        "A retrofit swaps the control layer while keeping what still works: field wiring, instruments and motors stay in place, and adapter terminal systems land the existing multicore onto the new I/O without re-pulling cable.",
        "Done properly the changeover happens inside one planned shutdown. The new program is written and simulated beforehand, the panel is pre-built, and the site work is disconnect, mount, reconnect, verify.",
      ],
      requirements: [
        {
          title: "Documentation",
          items: [
            "Current program backup — read the existing PLC before anything else",
            "Loop drawings or a terminal-by-terminal signal list",
            "Panel photos and free-space measurement for the new footprint",
          ],
        },
        {
          title: "Hardware",
          items: [
            "Target controller with I/O count matching the survey plus 20% spare",
            "Adapter or marshalling terminals matched to the existing multicore",
            "Replacement HMI, since legacy panels rarely talk to new controllers",
          ],
        },
        {
          title: "Planning",
          items: [
            "Agreed shutdown window with a realistic rollback point",
            "Simulated and tested program before the shutdown begins",
            "Old hardware retained until the new system has run a full cycle",
          ],
        },
      ],
      howTo: [
        { title: "Recover the existing program", body: "Upload and archive the running program first. On end-of-life platforms this may need a specific cable and software version — do it before the CPU fails, not after." },
        { title: "Signal survey", body: "Record every I/O point, its terminal and its function. Undocumented changes made over twenty years live here." },
        { title: "Program conversion and simulation", body: "Convert or rewrite the logic, then simulate it against the point list. Conversion tools get you most of the way; the last part is judgement." },
        { title: "Pre-build the panel", body: "Assemble and wire the new panel offsite. Every hour spent here is an hour saved during the shutdown." },
        { title: "Changeover", body: "Disconnect, mount, land the multicore on the adapters, and power up section by section." },
        { title: "Point-to-point verification", body: "Force every output and confirm every input at the device before running the process." },
      ],
      outcomes: [
        "Spare parts available again, off the shelf",
        "Ethernet connectivity and modern diagnostics",
        "Field wiring untouched, so cost and downtime stay contained",
      ],
    },
    ar: {
      name: "تحديث واستبدال أنظمة PLC",
      tagline: "استبدل التحكّم المتقادم دون إعادة تأسيس المصنع",
      summary:
        "الانتقال من المنصات المتوقفة — S5 وS7-300 وPLC-5 وSLC القديمة — إلى متحكّمات حديثة مع الحفاظ على التأسيس القائم وتقليل التوقف إلى فترة صيانة مخطّطة.",
      explanation: [
        "المتحكّمات المتقادمة تتعطّل بسبب ندرة قطع الغيار قبل أن تتعطّل كهربائيًا بوقت طويل. وبمجرد توقّف دعم المنصة، قد يوقف عطل وحدة معالجة واحدة خط إنتاج لأسابيع بحثًا في السوق المستعمل.",
        "التحديث يستبدل طبقة التحكّم مع الإبقاء على ما يعمل: التأسيس والأجهزة والمحركات تبقى مكانها، وتنقل أطراف التوصيل المهايئة الكابل القائم إلى المداخل الجديدة دون سحب كابلات جديدة.",
        "إذا نُفّذ بشكل صحيح يتم التحويل خلال فترة توقّف مخططة واحدة. يُكتب البرنامج ويُحاكى مسبقًا، وتُجهّز اللوحة سلفًا، ويقتصر العمل بالموقع على الفصل والتركيب وإعادة التوصيل والتحقق.",
      ],
      requirements: [
        {
          title: "التوثيق",
          items: [
            "نسخة احتياطية من البرنامج الحالي — اقرأ الـPLC القائم قبل أي خطوة",
            "رسومات الدوائر أو قائمة إشارات طرفًا بطرف",
            "صور اللوحة وقياس المساحة المتاحة للتجهيز الجديد",
          ],
        },
        {
          title: "المكوّنات",
          items: [
            "المتحكّم المستهدف بعدد مداخل ومخارج يطابق المسح زائد ٢٠٪ احتياطي",
            "أطراف مهايئة أو أطراف توزيع تطابق الكابل القائم",
            "شاشة HMI بديلة، فالشاشات القديمة نادرًا ما تتواصل مع المتحكّمات الجديدة",
          ],
        },
        {
          title: "التخطيط",
          items: [
            "فترة توقّف متفق عليها مع نقطة تراجع واقعية",
            "برنامج مُحاكى ومختبر قبل بدء التوقّف",
            "الاحتفاظ بالأجهزة القديمة حتى يعمل النظام الجديد دورة كاملة",
          ],
        },
      ],
      howTo: [
        { title: "استخراج البرنامج القائم", body: "ارفع البرنامج العامل واحفظه أولًا. قد يتطلب ذلك كابلًا ونسخة برنامج محددة — نفّذه قبل عطل وحدة المعالجة لا بعده." },
        { title: "مسح الإشارات", body: "سجّل كل نقطة إدخال وإخراج وطرفها ووظيفتها. هنا تظهر التعديلات غير الموثّقة عبر عشرين عامًا." },
        { title: "تحويل البرنامج ومحاكاته", body: "حوّل المنطق أو أعد كتابته، ثم حاكِه مقابل قائمة النقاط. أدوات التحويل تنجز معظم الطريق، والباقي خبرة." },
        { title: "تجهيز اللوحة مسبقًا", body: "جمّع اللوحة الجديدة ووصّلها خارج الموقع. كل ساعة هنا توفّر ساعة أثناء التوقّف." },
        { title: "التحويل", body: "افصل، وركّب، وأنزل الكابل على الأطراف المهايئة، وشغّل قسمًا بعد قسم." },
        { title: "التحقق نقطة بنقطة", body: "أجبر كل مخرج وتأكد من كل مدخل عند الجهاز نفسه قبل تشغيل العملية." },
      ],
      outcomes: [
        "قطع الغيار متاحة مجددًا وفورًا",
        "اتصال إيثرنت وتشخيص حديث",
        "التأسيس القائم دون تغيير، فتبقى التكلفة ومدة التوقف محدودة",
      ],
    },
  },

  // ── 3. Motor Control & VFD Panels ────────────────────────────────────────
  {
    slug: "motor-control-vfd-panels",
    icon: "Gauge",
    accent: "#36B37E",
    categorySlugs: ["drives-vfds", "motor-control", "power-supplies", "operator-devices"],
    brands: ["ABB", "Danfoss", "Schneider Electric", "Siemens", "INVT"],
    diagram: [
      { label: "Incomer", nodes: ["Main breaker", "Metering", "Surge protection"] },
      { label: "Drive section", nodes: ["VFD", "Line reactor", "EMI filter", "Brake resistor"] },
      { label: "Starters", nodes: ["Contactor", "Overload relay", "Soft starter"] },
      { label: "Load", nodes: ["Pump", "Fan", "Conveyor"] },
    ],
    en: {
      name: "Motor Control & VFD Panels",
      tagline: "Cut motor energy by a third on pumps and fans",
      summary:
        "Motor control centres and variable-speed drive panels built for the load — sized, filtered and cooled correctly, with the harmonics and cable-length issues handled before they become failures.",
      explanation: [
        "Replacing throttled or damper-controlled flow with variable speed typically cuts motor energy consumption substantially on pump and fan loads, because power falls roughly with the cube of speed. That is where the payback sits.",
        "Most drive failures in this region trace to three things: heat inside an undersized enclosure, harmonics on a weak supply, and long motor cables producing voltage reflection at the terminals. All three are design decisions, not component quality.",
        "A properly engineered panel accounts for ambient temperature at the real installation site, adds line reactors or filters where the supply demands them, and specifies output filtering when cable runs are long.",
      ],
      requirements: [
        {
          title: "Load data",
          items: [
            "Motor nameplate — kW, voltage, full-load current, service factor",
            "Load type: variable torque (pump, fan) or constant torque (conveyor, mixer)",
            "Duty cycle and starts per hour, which drive braking requirements",
          ],
        },
        {
          title: "Installation environment",
          items: [
            "Ambient temperature at the panel location, not the design assumption",
            "IP rating demanded by dust and washdown — and matching cooling",
            "Motor cable length, which determines output filtering",
          ],
        },
        {
          title: "Supply and control",
          items: [
            "Supply voltage, frequency and available fault level",
            "Harmonic limits if the utility or site imposes them",
            "Control interface — hardwired, Modbus, Profinet or EtherNet/IP",
          ],
        },
      ],
      howTo: [
        { title: "Confirm the load profile", body: "Measure actual running current rather than trusting the nameplate. Oversized motors running lightly are common and change the drive selection." },
        { title: "Size drive and protection", body: "Select on current, not just kW, and derate for ambient temperature and altitude where relevant." },
        { title: "Address harmonics and cable length", body: "Add line reactors or filters based on supply strength, and output filtering for long motor runs." },
        { title: "Design the thermal envelope", body: "Calculate heat load and specify ventilation or cooling. This is the single most common omission." },
        { title: "Build, wire and test", body: "Assemble to the schematic, then test on a motor before shipping — including protection trips." },
        { title: "Commission and tune", body: "Run auto-tune, set ramps and limits against the real load, and record the parameter set." },
      ],
      outcomes: [
        "Substantial reduction in pump and fan energy consumption",
        "Soft starting that removes mechanical shock and current spikes",
        "Motor protection and diagnostics built into the drive",
      ],
    },
    ar: {
      name: "لوحات التحكّم في المحركات والمغيّرات",
      tagline: "خفّض طاقة المحركات في المضخات والمراوح",
      summary:
        "مراكز تحكّم بالمحركات ولوحات مغيّرات سرعة مصمّمة للحمل — مقاسة ومرشّحة ومبرّدة بشكل صحيح، مع معالجة التوافقيات وأطوال الكابلات قبل أن تتحول إلى أعطال.",
      explanation: [
        "استبدال التحكّم بالخانق أو الدامبر بالتحكّم بالسرعة يخفّض استهلاك طاقة المحرك بنسبة كبيرة في أحمال المضخات والمراوح، لأن القدرة تتناسب تقريبًا مع مكعّب السرعة. وهنا يكمن العائد.",
        "معظم أعطال المغيّرات في المنطقة تعود لثلاثة أسباب: الحرارة داخل لوحة صغيرة الحجم، والتوافقيات على شبكة ضعيفة، وكابلات محرك طويلة تسبب انعكاس الجهد عند الأطراف. وكلها قرارات تصميم لا جودة مكوّنات.",
        "اللوحة المصمّمة جيدًا تراعي درجة الحرارة الفعلية في موقع التركيب، وتضيف مفاعلات أو مرشّحات حسب حاجة الشبكة، وتحدد ترشيح الخرج عند طول مسارات الكابلات.",
      ],
      requirements: [
        {
          title: "بيانات الحمل",
          items: [
            "لوحة بيانات المحرك — القدرة والجهد وتيار الحمل الكامل ومعامل الخدمة",
            "نوع الحمل: عزم متغيّر (مضخة، مروحة) أو عزم ثابت (سير، خلّاط)",
            "دورة التشغيل وعدد مرات البدء في الساعة، وهي تحدد متطلبات الكبح",
          ],
        },
        {
          title: "بيئة التركيب",
          items: [
            "درجة الحرارة المحيطة في موقع اللوحة الفعلي لا الافتراضي",
            "درجة الحماية المطلوبة حسب الغبار والغسيل — مع تبريد مناسب",
            "طول كابل المحرك، وهو يحدد ترشيح الخرج",
          ],
        },
        {
          title: "التغذية والتحكّم",
          items: [
            "جهد التغذية والتردد ومستوى تيار القصر المتاح",
            "حدود التوافقيات إذا فرضتها شركة الكهرباء أو الموقع",
            "واجهة التحكّم — أسلاك مباشرة أو Modbus أو Profinet أو EtherNet/IP",
          ],
        },
      ],
      howTo: [
        { title: "تأكيد منحنى الحمل", body: "قِس التيار الفعلي أثناء التشغيل بدل الاعتماد على لوحة البيانات. المحركات الأكبر من الحاجة شائعة وتغيّر اختيار المغيّر." },
        { title: "تحديد مقاس المغيّر والحماية", body: "اختر على أساس التيار لا القدرة فقط، وخفّض التصنيف حسب الحرارة والارتفاع عند اللزوم." },
        { title: "معالجة التوافقيات وطول الكابل", body: "أضف مفاعلات أو مرشّحات حسب قوة الشبكة، وترشيح خرج لمسارات المحرك الطويلة." },
        { title: "تصميم التبريد", body: "احسب الحمل الحراري وحدد التهوية أو التبريد. هذا أكثر بند يُغفل." },
        { title: "التصنيع والتوصيل والاختبار", body: "جمّع حسب المخطط، ثم اختبر على محرك قبل الشحن — بما في ذلك فصل الحمايات." },
        { title: "التشغيل والضبط", body: "شغّل الضبط التلقائي، واضبط منحنيات التسارع والحدود على الحمل الفعلي، وسجّل الإعدادات." },
      ],
      outcomes: [
        "خفض ملموس في استهلاك طاقة المضخات والمراوح",
        "بدء ناعم يزيل الصدمات الميكانيكية وقفزات التيار",
        "حماية وتشخيص للمحرك مدمجان في المغيّر",
      ],
    },
  },

  // ── 4. Energy Monitoring & Power Quality ─────────────────────────────────
  {
    slug: "energy-monitoring",
    icon: "Zap",
    accent: "#FFAB00",
    categorySlugs: ["process-instruments", "industrial-networking", "dcs-scada", "power-supplies"],
    brands: ["Schneider Electric", "Siemens", "Carlo Gavazzi", "Lovato"],
    diagram: [
      { label: "Reporting", nodes: ["Energy dashboard", "Cost per unit", "Alarms"] },
      { label: "Collection", nodes: ["Gateway", "Modbus TCP", "Data logger"] },
      { label: "Metering", nodes: ["Power meter", "CT / Rogowski", "Sub-meter"] },
      { label: "Utilities", nodes: ["Electricity", "Compressed air", "Gas", "Water"] },
    ],
    en: {
      name: "Energy Monitoring & Power Quality",
      tagline: "Find where the energy actually goes",
      summary:
        "Sub-metering and power-quality monitoring across electricity, compressed air, gas and water — turning a single utility bill into cost per line, per shift and per unit produced.",
      explanation: [
        "Most plants know their total energy bill and nothing else. Sub-metering at feeder and machine level turns that single number into something actionable: which line, which shift, which product costs what.",
        "Power quality monitoring catches the problems that damage equipment quietly — harmonic distortion from unfiltered drives, voltage sags that trip contactors, and poor power factor that attracts utility penalties.",
        "Compressed air deserves particular attention. It is usually the most expensive utility per unit of useful work, and leak rates of a quarter to a third of production are common in plants that have never measured it.",
      ],
      requirements: [
        {
          title: "Metering points",
          items: [
            "Main incomer meter for the site baseline",
            "Feeder-level meters per production line or department",
            "Machine-level meters on the largest consumers",
          ],
        },
        {
          title: "Instrumentation",
          items: [
            "Current transformers sized to actual load, or Rogowski coils for retrofit",
            "Flow meters for compressed air, gas and water",
            "Panel space and an isolation point for safe meter installation",
          ],
        },
        {
          title: "Data and reporting",
          items: [
            "Modbus TCP or RTU network back to a gateway or SCADA",
            "Logging interval matched to what you intend to act on",
            "Agreed production data to normalise energy per unit produced",
          ],
        },
      ],
      howTo: [
        { title: "Baseline the site", body: "Start with the main incomer and a month of data. You need the total before the breakdown means anything." },
        { title: "Prioritise by consumption", body: "Meter the biggest loads first. The largest three or four consumers usually account for most of the bill." },
        { title: "Install metering", body: "Fit meters and CTs at each point. Split-core CTs and Rogowski coils avoid breaking conductors on live installations." },
        { title: "Connect and validate", body: "Network the meters and check readings against a clamp meter before trusting the dashboard." },
        { title: "Normalise against production", body: "Divide energy by units produced. Absolute consumption misleads when output varies." },
        { title: "Act and re-measure", body: "Fix what the data exposes — air leaks, idle running, power factor — then verify the saving in the same dashboard." },
      ],
      outcomes: [
        "Energy cost attributed to line, shift and product",
        "Power-factor and harmonic problems identified before they cause damage",
        "Verified savings rather than estimated ones",
      ],
    },
    ar: {
      name: "مراقبة الطاقة وجودة الكهرباء",
      tagline: "اعرف أين تذهب الطاقة فعليًا",
      summary:
        "قياس فرعي ومراقبة لجودة الكهرباء عبر الكهرباء والهواء المضغوط والغاز والمياه — لتحويل فاتورة واحدة إلى تكلفة لكل خط ولكل وردية ولكل وحدة منتجة.",
      explanation: [
        "معظم المصانع تعرف إجمالي فاتورة الطاقة ولا تعرف غير ذلك. القياس الفرعي على مستوى المغذّيات والماكينات يحوّل هذا الرقم الواحد إلى معلومة قابلة للتنفيذ: أي خط وأي وردية وأي منتج يكلّف كم.",
        "مراقبة جودة الكهرباء تكشف المشاكل التي تتلف المعدات بصمت — التشوّه التوافقي من مغيّرات غير مرشّحة، وهبوط الجهد الذي يفصل الكونتاكتورات، ومعامل القدرة الضعيف الذي يجلب غرامات.",
        "الهواء المضغوط يستحق اهتمامًا خاصًا. فهو غالبًا أغلى المرافق لكل وحدة شغل مفيد، ونسب التسريب المرتفعة شائعة في المصانع التي لم تقس يومًا.",
      ],
      requirements: [
        {
          title: "نقاط القياس",
          items: [
            "عدّاد على المدخل الرئيسي لتحديد خط الأساس",
            "عدّادات على مستوى المغذّيات لكل خط إنتاج أو قسم",
            "عدّادات على مستوى الماكينة لأكبر المستهلكين",
          ],
        },
        {
          title: "أجهزة القياس",
          items: [
            "محوّلات تيار بمقاس الحمل الفعلي، أو ملفات Rogowski للتركيب على القائم",
            "عدّادات تدفق للهواء المضغوط والغاز والمياه",
            "مساحة داخل اللوحة ونقطة عزل للتركيب الآمن",
          ],
        },
        {
          title: "البيانات والتقارير",
          items: [
            "شبكة Modbus TCP أو RTU إلى بوابة أو نظام SCADA",
            "فترة تسجيل تناسب ما تنوي التصرف بناءً عليه",
            "بيانات إنتاج متفق عليها لحساب الطاقة لكل وحدة منتجة",
          ],
        },
      ],
      howTo: [
        { title: "حدد خط الأساس", body: "ابدأ بالمدخل الرئيسي وشهر من البيانات. تحتاج الإجمالي قبل أن يعني التفصيل شيئًا." },
        { title: "رتّب حسب الاستهلاك", body: "قِس أكبر الأحمال أولًا. أكبر ثلاثة أو أربعة مستهلكين يمثّلون عادة معظم الفاتورة." },
        { title: "ركّب أجهزة القياس", body: "ركّب العدّادات ومحوّلات التيار في كل نقطة. المحوّلات المشقوقة وملفات Rogowski تتجنّب قطع الموصّلات أثناء التشغيل." },
        { title: "التوصيل والتحقق", body: "اربط العدّادات بالشبكة وقارن القراءات بجهاز قياس يدوي قبل الوثوق باللوحة." },
        { title: "النسبة إلى الإنتاج", body: "اقسم الطاقة على الوحدات المنتجة. الاستهلاك المطلق يضلّل عند تغيّر الإنتاج." },
        { title: "نفّذ ثم أعد القياس", body: "عالج ما تكشفه البيانات — تسريبات الهواء والتشغيل بلا حمل ومعامل القدرة — ثم تحقق من التوفير على نفس اللوحة." },
      ],
      outcomes: [
        "تكلفة الطاقة موزّعة على الخط والوردية والمنتج",
        "كشف مشاكل معامل القدرة والتوافقيات قبل أن تسبب تلفًا",
        "توفير مُتحقَّق منه لا مُقدَّر",
      ],
    },
  },

  // ── 5. Water & Wastewater Automation ─────────────────────────────────────
  {
    slug: "water-wastewater",
    icon: "Droplets",
    accent: "#0EA5E9",
    categorySlugs: ["process-instruments", "plc-controllers", "drives-vfds", "dcs-scada"],
    brands: ["Endress+Hauser", "Danfoss", "Siemens", "ABB", "Schneider Electric"],
    diagram: [
      { label: "Control room", nodes: ["SCADA", "Reports", "Alarm dispatch"] },
      { label: "Station control", nodes: ["PLC", "VFD", "Chlorine dosing"] },
      { label: "Instrumentation", nodes: ["Flow", "Level", "Pressure", "pH / turbidity"] },
      { label: "Process", nodes: ["Intake", "Treatment", "Reservoir", "Distribution"] },
    ],
    en: {
      name: "Water & Wastewater Automation",
      tagline: "Pump stations, treatment and distribution under control",
      summary:
        "Automation for intake, treatment, pumping and distribution — level and flow control, dosing, pressure management and the telemetry that ties remote stations back to a control room.",
      explanation: [
        "Water networks are the clearest case for automation in this region: assets are distributed across long distances, energy is dominated by pumping, and water lost to leaks is water treated and paid for but never billed.",
        "The core control problems are consistent — maintain reservoir level without cycling pumps to destruction, hold distribution pressure within a band, dose chemicals proportionally to flow, and alarm on quality excursions.",
        "Variable-speed pumping is usually where the payback appears. Pressure-controlled pumping cuts energy and, by removing pressure spikes, reduces burst frequency across the network.",
      ],
      requirements: [
        {
          title: "Process instrumentation",
          items: [
            "Electromagnetic flow meters on the main lines",
            "Level measurement at every reservoir and wet well",
            "Pressure transmitters at critical network points",
            "Quality instruments — pH, turbidity, residual chlorine — where regulated",
          ],
        },
        {
          title: "Station control",
          items: [
            "PLC per station with duty/standby pump rotation logic",
            "Variable-speed drives on the main pump sets",
            "Dosing pumps interlocked to flow measurement",
            "Dry-run and overload protection on every pump",
          ],
        },
        {
          title: "Telemetry & compliance",
          items: [
            "Communication link from each remote station to the control room",
            "Data retention meeting the regulator's reporting requirement",
            "Alarm escalation path for out-of-hours events",
          ],
        },
      ],
      howTo: [
        { title: "Map the network", body: "Document every station, its pumps, its instruments and its power supply. Include the sites nobody visits — those are where the failures hide." },
        { title: "Instrument the process", body: "Install flow, level and pressure measurement first. Control without measurement is guesswork." },
        { title: "Automate station control", body: "Implement level and pressure control with pump rotation so duty is shared and wear is even." },
        { title: "Add variable speed", body: "Fit drives to the main pumps and control on pressure rather than throttling." },
        { title: "Connect telemetry", body: "Link stations to the control room, with store-and-forward for link outages." },
        { title: "Commission and hand over", body: "Verify each loop, prove alarm escalation, and train operators on both normal and failure modes." },
      ],
      outcomes: [
        "Reservoir levels and network pressure held automatically",
        "Pumping energy reduced through speed control",
        "Quality excursions alarmed and logged for the regulator",
      ],
    },
    ar: {
      name: "أتمتة محطات المياه والصرف",
      tagline: "محطات الضخ والمعالجة والتوزيع تحت السيطرة",
      summary:
        "أتمتة السحب والمعالجة والضخ والتوزيع — التحكّم في المستوى والتدفق، والجرعات، وإدارة الضغط، والقياس عن بُعد الذي يربط المحطات البعيدة بغرفة التحكّم.",
      explanation: [
        "شبكات المياه هي أوضح حالة للأتمتة في المنطقة: الأصول موزّعة على مسافات طويلة، والطاقة يهيمن عليها الضخ، والمياه المفقودة بالتسريب مياه عولجت ودُفع ثمنها ولم تُحصّل.",
        "مشكلات التحكّم الأساسية ثابتة — الحفاظ على مستوى الخزان دون إجهاد المضخات بالتشغيل المتكرر، وتثبيت ضغط التوزيع ضمن نطاق، وجرعات كيميائية متناسبة مع التدفق، وإنذارات عند انحراف الجودة.",
        "الضخ بسرعة متغيّرة هو غالبًا موضع العائد. فالضخ المتحكّم بالضغط يخفّض الطاقة، وبإزالة قفزات الضغط يقلّل تكرار الانفجارات في الشبكة.",
      ],
      requirements: [
        {
          title: "أجهزة قياس العملية",
          items: [
            "عدّادات تدفق كهرومغناطيسية على الخطوط الرئيسية",
            "قياس المستوى في كل خزان وبئر تجميع",
            "مرسلات ضغط عند النقاط الحرجة في الشبكة",
            "أجهزة جودة — الأس الهيدروجيني والعكارة والكلور المتبقي — حيثما تُشترط",
          ],
        },
        {
          title: "تحكّم المحطة",
          items: [
            "وحدة PLC لكل محطة مع منطق تبديل بين المضخات العاملة والاحتياطية",
            "مغيّرات سرعة على مجموعات الضخ الرئيسية",
            "مضخات جرعات مرتبطة بقياس التدفق",
            "حماية من التشغيل الجاف والحمل الزائد لكل مضخة",
          ],
        },
        {
          title: "القياس عن بُعد والامتثال",
          items: [
            "وصلة اتصال من كل محطة بعيدة إلى غرفة التحكّم",
            "حفظ بيانات يفي بمتطلبات التقارير الرقابية",
            "مسار تصعيد للإنذارات خارج ساعات العمل",
          ],
        },
      ],
      howTo: [
        { title: "ارسم الشبكة", body: "وثّق كل محطة ومضخاتها وأجهزتها ومصدر طاقتها. وأدرج المواقع التي لا يزورها أحد — فهي حيث تختبئ الأعطال." },
        { title: "جهّز أجهزة القياس", body: "ركّب قياس التدفق والمستوى والضغط أولًا. التحكّم بلا قياس تخمين." },
        { title: "أتمِت تحكّم المحطة", body: "نفّذ التحكّم بالمستوى والضغط مع تبديل المضخات لتوزيع التشغيل وتساوي التآكل." },
        { title: "أضف السرعة المتغيّرة", body: "ركّب مغيّرات على المضخات الرئيسية وتحكّم بالضغط بدل الخنق." },
        { title: "اربط القياس عن بُعد", body: "اربط المحطات بغرفة التحكّم مع تخزين مؤقت لفترات انقطاع الاتصال." },
        { title: "التشغيل والتسليم", body: "تحقق من كل دائرة، وأثبت تصعيد الإنذارات، ودرّب المشغّلين على الوضع الطبيعي وأوضاع الأعطال." },
      ],
      outcomes: [
        "مستويات الخزانات وضغط الشبكة يُضبطان تلقائيًا",
        "خفض طاقة الضخ عبر التحكّم بالسرعة",
        "انحرافات الجودة مُنذَرة ومسجّلة للجهة الرقابية",
      ],
    },
  },

  // ── 6. Machine Safety ────────────────────────────────────────────────────
  {
    slug: "machine-safety",
    icon: "ShieldCheck",
    accent: "#DE350B",
    categorySlugs: ["safety", "operator-devices", "relays-timers", "sensors-switches"],
    brands: ["Pilz", "SICK", "Siemens", "Schneider Electric", "ABB"],
    diagram: [
      { label: "Assessment", nodes: ["Risk assessment", "Required PL / SIL"] },
      { label: "Detection", nodes: ["Light curtain", "Interlock switch", "E-stop", "Scanner"] },
      { label: "Evaluation", nodes: ["Safety relay", "Safety PLC"] },
      { label: "Actuation", nodes: ["Safety contactor", "Safe torque off", "Brake"] },
    ],
    en: {
      name: "Machine Safety Systems",
      tagline: "Guarding that stops the machine, not production",
      summary:
        "Risk assessment, safety circuit design and installation to the required performance level — light curtains, interlocks, e-stops and safety relays engineered as a system rather than bolted on.",
      explanation: [
        "Machine safety is a chain: detect the hazardous access, evaluate it in a device rated for the job, and remove power or motion in a way that cannot fail silently. A rated component wired into an unrated circuit gives you neither compliance nor protection.",
        "The required performance level is an output of risk assessment, not a purchasing preference. Severity of injury, frequency of exposure and possibility of avoidance determine what the circuit must achieve.",
        "Badly designed safety gets defeated. If a guard adds thirty seconds to a routine task, operators will bypass it. Good design makes the safe way the fast way — which is why muting, safe-speed and safe-torque-off functions matter.",
      ],
      requirements: [
        {
          title: "Assessment first",
          items: [
            "Documented risk assessment per machine and per hazard",
            "Required performance level (PL) or safety integrity level (SIL) per function",
            "Access frequency and task analysis for each guarded point",
          ],
        },
        {
          title: "Safety components",
          items: [
            "Detection devices rated for the determined level",
            "Safety relay or safety PLC sized to the number of functions",
            "Safety contactors with mirror contacts, or drives with safe torque off",
          ],
        },
        {
          title: "Validation",
          items: [
            "Circuit calculation proving the achieved level",
            "Documented functional test of every safety function",
            "Records retained for inspection and insurance",
          ],
        },
      ],
      howTo: [
        { title: "Assess the risk", body: "Identify each hazard and determine the required performance level. Everything downstream follows from this document." },
        { title: "Design the safety function", body: "Choose detection, evaluation and actuation as a set, verifying the combination achieves the required level." },
        { title: "Plan for the operator", body: "Analyse how people actually work at the machine. A guard that obstructs a routine task will be defeated within a week." },
        { title: "Install and wire", body: "Wire to the safety schematic with the specified diagnostics — dual channel and feedback loops where the level demands." },
        { title: "Validate every function", body: "Test each safety function individually, including fault conditions, and record the results." },
        { title: "Document and train", body: "Hand over the file and train operators and maintenance on what each function does and why bypassing it is dangerous." },
      ],
      outcomes: [
        "Compliant, documented safety functions",
        "Guarding that operators do not defeat",
        "Reduced insurance and liability exposure",
      ],
    },
    ar: {
      name: "أنظمة أمان الماكينات",
      tagline: "حماية توقف الماكينة لا الإنتاج",
      summary:
        "تقييم المخاطر وتصميم دوائر الأمان والتركيب حتى مستوى الأداء المطلوب — ستائر ضوئية ومفاتيح تعشيق وأزرار توقف طارئ ومرحّلات أمان مصمّمة كنظام متكامل لا كإضافة.",
      explanation: [
        "أمان الماكينات سلسلة: اكتشف الوصول الخطر، وقيّمه في جهاز مصنّف لهذه المهمة، وافصل الطاقة أو الحركة بطريقة لا تفشل بصمت. المكوّن المصنّف الموصول في دائرة غير مصنّفة لا يمنحك امتثالًا ولا حماية.",
        "مستوى الأداء المطلوب ناتج عن تقييم المخاطر لا عن تفضيل شرائي. شدّة الإصابة وتكرار التعرّض وإمكانية التفادي هي ما يحدد ما يجب أن تحققه الدائرة.",
        "الأمان سيّئ التصميم يُلتفّ عليه. فإذا أضاف الحاجز ثلاثين ثانية لمهمة روتينية، سيتجاوزه المشغّلون. التصميم الجيد يجعل الطريق الآمن هو الأسرع — ولهذا تهم وظائف الكتم والسرعة الآمنة وفصل العزم الآمن.",
      ],
      requirements: [
        {
          title: "التقييم أولًا",
          items: [
            "تقييم مخاطر موثّق لكل ماكينة ولكل خطر",
            "مستوى الأداء PL أو مستوى تكامل الأمان SIL المطلوب لكل وظيفة",
            "تحليل تكرار الوصول والمهام لكل نقطة محروسة",
          ],
        },
        {
          title: "مكوّنات الأمان",
          items: [
            "أجهزة كشف مصنّفة للمستوى المحدد",
            "مرحّل أمان أو PLC أمان بسعة تناسب عدد الوظائف",
            "كونتاكتورات أمان بملامسات مرآة، أو مغيّرات بوظيفة فصل العزم الآمن",
          ],
        },
        {
          title: "التحقق",
          items: [
            "حساب للدائرة يثبت المستوى المتحقق",
            "اختبار وظيفي موثّق لكل وظيفة أمان",
            "سجلات محفوظة للتفتيش والتأمين",
          ],
        },
      ],
      howTo: [
        { title: "قيّم المخاطر", body: "حدد كل خطر واستنتج مستوى الأداء المطلوب. كل ما يليه يُبنى على هذه الوثيقة." },
        { title: "صمّم وظيفة الأمان", body: "اختر الكشف والتقييم والتنفيذ كمجموعة واحدة، وتحقق أن التركيبة تحقق المستوى المطلوب." },
        { title: "خطّط للمشغّل", body: "حلّل كيف يعمل الناس فعليًا على الماكينة. الحاجز الذي يعطّل مهمة روتينية سيُتجاوز خلال أسبوع." },
        { title: "التركيب والتوصيل", body: "وصّل حسب مخطط الأمان مع التشخيص المحدد — قناة مزدوجة وحلقات تغذية راجعة حسب المستوى." },
        { title: "تحقق من كل وظيفة", body: "اختبر كل وظيفة أمان على حدة، بما في ذلك حالات العطل، وسجّل النتائج." },
        { title: "التوثيق والتدريب", body: "سلّم الملف ودرّب المشغّلين والصيانة على وظيفة كل عنصر ولماذا تجاوزه خطر." },
      ],
      outcomes: [
        "وظائف أمان مطابقة وموثّقة",
        "حماية لا يتجاوزها المشغّلون",
        "تقليل التعرّض التأميني والمسؤولية القانونية",
      ],
    },
  },

  // ── 7. Industrial Networking & IIoT ──────────────────────────────────────
  {
    slug: "industrial-networking-iiot",
    icon: "Network",
    accent: "#7C3AED",
    categorySlugs: ["industrial-networking", "plc-controllers", "cables-connectors", "dcs-scada"],
    brands: ["Siemens", "Phoenix Contact", "Advantech", "Beijer Electronics", "Turck"],
    diagram: [
      { label: "Enterprise", nodes: ["Dashboard", "ERP / MES", "Cloud"] },
      { label: "Edge", nodes: ["IIoT gateway", "MQTT broker", "OPC UA server"] },
      { label: "Cell network", nodes: ["Managed switch", "Fibre backbone", "Wireless AP"] },
      { label: "Devices", nodes: ["PLC", "Drive", "IO-Link master", "Sensors"] },
    ],
    en: {
      name: "Industrial Networking & IIoT",
      tagline: "Get plant data out without exposing the plant",
      summary:
        "Structured plant networks with managed switches, segmentation and edge gateways publishing over OPC UA and MQTT — so data reaches dashboards without opening control systems to the office network.",
      explanation: [
        "Most plant networks grow by accident: an unmanaged switch here, a daisy chain there, and no segmentation between control traffic and everything else. It works until it doesn't, and then the fault is very hard to find.",
        "A structured network separates control traffic from IT traffic, uses managed switches with diagnostics, and gives you a topology someone can actually troubleshoot. Ring redundancy means a single cable break doesn't stop the line.",
        "The IIoT layer sits at the edge: a gateway reads from controllers and publishes over MQTT or OPC UA, so dashboards and analytics consume data without anything reaching back into the control system. That direction of flow is the security model.",
      ],
      requirements: [
        {
          title: "Physical layer",
          items: [
            "Industrial managed switches, not office hardware, rated for the environment",
            "Fibre backbone between buildings or across electrically noisy runs",
            "Correct cable category and shielding, with proper earthing practice",
          ],
        },
        {
          title: "Network design",
          items: [
            "Documented IP addressing scheme and VLAN segmentation",
            "Ring or redundant topology for lines that cannot stop",
            "Firewall between control network and business network",
          ],
        },
        {
          title: "Data layer",
          items: [
            "Edge gateway with the drivers your controllers speak",
            "OPC UA or MQTT publishing, outbound only",
            "Defined tag list — publish what is useful, not everything",
          ],
        },
      ],
      howTo: [
        { title: "Audit what exists", body: "Map current devices, addresses and cabling. Unmanaged switches under panels are the usual discovery." },
        { title: "Design the topology", body: "Plan segmentation, addressing and redundancy before buying hardware." },
        { title: "Install the backbone", body: "Fit managed switches and fibre, label both ends of every cable, and record the patching." },
        { title: "Segment and secure", body: "Apply VLANs and a firewall so control traffic is isolated from the business network." },
        { title: "Add the edge gateway", body: "Deploy the gateway, connect to controllers read-only, and publish the agreed tag list outbound." },
        { title: "Verify and document", body: "Test redundancy by pulling a cable, confirm recovery, and hand over the as-built topology." },
      ],
      outcomes: [
        "A network you can troubleshoot from documentation",
        "Cable break survivable without stopping production",
        "Plant data available to dashboards without exposing controllers",
      ],
    },
    ar: {
      name: "الشبكات الصناعية وإنترنت الأشياء",
      tagline: "أخرج بيانات المصنع دون تعريض المصنع للخطر",
      summary:
        "شبكات مصانع منظّمة بمحوّلات مُدارة وتقسيم وبوابات حافة تنشر عبر OPC UA وMQTT — لتصل البيانات إلى اللوحات دون فتح أنظمة التحكّم على شبكة المكاتب.",
      explanation: [
        "معظم شبكات المصانع تنمو بالمصادفة: محوّل غير مُدار هنا، وتسلسل هناك، وبلا فصل بين حركة التحكّم وبقية الحركة. تعمل حتى تتوقف، وحينها يصعب جدًا تحديد العطل.",
        "الشبكة المنظّمة تفصل حركة التحكّم عن حركة تقنية المعلومات، وتستخدم محوّلات مُدارة بتشخيص، وتمنحك بنية يستطيع أحدهم تتبّع أعطالها فعليًا. والتوصيل الحلقي يعني أن قطع كابل واحد لا يوقف الخط.",
        "طبقة إنترنت الأشياء تقع عند الحافة: بوابة تقرأ من المتحكّمات وتنشر عبر MQTT أو OPC UA، فتستهلك اللوحات والتحليلات البيانات دون أن يصل شيء عائدًا إلى نظام التحكّم. واتجاه التدفق هذا هو النموذج الأمني.",
      ],
      requirements: [
        {
          title: "الطبقة المادية",
          items: [
            "محوّلات صناعية مُدارة لا أجهزة مكتبية، مصنّفة للبيئة",
            "عمود فقري من الألياف بين المباني أو عبر المسارات كثيفة التشويش",
            "فئة كابل وتدريع صحيحين مع ممارسة تأريض سليمة",
          ],
        },
        {
          title: "تصميم الشبكة",
          items: [
            "خطة عناوين IP موثّقة وتقسيم VLAN",
            "بنية حلقية أو متكررة للخطوط التي لا تحتمل التوقف",
            "جدار حماية بين شبكة التحكّم وشبكة الأعمال",
          ],
        },
        {
          title: "طبقة البيانات",
          items: [
            "بوابة حافة تدعم بروتوكولات متحكّماتك",
            "نشر عبر OPC UA أو MQTT، صادر فقط",
            "قائمة إشارات محددة — انشر المفيد لا كل شيء",
          ],
        },
      ],
      howTo: [
        { title: "افحص القائم", body: "ارسم الأجهزة والعناوين والكابلات الحالية. المحوّلات غير المُدارة أسفل اللوحات هي الاكتشاف المعتاد." },
        { title: "صمّم البنية", body: "خطّط التقسيم والعنونة والتكرار قبل شراء الأجهزة." },
        { title: "ركّب العمود الفقري", body: "ركّب المحوّلات المُدارة والألياف، ورقّم طرفي كل كابل، وسجّل التوصيلات." },
        { title: "قسّم وأمّن", body: "طبّق شبكات VLAN وجدار حماية لعزل حركة التحكّم عن شبكة الأعمال." },
        { title: "أضف بوابة الحافة", body: "ركّب البوابة، واربطها بالمتحكّمات للقراءة فقط، وانشر قائمة الإشارات المتفق عليها للخارج." },
        { title: "تحقق ووثّق", body: "اختبر التكرار بسحب كابل، وتأكد من التعافي، وسلّم بنية الشبكة كما نُفّذت." },
      ],
      outcomes: [
        "شبكة يمكن تتبّع أعطالها من التوثيق",
        "قطع كابل لا يوقف الإنتاج",
        "بيانات المصنع متاحة للوحات دون تعريض المتحكّمات",
      ],
    },
  },

  // ── 8. Process Instrumentation & Calibration ─────────────────────────────
  {
    slug: "process-instrumentation",
    icon: "Thermometer",
    accent: "#0F766E",
    categorySlugs: ["process-instruments", "temperature-controllers", "encoders", "cables-connectors"],
    brands: ["Endress+Hauser", "Emerson", "Yokogawa", "Siemens", "Pepperl+Fuchs"],
    diagram: [
      { label: "Control", nodes: ["PLC / DCS input", "Controller", "Recorder"] },
      { label: "Signal", nodes: ["4-20 mA", "HART", "Profibus PA", "Isolator"] },
      { label: "Transmitter", nodes: ["Pressure", "Temperature", "Flow", "Level"] },
      { label: "Process", nodes: ["Pipe / vessel", "Thermowell", "Impulse line"] },
    ],
    en: {
      name: "Process Instrumentation & Calibration",
      tagline: "Measurement you can actually trust",
      summary:
        "Selection, installation and calibration of pressure, temperature, flow and level instruments — with the installation details that decide whether a reading means anything.",
      explanation: [
        "Control quality is capped by measurement quality. A perfectly tuned loop on a badly installed transmitter produces confident, repeatable, wrong answers.",
        "Most measurement error in practice is installation, not instrument: impulse lines that trap air, thermowells too short for the pipe, flow meters without enough straight run, and level instruments fighting foam or condensation.",
        "Calibration is what turns an instrument into evidence. For regulated processes — food, pharmaceutical, water — a traceable calibration record is as much the deliverable as the measurement itself.",
      ],
      requirements: [
        {
          title: "Process data",
          items: [
            "Medium, operating and maximum pressure, temperature range",
            "Pipe size, material and available straight run for flow measurement",
            "Hazardous-area classification if applicable — this constrains everything",
          ],
        },
        {
          title: "Installation",
          items: [
            "Correct process connection and sealing material for the medium",
            "Thermowell length and insertion depth suited to the pipe",
            "Impulse line routing that self-drains or self-vents as the service needs",
          ],
        },
        {
          title: "Signal and verification",
          items: [
            "4-20 mA with HART, or fieldbus, matched to the control system",
            "Signal isolators where earth loops are possible",
            "Calibration equipment traceable to a national standard",
          ],
        },
      ],
      howTo: [
        { title: "Define the measurement", body: "State what is being measured, over what range and to what accuracy. Over-specified accuracy costs money and buys nothing." },
        { title: "Select for the process", body: "Match wetted materials, connection and area classification to the actual service conditions." },
        { title: "Install correctly", body: "Follow the straight-run, insertion-depth and impulse-line rules. This is where measurements are won or lost." },
        { title: "Wire and isolate", body: "Run shielded cable, earth at one end only, and add isolators where loops are a risk." },
        { title: "Calibrate and record", body: "Calibrate against traceable references across the range, and file the certificate." },
        { title: "Schedule re-calibration", body: "Set intervals by criticality and drift history, not by habit." },
      ],
      outcomes: [
        "Measurements that hold up to scrutiny",
        "Traceable calibration records for audit",
        "Control loops that perform because their inputs are sound",
      ],
    },
    ar: {
      name: "أجهزة قياس العمليات والمعايرة",
      tagline: "قياس يمكن الوثوق به فعلًا",
      summary:
        "اختيار وتركيب ومعايرة أجهزة قياس الضغط والحرارة والتدفق والمستوى — مع تفاصيل التركيب التي تحدد إن كانت القراءة تعني شيئًا.",
      explanation: [
        "جودة التحكّم محدودة بجودة القياس. الدائرة المضبوطة تمامًا على مرسل سيّئ التركيب تنتج إجابات واثقة ومتكررة وخاطئة.",
        "معظم خطأ القياس عمليًا سببه التركيب لا الجهاز: خطوط نقل تحبس الهواء، وجيوب حرارية أقصر من قطر الماسورة، وعدّادات تدفق بلا طول مستقيم كافٍ، وأجهزة مستوى تصارع الرغوة أو التكاثف.",
        "المعايرة هي ما يحوّل الجهاز إلى دليل. وفي العمليات الخاضعة للتنظيم — الأغذية والدواء والمياه — سجل المعايرة القابل للتتبّع جزء من التسليم بقدر القياس نفسه.",
      ],
      requirements: [
        {
          title: "بيانات العملية",
          items: [
            "الوسط، وضغط التشغيل والأقصى، ونطاق الحرارة",
            "قطر الماسورة وخامتها والطول المستقيم المتاح لقياس التدفق",
            "تصنيف المنطقة الخطرة إن وُجد — فهو يقيّد كل شيء",
          ],
        },
        {
          title: "التركيب",
          items: [
            "وصلة عملية وخامة إحكام صحيحتان للوسط",
            "طول الجيب الحراري وعمق الإدخال مناسبان للماسورة",
            "مسار خطوط النقل يصرّف أو يفرّغ الهواء ذاتيًا حسب الخدمة",
          ],
        },
        {
          title: "الإشارة والتحقق",
          items: [
            "٤-٢٠ مللي أمبير مع HART أو ناقل ميداني يطابق نظام التحكّم",
            "عوازل إشارة حيثما تُحتمل حلقات التأريض",
            "أجهزة معايرة قابلة للتتبّع إلى معيار وطني",
          ],
        },
      ],
      howTo: [
        { title: "حدد القياس", body: "بيّن ما يُقاس وفي أي نطاق وبأي دقة. الدقة المبالغ فيها تكلّف مالًا ولا تضيف شيئًا." },
        { title: "اختر حسب العملية", body: "طابق الخامات الملامسة والوصلة وتصنيف المنطقة مع ظروف الخدمة الفعلية." },
        { title: "ركّب بشكل صحيح", body: "التزم بقواعد الطول المستقيم وعمق الإدخال وخطوط النقل. هنا تُكسب القياسات أو تُفقد." },
        { title: "التوصيل والعزل", body: "مدّ كابلًا مدرّعًا، وأرّضه من طرف واحد فقط، وأضف عوازل حيث تُحتمل الحلقات." },
        { title: "المعايرة والتسجيل", body: "عاير مقابل مراجع قابلة للتتبّع عبر النطاق، واحفظ الشهادة." },
        { title: "جدولة إعادة المعايرة", body: "حدد الفترات حسب الأهمية وتاريخ الانحراف لا حسب العادة." },
      ],
      outcomes: [
        "قياسات تصمد أمام التدقيق",
        "سجلات معايرة قابلة للتتبّع للمراجعة",
        "دوائر تحكّم تؤدي جيدًا لأن مدخلاتها سليمة",
      ],
    },
  },
];

export function getSystem(slug: string) {
  return systems.find((s) => s.slug === slug);
}
