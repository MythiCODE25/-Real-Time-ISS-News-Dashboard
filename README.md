# 🛸 SpaceTrack AI Dashboard

> **SpaceTrack AI** — A production-quality React + Vite web application featuring real-time ISS tracking, live news intelligence, and an AI-powered chatbot.

![Dashboard Preview](./preview.png)

---

## ✨ Features

### 🛸 ISS Live Tracker
- Real-time ISS position fetched every **15 seconds** from `wheretheiss.at`
- Interactive **Leaflet.js** map with custom animated ISS marker
- **Trajectory path** showing last 20 tracked positions
- **Haversine formula** speed calculation
- Live stats: Latitude, Longitude, Altitude, Speed, Nearest Region
- Current astronaut crew list
- Auto-refresh with manual refresh button

### 📰 News Dashboard
- Live articles from **NewsData.io API**
- **Category filters**: Tech, Science, Space, Business, Health, Entertainment
- **Search** functionality with keyword filtering
- **Sort** by date or source
- **15-minute localStorage cache** to prevent API abuse
- Loading skeleton cards with smooth animations
- Responsive 3-column grid layout

### 🤖 ARIA AI Chatbot
- Powered by **Qwen 2.5 7B Instruct** via Hugging Face API
- **Context-restricted** — answers ONLY using dashboard data
- Floating chat button (bottom-right)
- Last 30 messages stored in **localStorage**
- Typing indicator, message timestamps
- Suggestion chips for quick questions

### 📊 Analytics
- **ISS Speed Area Chart** (last 30 readings) — Recharts
- **News Category Pie Chart** with interactive hover
- **ISS Live Map** with full trajectory
- Speed data log table with deviation tracking

### 🎨 UI/UX
- Glassmorphism cards with backdrop blur
- Dark/Light mode toggle (persisted in localStorage)
- Framer Motion animations throughout
- Fully responsive (mobile, tablet, desktop)
- Collapsible sidebar with active state indicators
- Live status indicators
- Toast notifications via React Hot Toast

---

## 🚀 Tech Stack

| Tool | Purpose |
|------|---------|
| React + Vite | Frontend framework |
| Tailwind CSS v3 | Styling |
| Framer Motion | Animations |
| React Router v6 | Routing |
| Leaflet.js | ISS Map |
| Recharts | Charts |
| Axios | HTTP client |
| React Hot Toast | Notifications |
| Lucide React | Icons |

---

## 📁 Project Structure

```
src/
├── context/          # Global state (ISS, News, Chat, Theme)
│   ├── ThemeContext.jsx
│   ├── ISSContext.jsx
│   ├── NewsContext.jsx
│   └── ChatContext.jsx
├── layouts/          # Page layout wrapper
│   └── DashboardLayout.jsx
├── components/       # Shared components
│   ├── Sidebar.jsx
│   └── Topbar.jsx
├── pages/            # Route pages
│   ├── Overview.jsx
│   ├── ISSTracker.jsx
│   ├── NewsDashboard.jsx
│   ├── Analytics.jsx
│   └── ChatbotPage.jsx
├── map/              # Leaflet ISS Map
│   └── ISSMap.jsx
├── charts/           # Recharts components
│   ├── SpeedChart.jsx
│   └── NewsChart.jsx
├── chatbot/          # Floating chatbot widget
│   └── Chatbot.jsx
├── App.jsx
├── main.jsx
└── index.css
```

---

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd "FOAI END SEM-ISS APP"
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

```env
VITE_NEWS_API_KEY=your_newsdata_io_api_key_here
VITE_HF_TOKEN=your_huggingface_token_here
```

**Get API Keys:**
- **NewsData.io**: [https://newsdata.io](https://newsdata.io) — Free tier available
- **Hugging Face**: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — Free account

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

```bash
npm run build
npm run preview
```

---

## 🔑 APIs Used

| API | URL | Purpose |
|-----|-----|---------|
| wheretheiss.at | `https://api.wheretheiss.at/v1/satellites/25544` | ISS position & velocity |
| open-notify.org | `http://api.open-notify.org/astros.json` | Astronaut crew data |
| NewsData.io | `https://newsdata.io/api/1/news` | News articles |
| Hugging Face | `https://api-inference.huggingface.co/v1/chat/completions` | AI chatbot (Qwen 2.5 7B) |
| CartoDB | Leaflet map tiles | Dark/light map tiles |

---

## 🎨 Design System

- **Primary**: `#6366f1` (Indigo)
- **Accent**: `#06b6d4` (Cyan), `#a855f7` (Purple), `#f97316` (Orange)
- **Dark BG**: `#020b18` → `#041128`
- **Font**: Inter (Google Fonts)
- **Glassmorphism**: `backdrop-blur-xl` + semi-transparent backgrounds

---

## 📦 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_NEWS_API_KEY` | NewsData.io API key for news fetching |
| `VITE_HF_TOKEN` | Hugging Face token for Qwen 2.5 7B chatbot |

> ⚠️ Never commit `.env` to version control. It's included in `.gitignore`.

---

- **Type**: Real-Time Dashboard Project
- **Stack**: React + Vite + Tailwind CSS + Framer Motion
