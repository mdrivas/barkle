import { BaseDog } from "./BaseDog";
import { Pencil } from "lucide-react";

interface DogAvatarProps {
  size?: "sm" | "md" | "lg";
  showEditButton?: boolean;
  imageUrl?: string | null;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24"
};

export function DogAvatar({ 
  size = "md", 
  showEditButton = false,
  imageUrl,
  onClick 
}: DogAvatarProps) {
  return (
    <div className="relative group">
      <div 
        className={`${sizeClasses[size]} ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""}`}
        onClick={onClick}
      >
        <BaseDog imageUrl={imageUrl} />
      </div>
      {showEditButton && (
        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 group-hover:text-zinc-200">
          <Pencil className="h-3 w-3" />
        </div>
      )}
    </div>
  );
} 