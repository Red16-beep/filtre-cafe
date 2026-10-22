"""Voix d'un épisode : synthèse phrase par phrase, contrôle d'intelligibilité, minutage, sous-titres.

  python outils/narration.py v60            (depuis tools/video, avec le Python de l'environnement TTS)

Lit src/episodes/<épisode>/narration.json et écrit :
  public/audio/episode-<épisode>-voix.wav    la piste voix, 48 kHz (dossier ignoré par git)
  src/episodes/<épisode>/minutage.json       début et fin de chaque phrase et chapitre, en images à 30 i/s
  out/episode-<épisode>.srt                  les sous-titres, depuis le texte écrit (pas le texte dit)

Moteur « voxcpm2 » (le narrateur de la série) : VoxCPM2 d'OpenBMB (Apache-2.0), calcul local sur CPU. Le narrateur
est une voix créée par description (outils/voix.py), sans cloner personne, puis figée dans voix/<nom>.flac (+ <nom>.json,
sa transcription) : chaque phrase reprend ce timbre, pour que la voix ne change ni d'une phrase à l'autre ni d'un
épisode à l'autre. Environnement : Python 3.12, torch CPU, pip install voxcpm faster-whisper num2words.
Autres moteurs : « qwen3 » (Qwen3-TTS-12Hz-1.7B-Base, Apache-2.0, pip install qwen-tts), et « kokoro », la première
voix, abandonnée (Kokoro-82M via kokoro-onnx, modèles dans $TTS_MODELES).

Chaque prise est relue par faster-whisper (modèle small). Une prise où plus de 15 % des mots (et plus d'un) ne sont pas
reconnus est refaite, trois prises au plus, et la meilleure est gardée ; si elle reste douteuse, la phrase est signalée,
à réécrire dans le champ « dit » (orthographe phonétique : « bloum », « V soixante »).
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
SR = 48000
PRISES = 3


def ecrire_wav(chemin, x, sr):
    chemin.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(chemin), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


def lire_wav(chemin):
    with wave.open(str(chemin), 'rb') as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32768, w.getframerate()


def reechantillonner(x, sr_in, sr_out):
    if sr_in == sr_out:
        return x
    if sr_in % sr_out == 0:  # décimation : la moyenne par blocs coupe l'essentiel du repliement
        k = sr_in // sr_out
        return x[:len(x) // k * k].reshape(-1, k).mean(axis=1).astype(np.float32)
    n = int(round(len(x) * sr_out / sr_in))
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)


def rogner(x, sr):
    """Retire les silences de tête et de queue (30 ms gardées devant, 80 ms derrière), avec un fondu de 5 ms."""
    n = sr // 100
    rms = np.sqrt(np.mean(x[:len(x) // n * n].reshape(-1, n) ** 2, axis=1))
    actif = np.nonzero(rms > rms.max() * 10 ** (-40 / 20))[0]
    if not len(actif):
        return x
    y = x[max(0, actif[0] * n - int(0.03 * sr)):min(len(x), (actif[-1] + 1) * n + int(0.08 * sr))].copy()
    f = int(0.005 * sr)
    y[:f] *= np.linspace(0, 1, f)
    y[-f:] *= np.linspace(1, 0, f)
    return y


def egaliser(x, sr, cible=-20.0):
    """Même niveau de parole pour toutes les phrases : RMS des passages parlés ramené à `cible` dB."""
    n = sr // 100
    rms = np.sqrt(np.mean(x[:len(x) // n * n].reshape(-1, n) ** 2, axis=1))
    parle = rms[rms > rms.max() * 10 ** (-30 / 20)]
    return x * (10 ** (cible / 20) / max(1e-6, float(np.sqrt(np.mean(parle ** 2)))))


class Kokoro:
    aleatoire, lot = False, 1

    def __init__(self, v):
        from kokoro_onnx import Kokoro as K
        voix = MODELES / f"voix-{v['locuteur']}.npz"
        if not voix.exists():
            style = np.fromfile(MODELES / f"{v['locuteur']}.bin", dtype=np.float32).reshape(-1, 1, 256)
            np.savez(voix, **{v['locuteur']: style})
        self.k = K(str(MODELES / 'kokoro.onnx'), str(voix))
        self.v = v

    def dire(self, texte, graine):
        audio, sr = self.k.create(texte, voice=self.v['locuteur'], speed=self.v['vitesse'], lang='fr-fr')
        return audio.astype(np.float32), sr


class VoxCPM2:
    """Clonage « complet » : la référence donne le timbre, et sa transcription sert d'amorce à chaque phrase."""
    aleatoire, lot = True, 1

    def __init__(self, v):
        import torch
        from voxcpm import VoxCPM
        torch.set_num_threads(os.cpu_count() or 4)
        self.torch = torch
        self.m = VoxCPM.from_pretrained('openbmb/VoxCPM2', load_denoiser=False, optimize=False, device='cpu')
        self.ref = str(RACINE / f"{v['reference']}.flac")
        self.ref_texte = json.loads((RACINE / f"{v['reference']}.json").read_text(encoding='utf8'))['texte']

    def dire(self, texte, graine):
        self.torch.manual_seed(graine)
        w = self.m.generate(text=texte, prompt_wav_path=self.ref, prompt_text=self.ref_texte, reference_wav_path=self.ref,
                            cfg_value=2.0, inference_timesteps=10)
        return w.astype(np.float32), self.m.tts_model.sample_rate


class Qwen3:
    """Clonage par amorce : la référence et sa transcription précèdent chaque phrase. Par lots de 8, 1,7 fois plus vite."""
    aleatoire, lot = True, 8

    def __init__(self, v):
        import torch
        from qwen_tts import Qwen3TTSModel
        torch.set_num_threads(os.cpu_count() or 4)
        self.torch = torch
        self.m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base', device_map='cpu', dtype=torch.bfloat16,
                                               attn_implementation='sdpa')
        texte = json.loads((RACINE / f"{v['reference']}.json").read_text(encoding='utf8'))['texte']
        self.amorce = self.m.create_voice_clone_prompt(ref_audio=str(RACINE / f"{v['reference']}.flac"), ref_text=texte)

    def dire_lot(self, textes, graine):
        self.torch.manual_seed(graine)
        wavs, sr = self.m.generate_voice_clone(text=textes, language=['French'] * len(textes),
                                               voice_clone_prompt=self.amorce * len(textes))
        return [(w.astype(np.float32), sr) for w in wavs]


MOTEURS = {'kokoro': Kokoro, 'voxcpm2': VoxCPM2, 'qwen3': Qwen3}


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
    Moteur = MOTEURS[v['moteur']]
    # La clé de cache suit le réglage de la voix et le contenu de la référence : une nouvelle voix repart de zéro.
    empreinte = [v]
    if 'reference' in v:
        empreinte.append(hashlib.sha1((RACINE / f"{v['reference']}.flac").read_bytes()).hexdigest()[:12])
    cache = RACINE / 'out' / 'voix-cache'
    moteur = None

    from faster_whisper import WhisperModel
    asr = WhisperModel('small', device='cpu', compute_type='int8')

    def ecoute(x, dit):
        segs, _ = asr.transcribe(reechantillonner(x, SR, 16000), language='fr', beam_size=5)
        entendu = ' '.join(s.text for s in segs).strip()
        err = taux_erreur(dit, entendu)
        if len(x) / SR > 1.5 + 0.6 * len(mots(dit)):  # la voix ne s'est pas arrêtée
            err = max(err, 1.0)
        return err, entendu

    def tolere(dit):  # un mot mal reconnu passe toujours (homophones, chiffres)
        return max(0.15, 1 / max(1, len(mots(dit))))

    # Synthèse des phrases absentes du cache, par lots triés par longueur ; une prise douteuse repart avec une autre graine.
    dits = [p['dit'] for ch in n['chapitres'] for p in ch['phrases']]
    cle = {d: hashlib.sha1(json.dumps([*empreinte, d], ensure_ascii=False).encode()).hexdigest()[:16] for d in dits}
    prises = {}
    a_faire = sorted({d for d in dits if not (cache / f'{cle[d]}.wav').exists()}, key=len)
    for k in range(PRISES if Moteur.aleatoire else 1):
        if not a_faire:
            break
        moteur = moteur or Moteur(v)
        for i in range(0, len(a_faire), Moteur.lot):
            lot = a_faire[i:i + Moteur.lot]
            graine = int(cle[lot[0]][:8], 16) + k
            sons = moteur.dire_lot(lot, graine) if Moteur.lot > 1 else [moteur.dire(lot[0], graine)]
            for d, (audio, sr) in zip(lot, sons):
                x = egaliser(rogner(reechantillonner(audio, sr, SR), SR), SR)
                err, entendu = ecoute(x, d)
                if d not in prises or err < prises[d][1]:
                    prises[d] = (x, err, entendu)
                    ecrire_wav(cache / f'{cle[d]}.wav', x, SR)
            print(f'prise {k + 1} : {i + len(lot)}/{len(a_faire)} phrases', flush=True)
        a_faire = [d for d in a_faire if prises[d][1] > tolere(d)]

    t = 0.4
    morceaux = [np.zeros(int(t * SR), np.float32)]
    sortie = {'fps': FPS, 'chapitres': []}
    srt, alertes = [], []

    def silence(s):
        nonlocal t
        morceaux.append(np.zeros(int(round(s * SR)), np.float32))
        t += s

    for ch in n['chapitres']:
        c = {'id': ch['id'], 'num': ch.get('num', ''), 'titre': ch['titre'], 'debut': round(t * FPS), 'phrases': []}
        if ch.get('carte', True):
            c['carte'] = {'debut': round(t * FPS), 'fin': round((t + pauses['carte']) * FPS)}
            silence(pauses['carte'])
        for p in ch['phrases']:
            if p['dit'] in prises:
                x, err, entendu = prises[p['dit']]
            else:
                x, sr = lire_wav(cache / f"{cle[p['dit']]}.wav")
                x = reechantillonner(x, sr, SR)
                err, entendu = ecoute(x, p['dit'])
            if err > tolere(p['dit']):
                alertes.append((p['id'], err, p['dit'], entendu))
            debut = t
            morceaux.append(x)
            t += len(x) / SR
            c['phrases'].append({'id': p['id'], 'debut': round(debut * FPS), 'fin': round(t * FPS), 'texte': p['ecrit']})
            srt.append((debut, t, p['ecrit']))
            silence(pauses['phrase'])
        silence(pauses['chapitre'])
        c['fin'] = round(t * FPS)
        sortie['chapitres'].append(c)
        print(f"{c['num'] or '--'} {ch['titre']:<26} {(c['fin'] - c['debut']) / FPS:5.1f} s", flush=True)

    silence(3.0)  # le logo de fin reste à l'écran
    sortie['duree'] = round(t * FPS)
    voix = np.concatenate(morceaux)
    voix *= 0.89 / max(1e-6, float(np.max(np.abs(voix))))
    ecrire_wav(RACINE / 'public' / 'audio' / f'episode-{episode}-voix.wav', voix, SR)
    (dossier / 'minutage.json').write_text(json.dumps(sortie, ensure_ascii=False, indent=1) + '\n', encoding='utf8')
    lignes = [f'{i + 1}\n{srt_temps(a)} --> {srt_temps(b)}\n{txt}\n' for i, (a, b, txt) in enumerate(srt)]
    (RACINE / 'out').mkdir(exist_ok=True)
    (RACINE / 'out' / f'episode-{episode}.srt').write_text('\n'.join(lignes), encoding='utf8')
    print(f'durée totale {t:.1f} s ({sortie["duree"]} images)')
    for pid, err, dit, entendu in alertes:
        print(f'À REVOIR {pid} ({err * 100:.0f} % de mots non reconnus)\n   dit     : {dit}\n   entendu : {entendu}')


if __name__ == '__main__':
    main(sys.argv[1])
