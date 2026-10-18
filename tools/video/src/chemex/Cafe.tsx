import {
  AbsoluteFill,
  Easing,
  Sequence,
  random,
  useCurrentFrame,
} from "remotion";
import { Balance } from "../dessins/Balance";
import { Trace, ellipse } from "../dessins/Trace";
import { usePaysage } from "../format";
import { C, DOUX, SANS, SORTIE, prog } from "../theme";
import { Legende } from "../ui/Legende";

// Chemex : peser 45 g, mouture médium-grossière, plus grosse que pour un V60 (article chemex-guide-complet).
const BOL = "M -125 -120 C -122 -40 -80 0 0 0 C 80 0 122 -40 125 -120";

// Un grain de mouture : petit polygone irrégulier.
const grain = (cle: string, cx: number, cy: number, r: number) => {
  const n = 5 + Math.floor(random(`${cle}-n`) * 3);
  const a0 = random(`${cle}-a`) * Math.PI * 2;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * Math.PI * 2;
    const rr = r * (0.65 + random(`${cle}-r${i}`) * 0.5);
    pts.push(
      `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`,
    );
  }
  return pts.join(" ");
};
const TEINTES = ["#7a4a2a", "#9a6238", "#5a321a", "#b07a48"];

const TAILLES = [2.4, 4, 6, 8.5, 11.5];
const GRAPPES_X = [150, 345, 540, 735, 930];

export const ChemexCafe: React.FC = () => {
  const frame = useCurrentFrame();
  const paysage = usePaysage();
  // En paysage, les dessins passent dans la moitié droite.
  const D = paysage
    ? { pesee: [850, -480], loupe: [850, -450], barre: [850, -405] }
    : { pesee: [0, 0], loupe: [0, 0], barre: [0, 0] };
  const trace = prog(frame, 0, 24);
  const poids = 45 * prog(frame, 16, 56, (t) => t);
  const sortieBalance = prog(frame, 60, 82, Easing.in(Easing.cubic));
  const tas = prog(frame, 16, 58, Easing.out(Easing.quad));
  const loupe = prog(frame, 72, 96, SORTIE);
  const barre = prog(frame, 84, 106, DOUX);

  const chute: React.ReactNode[] = [];
  for (let i = 0; i < 80; i++) {
    const debut = 14 + random(`c-${i}`) * 36;
    const q = (frame - debut) / 10;
    if (q <= 0 || q >= 1) continue;
    const x =
      540 + (random(`cx-${i}`) - 0.5) * 44 + (random(`cd-${i}`) - 0.5) * q * 70;
    const y = 600 + q * q * 570;
    chute.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r={2 + random(`cr-${i}`) * 2.6}
        fill={TEINTES[i % 4]}
      />,
    );
  }

  const grainsLoupe: React.ReactNode[] = [];
  for (let i = 0; i < 48; i++) {
    const a = random(`la-${i}`) * Math.PI * 2;
    const d = Math.sqrt(random(`ld-${i}`)) * 150;
    const rot = frame * 0.004;
    const gx = 540 + Math.cos(a + rot) * d;
    const gy = 870 + Math.sin(a + rot) * d;
    grainsLoupe.push(
      <polygon
        key={i}
        points={grain(`lg-${i}`, gx, gy, 11 + random(`ls-${i}`) * 6)}
        fill={TEINTES[i % 4]}
      />,
    );
  }

  return (
    <AbsoluteFill name="Café">
      <Sequence name="Peser" durationInFrames={72} layout="none">
        <Legende
          puce="ÉTAPE 2"
          titre={"Peser 45 g de café"}
          duree={72}
          taille={96}
        />
      </Sequence>
      <Sequence name="Mouture" from={66} layout="none">
        <Legende
          puce="ÉTAPE 2"
          titre="Mouture médium-grossière"
          taille={100}
          sous="plus grosse que pour un V60"
          accent={["médium-fine"]}
        />
      </Sequence>
      <svg
        width={paysage ? 1920 : 1080}
        height={paysage ? 1080 : 1920}
        viewBox={paysage ? "0 0 1920 1080" : "0 0 1080 1920"}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Pesée */}
        <g
          transform={`translate(${D.pesee[0]} ${D.pesee[1] + sortieBalance * 700})`}
          opacity={1 - sortieBalance}
        >
          {chute}
          <Balance
            x={540}
            y={1300}
            s={0.95}
            trace={trace}
            poids={poids}
            decimales
            temps={null}
          />
          <g transform="translate(540 1290)">
            <path d={`${BOL} Z`} fill={C.corps} opacity={trace} />
            {tas > 0 ? (
              <g>
                <ellipse cx={0} cy={-116} rx={112} ry={16} fill="#5a321a" />
                <path
                  d={`M -112 -116 Q 0 ${-116 - tas * 70} 112 -116 Z`}
                  fill="#7a4a2a"
                />
                <path
                  d={`M -70 -122 Q 0 ${-116 - tas * 56} 70 -122`}
                  fill="none"
                  stroke="#a46a3c"
                  strokeWidth={3}
                  opacity={0.6}
                />
              </g>
            ) : null}
            <Trace d={BOL} p={trace} w={4.5} />
            <Trace d={ellipse(0, -120, 125, 18)} p={trace} w={4} />
          </g>
          {frame > 56 ? (
            <rect
              x={540 - 250 * 0.95 - 10}
              y={1300 + 24 * 0.95 - 10}
              width={500 * 0.95 + 20}
              height={92 * 0.95 + 20}
              rx={20}
              fill="none"
              stroke={C.ceriseVive}
              strokeWidth={4}
              opacity={1 - prog(frame, 56, 72)}
            />
          ) : null}
        </g>

        {/* Loupe : la mouture visée */}
        {loupe > 0 ? (
          <g transform={`translate(${D.loupe[0]} ${D.loupe[1]})`}>
            <g
              transform={`translate(540 870) scale(${0.7 + loupe * 0.3}) translate(-540 -870)`}
              opacity={loupe}
            >
              <line
                x1={660}
                y1={990}
                x2={760}
                y2={1090}
                stroke={C.crema}
                strokeWidth={30}
                strokeLinecap="round"
              />
              <line
                x1={660}
                y1={990}
                x2={760}
                y2={1090}
                stroke={C.corps}
                strokeWidth={20}
                strokeLinecap="round"
              />
              <circle cx={540} cy={870} r={172} fill="#2a170c" />
              <clipPath id="chemex-cafe-loupe">
                <circle cx={540} cy={870} r={166} />
              </clipPath>
              <g clipPath="url(#chemex-cafe-loupe)">{grainsLoupe}</g>
              <circle
                cx={540}
                cy={870}
                r={172}
                fill="none"
                stroke={C.crema}
                strokeWidth={7}
              />
              <path
                d="M 430 760 A 150 150 0 0 1 560 724"
                fill="none"
                stroke="#ffffff"
                strokeWidth={6}
                strokeLinecap="round"
                opacity={0.18}
              />
            </g>
          </g>
        ) : null}

        {/* Du plus fin au plus gros */}
        {barre > 0 ? (
          <g transform={`translate(${D.barre[0]} ${D.barre[1]})`}>
            <line
              x1={110}
              y1={1235}
              x2={110 + 860 * barre}
              y2={1235}
              stroke={C.crema}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.5}
            />
            {GRAPPES_X.map((gx, k) => {
              const pop = prog(
                frame,
                88 + k * 4,
                104 + k * 4,
                Easing.spring({ damping: 13, mass: 0.6 }),
              );
              if (pop <= 0) return null;
              return (
                <g key={k} transform={`translate(${gx} 1175) scale(${pop})`}>
                  {Array.from({ length: 7 }).map((_, i) => {
                    const a = (i / 7) * Math.PI * 2 + k;
                    const d = i === 0 ? 0 : 14 + k * 4;
                    return (
                      <polygon
                        key={i}
                        points={grain(
                          `sp-${k}-${i}`,
                          Math.cos(a) * d,
                          Math.sin(a) * d * 0.8,
                          TAILLES[k],
                        )}
                        fill={k === 3 ? "#c08a55" : TEINTES[(i + k) % 4]}
                      />
                    );
                  })}
                </g>
              );
            })}
            {[
              { k: 0, t: "Espresso" },
              { k: 1, t: "V60" },
              { k: 3, t: "Chemex" },
              { k: 4, t: "Piston" },
            ].map(({ k, t }) => {
              const o = prog(frame, 96 + k * 3, 110 + k * 3);
              const v60 = k === 3;
              return (
                <g key={t} opacity={o}>
                  {v60 ? (
                    <rect
                      x={GRAPPES_X[k] - 86}
                      y={1262}
                      width={172}
                      height={62}
                      rx={31}
                      fill={C.cerise}
                      opacity={prog(frame, 104, 116)}
                    />
                  ) : null}
                  <text
                    x={GRAPPES_X[k]}
                    y={1306}
                    textAnchor="middle"
                    style={{
                      fontFamily: SANS,
                      fontWeight: v60 ? 600 : 400,
                      fontSize: 40,
                    }}
                    fill={v60 ? C.creme : C.crema}
                  >
                    {t}
                  </text>
                </g>
              );
            })}
            <text
              x={110}
              y={1380}
              style={{ fontFamily: SANS, fontSize: 34 }}
              fill={C.crema}
              opacity={0.6 * prog(frame, 100, 112)}
            >
              plus fin
            </text>
            <text
              x={970}
              y={1380}
              textAnchor="end"
              style={{ fontFamily: SANS, fontSize: 34 }}
              fill={C.crema}
              opacity={0.6 * prog(frame, 100, 112)}
            >
              plus gros
            </text>
            <path
              d={
                paysage
                  ? "M 735 1140 C 735 1080 640 1020 590 1000"
                  : "M 735 1140 C 735 1110 640 1080 590 1045"
              }
              fill="none"
              stroke={C.crema}
              strokeWidth={3}
              strokeDasharray="9 9"
              opacity={0.7 * prog(frame, 106, 120)}
            />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
