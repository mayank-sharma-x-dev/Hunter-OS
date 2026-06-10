import { useState } from "react";
import { Swords } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import UserProfileModal from "./UserProfileModal";

interface ProfileAvatarProps {
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
    rank: string | null;
  } | null;
  size?: "sm" | "md" | "lg";
  onProfileUpdate?: (profile: any) => void;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14"
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-8 h-8"
};

const ProfileAvatar = ({ profile, size = "md", onProfileUpdate }: ProfileAvatarProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    soundManager.playClick();
    setShowModal(true);
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    onProfileUpdate?.(updatedProfile);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="relative group cursor-pointer focus:outline-none"
        aria-label="Open profile"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-secondary to-primary opacity-50 blur group-hover:opacity-100 transition-opacity animate-pulse" />
        
        {/* Avatar container */}
        <div className={`relative ${sizeClasses[size]} rounded-full border-2 border-primary/50 overflow-hidden bg-muted group-hover:border-primary group-hover:scale-110 transition-all duration-300`}>
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.username || "Avatar"} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30">
              <Swords className={`${iconSizes[size]} text-primary/80`} />
            </div>
          )}
        </div>

        {/* Online indicator */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card animate-pulse" />
      </button>

      <UserProfileModal
        open={showModal}
        onOpenChange={setShowModal}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
};

export default ProfileAvatar;
