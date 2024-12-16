import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  TramFront,
  BusFront,
  SquareMIcon,
  TrainFront,
} from "lucide-react"; // Import icons
import useBusStopStore from "../stores/BusStopStore";
import KioskBoard from "kioskboard";

interface StopInfo {
  stopId: string;
  vehicleMode: string;
}

interface Feature {
  type: string;
  properties: {
    id: string;
    name: string;
    addendum: {
      GTFS: {
        code: string;
        modes: string[];
      };
    };
    label: string;
  };
  geometry: {
    type: string;
    coordinates: number[];
  };
}

interface ResponseData {
  features: Feature[];
}

const renderIcon = (mode: string) => {
  switch (mode) {
    case "TRAM":
      return (
        <div className="mr-2 rounded-md bg-green-700 p-2 text-white">
          <TramFront size={24} />
        </div>
      );
    case "BUS":
      return (
        <div className="mr-2 rounded-md bg-blue-600 p-2 text-white">
          <BusFront size={24} />
        </div>
      );
    case "SUBWAY":
      return (
        <div className="mr-2 rounded-md bg-orange-600 p-2 text-white">
          <SquareMIcon size={24} />
        </div>
      );
    case "RAIL":
      return (
        <div className="mr-2 rounded-md bg-purple-700 p-2 text-white">
          <TrainFront size={24} />
        </div>
      );
    default:
      return null;
  }
};

const BusStopSearch = () => {
  const [searchWord, setSearchWord] = useState<string>("");
  const [response, setResponse] = useState<ResponseData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const stopIds = useBusStopStore((state) => state.stopIds);
  const inputRef = useRef<HTMLInputElement>(null);

  const addStop = useBusStopStore((state) => state.addStop);

  const handleResultClick = (id: string, mode: string) => {
    const transformedId = id.replace(/^GTFS:(HSL:\d+).*$/, "$1");
    addStop(transformedId, mode);
    setResponse(null);
    setSearchWord("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    KioskBoard.run(".search", {
      keysArrayOfObjects: [
        {
          "0": "Q",
          "1": "W",
          "2": "E",
          "3": "R",
          "4": "T",
          "5": "Y",
          "6": "U",
          "7": "I",
          "8": "O",
          "9": "P",
        },
        {
          "0": "A",
          "1": "S",
          "2": "D",
          "3": "F",
          "4": "G",
          "5": "H",
          "6": "J",
          "7": "K",
          "8": "L",
        },
        {
          "0": "Z",
          "1": "X",
          "2": "C",
          "3": "V",
          "4": "B",
          "5": "N",
          "6": "M",
        },
      ],
      keysJsonUrl: "",
      language: "fi",
      capsLockActive: false,
      theme: "light",
      autoScroll: true,
      cssAnimations: true,
      cssAnimationsDuration: 360,
      cssAnimationsStyle: "slide",
      keysAllowSpacebar: true,
      keysSpacebarText: "Space",
      keysFontFamily: "sans-serif",
      keysFontSize: "10px",
      keysFontWeight: "normal",
      keysIconSize: "10px",
      keysEnterCallback: () => {
        if (inputRef.current) {
          const inputValue = inputRef.current.value;
          console.log(inputValue);
          setSearchWord(inputValue);
          inputRef.current.value = ""; // Clear the input element
        }
      },
      keysEnterText: "Enter",
      keysEnterCanClose: true,
      allowRealKeyboard: true,
      allowMobileKeyboard: true,
    });
  }, []);

  useEffect(() => {
    console.log(searchWord);
  }, [searchWord]);

  const handleSearch = useCallback(async () => {
    console.log("Searching for:", searchWord);
    if (searchWord.trim() === "") {
      setResponse(null);
      return;
    }
    try {
      const res = await fetch("/api/pysakkihaku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchWord }),
      });

      const data: ResponseData = await res.json();
      const filteredIDs = data.features.filter((feature: Feature) => {
        const transformedId = feature.properties.id.replace(
          /^GTFS:(HSL:\d+).*$/,
          "$1",
        );
        return !stopIds.some((stop: StopInfo) => stop.stopId === transformedId);
      });
      setResponse({ ...data, features: filteredIDs });
    } catch (error) {
      console.error("Error:", error);
    }
  }, [searchWord, stopIds]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setResponse(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchWord, handleSearch]);

  return (
    <div className="relative w-full">
      <div
        className="mb-4 flex flex-row items-center rounded border border-gray-300 p-2"
        style={{ maxWidth: "300px" }}
      >
        <Search size={24} />
        <input
          type="text"
          value={searchWord}
          placeholder="Pysäkki tai asema"
          onChange={(e) => setSearchWord(e.target.value)}
          className="search ml-2 flex-grow border-none p-2 outline-none"
          style={{ minWidth: "0" }}
          ref={inputRef}
        />
      </div>

      {response && response.features && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-gray-300 bg-white p-4"
          style={{
            width: "95%",
            maxWidth: "800px",
            margin: "0 auto",
            top: "100%",
          }}
        >
          <div className="mx-auto max-w-2xl">
            {response.features.map((feature: Feature) => (
              <div
                key={feature.properties.id}
                className="flex cursor-pointer items-center p-2 hover:bg-gray-100"
                onClick={() =>
                  handleResultClick(
                    feature.properties.id,
                    feature.properties.addendum.GTFS.modes[0],
                  )
                }
              >
                {renderIcon(feature.properties.addendum.GTFS.modes[0])}
                <div>
                  <h3 className="font-bold">{feature.properties.name}</h3>
                  <div className="flex gap-2">
                    <p>{feature.properties.label}</p>
                    <p className="border px-1">
                      {feature.properties.addendum.GTFS.code}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusStopSearch;
