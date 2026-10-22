"""Voix d'un épisode : synthèse phrase par phrase, contrôle d'intelligibilité, minutage, sous-titres.

  python outils/narration.py v60            (depuis tools/video, avec le Python de l'environnement TTS)

Lit src/episodes/<épisode>/narration.json et écrit :
  public/audio/episode-<épisode>-voix.wav    la piste voix, 48 kHz (dossier ignoré par git)
  src/episodes/<épisode>/minutage.json       début et fin de chaque phrase et chapitre, en images à 30 i/s
  out/episode-<épisode>.srt                  les sous-titres, depuis le texte écrit (pas le texte dit)

Voix : Kokoro-82M (Apache-2.0), locuteur ff_siwis (corpus SIWIS, CC BY 4.0), calcul local via kokoro-onnx.
Modèles hors dépôt, dans $TTS_MODELES : kokoro.onnx (onnx-community/Kokoro-82M-v1.0-ONNX, onnx/model.onnx)
et ff_siwis.bin (même dépôt, voices/). Environnement : pip install kokoro-onnx soundfile faster-whisper num2words.

Chaque phrase est relue par faster-whisper (modèle small) : une phrase dont plus de 15 % des mots ne sont pas
reconnus est signalée, à réécrire dans le champ « dit » (orthographe phonétique : « bloum », « V soixante »).
Les phrases déjà synthétisées sont gardées en cache (out/voix-cache), seules les phrases modifiées repartent.
"""
import hashlib
import json
import os
import re
import sys
import unicodedata
import wave
from pathlib import Path

import numpy as np

RACINE = Path(__file__).resolve().parents[1]
MODELES = Path(os.environ.get('TTS_MODELES', RACINE / 'sons' / 'tts'))
FPS = 30
SR_VOIX = 24000
SR_SORTIE = 48000


def ecrire_wav(chemin, x, sr):
    chemin.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(chemin), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


def lire_wav(chemin):
    with wave.open(str(chemin), 'rb') as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32768


def reechantillonner(x, sr_in, sr_out):
    if sr_in == sr_out:
        return x
    n = int(round(len(x) * sr_out / sr_in))
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)


class Kokoro:
    def __init__(self, locuteur):
        from kokoro_onnx import Kokoro as K
        voix = MODELES / f'voix-{locuteur}.npz'
        if not voix.exists():
            style = np.fromfile(MODELES / f'{locuteur}.bin', dtype=np.float32).reshape(-1, 1, 256)
            np.savez(voix, **{locuteur: style})
        self.k = K(str(MODELES / 'kokoro.onnx'), str(voix))
        self.locuteur = locuteur

    def dire(self, texte, vitesse):
        audio, sr = self.k.create(texte, voice=self.locuteur, speed=vitesse, lang='fr-fr')
        return reechantillonner(audio.astype(np.float32), sr, SR_VOIX)


# ── contrôle d'intelligibilité ──
def mots(t):
    from num2words import num2words
    t = t.lower().replace('’', "'")
    t = re.sub(r'\bv ?60\b', 'v soixante', t)
    t = re.sub(r'(\d+),(\d+)', r'\1 virgule \2', t)
    t = re.sub(r'\d+', lambda m: ' ' + num2words(int(m.group(0)), lang='fr') + ' ', t)
    for a, b in ((r'°\s*c\b', ' degrés '), (r'%', ' pour cent '), (r'\bmg\b', ' milligrammes '), (r'\bml\b', ' millilitres '),
                 (r'\bg\b', ' grammes '), (r'€', ' euros '), (r'\bmin\b', ' minutes '), (r'\bbloom\b', ' bloum ')):
        t = re.sub(a, b, t)
    t = unicodedata.normalize('NFKD', t.replace('-', ' '))
    t = ''.join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^a-z ]", ' ', t.replace("'", ' ')).split()


def taux_erreur(ref, hyp):
    r, h = mots(ref), mots(hyp)
    d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        prec, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            cur = d[j]
            d[j] = min(d[j] + 1, d[j - 1] + 1, prec + (r[i - 1] != h[j - 1]))
            prec = cur
    return d[len(h)] / max(1, len(r))


def srt_temps(s):
    ms = int(round(s * 1000))
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'


def main(episode):
    dossier = RACINE / 'src' / 'episodes' / episode
    n = json.loads((dossier / 'narration.json').read_text(encoding='utf8'))
    v, pauses = n['voix'], n['pauses']
    cache = RACINE / 'out' / 'voix-cache'
    moteur = None

    from faster_whisper import WhisperModel
    asr = WhisperModel('small', device='cpu', compute_type='int8')

    t = 0.4
    morceaux = [np.zeros(int(t * SR_VOIX), np.float32)]
    sortie = {'fps': FPS, 'chapitres': []}
    srt, alertes = [], []

    def silence(s):
        nonlocal t
        morceaux.append(np.zeros(int(round(s * SR_VOIX)), np.float32))
        t += s

    for ch in n['chapitres']:
        c = {'id': ch['id'], 'num': ch.get('num', ''), 'titre': ch['titre'], 'debut': round(t * FPS), 'phrases': []}
        if ch.get('carte', True):
            c['carte'] = {'debut': round(t * FPS), 'fin': round((t + pauses['carte']) * FPS)}
            silence(pauses['carte'])
        for p in ch['phrases']:
            cle = hashlib.sha1(json.dumps([v, p['dit']], ensure_ascii=False).encode()).hexdigest()[:16]
            f = cache / f'{cle}.wav'
            if not f.exists():
                if moteur is None:
                    moteur = Kokoro(v['locuteur'])
                ecrire_wav(f, moteur.dire(p['dit'], v['vitesse']), SR_VOIX)
            x = lire_wav(f)
            segs, _ = asr.transcribe(reechantillonner(x, SR_VOIX, 16000), language='fr', beam_size=5)
            entendu = ' '.join(s.text for s in segs).strip()
            err = taux_erreur(p['dit'], entendu)
            if err > 0.15:
                alertes.append((p['id'], err, p['dit'], entendu))
            debut = t
            morceaux.append(x)
            t += len(x) / SR_VOIX
            c['phrases'].append({'id': p['id'], 'debut': round(debut * FPS), 'fin': round(t * FPS), 'texte': p['ecrit']})
            srt.append((debut, t, p['ecrit']))
            silence(pauses['phrase'])
        silence(pauses['chapitre'])
        c['fin'] = round(t * FPS)
        sortie['chapitres'].append(c)
        print(f"{c['num'] or '--'} {ch['titre']:<26} {(c['fin'] - c['debut']) / FPS:5.1f} s")

    silence(3.0)  # le logo de fin reste à l'écran
    sortie['duree'] = round(t * FPS)
    voix = reechantillonner(np.concatenate(morceaux), SR_VOIX, SR_SORTIE)
    voix *= 0.89 / max(1e-6, float(np.max(np.abs(voix))))
    ecrire_wav(RACINE / 'public' / 'audio' / f'episode-{episode}-voix.wav', voix, SR_SORTIE)
    (dossier / 'minutage.json').write_text(json.dumps(sortie, ensure_ascii=False, indent=1) + '\n', encoding='utf8')
    lignes = [f'{i + 1}\n{srt_temps(a)} --> {srt_temps(b)}\n{txt}\n' for i, (a, b, txt) in enumerate(srt)]
    (RACINE / 'out').mkdir(exist_ok=True)
    (RACINE / 'out' / f'episode-{episode}.srt').write_text('\n'.join(lignes), encoding='utf8')
    print(f'durée totale {t:.1f} s ({sortie["duree"]} images)')
    for pid, err, dit, entendu in alertes:
        print(f'À REVOIR {pid} ({err * 100:.0f} % de mots non reconnus)\n   dit     : {dit}\n   entendu : {entendu}')


if __name__ == '__main__':
    main(sys.argv[1])
