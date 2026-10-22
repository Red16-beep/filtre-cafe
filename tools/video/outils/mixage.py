"""Mixage d'un épisode : la voix devant, la musique qui s'efface dessous et remonte dans les silences.

  python3 outils/mixage.py v60           (depuis tools/video)

Lit public/audio/episode-<épisode>-voix.wav (narration.py) et public/audio/episode-<épisode>-sf2.wav
(musique-sf2.mjs, MELODIE=aucune), écrit public/audio/episode-<épisode>-mix.wav, réglé ensuite à -14 LUFS
(niveau de lecture de YouTube) avec une crête vraie sous -1,5 dB.

Si la voix du narrateur porte une chaîne « studio » (voix/<nom>.json), la voix y passe d'abord : pour le narrateur,
un son de studio radio (graves parasites coupés, médiums dégagés, présence, brillance, compression, pauses nettoyées).

Sous la voix, la musique est à 18 dB sous elle ; dans les silences (pauses, cartes de chapitre), à 9 dB sous elle.
La bascule est douce : 0,15 s pour descendre, 0,7 s pour remonter, pour qu'on ne l'entende pas respirer.
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

RACINE = Path(__file__).resolve().parents[1]
SR = 48000


def lire(chemin):
    with wave.open(str(chemin), 'rb') as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32768
        return x.reshape(-1, w.getnchannels()), w.getframerate()


def lufs(chemin):
    sortie = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(chemin), '-af', 'ebur128', '-f', 'null', '-'],
                            capture_output=True, text=True).stderr
    lignes = [l for l in sortie.splitlines() if l.strip().startswith('I:')]
    return float(lignes[-1].split()[1])


def lisser(x, monte, descend):
    """Suit x vers le haut en `monte` s et vers le bas en `descend` s (filtre à une pôle, par blocs de 1 ms)."""
    pas = SR // 1000
    n = len(x) // pas
    blocs = x[:n * pas].reshape(n, pas).max(axis=1)
    am, ad = np.exp(-1 / (monte * 1000)), np.exp(-1 / (descend * 1000))
    y = np.empty(n)
    v = blocs[0]
    for i, b in enumerate(blocs):
        a = am if b > v else ad
        v = a * v + (1 - a) * b
        y[i] = v
    y = np.repeat(y, pas)
    return np.pad(y, (0, len(x) - len(y)), mode='edge') if n else x


def studio(episode, piste):
    """Traitement de la voix propre au narrateur (clé « studio » de voix/<nom>.json : une chaîne de filtres ffmpeg),
    appliqué après avoir ramené la voix à -20 LUFS, pour que seuils et gains ne dépendent pas de l'épisode."""
    v = json.loads((RACINE / 'src' / 'episodes' / episode / 'narration.json').read_text(encoding='utf8'))['voix']
    chaine = json.loads((RACINE / f"{v['reference']}.json").read_text(encoding='utf8')).get('studio') if 'reference' in v else None
    if not chaine:
        return piste
    traitee = piste.with_name(piste.stem + '-studio.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(piste), '-af', f'volume={-20 - lufs(piste):.2f}dB,{chaine}',
                    '-ar', str(SR), '-ac', '1', str(traitee)], check=True)
    return traitee


def main(episode):
    audio = RACINE / 'public' / 'audio'
    piste = studio(episode, audio / f'episode-{episode}-voix.wav')
    voix, sr1 = lire(piste)
    musique, sr2 = lire(audio / f'episode-{episode}-sf2.wav')
    assert sr1 == sr2 == SR, (sr1, sr2)
    voix = voix[:, 0]
    duree = json.loads((RACINE / 'src' / 'episodes' / episode / 'minutage.json').read_text())['duree'] / 30
    n = int(round(duree * SR))
    voix = np.pad(voix, (0, max(0, n - len(voix))))[:n]
    musique = np.pad(musique, ((0, max(0, n - len(musique))), (0, 0)))[:n]

    # Écart de niveau voulu entre voix et musique, mesuré en LUFS sur les deux pistes.
    ecart = lufs(piste) - lufs(audio / f'episode-{episode}-sf2.wav')
    sous, silence = 10 ** ((ecart - 18) / 20), 10 ** ((ecart - 9) / 20)

    # La voix « parle » quand son enveloppe dépasse -40 dB de sa crête ; tenue 0,25 s pour enjamber les virgules.
    env = np.abs(voix)
    parle = (lisser(env, 0.005, 0.25) > 10 ** (-40 / 20) * env.max()).astype(np.float32)
    gain = silence + (sous - silence) * lisser(parle, 0.15, 0.7)
    t = np.arange(n) / SR
    gain *= np.clip(t / 1.5, 0, 1)  # entrée de la musique
    gain *= np.clip((duree - t) / 2.5, 0, 1) ** 1.5  # sortie sur les 2,5 dernières secondes

    mix = musique * gain[:, None] + voix[:, None]
    mix /= max(1e-6, float(np.max(np.abs(mix)))) / 0.89
    brut = audio / f'episode-{episode}-mix-brut.wav'
    with wave.open(str(brut), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())

    # Niveau final en deux passes (mesure, puis correction linéaire).
    mesure = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(brut), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json',
                             '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(mesure[mesure.rindex('{'):mesure.rindex('}') + 1])
    filtre = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
              f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    final = audio / f'episode-{episode}-mix.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(brut), '-af', filtre, '-ar', str(SR), str(final)], check=True)
    brut.unlink()
    print(f'{final} : {duree:.1f} s, voix {ecart:+.1f} dB au-dessus de la musique brute, '
          f'musique à -18 dB sous la voix et -9 dB dans les silences ; final {lufs(final):.1f} LUFS')


if __name__ == '__main__':
    main(sys.argv[1])
