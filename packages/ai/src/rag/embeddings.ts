import OpenAI from "openai";

const MODEL = "text-embedding-3-small";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI();
  }
  return client;
}

function normalize(vec: Float32Array): Float32Array {
  let norm = 0;
  for (const v of vec) {
    norm += v * v;
  }
  norm = Math.sqrt(norm);
  if (norm === 0) return vec;
  return vec.map(v => v / norm);
}

export async function embed(text: string): Promise<Float32Array> {
  const response = await getClient().embeddings.create({
    model: MODEL,
    input: text,
  });

  const embedding = response.data[0]?.embedding;
  if (!embedding) {
    throw new Error("No embedding returned from OpenAI");
  }

  return normalize(new Float32Array(embedding));
}

export async function embedBatch(texts: string[]): Promise<Float32Array[]> {
  if (texts.length === 0) return [];

  const response = await getClient().embeddings.create({
    model: MODEL,
    input: texts,
  });

  return response.data.map((item) => {
    const embedding = item.embedding;
    if (!embedding) {
      throw new Error("No embedding returned from OpenAI");
    }
    return normalize(new Float32Array(embedding));
  });
}
