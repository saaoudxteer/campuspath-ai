"use client";
import { useState, useSyncExternalStore } from "react";
import { Button } from "./ui";

const preferenceKey = "campuspath-cookie-preference-v1";
const subscribePreference = (notify: () => void) => {
  window.addEventListener("storage", notify);
  window.addEventListener("campuspath-consent", notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener("campuspath-consent", notify);
  };
};
const readPreference = () => {
  try {
    const choice = localStorage.getItem(preferenceKey);
    return choice === "necessary" || choice === "accepted" ? choice : "unset";
  } catch { return "unset"; }
};
const subscribeLanguage = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => observer.disconnect();
};
export function PrivacyPreferences() {
  const [override, setOpen] = useState<boolean | null>(null);
  const choice = useSyncExternalStore(subscribePreference, readPreference, () => "loading");
  const arabic = useSyncExternalStore(subscribeLanguage, () => document.documentElement.lang.startsWith("ary"), () => false);
  const open = override ?? choice === "unset";
  const [message, setMessage] = useState<"" | "saved" | "temporary">("");
  const t = (fr: string, ar: string) => arabic ? ar : fr;
  const choose = (value: "necessary" | "accepted") => {
    try {
      localStorage.setItem(preferenceKey, value);
      window.dispatchEvent(new Event("campuspath-consent"));
      setOpen(false);
      setMessage("saved");
    } catch {
      setMessage("temporary");
      setOpen(false);
    }
  };
  if (choice === "loading") return null;
  return <div className="privacy-control">
    <button onClick={() => { setOpen(true); setMessage(""); }} className="privacy-reopen">{t("Préférences de cookies", "اختيارات ملفات الارتباط")}</button>
    {message && <span role="status">{message === "saved" ? t("Préférence enregistrée.", "تسجل الاختيار ديالك.") : t("Ton choix est appliqué pour cette visite. Le navigateur empêche sa mémorisation.", "الاختيار تطبق لهاد الزيارة. المتصفح ما خلاهش يتسجل.")}</span>}
    {open && <section className="privacy-banner" aria-label={t("Vos cookies", "ملفات الارتباط ديالك")}>
      <div><h2>{t("Un choix simple, sans bloquer ta visite.", "اختيار بسيط، بلا ما نوقفو الزيارة ديالك.")}</h2><p>{t("La connexion utilise un cookie nécessaire. Cette version ne dépose aucun cookie publicitaire ou de mesure d’audience. Ton choix et ta langue sont mémorisés dans ce navigateur. Refuser les cookies non essentiels ne limite pas ton accès.", "الدخول كيستعمل ملف ارتباط ضروري. هاد النسخة ما كتستعمل حتى ملف للإشهار ولا لقياس الزيارات. الاختيار واللغة كيتحفظو فهاد المتصفح. رفض الملفات غير الضرورية ما كيحدش من الاستعمال.")}</p></div>
      <div className="privacy-actions"><Button onClick={() => choose("necessary")}>{t("Refuser les non essentiels", "نرفض غير الضرورية")}</Button><Button onClick={() => choose("accepted")}>{t("Accepter", "نوافق")}</Button></div>
    </section>}
  </div>;
}
