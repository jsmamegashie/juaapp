# ✦ Jua — Know Yourself

> An AI-powered personal growth and mental wellness app for young Africans aged 16–30.

**Jua** means "Know Yourself" in Swahili. This app is a daily companion that helps you build habits, set goals, reflect through journaling, track your mood, and get support from an AI growth companion — all in a simple, offline-friendly interface.

---

## 🌍 About This Project

This app was built as a capstone project for the **AILP (African Innovative Leadership Program)**, Track 1: Business Innovation — Option: Socially Responsible Innovation.

### The Problem
Young Africans face rising challenges around mental wellness, lack of structured self-development systems, and limited access to affordable support. Existing global apps fail to reflect the cultural realities of African users.

### The Solution
Jua is a human-centered mobile-first web app that integrates AI as a **guide**, not a decision-maker — supporting reflection, consistency, and personal growth.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Home Dashboard** | Daily overview with quote, mood check-in, habit preview & journal streak |
| 🎯 **Goals** | Set yearly, monthly, and weekly goals with context |
| ✅ **Habit Tracker** | Daily checklist with streak tracking and category tags |
| ✍️ **Journal** | AI-generated reflection prompts with private journaling |
| 💙 **Mood Tracker** | Log emotions, view mood history over time |
| 🤖 **AI Companion** | Powered by Claude — supportive, culturally aware, judgment-free |

---

## 🚀 Getting Started

### Option 1: GitHub Pages (Recommended)
1. Fork this repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Your app will be live at `https://yourusername.github.io/jua-app`

> **Note:** The AI Companion feature requires Anthropic API access. The rest of the app works fully offline with localStorage.

### Option 2: Run Locally
```bash
# Clone the repo
git clone https://github.com/yourusername/jua-app.git
cd jua-app

# Open in browser (no build step needed)
open index.html
# or
npx serve .
```

---

## 🤖 AI Companion Setup

The AI Companion uses the [Anthropic Claude API](https://www.anthropic.com).

For local development or a private deployment, you can add your API key. For a hosted GitHub Pages site, the companion will work if your deployment environment allows API calls.

---

## 📂 Project Structure

```
jua-app/
├── index.html          # Main app shell
├── css/
│   └── style.css       # All styles
├── js/
│   └── app.js          # App logic, state, rendering
└── README.md
```

---

## 🎨 Design Decisions

- **Offline-first**: All data stored in `localStorage` — no account needed
- **No build step**: Pure HTML/CSS/JS — deployable anywhere instantly
- **Culturally grounded**: Prompts, tone, and framing reflect African youth realities
- **Ethical AI**: AI is a guide, not a decision-maker; user always in control

---

## ⚖️ Ethical Principles

- Users control all their data (stored locally)
- AI provides reflection support, not diagnoses
- No tracking, no ads, no data sent to servers (except AI messages)
- Mental wellness resources encouraged when needed

---

## 📜 License

MIT License — free to use, adapt, and build upon.

---

*Built with care for the next generation of African leaders.*
