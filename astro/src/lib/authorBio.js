// Encadré auteur, posé en fin d'article (juste avant le dernier </main>) pour
// tous les articles du journal et les deux guides. Le texte reprend celui de
// /a-propos : à modifier ici une fois, pas dans 118 fichiers.
const BIO = `
  <aside data-author-bio aria-label="À propos de l'auteur" style="margin:3rem 0 0;padding:1.5rem 0 0;border-top:1px solid #e7e5e4;">
    <p style="margin:0 0 .4rem;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.25em;color:#b45309;">Écrit par</p>
    <p style="margin:0 0 .5rem;font-size:1.05rem;font-weight:600;color:#1c1917;"><a href="/a-propos" style="color:inherit;text-decoration:none;">Reda</a></p>
    <p style="margin:0 0 .75rem;font-size:.9rem;line-height:1.65;color:#57534e;font-weight:300;">Je m'appelle Reda, je vis dans le Nord de la France, et je ne suis ni barista ni torréfacteur. Juste quelqu'un de curieux qui aime tester. Je fais mon café dans ma cuisine, avec du matériel que n'importe qui peut acheter, et je note ce qui marche et ce qui rate.</p>
    <p style="margin:0;font-size:.8rem;line-height:1.6;color:#a8a29e;"><a href="/a-propos" style="color:#78716c;text-decoration:underline;text-underline-offset:2px;">À propos</a> · <a href="/a-propos#transparence" style="color:#78716c;text-decoration:underline;text-underline-offset:2px;">Comment je me rémunère</a> · <!--email_off--><a href="mailto:reda@filtre.cafe?subject=Erreur%20dans%20un%20article" style="color:#78716c;text-decoration:underline;text-underline-offset:2px;">Signaler une erreur</a><!--/email_off--></p>
  </aside>
`;

export function withAuthorBio(body) {
  if (body.includes('data-author-bio')) return body;
  const i = body.lastIndexOf('</main>');
  return i === -1 ? body + BIO : body.slice(0, i) + BIO + body.slice(i);
}
