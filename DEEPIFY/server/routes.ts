import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { insertTrackSchema, insertPlayHistorySchema } from "@shared/schema";
import { OnlineMusicService } from "./online-music-service";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tracks
  app.get("/api/tracks", async (req, res) => {
    try {
      const tracks = await storage.getAllTracks();
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  // Get single track
  app.get("/api/tracks/:id", async (req, res) => {
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

  // Upload track
  app.post("/api/tracks/upload", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const { title, artist, album } = req.body;
      if (!title || !artist) {
        return res.status(400).json({ message: "Title and artist are required" });
      }

      // Get audio duration (simplified - in real app would use audio metadata library)
      const duration = 180; // Mock duration - replace with actual audio analysis

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

  // Serve audio files
  app.get("/api/tracks/:id/stream", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const track = await storage.getTrack(id);
      
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }

      const filePath = track.filePath;
      
      try {
        await fs.access(filePath);
        res.setHeader('Content-Type', track.mimeType);
        res.setHeader('Content-Length', track.fileSize);
        
        // Support range requests for audio streaming
        const range = req.headers.range;
        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : track.fileSize - 1;
          const chunksize = (end - start) + 1;
          
          res.status(206);
          res.setHeader('Content-Range', `bytes ${start}-${end}/${track.fileSize}`);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Content-Length', chunksize);
        }
        
        res.sendFile(path.resolve(filePath));
      } catch (fileError) {
        res.status(404).json({ message: "Audio file not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to stream track" });
    }
  });

  // Search tracks
  app.get("/api/tracks/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const tracks = await storage.searchTracks(query);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to search tracks" });
    }
  });

  // Record play
  app.post("/api/tracks/:id/play", async (req, res) => {
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

  // Toggle like
  app.post("/api/tracks/:id/like", async (req, res) => {
    try {
      const trackId = parseInt(req.params.id);
      const preference = await storage.toggleLike(trackId);
      res.json(preference);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Get liked tracks
  app.get("/api/tracks/liked", async (req, res) => {
    try {
      const likedTracks = await storage.getLikedTracks();
      res.json(likedTracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch liked tracks" });
    }
  });

  // Get recommendations
  app.get("/api/recommendations", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recommendations = await storage.getRecommendations(limit);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Get recently played
  app.get("/api/recently-played", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recentlyPlayed = await storage.getRecentlyPlayed(limit);
      res.json(recentlyPlayed);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recently played tracks" });
    }
  });

  // Get play history
  app.get("/api/play-history", async (req, res) => {
    try {
      const playHistory = await storage.getPlayHistory();
      res.json(playHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch play history" });
    }
  });

  // Online music search
  app.get("/api/online/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const limit = parseInt(req.query.limit as string) || 20;
      const tracks = await OnlineMusicService.searchTracks(query, limit);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to search online tracks" });
    }
  });

  // Get trending online tracks
  app.get("/api/online/trending", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const tracks = await OnlineMusicService.getTrendingTracks(limit);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending tracks" });
    }
  });

  // Add online track to library
  app.post("/api/online/add", async (req, res) => {
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
        filePath: streamUrl, // Use streamUrl as filePath for online tracks
        fileSize: 0, // Online tracks don't have file size
        mimeType: "audio/mpeg", // Assume MP3 for streaming
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

  const httpServer = createServer(app);
  return httpServer;
}
