// self-debug-rag.ts
// ------------------------------------------------------------
// A production-grade, self-debugging RAG indexer for your project.
// - Scans a directory recursively
// - Chunks files and creates embeddings with Ollama (local)
// - Stores vectors in Pinecone
// - Catches errors; on error it retrieves relevant code chunks from Pinecone
//   and asks a local LLM (via Ollama /api/generate) to explain & suggest a fix.
// - Also provides a tiny CLI: `index`, `ask` (RAG Q&A), `verify-index`.
// ------------------------------------------------------------

import fs from "fs";
import path from "path";
import crypto from "crypto";
// import fetch from "node-fetch";
import { Pinecone } from "@pinecone-database/pinecone";
// sgamp_user_01K2HDRFXVGWDCK78Y5FXF097F_a93e93b13710bbb59d27954832e24e1c74d48afd348bf3cbd5c4e86377c791ad
// ---------------------------
// ⚠️ Configuration (ENV)
const GEMINI = "AIzaSyDDkux0nJ_TYjNEJh2XKI7V99bo7egqvH4";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "mxbai-embed-large"; // 1024 dims
const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "deepseek-r1:latest"; // for explanations & Q&A

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "pcsk_ugUMR_AiwpqoXSUeVXfFrkUz8859TxMDiUP5gbnEB9q9WvqofP8u4adzUCSFJL86iH6k8";
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "my-project";
const PINECONE_DIM = Number(process.env.PINECONE_DIM || 1024); // match your embed model
const PINECONE_CLOUD = process.env.PINECONE_CLOUD || 'AWS'; // e.g., "aws"
const PINECONE_REGION = process.env.PINECONE_REGION || 'us-east-1'; // e.g., "us-east-1"

if (!PINECONE_API_KEY) {
  console.error("❌ Missing PINECONE_API_KEY. Set it in your environment.");
  process.exit(1);
}

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

// ---------------------------
// Utility: small concurrency pool
// ---------------------------
async function mapPool<T, R>(items: T[], limit: number, fn: (v: T, i: number) => Promise<R>): Promise<R[]> {
  const ret: R[] = [];
  let i = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) break;
      ret[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return ret;
}

// ---------------------------
// File system scanning & chunking
// ---------------------------
const INCLUDE_REGEX = /\.(js|ts|jsx|json|text)$/i;
const EXCLUDE_DIRS = ["node_modules", ".git", ".next", "dist", "build", ".turbo", ".venv", "venv", ".idea", ".vscode", "react", ".py"];
const EXCLUDE_FILES = [
  "config.example.json",
  "README.md",
  "tsconfig.json",
  "package-lock.json",
  "self-debug-rag.ts",
];

function walkFiles(root: string): string[] {
  const out: string[] = [];
  (function recur(dir: string) {
    let entries: string[] = [];
    try { entries = fs.readdirSync(dir); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e);
      let stat: fs.Stats;
      try { stat = fs.statSync(full); } catch { continue; }
      if (stat.isDirectory()) {
        if (
          EXCLUDE_DIRS.some(
            x =>
              full.includes(path.sep + x + path.sep) ||
              full.endsWith(path.sep + x)
          )
        ) continue;
        recur(full);
      } else {
        // Skip if matches EXCLUDE_FILES
        if (EXCLUDE_FILES.includes(e)) continue;
        if (INCLUDE_REGEX.test(full)) out.push(full);
      }
    }
  })(root);
  return out;
}

function chunkTextByLines(text: string, targetChars = 1200, overlap = 120) {
  const lines = text.split(/\r?\n/);
  const chunks: { text: string; start: number; end: number }[] = [];
  let start = 0;
  while (start < lines.length) {
    let size = 0;
    let end = start;
    while (end < lines.length && size + lines[end].length + 1 <= targetChars) {
      size += lines[end].length + 1;
      end++;
    }
    const chunk = lines.slice(start, end).join("\n").trim();
    if (chunk) chunks.push({ text: chunk, start, end });
    start = Math.max(end - Math.floor(overlap / 80), end); // rough overlap by lines
  }
  return chunks;
}

function hashId(s: string) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

// ---------------------------
// Ollama helpers
// ---------------------------
async function embed(text: string): Promise<number[] | null> {
  const clean = text.trim();
  if (!clean) return null;
  const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, prompt: clean })
  });
  if (!res.ok) {
    console.error("❌ Ollama embeddings error:", res.status, res.statusText);
    return null;
  }
  const data: any = await res.json();
  if (!data || !Array.isArray(data.embedding)) return null;
  return data.embedding as number[];
}

async function chat(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_CHAT_MODEL, prompt, stream: true })
  });
  if (!res.ok) return `Ollama chat error: ${res.status} ${res.statusText}`;
  // const data: any = await res.json();
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    // Ollama streams each JSON object per line
    for (const line of chunk.split("\n").filter(Boolean)) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.response) {
          process.stdout.write(parsed.response); // print without newline
          fullResponse += parsed.response;
        }
      } catch {
        // ignore lines that aren't valid JSON
      }
    }
  }

  console.log("\n--- Chat completed ---");
  return fullResponse || "(no response)";
}

// ---------------------------
// Pinecone helpers
// ---------------------------
async function ensureIndex(name: string, dimension: number) {
  const exists = await pinecone.listIndexes().then(list => list.indexes?.some(i => i.name === name));
  if (!exists) {
    if (!PINECONE_CLOUD || !PINECONE_REGION) {
      console.log(`ℹ️ Creating index '${name}' requires PINECONE_CLOUD & PINECONE_REGION env vars. Skipping auto-create.`);
      return;
    }
    console.log(`🛠️ Creating Pinecone index '${name}' (dim=${dimension}) ...`);
    await pinecone.createIndex({
      name,
      dimension,
      metric: "cosine",
      spec: { serverless: { cloud: PINECONE_CLOUD as any, region: PINECONE_REGION as any } }
    } as any);
    // Wait until ready
    let ready = false;
    while (!ready) {
      await new Promise(r => setTimeout(r, 3000));
      const d = await pinecone.describeIndex(name);
      ready = d.status?.ready === true;
      process.stdout.write(ready ? "\n" : ".");
    }
    console.log("✅ Index ready");
  }
}

async function upsertBatch(vectors: { id: string; values: number[]; metadata?: Record<string, any> }[]) {
  if (!vectors.length) return;
  const index = pinecone.index(PINECONE_INDEX_NAME);
  // Upsert in chunks of 100 for safety
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch as any);
  }
}

async function query(queryVector: number[], topK = 6) {
  const index = pinecone.index(PINECONE_INDEX_NAME);
  const res: any = await index.query({ vector: queryVector, topK, includeMetadata: true, includeValues: false } as any);
  return res.matches || [];
}

// ---------------------------
// Self-debugging: explain error using retrieved code
// ---------------------------
async function aiExplainErrorWithRAG(error: any, hint?: string) {
  const errMsg = (error && (error.stack || error.message || String(error))) || "Unknown error";
  const embedVec = await embed(errMsg + (hint ? `\nHINT:${hint}` : ""));
  let context = "";
  if (embedVec) {
    const matches = await query(embedVec, 8);
    context = matches.map((m: any, i: number) => `--- Context #${i + 1} (${m?.metadata?.file}:${m?.metadata?.range || "?"})\n${m?.metadata?.text || ""}`).join("\n\n");
  }
  const prompt = `You are an expert AI debugger for a RAG indexer (Ollama embeddings + Pinecone).\n\nERROR:\n${errMsg}\n\n${hint ? `HINT:\n${hint}\n\n` : ""}RETRIEVED CODE CONTEXT:\n${context || "(no context found)"}\n\nExplain likely root cause and propose a concrete fix. Return step-by-step actions and corrected code snippets where needed.`;
  const suggestion = await chat(prompt);
  console.log("\n🤖 AI Debug Suggestion:\n" + suggestion + "\n");
}

// ---------------------------
// Indexing pipeline
// ---------------------------
interface VectorItem { id: string; values: number[]; metadata: Record<string, any>; }

async function indexProject(rootDir: string) {
  await ensureIndex(PINECONE_INDEX_NAME, PINECONE_DIM);

  const files = walkFiles(rootDir);

  console.log(`\n 📁 Found ${files} files to process.`);

  // Process files with mild concurrency
  await mapPool(files, 4, async (file) => {
    try {
      const text = fs.readFileSync(file, "utf8");
      const chunks = chunkTextByLines(text, 1400, 160);
      if (!chunks.length) return;

      const vectors: VectorItem[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        const vec = await embed(c.text);
        if (!vec) continue;
        const id = hashId(`${file}:${c.start}-${c.end}:${hashId(c.text).slice(0, 8)}`);
        vectors.push({
          id,
          values: vec,
          metadata: {
            file,
            range: `${c.start}-${c.end}`,
            text: c.text.slice(0, 8000) // keep metadata within reason
          }
        });
      }
      await upsertBatch(vectors);
      console.log(`✅ Indexed ${file} (${vectors.length} chunks)`);
    } catch (err) {
      console.error(`❌ Failed to index ${file}:`, err);
      await aiExplainErrorWithRAG(err, `While indexing file: ${file}`);
    }
  });

  console.log("🎉 Indexing complete");
}
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: GEMINI });
// +=-------------------------
// RAG Q&A over your indexed project
// ---------------------------
async function ask(question: string) {
  const qVec = await embed(question);
  if (!qVec) {
    console.log("Could not embed question.");
    return;
  }
  const matches = await query(qVec, 8);
  const context = matches.map((m: any, i: number) => `--- Snippet #${i + 1} (${m?.metadata?.file}:${m?.metadata?.range})\n${m?.metadata?.text}`).join("\n\n");
  const prompt = `You are an expert code fixer.
User's question: ${question}

Relevant code context from the project:
${context}

If the error is caused by a missing column "maxi", find the exact file, explain why it's missing, and return the corrected code.
Return only fixed code and a short explanation.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log(response.text);
  // const answer = await chat(prompt);

  // console.log("\n🧠 Answer:\n" + answer + "\n");
}

// ---------------------------
// Verify index dimension quickly
// ---------------------------
async function verifyIndex() {
  try {
    const desc = await pinecone.describeIndex(PINECONE_INDEX_NAME as any);
    console.log("Index description:", JSON.stringify(desc, null, 2));
  } catch (err) {
    console.error("Could not describe index:", err);
  }
}

// ---------------------------
// CLI
// ---------------------------
// Examples:
//   ts-node self-debug-rag.ts index ./
//   ts-node self-debug-rag.ts ask "How does the login flow work?"
//   ts-node self-debug-rag.ts verify-index
// ---------------------------

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  try {
    if (cmd === "index") {
      const dir = rest[0] || ".";
      await indexProject(path.resolve(dir));
    } else if (cmd === "ask") {
      const q = /* rest.join(" ") ||  */`i cannot applya coupen code`;
      await ask(q);
    } else if (cmd === "verify-index") {
      await verifyIndex();
    } else {
      console.log(`Usage:\n  ts-node self-debug-rag.ts index <dir>\n  ts-node self-debug-rag.ts ask <question>\n  ts-node self-debug-rag.ts verify-index`);
    }
  } catch (err) {
    console.error("Top-level error:", err);
    await aiExplainErrorWithRAG(err, "Top-level CLI failure");
    process.exit(1);
  }
}

main();
