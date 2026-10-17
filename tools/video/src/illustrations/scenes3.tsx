import { random, useCurrentFrame } from "remotion";
import { C, SANS, SERIF } from "../theme";
import { CadreIllu, VapeurBoucle, cycle, tour } from "./Cadre";

type Pt = { x: number; y: number };

const Grain: React.FC<{ x: number; y: number; r?: number; angle?: number }> = ({ x, y, r = 1, angle = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${r})`}>
    <ellipse cx={0} cy={0} rx={14} ry={9.5} fill="#6b3f22" stroke="#2a140a" strokeWidth={1.2} />
    <path d="M -11 1 C -5 -5 3 6 11 -1" fill="none" stroke="#2a140a" strokeWidth={2} strokeLinecap="round" />
  </g>
);

const trait = { stroke: C.crema, strokeWidth: 4.5, strokeLinejoin: "round" as const };

// Sachet de café miniature, repère : milieu du haut.
const Pochon: React.FC<{ x: number; y: number; s?: number; angle?: number }> = ({ x, y, s = 1, angle = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`}>
    <path d="M -52 26 L -60 230 Q -60 238 -52 238 L 52 238 Q 60 238 60 230 L 52 26 Z" fill={C.corps} {...trait} strokeWidth={4} />
    <rect x={-52} y={0} width={104} height={26} rx={3} fill={C.corps} stroke={C.crema} strokeWidth={4} />
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={i} x1={-42 + i * 12} y1={5} x2={-42 + i * 12} y2={21} stroke={C.crema} strokeWidth={1.5} opacity={0.3} />
    ))}
    <circle cx={0} cy={50} r={8} fill={C.nuit} stroke={C.crema} strokeWidth={2.5} />
    <rect x={-38} y={78} width={76} height={96} rx={5} fill={C.papier} opacity={0.92} />
    <circle cx={0} cy={104} r={13} fill="none" stroke={C.cerise} strokeWidth={3} />
    <path d="M -5 104 C -3 98 3 98 5 104 C 3 110 -3 110 -5 104 Z" fill={C.cerise} />
    <rect x={-26} y={128} width={52} height={7} rx={3} fill="#3a2819" />
    <rect x={-22} y={142} width={44} height={4} rx={2} fill="#8a7766" />
    <rect x={-24} y={152} width={48} height={4} rx={2} fill="#8a7766" />
  </g>
);

// ── Colis d'abonnement : deux sachets dépassent, le cycle tourne ───────────
export const IlluColis: React.FC<{ libelle?: string; cadeau?: boolean }> = ({ libelle, cadeau = false }) => {
  const f = useCurrentFrame();
  if (cadeau) return <Cadeau libelle={libelle} f={f} />;
  const flotte = (k: number) => Math.sin(tour(f, 1, k)) * 7;
  const rot = cycle(f, 1) * 360;
  const arc = (a1: number, a2: number) => {
    const p = (a: number) => `${(930 + Math.cos((a * Math.PI) / 180) * 46).toFixed(1)} ${(176 - Math.sin((a * Math.PI) / 180) * 46).toFixed(1)}`;
    return `M ${p(a1)} A 46 46 0 0 0 ${p(a2)}`;
  };
  return (
    <CadreIllu libelle={libelle}>
      <defs>
        <marker id="fleche-colis" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill={C.crema} />
        </marker>
      </defs>
      {/* rabat arrière et fond de la boîte */}
      <path d="M 510 290 L 830 290 L 846 212 L 526 212 Z" fill={C.espressoChaud} {...trait} strokeWidth={4} />
      <path d="M 440 330 L 510 290 L 830 290 L 760 330 Z" fill={C.nuit} />
      <Pochon x={572} y={150 + flotte(0)} s={0.95} angle={-6} />
      <Pochon x={700} y={186 + flotte(0.35)} s={0.85} angle={9} />
      {/* faces */}
      <path d="M 760 330 L 830 290 L 830 540 L 760 580 Z" fill={C.corps} {...trait} />
      <path d="M 440 330 L 760 330 L 760 580 L 440 580 Z" fill={C.corps} {...trait} />
      <path d="M 452 352 L 452 560" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.06} />
      {/* étiquette d'adresse et pictogramme « haut » */}
      <rect x={478} y={430} width={136} height={84} rx={6} fill={C.papier} opacity={0.9} />
      <rect x={494} y={448} width={70} height={8} rx={3} fill="#3a2819" />
      {[466, 480, 494].map((y, i) => (
        <rect key={y} x={494} y={y} width={100 - i * 14} height={5} rx={2} fill="#8a7766" />
      ))}
      {[680, 712].map((x) => (
        <path key={x} d={`M ${x} 500 L ${x} 452 M ${x - 12} 466 L ${x} 452 L ${x + 12} 466`} fill="none" stroke={C.crema} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
      ))}
      <line x1={668} y1={512} x2={724} y2={512} stroke={C.crema} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      {/* rabats ouverts */}
      <path d="M 440 330 L 760 330 L 746 390 L 454 390 Z" fill={C.espressoChaud} {...trait} strokeWidth={4} />
      <path d="M 440 330 L 510 290 L 470 236 L 398 274 Z" fill={C.espressoChaud} {...trait} strokeWidth={4} />
      <path d="M 760 330 L 830 290 L 898 268 L 830 310 Z" fill={C.espressoChaud} {...trait} strokeWidth={4} />
      {/* le cycle de l'abonnement */}
      <g transform={`rotate(${rot} 930 176)`}>
        <path d={arc(25, 155)} fill="none" stroke={C.crema} strokeWidth={5} strokeLinecap="round" markerEnd="url(#fleche-colis)" />
        <path d={arc(205, 335)} fill="none" stroke={C.crema} strokeWidth={5} strokeLinecap="round" markerEnd="url(#fleche-colis)" />
      </g>
      <circle cx={930} cy={176} r={9} fill={C.ceriseVive} />
    </CadreIllu>
  );
};

const Cadeau: React.FC<{ libelle?: string; f: number }> = ({ libelle, f }) => {
  const respire = 1 + Math.sin(tour(f, 2)) * 0.05;
  const balance = Math.sin(tour(f, 1)) * 8;
  return (
    <CadreIllu libelle={libelle}>
      {/* boîte */}
      <path d="M 750 340 L 810 306 L 810 556 L 750 590 Z" fill={C.corps} {...trait} />
      <rect x={450} y={340} width={300} height={250} fill={C.corps} {...trait} />
      <rect x={585} y={340} width={30} height={250} fill={C.cerise} />
      <path d="M 750 450 L 810 416 L 810 446 L 750 480 Z" fill={C.cerise} />
      <path d="M 464 360 L 464 570" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.06} />
      {/* couvercle */}
      <path d="M 436 300 L 498 264 L 826 264 L 764 300 Z" fill={C.espressoChaud} {...trait} />
      <path d="M 585 300 L 615 300 L 677 264 L 647 264 Z" fill={C.cerise} />
      <path d="M 462 286 L 790 286 L 800 279 L 472 279 Z" fill={C.cerise} />
      <path d="M 764 300 L 826 264 L 826 314 L 764 350 Z" fill={C.corps} {...trait} />
      <rect x={436} y={300} width={328} height={50} fill={C.corps} {...trait} />
      <rect x={585} y={300} width={30} height={50} fill={C.cerise} />
      {/* nœud */}
      <g transform={`translate(632 280) scale(${respire} ${2 - respire})`}>
        <path d="M 0 0 C -10 22 -28 40 -46 52" fill="none" stroke={C.cerise} strokeWidth={11} strokeLinecap="round" />
        <path d="M 0 0 C 12 20 30 36 50 46" fill="none" stroke={C.cerise} strokeWidth={11} strokeLinecap="round" />
        <path d="M 0 0 C -30 -54 -100 -44 -84 -6 C -74 16 -32 10 0 0 Z" fill={C.ceriseVive} stroke={C.crema} strokeWidth={3} />
        <path d="M 0 0 C 30 -54 100 -44 84 -6 C 74 16 32 10 0 0 Z" fill={C.ceriseVive} stroke={C.crema} strokeWidth={3} />
        <circle r={12} fill={C.cerise} stroke={C.crema} strokeWidth={3} />
      </g>
      {/* étiquette qui se balance */}
      <g transform={`rotate(${balance} 700 350)`}>
        <path d="M 700 350 L 706 412" stroke={C.crema} strokeWidth={2} />
        <g transform="rotate(-8 706 440)">
          <path d="M 676 418 L 736 418 L 736 462 L 676 462 L 662 440 Z" fill={C.papier} opacity={0.95} />
          <circle cx={672} cy={440} r={3} fill={C.corps} />
          <g transform="translate(708 440) scale(0.9)">
            <ellipse rx={14} ry={9.5} fill="#6b3f22" />
            <path d="M -11 1 C -5 -5 3 6 11 -1" fill="none" stroke="#f3ebdf" strokeWidth={2} strokeLinecap="round" />
          </g>
        </g>
      </g>
      {Array.from({ length: 7 }).map((_, i) => (
        <Grain key={i} x={850 + random(`cd-x-${i}`) * 110} y={572 + random(`cd-y-${i}`) * 20} angle={random(`cd-a-${i}`) * 180} />
      ))}
    </CadreIllu>
  );
};

// ── Machine espresso domestique, vue de face ────────────────────────────────
export const IlluMachineEspresso: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const aiguille = ((40 + Math.sin(tour(f, 3)) * 4 + Math.sin(tour(f, 17)) * 1) * Math.PI) / 180;
  const ondule = (k: number) => Math.sin(tour(f, 12, k)) * 1.3;
  return (
    <CadreIllu libelle={libelle}>
      <g transform="translate(-26 0)">
        {[480, 556].map((x) => (
          <path key={x} d={`M ${x - 28} 150 C ${x - 26} 124 ${x - 14} 116 ${x} 116 C ${x + 14} 116 ${x + 26} 124 ${x + 28} 150 Z`} fill={C.corps} stroke={C.crema} strokeWidth={3.5} />
        ))}
        <rect x={420} y={150} width={360} height={10} rx={4} fill={C.nuit} stroke={C.crema} strokeWidth={3} />
        <rect x={400} y={160} width={400} height={400} rx={26} fill={C.corps} {...trait} />
        <path d="M 424 196 L 424 280" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.06} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx={466 + i * 44} cy={214} r={13} fill={C.nuit} stroke={C.crema} strokeWidth={3} />
            {i === 0 ? <circle cx={466} cy={214} r={5} fill={C.ceriseVive} /> : null}
          </g>
        ))}
        {/* manomètre */}
        <circle cx={704} cy={214} r={38} fill={C.nuit} stroke={C.crema} strokeWidth={4} />
        {Array.from({ length: 13 }).map((_, i) => {
          const a = ((-120 + i * 20) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={704 + Math.sin(a) * 27}
              y1={214 - Math.cos(a) * 27}
              x2={704 + Math.sin(a) * (i % 3 ? 31 : 33)}
              y2={214 - Math.cos(a) * (i % 3 ? 31 : 33)}
              stroke={i > 7 ? C.ceriseVive : C.crema}
              strokeWidth={2.5}
              opacity={0.8}
            />
          );
        })}
        <line x1={704} y1={214} x2={704 + Math.sin(aiguille) * 25} y2={214 - Math.cos(aiguille) * 25} stroke={C.ceriseVive} strokeWidth={3.5} strokeLinecap="round" />
        <circle cx={704} cy={214} r={4.5} fill={C.crema} />
        {/* groupe et porte-filtre */}
        <rect x={512} y={252} width={136} height={14} rx={6} fill={C.corps} stroke={C.crema} strokeWidth={3.5} />
        <rect x={524} y={264} width={112} height={28} rx={8} fill={C.nuit} stroke={C.crema} strokeWidth={4} />
        <path d="M 534 292 L 626 292 L 622 318 Q 620 330 606 330 L 554 330 Q 540 330 538 318 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} />
        <path d="M 624 300 L 760 314 Q 772 316 770 328 Q 768 338 756 336 L 622 320 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 568 330 L 568 342 M 592 330 L 592 342" stroke={C.crema} strokeWidth={6} strokeLinecap="round" />
        {[568, 592].map((x, k) => (
          <path key={x} d={`M ${x} 344 Q ${x + ondule(k * 0.5)} 400 ${x + (k ? -6 : 6)} 450`} stroke="#b8763e" strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        {/* tasse */}
        <path d="M 540 448 C 542 492 560 508 580 508 C 600 508 618 492 620 448 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} />
        <ellipse cx={580} cy={448} rx={40} ry={8} fill="#c08a55" stroke={C.crema} strokeWidth={3} />
        <path d="M 616 462 C 642 462 642 492 614 494" fill="none" stroke={C.crema} strokeWidth={6} />
        <ellipse cx={580} cy={512} rx={58} ry={8} fill={C.corps} stroke={C.crema} strokeWidth={3} />
        {/* égouttoir */}
        <rect x={440} y={520} width={300} height={22} rx={6} fill={C.nuit} stroke={C.crema} strokeWidth={3.5} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={458 + i * 24} y1={525} x2={458 + i * 24} y2={537} stroke={C.crema} strokeWidth={2} opacity={0.45} />
        ))}
        {/* réservoir : niveau et bulles */}
        <rect x={418} y={300} width={22} height={200} rx={8} fill={C.nuit} stroke={C.crema} strokeWidth={3} />
        <rect x={421} y={362} width={16} height={135} rx={6} fill="#d9e6ea" opacity={0.28} />
        {[0, 1].map((i) => {
          const q = cycle(f, 2, i / 2);
          return <circle key={i} cx={429} cy={490 - q * 124} r={2.6} fill="#f6f1ea" opacity={(1 - q) * 0.7} />;
        })}
        {/* buse vapeur */}
        <path d="M 806 262 L 836 300 L 852 480" fill="none" stroke={C.crema} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 806 262 L 836 300 L 852 480" fill="none" stroke={C.corps} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={808} cy={250} r={13} fill={C.corps} stroke={C.crema} strokeWidth={3.5} />
        <rect x={420} y={560} width={40} height={12} rx={4} fill={C.corps} stroke={C.crema} strokeWidth={3} />
        <rect x={740} y={560} width={40} height={12} rx={4} fill={C.corps} stroke={C.crema} strokeWidth={3} />
      </g>
    </CadreIllu>
  );
};

// ── Cafetière filtre électrique : réservoir, douchette, carafe ─────────────
const CARAFE = "M 636 302 L 764 302 L 770 330 Q 806 380 806 460 Q 806 536 760 538 L 640 538 Q 594 536 594 460 Q 594 380 630 330 Z";
export const IlluCafetiere: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const bras = "M 470 140 L 470 106 Q 470 92 484 92 L 686 92 Q 700 92 700 106 L 700 150";
  return (
    <CadreIllu libelle={libelle}>
      <g transform="translate(-26 0)">
        <defs>
          <clipPath id="carafe-int">
            <path d={CARAFE} />
          </clipPath>
          <linearGradient id="carafe-cafe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b3a1c" />
            <stop offset="100%" stopColor="#2e160a" />
          </linearGradient>
        </defs>
        <path d={bras} fill="none" stroke={C.crema} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        <path d={bras} fill="none" stroke={C.corps} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        {/* réservoir */}
        <rect x={410} y={140} width={120} height={200} rx={12} fill={C.crema} fillOpacity={0.05} {...trait} />
        <rect x={414} y={214} width={112} height={122} rx={8} fill="#d9e6ea" opacity={0.16} />
        <line x1={414} y1={214} x2={526} y2={214} stroke="#f6f1ea" strokeWidth={2.5} opacity={0.5} />
        <rect x={464} y={150} width={12} height={186} rx={5} fill="none" stroke={C.crema} strokeWidth={2} opacity={0.5} />
        {Array.from({ length: 5 }).map((_, i) => {
          const q = cycle(f, 3, i / 5);
          return <circle key={i} cx={470} cy={330 - q * 180} r={3.2} fill="#f6f1ea" opacity={0.75 * Math.sin(Math.PI * q)} />;
        })}
        {[250, 280, 310].map((y) => (
          <line key={y} x1={512} y1={y} x2={526} y2={y} stroke={C.crema} strokeWidth={2.5} opacity={0.6} />
        ))}
        {/* bloc de chauffe, socle, interrupteur */}
        <rect x={410} y={340} width={120} height={200} rx={10} fill={C.corps} {...trait} />
        <path d="M 428 362 L 428 520" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.06} />
        <rect x={396} y={540} width={428} height={42} rx={10} fill={C.corps} {...trait} />
        <rect x={426} y={552} width={34} height={18} rx={5} fill={C.nuit} stroke={C.crema} strokeWidth={2.5} />
        <circle cx={488} cy={561} r={6} fill={C.ceriseVive} opacity={0.75 + Math.sin(tour(f, 2)) * 0.25} />
        <ellipse cx={700} cy={540} rx={104} ry={9} fill={C.nuit} stroke={C.crema} strokeWidth={3} />
        {/* porte-filtre */}
        <path d="M 606 156 L 794 156 L 742 266 L 658 266 Z" fill={C.corps} {...trait} />
        <path d="M 614 162 L 786 162" stroke={C.papier} strokeWidth={5} opacity={0.55} />
        <path d="M 622 176 L 666 258" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.07} />
        <rect x={690} y={266} width={20} height={14} rx={3} fill={C.nuit} stroke={C.crema} strokeWidth={3} />
        {/* carafe */}
        <g clipPath="url(#carafe-int)">
          <rect x={590} y={456} width={220} height={90} fill="url(#carafe-cafe)" />
          <ellipse cx={700} cy={456} rx={106} ry={11} fill="#8a5532" opacity={0.85} />
          {[0, 0.5].map((d) => {
            const q = cycle(f, 6, d);
            return <ellipse key={d} cx={700} cy={456} rx={6 + q * 70} ry={(6 + q * 70) * 0.12} fill="none" stroke="#e7c9a2" strokeWidth={2} opacity={(1 - q) * 0.6} />;
          })}
        </g>
        {[0, 1, 2].map((i) => {
          const q = cycle(f, 6, i / 3);
          return <ellipse key={i} cx={700} cy={286 + q * q * 166} rx={3.5} ry={5} fill="#7a4a2a" opacity={0.9} />;
        })}
        <path d={CARAFE} fill={C.crema} fillOpacity={0.05} {...trait} />
        <path d="M 790 342 C 846 342 862 382 862 422 C 862 470 842 500 800 504" fill="none" stroke={C.crema} strokeWidth={14} strokeLinecap="round" />
        <path d="M 790 342 C 846 342 862 382 862 422 C 862 470 842 500 800 504" fill="none" stroke={C.corps} strokeWidth={6} strokeLinecap="round" />
        <path d="M 628 290 L 772 290 L 768 302 L 632 302 Z" fill={C.corps} stroke={C.crema} strokeWidth={3.5} strokeLinejoin="round" />
        <path d="M 614 400 Q 608 460 626 512" fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.1} />
        {[420, 450, 480, 510].map((y) => (
          <line key={y} x1={776} y1={y} x2={790} y2={y} stroke={C.crema} strokeWidth={2.5} opacity={0.5} />
        ))}
      </g>
    </CadreIllu>
  );
};

// ── Ristretto, espresso, lungo : trois verres, trois niveaux ───────────────
export const IlluTrioTasses: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const top = 250;
  const bas = 470;
  const verres = [
    { cx: 360, nom: "ristretto", niveau: 0.24, creme: 18, teinte: "#9a6236" },
    { cx: 600, nom: "espresso", niveau: 0.44, creme: 15, teinte: "#b47a46" },
    { cx: 840, nom: "lungo", niveau: 0.84, creme: 10, teinte: "#cf9a62" },
  ];
  const demi = (y: number) => 50 + (12 * (bas - y)) / (bas - top);
  return (
    <CadreIllu libelle={libelle}>
      {verres.map((v, i) => {
        const fond = bas - 16;
        const yl = fond - v.niveau * (fond - top - 14);
        const yc = yl - v.creme;
        const forme = `M ${v.cx - 62} ${top} L ${v.cx - 50} ${bas} L ${v.cx + 50} ${bas} L ${v.cx + 62} ${top}`;
        const interieur = `M ${v.cx - demi(top) + 6} ${top} L ${v.cx - 44} ${fond} L ${v.cx + 44} ${fond} L ${v.cx + demi(top) - 6} ${top} Z`;
        return (
          <g key={v.nom}>
            <defs>
              <clipPath id={`trio-${i}`}>
                <path d={interieur} />
              </clipPath>
            </defs>
            <ellipse cx={v.cx} cy={bas + 6} rx={92} ry={12} fill={C.corps} stroke={C.crema} strokeWidth={3} opacity={0.9} />
            <g clipPath={`url(#trio-${i})`}>
              <rect x={v.cx - 80} y={yl} width={160} height={fond - yl + 4} fill="#3b1d0f" />
              <rect x={v.cx - 80} y={yc} width={160} height={v.creme + 1} fill={v.teinte} />
              {Array.from({ length: 4 }).map((_, j) => {
                const q = cycle(f, 2, (j + i) / 4);
                return <circle key={j} cx={v.cx - 26 + j * 17} cy={fond - 4 - q * (fond - yl - 8)} r={1.8} fill={v.teinte} opacity={0.6 * (1 - q)} />;
              })}
            </g>
            <ellipse cx={v.cx} cy={yc} rx={demi(yc) - 6} ry={(demi(yc) - 6) * 0.14} fill={v.teinte} />
            <ellipse
              cx={v.cx - 12 + Math.sin(tour(f, 1, i / 3)) * 8}
              cy={yc}
              rx={(demi(yc) - 6) * 0.35}
              ry={(demi(yc) - 6) * 0.05}
              fill="#f6efe3"
              opacity={0.3}
            />
            <path d={forme} fill={C.crema} fillOpacity={0.05} stroke={C.crema} strokeWidth={4.5} strokeLinejoin="round" />
            <line x1={v.cx - 48} y1={fond} x2={v.cx + 48} y2={fond} stroke={C.crema} strokeWidth={2.5} opacity={0.5} />
            <ellipse cx={v.cx} cy={top} rx={62} ry={9} fill="none" stroke={C.crema} strokeWidth={4} />
            <path d={`M ${v.cx - 48} ${top + 24} L ${v.cx - 40} ${bas - 26}`} stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.1} />
            <VapeurBoucle x={v.cx} y={top - 4} hauteur={70} ecart={12} intensite={0.6} />
            <text x={v.cx} y={bas + 72} textAnchor="middle" style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 44 }} fill={C.creme}>
              {v.nom}
            </text>
          </g>
        );
      })}
    </CadreIllu>
  );
};

// ── Jauge d'extraction : l'aiguille hésite du côté acide ou amer ──────────
export const IlluExtraction: React.FC<{ libelle?: string; cote: "acide" | "amer" }> = ({ libelle, cote }) => {
  const f = useCurrentFrame();
  const cx = 600;
  const cy = 470;
  const R = 250;
  const pt = (a: number, r: number): Pt => ({ x: cx + r * Math.cos((a * Math.PI) / 180), y: cy - r * Math.sin((a * Math.PI) / 180) });
  const arc = (a1: number, a2: number, r: number) => {
    const p = pt(a1, r);
    const q = pt(a2, r);
    return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} A ${r} ${r} 0 0 1 ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  };
  const zones = [
    { a1: 180, a2: 121.5, nom: "acide", am: 150 },
    { a1: 118.5, a2: 61.5, nom: "équilibré", am: 90 },
    { a1: 58.5, a2: 0, nom: "amer", am: 30 },
  ];
  const actif = cote === "acide" ? 0 : 2;
  const a = (cote === "acide" ? 147 : 33) + Math.sin(tour(f, 2)) * 7 + Math.sin(tour(f, 11)) * 1.2;
  const pointe = pt(a, 205);
  const g = pt(a + 90, 9);
  const d = pt(a - 90, 9);
  const queue = pt(a + 180, 34);
  return (
    <CadreIllu libelle={libelle}>
      {zones.map((z, i) => (
        <path key={z.nom} d={arc(z.a1, z.a2, R)} fill="none" stroke={i === actif ? C.ceriseVive : C.crema} strokeWidth={26} opacity={i === actif ? 0.9 : 0.22} />
      ))}
      {Array.from({ length: 31 }).map((_, i) => {
        const t = i * 6;
        const p = pt(t, R - 24);
        const q = pt(t, R - (i % 5 ? 38 : 50));
        return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.crema} strokeWidth={i % 5 ? 2 : 3.5} opacity={0.65} />;
      })}
      {zones.map((z, i) => {
        const p = pt(z.am, R + 52);
        return (
          <text
            key={z.nom}
            x={p.x}
            y={p.y + 14}
            textAnchor="middle"
            style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 42 }}
            fill={i === actif ? C.creme : C.crema}
            opacity={i === actif ? 1 : 0.55}
          >
            {z.nom}
          </text>
        );
      })}
      <path d={`M ${pointe.x} ${pointe.y} L ${g.x} ${g.y} L ${queue.x} ${queue.y} L ${d.x} ${d.y} Z`} fill={C.creme} />
      <circle cx={cx} cy={cy} r={20} fill={C.corps} stroke={C.crema} strokeWidth={4} />
      <circle cx={cx} cy={cy} r={6} fill={C.ceriseVive} />
      <text x={cx} y={cy + 72} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: "0.18em" }} fill={C.crema} opacity={0.8}>
        {cote === "acide" ? "SOUS-EXTRAIT" : "SUR-EXTRAIT"}
      </text>
    </CadreIllu>
  );
};

// ── Molécule de caféine (formule topologique), qui flotte ──────────────────
export const IlluMolecule: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const R = 88;
  const H = { x: 566, y: 336 };
  const rad = (d: number) => (d * Math.PI) / 180;
  const hex = (deg: number): Pt => ({ x: H.x + R * Math.cos(rad(deg)), y: H.y - R * Math.sin(rad(deg)) });
  const C6 = hex(90);
  const N1 = hex(150);
  const C2 = hex(210);
  const N3 = hex(270);
  const C4 = hex(330);
  const C5 = hex(30);
  const apo = R / (2 * Math.tan(Math.PI / 5));
  const Rp = R / (2 * Math.sin(Math.PI / 5));
  const P = { x: C5.x + apo, y: H.y };
  const pent = (deg: number): Pt => ({ x: P.x + Rp * Math.cos(rad(deg)), y: P.y + Rp * Math.sin(rad(deg)) });
  const N7 = pent(-72);
  const C8 = pent(0);
  const N9 = pent(72);
  const ext = (a: Pt, ux: number, uy: number, L = 74): Pt => ({ x: a.x + ux * L, y: a.y + uy * L });
  const O6 = ext(C6, 0, -1);
  const Me1 = ext(N1, -0.866, -0.5);
  const O2 = ext(C2, -0.866, 0.5);
  const Me3 = ext(N3, 0, 1);
  const Me7 = ext(N7, Math.cos(rad(-72)), Math.sin(rad(-72)));
  const atomes = new Map<Pt, { t: string; r: number }>([
    [N1, { t: "N", r: 20 }],
    [N3, { t: "N", r: 20 }],
    [N7, { t: "N", r: 20 }],
    [N9, { t: "N", r: 20 }],
    [O6, { t: "O", r: 20 }],
    [O2, { t: "O", r: 20 }],
    [Me1, { t: "CH3", r: 34 }],
    [Me3, { t: "CH3", r: 26 }],
    [Me7, { t: "CH3", r: 30 }],
  ]);
  const coupe = (a: Pt, b: Pt) => {
    const L = Math.hypot(b.x - a.x, b.y - a.y);
    const ux = (b.x - a.x) / L;
    const uy = (b.y - a.y) / L;
    const ra = atomes.get(a)?.r ?? 0;
    const rb = atomes.get(b)?.r ?? 0;
    return { a: { x: a.x + ux * ra, y: a.y + uy * ra }, b: { x: b.x - ux * rb, y: b.y - uy * rb }, ux, uy };
  };
  const liaison = (a: Pt, b: Pt, type: "simple" | "double" | "interne", centre?: Pt) => {
    const { a: p, b: q, ux, uy } = coupe(a, b);
    const lignes: React.ReactNode[] = [];
    if (type === "double") {
      const nx = -uy * 5;
      const ny = ux * 5;
      lignes.push(<line key="1" x1={p.x + nx} y1={p.y + ny} x2={q.x + nx} y2={q.y + ny} />);
      lignes.push(<line key="2" x1={p.x - nx} y1={p.y - ny} x2={q.x - nx} y2={q.y - ny} />);
    } else {
      lignes.push(<line key="1" x1={p.x} y1={p.y} x2={q.x} y2={q.y} />);
      if (type === "interne" && centre) {
        const mx = (p.x + q.x) / 2;
        const my = (p.y + q.y) / 2;
        const L = Math.hypot(centre.x - mx, centre.y - my);
        const ox = ((centre.x - mx) / L) * 11;
        const oy = ((centre.y - my) / L) * 11;
        const r = 0.16;
        lignes.push(
          <line key="2" x1={p.x + (q.x - p.x) * r + ox} y1={p.y + (q.y - p.y) * r + oy} x2={q.x - (q.x - p.x) * r + ox} y2={q.y - (q.y - p.y) * r + oy} />,
        );
      }
    }
    return lignes;
  };
  const liaisons = [
    liaison(C6, N1, "simple"),
    liaison(N1, C2, "simple"),
    liaison(C2, N3, "simple"),
    liaison(N3, C4, "simple"),
    liaison(C4, C5, "interne", H),
    liaison(C5, C6, "simple"),
    liaison(C5, N7, "simple"),
    liaison(N7, C8, "simple"),
    liaison(C8, N9, "interne", P),
    liaison(N9, C4, "simple"),
    liaison(C6, O6, "double"),
    liaison(C2, O2, "double"),
    liaison(N1, Me1, "simple"),
    liaison(N3, Me3, "simple"),
    liaison(N7, Me7, "simple"),
  ];
  const dy = Math.sin(tour(f, 1)) * 8;
  const rot = Math.sin(tour(f, 1, 0.25)) * 2.5;
  const electron = (c: Pt, r: number, k: number, d: number) => {
    const a = tour(f, k, d);
    return <circle cx={c.x + Math.cos(a) * r} cy={c.y + Math.sin(a) * r} r={4} fill={C.ceriseVive} opacity={0.85} />;
  };
  return (
    <CadreIllu libelle={libelle}>
      <g transform={`translate(0 ${dy}) rotate(${rot} ${H.x} ${H.y})`}>
        <g stroke={C.crema} strokeWidth={4.5} strokeLinecap="round">
          {liaisons}
        </g>
        {electron(H, 50, 1, 0)}
        {electron(H, 50, 1, 0.5)}
        {electron(P, 36, -1, 0.25)}
        {[...atomes.entries()].map(([p, a], i) =>
          a.t === "CH3" ? (
            <text key={i} x={p.x} y={p.y + 12} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32 }} fill={C.creme}>
              CH
              <tspan dy={8} style={{ fontSize: 21 }}>
                3
              </tspan>
            </text>
          ) : (
            <text
              key={i}
              x={p.x}
              y={p.y + 12}
              textAnchor="middle"
              style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34 }}
              fill={a.t === "O" ? C.ceriseVive : C.creme}
            >
              {a.t}
            </text>
          ),
        )}
      </g>
      <text x={846} y={500} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 46 }} fill={C.crema} opacity={0.9}>
        C
        <tspan dy={10} style={{ fontSize: 28 }}>8</tspan>
        <tspan dy={-10}>H</tspan>
        <tspan dy={10} style={{ fontSize: 28 }}>10</tspan>
        <tspan dy={-10}>N</tspan>
        <tspan dy={10} style={{ fontSize: 28 }}>4</tspan>
        <tspan dy={-10}>O</tspan>
        <tspan dy={10} style={{ fontSize: 28 }}>2</tspan>
      </text>
    </CadreIllu>
  );
};

// ── Arabica et robusta : deux grains, deux formes ──────────────────────────
const GrosGrain: React.FC<{ x: number; y: number; rx: number; ry: number; angle: number; droit?: boolean }> = ({ x, y, rx, ry, angle, droit }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <ellipse rx={rx} ry={ry} fill="#6b3f22" stroke={C.crema} strokeWidth={4.5} />
    <ellipse cx={-rx * 0.32} cy={-ry * 0.42} rx={rx * 0.34} ry={ry * 0.16} fill="#ffffff" opacity={0.1} transform={`rotate(-8 ${-rx * 0.32} ${-ry * 0.42})`} />
    {droit ? (
      <path d={`M ${-rx * 0.78} 0 L ${rx * 0.78} 0`} stroke="#2a140a" strokeWidth={10} strokeLinecap="round" />
    ) : (
      <path
        d={`M ${-rx * 0.82} ${ry * 0.14} C ${-rx * 0.35} ${-ry * 0.6} ${rx * 0.25} ${ry * 0.6} ${rx * 0.82} ${-ry * 0.14}`}
        fill="none"
        stroke="#2a140a"
        strokeWidth={10}
        strokeLinecap="round"
      />
    )}
  </g>
);

export const IlluDeuxGrains: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const a1 = Math.sin(tour(f, 1)) * 4;
  const a2 = Math.sin(tour(f, 1, 0.5)) * 4;
  return (
    <CadreIllu libelle={libelle}>
      <ellipse cx={410} cy={446} rx={116 - a1} ry={14} fill="#000000" opacity={0.22} />
      <ellipse cx={800} cy={446} rx={100 - a2} ry={14} fill="#000000" opacity={0.22} />
      <GrosGrain x={410} y={320} rx={134} ry={84} angle={-16 + a1} />
      <GrosGrain x={800} y={320} rx={104} ry={92} angle={14 + a2} droit />
      <text x={410} y={530} textAnchor="middle" style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 52 }} fill={C.creme}>
        arabica
      </text>
      <text x={800} y={530} textAnchor="middle" style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 52 }} fill={C.creme}>
        robusta
      </text>
    </CadreIllu>
  );
};

// ── Altitude : l'arabica en haut, le robusta en bas, les nuages passent ────
export const IlluAltitude: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const MONT = "M 120 600 L 330 400 L 410 440 L 600 170 L 760 390 L 840 340 L 1080 600 Z";
  const buisson = (x: number, y: number, k: number, s = 1) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${Math.sin(tour(f, 1, k)) * 3}) scale(${s})`}>
      <path d="M 0 0 L 0 -18" stroke={C.cuivre} strokeWidth={4} strokeLinecap="round" />
      <circle cx={0} cy={-30} r={18} fill={C.feuille} fillOpacity={0.8} stroke={C.crema} strokeWidth={2.5} />
      <circle cx={-12} cy={-22} r={11} fill={C.feuille} fillOpacity={0.8} stroke={C.crema} strokeWidth={2.5} />
      <circle cx={12} cy={-22} r={11} fill={C.feuille} fillOpacity={0.8} stroke={C.crema} strokeWidth={2.5} />
      <circle cx={-5} cy={-27} r={3.4} fill={C.ceriseVive} />
      <circle cx={6} cy={-33} r={3.4} fill={C.ceriseVive} />
      <circle cx={8} cy={-22} r={3.4} fill={C.ceriseVive} />
    </g>
  );
  const nuage = (x: number, y: number, k: number, s: number) => (
    <g transform={`translate(${x + Math.sin(tour(f, 1, k)) * 26} ${y}) scale(${s})`}>
      <path
        d="M -70 20 Q -74 -6 -46 -8 Q -40 -36 -10 -32 Q 6 -52 32 -36 Q 62 -40 62 -10 Q 84 -6 76 20 Z"
        fill={C.creme}
        fillOpacity={0.1}
        stroke={C.crema}
        strokeWidth={3}
        strokeLinejoin="round"
        opacity={0.8}
      />
    </g>
  );
  return (
    <CadreIllu libelle={libelle}>
      {nuage(860, 170, 0, 1.1)}
      {nuage(330, 230, 0.4, 0.9)}
      <path d={MONT} fill={C.corps} {...trait} />
      <path d="M 600 170 L 560 260 L 590 250 L 610 300" fill="none" stroke={C.crema} strokeWidth={2.5} opacity={0.4} strokeLinejoin="round" />
      <path d="M 330 400 L 300 470 M 840 340 L 880 420" fill="none" stroke={C.crema} strokeWidth={2.5} opacity={0.35} />
      <line x1={110} y1={430} x2={1090} y2={430} stroke={C.crema} strokeWidth={2.5} strokeDasharray="10 10" opacity={0.55} />
      {[
        [520, 300, 0],
        [560, 340, 0.1],
        [660, 300, 0.2],
        [700, 350, 0.3],
        [610, 380, 0.15],
      ].map(([x, y, k]) => buisson(x, y, k, 0.9))}
      {[
        [300, 540, 0.05],
        [380, 580, 0.25],
        [860, 540, 0.35],
        [930, 580, 0.45],
        [800, 580, 0.55],
      ].map(([x, y, k]) => buisson(x, y, k, 1.05))}
      <text x={772} y={262} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 46 }} fill={C.creme}>
        arabica
      </text>
      <line x1={762} y1={250} x2={712} y2={290} stroke={C.creme} strokeWidth={2} />
      <text x={996} y={470} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 46 }} fill={C.creme}>
        robusta
      </text>
      <line x1={990} y1={480} x2={940} y2={530} stroke={C.creme} strokeWidth={2} />
    </CadreIllu>
  );
};

// ── Chiffres : barres qui respirent, courbe parcourue par un point ─────────
export const IlluChiffres: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const f = useCurrentFrame();
  const base = 540;
  const hauteurs = [120, 165, 150, 215, 255, 310];
  const barres = hauteurs.map((h, i) => ({ x: 420 + i * 76, h: h * (1 + Math.sin(tour(f, 1, i / 6)) * 0.04) }));
  const sommets = barres.map((b) => ({ x: b.x + 23, y: base - b.h - 26 }));
  const q = cycle(f, 1);
  const pos = q * (sommets.length - 1);
  const i0 = Math.min(sommets.length - 2, Math.floor(pos));
  const t = pos - i0;
  const point = { x: sommets[i0].x + (sommets[i0 + 1].x - sommets[i0].x) * t, y: sommets[i0].y + (sommets[i0 + 1].y - sommets[i0].y) * t };
  const derniere = barres[barres.length - 1];
  return (
    <CadreIllu libelle={libelle}>
      {[440, 360, 280, 200].map((y) => (
        <line key={y} x1={386} y1={y} x2={884} y2={y} stroke={C.crema} strokeWidth={1.5} strokeDasharray="2 8" opacity={0.35} />
      ))}
      {barres.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={base - b.h}
          width={46}
          height={b.h}
          rx={6}
          fill={i === barres.length - 1 ? C.cerise : C.corps}
          stroke={C.crema}
          strokeWidth={4}
        />
      ))}
      <path d={`M ${sommets.map((s) => `${s.x} ${s.y}`).join(" L ")}`} fill="none" stroke={C.creme} strokeWidth={3} strokeDasharray="8 8" opacity={0.7} />
      <circle cx={point.x} cy={point.y} r={9} fill={C.ceriseVive} stroke={C.creme} strokeWidth={3} opacity={Math.sin(Math.PI * q)} />
      <line x1={380} y1={base} x2={890} y2={base} stroke={C.crema} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={380} y1={base} x2={380} y2={170} stroke={C.crema} strokeWidth={4.5} strokeLinecap="round" />
      {/* tasse posée sur la dernière barre */}
      <g transform={`translate(${derniere.x + 23} ${base - derniere.h})`}>
        <path d="M -30 -46 C -28 -14 -16 0 0 0 C 16 0 28 -14 30 -46 Z" fill={C.corps} stroke={C.crema} strokeWidth={3.5} />
        <ellipse cx={0} cy={-46} rx={30} ry={6} fill="#c08a55" stroke={C.crema} strokeWidth={3} />
        <path d="M 27 -36 C 46 -36 46 -14 26 -12" fill="none" stroke={C.crema} strokeWidth={5} />
      </g>
      <VapeurBoucle x={derniere.x + 23} y={base - derniere.h - 52} hauteur={70} ecart={10} intensite={0.7} />
    </CadreIllu>
  );
};
