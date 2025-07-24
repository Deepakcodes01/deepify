import { Button } from "@/components/ui/button";
import { Home, Search, Music, User } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/library", icon: Music, label: "Library" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 spotify-bg-black border-t border-gray-800 z-30">
      <div className="max-w-md mx-auto flex">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          
          return (
            <Link key={path} href={path} className="flex-1">
              <Button
                variant="ghost"
                className={`w-full py-3 flex flex-col items-center space-y-1 h-auto ${
                  isActive ? 'text-white' : 'spotify-text-light-gray hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
