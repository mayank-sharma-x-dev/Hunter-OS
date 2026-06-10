import FloatingLeaves from './FloatingLeaves';
import Fireflies from './Fireflies';
import BreathingBackground from './BreathingBackground';
import CherryBlossoms from './CherryBlossoms';

interface NatureAmbienceProps {
  showLeaves?: boolean;
  showFireflies?: boolean;
  showBreathing?: boolean;
  showCherryBlossoms?: boolean;
  leavesCount?: number;
  firefliesCount?: number;
  cherryBlossomsCount?: number;
  breathingVariant?: 'default' | 'subtle' | 'mist';
  className?: string;
}

/**
 * NatureAmbience - A peaceful ambient effect component
 * 
 * Combines floating leaves, fireflies, cherry blossoms, and breathing background
 * for a calming, nature-inspired experience.
 */
const NatureAmbience = ({
  showLeaves = true,
  showFireflies = true,
  showBreathing = true,
  showCherryBlossoms = true,
  leavesCount = 6,
  firefliesCount = 10,
  cherryBlossomsCount = 10,
  breathingVariant = 'default',
  className = '',
}: NatureAmbienceProps) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {showBreathing && <BreathingBackground variant={breathingVariant} />}
      {showLeaves && <FloatingLeaves count={leavesCount} />}
      {showFireflies && <Fireflies count={firefliesCount} />}
      {showCherryBlossoms && <CherryBlossoms count={cherryBlossomsCount} />}
    </div>
  );
};

export default NatureAmbience;
