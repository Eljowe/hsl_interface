import React, { useState, useEffect, useRef } from "react";
import { Search, TramFront, BusFront, SquareMIcon } from "lucide-react"; // Import icons

const BusStopSearch: React.FC = () => {
  const [searchWord, setSearchWord] = useState("");
  const [response, setResponse] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
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
      const data = await res.json();
      console.log(data);
      setResponse(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
  }, [searchWord]);

  const renderIcon = (mode: string) => {
    switch (mode) {
      case "TRAM":
        return (
          <div className="mr-2 bg-green-600 text-white rounded-md p-2">
            <TramFront size={24} />
          </div>
        );
      case "BUS":
        return (
          <div className="mr-2 bg-blue-600 text-white rounded-md p-2">
            <BusFront size={24} />
          </div>
        );
      case "SUBWAY":
        return (
          <div className="mr-2 bg-orange-600 text-white rounded-md p-2">
            <SquareMIcon size={24} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-row items-center p-2 border border-gray-300 rounded w-full mb-4">
        <Search size={24} />
        <input
          type="text"
          value={searchWord}
          placeholder="Pysäkki tai asema"
          onChange={(e) => setSearchWord(e.target.value)}
          className="flex-grow ml-2 p-2 border-none outline-none"
        />
      </div>

      {response && response.features && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 bg-white border border-gray-300 rounded-lg p-4 max-h-80 overflow-y-auto z-50 mt-2"
          style={{ width: "90%", maxWidth: "600px", margin: "0 auto", top: "100%" }}
        >
          <div className="max-w-2xl mx-auto">
            {response.features.map((feature: any) => (
              <div key={feature.properties.id} className="p-2 hover:bg-gray-100 flex items-center">
                {renderIcon(feature.properties.addendum.GTFS.modes[0])}
                <div>
                  <h3 className="font-bold">{feature.properties.name}</h3>
                  <div className="flex gap-2">
                    <p>{feature.properties.label}</p>
                    <p className="px-1 border">{feature.properties.addendum.GTFS.code}</p>
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
