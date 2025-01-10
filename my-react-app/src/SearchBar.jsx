import React, { useState } from "react";
import { useMap } from "react-leaflet";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState(""); // User input
  const [searchResults, setSearchResults] = useState([]); // Results from API
  const map = useMap(); // Access the map instance

  const handleSearch = async () => {
    if (!searchQuery) return;

    const apiKey = import.meta.env.VITE_OPENCAGE_KEY; // Replace with your OpenCage API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      searchQuery
    )}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results); // Update search results
        console.log("Search results:", data.results);
      } else {
        console.error("No results found");
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleResultClick = (geometry) => {
    const { lat, lng } = geometry;
    map.setView([lat, lng], 13); // Center the map on the selected location
    setSearchResults([]); // Clear results after selection
  };

  return (
    <div style={searchStyles}>
      <input
        type="text"
        placeholder="Search for a location..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={inputStyles}
      />
      <button onClick={handleSearch} style={buttonStyles}>
        Search
      </button>
      {searchResults.length > 0 && (
        <div style={resultsStyles}>
          {searchResults.map((result, index) => (
            <div
              key={index}
              style={resultItemStyles}
              onClick={() => handleResultClick(result.geometry)}
            >
              {result.formatted}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Styles
const searchStyles = {
  position: "fixed",
  top: "70px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  backgroundColor: "#fff",
  padding: "10px",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
  borderRadius: "5px",
};

const inputStyles = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  width: "100%",
};

const buttonStyles = {
  padding: "8px 16px",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#007bff",
  color: "#fff",
  cursor: "pointer",
};

const resultsStyles = {
  marginTop: "10px",
  maxHeight: "200px",
  overflowY: "auto",
  borderRadius: "4px",
  border: "1px solid #ccc",
  backgroundColor: "#fff",
};

const resultItemStyles = {
  padding: "8px",
  borderBottom: "1px solid #eee",
  cursor: "pointer",
};

resultItemStyles["&:hover"] = {
  backgroundColor: "#f0f0f0",
};

export default SearchBar;
