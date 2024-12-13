"use client";
import BusStop from "./components/BusStop";

export default function Home() {
  const stopIds = ["HSL:1121124", "HSL:1113131"]; // Add more stop IDs as needed

  return (
    <div className="flex justify-center min-h-screen p-2 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-row items-start gap-6">
        {stopIds.map((stopId) => (
          <BusStop key={stopId} stopId={stopId} />
        ))}
      </main>
    </div>
  );
}
