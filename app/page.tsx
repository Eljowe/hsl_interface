"use client";
import BusStop from "./components/BusStop";

export default function Home() {
  const stopIds = ["HSL:1121130", "HSL:1121124"]; // Add more stop IDs as needed

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-20 pb-20 gap-16 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-row gap-8 row-start-2 items-center sm:items-start">
        {stopIds.map((stopId) => (
          <BusStop key={stopId} stopId={stopId} />
        ))}
      </main>
    </div>
  );
}
