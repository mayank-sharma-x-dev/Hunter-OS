import { useCallback } from 'react';
import { soundManager } from '@/lib/sounds';

export const useHoverSound = () => {
  const onHover = useCallback(() => {
    soundManager.playHover();
  }, []);

  const hoverProps = {
    onMouseEnter: onHover,
  };

  return { onHover, hoverProps };
};
