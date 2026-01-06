# CozyCycle - Comfort App 💕

A beautiful couples' comfort app built to help you and your partner stay connected, especially during those special times when you need extra care.

## ✨ Features

- **Vibe Dashboard** - Share your mood status with your partner
- **Real-time Chat** - Send messages with vanish mode (disappears after 60s)
- **Live Location** - See where your partner is on a map
- **Memories** - Save and cherish special moments together
- **Pain Tracker** - Track and share how you're feeling
- **Special Dates** - Never miss birthdays and anniversaries
- **Comfort Tools** - Breathing exercises, heating pad animation, and more

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/shakeerprince/Comfort-App.git
cd comfort-app

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🗄️ Database Setup (Required for Multi-Device Sync)

For chat, location, and status to sync between you and your partner, you need a database.

### Setup Neon PostgreSQL (Free)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Get your connection string from the dashboard
4. Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://user:password@your-project.neon.tech/neondb?sslmode=require
```

5. The database tables will be created automatically on first request

> **Note:** Without a database, features work in local-only mode (same browser tabs only).

## 📱 Deploy on Vercel

1. Push your code to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Add the `DATABASE_URL` environment variable
4. Deploy!

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **GSAP** - Animations
- **Leaflet** - Maps
- **Neon PostgreSQL** - Database
- **Lucide Icons** - Beautiful icons

## 💜 Made with Love

This app was built with love for couples who want to stay connected and support each other. 💕
