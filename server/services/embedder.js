// server/services/embedder.js
// Local multilingual sentence embeddings (384-dim) with transformers.js.
// This version adds bilingual context to improve Hindi/English cross-matches.

let extractorPromise = null;

// Stays with multilingual MiniLM; you can swap to another 384-dim model later if needed.
const MODEL_ID = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';

async function getExtractor() {
  if (!extractorPromise) {
    const { pipeline } = await import('@xenova/transformers');
    extractorPromise = pipeline('feature-extraction', MODEL_ID, { quantized: true });
  }
  return extractorPromise;
}

/**
 * Build a weighted text block with an extra bilingual hint.
 * This boosts cross-language similarity for short titles/descriptions.
 */
function buildText(itemLike = {}) {
  const itemName = (itemLike.itemName || '').trim();
  const subCategory = (itemLike.subCategory || '').trim();
  const description = (itemLike.description || '').trim();
  const location = (itemLike.location || '').trim();

  // Weighted fields: title/subcategory > description > location
  // + A static bilingual hint to keep the embedding space aware of both languages.
  const bilingualHint =
    'Bilingual context: Use English and Hindi synonyms for better understanding. ' +
    'Examples: wallet/बटुआ, purse/पर्स, glasses/चश्मा, bag/बैग, phone/फोन, ID card/पहचान पत्र.';

  return [
    `${itemName} ${subCategory}`.trim(), // strong
    description,                         // medium
    location,                            // light
    bilingualHint                        // bias the embedding space toward cross-lingual alignment
  ].filter(Boolean).join(' . ');
}

async function embedItem(itemLike) {
  const text = buildText(itemLike);
  if (!text) return [];
  const extractor = await getExtractor();

  // mean + L2 normalize in the pipeline for stable cosine scores
  const out = await extractor(text, { pooling: 'mean', normalize: true });
  const tensor = Array.isArray(out) ? out[0] : out;
  return Array.from(tensor.data); // Float32Array(384) -> number[]
}

module.exports = {
  embedItem,
  buildText,
  MODEL_ID,
};
