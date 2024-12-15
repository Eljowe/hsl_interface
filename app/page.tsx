"use client";
import BusStop from "./components/BusStop";
import BusStopSearch from "./components/BusStopSearch";
import Clock from "./components/Clock";
import useBusStopStore from "@/app/store";

export default function Home() {
  const stopIds = useBusStopStore((state) => state.stopIds);

  return (
    <div className="flex justify-center min-h-screen p-2 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col w-full">
        <div className="flex flex-row justify-between">
          <BusStopSearch />
          <Clock />
        </div>
        <div className="flex items-start justify-start gap-6 flex-wrap">
          {stopIds.map((stopId) => (
            <BusStop key={stopId} stopId={stopId} />
          ))}
        </div>
      </main>
    </div>
  );
}
