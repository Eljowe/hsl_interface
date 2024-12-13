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
        type: number;
      };
    };
  };
}

interface StopInfo {
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
  const [stopInfo, setStopInfo] = useState<StopInfo | null>(null);
  const [error, setError] = useState<boolean>(false);

  const fetchData = async () => {
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
        setStopInfo(data.data.stop);
        setError(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(true);
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10000 milliseconds = 10 seconds
    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, [stopId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full min-w-[350px] p-2">
      {stopInfo && (
        <div className="flex flex-col items-start mb-4">
          <h1 className="text-3xl font-semibold">{stopInfo.name}</h1>
          <p className="text-sm">{stopInfo.desc}</p>
          <p className="text-sm border px-1 text-gray-500">{stopInfo.code}</p>
        </div>
      )}
      {stopTimes.length > 0 && (
        <div className="divide-y-2">
          {stopTimes.map((stopTime, index) => (
            <div key={index} className="flex py-2 flex-row items-start justify-between bg-white">
              <div className="text-sm font-semibold flex items-center">
                <div className="w-14">
                  <h2
                    className={`text-center px-2 py-1 text-white rounded-md ${
                      stopTime.trip.pattern.route.type === 702 ? "bg-orange-700" : "bg-blue-600"
                    }`}
                  >
                    {stopTime.trip.pattern.route.shortName}
                  </h2>
                </div>
                <span className="ml-2">{stopTime.headsign}</span>
              </div>
              <div
                className={`flex flex-row gap-2 ${
                  stopTime.realtimeState === "UPDATED" ? "text-green-600" : "text-black"
                }`}
              >
                <div className="w-max flex">
                  {(() => {
                    const currentTimeInSeconds =
                      new Date().getHours() * 3600 + new Date().getMinutes() * 60 + new Date().getSeconds();
                    const arrivalTimeInSeconds = stopTime.realtimeArrival;
                    const timeDifferenceInSeconds = arrivalTimeInSeconds - currentTimeInSeconds;

                    if (timeDifferenceInSeconds < 30) {
                      return "nyt";
                    } else if (timeDifferenceInSeconds < 60) {
                      return "1 min";
                    } else {
                      return `${Math.floor(timeDifferenceInSeconds / 60)} min`;
                    }
                  })()}
                </div>
                <div className="w-[46px]">{formatTime(stopTime.realtimeArrival)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusStop;