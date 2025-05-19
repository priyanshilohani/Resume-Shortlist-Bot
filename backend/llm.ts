import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import * as dotenv from "dotenv";
dotenv.config();

const embeddings = new HuggingFaceInferenceEmbeddings({
  model: "sentence-transformers/all-MiniLM-L6-v2",
  apiKey: process.env.HF_TOKEN,
});

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  return dot / (normA * normB);
}

function getGoodBadPoints(resume: string, jd: string): { good: string[]; bad: string[] } {
  const good: string[] = [];
  const bad: string[] = [];

  const jdKeywords = jd.toLowerCase().split(/\W+/);
  const resumeWords = resume.toLowerCase();

  for (const keyword of jdKeywords) {
    if (keyword.length > 3) {
      if (resumeWords.includes(keyword)) {
        good.push(`Mentions ${keyword}`);
      } else {
        bad.push(`Missing ${keyword}`);
      }
    }
  }

  return { good, bad };
}

async function getEmbedding(source: string, targets: string[]): Promise<number[]> {
  console.log("Sending sentence pair to HF model:", { source, targets });

  const res = await fetch("https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {
        source_sentence: source,
        sentences: targets,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`HF API error: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function analyzeResume(resume: string, jd: string) {
  try {
    console.log("Requesting similarity score between resume and JD...");
    const similarities = await getEmbedding(resume, [jd]);
    const score = Math.round(similarities[0] * 100);

    const { good, bad } = getGoodBadPoints(resume, jd);
    return { score, good, bad };
  } catch (error) {
    console.error("Error in analyzeResume:", error);
    throw new Error("Failed to analyze resume");
  }
}





