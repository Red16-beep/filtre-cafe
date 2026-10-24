"""Contre-écoute : retranscrit des phrases de la piste voix finale d'un épisode, sans puis avec une amorce de vocabulaire.

Le contrôle de narration.py laisse passer un mot mal prononcé quand le reste de la phrase est juste (« chimiste »
dit « chemiste »), et signale à tort les noms propres que la reconnaissance ne connaît pas (« Chemex » entendu
« chemise »). Une amorce qui nomme ces mots lève les fausses alertes ; ce qu'elle ne corrige pas, et que deux modèles
entendent de travers, est à reprendre dans `dit`.

  python outils/contre-ecoute.py chemex p1,c2 "Chemex, Kenya, Éthiopie."
  MODELE=medium python outils/contre-ecoute.py chemex p1 ""      # modèle plus précis, 1,5 Go au premier lancement

À lancer depuis tools/video, avec le Python de la voix (faster-whisper, soundfile, librosa).
"""
import json
import os
import sys

import librosa
import soundfile as sf
from faster_whisper import WhisperModel

ep, ids, amorce = sys.argv[1], sys.argv[2].split(','), sys.argv[3] if len(sys.argv) > 3 else ''
m = json.load(open(f'src/episodes/{ep}/minutage.json', encoding='utf-8'))
x, sr = sf.read(f'public/audio/episode-{ep}-voix.wav', dtype='float32')
if x.ndim > 1:
    x = x.mean(axis=1)
P = {p['id']: p for c in m['chapitres'] for p in c['phrases']}
asr = WhisperModel(os.environ.get('MODELE', 'small'), device='cpu', compute_type='int8')


def ecoute(seg, prompt=None):
    y = librosa.resample(seg, orig_sr=sr, target_sr=16000)
    s, _ = asr.transcribe(y, language='fr', beam_size=5, initial_prompt=prompt)
    return ' '.join(t.text.strip() for t in s)


for i in ids:
    p = P[i]
    a, b = int(p['debut'] / m['fps'] * sr), int(p['fin'] / m['fps'] * sr)
    seg = x[max(0, a - sr // 10): b + sr // 10]
    print(f'{i} sans amorce : {ecoute(seg)}')
    if amorce:
        print(f'{i} avec amorce : {ecoute(seg, amorce)}')
