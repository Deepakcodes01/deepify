import { Handler } from '@netlify/functions';
import express from 'express';
import serverless from 'serverless-http';
import multer from 'multer';
import { storage } from '../../server/storage';
import { insertTrackSchema } from '../../shared/schema';
import { OnlineMusicService } from '../../server/online-music-service';
import { z } from 'zod';

const app = express();

// Configure multer for file uploads
const upload = multer({
  dest: "/tmp/uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/m4a', 'audio/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3, FLAC, and M4A files are allowed.'));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes
app.get("/tracks", async (req, res) => {
  try {
    const tracks = await storage.getAllTracks();
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tracks" });
  }
});

app.get("/tracks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const track = await storage.getTrack(id);
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }
    res.json(track);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch track" });
  }
});

app.post("/tracks/upload", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file provided" });
    }

    const { title, artist, album } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ message: "Title and artist are required" });
    }

    const duration = 180; // Mock duration

    const trackData = insertTrackSchema.parse({
      title,
      artist,
      album: album || null,
      duration,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    const track = await storage.createTrack(trackData);
    res.json(track);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid track data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to upload track" });
  }
});

app.get("/tracks/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const tracks = await storage.searchTracks(query);
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: "Failed to search tracks" });
  }
});

app.post("/tracks/:id/play", async (req, res) => {
  try {
    const trackId = parseInt(req.params.id);
    const track = await storage.getTrack(trackId);
    
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }

    const playRecord = await storage.recordPlay(trackId);
    res.json(playRecord);
  } catch (error) {
    res.status(500).json({ message: "Failed to record play" });
  }
});

app.post("/tracks/:id/like", async (req, res) => {
  try {
    const trackId = parseInt(req.params.id);
    const preference = await storage.toggleLike(trackId);
    res.json(preference);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

app.get("/tracks/liked", async (req, res) => {
  try {
    const likedTracks = await storage.getLikedTracks();
    res.json(likedTracks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch liked tracks" });
  }
});

app.get("/recommendations", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const recommendations = await storage.getRecommendations(limit);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

app.get("/recently-played", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const recentlyPlayed = await storage.getRecentlyPlayed(limit);
    res.json(recentlyPlayed);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recently played tracks" });
  }
});

app.get("/play-history", async (req, res) => {
  try {
    const playHistory = await storage.getPlayHistory();
    res.json(playHistory);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch play history" });
  }
});

app.get("/online/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const limit = parseInt(req.query.limit as string) || 20;
    const tracks = await OnlineMusicService.searchTracks(query, limit);
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: "Failed to search online tracks" });
  }
});

app.get("/online/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const tracks = await OnlineMusicService.getTrendingTracks(limit);
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trending tracks" });
  }
});

app.post("/online/add", async (req, res) => {
  try {
    const { onlineId, title, artist, album, duration, streamUrl, thumbnailUrl, source } = req.body;
    
    if (!onlineId || !title || !artist || !streamUrl) {
      return res.status(400).json({ message: "Missing required track information" });
    }

    const trackData = insertTrackSchema.parse({
      title,
      artist,
      album: album || null,
      duration,
      filePath: streamUrl,
      fileSize: 0,
      mimeType: "audio/mpeg",
      isOnline: true,
      onlineId,
      streamUrl,
      thumbnailUrl: thumbnailUrl || null,
      source: source || "jiosaavn"
    });

    const track = await storage.createTrack(trackData);
    res.json(track);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid track data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to add online track" });
  }
});

export const handler: Handler = serverless(app);