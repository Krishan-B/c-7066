import { useEffect, useRef } from "react";
import { ErrorHandler } from "@/services/errorHandling";

interface CleanupFunction {
  fn: () => void;
  description: string;
}

export const useCleanup = () => {
  const cleanupFunctions = useRef<CleanupFunction[]>([]);

  const addCleanup = (cleanupFn: () => void, description: string) => {
    cleanupFunctions.current.push({
      fn: cleanupFn,
      description,
    });
  };

  const cleanup = () => {
    cleanupFunctions.current.forEach(({ fn, description }) => {
      try {
        fn();
      } catch (error) {
        ErrorHandler.handleError(error, {
          description: `cleanup:${description}`,
        });
      }
    });
    cleanupFunctions.current = [];
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return { addCleanup, cleanup };
};

export const useInterval = (
  callback: () => void,
  delay: number | null,
  description?: string
) => {
  const savedCallback = useRef<() => void>(() => {});
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const { addCleanup } = useCleanup();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      try {
        savedCallback.current?.();
      } catch (error) {
        ErrorHandler.handleError(error, {
          description: `interval:${description || "unnamed"}`,
        });
      }
    };

    if (delay !== null) {
      intervalId.current = setInterval(tick, delay);
      addCleanup(
        () => {
          if (intervalId.current) {
            clearInterval(intervalId.current);
            intervalId.current = null;
          }
        },
        `interval:${description || "unnamed"}`
      );
    }
  }, [delay, description, addCleanup]);
};
