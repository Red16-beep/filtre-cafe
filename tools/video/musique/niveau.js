// Contrôle acoustique d'un WAV 16 bits : crête et RMS en dB (le ffmpeg de Remotion n'a pas volumedetect).
const fs = require('fs');
for (const f of process.argv.slice(2)) {
  const b = fs.readFileSync(f);
  let o = 12, n = 0;
  while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'data') { o += 8; n = sz / 2; break; } o += 8 + sz; }
  let pk = 0, s2 = 0;
  for (let i = 0; i < n; i++) { const v = b.readInt16LE(o + 2 * i) / 32768; pk = Math.max(pk, Math.abs(v)); s2 += v * v; }
  const crete = 20 * Math.log10(pk), rms = 10 * Math.log10(s2 / n);
  console.log(f.split('/').pop(), 'crête', crete.toFixed(1), 'dB · RMS', rms.toFixed(1), 'dB', crete < -30 ? 'SILENT_OUTPUT' : 'ok');
}
