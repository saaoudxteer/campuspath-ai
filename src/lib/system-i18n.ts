import dictionary from "./system-translations.json";
const messages: Record<string, string> = dictionary;

/** Stable deterministic templates preserve candidate/program text inside placeholders. */
export function translateSystem(text: string): string {
  if (messages[text]) return messages[text];
  const patterns: [RegExp, (...groups: string[]) => string][] = [
    [
      /^Ajouter le relevé du semestre (\d+)$/,
      (n) => `Zid relevé dyal semestre ${n}`,
    ],
    [
      /^(.*?) : ce semestre n’a pas de relevé associé\. Sans cette pièce, le parcours reste incomplet\.$/,
      (year) =>
        `${year} : had semestre ma 3endouch relevé. Bla had document, masar kayb9a na9s.`,
    ],
    [
      /^Période (.*?) sans explication\.$/,
      (years) => `Lmodda ${years} bla tawdi7.`,
    ],
    [
      /^(.*?) chevauche (.*?)\. Documentez les études simultanées ou corrigez les dates\.$/,
      (a, b) =>
        `${a} kaytla9a m3a ${b}. Wde7 wach 9riti bjouj f nafs lwa9t wlla s7e7 dates.`,
    ],
    [
      /^Deux années au niveau (.*?) : ajoutez une explication\.$/,
      (level) => `Jouj snin f niveau ${level} : zid tawdi7.`,
    ],
    [/^(.*?) à confirmer$/, (label) => `${translateSystem(label)} khas ta2kid`],
    [
      /^(.*?) : source non admissible$/,
      (label) => `${translateSystem(label)} : source ma ma9boulach`,
    ],
    [
      /^(.*?) : adéquation favorable$/,
      (label) => `${translateSystem(label)} : tnassob mzyan`,
    ],
    [/^Vérifier : (.*?)$/, (label) => `Raje3 : ${translateSystem(label)}`],
    [
      /^Ajouter votre (.*?)$/,
      (label) =>
        `Zid ${({ "pièce d’identité": "document lhowiya", "photo d’identité": "tswira dyal ta3rif", diplôme: "diplôme", "justificatif de langue": "document dyal logha" } as Record<string, string>)[label] ?? label}`,
    ],
    [/^Échéance : (.*?)$/, (program) => `Akher ajal : ${program}`],
    [
      /^Information à compléter : (.*?)$/,
      (field) =>
        `Ma3loma khas tk e mmel : ${field}`.replace("tk e mmel", "tkemmel"),
    ],
    [
      /^(.*?) : pièce absente ou non vérifiée$/,
      (label) =>
        `${translateSystem(label)} : document na9s wlla mazal ma traje3ch`,
    ],
    [
      /^(.*?) : pièce revue$/,
      (label) => `${translateSystem(label)} : document traje3`,
    ],
    [
      /^(.*?) : motivation non validée$/,
      (program) => `${program} : motivation mazal ma t2ekkdatch`,
    ],
    [
      /^Pouvez-vous confirmer : (.*?) pour mon profil \?$/,
      (label) => `Wach t9dro t2ekkdo ${translateSystem(label)} l profil dyali?`,
    ],
    [
      /^(.*?) : information critique non résolue\. L’absence de réponse peut modifier votre stratégie\.$/,
      (label) =>
        `${translateSystem(label)} : ma3loma asasiya mazal ma t2ekkdatch. Bla jawab, stratégie dyalek momkin tbeddel.`,
    ],
    [
      /^Doublon possible : (.*?), semestre (\d+)\.$/,
      (subject, semester) =>
        `Momkin note msejjla jouj mrat : ${subject}, semestre ${semester}.`,
    ],
    [
      /^Limite configurée : (\d+) choix\.$/,
      (n) => `L7edd lli msejjel howa ${n} choix.`,
    ],
  ];
  for (const [pattern, format] of patterns) {
    const match = text.match(pattern);
    if (match) return format(...match.slice(1));
  }
  // Audit messages prefix an unchanged program title to a translated rule.
  const parts = text.split(" : ");
  if (parts.length === 2 && messages[parts[1]])
    return `${parts[0]} : ${messages[parts[1]]}`;
  return text;
}
