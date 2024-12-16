"use client";
import BusStop from "./components/BusStop";
import BusStopSearch from "./components/BusStopSearch";
import Clock from "./components/Clock";
import useBusStopStore from "@/app/stores/BusStopStore";

export default function Home() {
  const stopIds = useBusStopStore((state) => state.stopIds);

  return (
    <div className="flex min-h-screen justify-center p-2 font-[family-name:var(--font-geist-sans)]">
      <main className="flex w-full flex-col">
        <div className="flex flex-row justify-between">
          <BusStopSearch />
          <Clock />
        </div>
        <div className="mx-auto flex flex-wrap items-start justify-start gap-6">
          {stopIds.map((stopId) => (
            <BusStop key={stopId} stopId={stopId} />
          ))}
        </div>
      </main>
    </div>
  );
}
