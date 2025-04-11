# 🎮 AI Adventure Engine

**An extensible, AI-powered, text-based storytelling platform** inspired by *Dungeons & Dragons*.  
Players choose roles and make decisions that dynamically shape the narrative. Scenarios are fully customizable — parenting is just one example.

---

## 🌟 Features

- 🎲 **AI-Generated Scenes**  
  Powered by OpenAI to create fresh content every playthrough.
  
- 🧠 **Character Customization**  
  Roles with attribute bonuses, customizable skills and stats.

- 🎧 **Audio Feedback**  
  Dice rolls and scene transitions come alive with sound.

- 📜 **Dynamic Decision-Making**  
  Each action triggers stat checks and randomized outcomes (D20 dice).

- 🧩 **Modular Scenarios**  
  Easily swap out scenarios via JSON files (fantasy, political, parenting, etc.)

- 🔐 **Authentication + Save/Load**  
  Supabase-backed auth and persistent progress.

---

## ⚙️ Setup Instructions

### 📦 Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [Supabase](https://supabase.com/) project (Auth + `games` table)
- OpenAI API Key

---

### 🛠 Installation

```bash
git clone https://github.com/vivianw969/parent-ai-game.git
cd parent-ai-game
npm install

```
---

### 🔐 Environment Variables
Create a .env.local file:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key

Running Locally
```bash
npm run dev
```

---

## 💡 Thought Process

This project was built as a flexible game engine to support interactive storytelling, not confined to a single theme. Inspired by D&D mechanics, the goal was to blend player choices, RPG attributes, and AI narrative generation into one cohesive experience. Key design decisions include:

- Using JSON to define scenarios → easy to extend for different domains.

- Building with Next.js App Router and Framer Motion for smooth UI transitions.

- Using Supabase for real-time auth + database support.

- Integrating OpenAI to provide context-aware scene descriptions and action outcomes.

- Adding audio feedback to bring the gameplay to life.

🧠 Example Scenarios
- 🧒 Parenting (original demo)

- 🏛️ White House Advisor


To add new scenarios, simply create a new JSON under src/scenarios/ with proper attributes and story logic.

Enjoy!
