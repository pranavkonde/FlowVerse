import { useState, useEffect, useCallback } from 'react';

interface TouchControls {
  isMobile: boolean;
  touchStart: (e: React.TouchEvent) => void;
  touchMove: (e: React.TouchEvent) => void;
  touchEnd: (e: React.TouchEvent) => void;
  isTouching: boolean;
  touchDirection: 'up' | 'down' | 'left' | 'right' | null;
}

export function useTouchControls(): TouchControls {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [touchDirection, setTouchDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const touchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setIsTouching(true);
    setTouchDirection(null);
  }, [isMobile]);

  const touchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !isTouching) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;
    
    const minDistance = 30; // Minimum distance for direction detection
    
    if (Math.abs(deltaX) > minDistance || Math.abs(deltaY) > minDistance) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setTouchDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setTouchDirection(deltaY > 0 ? 'down' : 'up');
      }
    }
  }, [isMobile, isTouching, touchStartPos]);

  const touchEnd = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    
    setIsTouching(false);
    // Reset direction after a short delay
    setTimeout(() => setTouchDirection(null), 100);
  }, [isMobile]);

  return {
    isMobile,
    touchStart,
    touchMove,
    touchEnd,
    isTouching,
    touchDirection
  };
}
