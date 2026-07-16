import { useEffect, useRef, useState } from 'react';

export function useCallTimer(isActive: boolean): number {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      startedAt.current = null;
      setElapsedSeconds(0);
      return undefined;
    }

    startedAt.current = performance.now();
    const interval = setInterval(() => {
      if (startedAt.current !== null) {
        setElapsedSeconds(Math.floor((performance.now() - startedAt.current) / 1000));
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isActive]);

  return elapsedSeconds;
}
