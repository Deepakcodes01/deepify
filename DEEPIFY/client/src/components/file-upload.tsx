import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("audio", file);
      
      // Extract metadata from filename (basic approach)
      const filename = file.name.replace(/\.[^/.]+$/, "");
      const parts = filename.split(" - ");
      
      if (parts.length >= 2) {
        formData.append("artist", parts[0]);
        formData.append("title", parts[1]);
        if (parts.length >= 3) {
          formData.append("album", parts[2]);
        }
      } else {
        formData.append("title", filename);
        formData.append("artist", "Unknown Artist");
      }

      const response = await fetch("/api/tracks/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "Success",
        description: "Track uploaded successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid File",
          description: `${file.name} is not an audio file`,
          variant: "destructive",
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 50MB`,
          variant: "destructive",
        });
        return;
      }

      uploadMutation.mutate(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".mp3,.flac,.m4a,.wav"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={uploadMutation.isPending}
        className="p-2"
      >
        {uploadMutation.isPending ? (
          <Upload className="animate-spin spotify-text-light-gray" size={18} />
        ) : (
          <Plus className="spotify-text-light-gray hover:text-white" size={18} />
        )}
      </Button>
    </>
  );
}
