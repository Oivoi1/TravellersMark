const FilterForm = ({ filter, setFilter, markers, map }) => {
    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
  
      if (name === "location" && value.trim() !== "") {
        // Search for the first matching marker
        const matchingMarker = markers.find((marker) =>
          marker.location.toLowerCase().includes(value.toLowerCase())
        );
  
        if (matchingMarker) {
          // Center the map on the matching marker
          map.setView([matchingMarker.lat, matchingMarker.lng], 13);
        }
      }
    };
  
    return (
      <div style={filterContainerStyles}>
        <h3>Filter Travels</h3>
        <input
          type="date"
          name="startDate"
          value={filter.startDate || ""}
          placeholder="Start Date"
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="endDate"
          value={filter.endDate || ""}
          placeholder="End Date"
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="location"
          value={filter.location || ""}
          placeholder="Search by location (city/country)"
          onChange={handleFilterChange}
        />
      </div>
    );
  };
  

const filterContainerStyles = {
  position: "fixed",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1000,
  backgroundColor: "#fff",
  padding: "10px",
  boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
  borderRadius: "5px",
  display: "flex",
  gap: "10px",
  pointerEvents: "auto", // Ensure the form captures pointer events
};

export default FilterForm;
