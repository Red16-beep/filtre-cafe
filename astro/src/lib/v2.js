// Version test v2 (inspirée de croatie.org) : conversion des pages au rendu.
// Les fragments restent intacts ; Base.astro passe le corps et le <style> de
// chaque page par v2ise(), qui remplace l'ancienne palette (stone, amber, slate)
// et les anciennes polices par celles de la v2. La mise en forme des blocs
// vit dans v2/v2.css.

const COULEURS = {
  // stone
  '#fafaf9': '#f6f1ea', '#f5f5f4': '#efe7dc', '#e7e5e4': '#e1d4c2', '#d6d3d1': '#d8cbbb',
  '#a8a29e': '#6a5d54', '#78716c': '#6a5d54', '#57534e': '#5c4d42', '#44403c': '#45362c',
  '#292524': '#33251b', '#1c1917': '#231912', '#0c0a09': '#160f0b',
  // amber
  '#fffbeb': '#fbf5ec', '#fef3c7': '#f7ead9', '#fde68a': '#f4dfc4', '#fcd34d': '#f1d2ad',
  '#fbbf24': '#efc79c', '#f59e0b': '#efc79c', '#d97706': '#b8401f', '#b45309': '#a8391b',
  '#92400e': '#9a3519', '#78350f': '#7a2a14',
  // slate (palette « surface » des anciennes pages racine)
  '#f8fafc': '#f6f1ea', '#f1f5f9': '#efe7dc', '#e2e8f0': '#e1d4c2', '#cbd5e1': '#d8cbbb',
  '#94a3b8': '#6a5d54', '#64748b': '#6a5d54', '#475569': '#5c4d42', '#334155': '#45362c',
  '#1e293b': '#33251b', '#0f172a': '#231912'
};

const RGBA = {
  '250,250,249': '246,241,234', '248,250,252': '246,241,234', '28,25,23': '35,25,18',
  '15,23,42': '35,25,18', '245,158,11': '239,199,156', '146,64,14': '154,53,25',
  '168,162,158': '160,143,128', '120,113,108': '106,93,84'
};

export function v2ise(html) {
  if (!html) return html;
  return html
    .replace(/#[0-9a-fA-F]{6}\b/g, (m) => COULEURS[m.toLowerCase()] || m)
    .replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,/g, (m, r, g, b) => {
      const k = `${r},${g},${b}`;
      return RGBA[k] ? `rgba(${RGBA[k]},` : m;
    })
    .replace(/(['"])Instrument Serif\1/g, "'Newsreader'")
    .replace(/(['"])Inter\1/g, "'Instrument Sans'");
}

// Typographie française : espace insécable devant « : » et « », fine insécable devant ; ! ?,
// après «, dans les nombres (1 900) et entre un nombre et son unité (18 g, 93 °C, 25 €).
// Seul le texte entre les balises est touché : ni attributs, ni commentaires, ni <script>, <style>, <svg>, <pre>, <code>, <textarea>.
const NBSP = '\u00A0', FINE = '\u202F';
const JETONS = /(<!--[\s\S]*?-->|<(script|style|svg|pre|code|textarea)\b[\s\S]*?<\/\2\s*>|<(?:[^>"']|"[^"]*"|'[^']*')*>)|([^<]+)/gi;
const UNITES = /(\d) (€|%|°C|°|g|kg|mg|ml|cl|L|min|s|mm|bars?|ppm|mg\/L)(?=[\s.,;:!?)»]|$)/g;
export function typo(html) {
  if (!html) return html;
  return html.replace(JETONS, (m, balise, nom, texte) => texte === undefined ? m : texte
    .replace(/ (?:&nbsp;|&#160;)(?=[?!;:»])/g, '&nbsp;')
    .replace(/(?<=\S) ([?!;])/g, `${FINE}$1`)
    .replace(/(?<=\S) ([:»])/g, `${NBSP}$1`)
    .replace(/« /g, `«${NBSP}`)
    .replace(UNITES, `$1${NBSP}$2`)
    .replace(/(?<![\d.,])(\d{1,3})((?: \d{3})+)(?!\d)/g, (t, a, b) => a + b.replace(/ /g, FINE))
    .replace(/ →/g, `${NBSP}→`));
}
