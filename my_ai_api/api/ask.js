// export default async function handler(req, res) {
//   return res.status(200).json({ message: "API is working!" });
// }

import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { question } = req.body;

  // Example static data (you can replace this with your file contents)
  const textData = [
    "Angular services are singleton objects.",
    "RxJS is a library for reactive programming using observables."
  ];

  // Find the most relevant context using embeddings
  const emb = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: textData
  });

  const queryEmb = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: question
  });

  // Simple cosine similarity
  function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dot / (normA * normB);
  }

  let best = textData[0];
  let bestSim = -1;
  for (let i = 0; i < emb.data.length; i++) {
    const sim = cosineSimilarity(emb.data[i].embedding, queryEmb.data[0].embedding);
    if (sim > bestSim) {
      bestSim = sim;
      best = textData[i];
    }
  }

  // Generate answer
  const completion = await client.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: "Answer based only on the given context." },
      { role: "user", content: `Context: ${best}\nQuestion: ${question}` }
    ]
  });

//   res.status(200).json({ answer: completion.choices[0].message.content });
// }
