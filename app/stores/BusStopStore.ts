import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

interface stopInfo {
  stopId: string;
  vehicleMode: string;
}
interface BusStopStore {
  stopIds: stopInfo[];
  addStop: (id: string, mode: string) => void;
  deleteStop: (id: string) => void;
}

type MyPersist = (
  config: StateCreator<BusStopStore>,
  options: PersistOptions<BusStopStore>,
) => StateCreator<BusStopStore>;

const useBusStopStore = create<BusStopStore>(
  (persist as MyPersist)(
    (set) => ({
      stopIds: [{ stopId: "HSL:2113206", vehicleMode: "BUS" }],
      addStop: (id: string, mode: string) =>
        set((state: BusStopStore) => ({
          stopIds: [...state.stopIds, { stopId: id, vehicleMode: mode }],
        })),
      deleteStop: (id: string) =>
        set((state: BusStopStore) => ({
          stopIds: state.stopIds.filter((stopId) => stopId.stopId !== id),
        })),
    }),
    {
      name: "bus-stop-store",
    },
  ),
);

export default useBusStopStore;
