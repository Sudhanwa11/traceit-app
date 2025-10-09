// server/services/imageEmbedder.js
let clipPromise;

async function getClip() {
  if (!clipPromise) {
    const { pipeline } = await import('@xenova/transformers');
    clipPromise = pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32', { quantized: true });
  }
  return clipPromise;
}

exports.embedImageFromBuffer = async (buffer) => {
  const clip = await getClip();
  // Xenova can take a Uint8Array buffer directly
  const out = await clip(new Uint8Array(buffer), { pooling: 'mean', normalize: true });
  return Array.from(out.data); // Float32Array(512) -> number[]
};

// simple mean + renormalize
exports.meanUnit = (vectors) => {
  const n = vectors.length;
  if (!n) return [];
  const d = vectors[0].length;
  const out = new Array(d).fill(0);
  for (const v of vectors) for (let i=0;i<d;i++) out[i] += v[i];
  for (let i=0;i<d;i++) out[i] /= n;
  let norm = 0; for (let i=0;i<d;i++) norm += out[i]*out[i];
  norm = Math.sqrt(norm) || 1;
  for (let i=0;i<d;i++) out[i] /= norm;
  return out;
};
