"use client";

import { useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  FileCheck,
  FileText,
  Languages,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  X,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";

type Props = {
  t: (fr: string, ary?: string) => string;
  locale: Locale;
  toggleLocale: () => void;
  onStart: (mode: "login" | "register") => void;
  onDemo: () => void;
  demoAvailable: boolean;
  busy: boolean;
  error: string;
};

interface InsightArticle {
  id: string;
  category: string;
  categoryTag: string;
  title: string;
  arTitle: string;
  excerpt: string;
  arExcerpt: string;
  readTime: string;
  date: string;
  featured?: boolean;
}

const INSIGHTS: InsightArticle[] = [
  {
    id: "ingenierie-maroc",
    category: "Grandes Écoles & CPGE",
    categoryTag: "INGÉNIERIE & INNOVATION",
    title:
      "Grandes Écoles d'Ingénieurs au Maroc : Décrypter les taux de sélection, concours CPGE et débouchés industriels.",
    arTitle:
      "مدارس المهندسين الكبرى بالمغرب: تحليل نسب الانتقاء، مباريات الأقسام التحضيرية والآفاق الصناعية.",
    excerpt:
      "Une analyse comparative approfondie des filières d'excellence (EMI, EHTP, ENSIAS, Centrale Casablanca) et des passerelles universitaires face aux exigences de l'industrie 4.0 et de la transition énergétique.",
    arExcerpt:
      "دراسة مقارنة للمسارات المتميزة وشروط الولوج في ظل متطلبات التحول الرقمي والصناعي الحديث.",
    readTime: "8 min de lecture",
    date: "Mars 2026",
    featured: true,
  },
  {
    id: "reforme-medecine",
    category: "Médecine & Santé",
    categoryTag: "SANTÉ & SCIENCES DU VIVANT",
    title:
      "Réforme des études médicales et pharmaceutiques : ce que les bacheliers doivent anticiper dès le lycée.",
    arTitle:
      "إصلاح الدراسات الطبية والصيدلية: ما يجب على تلاميذ البكالوريا استباقه من التعليم الثانوي.",
    excerpt:
      "Décryptage du nouveau cursus en 6 ans, des épreuves du concours unifié FMP/FMD et des passerelles vers les métiers paramédicaux et la recherche biomédicale.",
    arExcerpt:
      "قراءة في المسار الجديد ومباراة كليات الطب والصيدلة وفرص المهن الصحية.",
    readTime: "5 min de lecture",
    date: "Février 2026",
  },
  {
    id: "management-recrutement",
    category: "Management & Économie",
    categoryTag: "MANAGEMENT & AFFAIRES",
    title:
      "ISCAE, ENCG et pôles universitaires : comment les recruteurs évaluent les profils hybrides.",
    arTitle:
      "المعهد العالي للتجارة وإدارة المقاولات وشبكة المدارس الوطنية للتجارة: كيف يقيم المشغلون الكفاءات.",
    excerpt:
      "Enquête exclusive auprès de 40 directeurs des ressources humaines au Maroc et à l'international sur les compétences clés en audit, finance et conseil en stratégie.",
    arExcerpt:
      "استطلاع رأي مع مدراء الموارد البشرية حول المهارات المطلوبة في المالية والتدقيق والاستشارة.",
    readTime: "4 min de lecture",
    date: "Janvier 2026",
  },
  {
    id: "campus-france-eef",
    category: "Mobilité Internationale",
    categoryTag: "PROCÉDURES INTERNATIONALES",
    title:
      "Procédure Campus France & EEF : sécuriser chaque pièce pour éliminer tout risque d'irrecevabilité.",
    arTitle:
      "مسطرة كامبوس فرانس ومؤسسات التعليم العالي بالخارج: ضبط الوثائق لتفادي أي رفض إداري.",
    excerpt:
      "Méthodologie d'audit documentaire en 4 étapes pour valider relevés de notes, certifications linguistiques B2/C1 et argumentaires de motivation académique.",
    arExcerpt:
      "منهجية دقيقة لمراجعة الوثائق، الشواهد اللغوية وخطابات التحفيز لضمان قبول الملف.",
    readTime: "6 min de lecture",
    date: "Février 2026",
  },
];

interface FrameworkTrajectory {
  id: string;
  number: string;
  name: string;
  arName: string;
  target: string;
  selectivity: string;
  duration: string;
  institutions: string[];
  keyFactor: string;
  arKeyFactor: string;
}

const TRAJECTORIES: FrameworkTrajectory[] = [
  {
    id: "cpge-ingenieur",
    number: "01",
    name: "Voie d'Excellence Ingénieur : CPGE & Écoles d'État",
    arName: "مسار التميز الهندسي: الأقسام التحضيرية ومدارس الدولة الكبرى",
    target: "Bacheliers scientifiques (SM / PC) à fort potentiel analytique",
    selectivity: "Très Sélective (CNC · Concours National)",
    duration: "5 ans (Bac+5)",
    institutions: ["EMI Rabat", "EHTP Casablanca", "ENSIAS", "Centrale Casa", "INPT"],
    keyFactor: "Excellence en mathématiques et physique, résilience au concours.",
    arKeyFactor: "تفوق في الرياضيات والفيزياء وقدرة عالية على اجتياز المباريات الوطنية.",
  },
  {
    id: "medecine-sante",
    number: "02",
    name: "Voie Médicale & Sciences de la Santé : FMP, FMD & Pharmacie",
    arName: "المسار الطبي وعلوم الصحة: الطب، الصيدلة وطب الأسنان",
    target: "Bacheliers scientifiques avec mention Très Bien / Bien",
    selectivity: "Sélective (Concours Commun + Dossier)",
    duration: "6 ans (Médecine) / 5 ans (Pharmacie)",
    institutions: ["FMP Rabat/Casa/Fès/Marrakech", "FMD", "ISPITS", "UM6SS"],
    keyFactor: "Régularité académique, vocation de service et engagement sur le long terme.",
    arKeyFactor: "انتظام أكاديمي، التزام إنساني وجاهزية لدراسات طويلة المدى.",
  },
  {
    id: "commerce-gestion",
    number: "03",
    name: "Pôle Management & Finance : ISCAE, Réseau ENCG & Pôles Privés",
    arName: "قطب التدبير والمالية: المعهد العالي للتجارة وشبكة المدارس الوطنية",
    target: "Bacheliers sciences éco, maths ou physiques dotés d'un bon relationnel",
    selectivity: "Sélective (TAFEM · Concours d'accès)",
    duration: "5 ans (Bac+5)",
    institutions: ["ISCAE Casablanca/Rabat", "ENCG (12 villes)", "ESSEC Afrique"],
    keyFactor: "Capacités d'analyse stratégique, maîtrise des langues et leadership.",
    arKeyFactor: "قدرات تحليلية، إتقان اللغات الأجنبية ومهارات القيادة والتواصل.",
  },
  {
    id: "universite-excellence",
    number: "04",
    name: "Pôle Universitaire d'Excellence & Recherche : Licences & Masters",
    arName: "المسار الجامعي للتميز والبحث: إجازات التميز والماستر المتخصص",
    target: "Étudiants autonomes cherchant une spécialisation de haut niveau",
    selectivity: "Modérée à Sélective selon filière",
    duration: "3 ans (Licence) + 2 ans (Master)",
    institutions: ["UM5 Rabat", "Univ. Hassan II", "FST", "Facultés des Sciences"],
    keyFactor: "Autonomie de travail, curiosité scientifique et opportunité de doctorat.",
    arKeyFactor: "استقلالية في البحث العلمي، تعميق التخصص وفرص إنجاز الدكتوراه.",
  },
  {
    id: "mobilite-internationale",
    number: "05",
    name: "Passerelle Internationale : Procédure EEF, France & Étranger",
    arName: "المسار الدولي: مسطرة كامبوس فرانس والدراسة بالخارج",
    target: "Candidats à une formation supérieure européenne ou nord-américaine",
    selectivity: "Variable selon université et filière",
    duration: "3 à 5 ans",
    institutions: ["Universités Françaises (EEF)", "Grandes Écoles", "Universités UE"],
    keyFactor: "Dossier académique solide, certification linguistique B2/C1 et cohérence du projet.",
    arKeyFactor: "ملف أكاديمي متماسك، شواهد لغوية معتمدة ومشروع دراسي ومهني واضح.",
  },
];

export function PublicHome({
  t,
  locale,
  toggleLocale,
  onStart,
  onDemo,
  demoAvailable,
  busy,
  error,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);

  // Diagnostic interactive state
  const [diagStatus, setDiagStatus] = useState<string>("terminale");
  const [diagDomain, setDiagDomain] = useState<string>("ingenierie");
  const [diagPriority, setDiagPriority] = useState<string>("prestige");
  const [diagMobility, setDiagMobility] = useState<string>("maroc_international");

  const categories = [
    "Tous",
    "Grandes Écoles & CPGE",
    "Médecine & Santé",
    "Management & Économie",
    "Mobilité Internationale",
  ];

  const filteredInsights = INSIGHTS.filter((art) => {
    const matchesCat =
      selectedCategory === "Tous" || art.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.categoryTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredArticle = filteredInsights.find((a) => a.featured) || filteredInsights[0];
  const secondaryArticles = filteredInsights.filter((a) => a.id !== featuredArticle?.id);

  const calculateRecommendation = () => {
    if (diagDomain === "ingenierie") {
      return {
        title: "Trajectoire Recommandée : CPGE Scientifique vers Grandes Écoles d'Ingénieurs d'État (CNC)",
        sub: "Ouverture vers EMI, EHTP, ENSIAS, Centrale Casablanca et double-diplômes internationaux.",
        selectivity: "Élevée (Top 12% des bacheliers scientifiques)",
        prerequisites: "Moyenne générale recommandée : ≥ 15.5/20 · Solide maîtrise en Mathématiques & Physique.",
        milestone: "Inscriptions CPGE : Mai-Juin 2026 · Concours National Commun : 2e année.",
        riskFactor: "Intensité de travail hebdomadaire très soutenue pendant le cycle préparatoire.",
      };
    }
    if (diagDomain === "sante") {
      return {
        title: "Trajectoire Recommandée : Facultés de Médecine, Pharmacie & Dentaire (FMP/FMD)",
        sub: "Cursus d'excellence médicale en 6 ans avec internat et résidanat hospitalo-universitaire.",
        selectivity: "Très Élevée (Concours d'accès unifié national)",
        prerequisites: "Mention Très Bien ou Bien au Baccalauréat · Seuil de présélection moyen : 13 à 14/20.",
        milestone: "Pré-candidatures : Juin 2026 · Épreuve écrite du concours : Juillet 2026.",
        riskFactor: "Cursus long exigeant régularité, endurance et forte vocation d'engagement.",
      };
    }
    if (diagDomain === "management") {
      return {
        title: "Trajectoire Recommandée : Réseau ENCG & Préparation au concours ISCAE (Grande École)",
        sub: "Pôle d'excellence en gestion, finance d'entreprise, audit et conseil stratégique.",
        selectivity: "Modérée à Élevée (TAFEM national + Concours écrit/oral ISCAE)",
        prerequisites: "Bac Sciences Économiques, SM ou PC · Bon niveau en Français (B2/C1) et Anglais.",
        milestone: "Test d'Admissibilité TAFEM : Juillet 2026 · Admissions parallèles Bac+2.",
        riskFactor: "Importance déterminante des stages en entreprise et des activités associatives.",
      };
    }
    return {
      title: "Trajectoire Recommandée : Licences d'Excellence Universitaires & Mobilité Internationale (EEF)",
      sub: "Construction d'un profil académique spécialisé avec passerelle Master de recherche ou Grandes Écoles.",
      selectivity: "Équilibrée (Sur dossier et entretien d'admissibilité)",
      prerequisites: "Dossier régulier sur les 3 années du secondaire · Certification TCF/IELTS.",
      milestone: "Dépôt dossier Campus France : Décembre-Janvier · Sélection universitaire : Juin.",
      riskFactor: "Nécessité d'une rigueur absolue dans la complétude des relevés et des attestations.",
    };
  };

  const currentRec = calculateRecommendation();

  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans antialiased selection:bg-[#0056b3] selection:text-white">
      {/* Top McKinsey Editorial Ticker Bar */}
      <div className="bg-[#051c2c] text-[#d2d8df] text-[11px] font-medium border-b border-[#0a2540] py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0072ce] animate-pulse"></span>
            <span className="uppercase tracking-wider font-semibold text-white">
              {t("Perspective Stratégique 2026", "الرؤية الاستراتيجية 2026")} :
            </span>
            <span className="text-slate-300 hidden md:inline">
              {t(
                "Baromètre National des Grandes Écoles et Nouvelles Filières d'Excellence au Maroc",
                "البارومتر الوطني للمدارس الكبرى والمسارات الجديدة المتميزة بالمغرب",
              )}
            </span>
          </div>
          <div className="flex items-center gap-5 text-[11px]">
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label={t("Changer la langue", "تغيير اللغة")}
            >
              <Languages size={13} className="text-[#0072ce]" />
              <span>{locale === "fr" ? "الدارجة المغربية" : "Français"}</span>
            </button>
            <span className="text-slate-600">|</span>
            <a
              href="#diagnostic"
              className="text-[#60a5fa] hover:underline font-medium"
            >
              {t("Accès Rapide au Diagnostic", "الولوج السريع للتشخيص")} →
            </a>
          </div>
        </div>
      </div>

      {/* Main Global Header (McKinsey Style) */}
      <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-[#e5e9ee] shadow-[0_1px_3px_rgba(5,28,44,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Brand Wordmark */}
          <a href="#" className="flex items-baseline gap-1 group">
            <span className="font-editorial text-[26px] sm:text-[28px] font-medium tracking-tight text-[#051c2c] group-hover:text-[#0056b3] transition-colors">
              CampusPath
            </span>
            <span className="font-editorial italic text-[20px] sm:text-[22px] text-[#0056b3] font-normal ml-1">
              & Company
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-[#2d3748] tracking-wide">
            <a
              href="#insights"
              className="hover:text-[#0056b3] transition-colors py-2 border-b-2 border-transparent hover:border-[#0056b3]"
            >
              {t("Insights & Analyses", "التحليلات والدراسات")}
            </a>
            <a
              href="#trajectoires"
              className="hover:text-[#0056b3] transition-colors py-2 border-b-2 border-transparent hover:border-[#0056b3]"
            >
              {t("Filières d'Excellence", "المسارات المتميزة")}
            </a>
            <a
              href="#diagnostic"
              className="hover:text-[#0056b3] transition-colors py-2 border-b-2 border-transparent hover:border-[#0056b3]"
            >
              {t("Diagnostic Décisionnel", "التشخيص التوجيهي")}
            </a>
            <a
              href="#dossier-admissions"
              className="hover:text-[#0056b3] transition-colors py-2 border-b-2 border-transparent hover:border-[#0056b3]"
            >
              {t("Audit de Dossier", "تدقيق الملف")}
            </a>
            <a
              href="#methodologie"
              className="hover:text-[#0056b3] transition-colors py-2 border-b-2 border-transparent hover:border-[#0056b3]"
            >
              {t("Notre Cabinet", "عن المؤسسة")}
            </a>
          </nav>

          {/* Header Utilities */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-[#4a5568] hover:text-[#051c2c] hover:bg-slate-100 rounded transition-colors cursor-pointer"
              title={t("Rechercher un rapport ou une filière", "بحث")}
              aria-label="Recherche"
            >
              <Search size={18} />
            </button>

            {demoAvailable && (
              <button
                disabled={busy}
                onClick={onDemo}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-[#0056b3] bg-[#eef5fc] hover:bg-[#dbeafe] border border-[#bfdbfe] transition-colors rounded-sm cursor-pointer"
              >
                <Sparkles size={14} />
                <span>{busy ? t("Chargement...", "جاري الفتح...") : t("Session Démo", "تجربة الملف")}</span>
              </button>
            )}

            <button
              onClick={() => onStart("login")}
              className="mckinsey-btn-primary text-[13px] py-2 px-4 rounded-sm shadow-sm"
            >
              <span>{t("Espace Candidat", "فضاء المترشح")}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {showSearch && (
          <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-4 sm:px-8 py-3 animate-fadeIn">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <Search size={18} className="text-[#64748b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "Rechercher par filière (CPGE, Médecine, ENCG, EEF, EMI...) ou mot-clé...",
                  "ابحث عن مسار، مدرسة أو تخصص...",
                )}
                className="w-full bg-transparent border-none text-[14px] text-[#0f172a] focus:outline-none placeholder-[#94a3b8]"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Error Banner if any */}
      {error && (
        <div className="bg-[#fbefee] border-b border-[#fecaca] text-[#a32718] px-4 py-3 text-sm flex items-center justify-between max-w-7xl mx-auto mt-4 rounded">
          <span>{error}</span>
          <button
            onClick={() => onStart("register")}
            className="underline font-semibold"
          >
            {t("Réessayer", "إعادة المحاولة")}
          </button>
        </div>
      )}

      {/* Main Content Body */}
      <main id="public-main">
        {/* ================================================================= */}
        {/* SECTION 1: THE MCKINSEY LEAD STORY (HERO EDITORIAL) */}
        {/* ================================================================= */}
        <section className="bg-[#ffffff] border-b border-[#e2e8f0] pt-12 pb-16 sm:pt-16 sm:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Editorial Content (7 cols) */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-[2px] bg-[#0056b3]"></span>
                  <span className="mckinsey-kicker">
                    {t(
                      "Perspective Stratégique · Capital Humain & Avenir 2026",
                      "رؤية استراتيجية · الرأسمال البشري وآفاق 2026",
                    )}
                  </span>
                </div>

                <h1 className="mckinsey-lead-headline mb-6 text-[#051c2c]">
                  {t(
                    "L’Avenir des Talents au Maroc : Bâtir une Trajectoire d’Excellence et d’Impact.",
                    "مستقبل الكفاءات بالمغرب: بناء مسار للتميز والتأثير في عالم متسارع.",
                  )}
                </h1>

                <p className="text-[17px] sm:text-[19px] text-[#4a5568] font-normal leading-relaxed mb-8 max-w-2xl">
                  {t(
                    "Face à la multiplication des filières d’études, aux réformes des concours nationaux et à la sélectivité des grandes écoles, la réussite post-bac n’est plus une question de hasard : elle relève d’une stratégie méthodique d’anticipation et d’adéquation des compétences.",
                    "في ظل تعدد التخصصات وتحديث مباريات الولوج، لم يعد النجاح الأكاديمي مسألة صدفة، بل خطة استراتيجية مبنية على الاستباقية والمعطيات الدقيقة.",
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a href="#diagnostic" className="mckinsey-btn-primary shadow-sm">
                    <span>{t("Lancer le Diagnostic Décisionnel", "بدء التشخيص التوجيهي")}</span>
                    <ArrowRight size={16} />
                  </a>
                  <a href="#trajectoires" className="mckinsey-btn-outline">
                    <span>{t("Explorer les 5 Filières d'Excellence", "اكتشف المسارات الـ 5 الكبرى")}</span>
                  </a>
                  {demoAvailable && (
                    <button
                      onClick={onDemo}
                      disabled={busy}
                      className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#0056b3] hover:underline px-3 py-2 cursor-pointer"
                    >
                      <Sparkles size={16} />
                      <span>{t("Dossier Démo (Imane B.) →", "ملف تجريبي فوري ←")}</span>
                    </button>
                  )}
                </div>

                {/* Editorial Byline */}
                <div className="flex items-center gap-6 mt-10 pt-6 border-t border-[#edf2f7] text-[12px] text-[#718096]">
                  <div>
                    <span className="font-semibold text-[#2d3748] block">
                      {t("Observatoire des Formations Supérieures", "مرصد الدراسات العليا")}
                    </span>
                    <span>{t("Rabat & Casablanca · Édition 2026", "الرباط والدار البيضاء")}</span>
                  </div>
                  <span className="text-[#cbd5e0]">•</span>
                  <div>
                    <span className="font-semibold text-[#2d3748] block">
                      {t("Temps de consultation", "مدة القراءة")}
                    </span>
                    <span>{t("6 min d’analyse stratégique", "6 دقائق قراءة مركزة")}</span>
                  </div>
                </div>
              </div>

              {/* Right Visual & Key Benchmark Card (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-[#051c2c] text-white p-8 sm:p-10 rounded-sm shadow-xl relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-[#0056b3]/20 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex items-center justify-between mb-6 border-b border-[#1e3a5f] pb-4">
                    <span className="text-[11px] uppercase font-bold tracking-widest text-[#60a5fa]">
                      {t("Indicateurs Stratégiques 2026", "مؤشرات استراتيجية")}
                    </span>
                    <span className="text-[11px] text-slate-400">CampusPath Index</span>
                  </div>

                  <div className="space-y-6">
                    <div className="border-b border-[#1e3a5f] pb-5">
                      <div className="text-[34px] sm:text-[40px] font-editorial font-medium text-white leading-none">
                        +120
                      </div>
                      <div className="text-[13px] text-slate-300 font-semibold mt-1">
                        {t("Formations d'excellence cartographiées", "تخصص ومسار عالي الدقة")}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {t("CPGE, Écoles d'Ingénieurs, Santé, Management et Universités.", "الأقسام التحضيرية، الهندسة، الصحة والتسيير.")}
                      </div>
                    </div>

                    <div className="border-b border-[#1e3a5f] pb-5">
                      <div className="text-[34px] sm:text-[40px] font-editorial font-medium text-[#60a5fa] leading-none">
                        100%
                      </div>
                      <div className="text-[13px] text-slate-300 font-semibold mt-1">
                        {t("Méthodologie fondée sur les critères officiels", "مطابقة تامة للمعايير الرسمية")}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {t("Seuils de présélection, coefficients des matières et dates limites vérifiées.", "عتبات الانتقاء والمعاملات المعتمدة رسمياً.")}
                      </div>
                    </div>

                    <div>
                      <div className="text-[34px] sm:text-[40px] font-editorial font-medium text-white leading-none">
                        0
                      </div>
                      <div className="text-[13px] text-slate-300 font-semibold mt-1">
                        {t("Algorithme boîte noire ou orientation opaque", "شفافية كاملة بدون خوارزميات غامضة")}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {t("Chaque recommandation est motivée avec ses prérequis et alternatives.", "كل توجيه معلل بالحجج والبدائل الواضحة.")}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[#1e3a5f] flex items-center justify-between">
                    <button
                      onClick={() => onStart("register")}
                      className="text-[13px] text-white font-semibold flex items-center gap-2 hover:text-[#60a5fa] transition-colors"
                    >
                      <span>{t("Créer mon dossier d’admission", "فتح ملف الترشيح الآن")}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 2: MCKINSEY ASYMMETRICAL EDITORIAL GRID (INSIGHTS) */}
        {/* ================================================================= */}
        <section id="insights" className="py-16 sm:py-24 bg-[#f8fafc] border-b border-[#e2e8f0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#d2d8df]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-[2px] bg-[#0056b3]"></span>
                  <span className="mckinsey-kicker">
                    {t("Analyses & Décryptages", "تحليلات ودراسات")}
                  </span>
                </div>
                <h2 className="text-[28px] sm:text-[36px] font-editorial font-medium text-[#051c2c]">
                  {t("Insights & Perspectives Académiques", "أبرز التحليلات والمقالات المتخصصة")}
                </h2>
                <p className="text-[15px] text-[#4a5568] mt-1">
                  {t(
                    "Études sectorielles et repères opérationnels pour réussir chaque étape de candidature.",
                    "دراسات معمقة لتوجيه القرارات الأكاديمية والمهنية بكل ثقة.",
                  )}
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-[12px] font-semibold transition-all rounded-sm cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#051c2c] text-white"
                        : "bg-white text-[#4a5568] hover:bg-slate-100 border border-[#e2e8f0]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Asymmetrical 3-Column Editorial Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Feature Article (8 cols) */}
              {featuredArticle && (
                <div className="lg:col-span-7 bg-white border border-[#e2e8f0] p-8 sm:p-10 shadow-sm mckinsey-hover-lift flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-bold tracking-wider text-[#0056b3] uppercase">
                        {featuredArticle.categoryTag}
                      </span>
                      <span className="text-[12px] text-[#718096]">
                        {featuredArticle.readTime}
                      </span>
                    </div>

                    <h3 className="mckinsey-card-headline mb-4 text-[#051c2c] hover:text-[#0056b3] transition-colors cursor-pointer">
                      {locale === "fr" ? featuredArticle.title : featuredArticle.arTitle}
                    </h3>

                    <p className="text-[15px] text-[#4a5568] leading-relaxed mb-6">
                      {locale === "fr" ? featuredArticle.excerpt : featuredArticle.arExcerpt}
                    </p>

                    <div className="bg-[#f8fafc] border-l-2 border-[#0056b3] p-4 my-6 text-[13px] text-[#334155] italic">
                      {t(
                        "« La sélection en école d'ingénieurs ne récompense pas uniquement l'accumulation de connaissances brutes, mais l'aptitude démontrée à modéliser des problématiques complexes et à persévérer face à la difficulté. »",
                        "« الانتقاء في مدارس المهندسين لا يقتصر على مراكمة المعارف، بل يعتمد على القدرة على التفكير المنطقي والصمود أمام التحديات. »",
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#edf2f7] flex items-center justify-between">
                    <span className="text-[12px] text-[#718096]">
                      {featuredArticle.date} · {t("Publication CampusPath", "منشور كامبوس باث")}
                    </span>
                    <button
                      onClick={() => onStart("register")}
                      className="text-[13px] font-semibold text-[#0056b3] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t("Lire l’analyse complète", "قراءة التحليل كاملاً")}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Right Stack of Secondary Insights (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {secondaryArticles.slice(0, 3).map((article) => (
                  <div
                    key={article.id}
                    className="bg-white border border-[#e2e8f0] p-6 shadow-sm mckinsey-hover-lift"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="font-bold tracking-wider text-[#0056b3] uppercase">
                        {article.categoryTag}
                      </span>
                      <span className="text-[#718096]">{article.readTime}</span>
                    </div>

                    <h4 className="mckinsey-small-headline mb-2 text-[#051c2c] hover:text-[#0056b3] transition-colors cursor-pointer">
                      {locale === "fr" ? article.title : article.arTitle}
                    </h4>

                    <p className="text-[13px] text-[#4a5568] line-clamp-2 leading-normal mb-4">
                      {locale === "fr" ? article.excerpt : article.arExcerpt}
                    </p>

                    <div className="flex items-center justify-between text-[12px] pt-3 border-t border-[#f1f5f9]">
                      <span className="text-[#94a3b8]">{article.date}</span>
                      <button
                        onClick={() => onStart("register")}
                        className="text-[#0056b3] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{t("Consulter", "اطلاع")}</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 3: THE MCKINSEY INTERACTIVE DECISION DIAGNOSTIC TOOL */}
        {/* ================================================================= */}
        <section id="diagnostic" className="py-16 sm:py-24 bg-white border-b border-[#e2e8f0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-[2px] bg-[#0056b3]"></span>
                <span className="mckinsey-kicker">
                  {t("Outil Décisionnel Propriétaire", "أداة اتخاذ القرار التوجيهي")}
                </span>
              </div>
              <h2 className="text-[28px] sm:text-[38px] font-editorial font-medium text-[#051c2c]">
                {t(
                  "Diagnostic Stratégique d’Orientation & d’Admissibilité",
                  "التشخيص الاستراتيجي للتوجيه وفرص القبول",
                )}
              </h2>
              <p className="text-[16px] text-[#4a5568] mt-2">
                {t(
                  "Configurez vos critères académiques et vos aspirations pour générer instantanément une recommandation de trajectoire, avec indicateurs de sélectivité et plan d'action immédiat.",
                  "حدد مستواك الدراسي وطموحاتك للحصول فوراً على مسار موجه، مع تقييم درجة الانتقاء وخطة العمل.",
                )}
              </p>
            </div>

            {/* Diagnostic Interactive Container */}
            <div className="bg-[#f8fafc] border border-[#d2d8df] p-6 sm:p-10 rounded-sm shadow-sm">
              {/* Step Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Step 1: Statut */}
                <div className="bg-white p-5 border border-[#e2e8f0] rounded-sm">
                  <label className="block text-[11px] font-bold text-[#0056b3] uppercase tracking-wider mb-2">
                    {t("1. Statut Actuel", "1. المستوى الحالي")}
                  </label>
                  <select
                    value={diagStatus}
                    onChange={(e) => setDiagStatus(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] text-[13px] text-[#0f172a] p-2.5 rounded-sm focus:border-[#0056b3] focus:outline-none"
                  >
                    <option value="lycee">{t("Lycée (Tronc Commun / 1ère)", "الجدع المشترك / الأولى باك")}</option>
                    <option value="terminale">{t("Terminale (Baccalauréat 2026)", "الثانية باكالوريا 2026")}</option>
                    <option value="bac2">{t("Bac+1 / Bac+2 (CPGE, BTS, EST, Deug)", "سنتين بعد الباك (أقسام تحضيرية...)")}</option>
                    <option value="licence">{t("Licence / Bac+3 (Université)", "الإجازة الجامعية")}</option>
                  </select>
                </div>

                {/* Step 2: Domaine d'Ambition */}
                <div className="bg-white p-5 border border-[#e2e8f0] rounded-sm">
                  <label className="block text-[11px] font-bold text-[#0056b3] uppercase tracking-wider mb-2">
                    {t("2. Pôle d'Excellence", "2. مجال الطموح")}
                  </label>
                  <select
                    value={diagDomain}
                    onChange={(e) => setDiagDomain(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] text-[13px] text-[#0f172a] p-2.5 rounded-sm focus:border-[#0056b3] focus:outline-none"
                  >
                    <option value="ingenierie">{t("Ingénierie, Tech & Sciences Dures", "الهندسة، التكنولوجيا والعلوم")}</option>
                    <option value="sante">{t("Médecine, Pharmacie & Métiers Santé", "الطب، الصيدلة والعلوم الصحية")}</option>
                    <option value="management">{t("Management, Finance & Stratégie", "التسيير، المالية وإدارة الأعمال")}</option>
                    <option value="droit_universite">{t("Sciences Humaines, Droit & Recherche", "القانون، العلوم الإنسانية والبحث")}</option>
                  </select>
                </div>

                {/* Step 3: Priorité Stratégique */}
                <div className="bg-white p-5 border border-[#e2e8f0] rounded-sm">
                  <label className="block text-[11px] font-bold text-[#0056b3] uppercase tracking-wider mb-2">
                    {t("3. Priorité Décisionnelle", "3. الأولوية الاستراتيجية")}
                  </label>
                  <select
                    value={diagPriority}
                    onChange={(e) => setDiagPriority(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] text-[13px] text-[#0f172a] p-2.5 rounded-sm focus:border-[#0056b3] focus:outline-none"
                  >
                    <option value="prestige">{t("Prestige & Sélectivité Maximale", "التميز وأعلى درجات الانتقاء")}</option>
                    <option value="insertion">{t("Insertion Professionnelle Rapide", "الإدماج المهني السريع")}</option>
                    <option value="recherche">{t("Approfondissement Scientifique / Thèse", "البحث العلمي والأكاديمي")}</option>
                  </select>
                </div>

                {/* Step 4: Mobilité */}
                <div className="bg-white p-5 border border-[#e2e8f0] rounded-sm">
                  <label className="block text-[11px] font-bold text-[#0056b3] uppercase tracking-wider mb-2">
                    {t("4. Horizon Géographique", "4. النطاق الجغرافي")}
                  </label>
                  <select
                    value={diagMobility}
                    onChange={(e) => setDiagMobility(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] text-[13px] text-[#0f172a] p-2.5 rounded-sm focus:border-[#0056b3] focus:outline-none"
                  >
                    <option value="maroc">{t("Maroc Exclusivement", "المغرب فقط")}</option>
                    <option value="maroc_international">{t("Maroc + Passerelle France/Europe", "المغرب + إمكانية الدراسة بالخارج")}</option>
                    <option value="international">{t("International Prioritaire (EEF)", "الدراسة الدولية أولاً")}</option>
                  </select>
                </div>
              </div>

              {/* Instant Strategic Result Card */}
              <div className="bg-white border-2 border-[#0056b3] p-6 sm:p-8 rounded-sm shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4 mb-6">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-[#0056b3]">
                    <Sparkles size={16} />
                    <span>{t("RECOMMANDATION STRATÉGIQUE CAMPUSPATH & CO", "التوصية الاستراتيجية")}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[#eef5fc] text-[#0056b3] text-[12px] font-semibold px-3 py-1 rounded-sm">
                    <span>{t("Indice de Sélectivité :", "درجة الانتقاء:")}</span>
                    <span className="font-bold">{currentRec.selectivity}</span>
                  </div>
                </div>

                <h3 className="text-[22px] sm:text-[26px] font-editorial font-medium text-[#051c2c] mb-2">
                  {currentRec.title}
                </h3>
                <p className="text-[15px] text-[#4a5568] leading-relaxed mb-6">
                  {currentRec.sub}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#f1f5f9] text-[13px]">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                      {t("Prérequis Clés", "الشروط الأساسية")}
                    </span>
                    <p className="text-[#334155]">{currentRec.prerequisites}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                      {t("Échéances Critiques", "المواعيد الحاسمة")}
                    </span>
                    <p className="text-[#334155]">{currentRec.milestone}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                      {t("Facteur de Vigilance", "نقطة اليقظة")}
                    </span>
                    <p className="text-[#991b1b] font-medium">{currentRec.riskFactor}</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4">
                  <span className="text-[12px] text-[#64748b]">
                    {t("Vous pouvez sauvegarder cette trajectoire et auditer vos notes dans votre espace.", "يمكنك حفظ هذا المسار ومطابقة نقطك في فضاء الترشيح.")}
                  </span>
                  <div className="flex items-center gap-3">
                    {demoAvailable && (
                      <button
                        onClick={onDemo}
                        disabled={busy}
                        className="mckinsey-btn-outline text-[13px] py-2 px-4"
                      >
                        {t("Tester en mode Démo", "تجربة الملف التجريبي")}
                      </button>
                    )}
                    <button
                      onClick={() => onStart("register")}
                      className="mckinsey-btn-primary text-[13px] py-2 px-4 shadow-sm"
                    >
                      <span>{t("Activer mon Dossier Candidat", "تفعيل ملف الترشيح الآن")}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 4: THE 5 STRATEGIC FRAMEWORKS (TRAJECTORIES) */}
        {/* ================================================================= */}
        <section id="trajectoires" className="py-16 sm:py-24 bg-[#ffffff] border-b border-[#e2e8f0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#d2d8df]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-[2px] bg-[#0056b3]"></span>
                  <span className="mckinsey-kicker">
                    {t("Architecture des Parcours", "هندسة المسارات الدراسية")}
                  </span>
                </div>
                <h2 className="text-[28px] sm:text-[36px] font-editorial font-medium text-[#051c2c]">
                  {t("Les 5 Trajectoires Majeures d'Excellence", "المسارات الـ 5 الكبرى للتميز الأكاديمي")}
                </h2>
                <p className="text-[15px] text-[#4a5568] mt-1">
                  {t(
                    "Une cartographie analytique des voies d'accès sélectives, des débouchés et des exigences de candidature.",
                    "خريطة مفصلة للمسالك الانتقائية، المؤسسات، ومفاتيح التفوق الأكاديمي.",
                  )}
                </p>
              </div>
            </div>

            {/* Framework Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRAJECTORIES.map((traj) => (
                <div
                  key={traj.id}
                  className="bg-[#ffffff] border border-[#d2d8df] p-7 rounded-sm shadow-sm mckinsey-hover-lift flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-4">
                      <span className="font-editorial text-[24px] font-semibold text-[#0056b3]">
                        {traj.number}
                      </span>
                      <span className="px-2.5 py-1 bg-[#f1f5f9] text-[#475569] font-semibold rounded-sm">
                        {traj.duration}
                      </span>
                    </div>

                    <h3 className="text-[20px] font-editorial font-medium text-[#051c2c] mb-3 leading-snug">
                      {locale === "fr" ? traj.name : traj.arName}
                    </h3>

                    <p className="text-[13px] text-[#4a5568] mb-4">
                      <strong className="text-[#1e293b]">{t("Profil cible : ", "الفئة المستهدفة: ")}</strong>
                      {traj.target}
                    </p>

                    <div className="my-4 pt-4 border-t border-[#f1f5f9]">
                      <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-2">
                        {t("Établissements de référence", "المؤسسات المرجعية")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {traj.institutions.map((inst) => (
                          <span
                            key={inst}
                            className="text-[11px] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-0.5 text-[#334155] rounded-sm"
                          >
                            {inst}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#f1f5f9]">
                    <div className="text-[12px] text-[#334155] mb-4">
                      <strong className="text-[#0056b3] block mb-0.5">
                        {t("Facteur de succès critique :", "مفتاح النجاح الأساسي:")}
                      </strong>
                      {locale === "fr" ? traj.keyFactor : traj.arKeyFactor}
                    </div>

                    <button
                      onClick={() => onStart("register")}
                      className="w-full text-center py-2 px-3 border border-[#cbd5e1] text-[12px] font-semibold text-[#051c2c] hover:bg-[#051c2c] hover:text-white transition-colors rounded-sm cursor-pointer"
                    >
                      {t("Évaluer mon admissibilité sur ce parcours →", "تقييم حظوظ القبول ←")}
                    </button>
                  </div>
                </div>
              ))}

              {/* Dossier Preparation Card in the Grid */}
              <div className="bg-[#051c2c] text-white p-7 rounded-sm shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-[24px] font-editorial font-semibold text-[#60a5fa] mb-4">
                    +
                  </div>
                  <h3 className="text-[22px] font-editorial font-medium text-white mb-3 leading-snug">
                    {t(
                      "Votre Trajectoire Personnalisée & Audit Documentaire",
                      "مسارك المخصص وتدقيق ملف الترشيح",
                    )}
                  </h3>
                  <p className="text-[13px] text-slate-300 leading-relaxed mb-6">
                    {t(
                      "Chaque candidat possède un profil singulier. Notre plateforme intègre un moteur de calcul de moyennes pondérées, un audit des pièces justificatives et des modèles de lettres de motivation argumentées.",
                      "كل تلميذ له خصوصيته. توفر المنصة محركاً لحساب المعدلات ومراجعة الوثائق لضمان ملف ترشيح مقنع.",
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => onStart("register")}
                    className="w-full mckinsey-btn-white text-[13px] py-2.5 justify-center"
                  >
                    <span>{t("Créer mon dossier gratuit", "إنشاء ملفي مجاناً")}</span>
                    <ArrowRight size={14} />
                  </button>
                  {demoAvailable && (
                    <button
                      onClick={onDemo}
                      disabled={busy}
                      className="w-full text-center py-2 text-[12px] text-slate-300 hover:text-white underline cursor-pointer"
                    >
                      {t("Explorer la démo complète sans compte", "تجربة المنصة مباشرة")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 5: MCKINSEY SIGNATURE PULL-QUOTE & STATS */}
        {/* ================================================================= */}
        <section className="py-20 bg-[#051c2c] text-white border-b border-[#0a2540] relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 text-center relative z-10">
            <span className="font-editorial text-[72px] sm:text-[90px] text-[#0056b3] leading-none block select-none">
              “
            </span>
            <blockquote className="font-editorial text-[24px] sm:text-[34px] font-normal leading-snug text-[#f8fafc] -mt-8 mb-8 max-w-4xl mx-auto">
              {t(
                "Dans une économie mondialisée en pleine reconfiguration, l’orientation n’est plus un simple choix de filière : c’est un investissement stratégique déterminant pour les quarante prochaines années. La méthode, la rigueur analytique et la lucidité font la différence.",
                "في عالم سريع التحول، لم يعد التوجيه مجرد اختيار دراسي، بل هو استثمار استراتيجي للسنوات الأربعين القادمة. المنهجية، الدقة والوضوح هي ما يصنع الفارق.",
              )}
            </blockquote>
            <div className="text-[13px] text-slate-400 uppercase tracking-widest font-semibold">
              {t(
                "Cabinet CampusPath & Company · Conseil en Stratégie d'Orientation",
                "كامبوس باث آند كومباني · الاستشارة والتوجيه الاستراتيجي",
              )}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 6: ADMISSIONS ENGINE (4 CAPABILITIES PILLARS) */}
        {/* ================================================================= */}
        <section id="dossier-admissions" className="py-16 sm:py-24 bg-[#f8fafc] border-b border-[#e2e8f0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-[2px] bg-[#0056b3]"></span>
                <span className="mckinsey-kicker">
                  {t("Capacités & Outils Opérationnels", "قدرات وأدوات المنصة")}
                </span>
              </div>
              <h2 className="text-[28px] sm:text-[36px] font-editorial font-medium text-[#051c2c]">
                {t(
                  "Une Préparation d'Admission Révélant le Plein Potentiel du Candidat",
                  "إعداد شامل ومحكم لملفات الترشيح",
                )}
              </h2>
              <p className="text-[16px] text-[#4a5568] mt-2">
                {t(
                  "Notre plateforme intègre l'ensemble des modules nécessaires pour transformer une ambition scolaire en dossier d'admission solide et vérifié.",
                  "توفر المنصة كل الأدوات لمواكبة التلميذ من حساب النقط إلى المقابلة الشفوية.",
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="bg-white border border-[#e2e8f0] p-6 rounded-sm shadow-sm">
                <div className="w-10 h-10 bg-[#eef5fc] text-[#0056b3] rounded flex items-center justify-center mb-4">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-[17px] font-editorial font-medium text-[#051c2c] mb-2">
                  {t("Diagnostic Académique", "التشخيص الأكاديمي")}
                </h3>
                <p className="text-[13px] text-[#4a5568] leading-relaxed">
                  {t(
                    "Calcul rigoureux des moyennes pondérées par matière et par semestre, identification des points forts et analyse de progression.",
                    "حساب دقيق للمعدلات المرجحة بالمعاملات وتحديد مكامن القوة والتطور.",
                  )}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white border border-[#e2e8f0] p-6 rounded-sm shadow-sm">
                <div className="w-10 h-10 bg-[#eef5fc] text-[#0056b3] rounded flex items-center justify-center mb-4">
                  <FileCheck size={20} />
                </div>
                <h3 className="text-[17px] font-editorial font-medium text-[#051c2c] mb-2">
                  {t("Audit de Conformité", "تدقيق الوثائق")}
                </h3>
                <p className="text-[13px] text-[#4a5568] leading-relaxed">
                  {t(
                    "Contrôle systématique des pièces obligatoires (relevés de notes, baccalauréat, attestations de langue) pour éviter tout rejet administratif.",
                    "مراقبة الوثائق المطلوبة لتفادي أي خطأ إداري قد يؤدي لرفض الملف.",
                  )}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white border border-[#e2e8f0] p-6 rounded-sm shadow-sm">
                <div className="w-10 h-10 bg-[#eef5fc] text-[#0056b3] rounded flex items-center justify-center mb-4">
                  <FileText size={20} />
                </div>
                <h3 className="text-[17px] font-editorial font-medium text-[#051c2c] mb-2">
                  {t("Générateur d’Artefacts", "صياغة الوثائق")}
                </h3>
                <p className="text-[13px] text-[#4a5568] leading-relaxed">
                  {t(
                    "Modèles académiques de CV normés et génération de lettres de motivation argumentées selon les exigences spécifiques de chaque école.",
                    "نماذج سيرة ذاتية ورسائل تحفيزية متوافقة مع خصوصيات كل مدرسة وتخصص.",
                  )}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white border border-[#e2e8f0] p-6 rounded-sm shadow-sm">
                <div className="w-10 h-10 bg-[#eef5fc] text-[#0056b3] rounded flex items-center justify-center mb-4">
                  <UserCheck size={20} />
                </div>
                <h3 className="text-[17px] font-editorial font-medium text-[#051c2c] mb-2">
                  {t("Simulateur d’Entretien", "محاكاة المقابلة الشفوية")}
                </h3>
                <p className="text-[13px] text-[#4a5568] leading-relaxed">
                  {t(
                    "Banque de questions officielles posées par les jurys de concours avec grille d'auto-évaluation et axes d'amélioration argumentaire.",
                    "أسئلة نموذجية لمباريات الولوج مع شبكة تقييم لتعزيز مهارات الإقناع الشفوي.",
                  )}
                </p>
              </div>
            </div>

            {/* Bottom Action Strip */}
            <div className="mt-12 bg-[#051c2c] text-white p-8 sm:p-10 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-[22px] font-editorial font-medium text-white mb-2">
                  {t("Prêt à structurer votre avenir académique ?", "جاهز لبناء مسارك الأكاديمي بثقة؟")}
                </h3>
                <p className="text-[14px] text-slate-300">
                  {t(
                    "Créez votre compte en 2 minutes ou lancez une session d'essai immédiate sans engagement.",
                    "أنشئ حسابك في دقيقتين أو اكتشف التجربة فوراً.",
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {demoAvailable && (
                  <button
                    onClick={onDemo}
                    disabled={busy}
                    className="mckinsey-btn-outline text-white border-white hover:bg-white/10"
                  >
                    <span>{busy ? t("Chargement...", "جاري الفتح...") : t("Essayer la Démo", "تجربة فورية")}</span>
                  </button>
                )}
                <button
                  onClick={() => onStart("register")}
                  className="mckinsey-btn-primary shadow-md"
                >
                  <span>{t("Créer mon Profil Candidat", "فتح حسابي مجاناً")}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 7: CABINET METHODOLOGY & ETHICS */}
        {/* ================================================================= */}
        <section id="methodologie" className="py-16 sm:py-20 bg-white border-b border-[#e2e8f0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <span className="mckinsey-kicker block mb-2">{t("Indépendance", "الاستقلالية")}</span>
                <h3 className="text-[19px] font-editorial font-medium text-[#051c2c] mb-3">
                  {t("Totalement Neutre & Transparent", "حياد تام وشفافية")}
                </h3>
                <p className="text-[14px] text-[#4a5568] leading-relaxed">
                  {t(
                    "CampusPath & Company est un outil d'aide à la décision totalement indépendant. Aucune école ni université ne rémunère notre cabinet pour être recommandée. Nos conseils reposent uniquement sur l'adéquation profil-filière.",
                    "منصة مستقلة تماماً، لا تتقاضى أي مقابل لتفضيل مؤسسة على أخرى. توصياتنا تعتمد حصراً على معطيات التلميذ.",
                  )}
                </p>
              </div>

              <div>
                <span className="mckinsey-kicker block mb-2">{t("Responsabilité", "المسؤولية")}</span>
                <h3 className="text-[19px] font-editorial font-medium text-[#051c2c] mb-3">
                  {t("Le Choix Reste le Vôtre", "القرار ملكك أنت")}
                </h3>
                <p className="text-[14px] text-[#4a5568] leading-relaxed">
                  {t(
                    "Nos diagnostics constituent des repères et des simulations stratégiques, jamais des garanties d'admission. L'étudiant et sa famille conservent le libre choix de leurs candidatures et de leurs priorités.",
                    "التشخيص يقدم مسارات وتوجيهات للمساعدة، ويبقى القرار النهائي دائماً للتلميذ وأسرته وفق قناعاتهم.",
                  )}
                </p>
              </div>

              <div>
                <span className="mckinsey-kicker block mb-2">{t("Confidentialité", "حماية المعطيات")}</span>
                <h3 className="text-[19px] font-editorial font-medium text-[#051c2c] mb-3">
                  {t("Protection Rigoureuse des Données", "سرية وأمان البيانات")}
                </h3>
                <p className="text-[14px] text-[#4a5568] leading-relaxed">
                  {t(
                    "Vos notes, documents et réponses restent votre propriété exclusive. Aucune candidature n'est envoyée à des tiers à votre insu et aucune donnée personnelle n'est commercialisée.",
                    "بياناتك، شواهدك ونقطك ملك لك وحدك، ولا يتم مشاركتها مع أي جهة خارجية أو استعمالها تجارياً.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================================= */}
      {/* SECTION 8: MCKINSEY GLOBAL DARK NAVY FOOTER */}
      {/* ================================================================= */}
      <footer className="bg-[#051c2c] text-[#94a3b8] pt-16 pb-12 border-t border-[#0a2540]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1e293b]">
            {/* Column 1: Brand & Presentation */}
            <div className="lg:col-span-2">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-editorial text-[24px] font-medium tracking-tight text-white">
                  CampusPath
                </span>
                <span className="font-editorial italic text-[18px] text-[#60a5fa] font-normal ml-1">
                  & Company
                </span>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-sm mb-6">
                {t(
                  "Cabinet d'orientation stratégique et d'ingénierie académique au service de l'excellence des élèves et étudiants au Maroc et à l'international.",
                  "المؤسسة الرائدة في الاستشارة والتوجيه الأكاديمي للتميز الدراسي بالمغرب والخارج.",
                )}
              </p>
              <div className="text-[11px] text-slate-500">
                {t(
                  "Un service d'orientation indépendant. Non affilié à Campus France ni au Ministère de l'Éducation Nationale.",
                  "خدمة توجيه مستقلة وغير تابعة لكامبوس فرانس أو الوزارة الوصية.",
                )}
              </div>
            </div>

            {/* Column 2: Analyses & Rapports */}
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-white mb-4">
                {t("Analyses & Insights", "الدراسات والتقارير")}
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                <li>
                  <a href="#insights" className="hover:text-white transition-colors">
                    {t("Baromètre Grandes Écoles 2026", "تقرير المدارس الكبرى 2026")}
                  </a>
                </li>
                <li>
                  <a href="#insights" className="hover:text-white transition-colors">
                    {t("Réforme des Études Médicales", "إصلاح دراسات الطب")}
                  </a>
                </li>
                <li>
                  <a href="#insights" className="hover:text-white transition-colors">
                    {t("Guide Concours CPGE & CNC", "دليل مباريات الأقسام التحضيرية")}
                  </a>
                </li>
                <li>
                  <a href="#insights" className="hover:text-white transition-colors">
                    {t("Procédure Campus France / EEF", "دليل مسطرة كامبوس فرانس")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Filières d'Excellence */}
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-white mb-4">
                {t("Filières d'Excellence", "المسارات والتخصصات")}
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                <li>
                  <a href="#trajectoires" className="hover:text-white transition-colors">
                    {t("Écoles d'Ingénieurs d'État", "مدارس المهندسين الوطنية")}
                  </a>
                </li>
                <li>
                  <a href="#trajectoires" className="hover:text-white transition-colors">
                    {t("Facultés de Médecine (FMP/FMD)", "كليات الطب والصيدلة")}
                  </a>
                </li>
                <li>
                  <a href="#trajectoires" className="hover:text-white transition-colors">
                    {t("Management (ISCAE & ENCG)", "التسيير وإدارة الأعمال")}
                  </a>
                </li>
                <li>
                  <a href="#trajectoires" className="hover:text-white transition-colors">
                    {t("Universités & Licences d'Excellence", "إجازات التميز الجامعي")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Outils & Démarches */}
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-white mb-4">
                {t("Outils Décisionnels", "الأدوات والخدمات")}
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                <li>
                  <a href="#diagnostic" className="hover:text-white transition-colors">
                    {t("Diagnostic Décisionnel", "التشخيص التوجيهي")}
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => onStart("login")}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {t("Espace Candidat Personnel", "فضاء المترشح الشخصي")}
                  </button>
                </li>
                <li>
                  <a href="#dossier-admissions" className="hover:text-white transition-colors">
                    {t("Audit des Pièces et Relevés", "تدقيق الشواهد والنقط")}
                  </a>
                </li>
                {demoAvailable && (
                  <li>
                    <button
                      onClick={onDemo}
                      className="text-[#60a5fa] hover:underline text-left cursor-pointer"
                    >
                      {t("Accès Session Démo Immédiate", "ولوج فوري لحساب تجريبي")}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom Legal Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[12px] text-slate-500 gap-4">
            <div>
              © 2026 CampusPath & Company. {t("Tous droits réservés.", "جميع الحقوق محفوظة.")}
            </div>
            <div className="flex items-center gap-6">
              <a href="#methodologie" className="hover:text-slate-400 transition-colors">
                {t("Confidentialité & Déontologie", "الخصوصية والميثاق")}
              </a>
              <a href="#methodologie" className="hover:text-slate-400 transition-colors">
                {t("Mentions Légales", "الشروط القانونية")}
              </a>
              <button
                onClick={toggleLocale}
                className="text-[#60a5fa] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Languages size={12} />
                <span>{locale === "fr" ? "الدارجة" : "Français"}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
