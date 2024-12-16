import React, { useState, useEffect, useCallback } from "react";
import useTimeStore from "../stores/TimeStore";

const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  interface TimeStoreState {
    earlyBird: boolean;
    toggleEarlyBird: () => void;
  }

  const selectEarlyBird = useCallback(
    (state: TimeStoreState) => state.earlyBird,
    [],
  );
  const selectToggleEarlyBird = useCallback(
    (state: TimeStoreState) => state.toggleEarlyBird,
    [],
  );

  const earlyBird = useTimeStore(selectEarlyBird);
  const toggleEarlyBird = useTimeStore(selectToggleEarlyBird);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const displayTime = new Date(
    currentTime.getTime() + (earlyBird ? 2 * 60 * 1000 : 0),
  );

  return (
    <div onClick={toggleEarlyBird} className="cursor-pointer">
      <p className="w-full rounded-md text-[3em] font-bold">
        {displayTime.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </p>
    </div>
  );
};

export default Clock;
