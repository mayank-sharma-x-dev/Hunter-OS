import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, TreePine, CloudRain, Bird, Wind } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SoundOption {
  id: string;
  name: string;
  icon: React.ElementType;
  url: string;
}

const AMBIENT_SOUNDS: SoundOption[] = [
  {
    id: 'rain',
    name: 'Rain',
    icon: CloudRain,
    url: 'https://cdn.pixabay.com/audio/2022/05/13/audio_257112780d.mp3',
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: TreePine,
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_4dedf5bf94.mp3',
  },
  {
    id: 'birds',
    name: 'Birds',
    icon: Bird,
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_942628f70d.mp3',
  },
  {
    id: 'wind',
    name: 'Wind',
    icon: Wind,
    url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0c6ff1bab.mp3',
  },
];

interface AmbientSoundPlayerProps {
  className?: string;
}

const AmbientSoundPlayer = ({ className }: AmbientSoundPlayerProps) => {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(30);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleSoundToggle = (soundId: string) => {
    if (activeSound === soundId) {
      // Stop current sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setActiveSound(null);
    } else {
      // Stop previous and play new
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
      if (sound) {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = volume / 100;
        audio.play().catch(console.error);
        audioRef.current = audio;
        setActiveSound(soundId);
      }
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      if (volume > 0) {
        audioRef.current.volume = 0;
        setVolume(0);
      } else {
        audioRef.current.volume = 0.3;
        setVolume(30);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm border border-primary/20',
          'hover:bg-card hover:border-primary/40 transition-all duration-300',
          activeSound && 'border-primary/60 shadow-glow'
        )}
      >
        {activeSound ? (
          <Volume2 className="h-5 w-5 text-primary animate-pulse" />
        ) : (
          <VolumeX className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-14 right-0 p-4 bg-card/95 backdrop-blur-md rounded-xl border border-primary/20 shadow-xl min-w-[220px] animate-fade-in z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Ambient Sounds</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleMuteToggle}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4 text-primary" />
              )}
            </Button>
          </div>

          {/* Sound Options */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {AMBIENT_SOUNDS.map((sound) => {
              const Icon = sound.icon;
              const isActive = activeSound === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => handleSoundToggle(sound.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200',
                    'hover:bg-primary/10',
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'bg-muted/50 text-muted-foreground border border-transparent'
                  )}
                  title={sound.name}
                >
                  <Icon className={cn('h-5 w-5', isActive && 'animate-pulse')} />
                  <span className="text-[10px] font-medium">{sound.name}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3">
            <VolumeX className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[volume]}
              onValueChange={([val]) => setVolume(val)}
              max={100}
              step={1}
              className="flex-1"
            />
            <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-muted-foreground">{volume}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbientSoundPlayer;
