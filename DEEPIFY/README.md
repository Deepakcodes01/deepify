# Deepify - Music Player Application

A Spotify-inspired music player web application built with React, Express, and TypeScript. Supports both local music files and online streaming from JioSaavn.

## Features

- 🎵 **Local Music Upload**: Upload and play MP3, FLAC, M4A files
- 🌍 **Online Streaming**: Search and stream millions of songs from JioSaavn
- 🎨 **Spotify-Inspired UI**: Dark theme with modern, mobile-first design
- 🔍 **Dual Search**: Separate tabs for local library and online music discovery
- 📱 **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- 🎧 **Audio Player**: Full playback controls with seek, volume, next/previous
- 💾 **Music Library**: Save online songs to your personal library
- 🎯 **Recommendations**: Smart music recommendations based on listening history
- ☮️ **Peace Sign Branding**: Custom logo reflecting the harmony of music

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tools**: Vite, esbuild
- **Audio**: HTML5 Audio API
- **Music API**: JioSaavn (saavn.dev)

## Quick Start

### Prerequisites

- Node.js 18+ or Bun 1.0.29+
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd deepify-music-player
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Add your database URL:
```
DATABASE_URL=postgresql://username:password@localhost:5432/deepify
```

4. Set up the database:
```bash
npm run db:push
# or
bun run db:push
```

5. Start the development server:
```bash
npm run dev
# or
bun run dev
```

6. Open http://localhost:5000 in your browser

## Project Structure

```
deepify-music-player/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main app component
│   └── index.html
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database interface
│   ├── online-music-service.ts  # JioSaavn integration
│   └── vite.ts             # Vite dev server setup
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schemas
└── uploads/                # Local music file storage
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/deepify

# Optional: API Keys (if using different music services)
RAPIDAPI_KEY=your_rapidapi_key_here
```

## Features Overview

### Local Music
- Upload audio files via drag-and-drop or file picker
- Automatic metadata extraction
- Personal music library management
- Play history tracking

### Online Music
- Search millions of songs from JioSaavn
- High-quality streaming (up to 320kbps)
- Add online songs to personal library
- Trending music discovery

### Audio Player
- Play/pause, skip, seek controls
- Volume control
- Queue management
- Continuous playback between local and online tracks

### Responsive Design
- Mobile-first design principles
- Touch-friendly controls
- Progressive Web App (PWA) capabilities
- Add to home screen support

## Deployment

### Local Development
The app runs on a single port (5000) with Vite serving the frontend and Express handling the backend.

### Production Deployment
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

### Platform Deployment
The app is ready to deploy on platforms like:
- Replit
- Vercel
- Railway
- Heroku
- DigitalOcean

Just ensure your `DATABASE_URL` environment variable is set.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own music player!

## Credits

- Music data provided by JioSaavn API
- UI components from shadcn/ui
- Icons from Lucide React
- Built with love for music enthusiasts

---

Enjoy your music with Deepify! 🎵