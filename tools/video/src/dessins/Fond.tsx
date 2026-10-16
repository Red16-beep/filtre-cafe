import { AbsoluteFill, useVideoConfig } from "remotion";

// Fond espresso : halo chaud, trame de points façon papier technique, grain léger.
export const Fond: React.FC = () => {
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill name="Fond" style={{ backgroundColor: "#1f1610" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(85% 55% at 50% 46%, #3a2819 0%, rgba(58,40,25,0.55) 42%, rgba(31,22,16,0) 78%)",
        }}
      />
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <pattern
            id="fond-trame"
            width={54}
            height={54}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={27} cy={27} r={1.7} fill="#efc79c" opacity={0.09} />
          </pattern>
          <radialGradient id="fond-masque-degrade" cx="50%" cy="48%" r="62%">
            <stop offset="0%" stopColor="#fff" stopOpacity={1} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <mask id="fond-masque">
            <rect width={W} height={H} fill="url(#fond-masque-degrade)" />
          </mask>
          <filter id="fond-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.8}
              numOctaves={2}
              seed={7}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect
          width={W}
          height={H}
          fill="url(#fond-trame)"
          mask="url(#fond-masque)"
        />
        <rect
          width={W}
          height={H}
          filter="url(#fond-grain)"
          opacity={0.1}
          style={{ mixBlendMode: "soft-light" }}
        />
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(130% 95% at 50% 46%, rgba(0,0,0,0) 58%, rgba(8,5,3,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
