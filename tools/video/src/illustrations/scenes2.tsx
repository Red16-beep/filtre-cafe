import { random, useCurrentFrame } from "remotion";
import { PosteAero } from "../aeropress/PosteAero";
import { etatPiston } from "../aeropress/etats";
import { PosteFroid } from "../coldbrew/PosteFroid";
import { etatFiltrer } from "../coldbrew/etats";
import { Balance } from "../dessins/Balance";
import { Bouilloire, pointeBec } from "../dessins/Bouilloire";
import { VueCtx } from "../dessins/Poste";
import { PosteEspresso } from "../espresso/PosteEspresso";
import { etatExtraire, etatTasser } from "../espresso/etats";
import { PosteMoka } from "../moka/PosteMoka";
import { etatMontee } from "../moka/etats";
import { PostePress } from "../piston/PostePress";
import { etatInfuser } from "../piston/etats";
import { C, SANS } from "../theme";
import { CadreIllu, ILLU, VapeurBoucle, cycle, tour } from "./Cadre";

// Le poste d'une méthode, recadré en 16:9 (repère 1080 × 1920 des tutos).
const Recadre: React.FC<{ vue: string; children: React.ReactNode }> = ({ vue, children }) => (
  <foreignObject x={0} y={0} width={ILLU.w} height={ILLU.h}>
    <div style={{ position: "relative", width: ILLU.w, height: ILLU.h }}>
      <VueCtx.Provider value={{ viewBox: vue, style: { position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" } }}>
        {children}
      </VueCtx.Provider>
    </div>
  </foreignObject>
);

const Grain: React.FC<{ x: number; y: number; r?: number; angle?: number }> = ({ x, y, r = 1, angle = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${r})`}>
    <ellipse cx={0} cy={0} rx={14} ry={9.5} fill="#6b3f22" stroke="#2a140a" strokeWidth={1.2} />
    <path d="M -11 1 C -5 -5 3 6 11 -1" fill="none" stroke="#2a140a" strokeWidth={2} strokeLinecap="round" />
  </g>
);

// ── Méthodes en boucle ──────────────────────────────────────────────────────
export const IlluAeroPress: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const e = etatPiston(95);
  return (
    <CadreIllu libelle={libelle}>
      <Recadre vue="-60 600 1200 960">
        <PosteAero e={{ ...e, frame: f, bouilloire: { x: 2600, y: 700, angle: 8 }, sifflement: 0, repere: null, gouttes: 0.85, carafe: 0.36, temps: 117 }} />
      </Recadre>
    </CadreIllu>
  );
};

export const IlluPiston: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const e = etatInfuser(90);
  return (
    <CadreIllu libelle={libelle}>
      <Recadre vue="-60 560 1200 1080">
        <PostePress e={{ ...e, frame: f, attente: null, bouilloire: { x: 2600, y: 700, angle: 8 } }} />
      </Recadre>
      <VapeurBoucle x={600} y={250} hauteur={110} intensite={0.7} />
    </CadreIllu>
  );
};

export const IlluMoka: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const e = etatMontee(110);
  return (
    <CadreIllu libelle={libelle}>
      <Recadre vue="-60 610 1200 900">
        <PosteMoka e={{ ...e, frame: f, attente: null, repere: null }} />
      </Recadre>
    </CadreIllu>
  );
};

export const IlluEspresso: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const e = etatExtraire(100);
  return (
    <CadreIllu libelle={libelle}>
      <Recadre vue="140 640 800 640">
        <PosteEspresso e={{ ...e, frame: f, repere: null, camera: { s: 1, x: 0, y: 0 } }} />
      </Recadre>
    </CadreIllu>
  );
};

export const IlluTamper: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const e = etatTasser(60);
  const q = Math.sin(tour(f, 2)) * 0.5 + 0.5; // monte et descend deux fois par boucle
  const surface = 978 + 20;
  return (
    <CadreIllu libelle={libelle}>
      <Recadre vue="140 640 800 640">
        <PosteEspresso
          e={{ ...e, frame: f, camera: { s: 1, x: 0, y: 0 }, pf: { ...e.pf, tasse: 0.5 + (1 - q) * 0.5 }, tamper: { visible: 1, y: surface - q * 120 } }}
        />
      </Recadre>
    </CadreIllu>
  );
};

export const IlluColdBrew: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const e = etatFiltrer(96);
  return (
    <CadreIllu libelle={libelle}>
      <Recadre vue="-60 560 1200 960">
        <PosteFroid e={{ ...e, frame: f }} />
      </Recadre>
    </CadreIllu>
  );
};

// ── Moulin manuel : la manivelle tourne ─────────────────────────────────────
export const IlluMoulinManuel: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const a = tour(f, 2);
  const bx = 600 + Math.cos(a) * 150;
  const by = 158 + Math.sin(a) * 30;
  const devant = Math.sin(a) > 0;
  const manivelle = (
    <g>
      <line x1={600} y1={158} x2={bx} y2={by} stroke={C.crema} strokeWidth={12} strokeLinecap="round" />
      <line x1={600} y1={158} x2={bx} y2={by} stroke={C.corps} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={bx} cy={by - 26} rx={20} ry={28} fill={C.corps} stroke={C.crema} strokeWidth={4} />
    </g>
  );
  return (
    <CadreIllu libelle={libelle}>
      <g transform="translate(0 -36)">
        {!devant ? manivelle : null}
        <rect x={588} y={150} width={24} height={34} rx={5} fill={C.corps} stroke={C.crema} strokeWidth={3.5} />
        <path d="M 548 196 L 652 196 L 652 182 Q 652 176 646 176 L 554 176 Q 548 176 548 182 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} />
        <rect x={545} y={196} width={110} height={300} rx={14} fill={C.corps} stroke={C.crema} strokeWidth={4.5} />
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1={556 + i * 6} y1={300} x2={556 + i * 6} y2={420} stroke={C.crema} strokeWidth={2} opacity={0.35} />
        ))}
        <line x1={545} y1={290} x2={655} y2={290} stroke={C.crema} strokeWidth={3} opacity={0.6} />
        <line x1={545} y1={430} x2={655} y2={430} stroke={C.crema} strokeWidth={3} opacity={0.6} />
        <path d="M 560 210 L 560 480" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.07} />
        <rect x={538} y={496} width={124} height={108} rx={14} fill={C.corps} stroke={C.crema} strokeWidth={4.5} />
        <line x1={538} y1={516} x2={662} y2={516} stroke={C.crema} strokeWidth={3} opacity={0.6} />
        {devant ? manivelle : null}
        {/* grains et petit tas de mouture sur le plan de travail */}
        {Array.from({ length: 9 }).map((_, i) => (
          <Grain key={i} x={404 + random(`mm-x-${i}`) * 96} y={600 + random(`mm-y-${i}`) * 26} angle={random(`mm-a-${i}`) * 180} />
        ))}
        <path d="M 720 618 Q 770 572 820 618 Z" fill="#7a4a2a" />
        <path d="M 735 618 Q 770 586 805 618" fill="none" stroke="#a46a3c" strokeWidth={2.5} opacity={0.6} />
        <line x1={340} y1={624} x2={860} y2={624} stroke={C.crema} strokeWidth={3} opacity={0.35} />
      </g>
    </CadreIllu>
  );
};

// ── Balance : des grains tombent dans la tasse posée dessus ─────────────────
export const IlluBalance: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  return (
    <CadreIllu libelle={libelle}>
      {Array.from({ length: 8 }).map((_, i) => {
        const q = cycle(f, 3, i / 8);
        return <Grain key={i} x={600 + (random(`bg-${i}`) - 0.5) * 50} y={150 + q * q * 230} angle={random(`bga-${i}`) * 180 + q * 200} />;
      })}
      <path d="M 520 300 C 522 380 550 420 600 420 C 650 420 678 380 680 300 Z" fill={C.corps} stroke={C.crema} strokeWidth={4.5} />
      <ellipse cx={600} cy={300} rx={80} ry={16} fill="#5a321a" stroke={C.crema} strokeWidth={4} />
      {Array.from({ length: 7 }).map((_, i) => (
        <Grain key={i} x={556 + i * 15} y={300 + (i % 2) * 4} r={0.8} angle={random(`bt-${i}`) * 180} />
      ))}
      <g transform="translate(600 440) scale(0.72) translate(-540 -1330)">
        <Balance x={540} y={1330} poids={18} decimales temps={f % 30 < 15 ? 12 : 12} />
      </g>
    </CadreIllu>
  );
};

// ── Bouilloire : vapeur et aiguille qui frémit ───────────────────────────────
export const IlluBouilloire: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const K = { x: 660, y: 430, s: 1.25 };
  const bec = pointeBec(K.x, K.y, 0, K.s);
  return (
    <CadreIllu libelle={libelle}>
      <VapeurBoucle x={bec.x} y={bec.y} hauteur={120} />
      <Bouilloire x={K.x} y={K.y} s={K.s} cadran={0.98 + Math.sin(tour(f, 6)) * 0.02} />
      <line x1={330} y1={K.y + 102} x2={880} y2={K.y + 102} stroke={C.crema} strokeWidth={3} opacity={0.35} />
    </CadreIllu>
  );
};

// ── Machine à grain : filets dans la tasse (variantes : verre de latte, deux tasses ; bulles pour l'entretien) ──
export const IlluMachineGrain: React.FC<{ libelle?: string; variante?: 0 | 1 | 2; bulles?: boolean }> = ({ libelle, variante = 0, bulles = false }) => {
  const f = useCurrentFrame();
  const ondule = (k: number) => Math.sin(tour(f, 12, k)) * 1.4;
  const choisi = [1, 3, 2][variante];
  const bec = variante === 2 ? { g: 520, d: 680, x: [560, 640] } : { g: 540, d: 660, x: [584, 616] };
  const fin = variante === 1 ? 404 : variante === 2 ? 488 : 478;
  const etoile = (x: number, y: number, k: number) => (
    <path
      d="M 0 -18 L 4 -4 L 18 0 L 4 4 L 0 18 L -4 4 L -18 0 L -4 -4 Z"
      transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * Math.abs(Math.sin(tour(f, 2, k)))})`}
      fill={C.creme}
      opacity={0.85}
    />
  );
  return (
    <CadreIllu libelle={libelle}>
      <path d="M 450 600 L 450 150 Q 450 110 490 110 L 710 110 Q 750 110 750 150 L 750 600 Z" fill={C.corps} stroke={C.crema} strokeWidth={4.5} />
      <path d="M 470 96 L 730 96 L 730 110 L 470 110 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} />
      <rect x={495} y={140} width={210} height={84} rx={12} fill={C.nuit} stroke={C.crema} strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <circle cx={528 + i * 48} cy={182} r={15} fill="none" stroke={C.crema} strokeWidth={2.5} opacity={i === choisi ? 1 : 0.5} />
          {i === choisi ? <circle cx={528 + i * 48} cy={182} r={6} fill={C.ceriseVive} /> : null}
        </g>
      ))}
      <path d="M 478 140 L 478 550" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.06} />
      {/* bec */}
      <path d={`M ${bec.g} 300 L ${bec.d} 300 L ${bec.d} 334 Q ${bec.d} 344 ${bec.d - 10} 344 L ${bec.g + 10} 344 Q ${bec.g} 344 ${bec.g} 334 Z`} fill={C.nuit} stroke={C.crema} strokeWidth={3.5} />
      <path d={`M ${bec.x[0]} 344 L ${bec.x[0]} 360 M ${bec.x[1]} 344 L ${bec.x[1]} 360`} stroke={C.crema} strokeWidth={6} strokeLinecap="round" />
      {bec.x.map((x, k) => (
        <path
          key={x}
          d={`M ${x} 362 Q ${x + ondule(k * 0.5)} ${(362 + fin) / 2} ${x + (variante === 2 ? 0 : k ? -8 : 8)} ${fin}`}
          stroke="#b8763e"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {variante === 0 ? (
        <>
          <path d="M 548 470 C 550 524 572 548 600 548 C 628 548 650 524 652 470 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} />
          <ellipse cx={600} cy={470} rx={52} ry={10} fill="#c08a55" stroke={C.crema} strokeWidth={3.5} />
          <path d="M 646 486 C 676 486 678 520 644 522" fill="none" stroke={C.crema} strokeWidth={7} />
        </>
      ) : variante === 1 ? (
        <>
          <defs>
            <clipPath id="latte">
              <path d="M 566 406 L 572 544 L 628 544 L 634 406 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#latte)">
            <rect x={556} y={406} width={88} height={140} fill="#efe4d2" />
            <rect x={556} y={440} width={88} height={44} fill="#a8703f" opacity={0.9} />
            <rect x={556} y={406} width={88} height={34} fill="#f6efe3" />
          </g>
          <path d="M 560 400 L 568 548 L 632 548 L 640 400" fill={C.crema} fillOpacity={0.05} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
          <ellipse cx={600} cy={400} rx={40} ry={6} fill="none" stroke={C.crema} strokeWidth={3.5} />
          <path d="M 574 420 L 580 530" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.15} />
        </>
      ) : (
        <>
          {bec.x.map((x, k) => (
            <g key={x}>
              <path
                d={k ? `M ${x + 34} 500 C ${x + 58} 500 ${x + 58} 528 ${x + 32} 530` : `M ${x - 34} 500 C ${x - 58} 500 ${x - 58} 528 ${x - 32} 530`}
                fill="none"
                stroke={C.crema}
                strokeWidth={6}
              />
              <path d={`M ${x - 37} 488 C ${x - 36} 528 ${x - 20} 548 ${x} 548 C ${x + 20} 548 ${x + 36} 528 ${x + 37} 488 Z`} fill={C.corps} stroke={C.crema} strokeWidth={4} />
              <ellipse cx={x} cy={488} rx={37} ry={7} fill="#c08a55" stroke={C.crema} strokeWidth={3} />
            </g>
          ))}
        </>
      )}
      <rect x={480} y={552} width={240} height={22} rx={6} fill={C.nuit} stroke={C.crema} strokeWidth={3.5} />
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={i} x1={496 + i * 23} y1={557} x2={496 + i * 23} y2={569} stroke={C.crema} strokeWidth={2} opacity={0.45} />
      ))}
      {bulles
        ? Array.from({ length: 10 }).map((_, i) => {
            const q = cycle(f, 1, i / 10);
            const cote = i % 2 ? 1 : -1;
            const x = 600 + cote * (195 + random(`bu-${i}`) * 85) + Math.sin(tour(f, 2, i / 10)) * 12;
            const y = 560 - q * 440;
            const r = 10 + random(`br-${i}`) * 14;
            return (
              <g key={i} opacity={Math.sin(Math.PI * q) * 0.9}>
                <circle cx={x} cy={y} r={r} fill={C.creme} fillOpacity={0.06} stroke={C.creme} strokeWidth={2.5} />
                <path d={`M ${x - r * 0.55} ${y - r * 0.15} A ${r * 0.6} ${r * 0.6} 0 0 1 ${x - r * 0.1} ${y - r * 0.6}`} stroke="#ffffff" strokeWidth={2.5} fill="none" strokeLinecap="round" />
              </g>
            );
          })
        : null}
      {bulles ? (
        <>
          {etoile(792, 140, 0)}
          {etoile(410, 250, 0.33)}
          {etoile(806, 420, 0.66)}
        </>
      ) : null}
    </CadreIllu>
  );
};

// ── Tasse de profil, sur sa soucoupe ─────────────────────────────────────────
export const IlluTasse: React.FC<{ libelle?: string }> = ({ libelle }) => (
  <CadreIllu libelle={libelle}>
    <ellipse cx={600} cy={556} rx={230} ry={38} fill={C.corps} stroke={C.crema} strokeWidth={4} />
    <path d="M 770 376 C 856 372 868 470 776 486 L 770 458 C 818 452 822 404 772 404 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 430 352 C 436 470 500 540 600 540 C 700 540 764 470 770 352 Z" fill={C.corps} stroke={C.crema} strokeWidth={4.5} />
    <ellipse cx={600} cy={352} rx={170} ry={30} fill="#3b1d0f" stroke={C.crema} strokeWidth={4.5} />
    <ellipse cx={600} cy={353} rx={150} ry={24} fill="none" stroke="#a8703f" strokeWidth={6} opacity={0.7} />
    <path d="M 456 390 C 470 460 500 495 535 512" fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.08} />
    <VapeurBoucle x={600} y={320} hauteur={170} ecart={24} />
    {Array.from({ length: 5 }).map((_, i) => (
      <Grain key={i} x={872 + i * 26} y={588 + (i % 2) * 9} angle={random(`tg-${i}`) * 180} />
    ))}
  </CadreIllu>
);

// ── Sachet de café : la valve laisse filer le CO2 ───────────────────────────
export const IlluSachet: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  return (
    <CadreIllu libelle={libelle}>
      <g transform="translate(0 -30)">
        <path d="M 470 610 L 482 190 L 718 190 L 730 610 Q 730 622 718 622 L 482 622 Q 470 622 470 610 Z" fill={C.corps} stroke={C.crema} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M 482 190 L 494 130 L 706 130 L 718 190" fill={C.corps} stroke={C.crema} strokeWidth={4.5} strokeLinejoin="round" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={500 + i * 20} y1={140} x2={500 + i * 20} y2={180} stroke={C.crema} strokeWidth={1.5} opacity={0.25} />
        ))}
        <line x1={486} y1={168} x2={714} y2={168} stroke={C.crema} strokeWidth={3} opacity={0.6} />
        {/* étiquette */}
        <rect x={515} y={300} width={170} height={210} rx={8} fill={C.papier} opacity={0.92} />
        <circle cx={600} cy={352} r={26} fill="none" stroke={C.cerise} strokeWidth={4} />
        <path d="M 590 352 C 594 340 606 340 610 352 C 606 364 594 364 590 352 Z" fill={C.cerise} />
        {[400, 424, 448, 472].map((y, i) => (
          <rect key={y} x={540} y={y} width={i === 0 ? 120 : 90 + (i % 2) * 20} height={i === 0 ? 10 : 6} rx={3} fill={i === 0 ? "#3a2819" : "#8a7766"} />
        ))}
        {/* valve et bulles de CO2 */}
        <circle cx={600} cy={240} r={16} fill={C.nuit} stroke={C.crema} strokeWidth={3.5} />
        <circle cx={600} cy={240} r={6} fill="none" stroke={C.crema} strokeWidth={2} />
        {Array.from({ length: 7 }).map((_, i) => {
          const q = cycle(f, 2, i / 7);
          return (
            <circle
              key={i}
              cx={600 + Math.sin(tour(f, 4, i / 7)) * 14 + (i % 2 ? 8 : -8) * q}
              cy={226 - q * 120}
              r={4 + q * 8}
              fill="none"
              stroke={C.crema}
              strokeWidth={2}
              opacity={(1 - q) * 0.7}
            />
          );
        })}
        {Array.from({ length: 11 }).map((_, i) => (
          <Grain key={i} x={360 + random(`sg-x-${i}`) * 100 + (i > 5 ? 380 : 0)} y={604 + random(`sg-y-${i}`) * 24} angle={random(`sg-a-${i}`) * 180} />
        ))}
      </g>
    </CadreIllu>
  );
};

// ── Torréfacteur à tambour : les grains tournent, la fumée monte, le bac refroidit ──
export const IlluTorrefaction: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const rot = tour(f, 1);
  const H = { x: 660, y: 300 };
  return (
    <CadreIllu libelle={libelle}>
      <VapeurBoucle x={826} y={112} hauteur={100} ecart={14} intensite={0.6} />
      <rect x={808} y={112} width={36} height={110} rx={6} fill={C.corps} stroke={C.crema} strokeWidth={4} />
      <defs>
        <clipPath id="tremie">
          <path d="M 594 96 L 726 96 L 692 172 L 628 172 Z" />
        </clipPath>
        <clipPath id="hublot">
          <circle cx={H.x} cy={H.y} r={78} />
        </clipPath>
      </defs>
      <g clipPath="url(#tremie)">
        {Array.from({ length: 14 }).map((_, i) => (
          <Grain key={i} x={608 + random(`tt-x-${i}`) * 104} y={102 + random(`tt-y-${i}`) * 26} r={0.8} angle={random(`tt-a-${i}`) * 180} />
        ))}
      </g>
      <path d="M 590 92 L 730 92 L 694 176 L 626 176 Z" fill={C.crema} fillOpacity={0.05} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
      <rect x={640} y={176} width={40} height={14} fill={C.corps} stroke={C.crema} strokeWidth={3.5} />
      {/* socle et brûleurs */}
      <path d="M 540 410 L 540 584 M 800 410 L 800 584" stroke={C.crema} strokeWidth={8} strokeLinecap="round" />
      <rect x={560} y={430} width={220} height={132} rx={10} fill={C.corps} stroke={C.crema} strokeWidth={4} />
      <rect x={596} y={498} width={148} height={46} rx={6} fill={C.nuit} stroke={C.crema} strokeWidth={3} />
      {Array.from({ length: 6 }).map((_, i) => {
        const x = 614 + i * 22;
        const h = 22 * (0.75 + 0.25 * Math.sin(tour(f, 10, i / 6)));
        return <path key={i} d={`M ${x - 7} 540 Q ${x - 7} ${540 - h * 0.6} ${x} ${540 - h} Q ${x + 7} ${540 - h * 0.6} ${x + 7} 540 Z`} fill={C.ceriseVive} opacity={0.85} />;
      })}
      {/* tambour et hublot */}
      <rect x={500} y={190} width={340} height={220} rx={30} fill={C.corps} stroke={C.crema} strokeWidth={4.5} />
      <path d="M 520 214 L 520 386" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.06} />
      <circle cx={H.x} cy={H.y} r={84} fill={C.nuit} stroke={C.crema} strokeWidth={5} />
      <g clipPath="url(#hublot)">
        {Array.from({ length: 30 }).map((_, i) => {
          const a = rot + (i / 30) * Math.PI * 2;
          const r = 26 + (i % 4) * 13;
          return <Grain key={i} x={H.x + Math.cos(a) * r} y={H.y + 14 + Math.abs(Math.sin(a)) * r * 0.55} r={0.85} angle={(a * 180) / Math.PI + i * 37} />;
        })}
        <path d={`M ${H.x - 56} ${H.y - 56} A 78 78 0 0 1 ${H.x + 56} ${H.y - 56}`} stroke="#ffffff" strokeWidth={8} fill="none" opacity={0.12} />
      </g>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <circle key={i} cx={H.x + Math.cos(a) * 96} cy={H.y + Math.sin(a) * 96} r={4} fill={C.crema} opacity={0.6} />;
      })}
      {/* goulotte vers le bac */}
      <path d="M 548 372 L 504 470 L 540 470 L 584 386 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
      {/* bac de refroidissement */}
      <path d="M 380 552 L 380 588 M 420 552 L 420 588" stroke={C.crema} strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={400} cy={520} rx={160} ry={32} fill={C.corps} stroke={C.crema} strokeWidth={4.5} />
      <ellipse cx={400} cy={512} rx={142} ry={23} fill="#5a321a" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = random(`tb-a-${i}`) * Math.PI * 2;
        const r = Math.sqrt(random(`tb-r-${i}`)) * 0.9;
        return <Grain key={i} x={400 + Math.cos(a) * 128 * r} y={512 + Math.sin(a) * 18 * r} r={0.8} angle={random(`tb-g-${i}`) * 180} />;
      })}
      <line x1={400} y1={512} x2={400 + Math.cos(rot) * 128} y2={512 + Math.sin(rot) * 19} stroke={C.crema} strokeWidth={6} strokeLinecap="round" />
      <circle cx={400} cy={512} r={7} fill={C.crema} />
    </CadreIllu>
  );
};

// ── Branche de caféier : cerises mûres, la branche se balance ──────────────
export const IlluCerises: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const balance = Math.sin(tour(f, 1)) * 1.6;
  const feuilles = [
    { x: 420, y: 230, a: -30, s: 1.1 },
    { x: 520, y: 290, a: 25, s: 1 },
    { x: 660, y: 270, a: -40, s: 1.15 },
    { x: 760, y: 330, a: 30, s: 1 },
    { x: 860, y: 320, a: -20, s: 1.1 },
    { x: 590, y: 380, a: 150, s: 0.95 },
    { x: 720, y: 420, a: 160, s: 1 },
  ];
  const grappes = [
    { x: 470, y: 290 },
    { x: 610, y: 335 },
    { x: 790, y: 375 },
  ];
  return (
    <CadreIllu libelle={libelle}>
      <g transform={`rotate(${balance} 300 200)`}>
        <path d="M 300 200 C 450 250 600 300 900 330" fill="none" stroke={C.cuivre} strokeWidth={10} strokeLinecap="round" />
        <path d="M 300 200 C 450 250 600 300 900 330" fill="none" stroke={C.crema} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
        {feuilles.map((l, i) => (
          <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.a + Math.sin(tour(f, 1, i / 7)) * 3}) scale(${l.s})`}>
            <path d="M 0 0 C 30 -38 110 -40 150 0 C 110 40 30 38 0 0 Z" fill={C.feuille} fillOpacity={0.55} stroke={C.crema} strokeWidth={3.5} />
            <path d="M 0 0 L 150 0" stroke={C.crema} strokeWidth={2} opacity={0.6} />
            {[30, 60, 90, 120].map((x) => (
              <path key={x} d={`M ${x} 0 L ${x + 18} -16 M ${x} 0 L ${x + 18} 16`} stroke={C.crema} strokeWidth={1.4} opacity={0.4} />
            ))}
          </g>
        ))}
        {grappes.map((g, j) =>
          Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2 + j;
            const x = g.x + Math.cos(a) * 26 + (i === 0 ? 0 : 0);
            const y = g.y + Math.sin(a) * 16 + 10;
            const mur = (i + j) % 4 !== 0;
            return (
              <g key={`${j}-${i}`}>
                <circle cx={x} cy={y} r={19} fill={mur ? C.cerise : "#c9a24a"} stroke={C.crema} strokeWidth={2.5} />
                <circle cx={x - 6} cy={y - 7} r={5} fill="#ffffff" opacity={0.3} />
              </g>
            );
          }),
        )}
      </g>
    </CadreIllu>
  );
};

// ── Capsules : la petite machine et ses capsules ────────────────────────────
export const IlluCapsules: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const capsule = (x: number, y: number, c: string, a = 0) => (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <path d="M -26 -18 L 26 -18 L 18 16 L -18 16 Z" fill={c} stroke={C.crema} strokeWidth={3} strokeLinejoin="round" />
      <ellipse cx={0} cy={-18} rx={30} ry={7} fill={c} stroke={C.crema} strokeWidth={3} />
    </g>
  );
  return (
    <CadreIllu libelle={libelle}>
      <path d="M 520 600 L 520 170 Q 520 140 550 140 L 690 140 Q 720 140 720 170 L 720 600 Z" fill={C.corps} stroke={C.crema} strokeWidth={4.5} />
      <path d="M 520 250 L 720 250" stroke={C.crema} strokeWidth={3} opacity={0.6} />
      <rect x={560} y={168} width={120} height={50} rx={10} fill={C.nuit} stroke={C.crema} strokeWidth={3} />
      <circle cx={620} cy={193} r={11} fill={C.ceriseVive} />
      <path d="M 590 300 L 650 300 L 646 330 L 594 330 Z" fill={C.nuit} stroke={C.crema} strokeWidth={3} />
      <path d={`M 620 332 Q ${620 + Math.sin(tour(f, 10)) * 1.4} 390 620 444`} stroke="#9a5a2c" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 572 440 C 574 486 594 504 620 504 C 646 504 666 486 668 440 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} />
      <ellipse cx={620} cy={440} rx={48} ry={9} fill="#a8703f" stroke={C.crema} strokeWidth={3} />
      <rect x={540} y={508} width={160} height={18} rx={5} fill={C.nuit} stroke={C.crema} strokeWidth={3} />
      {capsule(370, 572, C.cerise, -8)}
      {capsule(440, 582, C.cuivre, 6)}
      {capsule(800, 578, C.feuille, -4)}
      {capsule(866, 570, "#5a321a", 10)}
    </CadreIllu>
  );
};

// ── Eau : une goutte tombe dans le verre, les minéraux flottent ────────────
export const IlluEau: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const q = cycle(f, 2);
  const chute = q < 0.55 ? q / 0.55 : 1;
  const onde = q >= 0.55 ? (q - 0.55) / 0.45 : 0;
  return (
    <CadreIllu libelle={libelle}>
      <path d="M 490 250 L 506 600 Q 508 616 524 616 L 676 616 Q 692 616 694 600 L 710 250" fill={C.crema} opacity={0.05} />
      <defs>
        <clipPath id="eau-verre">
          <path d="M 496 330 L 510 598 Q 512 610 524 610 L 676 610 Q 688 610 690 598 L 704 330 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#eau-verre)">
        <rect x={480} y={330} width={240} height={300} fill="#d9e6ea" opacity={0.16} />
        {Array.from({ length: 16 }).map((_, i) => (
          <circle
            key={i}
            cx={515 + random(`em-x-${i}`) * 170}
            cy={360 + random(`em-y-${i}`) * 230 + Math.sin(tour(f, 1, i / 16)) * 6}
            r={2 + random(`em-r-${i}`) * 3}
            fill={i % 3 ? C.crema : C.feuilleClaire}
            opacity={0.5}
          />
        ))}
      </g>
      <line x1={496} y1={330} x2={704} y2={330} stroke="#f6f1ea" strokeWidth={3} opacity={0.6} />
      {onde > 0 ? (
        <ellipse cx={600} cy={330} rx={10 + onde * 80} ry={(10 + onde * 80) * 0.15} fill="none" stroke="#f6f1ea" strokeWidth={3} opacity={1 - onde} />
      ) : null}
      {chute < 1 ? (
        <path
          d="M 0 -18 C 8 -6 12 2 12 8 A 12 12 0 1 1 -12 8 C -12 2 -8 -6 0 -18 Z"
          transform={`translate(600 ${120 + chute * chute * 200})`}
          fill="#d9e6ea"
          opacity={0.85}
        />
      ) : null}
      <path d="M 490 250 L 506 600 Q 508 616 524 616 L 676 616 Q 692 616 694 600 L 710 250" fill="none" stroke={C.crema} strokeWidth={4.5} strokeLinejoin="round" />
      <ellipse cx={600} cy={250} rx={110} ry={16} fill="none" stroke={C.crema} strokeWidth={4} />
      <path d="M 512 290 L 526 580" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.1} />
      {/* stylo TDS */}
      <g transform="rotate(-12 820 420)">
        <rect x={800} y={250} width={44} height={300} rx={14} fill={C.corps} stroke={C.crema} strokeWidth={4} />
        <rect x={808} y={300} width={28} height={70} rx={5} fill={C.nuit} stroke={C.crema} strokeWidth={2.5} />
        <text x={822} y={344} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15 }} fill="#f4c690" transform="rotate(-90 822 338)">
          TDS
        </text>
        <rect x={814} y={550} width={16} height={28} rx={4} fill={C.crema} opacity={0.7} />
      </g>
    </CadreIllu>
  );
};

// ── Mousse de lait : pichet, buse vapeur, tourbillon ────────────────────────
export const IlluMousse: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const r = tour(f, 2);
  return (
    <CadreIllu libelle={libelle}>
      {/* buse */}
      <path d="M 640 60 L 640 200 Q 640 236 612 262 L 590 286" fill="none" stroke={C.crema} strokeWidth={16} strokeLinecap="round" />
      <path d="M 640 60 L 640 200 Q 640 236 612 262 L 590 286" fill="none" stroke={C.corps} strokeWidth={7} strokeLinecap="round" />
      {/* pichet */}
      <path d="M 470 300 L 452 300 Q 438 300 442 312 L 478 324 L 500 600 Q 502 616 518 616 L 682 616 Q 698 616 700 600 L 722 300 Z" fill={C.corps} stroke={C.crema} strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M 716 360 C 790 360 800 470 712 486" fill="none" stroke={C.crema} strokeWidth={12} strokeLinecap="round" />
      <path d="M 716 360 C 790 360 800 470 712 486" fill="none" stroke={C.corps} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={596} cy={330} rx={114} ry={18} fill="#efe4d2" stroke={C.crema} strokeWidth={3} />
      {[0, 1, 2].map((k) => (
        <ellipse
          key={k}
          cx={596}
          cy={330}
          rx={30 + k * 26}
          ry={(30 + k * 26) * 0.16}
          fill="none"
          stroke="#c8b08a"
          strokeWidth={2.5}
          pathLength={1}
          strokeDasharray="0.3 0.2"
          strokeDashoffset={-((r / (Math.PI * 2)) % 1) * (k % 2 ? -1 : 1)}
          opacity={0.8}
        />
      ))}
      <path d="M 512 360 L 528 580" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.08} />
      <VapeurBoucle x={580} y={300} hauteur={90} intensite={0.7} />
      {/* thermomètre à pince */}
      <line x1={680} y1={250} x2={668} y2={470} stroke={C.crema} strokeWidth={4} />
      <circle cx={682} cy={230} r={28} fill={C.nuit} stroke={C.crema} strokeWidth={4} />
      <line
        x1={682}
        y1={230}
        x2={682 + Math.sin(0.6 + Math.sin(r) * 0.08) * 20}
        y2={230 - Math.cos(0.6 + Math.sin(r) * 0.08) * 20}
        stroke={C.ceriseVive}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </CadreIllu>
  );
};
