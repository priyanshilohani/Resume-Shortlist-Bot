# AI Resume Shortlisting Bot

An AI-powered web application that helps recruiters and HR professionals quickly evaluate and score resumes based on a job description. Upload multiple resumes (PDF or DOCX), and the bot analyzes them using a Hugging Face model to return detailed scores, highlights, and feedback. Includes a history feature powered by MongoDB.

---

## Live Demo

- **Frontend**: [resume-shortlist-bot.vercel.app](https://resume-shortlist-bot.vercel.app)
- **Backend**: [resume-shortlist-bot-backend.vercel.app](https://resume-shortlist-bot-backend.vercel.app)

---

## Tech Stack

| Layer     | Technology                             |
|-----------|----------------------------------------|
| Frontend  | Next.js, Tailwind CSS, Axios           |    
| Backend   | Hono (TypeScript), Node.js             |
| AI Model  | Hugging Face Transformers              |
| Database  | MongoDB (Cloud)                        |
| Hosting   | Vercel (Frontend & Backend)            |

---

## Features

- Upload multiple resumes (PDF or DOCX)
- Paste or type in a job description
- Analyze resumes using a Hugging Face transformer model
- Score and get feedback (good points and bad points) on resume-job relevance
- Store and view analysis history
- Responsive UI

---

## Project Structure

/frontend → Next app for UI
/backend → Hono TypeScript server
├── index.ts → API routes
├── server.ts → Entry point
├── llm.ts → AI analysis logic
├── db.ts → MongoDB setup
└── .env → Environment variables


---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a .env file in /backend:

```env
MONGODB_URI=your_mongodb_uri_here
HUGGING_FACE_API_KEY=your_huggingface_api_key_here
```

Start the backend locally:

```bash
npm run dev
```

Server runs at http://localhost:3000

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create .env.local in /frontend:

```env
Edit
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

Run the frontend:

```bash
npm run dev
```

App available at http://localhost:3001



