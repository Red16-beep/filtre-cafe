// Flux RSS construit a partir des fragments head : titre, description et date
// y sont deja, inutile de tenir une liste d'articles a part.
import fs from 'node:fs';
import path from 'node:path';

const DIR  = 'src/fragments/journal';
const SITE = 'https://filtre.cafe';

const grab = (html, re) => { const m = html.match(re); return m ? m[1] : null; };
const unesc = s => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"')
                    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const items = fs.readdirSync(DIR)
    .filter(f => f.endsWith('.head.html'))
    .map(f => {
      const html = fs.readFileSync(path.join(DIR, f), 'utf8');
      const slug = f.replace('.head.html', '');
      const raw  = grab(html, /<meta property="og:title" content="([^"]+)"/)
                || (grab(html, /<title>([^<]+)<\/title>/) || slug).replace(/\s*\|\s*filtré\.\s*$/, '');
      const desc = grab(html, /<meta name="description" content="([^"]+)"/) || '';
      const date = grab(html, /<meta property="article:published_time" content="([^"]+)"/);
      return { slug, title: unesc(raw), desc: unesc(desc), date };
    })
    .filter(i => i.date)
    .sort((a, b) => b.date.localeCompare(a.date));

  const body = items.map(i => `    <item>
      <title>${esc(i.title)}</title>
      <link>${SITE}/journal/${i.slug}</link>
      <guid isPermaLink="true">${SITE}/journal/${i.slug}</guid>
      <description>${esc(i.desc)}</description>
      <pubDate>${new Date(i.date + 'T08:00:00Z').toUTCString()}</pubDate>
    </item>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>filtré.</title>
    <link>${SITE}</link>
    <description>Guide indépendant du café de spécialité. Torréfactions testées, guides d'extraction, histoires de terroirs.</description>
    <language>fr-FR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${body}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
