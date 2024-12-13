import { useEffect, useState } from "react";

interface StopTime {
  headsign: string;
  realtimeDeparture: number;
  scheduledDeparture: number;
  realtimeArrival: number;
  scheduledArrival: number;
  realtimeState: string;
  stop: {
    platformCode: string;
  };
  trip: {
    pattern: {
      route: {
        shortName: string;
      };
    };
  };
}

interface stopInfo {
  name: string;
  code: string;
  desc: string;
  zoneId: string;
  lat: number;
  lon: number;
}

interface BusStopProps {
  stopId: string;
}

const BusStop: React.FC<BusStopProps> = ({ stopId }) => {
  const [stopTimes, setStopTimes] = useState<StopTime[]>([]);
  const [stopInfo, setstopInfo] = useState<stopInfo | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/aikataulu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stopId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setStopTimes(data.data.stop.stoptimes);
        setError(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(true);
      });

    fetch("/api/aikataulu/pysakki", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stopId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setstopInfo(data.data.stop);
        setError(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(true);
      });
  }, [stopId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  if (error) {
    return <div>Virhe ladattaessa pysäkin tietoja.</div>;
  }

  return (
    <div className="w-full max-w-4xl">
      {stopInfo && (
        <div className="flex flex-col items-center sm:items-start mb-4">
          <h1 className="text-3xl font-semibold">{stopInfo.name}</h1>
          <p className="text-lg">{stopInfo.desc}</p>
          <p className="text-md border px-1 text-gray-500">{stopInfo.code}</p>
        </div>
      )}
      {stopTimes.length > 0 && (
        <div>
          {stopTimes.map((stopTime, index) => (
            <div
              key={index}
              className="flex flex-row items-center justify-between p-4 mb-4 border rounded-lg shadow-md bg-white"
            >
              <div>
                <div className="text-xl font-semibold flex items-center">
                  <div className="w-20">
                    <h2 className="bg-blue-600 w-16 text-center px-2 py-1 text-white rounded-md">
                      {stopTime.trip.pattern.route.shortName}
                    </h2>{" "}
                  </div>
                  {stopTime.headsign}
                </div>
              </div>
              <p className={stopTime.realtimeState === "UPDATED" ? "text-green-600" : "text-black"}>
                {formatTime(stopTime.realtimeArrival)}
                <span className="ml-2">
                  {Math.max(
                    0,
                    Math.floor(
                      (stopTime.realtimeArrival -
                        (new Date().getHours() * 3600 + new Date().getMinutes() * 60 + new Date().getSeconds())) /
                        60
                    )
                  ) === 0
                    ? "nyt"
                    : `${Math.max(
                        0,
                        Math.floor(
                          (stopTime.realtimeArrival -
                            (new Date().getHours() * 3600 + new Date().getMinutes() * 60 + new Date().getSeconds())) /
                            60
                        )
                      )} min`}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusStop;
