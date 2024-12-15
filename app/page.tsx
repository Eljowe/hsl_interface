"use client";
import BusStop from "./components/BusStop";
import BusStopSearch from "./components/BusStopSearch";

export default function Home() {
  const stopIds = ["HSL:2113206", "HSL:2113205"]; // Add more stop IDs as needed

  return (
    <div className="flex justify-center min-h-screen p-2 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col">
        <BusStopSearch />
        <div className="flex flex-row items-start gap-6">
          {stopIds.map((stopId) => (
            <BusStop key={stopId} stopId={stopId} />
          ))}
        </div>
      </main>
    </div>
  );
}
