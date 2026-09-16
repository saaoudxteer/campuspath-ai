"use client";

import { Fragment, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check, CheckCircle2, ChevronRight, Circle, Code2, Compass, ExternalLink, FlaskConical, GitBranch, GraduationCap, HeartPulse, Lightbulb, MapPin, Palette, Scale, Search, SlidersHorizontal, Sparkles, Wrench, X, BriefcaseBusiness } from "lucide-react";
import { orientationRoadmaps, ORIENTATION_REVIEWED_AT, type BiText, type OrientationRoadmap } from "@/lib/orientation-catalog";
import type { OrientationState } from "@/lib/schema";
import { Button, Empty, Modal, Notice, Progress, useApp } from "./ui";

const levels = [
  ["lycee", "Au lycée", "F lycée"], ["bac", "Après le bac", "Men be3d l bac"],
  ["bac2", "Bac +2", "Bac +2"], ["licence", "Licence et plus", "Licence w kter"],
  ["reorientation", "Me réorienter", "Nbeddel lmasar"],
] as const;
const interests = [
  ["technologie", "La technologie", "Technologie"], ["logique", "Résoudre des problèmes", "N7ell lmachakil"],
  ["construire", "Construire et fabriquer", "Nebni w nsayeb"], ["organiser", "Organiser et gérer", "Nnedem w nseyyer"],
  ["aider", "Aider les autres", "N3awen nnas"], ["creer", "Imaginer et créer", "Ntkeyyel w nbde3"],
  ["comprendre", "Comprendre et chercher", "Nfhem w n9elleb"], ["communiquer", "Échanger et convaincre", "Ntwasel w n9ne3"],
  ["terrain", "Apprendre sur le terrain", "Nt3ellem f terrain"],
] as const;
const categories = [
  ["all", "Tous les domaines", "Ga3 lmajalat"], ["tech", "Tech & ingénierie", "Tech w ingénierie"],
  ["business", "Commerce", "Tijara"], ["health", "Santé", "Se77a"],
  ["creative", "Création", "Ibda3"], ["science", "Sciences", "3olom"], ["society", "Société", "Mojtama3"],
] as const;
const domainIcons = { tech: Code2, business: BriefcaseBusiness, health: HeartPulse, creative: Palette, science: FlaskConical, society: Scale };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function RoadIcon({ road, size = 22 }: { road: OrientationRoadmap; size?: number }) {
  const Icon = road.id === "metiers" ? Wrench : road.id === "ingenierie" ? GitBranch : domainIcons[road.category];
  return <Icon size={size} aria-hidden="true" />;
}

export function OrientationView() {
  const { data, locale, t, go, programId, mutate, busy } = useApp();
  const state = data.candidate.orientation;
  const tx = (value: BiText) => value[locale];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [tab, setTab] = useState<"all" | "saved" | "suggested">("all");
  const [quiz, setQuiz] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const selected = orientationRoadmaps.find((road) => road.id === programId);
  const overlap = (road: OrientationRoadmap) => road.interests.filter((interest) => state.profile.interests.includes(interest));
  const roads = orientationRoadmaps.filter((road) => {
    const haystack = [road.title.fr, road.title.ary, road.summary.fr, road.summary.ary, ...road.careers.flatMap((career) => [career.fr, career.ary])].join(" ");
    return (category === "all" || road.category === category) && (level === "all" || road.levels.some((entry) => entry === level)) && normalize(haystack).includes(normalize(query.trim())) && (tab !== "saved" || state.saved_roadmaps.includes(road.id)) && (tab !== "suggested" || overlap(road).length > 0);
  }).sort((a, b) => tab === "suggested" ? overlap(b).length - overlap(a).length || Number(b.levels.includes(state.profile.level)) - Number(a.levels.includes(state.profile.level)) : 0);
  const save = (next: OrientationState) => mutate("/orientation", next, "PUT");
  const toggleSaved = (id: string) => save({ ...state, saved_roadmaps: state.saved_roadmaps.includes(id) ? state.saved_roadmaps.filter((item) => item !== id) : [...state.saved_roadmaps, id] });
  const resetFilters = () => { setQuery(""); setCategory("all"); setLevel("all"); };
  const setMode = (next: typeof tab) => { setTab(next); resetFilters(); };
  return <div className="orientation">
    {programId ? selected ? <RoadmapDetail key={selected.id} road={selected} onSave={() => toggleSaved(selected.id)} /> : <Empty title={t("Ce parcours n’existe pas", "Had lmasar ma kaynch")} description={t("Retrouvez toutes les pistes dans le catalogue.", "Rje3 l liste bach tchouf lmasarat.")} action={<Button onClick={() => go("orientation")}>{t("Voir les parcours", "Chouf lmasarat")}</Button>} /> : <>
      <section className="orient-hero">
        <div className="orient-hero-copy">
          <span className="orient-kicker"><span className="morocco-dot" />{t("L’ORIENTATION, À TA FAÇON", "TAWJIH, B TARI9TEK")}</span>
          <h1>{t("Ton avenir mérite", "Mosta9balek yestahel")}<br /><em>{t("un chemin qui te ressemble.", "masar kaychebhek.")}</em></h1>
          <p>{t("Des études aux métiers, explore les possibles au Maroc. Une carte, des étapes concrètes et la liberté de choisir ta voie.", "Men l9raya l lkhedma, ktechef l2ikhtiyarat f lMaghrib. Kharita w khotwat wad7in bach tkhtar tri9ek.")}</p>
          <div className="orient-hero-actions"><Button className="orient-yellow" onClick={() => setQuiz(true)}><Compass size={18} />{t("Trouver mes premières pistes", "Nl9a lmasarat lli y3ejbouni")}<ArrowRight size={17} /></Button><span>{t("4 questions · sans bonne ou mauvaise réponse", "4 as2ila · ma kayn la s7i7 la ghalet")}</span></div>
        </div>
        <div className="orient-hero-map" aria-hidden="true">
          <div className="mini-note">{t("PLUSIEURS VOIES. TON CHOIX.", "BZAF DYAL TTORO9. KHTIYAREK.")}</div>
          <div className="mini-node start"><Compass size={17} />{t("Moi, aujourd’hui", "Ana, lyoum")}</div><div className="mini-line" />
          <div className="mini-fork"><span>{t("Mes envies", "Chno bghit")}</span><span>{t("Mes atouts", "No9at l9owa")}</span></div><div className="mini-line" />
          <div className="mini-node finish"><GraduationCap size={18} />{t("Ma prochaine étape", "Lkhotwa jaya")}</div>
          <div className="mini-caption"><span />{t("Un parcours se construit, pas à pas.", "Lmasar kaytbna, khotwa b khotwa.")}</div>
        </div>
      </section>
      <div className="orient-intro-line"><span><GitBranch size={16} />{orientationRoadmaps.length} {t("parcours à explorer", "masarat bach tktechef")}</span><span><MapPin size={16} />{t("Pensés pour le Maroc", "Mwejjhin l lMaghrib")}</span><span><Bookmark size={16} />{t("Tes pistes, à ton rythme", "Lmasarat dyalek, b rythme dyalek")}</span></div>
      <section className="orient-catalog" aria-labelledby="catalog-title">
        <div className="orient-section-heading"><div><span className="orient-eyebrow">{t("LE CHAMP DES POSSIBLES", "L2IKHTIYARAT 9EDDAMEK")}</span><h2 id="catalog-title">{t("Quel chemin veux-tu explorer ?", "Achmen tri9 bghiti tktechef ?")}</h2></div><span className="orient-count" aria-live="polite">{roads.length} {t("parcours", "masarat")}</span></div>
        <div className="orient-tabs" role="group" aria-label={t("Afficher les parcours", "Chouf lmasarat")}>
          <button aria-pressed={tab === "all"} onClick={() => setMode("all")}>{t("Tous les parcours", "Ga3 lmasarat")}</button>
          <button aria-pressed={tab === "suggested"} onClick={() => state.profile.interests.length ? setMode("suggested") : setQuiz(true)}><Sparkles size={15} />{t("Mes pistes suggérées", "Pistes mo9tara7a")}</button>
          <button aria-pressed={tab === "saved"} onClick={() => setMode("saved")}><Bookmark size={15} />{t("Mes favoris", "Lfavoris dyali")}<span>{state.saved_roadmaps.length}</span></button>
        </div>
        {tab === "suggested" && <div className="orient-fit-note"><Lightbulb size={20} /><div><strong>{t("Des points de départ, à explorer librement", "No9at lbidaya, ktechefhom b 7orriya")}</strong><p>{t("Ces pistes partagent tes centres d’intérêt. Elles sont classées par nombre d’intérêts communs, puis par niveau d’exploration. Ce n’est ni un test d’aptitude ni une décision d’admission.", "Had pistes kaytchabho m3a l2ihtimamat dyalek. Tartib 7sab l2ihtimamat lmochtaraka, w men be3d niveau. Machi test dyal l9odrat w la 9arar dyal l9obol.")}</p><button onClick={() => setQuiz(true)}>{t("Modifier mes réponses", "Nbeddel l2ajwiba")}</button></div></div>}
        <div className="orient-search-row"><label className="orient-search"><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Un domaine, un métier…", "Majal, chi khedma…")} aria-label={t("Rechercher un parcours", "9elleb 3la masar")} />{query && <button onClick={() => setQuery("")} aria-label={t("Effacer la recherche", "Mse7 lba7t")}><X size={16} /></button>}</label><label className="orient-level"><SlidersHorizontal size={16} /><select value={level} onChange={(e) => setLevel(e.target.value)} aria-label={t("Niveau d’exploration", "Niveau bach tktechef")}><option value="all">{t("Tous les niveaux", "Ga3 niveaux")}</option>{levels.map(([id, fr, ary]) => <option key={id} value={id}>{t(fr, ary)}</option>)}</select></label></div>
        <div className="orient-filters" role="group" aria-label={t("Domaines", "Lmajalat")}>{categories.map(([id, fr, ary]) => <button key={id} aria-pressed={category === id} onClick={() => setCategory(id)}>{t(fr, ary)}</button>)}</div>
        <div className="orient-grid">
          {roads.map((road, index) => {
            const saved = state.saved_roadmaps.includes(road.id), comparing = compare.includes(road.id), explored = road.steps.filter((step) => state.explored_steps[road.id]?.includes(step.id)).length;
            return <article className={`orient-card domain-${road.category}`} key={road.id}>
              <div className="orient-card-top"><span className="orient-domain-icon"><RoadIcon road={road} /></span><span className="orient-card-number">{String(orientationRoadmaps.indexOf(road) + 1).padStart(2, "0")}</span><button className={`orient-bookmark ${saved ? "saved" : ""}`} disabled={busy} aria-pressed={saved} aria-label={t(saved ? "Retirer des favoris : " : "Ajouter aux favoris : ", saved ? "7yed men favoris : " : "Zid l favoris : ") + tx(road.title)} onClick={() => toggleSaved(road.id)}><Bookmark size={19} fill={saved ? "currentColor" : "none"} /></button></div>
              <a className="orient-card-link" href={`#orientation/${road.id}`} onClick={(e) => { e.preventDefault(); go("orientation", road.id); }}><h3>{tx(road.title)}<ArrowRight size={18} /></h3><p>{tx(road.summary)}</p></a>
              {tab === "suggested" && <div className="orient-match"><Sparkles size={13} />{overlap(road).map((id) => { const item = interests.find((interest) => interest[0] === id); return item ? t(item[1], item[2]) : id; }).join(" · ")}</div>}
              <div className="orient-card-careers">{road.careers.slice(0, 2).map((career) => <span key={career.fr}>{tx(career)}</span>)}</div>
              <div className="orient-card-bottom"><span><GitBranch size={14} />{explored > 0 ? `${explored}/${road.steps.length} ${t("étapes explorées", "khotwat tktechfo")}` : `${road.steps.length} ${t("étapes à explorer", "khotwat bach tktechef")}`}</span><label><input type="checkbox" checked={comparing} disabled={!comparing && compare.length >= 3} onChange={() => setCompare(comparing ? compare.filter((id) => id !== road.id) : [...compare, road.id])} aria-label={t("Comparer : ", "9aren : ") + tx(road.title)} />{t("Comparer", "9aren")}</label></div>
              <div className="orient-card-progress" style={{ width: `${explored / road.steps.length * 100}%` }} />
              {tab === "suggested" && index === 0 && <span className="sr-only">{t("Premier résultat par intérêts communs", "Awal resultat 7sab l2ihtimamat")}</span>}
            </article>;
          })}
        </div>
        {!roads.length && <Empty title={t(tab === "saved" && !state.saved_roadmaps.length ? "Tes prochaines pistes commencent ici" : "Aucun parcours pour ces filtres", tab === "saved" && !state.saved_roadmaps.length ? "Lmasarat jayin kaybdaw hna" : "Ma l9inach masar b had filtres")} description={t(tab === "saved" ? "Utilise le marque-page sur un parcours pour le retrouver ici." : "Essaie un autre mot-clé ou affiche tous les domaines.", tab === "saved" ? "Klik 3la marque-page bach t7fed lmasar hna." : "Jerreb kelma okhra wla chouf ga3 lmajalat.")} action={<Button onClick={() => setMode("all")}>{t("Voir tous les parcours", "Chouf ga3 lmasarat")}</Button>} />}
        <p className="orient-source-note">{t("Les niveaux servent à explorer. Les conditions d’accès dépendent de chaque formation. Repères et sources consultés le", "Niveaux ghir bach tktechef. Chorot l9obol katbeddel 7sab formation. Lmasadir tchafou nhar")} {new Date(ORIENTATION_REVIEWED_AT + "T12:00:00").toLocaleDateString("fr-FR")}.</p>
      </section>
      <section className="orient-next"><div className="orient-next-icon"><Compass size={26} /></div><div><h2>{t("Tu n’as pas encore de projet précis ?", "Mazal ma 3endekch projet wad7 ?")}</h2><p>{t("Commence par ce qui t’intéresse. Tu peux explorer plusieurs chemins et changer d’avis.", "Bda b dakchi lli kay3ejbek. T9der tktechef kter men tri9 w tbeddel ra2yek.")}</p></div><Button variant="secondary" onClick={() => setQuiz(true)}>{t("Faire le point", "Nfhem chno bghit")}<ArrowRight size={16} /></Button></section>
      <button className="orient-france-link" onClick={() => go("pathways")}><GraduationCap size={18} /><span>{t("Tu envisages la France ? Retrouve aussi ton espace de préparation des candidatures.", "Katfekker f Fransa ? Chouf espace bach twejjed candidatures dyalek.")}</span><ChevronRight size={18} /></button>
      {compare.length > 0 && <div className="orient-compare-bar"><div><GitBranch size={19} /><strong>{compare.length}/3 {t("parcours sélectionnés", "masarat mkhtarin")}</strong><span>{t("Choisis au moins 2 pistes", "Khtar 3la l2a9al 2 pistes")}</span></div><Button disabled={compare.length < 2} className="orient-yellow" onClick={() => setComparing(true)}>{t("Comparer mes pistes", "N9aren lmasarat")}<ArrowRight size={16} /></Button><button aria-label={t("Vider la comparaison", "7yed lmo9arana")} onClick={() => setCompare([])}><X size={18} /></button></div>}
    </>}
    {quiz && <OrientationQuiz onClose={() => setQuiz(false)} onComplete={() => { setQuiz(false); setMode("suggested"); go("orientation"); }} />}
    {comparing && <Comparison roads={orientationRoadmaps.filter((road) => compare.includes(road.id))} onClose={() => setComparing(false)} />}
  </div>;
}

function OrientationQuiz({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const { data, t, mutate } = useApp();
  const [profile, setProfile] = useState(data.candidate.orientation.profile);
  const [step, setStep] = useState(0);
  const priorities = [["discover", "Je veux découvrir mes options", "Bghit nktechef l2ikhtiyarat"], ["practical", "J’aime apprendre par la pratique", "Kanbghi nt3ellem b tatbi9"], ["studies", "Je me projette dans des études approfondies", "Bghit nt3emme9 f l9raya"]] as const;
  const mobility = [["undecided", "Je ne sais pas encore", "Mazal ma 3reft"], ["local", "Rester près de chez moi", "Neb9a 9rib l dar"], ["morocco", "Bouger au Maroc", "N9ra f chi mdina f lMaghrib"], ["abroad", "Envisager l’étranger", "Nfekker f lkharej"]] as const;
  const titles = [t("Où en es-tu aujourd’hui ?", "Fin wselti lyoum ?"), t("Qu’est-ce qui t’attire ?", "Ach kay3ejbek ?"), t("Comment aimes-tu avancer ?", "Kifach katbghi t9eddem ?"), t("Où imagines-tu la suite ?", "Fin katchewwar lmar7ala jaya ?")];
  return <Modal title={t("Trouvons tes premières pistes", "Nl9aw lmasarat dyalek")} onClose={onClose}>
    <div className="orient-quiz"><div className="orient-quiz-progress"><span>{t("QUESTION", "SO2AL")} 0{step + 1} / 04</span><Progress percent={(step + 1) * 25} label={t("Progression du questionnaire", "T9eddom l2as2ila")} /></div><h3>{titles[step]}</h3><p>{step === 1 ? t("Choisis au moins un intérêt. Tu pourras modifier tes réponses à tout moment.", "Khtar 3la l2a9al ihtimam wa7ed. T9der tbeddel l2ajwiba f ay we9t.") : t("Ta réponse donne un point de départ à ton exploration.", "Jawabek kay3ti no9tat lbidaya bach tktechef.")}</p>
      <div className={`orient-options ${step === 1 ? "multiple" : ""}`} role="group" aria-label={titles[step]}>
        {step === 0 && levels.map(([id, fr, ary]) => <button key={id} aria-pressed={profile.level === id} onClick={() => setProfile({ ...profile, level: id })}><GraduationCap size={20} />{t(fr, ary)}{profile.level === id ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button>)}
        {step === 1 && interests.map(([id, fr, ary]) => <button key={id} aria-pressed={profile.interests.includes(id)} onClick={() => setProfile({ ...profile, interests: profile.interests.includes(id) ? profile.interests.filter((item) => item !== id) : [...profile.interests, id] })}>{t(fr, ary)}{profile.interests.includes(id) ? <CheckCircle2 size={18} /> : <Circle size={18} />}</button>)}
        {step === 2 && priorities.map(([id, fr, ary]) => <button key={id} aria-pressed={profile.priority === id} onClick={() => setProfile({ ...profile, priority: id })}>{t(fr, ary)}{profile.priority === id ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button>)}
        {step === 3 && mobility.map(([id, fr, ary]) => <button key={id} aria-pressed={profile.mobility === id} onClick={() => setProfile({ ...profile, mobility: id })}>{t(fr, ary)}{profile.mobility === id ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button>)}
      </div>
      {step === 3 && <p className="orient-small">{t("Les pistes seront triées par intérêts communs, puis par niveau. Ton style d’apprentissage et ta mobilité servent à préparer les actions proposées dans chaque parcours.", "Pistes ghadi ytertbo 7sab l2ihtimamat lmochtaraka, w men be3d niveau. Tari9at ta3allom w mobility kay3awnouk f l2af3al dyal kol masar.")}</p>}
      <div className="orient-quiz-actions"><Button variant="secondary" onClick={() => step ? setStep(step - 1) : onClose()}>{t(step ? "Retour" : "Plus tard", step ? "Rje3" : "Men be3d")}</Button><Button className="orient-yellow" disabled={step === 1 && !profile.interests.length} onClick={async () => { if (step < 3) setStep(step + 1); else { const saved = await mutate("/orientation", { ...data.candidate.orientation, profile }, "PUT"); if (saved) onComplete(); } }}>{t(step < 3 ? "Continuer" : "Découvrir mes pistes", step < 3 ? "Kemm el" : "Nktechef lmasarat")}<ArrowRight size={16} /></Button></div>
    </div>
  </Modal>;
}

function RoadmapDetail({ road, onSave }: { road: OrientationRoadmap; onSave: () => void }) {
  const { data, locale, t, go, mutate } = useApp();
  const state = data.candidate.orientation, tx = (value: BiText) => value[locale];
  const explored = road.steps.filter((step) => state.explored_steps[road.id]?.includes(step.id)).map((step) => step.id);
  const [active, setActive] = useState(road.steps.find((step) => !explored.includes(step.id))?.id ?? road.steps[0].id);
  const inspector = useRef<HTMLElement>(null);
  const activeStep = road.steps.find((step) => step.id === active), activeBranch = road.branches.find((branch) => branch.id === active);
  const saved = state.saved_roadmaps.includes(road.id), complete = !!activeStep && explored.includes(activeStep.id);
  const selectNode = (id: string) => { setActive(id); if (window.innerWidth < 1000) requestAnimationFrame(() => { inspector.current?.scrollIntoView({ behavior: "smooth", block: "start" }); inspector.current?.focus({ preventScroll: true }); }); };
  const toggleStep = async () => {
    if (!activeStep) return;
    const next = complete ? explored.filter((id) => id !== activeStep.id) : [...explored, activeStep.id];
    await mutate("/orientation", { ...state, explored_steps: { ...state.explored_steps, [road.id]: next } }, "PUT");
  };
  return <>
    <div className="orient-detail-top"><button className="orient-back" onClick={() => go("orientation")}><ArrowLeft size={16} />{t("Tous les parcours", "Ga3 lmasarat")}</button><Button variant="secondary" onClick={onSave} aria-pressed={saved}><Bookmark size={16} fill={saved ? "currentColor" : "none"} />{t(saved ? "Parcours enregistré" : "Garder cette piste", saved ? "Masar tsejjel" : "N7fed had lmasar")}</Button></div>
    <header className="orient-road-header"><span className={`orient-road-icon domain-${road.category}`}><RoadIcon road={road} size={30} /></span><div><span className="orient-eyebrow">{t("TA CARTE D’EXPLORATION", "KHARITAT L2IKTICHAF DYALEK")}</span><h1>{tx(road.title)}</h1><p>{tx(road.summary)}</p></div></header>
    <div className="orient-road-progress"><span><CheckCircle2 size={18} /><strong>{explored.length}/{road.steps.length}</strong> {t("étapes explorées", "khotwat tktechfo")}</span><Progress percent={explored.length / road.steps.length * 100} label={t("Étapes explorées", "Khotwat tktechfo")} /><small>{t("Un repère pour ta réflexion, pas une qualification.", "Ghir repère bach tfekker, machi diplôme.")}</small></div>
    <div className="orient-road-layout">
      <section className="orient-map" aria-label={t("Carte interactive du parcours", "Kharita dyal lmasar")}><div className="orient-map-hint"><GitBranch size={16} />{t("Clique sur une étape ou une voie pour l’explorer", "Klik 3la chi khotwa wla tri9 bach tktechefha")}</div><div className="orient-map-start">{t("TON POINT DE DÉPART", "NO9TAT LBIDAYA DYALEK")}</div>
        <ol className="orient-nodes">{road.steps.map((step, index) => <li key={step.id}>
          <button className={`orient-node ${active === step.id ? "active" : ""} ${explored.includes(step.id) ? "explored" : ""}`} onClick={() => selectNode(step.id)} aria-pressed={active === step.id} aria-controls="orientation-inspector"><span className="orient-node-index">{explored.includes(step.id) ? <Check size={16} /> : `0${index + 1}`}</span><span>{tx(step.title)}{explored.includes(step.id) && <small>{t("Explorée", "Tktechfat")}</small>}</span><ChevronRight size={16} /></button>
          {index === 1 && <div className="orient-branches"><span className="orient-branch-label">{t("PLUSIEURS VOIES POSSIBLES", "KAYNIN BZAF DYAL TTORO9")}</span><div>{road.branches.map((branch) => <button key={branch.id} className={active === branch.id ? "active" : ""} aria-pressed={active === branch.id} aria-controls="orientation-inspector" onClick={() => selectNode(branch.id)}><GitBranch size={15} />{tx(branch.title)}</button>)}</div></div>}
        </li>)}</ol><div className="orient-map-end"><span><Compass size={20} /></span>{t("Une décision éclairée. Ta prochaine étape.", "9arar 3la bayna. Lkhotwa jaya dyalek.")}</div><div className="orient-map-legend"><span><i />{t("À explorer", "Bach tktechef")}</span><span><i className="done" />{t("Explorée", "Tktechfat")}</span><span><i className="branch" />{t("Voie possible", "Tri9 momkina")}</span></div>
      </section>
      <aside id="orientation-inspector" ref={inspector} tabIndex={-1} className="orient-inspector" aria-label={t("Détail de la sélection", "Tafasil l2ikhtiyar")}>
        <span className="orient-eyebrow">{activeStep ? `${t("ÉTAPE", "KHOTWA")} ${road.steps.indexOf(activeStep) + 1} / ${road.steps.length}` : t("UNE VOIE À ENVISAGER", "TRI9 MOMKINA")}</span><h2>{activeStep ? tx(activeStep.title) : activeBranch ? tx(activeBranch.title) : ""}</h2><p>{activeStep ? tx(activeStep.detail) : activeBranch ? tx(activeBranch.detail) : ""}</p>
        {activeStep && <><h3>{t("À toi de jouer", "Daba nowbtek")}</h3><ul className="orient-action-list">{activeStep.actions.map((action) => <li key={action.fr}><span><ArrowRight size={14} /></span>{tx(action)}</li>)}</ul>{activeStep.resource && <a className="orient-resource" href={activeStep.resource.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /><span>{activeStep.resource.label}<small>{t("Consulter la source officielle", "Chouf lmasdar rrasmi")}</small></span><ArrowRight size={16} /></a>}<Button className={complete ? "orient-done-button" : "orient-yellow"} onClick={toggleStep} aria-pressed={complete}><CheckCircle2 size={17} />{t(complete ? "Explorée · annuler" : "Marquer comme explorée", complete ? "Tktechfat · 7yed" : "3ellem belli tktechfat")}</Button><p className="orient-small">{t("Coche cette étape après avoir examiné les actions. Tu peux revenir dessus à tout moment.", "3ellem 3la had khotwa melli tchouf l2af3al. T9der t3awed trje3 liha.")}</p></>}
        {activeBranch && <Notice>{t("Les voies proposées sont des alternatives. Vérifie les diplômes requis, la sélection, les coûts et les dates auprès de l’établissement visé.", "Had ttoro9 ikhtiyarat mokhtalfa. T2ekked men diplômes, sélection, taman w tawarikh 3end l’établissement.")}</Notice>}
      </aside>
    </div>
    <div className="orient-facts"><section><h2><BriefcaseBusiness size={18} />{t("Des métiers à découvrir", "Khedmat bach tktechef")}</h2><ul>{road.careers.map((career) => <li key={career.fr}>{tx(career)}</li>)}</ul><p className="orient-small">{t("Selon la spécialisation et les qualifications obtenues.", "7sab spécialité w diplômes lli khditi.")}</p></section><section><h2><Lightbulb size={18} />{t("Ce qui peut te plaire", "Ach y9der y3ejbek")}</h2><ul>{road.strengths.map((strength) => <li key={strength.fr}>{tx(strength)}</li>)}</ul></section><section><h2><Compass size={18} />{t("À prendre en compte", "Ach khassek t7seb lih")}</h2><ul>{road.watchouts.map((watchout) => <li key={watchout.fr}>{tx(watchout)}</li>)}</ul></section></div>
    <section className="orient-personal-plan"><h2>{t("Pour préparer ta prochaine décision", "Bach twejjed l9arar jaya")}</h2><div><span>01</span><p>{t("Temps et budget : ", "Lwe9t w budget : ")}{tx(road.duration)} {tx(road.cost)}</p></div><div><span>02</span><p>{state.profile.priority === "practical" ? t("Ton envie de pratique : contacte un étudiant ou un professionnel et choisis une petite expérience concrète dans ce domaine.", "Bghiti tatbi9 : hder m3a talib wla professionnel w khtar tajriba sghira f had lmajal.") : state.profile.priority === "studies" ? t("Ton envie d’approfondir : compare les matières, les poursuites d’études et les prérequis de deux formations.", "Bghiti t3emme9 : 9aren matières, l9raya men be3d w chorot dyal jouj formations.") : t("Pour mieux te connaître : essaie une activité du domaine et note ce qui te donne envie de continuer.", "Bach t3ref rassek : jerreb chi activité f had lmajal w kteb ach 3ejbek.")}</p></div><div><span>03</span><p>{state.profile.mobility === "abroad" ? t("Si tu envisages l’étranger, vérifie aussi les langues, les équivalences, les démarches et le budget total. L’espace France peut t’aider à préparer ton dossier.", "Ila katfekker f lkharej, t2ekked men loghat, équivalences, démarches w budget kamel. Espace Fransa y9der y3awnek twejjed dossier.") : state.profile.mobility === "local" ? t("Pour rester près de chez toi, repère deux établissements accessibles et vérifie le trajet, l’offre exacte et les modalités de présence.", "Bach teb9a 9rib l dar, 9elleb 3la jouj établissements w t2ekked men tri9, formation w présence.") : t("Avant de choisir une ville, compare le logement, le transport et les aides possibles en plus des frais de formation.", "9bel ma tkhtar mdina, 9aren sken, transport w lmos a3adat m3a frais dyal formation.")}</p></div></section>
    <section className="orient-sources"><div><h2>{t("Vérifie à la source", "T2ekked men lmasdar")}</h2><p>{t("Portails officiels consultés le", "Portails rrasmiya tchafou nhar")} {new Date(ORIENTATION_REVIEWED_AT + "T12:00:00").toLocaleDateString("fr-FR")}. {t("Vérifie l’avis de l’année concernée avant toute démarche.", "T2ekked men i3lan dyal l3am lli bghiti 9bel ay démarche.")}</p></div><div>{road.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ExternalLink size={14} /></a>)}</div></section>
  </>;
}

function Comparison({ roads, onClose }: { roads: OrientationRoadmap[]; onClose: () => void }) {
  const { t, locale, go } = useApp(), tx = (value: BiText) => value[locale];
  const rows = [
    { label: t("Ce qu’on y explore", "Ach fih"), content: (road: OrientationRoadmap) => tx(road.summary) },
    { label: t("Voies possibles", "Ttoro9 momkina"), content: (road: OrientationRoadmap) => road.branches.map((branch) => tx(branch.title)).join(" · ") },
    { label: t("Durée indicative", "Lmodda ta9riban"), content: (road: OrientationRoadmap) => tx(road.duration) },
    { label: t("Budget à prévoir", "Budget lli khassek"), content: (road: OrientationRoadmap) => tx(road.cost) },
    { label: t("Métiers à découvrir", "Khedmat bach tktechef"), content: (road: OrientationRoadmap) => road.careers.map(tx).join(" · ") },
    { label: t("Points d’attention", "Ach khassek t7seb lih"), content: (road: OrientationRoadmap) => road.watchouts.map(tx).join(" ") },
  ];
  return <Modal title={t("Comparer mes pistes", "N9aren lmasarat")} onClose={onClose} wide><div className="orient-comparison"><p>{t("Compare les compromis. Le bon parcours dépend de ce qui compte pour toi et des conditions d’accès réelles.", "9aren l2ikhtiyarat. Lmasar lmnasb kayt3elle9 b dakchi lli mohim 3endek w chorot l9obol.")}</p><div className="orient-table-scroll"><table><thead><tr><th scope="col">{t("Mes critères", "Ma3ayir dyali")}</th>{roads.map((road) => <th scope="col" key={road.id}><RoadIcon road={road} /><span>{tx(road.title)}</span></th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{roads.map((road) => <td key={road.id}>{row.content(road)}</td>)}</tr>)}<tr><th scope="row">{t("Prochaine étape", "Lkhotwa jaya")}</th>{roads.map((road) => <td key={road.id}><Button variant="secondary" onClick={() => { onClose(); go("orientation", road.id); }}>{t("Explorer", "Nktechef")}<ArrowRight size={14} /></Button></td>)}</tr></tbody></table></div><p className="orient-small">{t("Les durées sont des repères. Consulte les liens officiels de chaque carte pour les modalités exactes.", "Lmodda ghir repère. Chouf lmasadir rrasmiya f kol kharita bach t3ref tafasil.")}</p></div></Modal>;
}
