"""Création d'une voix de narrateur par description, figée ensuite dans voix/<nom>.flac.

  python outils/voix.py <nom> <moteur> "<description, en anglais>" <graine>   (depuis tools/video, Python de l'environnement TTS)

Moteurs : qwen3 (Qwen3-TTS-12Hz-1.7B-VoiceDesign, Apache-2.0) ou voxcpm2 (openbmb/VoxCPM2, Apache-2.0).
Le modèle invente une voix qui répond à la description : elle n'imite personne. Il lit l'extrait ci-dessous, et
l'enregistrement devient la référence de narration.py pour toutes les phrases de tous les épisodes, d'où un timbre
constant. Écrit voix/<nom>.flac (24 kHz) et voix/<nom>.json (transcription, description, graine, moteur). Une même
graine redonne la même voix sur la même machine ; essayer plusieurs graines et garder celle qu'on préfère à l'oreille.
"""
import json
import os
import sys
from pathlib import Path

import numpy as np

RACINE = Path(__file__).resolve().parents[1]
EXTRAIT = ("Quinze grammes de café, deux cent cinquante grammes d'eau, quatre-vingt-treize degrés, et trois minutes devant "
           "vous. C'est tout ce qu'il faut pour un V soixante réussi. Il reste la référence du café filtre, parce qu'il ne "
           "cache rien : ce que vous mettez dedans, vous le retrouvez dans la tasse. Le bloum d'abord : trente grammes "
           "d'eau sur tout le café, puis trente secondes d'attente. Le café gonfle, et relâche son gaz carbonique.")
MODELES = {'qwen3': 'Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', 'voxcpm2': 'openbmb/VoxCPM2'}


def creer(moteur, description, graine):
    import torch
    torch.set_num_threads(os.cpu_count() or 4)
    if moteur == 'qwen3':
        from qwen_tts import Qwen3TTSModel
        m = Qwen3TTSModel.from_pretrained(MODELES[moteur], device_map='cpu', dtype=torch.bfloat16, attn_implementation='sdpa')
        torch.manual_seed(graine)
        wavs, sr = m.generate_voice_design(text=EXTRAIT, language='French', instruct=description)
        return wavs[0], sr
    from voxcpm import VoxCPM
    m = VoxCPM.from_pretrained(MODELES[moteur], load_denoiser=False, optimize=False, device='cpu')
    torch.manual_seed(graine)
    return m.generate(text=f'({description}){EXTRAIT}', cfg_value=2.0, inference_timesteps=10), m.tts_model.sample_rate


def main(nom, moteur, description, graine):
    import librosa
    import soundfile as sf
    w, sr = creer(moteur, description, graine)
    x = librosa.resample(np.asarray(w, dtype=np.float32), orig_sr=sr, target_sr=24000)
    dossier = RACINE / 'voix'
    dossier.mkdir(exist_ok=True)
    sf.write(dossier / f'{nom}.flac', x, 24000)
    (dossier / f'{nom}.json').write_text(json.dumps({
        'moteur': moteur, 'modele': MODELES[moteur], 'description': description, 'graine': graine, 'texte': EXTRAIT,
    }, ensure_ascii=False, indent=1) + '\n', encoding='utf8')
    print(f'voix/{nom}.flac : {len(x) / 24000:.1f} s')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]))
