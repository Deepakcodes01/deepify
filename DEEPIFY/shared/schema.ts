import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  duration: real("duration").notNull(), // in seconds
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  // Online music fields
  isOnline: boolean("is_online").default(false).notNull(),
  onlineId: text("online_id"), // ID from online service
  streamUrl: text("stream_url"), // Direct streaming URL
  thumbnailUrl: text("thumbnail_url"), // Album art URL
  source: text("source").default("local"), // 'local', 'jiosaavn', etc.
});

export const playHistory = pgTable("play_history", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull(),
  playedAt: timestamp("played_at").defaultNow().notNull(),
  playCount: integer("play_count").default(1).notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull(),
  isLiked: boolean("is_liked").default(false).notNull(),
  lastPlayed: timestamp("last_played"),
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  uploadedAt: true,
});

export const insertPlayHistorySchema = createInsertSchema(playHistory).omit({
  id: true,
  playedAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type PlayHistory = typeof playHistory.$inferSelect;
export type InsertPlayHistory = z.infer<typeof insertPlayHistorySchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
