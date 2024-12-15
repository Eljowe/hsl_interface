import { useEffect, useState, useCallback } from "react";
import useBusStopStore from "../store";
import { CircleX } from "lucide-react";

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

  const deleteStop = useBusStopStore((state) => state.deleteStop);

  const handleDelete = (id: string) => {
    deleteStop(id);
  };

  const fetchData = useCallback(async () => {
    try {
      const responseAikataulu = await fetch("/api/aikataulu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stopId }),
      });
      const dataAikataulu = await responseAikataulu.json();
      if (dataAikataulu.data && dataAikataulu.data.stop) {
        setStopTimes(dataAikataulu.data.stop.stoptimes);
        setError(false);
      } else {
        throw new Error("Invalid data structure for aikataulu");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(true);
    }

    try {
      const responsePysakki = await fetch("/api/pysakki", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stopId }),
      });
      const dataPysakki = await responsePysakki.json();
      if (dataPysakki.data && dataPysakki.data.stop) {
        setStopInfo(dataPysakki.data.stop);
        setError(false);
      } else {
        setError(true);
        throw new Error("Invalid data structure for pysakki");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(true);
    }
  }, [stopId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10000 milliseconds = 10 seconds
    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, [fetchData]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="w-[380px] p-2">
        <h1 className="text-3xl font-semibold">Virhe</h1>
        <p className="text-sm">Tietoja ei voitu hakea. Yritä myöhemmin uudelleen.</p>
        <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded" onClick={() => handleDelete(stopId)}>
          Poista asema
        </button>
      </div>
    );
  }

  return (
    <div className="w-[380px]">
      {stopInfo && (
        <div className="flex flex-col items-start mb-4">
          <div className="flex gap-2">
            <h1 className="text-3xl font-semibold">{stopInfo.name}</h1>
            <button onClick={() => handleDelete(stopId)} className="text-neutral-500">
              <CircleX />
            </button>
          </div>
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
                      stopTime.trip.pattern.route.type === 702 || stopTime.trip.pattern.route.type === 1
                        ? "bg-orange-700"
                        : stopTime.trip.pattern.route.type === 0
                        ? "bg-green-700"
                        : "bg-blue-600"
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
