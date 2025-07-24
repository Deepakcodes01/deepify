export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function parseAudioMetadata(file: File): Promise<{
  title: string;
  artist: string;
  album?: string;
  duration: number;
}> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      const filename = file.name.replace(/\.[^/.]+$/, "");
      const parts = filename.split(" - ");
      
      let title = filename;
      let artist = "Unknown Artist";
      let album: string | undefined;
      
      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts[1].trim();
        if (parts.length >= 3) {
          album = parts[2].trim();
        }
      }
      
      resolve({
        title,
        artist,
        album,
        duration: audio.duration || 0,
      });
      
      URL.revokeObjectURL(url);
    });
    
    audio.addEventListener('error', () => {
      resolve({
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist",
        duration: 0,
      });
      URL.revokeObjectURL(url);
    });
    
    audio.src = url;
  });
}

export function validateAudioFile(file: File): string | null {
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/m4a', 'audio/mp4', 'audio/wav'];
  
  if (!allowedTypes.includes(file.type)) {
    return "Invalid file type. Only MP3, FLAC, M4A, and WAV files are supported.";
  }
  
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return "File is too large. Maximum size is 50MB.";
  }
  
  return null;
}
