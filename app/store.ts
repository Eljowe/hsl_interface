import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

interface BusStopStore {
  stopIds: string[];
  addStop: (id: string) => void;
  deleteStop: (id: string) => void;
}

type MyPersist = (
  config: (set: any, get: any, api: any) => BusStopStore,
  options: PersistOptions<BusStopStore>
) => (set: any, get: any, api: any) => BusStopStore;

const useBusStopStore = create<BusStopStore>(
  (persist as MyPersist)(
    (set) => ({
      stopIds: ["HSL:2113206", "HSL:2113205"],
      addStop: (id: string) => set((state: BusStopStore) => ({ stopIds: [...state.stopIds, id] })),
      deleteStop: (id: string) =>
        set((state: BusStopStore) => ({ stopIds: state.stopIds.filter((stopId) => stopId !== id) })),
    }),
    {
      name: "bus-stop-store",
    }
  )
);

export default useBusStopStore;
