import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

interface TimeStore {
  earlyBird: boolean;
  toggleEarlyBird: () => void;
}

type MyPersist = (config: StateCreator<TimeStore>, options: PersistOptions<TimeStore>) => StateCreator<TimeStore>;

const useTimeStore = create<TimeStore>(
  (persist as MyPersist)(
    (set) => ({
      earlyBird: false,
      toggleEarlyBird: () => set((state: TimeStore) => ({ earlyBird: !state.earlyBird })),
    }),
    {
      name: "time-store",
    }
  )
);

export default useTimeStore;
