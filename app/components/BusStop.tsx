import { useEffect, useState, useCallback } from "react";
import useBusStopStore from "../stores/BusStopStore";
import useTimeStore from "../stores/TimeStore";
import {
  CircleX,
  TramFront,
  BusFront,
  TrainFront,
  SquareMIcon,
} from "lucide-react";

interface StopInfo {
  stopId: string;
  vehicleMode: string;
}

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
        mode: string;
      };
    };
  };
}

interface FetchStopInfo {
  name: string;
  code: string;
  desc: string;
  zoneId: string;
  lat: number;
  lon: number;
  vehicleMode: string;
}

interface BusStopInfo {
  StopInfo: StopInfo;
}

const renderIcon = (mode: string) => {
  switch (mode) {
    case "TRAM":
      return (
        <div className="h-min rounded-md bg-green-700 p-2 text-white">
          <TramFront size={24} />
        </div>
      );
    case "BUS":
      return (
        <div className="h-min rounded-md bg-blue-600 p-2 text-white">
          <BusFront size={24} />
        </div>
      );
    case "SUBWAY":
      return (
        <div className="h-min rounded-md bg-orange-600 p-2 text-white">
          <SquareMIcon size={24} />
        </div>
      );
    case "RAIL":
      return (
        <div className="h-min rounded-md bg-purple-700 p-2 text-white">
          <TrainFront size={24} />
        </div>
      );
    default:
      return (
        <div className="h-min rounded-md bg-purple-700 p-2 text-white">
          <TrainFront size={24} />
        </div>
      );
  }
};

const getBackgroundColor = (mode: string, type: number) => {
  switch (mode) {
    case "BUS":
      return type === 702 ? "bg-orange-700" : "bg-blue-600";
    case "TRAM":
      return "bg-green-700";
    case "SUBWAY":
      return "bg-orange-600";
    case "RAIL":
      return "bg-purple-800";
    default:
      return "bg-red-500";
  }
};

const fetchSchedule = async (
  stopId: string,
  earlyBird: boolean,
  mode: string,
) => {
  const apiUrl = mode === "RAIL" ? "/api/juna_aikataulu" : "/api/aikataulu";
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stopId }),
  });
  const data = await response.json();
  if (data.data) {
    const currentTime = new Date();
    const currentTimeInSeconds =
      currentTime.getHours() * 3600 +
      currentTime.getMinutes() * 60 +
      currentTime.getSeconds();
    const adjustedTimeInSeconds =
      currentTimeInSeconds + (earlyBird ? 2 * 60 : 0);
    const filteredStopTimes =
      mode === "RAIL"
        ? data.data.station.stoptimes.filter(
            (stopTime: StopTime) =>
              stopTime.realtimeDeparture > adjustedTimeInSeconds,
          )
        : data.data.stop.stoptimes.filter(
            (stopTime: StopTime) =>
              stopTime.realtimeDeparture > adjustedTimeInSeconds,
          );
    return filteredStopTimes.slice(0, 5);
  } else {
    throw new Error(`Invalid data structure for aikataulu ${stopId}`);
  }
};

const fetchBusFetchStopInfo = async (stopId: string, mode: string) => {
  const apiUrl = mode === "RAIL" ? "/api/juna_pysakki" : "/api/pysakki";
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stopId }),
  });
  const data = await response.json();
  if (data.data) {
    if (mode === "RAIL") {
      return data.data.station;
    }
    return data.data.stop;
  } else {
    throw new Error(`Invalid data structure for pysakki ${stopId}`);
  }
};

const renderStopTimes = (stopTimes: StopTime[], earlyBird: boolean) => {
  return (
    stopTimes.length > 0 && (
      <div className="divide-y-2">
        {stopTimes.map((stopTime, index) => (
          <div
            key={index}
            className="flex flex-row items-start justify-between bg-white py-2"
          >
            <div className="flex items-center text-sm font-semibold">
              <div className="w-14">
                <h2
                  className={`rounded-md px-2 py-1 text-center text-white ${getBackgroundColor(
                    stopTime.trip.pattern.route.mode,
                    stopTime.trip.pattern.route.type,
                  )}`}
                >
                  {stopTime.trip.pattern.route.shortName}
                </h2>
              </div>
              <span className="ml-2">{stopTime.headsign}</span>
            </div>
            <div
              className={`flex flex-row gap-2 ${
                stopTime.realtimeState === "UPDATED"
                  ? "text-green-600"
                  : "text-black"
              }`}
            >
              <div className="flex w-max">
                {(() => {
                  const currentTimeInSeconds =
                    new Date().getHours() * 3600 +
                    new Date().getMinutes() * 60 +
                    new Date().getSeconds() +
                    (earlyBird ? 2 * 60 : 0);
                  const arrivalTimeInSeconds = stopTime.realtimeArrival;
                  const timeDifferenceInSeconds =
                    arrivalTimeInSeconds - currentTimeInSeconds;

                  if (timeDifferenceInSeconds < 30) {
                    return "nyt";
                  } else if (timeDifferenceInSeconds < 60) {
                    return "1 min";
                  } else {
                    return `${Math.floor(timeDifferenceInSeconds / 60)} min`;
                  }
                })()}
              </div>
              <div className="w-[46px]">
                {formatTime(stopTime.realtimeArrival)}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  );
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const BusStop: React.FC<BusStopInfo> = ({ StopInfo }) => {
  const [stopTimes, setStopTimes] = useState<StopTime[]>([]);
  const [FetchStopInfo, setFetchStopInfo] = useState<FetchStopInfo | null>(
    null,
  );

  if (!StopInfo) {
    return null;
  }

  const [error, setError] = useState<boolean>(false);
  const earlyBird = useTimeStore((state) => state.earlyBird);

  const deleteStop = useBusStopStore((state) => state.deleteStop);
  const handleDelete = (id: string) => {
    deleteStop(id);
  };

  const fetchData = useCallback(async () => {
    try {
      const [FetchStopInfo, stopTimes] = await Promise.all([
        fetchBusFetchStopInfo(StopInfo.stopId, StopInfo.vehicleMode),
        fetchSchedule(StopInfo.stopId, earlyBird, StopInfo.vehicleMode),
      ]);
      setStopTimes(stopTimes);
      setFetchStopInfo(FetchStopInfo);

      setError(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(true);
    }
  }, [StopInfo.stopId, earlyBird]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (error) {
    return (
      <div className="w-[380px] p-2">
        <h1 className="w-min text-3xl font-semibold">Virhe</h1>
        <h1 className="w-max text-2xl font-semibold">{StopInfo.stopId}</h1>
        <div className="w-min">{renderIcon(StopInfo.vehicleMode)}</div>
        <p className="text-sm">
          Tietoja ei voitu hakea. Yritä myöhemmin uudelleen.
        </p>
        <button
          className="mt-2 rounded bg-red-500 px-4 py-2 text-white"
          onClick={() => handleDelete(StopInfo.stopId)}
        >
          Poista asema
        </button>
      </div>
    );
  }

  return (
    <div className="w-[380px]">
      {FetchStopInfo && (
        <div className="mb-4 flex flex-col items-start">
          <div className="flex gap-2">
            {renderIcon(FetchStopInfo.vehicleMode)}
            <h1 className="text-3xl font-semibold">{FetchStopInfo.name}</h1>
            <button
              onClick={() => handleDelete(StopInfo.stopId)}
              className="text-neutral-500"
            >
              <CircleX />
            </button>
          </div>
          <p className="text-sm">{FetchStopInfo.desc}</p>
          <p className="border px-1 text-sm text-gray-500">
            {FetchStopInfo.code}
          </p>
        </div>
      )}
      {renderStopTimes(stopTimes, earlyBird)}
    </div>
  );
};

export default BusStop;
