import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Les polices du site, en version variable complète (graisse et taille optique).
loadFont({
  family: "Newsreader",
  url: staticFile("fonts/newsreader-latin-standard-normal.woff2"),
  weight: "200 800",
  style: "normal",
});
loadFont({
  family: "Newsreader",
  url: staticFile("fonts/newsreader-latin-standard-italic.woff2"),
  weight: "200 800",
  style: "italic",
});
loadFont({
  family: "Instrument Sans",
  url: staticFile("fonts/instrument-sans-latin-standard-normal.woff2"),
  weight: "400 700",
  stretch: "75% 100%",
  style: "normal",
});
