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

/** Date de dernière relecture des portails officiels cités dans ce catalogue. */
export const ORIENTATION_REVIEWED_AT = "2026-09-16";

const ENSSUP: OrientationLink = { label: "Ministère de l’Enseignement supérieur", url: "https://www.enssup.gov.ma" };
const CURSUSSUP: OrientationLink = { label: "CursusSup, orientation et inscription post-bac", url: "https://www.cursussup.gov.ma" };
const OFPPT: OrientationLink = { label: "OFPPT, formation professionnelle", url: "https://www.ofppt.ma" };
const TAKWINE: OrientationLink = { label: "Takwine, préinscription OFPPT", url: "https://takwine.ofppt.ma" };
const ONOUSC: OrientationLink = { label: "ONOUSC, bourses et cité universitaire", url: "https://www.onousc.ma" };
const ANAPEC: OrientationLink = { label: "ANAPEC, métiers et emploi", url: "https://www.anapec.org" };

/**
 * Chaque parcours suit la même colonne vertébrale en cinq étapes.
 * Les identifiants d’étape sont stables, la progression enregistrée s’appuie dessus.
 */
export const orientationRoadmaps: OrientationRoadmap[] = [
  {
    id: "informatique",
    category: "tech",
    title: { fr: "Informatique et numérique", ary: "L2informatique w rre9mi" },
    summary: {
      fr: "Écrire du code, faire tenir des systèmes debout, traiter des données. Un domaine où l’on apprend beaucoup par la pratique et où les portes d’entrée sont variées.",
      ary: "Tketbi code, t7ella systèmes, tkhdem 3la data. Majal fih t3ellom b tatbi9 w bibane dyal ddkhoul bzaf.",
    },
    levels: ["lycee", "bac", "bac2", "licence", "reorientation"],
    interests: ["technologie", "logique", "creer"],
    duration: { fr: "De deux ans pour un diplôme technique à cinq ans pour un cycle ingénieur.", ary: "Men 3amayn l diplôme technique 7tta l 5 snin f cycle ingénieur." },
    cost: { fr: "Faible dans le public, très variable dans le privé. Prévois surtout le logement, le transport et un ordinateur correct.", ary: "Rkhis f public, kaytbeddel bzaf f privé. Fekker f sskna, transport w chi ordinateur mezyan." },
    careers: [
      { fr: "Développeur logiciel ou web", ary: "Développeur logiciel wla web" },
      { fr: "Administrateur systèmes et réseaux", ary: "Administrateur systèmes w réseaux" },
      { fr: "Analyste de données", ary: "Analyste dyal data" },
      { fr: "Technicien support et infrastructure", ary: "Technicien support w infrastructure" },
    ],
    strengths: [
      { fr: "Tu peux progresser seul entre deux cours, avec des projets et des exercices.", ary: "T9der tt9eddem b rassek bin dourouss, b projets w tamarin." },
      { fr: "Le travail se montre. Un projet fini vaut souvent mieux qu’un long discours.", ary: "Lkhedma kattbane. Projet kaml khir men hadra twila." },
      { fr: "Les compétences se transfèrent d’un secteur à l’autre, de la banque à l’industrie.", ary: "L compétences kaytn9lo men secteur l akhor, men lbanka 7tta l industrie." },
    ],
    watchouts: [
      { fr: "Le rythme de mise à jour est réel. Il faut aimer réapprendre régulièrement.", ary: "Kolchi kaytbeddel bzerba. Khassek tebghi t3awed tt3ellem." },
      { fr: "Beaucoup de temps assis devant un écran, souvent seul sur un problème.", ary: "We9t bzaf 9oddam écran, w bo7dek m3a chi mochkil." },
      { fr: "Les intitulés de formations se ressemblent. Regarde le programme réel, pas le nom.", ary: "Smiyat dyal formations kaychebho. Chouf programme 7a9i9i, machi smiya." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Voir ce qu’il y a vraiment derrière le mot", ary: "Chouf ach kayn mora had lkelma" },
        detail: {
          fr: "L’informatique n’est pas un seul métier. Développement, réseaux, données, sécurité, support. Ces branches demandent des goûts différents. Avant de choisir une formation, mets des noms précis sur ce qui t’attire.",
          ary: "L2informatique machi khedma we7da. Développement, réseaux, data, sécurité, support. Kol branche bghat chi 7aja okhra. 9bel ma tkhtar formation, 3ref ach bezzaf kay3ejbek.",
        },
        actions: [
          { fr: "Note trois activités concrètes qui t’attirent, pas trois intitulés de diplômes.", ary: "Kteb 3 7wayej 3amaliya kay3ejbouk, machi 3 smiyat dyal diplômes." },
          { fr: "Regarde une journée type de deux métiers différents du domaine.", ary: "Chouf nhar 3adi dyal jouj khedmat mokhtalfin f had majal." },
          { fr: "Repère les fiches métiers officielles plutôt que les vidéos de promotion.", ary: "9elleb 3la fiches métiers rasmiyin, machi vidéos dyal promotion." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Vérifier les conditions d’accès réelles", ary: "T2ekked men chorot l9obol l7a9i9iyin" },
        detail: {
          fr: "Les seuils, les concours et les dates changent chaque année et varient d’un établissement à l’autre. Ce qui était vrai l’an dernier ne l’est pas forcément cette année. Va chercher l’avis officiel de l’année en cours.",
          ary: "Seuils, concours w tawarikh kaytbeddlo kol 3am w kaykhtalfo men mo2assassa l okhra. Lli kan 3am lli fat momkin ma b9ach. 9elleb 3la l2i3lan rasmi dyal had l3am.",
        },
        actions: [
          { fr: "Ouvre la plateforme nationale et lis les conditions de la filière visée.", ary: "7ell lmanassa lwataniya w 9ra chorot dyal chou3ba lli bghiti." },
          { fr: "Note les dates limites dans ton calendrier, avec une semaine de marge.", ary: "Kteb tawarikh f agenda dyalek, m3a jem3a dyal marge." },
          { fr: "Prépare tôt les pièces demandées, elles prennent souvent plus de temps que prévu.", ary: "Wejjed bekri lwra9 lli tatlbo, ghalban katakhod we9t kter mma katfekker." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Toucher le domaine avant de t’engager", ary: "Jerreb 9bel ma tdkhol" },
        detail: {
          fr: "Un petit projet réel t’apprend plus sur toi qu’une brochure. Tu sauras vite si résoudre un bug pendant deux heures t’agace ou t’amuse. C’est cette réaction qu’il faut observer.",
          ary: "Chi projet sghir 7a9i9i kay3ellmek 3la rassek kter men brochure. Ghadi t3ref bzerba wach 7ell bug f sa3tayn kaydayy9ek wla kay3ejbek. Hadik réaction hiya lmohimma.",
        },
        actions: [
          { fr: "Termine un projet minuscule de bout en bout, même très simple.", ary: "Kemmel chi projet sghir men lewwel l lekher, wakha bsit bzaf." },
          { fr: "Parle à un étudiant déjà dans la filière et demande ce qui l’a surpris.", ary: "Hder m3a talib deja f chou3ba w se99si ach fajje2o." },
          { fr: "Observe ta réaction devant la difficulté, c’est le meilleur indice.", ary: "Ra9eb réaction dyalek 9oddam ssou3ouba, hiya a7sen dalil." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer deux ou trois formations précises", ary: "9aren jouj wla tlata dyal formations" },
        detail: {
          fr: "À ce stade, arrête de comparer des domaines et compare des formations nommées. Le programme détaillé, le volume de pratique, le devenir des diplômés et le coût total sur la durée.",
          ary: "F had lmar7ala, weqqef tt9aren majalat w bda t9aren formations b smiyathom. Programme, 9edd dyal tatbi9, ach kaydiro lkhrijin w taman kamel.",
        },
        actions: [
          { fr: "Mets côte à côte les maquettes pédagogiques, matière par matière.", ary: "7ett les programmes 7da be7da, madda b madda." },
          { fr: "Compte le budget complet, frais et vie quotidienne comprise.", ary: "7seb budget kamel, frais w l3icha dyal kol nhar." },
          { fr: "Garde une option accessible en plus de ton premier choix.", ary: "Khelli chi khiyar sahel m3a lkhtiyar lewwel dyalek." },
        ],
        resource: ONOUSC,
      },
      {
        id: "preparer",
        title: { fr: "Préparer la prochaine échéance", ary: "Wejjed lmaw3id jay" },
        detail: {
          fr: "Une orientation se joue souvent sur des détails administratifs. Dossier complet, dates tenues, plan de repli prêt. C’est peu glorieux mais c’est ce qui fait la différence.",
          ary: "Tawjih ghalban kaytle3 wla kaytih 3la tafasil idariya. Dossier kaml, tawarikh mte7termin, plan b w wajed. Machi chi 7aja zwina walakin hiya lli katbeddel.",
        },
        actions: [
          { fr: "Écris la liste des pièces et coche-les une par une.", ary: "Kteb liste dyal lwra9 w 3ellem 3lihom we7da be we7da." },
          { fr: "Prévois un second choix qui te convient vraiment, pas un choix par défaut.", ary: "Wejjed khtiyar tani lli 3jbek b s7i7, machi ghir bach ykoun." },
          { fr: "Vérifie les aides possibles au logement et à la bourse dès maintenant.", ary: "Chouf daba lmos a3adat dyal sskna w lmin7a." },
        ],
        resource: ENSSUP,
      },
    ],
    branches: [
      {
        id: "voie-technique-courte",
        title: { fr: "Une voie technique courte", ary: "Tri9 technique 9sira" },
        detail: {
          fr: "Un diplôme technique en deux ans mène vite à un premier poste, et n’interdit pas de reprendre des études ensuite. C’est une entrée intéressante si tu veux confronter tes idées au terrain rapidement.",
          ary: "Diplôme technique f 3amayn kaywesslek bzerba l khedma lewla, w ma kaymne3kch tkemmel 9raya men be3d. Khiyar mezyan ila bghiti tchouf terrain bzerba.",
        },
      },
      {
        id: "voie-universitaire",
        title: { fr: "La voie universitaire", ary: "Tri9 dyal l2université" },
        detail: {
          fr: "Une licence puis un master laissent le temps de préciser ta spécialité. Le cadre est moins encadré qu’en école, l’autonomie compte davantage.",
          ary: "Licence w men be3d master kay3tiwk we9t bach t7edded takhassous dyalek. Lkadr 9all men l2école, l2istiqlaliya mohimma kter.",
        },
      },
      {
        id: "voie-ingenieur",
        title: { fr: "Le cycle ingénieur", ary: "Cycle dyal l2ingénieur" },
        detail: {
          fr: "Une sélection à l’entrée, un rythme soutenu, une formation large. Cela demande une préparation sérieuse en amont et une bonne résistance au travail continu.",
          ary: "Sélection f lekhoul, rythme 9aseh, takwin wase3. Khassek t7ddar mezyan 9bel w tkoun 9ad lkhedma lmostamirra.",
        },
      },
    ],
    sources: [CURSUSSUP, ENSSUP, OFPPT, ANAPEC],
  },
  {
    id: "ingenierie",
    category: "tech",
    title: { fr: "Ingénierie et sciences appliquées", ary: "L2ingénierie w l3olom tatbi9iya" },
    summary: {
      fr: "Concevoir, dimensionner, faire fonctionner. Génie civil, électrique, industriel, énergies. Des formations exigeantes en sciences, très tournées vers le concret.",
      ary: "Tsemmem, t7seb, tkhelli l7aja tkhdem. Génie civil, électrique, industriel, ta9at. Takwin 9aseh f l3olom w 9rib l wa9i3.",
    },
    levels: ["lycee", "bac", "bac2", "licence"],
    interests: ["construire", "logique", "technologie", "comprendre"],
    duration: { fr: "Cinq ans après le bac dans la plupart des cycles ingénieur.", ary: "5 snin men be3d lbac f aghlab dyal cycles ingénieur." },
    cost: { fr: "Modéré dans le public, élevé dans le privé. Les stages et les déplacements pèsent aussi.", ary: "Ma3qoul f public, ghali f privé. Stages w tan9olat 7att 3endhom taman." },
    careers: [
      { fr: "Ingénieur en génie civil", ary: "Ingénieur f génie civil" },
      { fr: "Ingénieur procédés ou production", ary: "Ingénieur procédés wla production" },
      { fr: "Chargé d’affaires techniques", ary: "Chargé d’affaires techniques" },
      { fr: "Ingénieur énergies renouvelables", ary: "Ingénieur f ta9at motajaddida" },
    ],
    strengths: [
      { fr: "Tu vois le résultat de ton travail dans des objets et des ouvrages réels.", ary: "Katchouf natija dyal khedmtek f 7wayej w machari3 7a9i9iyin." },
      { fr: "La formation reste large, elle ouvre sur plusieurs secteurs.", ary: "Takwin kaybqa wase3, kay7ell 3la bzaf dyal secteurs." },
      { fr: "Les chantiers et les usines valorisent la rigueur et la méthode.", ary: "Chantiers w usines kay9eddro nnidam w lmanhajiya." },
    ],
    watchouts: [
      { fr: "Le niveau en mathématiques et en physique est exigeant dès la première année.", ary: "Niveau f riyadiyat w fizya 9aseh men l3am lewwel." },
      { fr: "Certains postes imposent de la mobilité et des horaires lourds.", ary: "Chi khedmat katfred tan9ol w sa3at t9al." },
      { fr: "Le mot ingénieur recouvre des réalités très différentes selon la spécialité.", ary: "Kelmat ingénieur kat3ni 7wayej mokhtalfa bzaf 7sab takhassous." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Distinguer les grandes spécialités", ary: "Ferre9 bin takhassousat lkbar" },
        detail: { fr: "Génie civil, électrique, mécanique, industriel, énergie. Le quotidien n’a rien à voir d’une spécialité à l’autre. Mets des images concrètes derrière chaque nom.", ary: "Génie civil, électrique, mécanique, industriel, ta9a. L7ayat dyal kol nhar mokhtalfa bezzaf bin wa7ed w akhor. 7ett souwar wad7a mora kol smiya." },
        actions: [
          { fr: "Choisis deux spécialités et compare leur journée type.", ary: "Khtar jouj takhassousat w 9aren nhar 3adi dyalhom." },
          { fr: "Regarde dans quels secteurs recrutent ces profils au Maroc.", ary: "Chouf f achmen secteurs kayrekrutiw had profils f lMaghrib." },
          { fr: "Repère les matières scientifiques que chacune demande vraiment.", ary: "3ref l mawad l3ilmiya lli kol wa7da katlab b s7i7." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Comprendre la sélection à l’entrée", ary: "Fhem sélection dyal lekhoul" },
        detail: { fr: "Les cycles ingénieur sélectionnent sur dossier, concours ou les deux, avec des seuils publiés chaque année. Cette étape se prépare plusieurs mois à l’avance.", ary: "Cycles ingénieur kaykhtaro 3la dossier, concours wla bjouj, b seuils kaytnecherou kol 3am. Had lkhotwa katwejjed men chhour 9bel." },
        actions: [
          { fr: "Lis l’avis officiel de l’année en cours, pas celui de l’an dernier.", ary: "9ra l2i3lan rasmi dyal had l3am, machi dyal 3am lli fat." },
          { fr: "Note les épreuves et le format exact du concours visé.", ary: "Kteb l imti7anat w format dyal concours lli bghiti." },
          { fr: "Planifie une préparation régulière plutôt qu’un sprint final.", ary: "Dir ta7dir montadam, machi ghir sprint f lekher." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Confronter l’idée au terrain", ary: "Chouf lwa9i3 b 3inik" },
        detail: { fr: "Une visite de chantier, d’atelier ou d’unité de production change souvent la perception qu’on a du métier. Le bruit, le rythme et le travail d’équipe se découvrent sur place.", ary: "Ziyara l chantier, atelier wla wa7da dyal production ghalban katbeddel nadra dyalek 3la lkhedma. Ssda3, rythme w khedma jama3iya kaytkechfo f l3in lmakan." },
        actions: [
          { fr: "Demande à visiter un site ou suis une visite organisée.", ary: "Tlob tzour chi site wla mchi m3a ziyara mnaddma." },
          { fr: "Interroge un professionnel sur la part de terrain et de bureau.", ary: "Se99si professionnel 3la 9edd terrain w 9edd bureau." },
          { fr: "Teste ton goût pour le calcul appliqué sur un cas simple.", ary: "Jerreb wach kay3ejbek l7sab tatbi9i f chi 7ala bsita." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer les écoles sur des critères utiles", ary: "9aren l2écoles b ma3ayir mofida" },
        detail: { fr: "Au-delà du classement, regarde le volume de projets, la durée des stages, les partenariats avec les entreprises et le devenir réel des diplômés.", ary: "Machi ghir classement. Chouf 9edd projets, modat stages, charakat m3a chrikat w ach kaydiro lkhrijin b s7i7." },
        actions: [
          { fr: "Compare le nombre de mois de stage sur l’ensemble du cursus.", ary: "9aren 3dad chhour dyal stage f cursus kamel." },
          { fr: "Vérifie les équipements et les laboratoires disponibles.", ary: "T2ekked men lmo3addat w lmokhtabarat lli kaynin." },
          { fr: "Demande où sont les diplômés deux ans après la sortie.", ary: "Se99si fin lkhrijin men be3d 3amayn." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Construire un dossier solide", ary: "Bni dossier 9wi" },
        detail: { fr: "Les notes scientifiques comptent, mais la régularité et un projet cohérent aussi. Un plan de repli sérieux évite de tout jouer sur un seul concours.", ary: "No9at l3ilmiya mohimma, walakin l2intidam w projet mtnase9 7ett mohimmin. Plan b jiddi kayb3ed 3lik tkhssar kolchi f concours wa7ed." },
        actions: [
          { fr: "Consolide les matières scientifiques dès maintenant.", ary: "9ewwi lmawad l3ilmiya men daba." },
          { fr: "Prépare une voie alternative que tu accepterais sans regret.", ary: "Wejjed tri9 okhra lli t9bleha bla nadam." },
          { fr: "Renseigne-toi sur le logement et la bourse avant les résultats.", ary: "3ref 3la sskna w lmin7a 9bel manatij." },
        ],
        resource: ONOUSC,
      },
    ],
    branches: [
      { id: "voie-prepa", title: { fr: "Passer par une préparation", ary: "Tdouz men ta7dir" }, detail: { fr: "Deux années intensives avant le concours. Le rythme est dur mais la formation scientifique obtenue est solide et réutilisable ailleurs.", ary: "3amayn 9asa7 9bel concours. Rythme s3ib walakin takwin l3ilmi 9wi w kayn fe3 f blayes okhra." } },
      { id: "voie-integree", title: { fr: "Un cycle intégré après le bac", ary: "Cycle mdmouj men be3d lbac" }, detail: { fr: "Tu entres directement dans une école pour cinq ans. Moins de concours à passer, mais un choix de spécialité engagé plus tôt.", ary: "Katdkhol nichan l chi école 5 snin. Concours 9all, walakin katkhtar takhassous bekri." } },
      { id: "voie-technique", title: { fr: "Monter depuis un diplôme technique", ary: "Tel3a men diplôme technique" }, detail: { fr: "Un diplôme technique en deux ans peut mener à une licence professionnelle puis à un cycle ingénieur. La route est plus longue mais très concrète.", ary: "Diplôme technique f 3amayn y9der ywesslek l licence professionnelle w men be3d cycle ingénieur. Tri9 twila walakin 9riba l wa9i3." } },
    ],
    sources: [CURSUSSUP, ENSSUP, ANAPEC],
  },
  {
    id: "metiers",
    category: "tech",
    title: { fr: "Métiers techniques et formation professionnelle", ary: "Lkhedmat ttechnika w takwin lmihani" },
    summary: {
      fr: "Apprendre un métier précis et entrer plus vite dans la vie active. Maintenance, électricité, froid, logistique, hôtellerie, automobile. La pratique domine dès le premier jour.",
      ary: "Tt3ellem khedma m7ddda w tdkhol bzerba l lkhedma. Maintenance, électricité, froid, logistique, hôtellerie, tonobil. Tatbi9 men nhar lewwel.",
    },
    levels: ["lycee", "bac", "bac2", "reorientation"],
    interests: ["terrain", "construire", "technologie"],
    duration: { fr: "De un à deux ans selon le niveau de diplôme visé.", ary: "Men 3am l 3amayn 7sab niveau dyal diplôme." },
    cost: { fr: "Accessible dans le réseau public. Compte surtout le transport, la tenue et le petit outillage.", ary: "Sahel f réseau l3omoumi. Fekker f transport, lbsa w chi 3dda sghira." },
    careers: [
      { fr: "Technicien de maintenance industrielle", ary: "Technicien dyal maintenance sina3iya" },
      { fr: "Électricien d’installation", ary: "Kahrabi dyal tarkib" },
      { fr: "Technicien en froid et climatisation", ary: "Technicien dyal froid w climatisation" },
      { fr: "Agent logistique ou magasinier", ary: "3amil logistique wla magasinier" },
    ],
    strengths: [
      { fr: "On apprend en faisant, avec des résultats visibles tout de suite.", ary: "Kat3ellem b lkhedma, w natija kattbane deghya." },
      { fr: "L’entrée dans l’emploi est souvent plus rapide qu’après un long cursus.", ary: "Doukhoul l lkhedma ghalban bzerba kter men 9raya twila." },
      { fr: "Un métier maîtrisé peut mener à l’installation à son compte.", ary: "Khedma lli t7ekmti fiha t9der twesslek t7ell rassek." },
    ],
    watchouts: [
      { fr: "Les places sont limitées dans les filières demandées, il faut s’y prendre tôt.", ary: "Blayes m7douda f chou3ab lli mtlouba, khassek tbda bekri." },
      { fr: "Certaines spécialités sont physiques et se pratiquent debout.", ary: "Chi takhassousat fihom majhoud jismani w khdmthom wa9ef." },
      { fr: "La progression passe par la formation continue, elle ne vient pas seule.", ary: "Ttoro9i kaydouz men takwin mostamir, ma kayjich bo7do." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Identifier les métiers qui recrutent près de chez toi", ary: "3ref lkhedmat lli kayrekrutiw 9rib lik" },
        detail: { fr: "Le tissu économique change d’une région à l’autre. Un métier très demandé dans une zone industrielle peut l’être moins ailleurs. Regarde ce qui existe autour de toi.", ary: "L2i9tisad kaykhtalef men jiha l okhra. Khedma mtlouba f zone industrielle momkin ma tkounch mtlouba f blassa okhra. Chouf ach kayn 7dak." },
        actions: [
          { fr: "Liste les entreprises et ateliers présents dans ta région.", ary: "Kteb chrikat w ateliers lli kaynin f jihtek." },
          { fr: "Repère trois spécialités précises plutôt qu’un secteur vague.", ary: "Khtar 3 takhassousat m7ddda, machi secteur 3am." },
          { fr: "Demande à un artisan ou un technicien ce qu’il ferait à ta place.", ary: "Se99si chi 7erfi wla technicien ach ghadi ydir f blastek." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Vérifier le niveau d’entrée et le calendrier", ary: "T2ekked men niveau dyal lekhoul w rroznama" },
        detail: { fr: "Les niveaux de formation professionnelle ont chacun leurs conditions d’accès, du niveau spécialisation jusqu’au technicien spécialisé après le bac. Les préinscriptions se font en ligne à dates fixes.", ary: "Kol niveau f takwin lmihani 3endo chorot dyalo, men spécialisation 7tta technicien spécialisé men be3d lbac. Préinscription kattdar online f tawarikh m7ddda." },
        actions: [
          { fr: "Vérifie le niveau scolaire exigé par la spécialité visée.", ary: "T2ekked men niveau dyal 9raya lli katlab takhassous." },
          { fr: "Crée ton compte de préinscription dès l’ouverture.", ary: "Dir compte dyal préinscription melli tt7ell." },
          { fr: "Note les pièces à fournir et la date de dépôt au centre.", ary: "Kteb lwra9 lli khassek w tarikh dyal ddepot f markaz." },
        ],
        resource: TAKWINE,
      },
      {
        id: "essayer",
        title: { fr: "Passer une journée dans le métier", ary: "Douz nhar f lkhedma" },
        detail: { fr: "Rien ne remplace quelques heures dans un atelier. L’environnement, les gestes et l’ambiance se jugent sur place, pas sur une fiche.", ary: "Walou ma ybeddel chi sa3at f atelier. Jaww, l7arakat w l2ajwa' kattchafou f l3in lmakan, machi f chi wer9a." },
        actions: [
          { fr: "Demande à observer une demi-journée dans un atelier.", ary: "Tlob tchouf ness nhar f chi atelier." },
          { fr: "Note ce qui t’a plu et ce qui t’a fatigué, honnêtement.", ary: "Kteb ach 3ejbek w ach 3eyyak, b s7i7." },
          { fr: "Vérifie que les conditions physiques te conviennent.", ary: "T2ekked belli dourouf jismaniya mnasba lik." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer les centres et les spécialités", ary: "9aren lmarakiz w ttakhassousat" },
        detail: { fr: "Deux centres peuvent proposer la même spécialité avec des équipements et des partenariats très différents. Le stage et l’insertion font la différence.", ary: "Jouj marakiz momkin y3etiw nefs takhassous b mo3addat w charakat mokhtalfin. Stage w l2idmaj homa lli kaybeddlo." },
        actions: [
          { fr: "Compare les équipements et l’état des ateliers.", ary: "9aren lmo3addat w 7alat l2ateliers." },
          { fr: "Demande la durée et le lieu des stages prévus.", ary: "Se99si 3la modda w blassa dyal stages." },
          { fr: "Calcule le trajet quotidien, il pèse plus qu’on ne croit.", ary: "7seb tri9 dyal kol nhar, kaywzen kter mma katfekker." },
        ],
        resource: OFPPT,
      },
      {
        id: "preparer",
        title: { fr: "Sécuriser ta place", ary: "Demmen blastek" },
        detail: { fr: "Les filières demandées se remplissent vite. Un dossier complet déposé tôt et un deuxième choix crédible valent mieux qu’un premier choix unique.", ary: "Chou3ab lli mtlouba kat3emmer bzerba. Dossier kaml mde3 bekri w khtiyar tani m39oul khir men khtiyar wa7ed.", },
        actions: [
          { fr: "Dépose ton dossier dès l’ouverture, sans attendre la date limite.", ary: "De33 dossier melli tt7ell, ma tstennach lekher nhar." },
          { fr: "Prépare une seconde spécialité proche de la première.", ary: "Wejjed takhassous tani 9rib men lewwel." },
          { fr: "Garde une copie numérique de chaque pièce déposée.", ary: "7fed copie numérique dyal kol wer9a de33iti." },
        ],
        resource: OFPPT,
      },
    ],
    branches: [
      { id: "voie-alternance", title: { fr: "Se former en alternance", ary: "Takwin b ttanawob" }, detail: { fr: "Une partie du temps en entreprise, une partie en centre. L’apprentissage est plus concret et le réseau professionnel se construit tôt.", ary: "Chi we9t f charika w chi we9t f markaz. T3ellom 9rib l wa9i3 w réseau mihani kaytbna bekri." } },
      { id: "voie-diplome-superieur", title: { fr: "Poursuivre vers un diplôme supérieur", ary: "Kemmel l diplôme 3ali" }, detail: { fr: "Après un diplôme technique, une licence professionnelle reste accessible. Beaucoup découvrent le goût des études par la pratique.", ary: "Men be3d diplôme technique, licence professionnelle b9at momkina. Bzaf kaytkechfo 7obb l9raya men tatbi9." } },
      { id: "voie-independant", title: { fr: "Travailler à son compte", ary: "Tkhdem 3la rassek" }, detail: { fr: "Un métier manuel maîtrisé permet de s’installer, mais la gestion, le devis et la relation client s’apprennent aussi.", ary: "Khedma b yeddik lli t7ekmti fiha katkhellik t7ell rassek, walakin ttasyir, devis w 3ila9a m3a client bghaw t3ellom." } },
    ],
    sources: [OFPPT, TAKWINE, ANAPEC],
  },
  {
    id: "commerce",
    category: "business",
    title: { fr: "Commerce, gestion et finance", ary: "Tijara, tasyir w malia" },
    summary: {
      fr: "Vendre, gérer, analyser des chiffres, faire tourner une organisation. Un domaine large où le relationnel compte autant que la méthode.",
      ary: "Tbi3, tseyyer, t7ell l2ar9am, tkhelli chi mo2assasa tdour. Majal wase3 fih l3ila9at 9add lmanhajiya.",
    },
    levels: ["bac", "bac2", "licence", "reorientation"],
    interests: ["organiser", "communiquer", "logique"],
    duration: { fr: "Trois ans pour une licence, cinq ans pour un cycle complet en école.", ary: "3 snin l licence, 5 snin l cycle kaml f l2école." },
    cost: { fr: "Raisonnable à l’université, souvent élevé dans les écoles privées.", ary: "Ma3qoul f l2université, ghalban ghali f l2écoles l khassa." },
    careers: [
      { fr: "Chargé de clientèle en banque", ary: "Chargé de clientèle f lbanka" },
      { fr: "Contrôleur de gestion", ary: "Contrôleur de gestion" },
      { fr: "Responsable achats ou logistique", ary: "Mas2oul dyal chra wla logistique" },
      { fr: "Chargé de marketing digital", ary: "Chargé dyal marketing digital" },
    ],
    strengths: [
      { fr: "Les compétences servent dans presque tous les secteurs.", ary: "Had lqodrat kaynfe3o f 9rib ga3 secteurs." },
      { fr: "Le travail en équipe et le contact direct occupent une vraie place.", ary: "Lkhedma jama3iya w l2itisal lmobachir 3endhom blassa 7a9i9iya." },
      { fr: "On peut évoluer vers la création de sa propre activité.", ary: "T9der tdouz l khel9 dyal nchat dyalek." },
    ],
    watchouts: [
      { fr: "Les intitulés sont nombreux et parfois flous, vérifie le contenu réel.", ary: "Smiyat bzaf w b3d lme rrat ghamda, t2ekked men lm7towa l7a9i9i." },
      { fr: "La pression sur les objectifs existe dans plusieurs métiers commerciaux.", ary: "Dghet dyal l2ahdaf kayn f bzaf dyal khedmat tijariya." },
      { fr: "Sans stages ni expérience, la sortie d’études peut être lente.", ary: "Bla stages w bla tajriba, lkhrouj men 9raya y9der ykoun bti." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Séparer la vente, la gestion et la finance", ary: "Ferre9 bin lbi3, ttasyir w lmalia" },
        detail: { fr: "Ces trois familles demandent des tempéraments différents. La vente vit du contact, la gestion de l’organisation, la finance de l’analyse chiffrée.", ary: "Had tlata dyal l3a2ilat bghaw tiba3 mokhtalfa. Lbi3 3aych b l2itisal, ttasyir b tandim, lmalia b ta7lil dyal l2ar9am." },
        actions: [
          { fr: "Classe ces trois familles de la plus attirante à la moins attirante.", ary: "Rettb had tlata men lli kter kay3ejbek 7tta l l2a9all." },
          { fr: "Lis deux fiches métiers dans la famille arrivée en tête.", ary: "9ra jouj fiches métiers f l3a2ila lli jat lewwla." },
          { fr: "Vérifie ton rapport aux chiffres sur un cas concret.", ary: "Chouf 3ila9tek m3a l2ar9am f chi 7ala wad7a." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Vérifier les voies d’accès", ary: "T2ekked men ttoro9 dyal lekhoul" },
        detail: { fr: "Certaines écoles recrutent sur concours après le bac, l’université ouvre des licences en gestion et en économie. Les conditions ne se ressemblent pas.", ary: "Chi écoles kayrekrutiw b concours men be3d lbac, l2université kat7ell licences f tasyir w i9tisad. Chorot ma kaychebhouch." },
        actions: [
          { fr: "Compare une voie sélective et une voie universitaire.", ary: "9aren tri9 b sélection w tri9 dyal l2université." },
          { fr: "Note les dates de concours et de dépôt de dossier.", ary: "Kteb tawarikh dyal concours w ddepot dyal dossier." },
          { fr: "Regarde le niveau de langues attendu à l’entrée.", ary: "Chouf niveau dyal loghat lli mtloub f lekhoul." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Mettre un pied dans une organisation", ary: "7ett rjel f chi mo2assasa" },
        detail: { fr: "Un job saisonnier, un stage court ou une mission associative en disent long. Tu verras vite si le rythme d’une équipe te convient.", ary: "Khedma mawsimiya, stage 9sir wla khedma jam3awiya kay9oulou bzaf. Ghadi tchouf bzerba wach rythme dyal chi équipe mnaseb lik." },
        actions: [
          { fr: "Cherche une expérience courte, même bénévole.", ary: "9elleb 3la tajriba 9sira, wakha b la flous." },
          { fr: "Observe ce qui t’épuise et ce qui te motive dans le collectif.", ary: "Ra9eb ach kay3eyyik w ach kaymotivik f lkhedma jama3iya." },
          { fr: "Demande à suivre un professionnel pendant une journée.", ary: "Tlob tmchi m3a chi professionnel nhar kaml." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer au-delà de la réputation", ary: "9aren b kter men ssom3a" },
        detail: { fr: "Regarde la durée des stages, les langues enseignées, les cas pratiques et le réseau des anciens. La réputation seule ne dit rien du contenu.", ary: "Chouf modat stages, loghat, l7alat l3amaliya w réseau dyal l9odama. Ssom3a bo7dha ma kat9oul walou 3la lm7towa." },
        actions: [
          { fr: "Compte les mois de stage obligatoires dans chaque cursus.", ary: "7seb chhour dyal stage ijbari f kol cursus." },
          { fr: "Vérifie les langues réellement pratiquées en cours.", ary: "T2ekked men loghat lli kaytkhdem bihom b s7i7 f dourouss." },
          { fr: "Compare le coût total, pas seulement les frais annuels.", ary: "9aren taman kaml, machi ghir frais dyal l3am." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Travailler ta présentation", ary: "Khdem 3la kifach t9addem rassek" },
        detail: { fr: "Dans ce domaine, savoir se présenter compte tôt. Un entretien, une lettre et un premier CV se préparent avant même l’entrée en formation.", ary: "F had majal, t3ref t9addem rassek mohimm bekri. Entretien, wer9a w awwel CV kaytwejjdo 7tta 9bel ma tdkhol l formation." },
        actions: [
          { fr: "Rédige une présentation de toi en cinq phrases claires.", ary: "Kteb ta3rif dyalek f 5 jomal wad7in." },
          { fr: "Prépare un exemple concret de travail en équipe.", ary: "Wejjed mital wad7 dyal khedma jama3iya." },
          { fr: "Renseigne-toi sur les bourses avant la rentrée.", ary: "3ref 3la lmina7 9bel ddokhoul." },
        ],
        resource: ONOUSC,
      },
    ],
    branches: [
      { id: "voie-ecole", title: { fr: "Une école de commerce", ary: "École dyal tijara" }, detail: { fr: "Sélection à l’entrée, cursus rythmé par les stages et les projets. Le coût et le réseau sont deux critères déterminants.", ary: "Sélection f lekhoul, cursus mebni 3la stages w projets. Taman w réseau jouj ma3ayir mohimmin." } },
      { id: "voie-universite", title: { fr: "Une licence à l’université", ary: "Licence f l2université" }, detail: { fr: "Un accès plus large et un coût contenu, avec davantage d’autonomie à fournir. Les stages se cherchent souvent par soi-même.", ary: "Doukhoul wase3 w taman m39oul, walakin khassek t3temd 3la rassek kter. Stages ghalban kat9elleb 3lihom b rassek." } },
      { id: "voie-technique-gestion", title: { fr: "Un diplôme technique en gestion", ary: "Diplôme technique f ttasyir" }, detail: { fr: "Deux ans orientés pratique, utiles pour entrer vite en poste ou poursuivre en licence professionnelle.", ary: "3amayn 3amaliyin, mofidin bach tdkhol bzerba l khedma wla tkemmel licence professionnelle." } },
    ],
    sources: [CURSUSSUP, ENSSUP, ANAPEC],
  },
  {
    id: "sante",
    category: "health",
    title: { fr: "Santé et soin", ary: "Se77a w l3ilaj" },
    summary: {
      fr: "Soigner, accompagner, prévenir. Médecine, pharmacie, soins infirmiers, kinésithérapie, laboratoire. Des études longues et sélectives, un métier de contact humain permanent.",
      ary: "T3alej, tra9eb, tw99a. Tibb, saydala, tamrid, kiné, laboratoire. 9raya twila w b sélection, w khedma m3a nnas dima.",
    },
    levels: ["lycee", "bac", "bac2", "licence"],
    interests: ["aider", "comprendre", "terrain"],
    duration: { fr: "Trois ans pour les soins infirmiers, sept ans et plus en médecine.", ary: "3 snin l tamrid, 7 snin w kter f tibb." },
    cost: { fr: "Contenu dans le public, très élevé dans le privé. Les stages imposent des déplacements.", ary: "M39oul f public, ghali bzaf f privé. Stages katfred tan9olat." },
    careers: [
      { fr: "Infirmier polyvalent", ary: "Momarrid polyvalent" },
      { fr: "Technicien de laboratoire", ary: "Technicien dyal laboratoire" },
      { fr: "Kinésithérapeute", ary: "Kinésithérapeute" },
      { fr: "Médecin généraliste", ary: "Tbib 3am" },
    ],
    strengths: [
      { fr: "L’utilité du travail est immédiate et rarement discutable.", ary: "Fayda dyal lkhedma kattbane deghya w 9lil lli kayn9echha." },
      { fr: "Les besoins existent partout, y compris hors des grandes villes.", ary: "L7ajat kaynin f kol blassa, 7tta bra men lmodon lkbar." },
      { fr: "Le savoir acquis reste utile dans toute une vie professionnelle.", ary: "Lma3rifa lli katkhod katbqa nafe3a f 7ayatek lmihaniya kollha." },
    ],
    watchouts: [
      { fr: "La sélection est forte et la charge de travail élevée pendant les études.", ary: "Sélection 9asa7 w lkhedma t9ila 7ded f snin dyal 9raya." },
      { fr: "Le contact avec la souffrance demande un équilibre personnel solide.", ary: "L2itisal m3a l2alam katlab tawazon chakhsi 9wi." },
      { fr: "Les horaires incluent souvent des gardes et du travail de nuit.", ary: "Sa3at ghalban fihom gardes w khedma b lil." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Voir la diversité des métiers du soin", ary: "Chouf tanaw3 dyal khedmat l3ilaj" },
        detail: { fr: "La santé ne se réduit pas à la médecine. Soins infirmiers, laboratoire, rééducation, prévention, gestion hospitalière. Chaque voie a sa durée et sa réalité.", ary: "Sse77a machi ghir tibb. Tamrid, laboratoire, rééducation, wi9aya, tasyir dyal sbitar. Kol tri9 3endha modda w wa9i3 dyalha." },
        actions: [
          { fr: "Repère quatre métiers de santé aux durées d’études différentes.", ary: "3ref 4 khedmat f se77a b modad dyal 9raya mokhtalfa." },
          { fr: "Distingue ce qui t’attire dans le soin, le geste ou la relation.", ary: "Ferre9 ach kay3ejbek f l3ilaj, l7araka wla l3ila9a." },
          { fr: "Parle à un soignant de son quotidien réel.", ary: "Hder m3a chi wa7ed kaykhdem f se77a 3la nhar 3adi dyalo." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Comprendre la sélection et les prérequis", ary: "Fhem sélection w chorot" },
        detail: { fr: "Les filières de santé sélectionnent sur dossier, concours ou les deux, avec des places limitées. Les conditions sont publiées chaque année par les établissements.", ary: "Chou3ab dyal se77a kaykhtaro 3la dossier, concours wla bjouj, b blayes m7douda. Chorot kaytnecherou kol 3am men l mo2assassat." },
        actions: [
          { fr: "Lis l’avis officiel de la filière et de l’année en cours.", ary: "9ra l2i3lan rasmi dyal chou3ba w dyal had l3am." },
          { fr: "Note la nature exacte des épreuves de sélection.", ary: "Kteb chnou homa b dde9 imti7anat dyal sélection." },
          { fr: "Vérifie s’il existe des exigences de langue ou de dossier médical.", ary: "T2ekked wach kayn chorot dyal logha wla dossier tibbi." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Approcher le milieu du soin", ary: "9erreb men 3alam l3ilaj" },
        detail: { fr: "Le bénévolat, une association ou une observation encadrée donnent une idée juste. L’odeur, le bruit et la fatigue d’un service ne se lisent pas dans une brochure.", ary: "L3amal tatawo3i, jam3iya wla mora9aba mo2attara kay3etiw fikra s7i7a. Rri7a, ssda3 w l3ya dyal chi service ma kaytqraw f brochure." },
        actions: [
          { fr: "Engage-toi dans une action associative de santé ou de secours.", ary: "Dkhol f chi 3amal jam3awi f se77a wla is3af." },
          { fr: "Demande une observation encadrée, même brève.", ary: "Tlob tchouf b mora9aba, wakha we9t 9sir." },
          { fr: "Évalue honnêtement ta réaction face à la fatigue et au stress.", ary: "9eyyem b s7i7 réaction dyalek 9oddam l3ya w stress." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer durée, sélection et réalité du métier", ary: "9aren modda, sélection w wa9i3 dyal lkhedma" },
        detail: { fr: "Une filière plus courte n’est pas un second choix. Elle mène à un métier plein, avec ses responsabilités propres et ses possibilités d’évolution.", ary: "Chou3ba 9sira machi khtiyar tani. Katwessel l khedma kamla, b mas2ouliyat dyalha w imkaniyat dyal ttoro9i." },
        actions: [
          { fr: "Compare deux filières sur la durée totale et le taux d’accès.", ary: "9aren jouj chou3ab 3la modda kamla w nisbat l9obol." },
          { fr: "Regarde où exercent réellement les diplômés.", ary: "Chouf fin kaykhedmo lkhrijin b s7i7." },
          { fr: "Vérifie les passerelles possibles si tu changes d’avis.", ary: "T2ekked men l2imkaniyat dyal tbdil ila bddelti ra2yek." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Tenir la distance", ary: "9awem l masafa" },
        detail: { fr: "Ces études demandent une organisation régulière plus qu’un effort ponctuel. Le sommeil, la méthode et le soutien autour de toi comptent autant que le niveau.", ary: "Had 9raya katlab tandim montadam kter men majhoud dyal we9t wa7ed. N3ass, lmanhajiya w dda3m 7walik mohimmin 9add niveau." },
        actions: [
          { fr: "Installe une méthode de révision stable dès le départ.", ary: "Dir tari9a dyal moraja3a tabta men lewwel." },
          { fr: "Prépare une voie alternative dans le champ de la santé.", ary: "Wejjed tri9 okhra f majal dyal se77a." },
          { fr: "Regarde les conditions de logement près des lieux de stage.", ary: "Chouf dourouf dyal sskna 9rib men blayes dyal stage." },
        ],
        resource: ONOUSC,
      },
    ],
    branches: [
      { id: "voie-paramedical", title: { fr: "Les formations paramédicales", ary: "Takwinat chibh tibbiya" }, detail: { fr: "Soins infirmiers, laboratoire, imagerie, rééducation. Des études de trois ans environ, très professionnalisantes et ancrées dans la pratique.", ary: "Tamrid, laboratoire, imagerie, rééducation. 9raya 7wali 3 snin, 3amaliya bezzaf." } },
      { id: "voie-medicale", title: { fr: "Médecine, pharmacie, dentaire", ary: "Tibb, saydala, l2asnan" }, detail: { fr: "Des cursus longs et sélectifs qui demandent un engagement de plusieurs années avant l’exercice autonome.", ary: "Cursus twal w b sélection, katlab iltizam dyal snin 9bel ma tkhdem b rassek." } },
      { id: "voie-sante-publique", title: { fr: "Santé publique et gestion", ary: "Se77a 3omoumiya w tasyir" }, detail: { fr: "Prévention, épidémiologie, organisation des soins. Une manière de travailler pour la santé sans être au chevet du patient.", ary: "Wi9aya, épidémiologie, tandim dyal l3ilaj. Tari9a bach tkhdem l se77a bla ma tkoun 7da lmarid." } },
    ],
    sources: [CURSUSSUP, ENSSUP, ONOUSC],
  },
  {
    id: "creation",
    category: "creative",
    title: { fr: "Design, audiovisuel et création", ary: "Design, sam3i basari w l2ibda3" },
    summary: {
      fr: "Donner une forme à une idée. Graphisme, design produit, architecture d’intérieur, vidéo, animation, son. Le portfolio compte souvent plus que le diplôme.",
      ary: "T3ti chakl l chi fikra. Graphisme, design dyal montaj, dakhili, vidéo, animation, sawt. Portfolio ghalban kaywzen kter men diplôme.",
    },
    levels: ["lycee", "bac", "bac2", "reorientation"],
    interests: ["creer", "technologie", "communiquer"],
    duration: { fr: "De deux à cinq ans selon la spécialité et l’école.", ary: "Men 3amayn l 5 snin 7sab takhassous w l2école." },
    cost: { fr: "Souvent élevé dans le privé, avec du matériel et des logiciels à prévoir.", ary: "Ghalban ghali f privé, m3a mo3addat w logiciels khassek t7seb lihom." },
    careers: [
      { fr: "Designer graphique", ary: "Designer graphique" },
      { fr: "Monteur vidéo ou motion designer", ary: "Monteur vidéo wla motion designer" },
      { fr: "Designer d’espace ou d’intérieur", ary: "Designer dyal l2amakin wla dakhili" },
      { fr: "Chargé de communication visuelle", ary: "Chargé dyal tawasol basari" },
    ],
    strengths: [
      { fr: "Le travail se montre directement, un portfolio parle pour toi.", ary: "Lkhedma kattbane nichan, portfolio kayhder 3lik." },
      { fr: "Les projets personnels comptent réellement dans ce domaine.", ary: "Projets chakhsiya kaywzno b s7i7 f had majal." },
      { fr: "Les compétences s’appliquent à beaucoup de secteurs, pas seulement à la pub.", ary: "L compétences kaynfe3o f bzaf dyal secteurs, machi ghir f l2ichhar." },
    ],
    watchouts: [
      { fr: "Les revenus peuvent être irréguliers au début, surtout en indépendant.", ary: "Dakhl y9der ykoun ghir montadam f lewwel, khassatan ila khdemti 3la rassek." },
      { fr: "La critique du travail fait partie du métier, il faut l’accepter.", ary: "N9ad dyal lkhedma joz2 men lkhedma, khassek t9eblo." },
      { fr: "Le goût ne suffit pas, la technique et les délais structurent tout.", ary: "Dew9 bo7do ma kafich, ttechnika w lmawa3id homa lli kaynaddmo kolchi." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Nommer précisément ce que tu veux créer", ary: "Semmi b dde9 ach bghiti tkhle9" },
        detail: { fr: "Créer une image, un espace, un son ou un mouvement ne demande ni les mêmes outils ni la même formation. Le mot création est trop large pour décider.", ary: "Tkhle9 tswira, blassa, sawt wla 7araka machi nefs l2adawat w machi nefs takwin. Kelmat l2ibda3 wase3a bezzaf bach tkhtar." },
        actions: [
          { fr: "Choisis deux supports précis qui t’attirent le plus.", ary: "Khtar jouj supports m7ddin lli kter kay3ejbouk." },
          { fr: "Regarde le travail réel de professionnels dans ces deux voies.", ary: "Chouf lkhedma l7a9i9iya dyal professionnels f had jouj ttoro9." },
          { fr: "Note les outils et logiciels qui reviennent le plus souvent.", ary: "Kteb l2adawat w logiciels lli kayt3awdo bzaf." },
        ],
      },
      {
        id: "verifier",
        title: { fr: "Vérifier ce qui est demandé à l’entrée", ary: "T2ekked ach mtloub f lekhoul" },
        detail: { fr: "Beaucoup d’écoles de création demandent un dossier de travaux, parfois un entretien ou un test. Cela se prépare longtemps à l’avance, pas la veille.", ary: "Bzaf dyal écoles dyal l2ibda3 katlab dossier dyal khedma, chi merra entretien wla test. Hada katwejjdo men be3d we9t, machi lbare7." },
        actions: [
          { fr: "Vérifie si un dossier de travaux est exigé et sous quelle forme.", ary: "T2ekked wach khassek dossier dyal khedma w b achmen chakl." },
          { fr: "Note les dates de dépôt et les formats acceptés.", ary: "Kteb tawarikh dyal ddepot w formats lli kayt9eblo." },
          { fr: "Regarde si une équivalence publique existe pour la même spécialité.", ary: "Chouf wach kayna chi mo2assasa 3omoumiya b nefs takhassous." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Produire avant de postuler", ary: "Nteg 9bel ma t9addem" },
        detail: { fr: "Dans ce domaine, on juge des travaux, pas des intentions. Trois pièces finies et assumées valent mieux que vingt essais inachevés.", ary: "F had majal, kay7ekmo 3la lkhedma, machi 3la nniya. 3 khedmat kamlin khir men 20 tajriba ma kemlatch." },
        actions: [
          { fr: "Termine trois travaux personnels, du début à la fin.", ary: "Kemmel 3 khedmat chakhsiya, men lewwel l lekher." },
          { fr: "Fais relire ton travail par quelqu’un d’exigeant.", ary: "Khelli chi wa7ed 9aseh ychouf lkhedma dyalek." },
          { fr: "Documente ta démarche, pas seulement le résultat final.", ary: "Kteb kifach khdemti, machi ghir natija lekhira." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer les écoles sur le travail produit", ary: "9aren l2écoles 3la lkhedma lli kaynteg" },
        detail: { fr: "Le meilleur indice est le travail des étudiants sortants. Regarde leurs projets, leur diversité et les entreprises où ils atterrissent.", ary: "A7sen dalil howa lkhedma dyal telaba lli kharjin. Chouf projets dyalhom, tanaw3hom w fin wselo." },
        actions: [
          { fr: "Regarde les travaux de fin d’études des dernières promotions.", ary: "Chouf khedmat dyal nihayat 9raya dyal l fawj lekhrin." },
          { fr: "Vérifie le matériel et les logiciels réellement accessibles.", ary: "T2ekked men lmo3addat w logiciels lli kaynin b s7i7." },
          { fr: "Compare le coût total avec le matériel personnel nécessaire.", ary: "9aren taman kaml m3a lmo3addat chakhsiya lli khassek." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Construire un portfolio qui tient", ary: "Bni portfolio 9wi" },
        detail: { fr: "Un portfolio se travaille comme un dossier. Sélection serrée, présentation soignée, explication courte de chaque projet. C’est ton premier argument.", ary: "Portfolio kaytkhdem b7al dossier. Khtiyar m7kem, ta9dim nqi, w char7 9sir l kol projet. Hada howa awwel 7ojja dyalek." },
        actions: [
          { fr: "Garde tes meilleures pièces et retire les plus faibles.", ary: "7fed a7sen khedmat dyalek w 7yed d3if." },
          { fr: "Écris deux phrases d’explication par projet.", ary: "Kteb jouj jomal dyal char7 l kol projet." },
          { fr: "Prépare une version numérique facile à partager.", ary: "Wejjed version numérique sahla bach tchareki." },
        ],
      },
    ],
    branches: [
      { id: "voie-ecole-art", title: { fr: "Une école d’art ou de design", ary: "École dyal fann wla design" }, detail: { fr: "Un cadre exigeant avec des ateliers et des critiques régulières. L’admission passe souvent par un dossier de travaux.", ary: "Ikar 9aseh b ateliers w n9ad montadam. L9obol ghalban kaydouz men dossier dyal khedma." } },
      { id: "voie-technique-creative", title: { fr: "Un diplôme technique créatif", ary: "Diplôme technique ibda3i" }, detail: { fr: "Infographie, audiovisuel, multimédia en deux ans. Une entrée rapide dans la production, avec des outils maîtrisés tôt.", ary: "Infographie, sam3i basari, multimédia f 3amayn. Doukhoul bzerba l production, b adawat kat7ekem fihom bekri." } },
      { id: "voie-autodidacte", title: { fr: "Se former en autodidacte, avec un cadre", ary: "Tt3ellem b rassek, b chi ikar" }, detail: { fr: "Possible dans ce domaine, à condition d’une discipline réelle et de retours extérieurs réguliers. Le diplôme reste utile pour certaines structures.", ary: "Momkin f had majal, b chart dyal indibat 7a9i9i w retours men bra. Diplôme kaybqa nafe3 f chi mo2assassat." } },
    ],
    sources: [CURSUSSUP, ENSSUP, ANAPEC],
  },
  {
    id: "sciences",
    category: "science",
    title: { fr: "Sciences fondamentales et recherche", ary: "L3olom l2asasiya w lba7t" },
    summary: {
      fr: "Comprendre avant d’appliquer. Mathématiques, physique, chimie, biologie, sciences de la terre. Une voie exigeante qui ouvre sur l’enseignement, la recherche et l’analyse.",
      ary: "Tfhem 9bel ma tatbbe9. Riyadiyat, fizya, kimya, biologia, 3olom l2ard. Tri9 9aseh kay7ell 3la tadris, ba7t w ta7lil.",
    },
    levels: ["lycee", "bac", "licence", "reorientation"],
    interests: ["comprendre", "logique", "technologie"],
    duration: { fr: "Trois ans de licence, deux de master, puis trois de doctorat si tu poursuis.", ary: "3 snin licence, 3amayn master, w 3 snin doctorat ila kemmelti." },
    cost: { fr: "Parmi les voies les plus accessibles financièrement à l’université publique.", ary: "Men ttoro9 lli 9all f taman f l2université l3omoumiya." },
    careers: [
      { fr: "Enseignant en sciences", ary: "Ostad dyal l3olom" },
      { fr: "Chargé d’études ou d’analyses", ary: "Chargé dyal dirassat wla ta7lilat" },
      { fr: "Technicien ou ingénieur de laboratoire", ary: "Technicien wla ingénieur f laboratoire" },
      { fr: "Chercheur après un parcours doctoral", ary: "Ba7et men be3d masar dyal doctorat" },
    ],
    strengths: [
      { fr: "La formation apprend à raisonner, ce qui se réemploie partout.", ary: "Takwin kay3ellmek tfekker, w hada kaynfe3 f kol blassa." },
      { fr: "Le coût des études reste bas dans le public.", ary: "Taman dyal 9raya b9a rkhis f l3omoumi." },
      { fr: "Les passerelles vers l’ingénierie et les données existent réellement.", ary: "L2intiqal l l2ingénierie w l data kayn b s7i7." },
    ],
    watchouts: [
      { fr: "L’autonomie demandée est forte, peu de gens te relanceront.", ary: "Khassek t3temd 3la rassek bezzaf, 9lil lli ghadi yjbdek." },
      { fr: "Le lien avec un métier précis est moins direct qu’en filière professionnelle.", ary: "L2irtibat b khedma m7ddda 9all men chou3ba mihaniya." },
      { fr: "Les débouchés dépendent souvent d’un master bien choisi.", ary: "Lmakhraj ghalban kaytwe99ef 3la master mkhtar mezyan." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Voir ce que devient une science à l’université", ary: "Chouf ach katwelli l3ilm f l2université" },
        detail: { fr: "Les mathématiques du lycée et celles de licence ne se ressemblent pas. Regarde un programme réel de première année avant de décider.", ary: "Riyadiyat dyal thanawi w dyal licence ma kaychebhouch. Chouf programme 7a9i9i dyal l3am lewwel 9bel ma tkhtar." },
        actions: [
          { fr: "Ouvre la maquette de licence de la filière visée.", ary: "7ell programme dyal licence dyal chou3ba lli bghiti." },
          { fr: "Repère les matières inconnues et cherche ce qu’elles recouvrent.", ary: "3ref lmawad lli ma t3reftihomch w 9elleb 3la ach kat3ni." },
          { fr: "Demande à un étudiant en deuxième année ce qui l’a surpris.", ary: "Se99si talib f l3am tani ach fajje2o." },
        ],
        resource: ENSSUP,
      },
      {
        id: "verifier",
        title: { fr: "Vérifier l’inscription et les prérequis", ary: "T2ekked men tasjil w chorot" },
        detail: { fr: "L’accès à l’université est plus ouvert que dans les filières sélectives, mais certaines mentions ont des capacités et des prérequis. Vérifie avant de t’engager.", ary: "Doukhoul l l2université wase3 kter men chou3ab b sélection, walakin chi mentions 3endhom blayes m7douda w chorot. T2ekked 9bel." },
        actions: [
          { fr: "Vérifie les capacités d’accueil de la filière choisie.", ary: "T2ekked men 9edd blayes f chou3ba lli khtariti." },
          { fr: "Note les dates d’inscription administrative.", ary: "Kteb tawarikh dyal tasjil idari." },
          { fr: "Regarde la langue d’enseignement des matières scientifiques.", ary: "Chouf b achmen logha kaytdarrsou lmawad l3ilmiya." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Tester ton rapport à l’abstraction", ary: "Jerreb 3ila9tek m3a tajrid" },
        detail: { fr: "Une science fondamentale se vit surtout dans la durée et la patience. Un problème qui résiste plusieurs jours est la norme, pas l’exception.", ary: "L3ilm l2asasi kat3ichou f ttoul w sser. Chi mochkil kaybqa m3ak iyyam hada l3adi, machi istitna2." },
        actions: [
          { fr: "Travaille un problème difficile sur plusieurs jours.", ary: "Khdem 3la chi mochkil s3ib 3la mdar iyyam." },
          { fr: "Observe si la difficulté te décourage ou t’accroche.", ary: "Ra9eb wach ssou3ouba katfechlek wla katchedddek." },
          { fr: "Assiste si possible à un cours ouvert à l’université.", ary: "Ila 9dditi, 7der chi cours meftou7 f l2université." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer les débouchés des masters", ary: "9aren lmakharij dyal masters" },
        detail: { fr: "En sciences, la licence oriente et le master spécialise. Regarde dès maintenant quels masters existent et ce qu’ils ouvrent réellement.", ary: "F l3olom, licence katwejjeh w master kaykhassas. Chouf men daba achmen masters kaynin w ach kay7ellou b s7i7." },
        actions: [
          { fr: "Liste trois masters accessibles depuis ta licence.", ary: "Kteb 3 masters lli t9der twsselhom men licence dyalek." },
          { fr: "Vérifie les conditions de sélection de ces masters.", ary: "T2ekked men chorot dyal sélection dyal had masters." },
          { fr: "Regarde les passerelles vers l’ingénierie ou les données.", ary: "Chouf ttoro9 l l2ingénierie wla l data." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Prendre l’habitude de travailler seul", ary: "Drri rassek tkhdem b wa7dek" },
        detail: { fr: "L’université laisse une grande liberté, ce qui est un piège sans méthode. Un rythme fixe dès les premières semaines change tout le reste de l’année.", ary: "L2université kat3ti 7orriya kbira, w hadi masyada bla manhajiya. Rythme tabet men lasabi3 lewla kaybeddel l3am kollo." },
        actions: [
          { fr: "Fixe un rythme de travail hebdomadaire dès la rentrée.", ary: "7edded rythme dyal khedma kol simana men ddokhoul." },
          { fr: "Trouve un groupe de travail sérieux.", ary: "L9a groupe dyal khedma jiddi." },
          { fr: "Vérifie ton droit à la bourse et au logement étudiant.", ary: "T2ekked men 7e99ek f lmin7a w sskna dyal telaba." },
        ],
        resource: ONOUSC,
      },
    ],
    branches: [
      { id: "voie-recherche", title: { fr: "Vers la recherche", ary: "L jihat lba7t" }, detail: { fr: "Master puis doctorat, avec un travail long sur un sujet précis. Cela demande de la patience et un encadrement de qualité.", ary: "Master w men be3d doctorat, b khedma twila 3la mawdou3 m7edded. Katlab sser w ta2tir mezyan." } },
      { id: "voie-enseignement", title: { fr: "Vers l’enseignement", ary: "L jihat tadris" }, detail: { fr: "Transmettre une discipline, avec une formation pédagogique et des concours propres. Le contact avec les élèves est le cœur du métier.", ary: "Twesssel chi madda, b takwin baydaghouji w concours khassin. L2itisal m3a telaba howa 9elb lkhedma." } },
      { id: "voie-applications", title: { fr: "Vers les applications techniques", ary: "L jihat tatbi9at ttechnika" }, detail: { fr: "Données, calcul, laboratoire, industrie. Un master appliqué rapproche une licence scientifique du marché du travail.", ary: "Data, 7sab, laboratoire, sina3a. Master tatbi9i kay9arreb licence 3ilmiya men sou9 chchoghl." } },
    ],
    sources: [ENSSUP, CURSUSSUP, ONOUSC],
  },
  {
    id: "societe",
    category: "society",
    title: { fr: "Droit, éducation et société", ary: "L9anoun, tarbiya w lmojtama3" },
    summary: {
      fr: "Comprendre les règles et les gens. Droit, sciences sociales, enseignement, travail social, administration. Des métiers de lecture, d’écrit et de relation.",
      ary: "Tfhem l9awanin w nnas. L9anoun, 3olom ijtima3iya, tadris, 3amal ijtima3i, idara. Khedmat dyal 9raya, ktaba w 3ila9at.",
    },
    levels: ["bac", "licence", "reorientation"],
    interests: ["communiquer", "aider", "organiser", "comprendre"],
    duration: { fr: "Trois ans de licence, souvent prolongés par un master ou un concours.", ary: "3 snin licence, ghalban kaytzad master wla concours." },
    cost: { fr: "Accessible à l’université publique. Les concours demandent surtout du temps de préparation.", ary: "Sahel f l2université l3omoumiya. Concours katlab bezzaf we9t dyal ta7dir." },
    careers: [
      { fr: "Juriste d’entreprise ou d’administration", ary: "Juriste f charika wla idara" },
      { fr: "Enseignant", ary: "Ostad" },
      { fr: "Travailleur social", ary: "Khaddam ijtima3i" },
      { fr: "Chargé de ressources humaines", ary: "Chargé dyal mawarid bachariya" },
    ],
    strengths: [
      { fr: "La lecture et l’écriture deviennent de vrais outils professionnels.", ary: "L9raya w lktaba kaywellou adawat mihaniya 7a9i9iya." },
      { fr: "Les débouchés existent dans le public comme dans le privé.", ary: "Lmakharij kaynin f l3omoumi b7al f lkhass." },
      { fr: "Le domaine convient à ceux qui aiment argumenter et expliquer.", ary: "Had majal mnaseb l lli kaybghi ynaqech w ycharreh." },
    ],
    watchouts: [
      { fr: "Le volume de lecture est important et régulier.", ary: "9edd dyal 9raya kbir w montadam." },
      { fr: "Beaucoup de voies passent par un concours, avec une préparation longue.", ary: "Bzaf dyal ttoro9 kaydouzou men concours, b ta7dir twil." },
      { fr: "Les intitulés généralistes demandent une spécialisation claire ensuite.", ary: "Chou3ab 3amma katlab takhassous wad7 men be3d." },
    ],
    steps: [
      {
        id: "decouvrir",
        title: { fr: "Distinguer les familles de métiers", ary: "Ferre9 bin 3a2ilat lkhedmat" },
        detail: { fr: "Le droit, l’enseignement et le travail social partagent le contact humain mais rien d’autre. Les journées, les lieux et les responsabilités diffèrent complètement.", ary: "L9anoun, tadris w l3amal ijtima3i kaytchariko l2itisal m3a nnas w safi. Nhar, blayes w mas2ouliyat mokhtalfin kollhom." },
        actions: [
          { fr: "Choisis une famille et lis deux fiches métiers qui en relèvent.", ary: "Khtar 3a2ila w 9ra jouj fiches métiers men dakchi." },
          { fr: "Repère la part d’écrit et la part d’oral dans chacune.", ary: "3ref 9edd dyal lktaba w 9edd dyal lhadra f kol wa7da." },
          { fr: "Demande à un professionnel ce qui l’a fait rester.", ary: "Se99si professionnel ach khellah yb9a." },
        ],
        resource: ANAPEC,
      },
      {
        id: "verifier",
        title: { fr: "Vérifier l’accès et la suite du parcours", ary: "T2ekked men doukhoul w mma jay men be3d" },
        detail: { fr: "L’entrée en licence est souvent large, mais la suite passe par un master ou un concours. Regarde le chemin complet, pas seulement la première année.", ary: "Doukhoul l licence ghalban wase3, walakin lli jay kaydouz men master wla concours. Chouf tri9 kamla, machi ghir l3am lewwel." },
        actions: [
          { fr: "Regarde ce que font les diplômés trois ans après la licence.", ary: "Chouf ach kaydiro lkhrijin men be3d 3 snin men licence." },
          { fr: "Identifie les concours qui existent dans la voie visée.", ary: "3ref achmen concours kaynin f tri9 lli bghiti." },
          { fr: "Note la langue principale des cours et des examens.", ary: "Kteb logha ra2isiya dyal dourouss w limti7anat." },
        ],
        resource: CURSUSSUP,
      },
      {
        id: "essayer",
        title: { fr: "Tester le terrain relationnel", ary: "Jerreb terrain dyal l3ila9at" },
        detail: { fr: "Encadrer un groupe, accompagner quelqu’un ou assister à une audience publique t’en apprend plus qu’un chapitre de manuel.", ary: "T2atter groupe, t3awen chi wa7ed wla t7der chi jalsa 3omoumiya kay3ellmek kter men chi bab f ktab." },
        actions: [
          { fr: "Participe à une activité associative ou de soutien scolaire.", ary: "Charek f chi nchat jam3awi wla da3m madrasi." },
          { fr: "Assiste à une audience publique si c’est possible.", ary: "7der chi jalsa 3omoumiya ila kan momkin." },
          { fr: "Note si expliquer aux autres te fatigue ou te nourrit.", ary: "Kteb wach tcharreh l nnas kay3eyyik wla kay3jbek." },
        ],
      },
      {
        id: "comparer",
        title: { fr: "Comparer les spécialisations possibles", ary: "9aren ttakhassousat lmomkina" },
        detail: { fr: "Une licence générale se spécialise ensuite. Droit des affaires, droit public, sciences de l’éducation, sociologie appliquée. Le choix du master oriente le métier.", ary: "Licence 3amma katkhassas men be3d. 9anoun l2a3mal, 9anoun 3am, 3olom tarbiya, sociologie tatbi9iya. Khtiyar dyal master howa lli kaywejjeh lkhedma." },
        actions: [
          { fr: "Liste deux spécialisations qui t’attirent et leurs débouchés.", ary: "Kteb jouj takhassousat kay3ejbouk w lmakharij dyalhom." },
          { fr: "Vérifie la sélectivité de ces masters.", ary: "T2ekked men sélection dyal had masters." },
          { fr: "Regarde si un stage est prévu dans le cursus.", ary: "Chouf wach kayn stage f cursus." },
        ],
        resource: ENSSUP,
      },
      {
        id: "preparer",
        title: { fr: "Travailler l’écrit et l’argumentation", ary: "Khdem 3la lktaba w l7ojja" },
        detail: { fr: "Dans toutes ces voies, écrire clairement est une compétence décisive. Cela se travaille tôt, par la pratique régulière plus que par la théorie.", ary: "F ga3 had ttoro9, tkteb b wodou7 hiya mahara 7asima. Hadi katkhdem bekri, b tatbi9 montadam kter men nadariya." },
        actions: [
          { fr: "Écris chaque semaine un texte court et argumenté.", ary: "Kteb kol simana nass 9sir w mbni 3la 7ojaj." },
          { fr: "Fais corriger tes textes par quelqu’un d’exigeant.", ary: "Khelli chi wa7ed 9aseh ysse77 lik nsoussek." },
          { fr: "Renseigne-toi sur la bourse et le logement étudiant.", ary: "3ref 3la lmin7a w sskna dyal telaba." },
        ],
        resource: ONOUSC,
      },
    ],
    branches: [
      { id: "voie-droit", title: { fr: "Le droit", ary: "L9anoun" }, detail: { fr: "Une discipline précise et codifiée, qui mène au conseil, au contentieux ou à l’administration. La rigueur de lecture y est centrale.", ary: "Madda m7ddda w mnaddma, katwessel l l2istichara, nnizza3at wla l2idara. Dde9 f l9raya howa l2asas." } },
      { id: "voie-education", title: { fr: "L’éducation", ary: "Ttarbiya" }, detail: { fr: "Enseigner, encadrer, concevoir des programmes. Le concours et la formation pédagogique structurent l’accès au métier.", ary: "Tdarres, t2atter, tsemmem baramij. Concours w takwin baydaghouji homa lli kaynaddmo doukhoul l lkhedma." } },
      { id: "voie-social", title: { fr: "Le travail social et l’administration", ary: "L3amal ijtima3i w l2idara" }, detail: { fr: "Accompagner des personnes ou faire fonctionner un service public. Beaucoup de terrain, des règles précises et un vrai sens du collectif.", ary: "T3awen nnas wla tkhelli chi maslaha 3omoumiya tdour. Terrain bzaf, 9awanin m7ddda w 7ess jama3i 7a9i9i." } },
    ],
    sources: [CURSUSSUP, ENSSUP, ANAPEC],
  },
];
