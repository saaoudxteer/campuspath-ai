export type BiText = { fr: string; ary: string };
export type OrientationCategory = "tech" | "business" | "health" | "creative" | "science" | "society";
export type OrientationLevel = "lycee" | "bac" | "bac2" | "licence" | "reorientation";
export type OrientationInterest =
  | "technologie" | "logique" | "construire" | "organiser"
  | "aider" | "creer" | "comprendre" | "communiquer" | "terrain";
export type OrientationLink = { label: string; url: string };
export type OrientationStep = {
  id: string;
  title: BiText;
  detail: BiText;
  actions: BiText[];
  resource?: OrientationLink;
};
export type OrientationBranch = { id: string; title: BiText; detail: BiText };
export type OrientationRoadmap = {
  id: string;
  category: OrientationCategory;
  title: BiText;
  summary: BiText;
  levels: OrientationLevel[];
  interests: OrientationInterest[];
  duration: BiText;
  cost: BiText;
  careers: BiText[];
  strengths: BiText[];
  watchouts: BiText[];
  steps: OrientationStep[];
  branches: OrientationBranch[];
  sources: OrientationLink[];
};

/** Dernière revue éditoriale et vérification des références OFPPT / ONOUSC.
 * Les autres portails servent à retrouver les avis propres à chaque établissement. */
export const ORIENTATION_REVIEWED_AT = "2026-09-18";

const ENSSUP: OrientationLink = { label: "Ministère de l’Enseignement supérieur", url: "https://www.enssup.gov.ma" };
const CURSUSSUP: OrientationLink = { label: "CursusSup, orientation et inscription post-bac", url: "https://www.cursussup.gov.ma" };
const OFPPT: OrientationLink = { label: "OFPPT, formation professionnelle", url: "https://www.ofppt.ma" };
const OFPPT_ACCES: OrientationLink = { label: "OFPPT, conditions d’accès", url: "https://www.ofppt.ma/fr/conditions-dacces" };
const OFPPT_DUREES: OrientationLink = { label: "OFPPT, durée des formations", url: "https://www.ofppt.ma/fr/faq/quelle-est-la-duree-dune-formation-organisee-en-cours-du-jour" };
const OFPPT_PASSERELLES: OrientationLink = { label: "OFPPT, poursuite de formation", url: "https://www.ofppt.ma/fr/poursuivre-votre-formation" };
const ONOUSC: OrientationLink = { label: "ONOUSC, conditions du logement étudiant", url: "https://www.onousc.ma/etudiant-marocain" };
const BOURSES: OrientationLink = { label: "ONOUSC, informations sur les bourses", url: "https://www.onousc.ma/Bourses" };
const ANAPEC: OrientationLink = { label: "ANAPEC, métiers et emploi", url: "https://www.anapec.org" };

/**
 * Chaque parcours suit la même colonne vertébrale en cinq étapes.
 * Les identifiants d’étape sont stables, la progression enregistrée s’appuie dessus.
 */
export const orientationRoadmaps: OrientationRoadmap[] = [
  {
    id: "informatique",
    category: "tech",
    title: { fr: "Informatique et numérique", ary: "المعلوميات والرقمنة" },
    summary: {
      fr: "Écrire du code, faire tenir des systèmes debout, traiter des données. Un domaine où l’on apprend beaucoup par la pratique et où les portes d’entrée sont variées.",
      ary: "تكتب البرمجة، تسير الأنظمة وتخدم على البيانات. مجال كتتعلم فيه بالتطبيق وعندو طرق دخول مختلفة.",
    },
    levels: ["lycee", "bac", "bac2", "licence", "reorientation"],
    interests: ["technologie", "logique", "creer"],
    duration: { fr: "Variable selon le diplôme : formation technique, licence ou cursus ingénieur. Compare les durées totales, y compris les préparations éventuelles.", ary: "المدة كتبدل حسب الدبلوم: تكوين تقني، إجازة ولا مسار مهندس. قارن المدة كاملة، مع التحضير إلا كان." },
    cost: { fr: "Demande les frais exacts de chaque formation. Ajoute le logement, le transport et l’équipement informatique à ton budget.", ary: "سول على المصاريف بالضبط ديال كل تكوين. زيد السكن والنقل والتجهيز المعلوماتي فالميزانية ديالك." },
    careers: [
      { fr: "Développeur logiciel ou web", ary: "مطور البرامج ولا مواقع الويب" },
      { fr: "Administrateur systèmes et réseaux", ary: "مسير الأنظمة والشبكات" },
      { fr: "Analyste de données", ary: "محلل البيانات" },
      { fr: "Technicien support et infrastructure", ary: "تقني الدعم والبنية المعلوماتية" },
    ],
    strengths: [
      { fr: "Tu peux progresser seul entre deux cours, avec des projets et des exercices.", ary: "تقدر تتقدم براسك بين الدروس، بالمشاريع والتمارين." },
      { fr: "Le travail se montre. Un projet fini vaut souvent mieux qu’un long discours.", ary: "الخدمة كتبان. مشروع كامل كيشرح خدمتك حسن من هضرة طويلة." },
      { fr: "Les compétences se transfèrent d’un secteur à l’autre, de la banque à l’industrie.", ary: "المهارات كتنتقل من قطاع لآخر، من الأبناك حتى للصناعة." },
    ],
    watchouts: [
      { fr: "Le rythme de mise à jour est réel. Il faut aimer réapprendre régulièrement.", ary: "المجال كيتبدل بزربة. خاصك تبغي تعاود تتعلم باستمرار." },
      { fr: "Beaucoup de temps assis devant un écran, souvent seul sur un problème.", ary: "وقت بزاف جالس قدام الشاشة، ومرات بوحدك مع شي مشكل." },
      { fr: "Les intitulés de formations se ressemblent. Regarde le programme réel, pas le nom.", ary: "سميات التكوينات كيتشابهو. شوف البرنامج الحقيقي، ماشي غير السمية." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Voir ce qu’il y a vraiment derrière le mot", ary: "شوف شنو كاين مورا هاد الكلمة" },
        detail: {
          fr: "L’informatique n’est pas un seul métier. Développement, réseaux, données, sécurité, support. Ces branches demandent des goûts différents. Avant de choisir une formation, mets des noms précis sur ce qui t’attire.",
          ary: "المعلوميات ماشي خدمة وحدة: البرمجة، الشبكات، البيانات، الأمن والدعم. كل فرع كيطلب حوايج مختلفة. قبل ما تختار التكوين، عرف شنو كيعجبك أكثر.",
        },
        actions: [
          { fr: "Note trois activités concrètes qui t’attirent, pas trois intitulés de diplômes.", ary: "كتب ثلاثة أنشطة عملية كيعجبوك، ماشي غير سميات الدبلومات." },
          { fr: "Regarde une journée type de deux métiers différents du domaine.", ary: "شوف نهار عادي فجوج خدمات مختلفين فهاد المجال." },
          { fr: "Repère les fiches métiers officielles plutôt que les vidéos de promotion.", ary: "قلب على بطاقات المهن الرسمية، ماشي غير الفيديوهات الإشهارية." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Vérifier les conditions d’accès réelles", ary: "تأكد من شروط القبول الحقيقية" },
        detail: {
          fr: "Les seuils, les concours et les dates changent chaque année et varient d’un établissement à l’autre. Ce qui était vrai l’an dernier ne l’est pas forcément cette année. Va chercher l’avis officiel de l’année en cours.",
          ary: "العتبات والمباريات والتواريخ كيتبدلو كل عام ومن مؤسسة لأخرى. معلومات العام اللي فات ممكن تبدلات. قلب على الإعلان الرسمي ديال هاد العام.",
        },
        actions: [
          { fr: "Ouvre la plateforme nationale et lis les conditions de la filière visée.", ary: "حل المنصة الوطنية وقرا شروط الشعبة اللي بغيتي." },
          { fr: "Note les dates limites dans ton calendrier, avec une semaine de marge.", ary: "كتب آخر الآجال فالمذكرة ديالك، وخلي أسبوع احتياطي." },
          { fr: "Prépare tôt les pièces demandées, elles prennent souvent plus de temps que prévu.", ary: "وجد بكري الوثائق المطلوبة، حيت كتقدر تاخد وقت كثر من المتوقع." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Toucher le domaine avant de t’engager", ary: "جرب قبل ما تدخل" },
        detail: {
          fr: "Un petit projet réel t’apprend plus sur toi qu’une brochure. Tu sauras vite si résoudre un bug pendant deux heures t’agace ou t’amuse. C’est cette réaction qu’il faut observer.",
          ary: "مشروع صغير حقيقي يقدر يعرفك براسك كثر من كتيب. غادي تعرف واش كتستمتع تصلح خطأ فالبرمجة ولا كيتقل عليك. رد الفعل ديالك مهم.",
        },
        actions: [
          { fr: "Termine un projet minuscule de bout en bout, même très simple.", ary: "كمل مشروع صغير من الأول للآخر، واخا يكون بسيط." },
          { fr: "Parle à un étudiant déjà dans la filière et demande ce qui l’a surpris.", ary: "هضر مع طالب فالشعبة وسولو على الحوايج اللي فاجأتو." },
          { fr: "Observe ta réaction devant la difficulté, c’est le meilleur indice.", ary: "لاحظ رد الفعل ديالك قدام الصعوبة، راه مؤشر مهم." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer deux ou trois formations précises", ary: "قارن جوج ولا ثلاثة تكوينات محددة" },
        detail: {
          fr: "À ce stade, arrête de comparer des domaines et compare des formations nommées. Le programme détaillé, le volume de pratique, le devenir des diplômés et le coût total sur la durée.",
          ary: "دابا بدا قارن تكوينات بسمياتها: البرنامج، حجم التطبيق، شنو كيديرو الخريجين والثمن الكامل.",
        },
        actions: [
          { fr: "Mets côte à côte les maquettes pédagogiques, matière par matière.", ary: "حط البرامج حدا بعضياتهم وقارن مادة بمادة." },
          { fr: "Compte le budget complet, frais et vie quotidienne comprise.", ary: "حسب الميزانية كاملة، مع المصاريف والمعيشة اليومية." },
          { fr: "Garde une option accessible en plus de ton premier choix.", ary: "خلي اختيار متاح ليك زيادة على الاختيار الأول." },
        ],
        resource: ONOUSC,
      },
      {
        id: "preparer",
        title: { fr: "Préparer la prochaine échéance", ary: "وجد الموعد الجاي" },
        detail: {
          fr: "Une orientation se joue souvent sur des détails administratifs. Dossier complet, dates tenues, plan de repli prêt. C’est peu glorieux mais c’est ce qui fait la différence.",
          ary: "التفاصيل الإدارية كتفرق: ملف كامل، احترام التواريخ وخطة بديلة. هاد التحضير جزء مهم من التوجيه.",
        },
        actions: [
          { fr: "Écris la liste des pièces et coche-les une par une.", ary: "كتب لائحة الوثائق وعلم عليهم وحدة بوحدة." },
          { fr: "Prévois un second choix qui te convient vraiment, pas un choix par défaut.", ary: "وجد اختيار ثاني كيعجبك بصح، ماشي غير باش يكون." },
          { fr: "Vérifie les aides possibles au logement et à la bourse dès maintenant.", ary: "شوف دابا مساعدات السكن والمنحة." },
        ],
        resource: ENSSUP,
      },
    ],
    branches: [
      {
        id: "voie-technique-courte",
        title: { fr: "Une voie technique courte", ary: "طريق تقنية قصيرة" },
        detail: {
          fr: "Une formation technique peut préparer à des missions concrètes. L’OFPPT indique deux ans pour le niveau technicien spécialisé. Les poursuites d’études dépendent du diplôme obtenu, de la filière et de la sélection de l’établissement visé.",
          ary: "التكوين التقني يقدر يوجدك لخدمات عملية. مكتب التكوين المهني كيحدد عامين لمستوى تقني متخصص. باش تكمل القراية، تأكد من الدبلوم والشعبة وانتقاء المؤسسة.",
        },
      },
      {
        id: "voie-universitaire",
        title: { fr: "La voie universitaire", ary: "طريق الجامعة" },
        detail: {
          fr: "Une licence puis un master laissent le temps de préciser ta spécialité. Le cadre est moins encadré qu’en école, l’autonomie compte davantage.",
          ary: "الإجازة ومن بعدها الماستر كيعطيوك الوقت تحدد التخصص ديالك. التأطير كيختلف على المدرسة، والاعتماد على النفس مهم.",
        },
      },
      {
        id: "voie-ingenieur",
        title: { fr: "Le cycle ingénieur", ary: "سلك المهندس" },
        detail: {
          fr: "Une sélection à l’entrée, un rythme soutenu, une formation large. Cela demande une préparation sérieuse en amont et une bonne résistance au travail continu.",
          ary: "انتقاء فالدخول، وتيرة مكثفة وتكوين واسع. خاص تحضير مزيان وخدمة مستمرة.",
        },
      },
    ],
    sources: [CURSUSSUP, ENSSUP, OFPPT_DUREES, OFPPT_PASSERELLES, ANAPEC],
  },
  {
    id: "ingenierie",
    category: "tech",
    title: { fr: "Ingénierie et sciences appliquées", ary: "الهندسة والعلوم التطبيقية" },
    summary: {
      fr: "Concevoir, dimensionner, faire fonctionner. Génie civil, électrique, industriel, énergies. Des formations exigeantes en sciences, très tournées vers le concret.",
      ary: "تصمم، تحسب وتخلي الأنظمة تخدم. الهندسة المدنية والكهربائية والصناعية والطاقات. تكوين كيطلب مستوى علمي مزيان ومربوط بالتطبيق.",
    },
    levels: ["lycee", "bac", "bac2", "licence"],
    interests: ["construire", "logique", "technologie", "comprendre"],
    duration: { fr: "Compte la préparation éventuelle et le cycle ingénieur. La durée restante dépend de ton point d’entrée et du cursus de l’école.", ary: "حسب مدة التحضير إلا كان وسلك المهندس. المدة الباقية كتبدل حسب مستوى الدخول ومسار المدرسة." },
    cost: { fr: "Compare les frais de scolarité, le logement, le matériel et les déplacements liés aux stages. Vérifie les aides disponibles.", ary: "قارن مصاريف القراية والسكن والتجهيز والتنقل للتداريب. تأكد من المساعدات المتاحة." },
    careers: [
      { fr: "Ingénieur en génie civil", ary: "مهندس فالهندسة المدنية" },
      { fr: "Ingénieur procédés ou production", ary: "مهندس العمليات ولا الإنتاج" },
      { fr: "Chargé d’affaires techniques", ary: "مسؤول على المشاريع التقنية" },
      { fr: "Ingénieur énergies renouvelables", ary: "مهندس فالطاقات المتجددة" },
    ],
    strengths: [
      { fr: "Tu vois le résultat de ton travail dans des objets et des ouvrages réels.", ary: "كتشوف نتيجة خدمتك فحوايج ومشاريع حقيقية." },
      { fr: "La formation reste large, elle ouvre sur plusieurs secteurs.", ary: "التكوين واسع وكيفتح على بزاف ديال القطاعات." },
      { fr: "Les chantiers et les usines valorisent la rigueur et la méthode.", ary: "الأوراش والمعامل كيحتاجو النظام والمنهجية." },
    ],
    watchouts: [
      { fr: "Le niveau en mathématiques et en physique est exigeant dès la première année.", ary: "الرياضيات والفيزياء كيطلبو مستوى قوي من العام الأول." },
      { fr: "Certains postes imposent de la mobilité et des horaires lourds.", ary: "بعض الخدمات كتطلب التنقل وساعات طويلة." },
      { fr: "Le mot ingénieur recouvre des réalités très différentes selon la spécialité.", ary: "كلمة مهندس كتغطي خدمات مختلفة بزاف حسب التخصص." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Distinguer les grandes spécialités", ary: "فرق بين التخصصات الكبرى" },
        detail: { fr: "Génie civil, électrique, mécanique, industriel, énergie. Le quotidien n’a rien à voir d’une spécialité à l’autre. Mets des images concrètes derrière chaque nom.", ary: "الهندسة المدنية والكهربائية والميكانيكية والصناعية والطاقة. النهار العادي كيختلف بيناتهم. حاول تفهم شنو كاين مورا كل سمية." },
        actions: [
          { fr: "Choisis deux spécialités et compare leur journée type.", ary: "ختار جوج تخصصات وقارن النهار العادي ديالهم." },
          { fr: "Regarde dans quels secteurs recrutent ces profils au Maroc.", ary: "شوف القطاعات اللي كتوظف هاد التخصصات فالمغرب." },
          { fr: "Repère les matières scientifiques que chacune demande vraiment.", ary: "عرف المواد العلمية اللي كيطلب كل تخصص." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Comprendre la sélection à l’entrée", ary: "فهم الانتقاء ديال الدخول" },
        detail: { fr: "Les cycles ingénieur sélectionnent sur dossier, concours ou les deux, avec des seuils publiés chaque année. Cette étape se prépare plusieurs mois à l’avance.", ary: "أسلاك المهندس كتنتقي بالملف ولا المباراة ولا بجوج، حسب الشروط المنشورة كل عام. التحضير كيبدا قبل بشهور." },
        actions: [
          { fr: "Lis l’avis officiel de l’année en cours, pas celui de l’an dernier.", ary: "قرا الإعلان الرسمي ديال هاد العام، ماشي العام اللي فات." },
          { fr: "Note les épreuves et le format exact du concours visé.", ary: "كتب الامتحانات وشكل المباراة اللي بغيتي." },
          { fr: "Planifie une préparation régulière plutôt qu’un sprint final.", ary: "دير تحضير منتظم، ماشي غير فآخر لحظة." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Confronter l’idée au terrain", ary: "شوف الواقع بعينيك" },
        detail: { fr: "Une visite de chantier, d’atelier ou d’unité de production change souvent la perception qu’on a du métier. Le bruit, le rythme et le travail d’équipe se découvrent sur place.", ary: "زيارة لورش ولا مصنع تقدر تبدل نظرتك للخدمة. الضجيج والوتيرة والخدمة الجماعية كتكتشفهم فعين المكان." },
        actions: [
          { fr: "Demande à visiter un site ou suis une visite organisée.", ary: "طلب تزور موقع ولا شارك فزيارة منظمة." },
          { fr: "Interroge un professionnel sur la part de terrain et de bureau.", ary: "سول مهني على الوقت اللي كيدوز فالميدان وفالمكتب." },
          { fr: "Teste ton goût pour le calcul appliqué sur un cas simple.", ary: "جرب الحساب التطبيقي فحالة بسيطة وشوف واش كيعجبك." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer les écoles sur des critères utiles", ary: "قارن المدارس بمعايير مفيدة" },
        detail: { fr: "Au-delà du classement, regarde le volume de projets, la durée des stages, les partenariats avec les entreprises et le devenir réel des diplômés.", ary: "شوف المشاريع ومدة التداريب والشراكات وشنو كيديرو الخريجين، ماشي غير الترتيب." },
        actions: [
          { fr: "Compare le nombre de mois de stage sur l’ensemble du cursus.", ary: "قارن عدد شهور التدريب فالمسار كامل." },
          { fr: "Vérifie les équipements et les laboratoires disponibles.", ary: "تأكد من التجهيزات والمختبرات المتاحة." },
          { fr: "Demande où sont les diplômés deux ans après la sortie.", ary: "سول فين وصلو الخريجين من بعد عامين." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Construire un dossier solide", ary: "بني ملف قوي" },
        detail: { fr: "Les notes scientifiques comptent, mais la régularité et un projet cohérent aussi. Un plan de repli sérieux évite de tout jouer sur un seul concours.", ary: "النقط العلمية مهمة، وحتى الانتظام وانسجام المشروع. اختيار بديل جدي كيقلل الاعتماد على مباراة وحدة." },
        actions: [
          { fr: "Consolide les matières scientifiques dès maintenant.", ary: "قوي المواد العلمية من دابا." },
          { fr: "Prépare une voie alternative que tu accepterais sans regret.", ary: "وجد طريق أخرى تقبلها بلا ندم." },
          { fr: "Renseigne-toi sur le logement et la bourse avant les résultats.", ary: "سول على السكن والمنحة قبل النتائج." },
        ],
        resource: ONOUSC,
      },
    ],
    branches: [
      { id: "voie-prepa", title: { fr: "Passer par une préparation", ary: "تدوز من الأقسام التحضيرية" }, detail: { fr: "Deux années intensives avant le concours. Le rythme est dur mais la formation scientifique obtenue est solide et réutilisable ailleurs.", ary: "عامين مكثفين قبل المباراة. الوتيرة صعيبة ولكن التكوين العلمي قوي وكيقدر ينفعك فمسارات أخرى." } },
      { id: "voie-integree", title: { fr: "Un cycle intégré après le bac", ary: "مسار مدمج من بعد الباك" }, detail: { fr: "Certaines écoles proposent un parcours après le bac comprenant une préparation intégrée. Vérifie la sélection à l’entrée, les conditions de passage en cycle ingénieur et le moment du choix de spécialité.", ary: "بعض المدارس كتقترح مسار بعد الباك فيه تحضير مدمج. تأكد من الانتقاء وشروط المرور لسلك المهندس ووقت اختيار التخصص." } },
      { id: "voie-technique", title: { fr: "Explorer une admission sur diplôme", ary: "شوف القبول بالدبلوم" }, detail: { fr: "Des admissions sur diplôme existent dans certaines écoles. Elles dépendent du diplôme exact, des résultats, de la spécialité et des places disponibles. Une licence ou un diplôme technique ne donne pas automatiquement accès au cycle ingénieur.", ary: "بعض المدارس كتقبل بالدبلوم بشروط: نوع الدبلوم والنقط والتخصص والبلايص. الإجازة ولا الدبلوم التقني ما كيعطيوش دخول تلقائي لسلك المهندس." } },
    ],
    sources: [CURSUSSUP, ENSSUP, ANAPEC],
  },
  {
    id: "metiers",
    category: "tech",
    title: { fr: "Métiers techniques et formation professionnelle", ary: "المهن التقنية والتكوين المهني" },
    summary: {
      fr: "Apprendre les gestes et les connaissances d’un métier. Maintenance, électricité, froid, logistique, hôtellerie, automobile. Compare la place des ateliers et des stages dans chaque formation.",
      ary: "تتعلم المهارات والمعارف ديال خدمة: الصيانة والكهرباء والتبريد والنقل والفندقة والسيارات. قارن مكانة الورشات والتداريب فكل تكوين.",
    },
    levels: ["lycee", "bac", "bac2", "reorientation"],
    interests: ["terrain", "construire", "technologie"],
    duration: { fr: "À l’OFPPT, deux ans pour les niveaux technicien et technicien spécialisé en cours du jour. Vérifie la durée de la formation précise.", ary: "فمكتب التكوين المهني، التكوين النهاري للتقني والتقني المتخصص كيدوم عامين. تأكد من مدة التكوين اللي بغيتي." },
    cost: { fr: "Vérifie les frais d’inscription et le matériel à fournir. Ajoute le transport, la tenue professionnelle et l’outillage éventuel.", ary: "تأكد من مصاريف التسجيل والتجهيزات اللي خاصك. زيد النقل ولباس الخدمة والعدة إلا كانت مطلوبة." },
    careers: [
      { fr: "Technicien de maintenance industrielle", ary: "تقني الصيانة الصناعية" },
      { fr: "Électricien d’installation", ary: "كهربائي التركيبات" },
      { fr: "Technicien en froid et climatisation", ary: "تقني التبريد والتكييف" },
      { fr: "Agent logistique ou magasinier", ary: "عامل فاللوجستيك ولا أمين مخزن" },
    ],
    strengths: [
      { fr: "On apprend en faisant, avec des résultats visibles tout de suite.", ary: "كتتعلم بالخدمة والنتيجة كتبان بسرعة." },
      { fr: "Un cursus court permet de tester un domaine avant d’envisager une spécialisation.", ary: "التكوين القصير كيعاونك تجرب المجال قبل ما تفكر فالتخصص." },
      { fr: "Un métier maîtrisé peut mener à l’installation à son compte.", ary: "التمكن من مهنة يقدر يفتح ليك طريق تخدم على راسك." },
    ],
    watchouts: [
      { fr: "Les places sont limitées dans les filières demandées, il faut s’y prendre tôt.", ary: "البلايص محدودة فالشعب المطلوبة، خاصك تبدا بكري." },
      { fr: "Certaines spécialités sont physiques et se pratiquent debout.", ary: "بعض التخصصات فيها مجهود بدني وخدمة بالوقوف." },
      { fr: "La progression passe par la formation continue, elle ne vient pas seule.", ary: "التقدم المهني كيحتاج تكوين مستمر، ما كيجيش بوحدو." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Identifier les métiers qui recrutent près de chez toi", ary: "عرف المهن المطلوبة قريب ليك" },
        detail: { fr: "Le tissu économique change d’une région à l’autre. Un métier très demandé dans une zone industrielle peut l’être moins ailleurs. Regarde ce qui existe autour de toi.", ary: "الاقتصاد كيختلف من جهة لأخرى. خدمة مطلوبة فمنطقة صناعية ممكن ما تكونش مطلوبة فبلاصة أخرى. شوف شنو كاين حداك." },
        actions: [
          { fr: "Liste les entreprises et ateliers présents dans ta région.", ary: "كتب الشركات والورشات اللي فالجهة ديالك." },
          { fr: "Repère trois spécialités précises plutôt qu’un secteur vague.", ary: "ختار ثلاثة تخصصات محددة، ماشي قطاع عام." },
          { fr: "Demande à un artisan ou un technicien ce qu’il ferait à ta place.", ary: "سول حرفي ولا تقني شنو كان غادي يدير فبلاصتك." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Vérifier le niveau d’entrée et le calendrier", ary: "تأكد من مستوى الدخول والتواريخ" },
        detail: { fr: "Les conditions OFPPT varient selon le niveau : diplôme ou niveau scolaire, âge et correspondance des filières. Vérifie aussi le calendrier et le canal d’inscription de l’année concernée.", ary: "شروط مكتب التكوين المهني كتبدل حسب المستوى: الدبلوم ولا المستوى الدراسي، السن وتوافق الشعبة. تأكد حتى من تواريخ وطريقة التسجيل ديال السنة المعنية." },
        actions: [
          { fr: "Vérifie le niveau scolaire exigé par la spécialité visée.", ary: "تأكد من المستوى الدراسي المطلوب للتخصص." },
          { fr: "Crée ton compte de préinscription dès l’ouverture.", ary: "فتح حساب التسجيل الأولي ملي يتحل." },
          { fr: "Note les pièces à fournir et la date de dépôt au centre.", ary: "كتب الوثائق المطلوبة وتاريخ وضع الملف فالمركز." },
        ],
        resource: OFPPT_ACCES,
      },
      {
        id: "essayer",
        title: { fr: "Passer une journée dans le métier", ary: "دوز نهار فالخدمة" },
        detail: { fr: "Rien ne remplace quelques heures dans un atelier. L’environnement, les gestes et l’ambiance se jugent sur place, pas sur une fiche.", ary: "شي ساعات فالورشة كتوريك الجو والحركات وطريقة الخدمة حسن من ورقة تعريفية." },
        actions: [
          { fr: "Demande à observer une demi-journée dans un atelier.", ary: "طلب تلاحظ الخدمة نصف نهار فشي ورشة." },
          { fr: "Note ce qui t’a plu et ce qui t’a fatigué, honnêtement.", ary: "كتب بصدق شنو عجبك وشنو عياك." },
          { fr: "Vérifie que les conditions physiques te conviennent.", ary: "تأكد أن ظروف الخدمة مناسبة ليك." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer les centres et les spécialités", ary: "قارن المراكز والتخصصات" },
        detail: { fr: "Deux centres peuvent proposer la même spécialité avec des équipements et des partenariats très différents. Le stage et l’insertion font la différence.", ary: "جوج مراكز يقدرو يعطيو نفس التخصص بتجهيزات وشراكات مختلفة. التداريب والإدماج المهني كيفرقو." },
        actions: [
          { fr: "Compare les équipements et l’état des ateliers.", ary: "قارن التجهيزات وحالة الورشات." },
          { fr: "Demande la durée et le lieu des stages prévus.", ary: "سول على مدة وبلاصة التداريب." },
          { fr: "Calcule le trajet quotidien, il pèse plus qu’on ne croit.", ary: "حسب التنقل اليومي، راه كيأثر على التجربة." },
        ],
        resource: OFPPT,
      },
      {
        id: "preparer",
        title: { fr: "Préparer ta candidature", ary: "وجد الترشيح ديالك" },
        detail: { fr: "Prépare un dossier complet dans les délais et une seconde piste qui te convient. Déposer tôt évite les imprévus, mais ne garantit pas l’admission.", ary: "وجد ملف كامل فالوقت وطريق ثانية مناسبة. الدفع بكري كيقلل المفاجآت، ولكن ما كيضمنش القبول." },
        actions: [
          { fr: "Dépose ton dossier dès l’ouverture, sans attendre la date limite.", ary: "دفع الملف ملي يتحل التسجيل، ما تستناش آخر نهار." },
          { fr: "Prépare une seconde spécialité proche de la première.", ary: "وجد تخصص ثاني قريب للأول." },
          { fr: "Garde une copie numérique de chaque pièce déposée.", ary: "حفظ نسخة رقمية من كل وثيقة دفعتي." },
        ],
        resource: OFPPT,
      },
    ],
    branches: [
      { id: "voie-alternance", title: { fr: "Se former en alternance", ary: "التكوين بالتناوب" }, detail: { fr: "Une partie du temps en entreprise, une partie en centre. L’apprentissage est plus concret et le réseau professionnel se construit tôt.", ary: "جزء فالشركة وجزء فالمركز. تعلم قريب للواقع وعلاقات مهنية كتبدا تبنيها بكري." } },
      { id: "voie-diplome-superieur", title: { fr: "Poursuivre vers un diplôme supérieur", ary: "تكمل لدبلوم أعلى" }, detail: { fr: "L’OFPPT décrit des passerelles entre niveaux et des possibilités de licence professionnelle pour les techniciens spécialisés. L’accès dépend de la filière, des résultats et des conditions de l’établissement ; il n’est pas automatique.", ary: "مكتب التكوين المهني كيوضح الجسور بين المستويات وإمكانيات الإجازة المهنية للتقنيين المتخصصين. القبول مرتبط بالشعبة والنقط وشروط المؤسسة، ماشي تلقائي." } },
      { id: "voie-independant", title: { fr: "Travailler à son compte", ary: "تخدم على راسك" }, detail: { fr: "Un métier manuel maîtrisé permet de s’installer, mais la gestion, le devis et la relation client s’apprennent aussi.", ary: "التمكن من حرفة يقدر يخليك تبدا مشروعك، ولكن التسيير وعروض الأثمان والعلاقة مع الزبناء كيحتاجو تعلم." } },
    ],
    sources: [OFPPT_ACCES, OFPPT_DUREES, OFPPT_PASSERELLES, ANAPEC],
  },
  {
    id: "commerce",
    category: "business",
    title: { fr: "Commerce, gestion et finance", ary: "التجارة والتسيير والمالية" },
    summary: {
      fr: "Vendre, gérer, analyser des chiffres, faire tourner une organisation. Un domaine large où le relationnel compte autant que la méthode.",
      ary: "تبيع، تسير وتحلل الأرقام وتعاون المؤسسة تخدم. مجال واسع فيه العلاقات مهمة بحال المنهجية.",
    },
    levels: ["bac", "bac2", "licence", "reorientation"],
    interests: ["organiser", "communiquer", "logique"],
    duration: { fr: "Diplôme technique, licence ou cursus en école : compare le nombre d’années annoncé et les poursuites d’études envisagées.", ary: "دبلوم تقني، إجازة ولا مدرسة: قارن عدد السنوات المعلن عليه وإمكانية تكمل القراية." },
    cost: { fr: "Compare les frais de scolarité sur tout le cursus, ainsi que le logement et les stages. Demande les conditions des bourses éventuelles.", ary: "قارن مصاريف المسار كامل مع السكن والتداريب. سول على شروط المنح إلا كانت." },
    careers: [
      { fr: "Chargé de clientèle en banque", ary: "مكلف بالزبناء فالبنك" },
      { fr: "Contrôleur de gestion", ary: "مراقب التسيير" },
      { fr: "Responsable achats ou logistique", ary: "مسؤول المشتريات ولا اللوجستيك" },
      { fr: "Chargé de marketing digital", ary: "مكلف بالتسويق الرقمي" },
    ],
    strengths: [
      { fr: "Les compétences servent dans presque tous les secteurs.", ary: "هاد المهارات كتنفع فتقريبا جميع القطاعات." },
      { fr: "Le travail en équipe et le contact direct occupent une vraie place.", ary: "الخدمة الجماعية والتواصل المباشر عندهم مكانة مهمة." },
      { fr: "On peut évoluer vers la création de sa propre activité.", ary: "تقدر تتجه لإنشاء النشاط ديالك." },
    ],
    watchouts: [
      { fr: "Les intitulés sont nombreux et parfois flous, vérifie le contenu réel.", ary: "السميات كثيرة ومرات غامضة، تأكد من المحتوى الحقيقي." },
      { fr: "La pression sur les objectifs existe dans plusieurs métiers commerciaux.", ary: "ضغط الأهداف كاين فبزاف ديال المهن التجارية." },
      { fr: "Sans stages ni expérience, la sortie d’études peut être lente.", ary: "بلا تداريب ولا تجربة، الدخول لسوق الشغل يقدر يطول." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Séparer la vente, la gestion et la finance", ary: "فرق بين البيع والتسيير والمالية" },
        detail: { fr: "Ces trois familles demandent des tempéraments différents. La vente vit du contact, la gestion de l’organisation, la finance de l’analyse chiffrée.", ary: "هاد العائلات كتطلب ميولات مختلفة: البيع فيه التواصل، التسيير فيه التنظيم والمالية فيها تحليل الأرقام." },
        actions: [
          { fr: "Classe ces trois familles de la plus attirante à la moins attirante.", ary: "رتب هاد الثلاثة حسب اللي كيعجبك أكثر." },
          { fr: "Lis deux fiches métiers dans la famille arrivée en tête.", ary: "قرا جوج بطاقات مهن من العائلة اللي جات الأولى." },
          { fr: "Vérifie ton rapport aux chiffres sur un cas concret.", ary: "جرب التعامل مع الأرقام فحالة عملية واضحة." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Vérifier les voies d’accès", ary: "تأكد من طرق الدخول" },
        detail: { fr: "Certaines écoles recrutent sur concours après le bac, l’université ouvre des licences en gestion et en économie. Les conditions ne se ressemblent pas.", ary: "بعض المدارس كتنتقي بمباراة بعد الباك، والجامعة كتقدم إجازات فالتسيير والاقتصاد. الشروط كتختلف." },
        actions: [
          { fr: "Compare une voie sélective et une voie universitaire.", ary: "قارن طريق فيها انتقاء مع طريق الجامعة." },
          { fr: "Note les dates de concours et de dépôt de dossier.", ary: "كتب تواريخ المباريات ووضع الملف." },
          { fr: "Regarde le niveau de langues attendu à l’entrée.", ary: "شوف المستوى اللغوي المطلوب فالدخول." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Mettre un pied dans une organisation", ary: "جرب الخدمة فمؤسسة" },
        detail: { fr: "Un job saisonnier, un stage court ou une mission associative en disent long. Tu verras vite si le rythme d’une équipe te convient.", ary: "خدمة موسمية ولا تدريب قصير ولا نشاط جمعوي كيقدر يعلمك بزاف. شوف واش وتيرة الفريق كتناسبك." },
        actions: [
          { fr: "Cherche une expérience courte, même bénévole.", ary: "قلب على تجربة قصيرة ولا نشاط تطوعي مناسب." },
          { fr: "Observe ce qui t’épuise et ce qui te motive dans le collectif.", ary: "لاحظ شنو كيعييك وشنو كيحفزك فالخدمة الجماعية." },
          { fr: "Demande à suivre un professionnel pendant une journée.", ary: "طلب ترافق مهني نهار كامل." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer au-delà de la réputation", ary: "قارن بأكثر من السمعة" },
        detail: { fr: "Regarde la durée des stages, les langues enseignées, les cas pratiques et le réseau des anciens. La réputation seule ne dit rien du contenu.", ary: "شوف مدة التداريب واللغات والحالات التطبيقية وعلاقات الخريجين. السمعة بوحدها ما كتكفيش تعرف المحتوى." },
        actions: [
          { fr: "Compte les mois de stage obligatoires dans chaque cursus.", ary: "حسب شهور التدريب الإجباري فكل مسار." },
          { fr: "Vérifie les langues réellement pratiquées en cours.", ary: "تأكد من اللغات المستعملة فعلا فالدروس." },
          { fr: "Compare le coût total, pas seulement les frais annuels.", ary: "قارن الثمن الكامل، ماشي غير مصاريف عام واحد." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Travailler ta présentation", ary: "خدم على تقديم راسك" },
        detail: { fr: "Dans ce domaine, savoir se présenter compte tôt. Un entretien, une lettre et un premier CV se préparent avant même l’entrée en formation.", ary: "فهاد المجال، تقديم راسك مهم من بكري. وجد المقابلة والتعريف المختصر وأول سيرة ذاتية حتى قبل التكوين." },
        actions: [
          { fr: "Rédige une présentation de toi en cinq phrases claires.", ary: "كتب تعريف براسك فخمسة جمل واضحة." },
          { fr: "Prépare un exemple concret de travail en équipe.", ary: "وجد مثال محدد على تجربة فالخدمة الجماعية." },
          { fr: "Renseigne-toi sur les bourses avant la rentrée.", ary: "سول على المنح قبل الدخول." },
        ],
        resource: ONOUSC,
      },
    ],
    branches: [
      { id: "voie-ecole", title: { fr: "Une école de commerce", ary: "مدرسة التجارة" }, detail: { fr: "Sélection à l’entrée, cursus rythmé par les stages et les projets. Le coût et le réseau sont deux critères déterminants.", ary: "انتقاء فالدخول ومسار مبني على التداريب والمشاريع. الثمن والعلاقات المهنية جوج معايير مهمين." } },
      { id: "voie-universite", title: { fr: "Une licence à l’université", ary: "الإجازة فالجامعة" }, detail: { fr: "Un accès plus large et un coût contenu, avec davantage d’autonomie à fournir. Les stages se cherchent souvent par soi-même.", ary: "ولوج واسع وتكلفة معقولة، ولكن خاص اعتماد أكثر على النفس. التداريب غالبا كتقلب عليهم براسك." } },
      { id: "voie-technique-gestion", title: { fr: "Un diplôme technique en gestion", ary: "دبلوم تقني فالتسيير" }, detail: { fr: "Une voie à examiner pour ses applications en comptabilité ou gestion. Vérifie la durée, les stages et les possibilités de poursuite d’études pour le diplôme exact, auprès de l’établissement visé.", ary: "طريق باش تكتشف التطبيق فالمحاسبة ولا التسيير. تأكد من المدة والتداريب وإمكانية تكمل القراية بالدبلوم المحدد عند المؤسسة." } },
    ],
    sources: [CURSUSSUP, ENSSUP, ANAPEC],
  },
  {
    id: "sante",
    category: "health",
    title: { fr: "Santé et soin", ary: "الصحة والعلاج" },
    summary: {
      fr: "Soigner, accompagner, prévenir. Médecine, pharmacie, soins infirmiers, kinésithérapie, laboratoire. Des études longues et sélectives, un métier de contact humain permanent.",
      ary: "تعالج، تواكب وتساهم فالوقاية. الطب والصيدلة والتمريض والترويض والمختبر. قراية كتقدر تكون طويلة وبانتقاء، وخدمة فيها تواصل مع الناس.",
    },
    levels: ["lycee", "bac", "bac2", "licence"],
    interests: ["aider", "comprendre", "terrain"],
    duration: { fr: "La durée dépend du diplôme, de la spécialité et de la promotion. Consulte le cursus officiel de l’établissement, stages et spécialisations compris.", ary: "المدة كتبدل حسب الدبلوم والتخصص والفوج. شوف المسار الرسمي ديال المؤسسة، مع التداريب والتخصصات." },
    cost: { fr: "Demande les frais annuels et les dépenses de matériel. Prévois aussi le logement et les transports vers les lieux de stage.", ary: "سول على مصاريف كل سنة وثمن التجهيزات. حسب حتى السكن والتنقل لبلايص التدريب." },
    careers: [
      { fr: "Infirmier polyvalent", ary: "ممرض متعدد التخصصات" },
      { fr: "Technicien de laboratoire", ary: "تقني المختبر" },
      { fr: "Kinésithérapeute", ary: "أخصائي الترويض الطبي" },
      { fr: "Médecin généraliste", ary: "طبيب عام" },
    ],
    strengths: [
      { fr: "L’utilité du travail est immédiate et rarement discutable.", ary: "الفائدة ديال الخدمة كتبان مباشرة." },
      { fr: "Les besoins existent partout, y compris hors des grandes villes.", ary: "الحاجيات كاينة فمناطق مختلفة، حتى خارج المدن الكبرى." },
      { fr: "Le savoir acquis reste utile dans toute une vie professionnelle.", ary: "المعارف اللي كتكتسب كتبقى نافعة طول المسار المهني." },
    ],
    watchouts: [
      { fr: "La sélection est forte et la charge de travail élevée pendant les études.", ary: "الانتقاء صعيب وعبء القراية كبير." },
      { fr: "Le contact avec la souffrance demande un équilibre personnel solide.", ary: "التعامل مع المعاناة كيحتاج توازن شخصي ودعم." },
      { fr: "Les horaires incluent souvent des gardes et du travail de nuit.", ary: "أوقات الخدمة كتقدر تشمل الحراسة والليل." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Voir la diversité des métiers du soin", ary: "اكتشف تنوع مهن الصحة" },
        detail: { fr: "La santé ne se réduit pas à la médecine. Soins infirmiers, laboratoire, rééducation, prévention, gestion hospitalière. Chaque voie a sa durée et sa réalité.", ary: "الصحة ماشي غير الطب. التمريض والمختبر والترويض والوقاية وتسيير المستشفى. كل طريق عندها المدة والواقع ديالها." },
        actions: [
          { fr: "Repère quatre métiers de santé aux durées d’études différentes.", ary: "تعرف على ربعة مهن فالصحة بمدد قراية مختلفة." },
          { fr: "Distingue ce qui t’attire dans le soin, le geste ou la relation.", ary: "ميز شنو كيعجبك فالعلاج ولا الجانب العملي ولا العلاقة مع الناس." },
          { fr: "Parle à un soignant de son quotidien réel.", ary: "هضر مع مهني فالصحة على النهار العادي ديالو." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Comprendre la sélection et les prérequis", ary: "فهم الانتقاء والشروط" },
        detail: { fr: "Les filières de santé sélectionnent sur dossier, concours ou les deux, avec des places limitées. Les conditions sont publiées chaque année par les établissements.", ary: "شعب الصحة كتنتقي بالملف ولا المباراة ولا بجوج، والبلايص محدودة. المؤسسات كتنشر الشروط كل عام." },
        actions: [
          { fr: "Lis l’avis officiel de la filière et de l’année en cours.", ary: "قرا الإعلان الرسمي ديال الشعبة والسنة المعنية." },
          { fr: "Note la nature exacte des épreuves de sélection.", ary: "كتب بالضبط اختبارات الانتقاء." },
          { fr: "Vérifie s’il existe des exigences de langue ou de dossier médical.", ary: "تأكد واش كاين شرط لغوي ولا ملف طبي مطلوب." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Approcher le milieu du soin", ary: "قرب من عالم العلاج" },
        detail: { fr: "Le bénévolat, une association ou une observation encadrée donnent une idée juste. L’odeur, le bruit et la fatigue d’un service ne se lisent pas dans une brochure.", ary: "التطوع والعمل الجمعوي والملاحظة المؤطرة كيعطيو فكرة واقعية. جو المصلحة والإرهاق ما كيبانوش فالكتيبات." },
        actions: [
          { fr: "Engage-toi dans une action associative de santé ou de secours.", ary: "شارك فنشاط جمعوي فالصحة ولا الإسعاف." },
          { fr: "Demande une observation encadrée, même brève.", ary: "طلب فترة ملاحظة مؤطرة، واخا قصيرة." },
          { fr: "Évalue honnêtement ta réaction face à la fatigue et au stress.", ary: "لاحظ بصدق رد الفعل ديالك قدام العيا والضغط." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer durée, sélection et réalité du métier", ary: "قارن المدة والانتقاء وواقع الخدمة" },
        detail: { fr: "Une filière plus courte n’est pas un second choix. Elle mène à un métier plein, avec ses responsabilités propres et ses possibilités d’évolution.", ary: "الشعبة القصيرة ماشي أقل قيمة. كتوجد لمهنة كاملة بمسؤولياتها وفرص التطور ديالها." },
        actions: [
          { fr: "Compare deux filières sur la durée totale et le taux d’accès.", ary: "قارن جوج شعب من حيث المدة الكاملة وانتقائية القبول." },
          { fr: "Regarde où exercent réellement les diplômés.", ary: "شوف فين كيخدمو الخريجين فعلا." },
          { fr: "Vérifie les passerelles possibles si tu changes d’avis.", ary: "تأكد من إمكانيات إعادة التوجيه إلا بدلتي رأيك." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Tenir la distance", ary: "وجد راسك للمسار الطويل" },
        detail: { fr: "Ces études demandent une organisation régulière plus qu’un effort ponctuel. Le sommeil, la méthode et le soutien autour de toi comptent autant que le niveau.", ary: "هاد القراية كتطلب تنظيم منتظم أكثر من مجهود مؤقت. النعاس والمنهجية والدعم مهمين بحال المستوى." },
        actions: [
          { fr: "Installe une méthode de révision stable dès le départ.", ary: "دير طريقة مراجعة ثابتة من البداية." },
          { fr: "Prépare une voie alternative dans le champ de la santé.", ary: "وجد طريق أخرى فمجال الصحة." },
          { fr: "Regarde les conditions de logement près des lieux de stage.", ary: "شوف ظروف السكن قريب لبلايص التدريب." },
        ],
        resource: ONOUSC,
      },
    ],
    branches: [
      { id: "voie-paramedical", title: { fr: "Les formations paramédicales", ary: "التكوينات شبه الطبية" }, detail: { fr: "Soins infirmiers, laboratoire, imagerie, rééducation : chaque diplôme prépare à des activités distinctes. Vérifie sa reconnaissance, sa durée, les stages et les conditions d’exercice du métier.", ary: "التمريض والمختبر والتصوير الطبي والترويض: كل دبلوم كيحضر لمهن مختلفة. تأكد من الاعتراف والمدة والتداريب وشروط الممارسة." } },
      { id: "voie-medicale", title: { fr: "Médecine, pharmacie, dentaire", ary: "الطب والصيدلة وطب الأسنان" }, detail: { fr: "Des cursus longs et sélectifs qui demandent un engagement de plusieurs années avant l’exercice autonome.", ary: "مسارات طويلة وبانتقاء، كتطلب التزام لسنوات قبل الممارسة المستقلة." } },
      { id: "voie-sante-publique", title: { fr: "Santé publique et gestion", ary: "الصحة العمومية والتسيير" }, detail: { fr: "Prévention, épidémiologie, organisation des soins. Une manière de travailler pour la santé sans être au chevet du patient.", ary: "الوقاية وعلم الأوبئة وتنظيم العلاج. طريق تخدم فيها الصحة خارج العلاج المباشر للمريض." } },
    ],
    sources: [CURSUSSUP, ENSSUP, ONOUSC, BOURSES],
  },
  {
    id: "creation",
    category: "creative",
    title: { fr: "Design, audiovisuel et création", ary: "التصميم والسمعي البصري والإبداع" },
    summary: {
      fr: "Donner une forme à une idée. Graphisme, design produit, architecture d’intérieur, vidéo, animation, son. Explore les travaux attendus et les qualifications propres à chaque métier.",
      ary: "تعطي شكل لفكرة: التصميم الغرافيكي والمنتجات والفضاءات والفيديو والتحريك والصوت. شوف الأعمال والمؤهلات المطلوبة لكل مهنة.",
    },
    levels: ["lycee", "bac", "bac2", "reorientation"],
    interests: ["creer", "technologie", "communiquer"],
    duration: { fr: "La durée dépend de la spécialité, du diplôme et de l’école. Vérifie le cursus et la place des stages ou du projet de fin d’études.", ary: "المدة كتبدل حسب التخصص والدبلوم والمدرسة. تأكد من المسار ومكانة التداريب ومشروع التخرج." },
    cost: { fr: "Ajoute aux frais de scolarité le matériel, les logiciels et les dépenses liées aux projets. Vérifie ce que l’école fournit réellement.", ary: "زيد التجهيزات والبرامج ومصاريف المشاريع على ثمن القراية. تأكد شنو كتوفر المدرسة فعلا." },
    careers: [
      { fr: "Designer graphique", ary: "مصمم غرافيكي" },
      { fr: "Monteur vidéo ou motion designer", ary: "مونتير فيديو ولا مصمم الحركة" },
      { fr: "Designer d’espace ou d’intérieur", ary: "مصمم الفضاءات ولا التصميم الداخلي" },
      { fr: "Chargé de communication visuelle", ary: "مكلف بالتواصل البصري" },
    ],
    strengths: [
      { fr: "Le travail se montre directement, un portfolio parle pour toi.", ary: "الخدمة كتبان مباشرة، وملف الأعمال كيهضر عليك." },
      { fr: "Les projets personnels comptent réellement dans ce domaine.", ary: "المشاريع الشخصية عندها قيمة فهاد المجال." },
      { fr: "Les compétences s’appliquent à beaucoup de secteurs, pas seulement à la pub.", ary: "المهارات كتنفع فبزاف ديال القطاعات، ماشي غير الإشهار." },
    ],
    watchouts: [
      { fr: "Les revenus peuvent être irréguliers au début, surtout en indépendant.", ary: "الدخل يقدر يكون غير منتظم فالبداية، خصوصا فالعمل المستقل." },
      { fr: "La critique du travail fait partie du métier, il faut l’accepter.", ary: "نقد الأعمال جزء من الخدمة، خاصك تتعلم تستافد منو." },
      { fr: "Le goût ne suffit pas, la technique et les délais structurent tout.", ary: "الذوق بوحدو ما كافيش، التقنية واحترام المواعيد مهمين." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Nommer précisément ce que tu veux créer", ary: "حدد بالضبط شنو بغيتي تبدع" },
        detail: { fr: "Créer une image, un espace, un son ou un mouvement ne demande ni les mêmes outils ni la même formation. Le mot création est trop large pour décider.", ary: "تصنع صورة ولا فضاء ولا صوت ولا حركة: الأدوات والتكوين مختلفين. كلمة الإبداع واسعة باش تختار على أساسها بوحدها." },
        actions: [
          { fr: "Choisis deux supports précis qui t’attirent le plus.", ary: "ختار جوج أنواع ديال الإبداع كيعجبوك أكثر." },
          { fr: "Regarde le travail réel de professionnels dans ces deux voies.", ary: "شوف الأعمال الحقيقية ديال مهنيين فجوج الطرق." },
          { fr: "Note les outils et logiciels qui reviennent le plus souvent.", ary: "كتب الأدوات والبرامج اللي كيتستعملو بزاف." },
        ],
      },
      {
        id: "verifier",
        title: { fr: "Vérifier ce qui est demandé à l’entrée", ary: "تأكد شنو مطلوب فالدخول" },
        detail: { fr: "Beaucoup d’écoles de création demandent un dossier de travaux, parfois un entretien ou un test. Cela se prépare longtemps à l’avance, pas la veille.", ary: "بزاف ديال مدارس الإبداع كتطلب ملف أعمال، ومرات مقابلة ولا اختبار. هادشي كيحتاج تحضير من بكري." },
        actions: [
          { fr: "Vérifie si un dossier de travaux est exigé et sous quelle forme.", ary: "تأكد واش ملف الأعمال مطلوب وبأي شكل." },
          { fr: "Note les dates de dépôt et les formats acceptés.", ary: "كتب تواريخ الإيداع والصيغ المقبولة." },
          { fr: "Regarde si une équivalence publique existe pour la même spécialité.", ary: "شوف واش كاينة مؤسسة عمومية بنفس التخصص." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Produire avant de postuler", ary: "نتج قبل ما تترشح" },
        detail: { fr: "Quelques travaux terminés t’aident à montrer ta démarche et à demander un retour précis. Vérifie les consignes du portfolio si l’école en demande un.", ary: "أعمال كاملة كتعاونك تبين طريقة خدمتك وتطلب ملاحظات محددة. راجع تعليمات ملف الأعمال إلا طلباتو المدرسة." },
        actions: [
          { fr: "Termine trois travaux personnels, du début à la fin.", ary: "كمل ثلاثة أعمال شخصية من الأول للآخر." },
          { fr: "Fais relire ton travail par quelqu’un d’exigeant.", ary: "طلب من شخص عندو تجربة يعطيك نقد دقيق." },
          { fr: "Documente ta démarche, pas seulement le résultat final.", ary: "وثق كيفاش خدمتي، ماشي غير النتيجة النهائية." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer les écoles sur le travail produit", ary: "قارن المدارس بأعمال الطلبة" },
        detail: { fr: "Le meilleur indice est le travail des étudiants sortants. Regarde leurs projets, leur diversité et les entreprises où ils atterrissent.", ary: "أعمال الخريجين مؤشر مفيد. شوف مشاريعهم وتنوعها وفين وصلو." },
        actions: [
          { fr: "Regarde les travaux de fin d’études des dernières promotions.", ary: "شوف مشاريع التخرج ديال الأفواج الأخيرة." },
          { fr: "Vérifie le matériel et les logiciels réellement accessibles.", ary: "تأكد من التجهيزات والبرامج المتاحة فعلا." },
          { fr: "Compare le coût total avec le matériel personnel nécessaire.", ary: "قارن التكلفة الكاملة مع التجهيزات الشخصية المطلوبة." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Construire un portfolio qui tient", ary: "بني ملف أعمال قوي" },
        detail: { fr: "Un portfolio se travaille comme un dossier. Sélection serrée, présentation soignée, explication courte de chaque projet. C’est ton premier argument.", ary: "ملف الأعمال كيحتاج اختيار دقيق وتقديم واضح وشرح قصير لكل مشروع. هادا أول دليل على خدمتك." },
        actions: [
          { fr: "Garde tes meilleures pièces et retire les plus faibles.", ary: "خلي أحسن الأعمال وحيد الأضعف." },
          { fr: "Écris deux phrases d’explication par projet.", ary: "كتب جوج جمل شرح لكل مشروع." },
          { fr: "Prépare une version numérique facile à partager.", ary: "وجد نسخة رقمية ساهلة للمشاركة." },
        ],
      },
    ],
    branches: [
      { id: "voie-ecole-art", title: { fr: "Une école d’art ou de design", ary: "مدرسة الفن ولا التصميم" }, detail: { fr: "Un cadre exigeant avec des ateliers et des critiques régulières. L’admission passe souvent par un dossier de travaux.", ary: "تأطير فيه ورشات ونقد منتظم. القبول غالبا كيدوز من ملف الأعمال." } },
      { id: "voie-technique-creative", title: { fr: "Un diplôme technique créatif", ary: "دبلوم تقني إبداعي" }, detail: { fr: "Infographie, audiovisuel, multimédia : examine les outils enseignés, les projets réalisés et les stages. Vérifie la durée et les conditions d’accès de la spécialité choisie.", ary: "الغرافيك والسمعي البصري والوسائط المتعددة: شوف الأدوات والمشاريع والتداريب. تأكد من المدة وشروط التخصص اللي ختاريتي." } },
      { id: "voie-autodidacte", title: { fr: "Se former en autodidacte, avec un cadre", ary: "تتعلم براسك مع تأطير" }, detail: { fr: "Possible dans ce domaine, à condition d’une discipline réelle et de retours extérieurs réguliers. Le diplôme reste utile pour certaines structures.", ary: "ممكن فهاد المجال، بشرط الانضباط وملاحظات من ناس آخرين. الدبلوم كيبقى مطلوب ولا مفيد فبعض المؤسسات." } },
    ],
    sources: [CURSUSSUP, ENSSUP, ANAPEC],
  },
  {
    id: "sciences",
    category: "science",
    title: { fr: "Sciences fondamentales et recherche", ary: "العلوم الأساسية والبحث" },
    summary: {
      fr: "Comprendre avant d’appliquer. Mathématiques, physique, chimie, biologie, sciences de la terre. Une voie exigeante qui ouvre sur l’enseignement, la recherche et l’analyse.",
      ary: "تفهم قبل ما تطبق. الرياضيات والفيزياء والكيمياء والبيولوجيا وعلوم الأرض. طريق كتطلب مجهود وكتفتح على التدريس والبحث والتحليل.",
    },
    levels: ["lycee", "bac", "licence", "reorientation"],
    interests: ["comprendre", "logique", "technologie"],
    duration: { fr: "Licence, puis éventuellement master et doctorat. Vérifie la durée de chaque cycle et ses conditions d’accès ; une poursuite d’études reste soumise à sélection.", ary: "إجازة، وممكن من بعدها ماستر ودكتوراه. تأكد من مدة وشروط كل سلك؛ متابعة القراية كتخضع للانتقاء." },
    cost: { fr: "Vérifie les frais éventuels et le budget de vie dans la ville visée. Consulte séparément les conditions de bourse et de logement.", ary: "تأكد من المصاريف والميزانية ديال العيش فالمدينة. شوف شروط المنحة والسكن بشكل مستقل." },
    careers: [
      { fr: "Enseignant en sciences", ary: "أستاذ العلوم" },
      { fr: "Chargé d’études ou d’analyses", ary: "مكلف بالدراسات ولا التحاليل" },
      { fr: "Technicien ou ingénieur de laboratoire", ary: "تقني ولا مهندس فالمختبر" },
      { fr: "Chercheur après un parcours doctoral", ary: "باحث من بعد مسار الدكتوراه" },
    ],
    strengths: [
      { fr: "La formation apprend à raisonner, ce qui se réemploie partout.", ary: "تكوين كيعلمك التفكير العلمي، وهادشي كينفع فمجالات كثيرة." },
      { fr: "Tu peux explorer une discipline en profondeur avant de te spécialiser.", ary: "تقدر تعمق فمادة قبل ما تختار التخصص." },
      { fr: "Les acquis scientifiques peuvent être utiles dans l’analyse de données ou l’industrie ; vérifie les formations complémentaires requises.", ary: "المعارف العلمية تقدر تنفع فتحليل البيانات ولا الصناعة؛ تأكد من التكوين الإضافي المطلوب." },
    ],
    watchouts: [
      { fr: "L’autonomie demandée est forte, peu de gens te relanceront.", ary: "خاص اعتماد كبير على النفس وتنظيم ذاتي." },
      { fr: "Le lien avec un métier précis est moins direct qu’en filière professionnelle.", ary: "الربط بمهنة محددة أقل مباشرة من التكوين المهني." },
      { fr: "Les débouchés dépendent souvent d’un master bien choisi.", ary: "الآفاق كتتعلق غالبا بماستر مختار بعناية." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Voir ce que devient une science à l’université", ary: "شوف كيفاش كتولي العلوم فالجامعة" },
        detail: { fr: "Les mathématiques du lycée et celles de licence ne se ressemblent pas. Regarde un programme réel de première année avant de décider.", ary: "رياضيات الثانوي ماشي بحال الإجازة. شوف برنامج السنة الأولى الحقيقي قبل الاختيار." },
        actions: [
          { fr: "Ouvre la maquette de licence de la filière visée.", ary: "حل برنامج الإجازة ديال الشعبة اللي بغيتي." },
          { fr: "Repère les matières inconnues et cherche ce qu’elles recouvrent.", ary: "تعرف على المواد الجديدة وقلب على المعنى ديالها." },
          { fr: "Demande à un étudiant en deuxième année ce qui l’a surpris.", ary: "سول طالب فالسنة الثانية شنو فاجأو." },
        ],
        resource: ENSSUP,
      },
      {
        id: "verifier",
        title: { fr: "Vérifier l’inscription et les prérequis", ary: "تأكد من التسجيل والشروط" },
        detail: { fr: "L’accès à l’université est plus ouvert que dans les filières sélectives, mais certaines mentions ont des capacités et des prérequis. Vérifie avant de t’engager.", ary: "الولوج للجامعة أوسع من بعض الشعب الانتقائية، ولكن شي مسالك عندها بلايص محدودة وشروط. تأكد قبل." },
        actions: [
          { fr: "Vérifie les capacités d’accueil de la filière choisie.", ary: "تأكد من الطاقة الاستيعابية ديال الشعبة." },
          { fr: "Note les dates d’inscription administrative.", ary: "كتب تواريخ التسجيل الإداري." },
          { fr: "Regarde la langue d’enseignement des matières scientifiques.", ary: "شوف اللغة اللي كتتقرا بها المواد العلمية." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Tester ton rapport à l’abstraction", ary: "جرب التعامل مع الأفكار المجردة" },
        detail: { fr: "Une science fondamentale se vit surtout dans la durée et la patience. Un problème qui résiste plusieurs jours est la norme, pas l’exception.", ary: "العلوم الأساسية كتحتاج النفس الطويل والصبر. تقدر تبقى مع نفس المشكل أيام، وهادشي عادي." },
        actions: [
          { fr: "Travaille un problème difficile sur plusieurs jours.", ary: "خدم على مشكل صعيب على مدار أيام." },
          { fr: "Observe si la difficulté te décourage ou t’accroche.", ary: "لاحظ واش الصعوبة كتحبطك ولا كتزيد تشد اهتمامك." },
          { fr: "Assiste si possible à un cours ouvert à l’université.", ary: "إلا قدرت، حضر درس مفتوح فالجامعة." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer les débouchés des masters", ary: "قارن آفاق الماسترات" },
        detail: { fr: "En sciences, la licence oriente et le master spécialise. Regarde dès maintenant quels masters existent et ce qu’ils ouvrent réellement.", ary: "فالعلوم، الإجازة كتعطي الأساس والماستر كيخصص. شوف من دابا الماسترات المتاحة والآفاق ديالها." },
        actions: [
          { fr: "Liste trois masters accessibles depuis ta licence.", ary: "كتب ثلاثة ماسترات ممكن توصل ليهم من الإجازة ديالك." },
          { fr: "Vérifie les conditions de sélection de ces masters.", ary: "تأكد من شروط الانتقاء ديالهم." },
          { fr: "Regarde les passerelles vers l’ingénierie ou les données.", ary: "شوف الطرق الممكنة للهندسة ولا تحليل البيانات." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Prendre l’habitude de travailler seul", ary: "درب راسك تخدم باستقلالية" },
        detail: { fr: "L’université laisse une grande liberté, ce qui est un piège sans méthode. Un rythme fixe dès les premières semaines change tout le reste de l’année.", ary: "الجامعة كتعطي حرية كبيرة، وكتحتاج منهجية. وتيرة ثابتة من الأسابيع الأولى كتعاون طول العام." },
        actions: [
          { fr: "Fixe un rythme de travail hebdomadaire dès la rentrée.", ary: "حدد برنامج أسبوعي للخدمة من الدخول." },
          { fr: "Trouve un groupe de travail sérieux.", ary: "لقى مجموعة دراسة جدية." },
          { fr: "Vérifie ton droit à la bourse et au logement étudiant.", ary: "تأكد من شروط الاستفادة من المنحة والسكن الجامعي." },
        ],
        resource: ONOUSC,
      },
    ],
    branches: [
      { id: "voie-recherche", title: { fr: "Vers la recherche", ary: "فجهة البحث" }, detail: { fr: "Master puis doctorat, avec un travail long sur un sujet précis. Cela demande de la patience et un encadrement de qualité.", ary: "ماستر ومن بعد دكتوراه، بخدمة طويلة على موضوع محدد. كتحتاج الصبر وتأطير مزيان." } },
      { id: "voie-enseignement", title: { fr: "Vers l’enseignement", ary: "فجهة التدريس" }, detail: { fr: "Transmettre une discipline, avec une formation pédagogique et des concours propres. Le contact avec les élèves est le cœur du métier.", ary: "تشرح مادة للطلبة، مع تكوين تربوي ومباريات خاصة. التواصل مع المتعلمين فقلب الخدمة." } },
      { id: "voie-applications", title: { fr: "Vers les applications techniques", ary: "فجهة التطبيقات التقنية" }, detail: { fr: "Données, calcul, laboratoire, industrie. Un master appliqué rapproche une licence scientifique du marché du travail.", ary: "البيانات والحساب والمختبر والصناعة. ماستر تطبيقي يقدر يقرب الإجازة العلمية لسوق الشغل." } },
    ],
    sources: [ENSSUP, CURSUSSUP, ONOUSC, BOURSES],
  },
  {
    id: "societe",
    category: "society",
    title: { fr: "Droit, éducation et société", ary: "القانون والتربية والمجتمع" },
    summary: {
      fr: "Comprendre les règles et les gens. Droit, sciences sociales, enseignement, travail social, administration. Des métiers de lecture, d’écrit et de relation.",
      ary: "تفهم القوانين والناس. القانون والعلوم الاجتماعية والتدريس والعمل الاجتماعي والإدارة. مهن فيها القراءة والكتابة والعلاقات.",
    },
    levels: ["bac", "licence", "reorientation"],
    interests: ["communiquer", "aider", "organiser", "comprendre"],
    duration: { fr: "Distingue le diplôme initial de la formation ou du concours exigé pour le métier visé. Vérifie les conditions à chaque étape.", ary: "فرق بين الدبلوم الأول والتكوين ولا المباراة المطلوبة للمهنة. تأكد من الشروط فكل خطوة." },
    cost: { fr: "Calcule les frais éventuels, le logement et les déplacements. Si un concours est requis, prévois aussi le temps et les moyens de préparation.", ary: "حسب المصاريف والسكن والتنقل. إلا كاينة مباراة، حسب حتى الوقت ووسائل التحضير." },
    careers: [
      { fr: "Juriste d’entreprise ou d’administration", ary: "متخصص قانوني فشركة ولا إدارة" },
      { fr: "Enseignant", ary: "أستاذ" },
      { fr: "Travailleur social", ary: "عامل اجتماعي" },
      { fr: "Chargé de ressources humaines", ary: "مكلف بالموارد البشرية" },
    ],
    strengths: [
      { fr: "La lecture et l’écriture deviennent de vrais outils professionnels.", ary: "القراءة والكتابة كيوليو أدوات مهنية مهمة." },
      { fr: "Les débouchés existent dans le public comme dans le privé.", ary: "الآفاق كاينة فالقطاع العام والخاص." },
      { fr: "Le domaine convient à ceux qui aiment argumenter et expliquer.", ary: "المجال مناسب للي كيبغي يناقش ويشرح." },
    ],
    watchouts: [
      { fr: "Le volume de lecture est important et régulier.", ary: "حجم القراءة كبير ومنتظم." },
      { fr: "Beaucoup de voies passent par un concours, avec une préparation longue.", ary: "بزاف ديال الطرق كتدوز من مباريات وتحضير طويل." },
      { fr: "Les intitulés généralistes demandent une spécialisation claire ensuite.", ary: "الشعب العامة كتحتاج تخصص واضح من بعد." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Distinguer les familles de métiers", ary: "فرق بين عائلات المهن" },
        detail: { fr: "Le droit, l’enseignement et le travail social comportent des activités différentes. Compare la lecture, l’écrit, le contact avec le public et les responsabilités de chaque métier.", ary: "القانون والتدريس والعمل الاجتماعي فيهم أنشطة مختلفة. قارن القراءة والكتابة والتواصل والمسؤوليات ديال كل مهنة." },
        actions: [
          { fr: "Choisis une famille et lis deux fiches métiers qui en relèvent.", ary: "ختار عائلة وقرا جوج بطاقات مهن منها." },
          { fr: "Repère la part d’écrit et la part d’oral dans chacune.", ary: "عرف حجم الكتابة والتواصل الشفوي فكل وحدة." },
          { fr: "Demande à un professionnel ce qui l’a fait rester.", ary: "سول مهني شنو خلاه يستمر فالمهنة." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Vérifier l’accès et la suite du parcours", ary: "تأكد من الدخول وتكملة المسار" },
        detail: { fr: "L’entrée en licence est souvent large, mais la suite passe par un master ou un concours. Regarde le chemin complet, pas seulement la première année.", ary: "ولوج الإجازة غالبا واسع، ولكن التكملة كتدوز من ماستر ولا مباراة. شوف الطريق كاملة، ماشي غير السنة الأولى." },
        actions: [
          { fr: "Regarde ce que font les diplômés trois ans après la licence.", ary: "شوف شنو كيديرو الخريجين بعد ثلاثة سنوات من الإجازة." },
          { fr: "Identifie les concours qui existent dans la voie visée.", ary: "عرف المباريات المتاحة فالمسار اللي بغيتي." },
          { fr: "Note la langue principale des cours et des examens.", ary: "كتب اللغة الرئيسية ديال الدروس والامتحانات." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Tester le terrain relationnel", ary: "جرب ميدان العلاقات" },
        detail: { fr: "Encadrer un groupe, accompagner quelqu’un ou assister à une audience publique t’en apprend plus qu’un chapitre de manuel.", ary: "تأطر مجموعة، تعاون شي واحد ولا تحضر جلسة عمومية: تجارب كتزيد تعرفك بالمجال." },
        actions: [
          { fr: "Participe à une activité associative ou de soutien scolaire.", ary: "شارك فنشاط جمعوي ولا دعم مدرسي." },
          { fr: "Assiste à une audience publique si c’est possible.", ary: "حضر جلسة عمومية إلا كان ممكن." },
          { fr: "Note si expliquer aux autres te fatigue ou te nourrit.", ary: "لاحظ واش الشرح للناس كيعييك ولا كيعجبك." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer les spécialisations possibles", ary: "قارن التخصصات الممكنة" },
        detail: { fr: "Une licence générale se spécialise ensuite. Droit des affaires, droit public, sciences de l’éducation, sociologie appliquée. Le choix du master oriente le métier.", ary: "الإجازة العامة كتتخصص من بعد: قانون الأعمال والقانون العام وعلوم التربية وعلم الاجتماع التطبيقي. اختيار الماستر كيوجه المهنة." },
        actions: [
          { fr: "Liste deux spécialisations qui t’attirent et leurs débouchés.", ary: "كتب جوج تخصصات كيعجبوك والآفاق ديالهم." },
          { fr: "Vérifie la sélectivité de ces masters.", ary: "تأكد من الانتقاء فهاد الماسترات." },
          { fr: "Regarde si un stage est prévu dans le cursus.", ary: "شوف واش كاين تدريب فالمسار." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Travailler l’écrit et l’argumentation", ary: "خدم على الكتابة والحجج" },
        detail: { fr: "Dans toutes ces voies, écrire clairement est une compétence décisive. Cela se travaille tôt, par la pratique régulière plus que par la théorie.", ary: "فهاد الطرق، الكتابة الواضحة مهارة مهمة. كتتطور بالممارسة المنتظمة من بكري." },
        actions: [
          { fr: "Écris chaque semaine un texte court et argumenté.", ary: "كتب كل أسبوع نص قصير مبني على حجج." },
          { fr: "Fais corriger tes textes par quelqu’un d’exigeant.", ary: "طلب من شخص متمكن يصحح النصوص ديالك." },
          { fr: "Renseigne-toi sur la bourse et le logement étudiant.", ary: "سول على المنحة والسكن الجامعي." },
        ],
        resource: ONOUSC,
      },
    ],
    branches: [
      { id: "voie-droit", title: { fr: "Le droit", ary: "القانون" }, detail: { fr: "Une discipline précise et codifiée, qui mène au conseil, au contentieux ou à l’administration. La rigueur de lecture y est centrale.", ary: "تخصص دقيق ومنظم، كيقدر يوصل للاستشارة والنزاعات والإدارة. الدقة فالقراءة أساسية." } },
      { id: "voie-education", title: { fr: "L’éducation", ary: "التربية" }, detail: { fr: "Enseigner, encadrer, concevoir des programmes. Le concours et la formation pédagogique structurent l’accès au métier.", ary: "تدرس، تأطر وتصمم برامج. المباراة والتكوين التربوي كينظمو الولوج للمهنة." } },
      { id: "voie-social", title: { fr: "Le travail social et l’administration", ary: "العمل الاجتماعي والإدارة" }, detail: { fr: "Accompagner des personnes ou faire fonctionner un service public. Beaucoup de terrain, des règles précises et un vrai sens du collectif.", ary: "تعاون الناس ولا تسير خدمة عمومية. فيه الميدان وقوانين محددة وحس بالعمل الجماعي." } },
    ],
    sources: [CURSUSSUP, ENSSUP, ANAPEC],
  },
];
