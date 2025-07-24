# Deepify - Music Player App

## Overview

Deepify is a full-stack music player application built with React, Express, and TypeScript. The app provides a Spotify-inspired mobile-first interface for uploading, organizing, and playing both local and online music. It features a modern UI with dark theming, audio playback controls, dual search functionality (local + online), and music recommendations. The app integrates with JioSaavn API for streaming millions of online songs without requiring API keys. The app uses a peace sign as its logo, reflecting the calming and harmonious nature of music.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared code:

- **Frontend**: React SPA with TypeScript, built using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build System**: Vite for frontend, esbuild for backend production builds

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Context for audio player state, TanStack Query for server state
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with Spotify-inspired custom color scheme
- **Mobile-First**: Responsive design optimized for mobile devices

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database ORM**: Drizzle with PostgreSQL dialect
- **File Handling**: Multer for audio file uploads
- **Storage**: Configurable storage interface with in-memory implementation
- **API**: RESTful endpoints for tracks, playback history, and user preferences

### Database Schema
The database uses three main tables:
- **tracks**: Stores music metadata (title, artist, album, duration, file path) with online music support (isOnline, onlineId, streamUrl, thumbnailUrl, source)
- **play_history**: Records when tracks are played for recommendations
- **user_preferences**: Manages user interactions like likes and last played timestamps

### Online Music Integration
- **JioSaavn API**: Provides access to millions of songs without API keys
- **Dual Search**: Local library search + online music discovery
- **Streaming Support**: Direct audio streaming from online sources
- **Add to Library**: Users can save online tracks to their personal library

### Audio Player System
- **Context Provider**: Global audio state management using React Context
- **HTML5 Audio**: Native audio element for playback control
- **Features**: Play/pause, seek, volume control, next/previous, playlist management
- **State Tracking**: Current track, playback position, loading states

## Data Flow

1. **File Upload**: Users upload audio files via drag-and-drop or file picker
2. **Metadata Extraction**: Server extracts basic metadata from filename
3. **Database Storage**: Track information stored in PostgreSQL
4. **Client Sync**: React Query manages client-server state synchronization
5. **Playback**: Audio player context handles playback state and controls
6. **Analytics**: Play history recorded for recommendation engine

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon database
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **wouter**: Lightweight client-side routing
- **multer**: File upload handling
- **zod**: Runtime type validation

### Development Tools
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production backend bundling
- **tailwindcss**: Utility-first CSS framework

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Drizzle migrations for schema management

### Production
- **Frontend**: Static build via Vite, served from Express
- **Backend**: Bundled with esbuild for Node.js execution
- **Database**: PostgreSQL with connection pooling via Neon
- **File Storage**: Local file system (configurable for cloud storage)

### Build Process
1. Frontend assets built to `dist/public`
2. Backend bundled to `dist/index.js`
3. Database migrations applied via `drizzle-kit push`
4. Static files served by Express in production

The application is designed to be deployment-ready for platforms like Replit with minimal configuration, requiring only a `DATABASE_URL` environment variable for PostgreSQL connection.