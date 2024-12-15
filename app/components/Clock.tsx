import React, { useState, useEffect } from "react";

const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div>
      <p className="text-[3em]  font-bold w-full rounded-md">
        {currentTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}
      </p>
    </div>
  );
};

export default Clock;
