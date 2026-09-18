import dictionary from "./system-translations.json";
const messages: Record<string, string> = dictionary;

/** Stable deterministic templates preserve candidate/program text inside placeholders. */
export function translateSystem(text: string): string {
  if (messages[text]) return messages[text];
  const patterns: [RegExp, (...groups: string[]) => string][] = [
    [
      /^Ajouter le relevé du semestre (\d+)$/,
      (n) => `زيد كشف النقط ديال السداسي ${n}`,
    ],
    [
      /^(.*?) : ce semestre n’a pas de relevé associé\. Sans cette pièce, le parcours reste incomplet\.$/,
      (year) =>
        `${year} : هاد السداسي ما عندوش كشف النقط. بلا هاد الوثيقة، المسار كيبقى ناقص.`,
    ],
    [
      /^Période (.*?) sans explication\.$/,
      (years) => `المدة ${years} بلا توضيح.`,
    ],
    [
      /^(.*?) chevauche (.*?)\. Documentez les études simultanées ou corrigez les dates\.$/,
      (a, b) =>
        `${a} كيتداخل مع ${b}. وضح واش قريتي بجوج فنفس الوقت ولا صحح التواريخ.`,
    ],
    [
      /^Deux années au niveau (.*?) : ajoutez une explication\.$/,
      (level) => `جوج سنين فالمستوى ${level} : زيد توضيح.`,
    ],
    [/^(.*?) à confirmer$/, (label) => `${translateSystem(label)} خاص تأكيد`],
    [
      /^(.*?) : source non admissible$/,
      (label) => `${translateSystem(label)} : مصدر ما مقبولش`,
    ],
    [
      /^(.*?) : adéquation favorable$/,
      (label) => `${translateSystem(label)} : توافق مزيان`,
    ],
    [/^Vérifier : (.*?)$/, (label) => `راجع : ${translateSystem(label)}`],
    [
      /^Ajouter votre (.*?)$/,
      (label) =>
        `زيد ${({ "pièce d’identité": "وثيقة الهوية", "photo d’identité": "صورة التعريف", diplôme: "الدبلوم", "justificatif de langue": "شهادة اللغة" } as Record<string, string>)[label] ?? label}`,
    ],
    [/^Échéance : (.*?)$/, (program) => `آخر أجل : ${program}`],
    [
      /^Information à compléter : (.*?)$/,
      (field) =>
        `معلومة خاصها تتكمل : ${field}`,
    ],
    [
      /^(.*?) : pièce absente ou non vérifiée$/,
      (label) =>
        `${translateSystem(label)} : وثيقة ناقصة ولا مازال ما تراجعاتش`,
    ],
    [
      /^(.*?) : pièce revue$/,
      (label) => `${translateSystem(label)} : وثيقة تراجعات`,
    ],
    [
      /^(.*?) : motivation non validée$/,
      (program) => `${program} : رسالة الدوافع مازال ما تأكداتش`,
    ],
    [
      /^Pouvez-vous confirmer : (.*?) pour mon profil \?$/,
      (label) => `واش تقدروا تأكدوا ${translateSystem(label)} للملف ديالي؟`,
    ],
    [
      /^(.*?) : information critique non résolue\. L’absence de réponse peut modifier votre stratégie\.$/,
      (label) =>
        `${translateSystem(label)} : معلومة أساسية مازال ما تأكداتش. بلا جواب، الخطة ديالك ممكن تبدل.`,
    ],
    [
      /^Doublon possible : (.*?), semestre (\d+)\.$/,
      (subject, semester) =>
        `ممكن النقطة مسجلة جوج مرات : ${subject}، السداسي ${semester}.`,
    ],
    [
      /^Limite configurée : (\d+) choix\.$/,
      (n) => `الحد المسجل هو ${n} اختيارات.`,
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
