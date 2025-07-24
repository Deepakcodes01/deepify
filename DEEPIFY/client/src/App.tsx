import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Library from "@/pages/library";
import MusicPlayer from "@/components/music-player";
import BottomNavigation from "@/components/bottom-navigation";
import { AudioPlayerProvider } from "@/hooks/use-audio-player";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/library" component={Library} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioPlayerProvider>
          <div className="min-h-screen flex flex-col max-w-md mx-auto relative spotify-bg-black">
            <main className="flex-1 pb-32">
              <Router />
            </main>
            <MusicPlayer />
            <BottomNavigation />
          </div>
          <Toaster />
        </AudioPlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
