import { Hono } from 'hono';
import { cors } from 'hono/cors';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { analyzeResume } from './llm';
import { connectDB } from './db';

const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: 'https://resume-shortlist-bot.vercel.app',
  credentials: true,
}));

app.get('/', (c) => c.text('Backend is running!'));

// Helper to extract text from PDF or DOCX
async function extractText(fileBuffer: Buffer, fileName: string): Promise<string> {
  if (fileName.endsWith('.pdf')) {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } else if (fileName.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }

  return '';
}


// /analyze endpoint for bulk resume analysis
app.post('/analyze', async (c) => {
  const body = await c.req.parseBody();
  let files: File[] = [];
  if (Array.isArray(body.files)) {
    files = body.files;
  } else if (body.files instanceof File) {
    files = [body.files];
  } else {
    return c.json({ error: "No valid files uploaded." }, 400);
  }
  
  let jd = '';

  if (
    body.fields &&
    typeof body.fields === 'object' &&
    !(body.fields instanceof File)
  ) {
    const fields = body.fields as Record<string, unknown>;
    jd = String(fields.jd || fields.jobDescription || '');
  }

  if (!jd && typeof body.jd === 'string') {
    jd = body.jd;
  }

  if (!jd) {
    console.error("❌ Job description not found in request.");
    return c.json({ error: "Job description is missing." }, 400);
  }

  console.log("📄 Job Description:", jd.slice(0, 100));


  const results = await Promise.all(
    files.map(async (file: any) => {
      const buffer = await file.arrayBuffer();
      const text = await extractText(Buffer.from(buffer), file.name);
      const analysis = await analyzeResume(text, jd);

      // from here
      const db = await connectDB();
      const collection = db.collection('analyses');
      const record = {
        filename: file.name,
        jd,
        score: analysis.score,
        good: analysis.good,
        bad: analysis.bad,
        timestamp: new Date(),
      };

      await collection.insertOne(record); 

      // to here
      
      return {
        filename: file.name,
        ...analysis
      };
    })
  );

  return c.json({ results });
});


// this whole
app.get('/history', async (c) => {
  const db = await connectDB();
  const collection = db.collection('analyses');
  const records = await collection.find({}).sort({ timestamp: -1 }).toArray();
  return c.json({ history: records });  // <- key change here
});



export default app;
