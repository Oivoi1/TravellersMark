import React, { useState, useEffect } from "react";
import { useMapEvents, Marker, Popup } from "react-leaflet";
import ReactDOM from "react-dom";
import axios from "axios";

const LocationMarker = () => {
  const [markers, setMarkers] = useState([]); // All markers
  const [filteredMarkers, setFilteredMarkers] = useState([]); // Filtered markers
  const [showDialog, setShowDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [currentMarkerIndex, setCurrentMarkerIndex] = useState(null); // Marker being modified
  const [city, setCity] = useState(""); // Store city name
  const [loading, setLoading] = useState(false); // Loading state for geocoding
  const [filter, setFilter] = useState({ date: "", startDate: "", endDate: "", location: "" });


  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await fetch("http://localhost/markers_api/get_markers.php");
        const data = await response.json();

        console.log("Fetched markers:", data);

        setMarkers(data); // Set markers from backend
        setFilteredMarkers(data); // Initialize filtered markers
      } catch (error) {
        console.error("Error fetching markers:", error);
      }
    };

    fetchMarkers();
  }, []);


  useEffect(() => {
    if (city && !formData.location) {
      setFormData((prev) => ({
        ...prev,
        location: city,
      }));
    }
  }, [city]);


  // Reverse geocoding API function
  const fetchCityName = async (lat, lng) => {
    const apiKey = "4216783b7ef646158f856e82235fba23"; // Replace with your API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;
    try {
      setLoading(true);
      const response = await axios.get(url);
      const results = response.data.results;
      if (results.length > 0) {
        const components = results[0].components;
        const cityName = components.city || components.town || components.village || "Unknown location";
        setCity(cityName);
      } else {
        setCity("Unknown location");
      }
    } catch (error) {
      console.error("Error fetching city name:", error);
      setCity("Error retrieving location");
    } finally {
      setLoading(false);
    }
  };


  const [formData, setFormData] = useState({
    header: "",
    date: "",
    paragraph: "",
    image: null,
    location: "",
  });


  // Map click event
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      fetchCityName(lat, lng); // Fetch city name when clicking the map
      setClickedCoords(e.latlng);
      setShowDialog(true);
    },
  });


  const confirmAddMarker = async (e) => {
    e.preventDefault();

    const newMarker = {
      lat: clickedCoords.lat,
      lng: clickedCoords.lng,
      header: formData.header,
      date: formData.date,
      location: formData.location,
      paragraph: formData.paragraph,
      image: formData.image || null, // Handle optional image
    };

    // Save to backend
    try {
      const response = await fetch("http://localhost/markers_api/add_marker.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMarker),
      });

      const result = await response.json();
      if (result.status === "success") {
        setMarkers([...markers, newMarker]); // Update local state
        resetForm();
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error saving marker:", error);
    }
  };


  // Delete a marker
  const deleteMarker = (index) => {
    setMarkers(markers.filter((_, i) => i !== index));
  };


  // Open edit dialog with marker details
  const openEditDialog = (index) => {
    const marker = markers[index];
    setFormData({
      id: marker.id,
      lat: marker.lat,
      lng: marker.lng,
      header: marker.header,
      date: marker.date,
      paragraph: marker.paragraph,
      location: marker.location,
      image: marker.image,
    });
    setCurrentMarkerIndex(index);
    setEditDialog(true);
  };


  const confirmEditMarker = async (e) => {
    e.preventDefault();
  
    if (currentMarkerIndex === null) {
      console.error("No marker selected for editing.");
      return;
    }
  
    const updatedMarker = {
      id: formData.id,
      lat: formData.lat,
      lng: formData.lng,
      header: formData.header,
      date: formData.date,
      location: formData.location,
      paragraph: formData.paragraph,
      image: formData.image || null,
    };
  
    try {
      const response = await fetch("http://localhost/markers_api/update_marker.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMarker),
      });
  
      const result = await response.json();
      if (result.status === "success") {
        // Update local markers state
        setMarkers((prevMarkers) =>
          prevMarkers.map((marker) =>
            marker.id === updatedMarker.id ? updatedMarker : marker
          )
        );
        setEditDialog(false);
        resetForm();
      } else {
        console.error("Server error:", result.message);
      }
    } catch (error) {
      console.error("Error updating marker:", error);
    }
  };
  
  

  const resetForm = () => {
    setFormData({ header: "", date: "", paragraph: "", image: null, location: "" });
    setShowDialog(false);
    setEditDialog(false);
    setClickedCoords(null);
    setCity("");
  };

  // Update filtered markers when filters or markers change
  useEffect(() => {
    const filtered = markers.filter((marker) => {
      const matchesLocation = filter.location
        ? marker.location.toLowerCase().includes(filter.location.toLowerCase())
        : true;

      const matchesDateRange =
        filter.startDate && filter.endDate
          ? marker.date >= filter.startDate && marker.date <= filter.endDate
          : true;

      return matchesLocation && matchesDateRange;
    });

    setFilteredMarkers(filtered);
  }, [filter, markers]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: URL.createObjectURL(e.target.files[0]) });
  };

  return (
    <>
      {/* Filter Form */}
      <div style={filterStyles}>
        <h3>Filter Travels</h3>
        <input
          type="date"
          name="startDate"
          placeholder="Start Date"
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="endDate"
          placeholder="End Date"
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Search by location (city/country)"
          onChange={handleFilterChange}
        />
      </div>

      {/* Render filtered markers */}
      {filteredMarkers.map((marker, index) => (
        <Marker key={index} position={[marker.lat, marker.lng]}>
          <Popup>
            <div className="popup-container">
              <h3 className="popup-header">{marker.header}</h3>
              <p className="popup-date">Date: {marker.date}</p>
              <p className="popup-location">Location: {marker.location}</p>
              <p className="popup-paragraph">{marker.paragraph}</p>
              {marker.image && <img src={marker.image} alt="Marker" className="popup-image" />}
              <br />
              <button className="popup-button delete" onClick={() => deleteMarker(index)}>
                Delete
              </button>
              <button className="popup-button" onClick={() => openEditDialog(index)}>
                Modify
              </button>
            </div>
          </Popup>

        </Marker>
      ))}

      {/* Add Marker Dialog */}
      {showDialog &&
        ReactDOM.createPortal(
          <div style={dialogStyles}>
            <form onSubmit={confirmAddMarker} style={formStyles}>
              <h2>Add Travel Details</h2>
              <label>Header: <input type="text" name="header" onChange={handleInputChange} required /></label>
              <label>Date: <input type="date" name="date" onChange={handleInputChange} required /></label>
              <label>Location: <input type="text" name="location" value={formData.location || ""} onChange={handleInputChange} required /></label>
              <label>Paragraph: <textarea name="paragraph" onChange={handleInputChange} required /></label>
              <label>Picture: <input type="file" accept="image/*" onChange={handleImageChange} /></label>
              <button type="submit">Add</button>
              <button type="button" onClick={resetForm}>Cancel</button>
            </form>
          </div>,
          document.body
        )}

      {/* Edit Marker Dialog */}
      {editDialog &&
        ReactDOM.createPortal(
          <div style={dialogStyles}>
            <form
              onSubmit={confirmEditMarker}
              style={formStyles}
            >
              <h2>Modify Travel Details</h2>
              <label>Header: <input type="text" name="header" value={formData.header} onChange={handleInputChange} required /></label>
              <label>Date: <input type="date" name="date" value={formData.date} onChange={handleInputChange} required /></label>
              <label>Location: <input type="text" name="location" value={formData.location} onChange={handleInputChange} required /></label>
              <label>Paragraph: <textarea name="paragraph" value={formData.paragraph} onChange={handleInputChange} required /></label>
              <label>Picture: <input type="file" accept="image/*" onChange={handleImageChange} /></label>
              <button type="submit">Save</button>
              <button type="button" onClick={resetForm}>Cancel</button>
            </form>
          </div>,
          document.body
        )}
    </>
  );
};

// Styles
const dialogStyles = {
  position: "fixed",
  top: "20px",
  left: "20px",
  backgroundColor: "#fff",
  padding: "15px",
  zIndex: 1000,
  boxShadow: "0 0 10px rgba(0, 0, 0, 0.25)",
};

const filterStyles = {
  position: "fixed",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#f9f9f9",
  padding: "10px",
  zIndex: 1000,
  display: "flex",
  gap: "10px",
  boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
};

const formStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const popUpStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  padding: "20px",
  backgroundColor: "black"
};


export default LocationMarker;
