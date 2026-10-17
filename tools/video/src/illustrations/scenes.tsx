import { random, useCurrentFrame } from "remotion";
import { corpsPourPointe } from "../dessins/Bouilloire";
import { VueCtx } from "../dessins/Poste";
import { POSTE, Station } from "../dessins/Station";
import { C, SERIF } from "../theme";
import { CadreIllu, ILLU, VapeurBoucle, cycle, tour } from "./Cadre";
import TERRES from "./terres.json";

// Grain de café vu de dessus : ovale et fente en S.
const Grain: React.FC<{ x: number; y: number; r?: number; angle?: number; teinte?: string }> = ({
  x,
  y,
  r = 1,
  angle = 0,
  teinte = "#6b3f22",
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${r})`}>
    <ellipse cx={0} cy={0} rx={14} ry={9.5} fill={teinte} stroke="#2a140a" strokeWidth={1.2} />
    <path d="M -11 1 C -5 -5 3 6 11 -1" fill="none" stroke="#2a140a" strokeWidth={2} strokeLinecap="round" />
    <ellipse cx={-5} cy={-4} rx={4} ry={1.8} fill="#ffffff" opacity={0.12} />
  </g>
);

// ── Moulin électrique : grains dans la trémie, mouture qui tombe ────────────
export const IlluMoulin: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const frame = useCurrentFrame();
  const vibre = Math.sin(tour(frame, 45)) * 0.8;
  const grains = Array.from({ length: 38 }).map((_, i) => {
    const x = 520 + random(`mg-x-${i}`) * 160;
    const y = 150 + random(`mg-y-${i}`) * 72;
    const dans = (x - 497) / 211 > (y - 95) / 130 * 0.3 && (705 - x) / 211 > (y - 95) / 130 * 0.3;
    return dans ? (
      <Grain key={i} x={x + Math.sin(tour(frame, 30, i * 0.07)) * 0.9} y={y} r={0.85} angle={random(`mg-a-${i}`) * 180} />
    ) : null;
  });
  const chute = Array.from({ length: 30 }).map((_, i) => {
    const q = cycle(frame, 6, i / 30);
    return (
      <circle
        key={i}
        cx={600 + (random(`mc-${i}`) - 0.5) * 12}
        cy={494 + q * q * 74}
        r={1.8 + random(`mr-${i}`) * 2}
        fill={i % 3 ? "#7a4a2a" : "#a46a3c"}
      />
    );
  });
  return (
    <CadreIllu libelle={libelle}>
      <g transform={`translate(${vibre} 0)`}>
        <defs>
          <clipPath id="trémie">
            <path d="M 499 98 L 557 223 L 643 223 L 701 98 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#trémie)">{grains}</g>
        <path d="M 495 95 L 555 225 L 645 225 L 705 95 Z" fill={C.crema} opacity={0.06} />
        <path d="M 495 95 L 555 225 L 645 225 L 705 95" fill="none" stroke={C.crema} strokeWidth={4.5} strokeLinejoin="round" />
        <ellipse cx={600} cy={95} rx={110} ry={14} fill={C.corps} stroke={C.crema} strokeWidth={4} />
        <rect x={585} y={70} width={30} height={14} rx={5} fill={C.corps} stroke={C.crema} strokeWidth={3} />
        <path d="M 512 112 L 562 214" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.1} />
        <rect x={548} y={224} width={104} height={22} rx={4} fill={C.corps} stroke={C.crema} strokeWidth={4} />
        <rect x={470} y={245} width={260} height={315} rx={28} fill={C.corps} stroke={C.crema} strokeWidth={4.5} />
        <path d="M 492 270 L 492 520" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.06} />
        {/* molette de mouture */}
        <circle cx={600} cy={335} r={44} fill={C.nuit} stroke={C.crema} strokeWidth={4} />
        {Array.from({ length: 13 }).map((_, i) => {
          const a = ((-120 + i * 20) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={600 + Math.sin(a) * 34}
              y1={335 - Math.cos(a) * 34}
              x2={600 + Math.sin(a) * (i % 3 ? 39 : 42)}
              y2={335 - Math.cos(a) * (i % 3 ? 39 : 42)}
              stroke={C.crema}
              strokeWidth={2.5}
              opacity={0.7}
            />
          );
        })}
        <line x1={600} y1={335} x2={600 + Math.sin(-0.5) * 28} y2={335 - Math.cos(-0.5) * 28} stroke={C.ceriseVive} strokeWidth={4} strokeLinecap="round" />
        <circle cx={600} cy={335} r={5} fill={C.crema} />
        <circle cx={600} cy={418} r={11} fill={C.cerise} stroke={C.crema} strokeWidth={2.5} />
        {/* bec */}
        <path d="M 582 456 L 618 456 L 613 492 L 587 492 Z" fill={C.nuit} stroke={C.crema} strokeWidth={3.5} strokeLinejoin="round" />
      </g>
      {chute}
      {/* récipient et son petit tas */}
      <path d="M 548 572 L 556 626 L 644 626 L 652 572" fill={C.corps} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 556 574 Q 600 548 644 574 Z" fill="#6b3f22" />
      <ellipse cx={600} cy={572} rx={52} ry={9} fill="none" stroke={C.crema} strokeWidth={3.5} />
      <rect x={452} y={626} width={296} height={16} rx={6} fill={C.corps} stroke={C.crema} strokeWidth={4} />
    </CadreIllu>
  );
};

// ── Cappuccino : tasse vue en plongée, latte art, vapeur ────────────────────
export const IlluCappuccino: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const frame = useCurrentFrame();
  const ry = 0.42;
  return (
    <CadreIllu libelle={libelle}>
      <ellipse cx={600} cy={560} rx={250} ry={250 * ry * 0.62} fill={C.corps} stroke={C.crema} strokeWidth={4} />
      <ellipse cx={600} cy={556} rx={130} ry={130 * ry * 0.62} fill="none" stroke={C.crema} strokeWidth={2.5} opacity={0.45} />
      {/* anse */}
      <path d="M 748 400 C 832 396 852 470 790 500 C 770 510 748 512 728 506 L 734 478 C 760 482 800 470 798 444 C 796 422 774 420 754 424 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
      {/* corps */}
      <path d="M 430 380 C 436 470 500 540 600 540 C 700 540 764 470 770 380 Z" fill={C.corps} stroke={C.crema} strokeWidth={4.5} />
      <path d="M 455 410 C 470 470 500 500 530 515" fill="none" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.08} />
      {/* surface : crème, latte art */}
      <ellipse cx={600} cy={380} rx={170} ry={170 * ry} fill={C.crema} />
      <ellipse cx={600} cy={381} rx={156} ry={156 * ry} fill="#a8703f" />
      <ellipse cx={600} cy={381} rx={140} ry={140 * ry} fill="#c08a55" opacity={0.8} />
      <g transform={`translate(600 384) scale(1 ${ry})`}>
        <path
          d="M 0 70 C -40 40 -95 10 -95 -30 C -95 -62 -62 -82 -32 -72 C -14 -66 -4 -52 0 -40 C 4 -52 14 -66 32 -72 C 62 -82 95 -62 95 -30 C 95 10 40 40 0 70 Z"
          fill="#f6efe3"
        />
        <path d="M 0 -40 C -4 0 -2 40 0 70" stroke="#c08a55" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M -62 -36 C -40 -20 40 -20 62 -36" stroke="#d8b48a" strokeWidth={4} fill="none" opacity={0.7} />
      </g>
      {/* petites bulles qui scintillent */}
      {Array.from({ length: 9 }).map((_, i) => {
        const a = random(`cb-${i}`) * Math.PI * 2;
        const q = 0.5 + 0.5 * Math.sin(tour(frame, 2, i / 9));
        return <circle key={i} cx={600 + Math.cos(a) * 128} cy={381 + Math.sin(a) * 128 * ry} r={2.2} fill="#f6efe3" opacity={0.25 + q * 0.5} />;
      })}
      <ellipse cx={600} cy={380} rx={170} ry={170 * ry} fill="none" stroke={C.crema} strokeWidth={4.5} />
      <VapeurBoucle x={600} y={330} hauteur={150} ecart={22} />
    </CadreIllu>
  );
};

// ── Grains : la pelle verse dans le bocal ───────────────────────────────────
export const IlluGrains: React.FC<{ libelle?: string; teinte?: string }> = ({ libelle, teinte = "#6b3f22" }) => {
  const frame = useCurrentFrame();
  const tas = Array.from({ length: 70 }).map((_, i) => {
    const x = 492 + random(`gt-x-${i}`) * 216;
    const y = 440 + random(`gt-y-${i}`) * 150 - Math.max(0, 50 - Math.abs(x - 600) * 0.35);
    return <Grain key={i} x={x} y={y} r={0.95} angle={random(`gt-a-${i}`) * 180} teinte={teinte} />;
  });
  const chute = Array.from({ length: 9 }).map((_, i) => {
    const q = cycle(frame, 3, i / 9);
    const x = 575 + q * 30 + (random(`gc-${i}`) - 0.5) * 18;
    const y = 238 + q * q * 200;
    return <Grain key={i} x={x} y={y} r={0.95} angle={random(`gca-${i}`) * 180 + q * 220} teinte={teinte} />;
  });
  return (
    <CadreIllu libelle={libelle}>
      <defs>
        <clipPath id="bocal">
          <path d="M 486 330 L 486 590 Q 486 610 506 610 L 694 610 Q 714 610 714 590 L 714 330 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#bocal)">{tas}</g>
      {chute}
      <path d="M 480 320 L 480 592 Q 480 618 506 618 L 694 618 Q 720 618 720 592 L 720 320" fill={C.crema} opacity={0.05} />
      <path d="M 480 320 L 480 592 Q 480 618 506 618 L 694 618 Q 720 618 720 592 L 720 320" fill="none" stroke={C.crema} strokeWidth={4.5} />
      <ellipse cx={600} cy={320} rx={120} ry={18} fill="none" stroke={C.crema} strokeWidth={4} />
      <path d="M 500 350 L 500 580" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.08} />
      {/* pelle */}
      <g transform="translate(560 200) rotate(32)">
        <path d="M -70 -36 Q -82 0 -70 36 L 40 30 Q 62 0 40 -30 Z" fill={C.corps} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -70 -36 L -170 -46 Q -184 -46 -184 -36 L -184 -28 Q -184 -20 -170 -20 L -72 -14" fill={C.corps} stroke={C.crema} strokeWidth={4} strokeLinejoin="round" />
        {Array.from({ length: 9 }).map((_, i) => (
          <Grain key={i} x={-46 + (i % 3) * 30} y={-14 + Math.floor(i / 3) * 14} r={0.9} angle={random(`gp-${i}`) * 180} teinte={teinte} />
        ))}
      </g>
    </CadreIllu>
  );
};

// ── Origine : carte au trait, ceinture du café, épingle qui pulse ──────────
export const IlluOrigine: React.FC<{
  libelle?: string;
  lat: number;
  lon: number;
  nom: string;
  zoom?: number;
  centre?: [number, number]; // [lat, lon] du centre de la carte, l'épingle par défaut
  route?: [number, number][]; // étapes [lat, lon] reliées en pointillés
}> = ({ libelle, lat, lon, nom, zoom = 2.6, centre, route }) => {
  const frame = useCurrentFrame();
  const k = (1200 / 360) * zoom;
  const derive = Math.sin(tour(frame, 1)) * 6;
  const [clat, clon] = centre ?? [lat, lon];
  const px = (lo: number) => 560 + (lo - clon) * k + derive;
  const py = (la: number) => 330 + (clat - la) * k;
  const trajet = route
    ? route
        .map(([la, lo], i) => {
          const x = px(lo);
          const y = py(la);
          if (!i) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          const [pla, plo] = route[i - 1];
          const x0 = px(plo);
          const y0 = py(pla);
          const d = Math.hypot(x - x0, y - y0);
          return `Q ${((x + x0) / 2).toFixed(1)} ${((y + y0) / 2 - d * 0.28).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ")
    : null;
  const terres = Object.values(TERRES as Record<string, number[][]>).map((pts, i) => (
    <path
      key={i}
      d={pts.map(([lo, la], j) => `${j ? "L" : "M"} ${px(lo).toFixed(1)} ${py(la).toFixed(1)}`).join(" ") + " Z"}
      fill={C.crema}
      fillOpacity={0.07}
      stroke={C.crema}
      strokeWidth={2.4}
      strokeLinejoin="round"
      opacity={0.85}
    />
  ));
  const graticule: React.ReactNode[] = [];
  for (let lo = -180; lo <= 180; lo += 15)
    graticule.push(<line key={`m${lo}`} x1={px(lo)} y1={-50} x2={px(lo)} y2={ILLU.h + 50} stroke={C.crema} strokeWidth={1} opacity={0.1} strokeDasharray="2 8" />);
  for (let la = -75; la <= 75; la += 15)
    graticule.push(<line key={`p${la}`} x1={-50} y1={py(la)} x2={ILLU.w + 50} y2={py(la)} stroke={C.crema} strokeWidth={1} opacity={0.1} strokeDasharray="2 8" />);
  return (
    <CadreIllu libelle={libelle}>
      {graticule}
      <rect x={-50} y={py(23.4)} width={ILLU.w + 100} height={py(-23.4) - py(23.4)} fill={C.cerise} opacity={0.07} />
      <line x1={-50} y1={py(23.4)} x2={ILLU.w + 50} y2={py(23.4)} stroke={C.cerise} strokeWidth={1.5} strokeDasharray="8 8" opacity={0.5} />
      <line x1={-50} y1={py(-23.4)} x2={ILLU.w + 50} y2={py(-23.4)} stroke={C.cerise} strokeWidth={1.5} strokeDasharray="8 8" opacity={0.5} />
      {terres}
      {trajet ? (
        <g>
          <path d={trajet} fill="none" stroke={C.creme} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-cycle(frame, 3) * 20} opacity={0.85} />
          {route!.slice(1).map(([la, lo], i) => (
            <circle key={i} cx={px(lo)} cy={py(la)} r={6.5} fill={C.crema} stroke={C.espresso} strokeWidth={2} />
          ))}
        </g>
      ) : null}
      {[0, 0.5].map((d) => {
        const q = cycle(frame, 2, d);
        return <circle key={d} cx={px(lon)} cy={py(lat)} r={12 + q * 46} fill="none" stroke={C.ceriseVive} strokeWidth={3} opacity={(1 - q) * 0.9} />;
      })}
      <circle cx={px(lon)} cy={py(lat)} r={12} fill={C.ceriseVive} stroke={C.creme} strokeWidth={4} />
      <line x1={px(lon) + 16} y1={py(lat) - 14} x2={px(lon) + 70} y2={py(lat) - 60} stroke={C.creme} strokeWidth={2.5} />
      <text x={px(lon) + 78} y={py(lat) - 66} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 52 }} fill={C.creme}>
        {nom}
      </text>
    </CadreIllu>
  );
};

// ── Café glacé : verre haut, glaçons qui flottent, paille ───────────────────
export const IlluGlace: React.FC<{ libelle?: string }> = ({ libelle }) => {
  const frame = useCurrentFrame();
  const VERRE = "M 500 140 L 516 586 Q 518 604 536 604 L 664 604 Q 682 604 684 586 L 700 140";
  return (
    <CadreIllu libelle={libelle}>
      <defs>
        <clipPath id="verre">
          <path d="M 504 150 L 519 584 Q 521 598 536 598 L 664 598 Q 679 598 681 584 L 696 150 Z" />
        </clipPath>
        <linearGradient id="glace-cafe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b47a46" />
          <stop offset="55%" stopColor="#6b3a1c" />
          <stop offset="100%" stopColor="#3b1d0f" />
        </linearGradient>
      </defs>
      <ellipse cx={600} cy={612} rx={150} ry={20} fill={C.corps} stroke={C.crema} strokeWidth={3.5} />
      <g clipPath="url(#verre)">
        <rect x={480} y={262} width={240} height={360} fill="url(#glace-cafe)" />
        {/* nuage de lait qui tourne lentement */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = tour(frame, 1, i / 6);
          return (
            <ellipse
              key={i}
              cx={600 + Math.cos(a) * 46}
              cy={350 + i * 22 + Math.sin(a) * 10}
              rx={46 - i * 4}
              ry={14}
              fill="#e8cfae"
              opacity={0.22}
            />
          );
        })}
        <line x1={480} y1={262} x2={720} y2={262} stroke="#d9a066" strokeWidth={4} opacity={0.7} />
        {[
          { x: 548, y: 270, a: 12 },
          { x: 618, y: 258, a: -10 },
          { x: 585, y: 318, a: 28 },
          { x: 646, y: 330, a: 4 },
        ].map((g, i) => {
          const dy = Math.sin(tour(frame, 1, i * 0.25)) * 5;
          const da = Math.sin(tour(frame, 1, i * 0.25 + 0.3)) * 4;
          return (
            <g key={i} transform={`translate(${g.x} ${g.y + dy}) rotate(${g.a + da})`}>
              <rect x={-32} y={-32} width={64} height={64} rx={12} fill="#f6f1ea" opacity={0.28} stroke={C.creme} strokeWidth={3} />
              <path d="M -20 -20 L 8 -20" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.5} />
            </g>
          );
        })}
      </g>
      {/* paille */}
      <g transform="rotate(14 640 360)">
        <rect x={628} y={70} width={22} height={520} rx={10} fill={C.creme} opacity={0.9} />
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M 628 ${100 + i * 56} L 650 ${84 + i * 56} L 650 ${108 + i * 56} L 628 ${124 + i * 56} Z`} fill={C.cerise} opacity={0.9} />
        ))}
      </g>
      <path d={VERRE} fill={C.crema} opacity={0.05} />
      <path d={VERRE} fill="none" stroke={C.crema} strokeWidth={4.5} strokeLinejoin="round" />
      <ellipse cx={600} cy={140} rx={100} ry={14} fill="none" stroke={C.crema} strokeWidth={4} />
      <path d="M 520 180 L 532 560" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.1} />
      {/* gouttes de condensation */}
      {Array.from({ length: 14 }).map((_, i) => {
        const glisse = i % 4 === 0 ? cycle(frame, 1, i / 14) * 70 : 0;
        const x = 512 + random(`gd-x-${i}`) * 176;
        const y = 200 + random(`gd-y-${i}`) * 300 + glisse;
        return <ellipse key={i} cx={x} cy={y} rx={3.2} ry={4.6} fill="#ffffff" opacity={i % 4 === 0 ? 0.55 * (1 - cycle(frame, 1, i / 14)) : 0.35} />;
      })}
    </CadreIllu>
  );
};

// ── Versement V60 en boucle : le geste du col de cygne ─────────────────────
export const IlluV60: React.FC<{ libelle?: string; vue?: string }> = ({ libelle, vue = "-40 590 1160 960" }) => {
  const frame = useCurrentFrame();
  const r = 34 + 12 * Math.sin(tour(frame, 1));
  const a = tour(frame, 3);
  const ix = Math.cos(a) * r;
  const iy = Math.sin(a) * r;
  const angle = -25 + Math.sin(a) * 2;
  const corps = corpsPourPointe(540 + ix * 0.95, 792 + iy * 0.3, angle, POSTE.echelleBouilloire);
  const avant = Math.cos(a - 0.15) * r;
  return (
    <CadreIllu libelle={libelle}>
      <foreignObject x={0} y={0} width={ILLU.w} height={ILLU.h}>
        <div style={{ position: "relative", width: ILLU.w, height: ILLU.h }}>
          <VueCtx.Provider value={{ viewBox: vue, style: { position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" } }}>
            <Station
              e={{
                frame,
                bouilloire: { x: corps.x, y: corps.y, angle },
                filet: { tete: 1, queue: 0 },
                impactX: ix,
                traine: -(ix - avant) * 2.2,
                poids: 150,
                temps: 52,
                lit: 1,
                dome: 5,
                bulles: 0,
                eau: 0.62,
                papierMouille: 1,
                carafe: 0.32,
                teinteCarafe: 1,
                gouttes: 0.8,
                spirale: null,
                cible: null,
                note: null,
                attente: null,
              }}
            />
          </VueCtx.Provider>
        </div>
      </foreignObject>
    </CadreIllu>
  );
};
