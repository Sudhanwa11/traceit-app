# 🧭 TraceIt — Smart AI Lost & Found Platform

**TraceIt** is an AI-powered, bilingual Lost & Found web application designed for **college campuses**.  
Built with the **MERN stack** and enhanced with **Xenova’s on-device sentence embeddings**, TraceIt intelligently matches lost and found items based on semantic meaning — not just keywords.

---

## 🌟 Overview

TraceIt connects students who have **lost** something with those who have **found** it — seamlessly, intelligently, and securely.  
It uses **AI-based similarity search**, **real-time updates**, and a **reward system** to encourage campus participation.

---

## ✨ Core Features

### 🔍 AI-Powered Semantic Matching  
- Uses **Xenova multilingual embeddings** (384-dim) for local semantic similarity search.  
- Works across **English and Hindi** (or mixed-language inputs).  
- Finds matches based on *meaning*, not literal words.

### 📝 Detailed Item Management  
- Dual workflow: **Report Item (Found)** & **Request Item (Lost)**  
- Category system with both **main** and **sub-categories**  
- Real-time item updates with optional media uploads

### 🧠 Smart Matching Engine  
- Hybrid approach combining **text embeddings** and **optional image embeddings (CLIP 512-dim)**  
- Uses **MongoDB Atlas Vector Search** when available  
- Local **cosine similarity fallback** ensures it works offline or locally

### 📷 Media Handling  
- Upload multiple images or videos using **Multer + GridFS**  
- Images can optionally be embedded into the matching process for visual similarity

### 🔐 Secure Authentication  
- **JWT-based** authentication for users  
- Role-based item actions (reporters, claimants)  
- Each item is tied to the reporter’s unique account

### 🎯 Claim & Retrieval Workflow  
- Users can **claim** matched items  
- Reporters can **approve or reject** ownership claims  
- Items can be marked as **retrieved**, updating in real-time on both user dashboards

### 🏅 Gamified Reward System  
- Every successful retrieval earns **Service Points (+100 per match)**  
- Visual progress tracking and **tier-based rewards** (e.g., Service Honour Shirt)  
- Encourages active campus participation

### 🌐 Bilingual Support  
- Full **i18n support** via `react-i18next`  
- Supports both **English** and **Hindi** text matching and UI translation  
- Seamless switch from navbar

### 🌓 Light & Dark Mode  
- Fully responsive with theme context  
- Automatically adapts UI color scheme for better readability and aesthetics

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React.js, React Router, Axios, i18next |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Atlas Vector Search |
| **AI / ML** | Xenova Sentence Transformers (`all-MiniLM-L6-v2`), Optional CLIP for images |
| **Authentication** | JSON Web Tokens (JWT) |
| **File Storage** | GridFS via Multer |
| **Styling** | Tailwind / Custom CSS Variables |
| **Deployment** | Compatible with Vercel (client) & Render / Railway (server) |

---

🧩 Project Structure
TraceIt/
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components (FAQ, Navbar, Rewards, etc.)
│   │   ├── context/        # Theme & Auth contexts
│   │   ├── pages/          # All page views (Home, Matches, About, Help, Rewards)
│   │   ├── services/       # API service wrappers (auth, items, rewards)
│   │   └── i18n.js         # Language configuration
│   └── public/
│
├── server/                 # Express backend
│   ├── controllers/        # Route logic (items, users, matches)
│   ├── models/             # Mongoose schemas (Item, User)
│   ├── routes/             # REST API endpoints
│   ├── services/           # AI embedding, GridFS helpers
│   ├── middleware/         # Auth & error handling
│   └── app.js              # Main Express entry
│
└── package.json

🧠 AI Matching Logic (Simplified)

When an item is created:

  Description → embedded via Xenova SentenceTransformer
  Stored as a 384-dim vector (descriptionEmbedding)

When matching a lost item:

  Computes cosine similarity between its embedding and all found items
  (Optional) combines image similarity if both have embeddings

Uses weighted fusion:

  score = 0.6 * text_similarity + 0.4 * image_similarity

Matches above threshold (>= 0.45) are returned and displayed to the user.