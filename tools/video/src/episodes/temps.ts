// Minutage d'un épisode narré : tout se cale sur la voix (outils/narration.py écrit minutage.json).
// Les images sont comptées depuis le début du chapitre, sauf mention contraire.

export type Phrase = { id: string; debut: number; fin: number; texte: string };
export type Chapitre = {
  id: string;
  num: string;
  titre: string;
  debut: number;
  fin: number;
  carte?: { debut: number; fin: number };
  phrases: Phrase[];
};
export type Minutage = { fps: number; duree: number; chapitres: Chapitre[] };
type Narration = { chapitres: Array<{ id: string; phrases: Array<{ id: string; dit: string }> }> };

export const outilsTemps = (m: Minutage, n: Narration) => {
  const dit: Record<string, string> = Object.fromEntries(n.chapitres.flatMap((c) => c.phrases.map((p) => [p.id, p.dit])));
  const chapitre = (id: string) => {
    const c = m.chapitres.find((x) => x.id === id);
    if (!c) throw new Error(`chapitre inconnu : ${id}`);
    return c;
  };
  // Début et fin d'une phrase, depuis le début de son chapitre.
  const ph = (pid: string) => {
    for (const c of m.chapitres) {
      const p = c.phrases.find((x) => x.id === pid);
      if (p) return { debut: p.debut - c.debut, fin: p.fin - c.debut };
    }
    throw new Error(`phrase inconnue : ${pid}`);
  };
  // Moment où la voix dit un fragment, au prorata des caractères du texte dit (le débit est régulier).
  const mot = (pid: string, fragment: string) => {
    const t = dit[pid];
    const i = t.indexOf(fragment);
    if (i < 0) throw new Error(`« ${fragment} » absent de ${pid}`);
    const p = ph(pid);
    return Math.round(p.debut + (p.fin - p.debut) * (i / t.length));
  };
  // Fin de la scène d'un chapitre : la carte du suivant prend le relais.
  const duree = (id: string) => chapitre(id).fin - chapitre(id).debut;
  return { chapitre, ph, mot, duree };
};

// Temps recalé, pour rejouer une scène existante au rythme de la voix (avec <Freeze>) :
// [[image du chapitre, image de la scène d'origine], …], linéaire entre deux points, figé avant et après.
export const recale = (f: number, points: ReadonlyArray<readonly [number, number]>) => {
  if (f <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [a, va] = points[i - 1];
    const [b, vb] = points[i];
    if (f <= b) return va + (vb - va) * ((f - a) / Math.max(1, b - a));
  }
  return points[points.length - 1][1];
};

// La carte de chapitre occupe le début de chaque chapitre (pauses.carte de narration.json, 1,6 s).
export const CARTE = 48;
