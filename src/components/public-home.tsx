"use client";

import { ArrowRight, Languages } from "lucide-react";
import { Button } from "./ui";
import type { Locale } from "@/lib/i18n";

type Props = {
  t: (fr: string, ary: string) => string;
  locale: Locale;
  toggleLocale: () => void;
  onStart: (mode: "login" | "register") => void;
  onDemo: () => void;
  demoAvailable: boolean;
  busy: boolean;
  error: string;
};

export function PublicHome({ t, locale, toggleLocale, onStart, onDemo, demoAvailable, busy, error }: Props) {
  return <div className="public-home">
    <a className="public-skip" href="#public-main">{t("Aller au contenu", "دوز للمحتوى")}</a>
    <header className="public-header">
      <a className="public-brand" href="#"><span aria-hidden="true">↗</span> CampusPath</a>
      <nav aria-label={t("Navigation publique", "تنقل الصفحة الرئيسية")}>
        <a href="#comment-ca-marche">{t("Comment ça marche", "كيفاش كيخدم")}</a>
        <button className="language" onClick={toggleLocale} aria-label={t("Passer en darija", "نبدل للفرنسية")}><Languages size={17}/>{locale === "fr" ? "الدارجة" : "Français"}</button>
        <Button onClick={() => onStart("login")}>{t("Se connecter", "ندخل للحساب")}</Button>
      </nav>
    </header>
    <main id="public-main" className="public-main">
      <section className="public-hero">
        <div className="public-intro">
          <p className="public-kicker">{t("L’orientation, à ton rythme.", "التوجيه، بالوتيرة ديالك.")}</p>
          <h1>{t("Tu n’as pas besoin de tout savoir pour avancer.", "ما خاصكش تعرف كلشي باش تبدا تتقدم.")}</h1>
          <p className="public-lead">{t("Au lycée, après le bac ou en réorientation, fais le point sur tes envies. Explore les études et les métiers au Maroc, puis prépare la prochaine étape qui te ressemble.", "فالثانوي، من بعد الباك ولا إلا بغيتي تبدل المسار، فهم شنو كيعجبك. اكتشف القراية والمهن فالمغرب ووجد الخطوة الجاية اللي كتناسبك.")}</p>
          <div className="public-actions"><Button variant="primary" onClick={() => onStart("register")}>{t("Créer mon profil", "نفتح الملف ديالي")}<ArrowRight size={18}/></Button>
          {demoAvailable && <Button disabled={busy} onClick={onDemo}>{busy ? t("Ouverture de la démonstration…", "كنفتحو التجربة…") : t("Essayer avec un profil fictif", "نجرب بملف تجريبي")}</Button>}</div>
          <p className="public-small">{t("Tu peux hésiter, passer une question et modifier tes réponses.", "تقدر تتردد، تدوز سؤال وتبدل الأجوبة ديالك.")}</p>
          {error && <div role="alert" className="error-box">{error}</div>}
        </div>
        <aside className="public-route" aria-label={t("Ton chemin d’orientation", "الطريق ديالك فالتوجيه")}>
          <p>{t("UN CHEMIN QUI SE CONSTRUIT", "طريق كتبنيه خطوة بخطوة")}</p>
          <ol>{[
            ["01", "Ce que tu sais de toi", "Tes matières, tes expériences, tes envies.", "شنو كتعرف على راسك", "المواد والتجارب والحوايج اللي كتعجبك."],
            ["02", "Ce qu’il reste à éclaircir", "Tes questions, tes contraintes, les prérequis.", "شنو باقي خاصو توضيح", "الأسئلة والقيود والشروط المطلوبة."],
            ["03", "Les chemins possibles", "Des parcours expliqués et des métiers à découvrir.", "الطرق الممكنة", "مسارات مشروحة ومهن باش تكتشف."],
            ["04", "Ta prochaine action", "Une démarche concrète pour continuer.", "الخطوة الجاية ديالك", "إجراء واضح باش تكمل."],
          ].map(([n,title,detail,arTitle,arDetail]) => <li key={n}><span>{n}</span><div><h2>{t(title,arTitle)}</h2><p>{t(detail,arDetail)}</p></div></li>)}</ol>
          <p className="public-route-note">{t("Les choix restent les tiens.", "الاختيارات كتبقى ديالك.")}</p>
        </aside>
      </section>
      <section className="public-method" id="comment-ca-marche">
        <div><p className="public-kicker">{t("FAIRE LE TRI, PAS TOUT DÉCIDER", "رتب الأفكار بلا ما تحسم كلشي")}</p><h2>{t("Moins de flou. Une étape à la fois.", "صورة أوضح. خطوة بخطوة.")}</h2><p>{t("Entre les conseils de l’entourage, les conditions d’accès et les domaines que tu connais mal, il est normal d’hésiter. Ici, tu rassembles les informations utiles à ton choix.", "بين نصائح الناس وشروط القبول والمجالات اللي ما كتعرفش، عادي تتردد. هنا كتجمع المعلومات اللي تعاونك تختار.")}</p></div>
        <ol>{[
          ["Raconte ton parcours", "Complète ton profil et tes expériences. Importe tes documents si tu le souhaites, puis vérifie les informations extraites.", "حكي على المسار ديالك", "كمل الملف والتجارب ديالك. إلا بغيتي، زيد الوثائق وراجع المعلومات المستخرجة منها."],
          ["Explore avec des repères", "Réponds progressivement aux questions, compare les parcours et repère leurs prérequis et leurs difficultés.", "اكتشف بمعطيات واضحة", "جاوب على الأسئلة بشوية بشوية وقارن المسارات والشروط والصعوبات ديالها."],
          ["Prépare la suite", "Retrouve tes favoris, les informations à compléter et les actions à mener dans ton espace. Tu peux revenir sur tes choix.", "وجد اللي جاي", "لقى المفضلة والمعلومات الناقصة والخطوات المقبلة فالفضاء ديالك. تقدر ترجع للاختيارات وتبدلها."],
        ].map(([title,desc,arTitle,arDesc],i)=><li key={title}><span>0{i+1}</span><div><h3>{t(title,arTitle)}</h3><p>{t(desc,arDesc)}</p></div></li>)}</ol>
      </section>
      <section className="public-trust" id="confidentialite"><h2>{t("Ton parcours t’appartient.", "المسار ديالك ملكك.")}</h2><div><p>{t("Les informations extraites d’un document restent à vérifier par toi. Aucune candidature ni aucun e-mail ne sont envoyés à ta place. Les recommandations sont des pistes à examiner, jamais des garanties d’admission.", "المعلومات المستخرجة من الوثائق خاصك تراجعها. حتى ترشيح ولا بريد إلكتروني ما كيتسيفط بلاصتك. التوصيات غير مسارات باش تدرسها، ماشي ضمان للقبول.")}</p><p>{t("Cette version de démonstration utilise un stockage temporaire sur l’hébergement gratuit. Pour tes essais, utilise des documents fictifs : les données peuvent être réinitialisées au redémarrage du serveur.", "هاد النسخة التجريبية كتستعمل تخزين مؤقت فالاستضافة المجانية. استعمل وثائق تجريبية: البيانات تقدر تتمسح ملي يعاود الخادم يخدم.")}</p><Button variant="primary" onClick={()=>onStart("register")}>{t("Commencer mon parcours", "نبدا المسار ديالي")}<ArrowRight size={17}/></Button></div></section>
    </main>
    <footer className="public-footer"><span>CampusPath</span><p>{t("Un outil indépendant d’orientation. Non affilié à Campus France.", "أداة مستقلة للتوجيه. ما تابعةش لكامبوس فرانس.")}</p><a href="#confidentialite">{t("Confidentialité et limites", "الخصوصية والحدود")}</a></footer>
  </div>;
}
