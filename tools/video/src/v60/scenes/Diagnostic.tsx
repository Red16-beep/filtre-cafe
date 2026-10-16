import { DiagnosticMethode } from "../../scenes/DiagnosticMethode";

// Le temps d'écoulement règle la mouture : trop vite, plus fin ; trop lent, plus gros.
export const Diagnostic: React.FC = () => (
  <DiagnosticMethode
    titre={"Trop rapide, trop\u00a0lent\u202f?"}
    sous={"ajustez la mouture pour finir entre 2:30\u00a0et\u00a03:30"}
    graduations={["2:00", "2:30", "3:00", "3:30", "4:00"]}
    fenetre="la bonne fenêtre"
    gauche={{ titre: "Plus rapide\u202f?", verbe: "moudre", accent: "plus fin" }}
    droite={{ titre: "Plus lent\u202f?", verbe: "moudre", accent: "plus gros" }}
  />
);
