import React, { useState, useEffect } from "react";
import { useMapEvents, Marker, Popup } from "react-leaflet";
import ReactDOM from "react-dom";
import FilterForm from "./FilterForm"; // Import FilterForm
import SearchBar from "./SearchBar";
import axios from "axios";
import { useMap } from "react-leaflet";

const LocationMarker = () => {
  const [markers, setMarkers] = useState([]); // All markers
  const [filteredMarkers, setFilteredMarkers] = useState([]); // Filtered markers
  const [filter, setFilter] = useState({ date: "", startDate: "", endDate: "", location: "" });
  const [showDialog, setShowDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [currentMarkerIndex, setCurrentMarkerIndex] = useState(null); // Marker being modified
  const [city, setCity] = useState(""); // Store city name
  const [loading, setLoading] = useState(false); // Loading state for geocoding
  const [isAddMode, setIsAddMode] = useState(false);
  const map = useMap(); // Access the map instance

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


  useEffect(() => {
    if (city && !formData.location) {
      setFormData((prev) => ({
        ...prev,
        location: city,
      }));
    }
  }, [city]);


  useEffect(() => {
    console.log("Updated markers state:", markers);
  }, [markers]);


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


  const fetchMarkers = async () => {
    try {
      const response = await fetch("http://localhost/markers_api/get_markers.php");
      const data = await response.json();
      setMarkers(data); // Update markers state
      setFilteredMarkers(data); // Sync filtered markers
    } catch (error) {
      console.error("Error fetching markers:", error);
    }
  };


  const fetchMarkerDetails = async (id) => {
    if (!id) {
      console.error("Invalid marker ID");
      return;
    }

    try {
      const response = await fetch(`http://localhost/markers_api/get_marker.php?id=${id}`);
      const marker = await response.json();

      if (marker.error) {
        console.error("Error fetching marker:", marker.error);
      } else {
        console.log("Fetched marker details:", marker);
        setFormData({
          id: marker.id,
          header: marker.header,
          date: marker.date,
          paragraph: marker.paragraph,
          location: marker.location,
          lat: marker.lat,
          lng: marker.lng,
          image: marker.image,
        });
      }
    } catch (error) {
      console.error("Error fetching marker details:", error);
    }
  };



  // Reverse geocoding API function
  const fetchCityName = async (lat, lng) => {
    const apiKey = import.meta.env.VITE_OPENCAGE_KEY;

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
      // Ignore clicks if interacting with other UI elements
      const clickedElement = e.originalEvent.target;
      if (clickedElement.closest && clickedElement.closest(".filter-container")) {
        return; // Ignore clicks on the filter form
      }
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
      image: formData.image || null,
    };

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
        // Re-fetch markers after adding a new one
        fetchMarkers();
        resetForm();
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error saving marker:", error);
    }
  };


  const deleteMarker = async (id) => {
    try {
      const response = await fetch("http://localhost/markers_api/delete_marker.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();

      if (result.status === "success") {
        console.log(result.message);

        // Remove the marker from local state
        setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== id));
      } else {
        console.error("Server error:", result.message);
      }
    } catch (error) {
      console.error("Error deleting marker:", error);
    }
  };


  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this marker?")) {
      deleteMarker(id);
    }
  };


  const openEditDialog = (index) => {
    const marker = markers[index];

    if (!marker || !marker.id) {
      console.error("Marker ID is missing or undefined.");
      return;
    }

    console.log("Editing marker with ID:", marker.id);
    fetchMarkerDetails(marker.id);

    setCurrentMarkerIndex(index);
    setEditDialog(true);
  };



  // Confirm editing a marker
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
        // Re-fetch markers to ensure state consistency
        fetchMarkers();
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


  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost/markers_api/upload_image.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.status === "success") {
        console.log("Uploaded image path:", result.filePath);
        setFormData((prev) => ({ ...prev, image: result.filePath })); // Save file path
      } else {
        console.error("Error uploading image:", result.message);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };


  return (
    <>



      <button
        onClick={() => setIsAddMode((prev) => !prev)}
        style={toggleButtonStyles}
      >
        {isAddMode ? "View Markers" : "Add Marker"}
      </button>

      {isAddMode ? (
        <>
                <>
          {/* View Mode */}
                {/* Render filtered markers */}
      {markers.map((marker, index) => (
        <Marker key={index} position={[marker.lat, marker.lng]}>
          <Popup>
            <div className="popup-container">
              <h3 className="popup-header">{marker.header}</h3>
              <p className="popup-date">Date: {marker.date}</p>
              <p className="popup-location">Location: {marker.location}</p>
              <p className="popup-paragraph">{marker.paragraph}</p>
              {marker.image && (
                <img
                  src={`http://localhost/markers_api/${marker.image}`} // Use the uploaded image path
                  alt="Marker"
                  className="popup-image"
                  style={{ width: "100%", height: "auto" }}
                />
              )}
              <br />
              <button className="popup-button delete" onClick={() => handleDelete(marker.id)}>
                Delete
              </button>
              {isAddMode ? "" : <button className="popup-button" onClick={() => openEditDialog(index)}>
                Modify
              </button>}

            </div>
          </Popup>

        </Marker>

      ))}
        </>
          {/* Add Mode */}
          <SearchBar />
          <div>
            <p>Click the map to add a new marker.</p>
          </div>
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
        

        </>
      ) : (
        <>
          {/* View Mode */}
      <FilterForm filter={filter} setFilter={setFilter} markers={markers} map={map} />
      {/* Render filtered markers */}
      {filteredMarkers.map((marker, index) => (
        <Marker key={index} position={[marker.lat, marker.lng]}>
          <Popup>
            <div className="popup-container">
              <h3 className="popup-header">{marker.header}</h3>
              <p className="popup-date">Date: {marker.date}</p>
              <p className="popup-location">Location: {marker.location}</p>
              <p className="popup-paragraph">{marker.paragraph}</p>
              {marker.image && (
                <img
                  src={`http://localhost/markers_api/${marker.image}`} // Use the uploaded image path
                  alt="Marker"
                  className="popup-image"
                  style={{ width: "100%", height: "auto" }}
                />
              )}
              <br />
              <button className="popup-button delete" onClick={() => handleDelete(marker.id)}>
                Delete
              </button>
              <button className="popup-button" onClick={() => openEditDialog(index)}>
                Modify
              </button>
            </div>
          </Popup>

        </Marker>
      ))}
      {/* Edit Marker Dialog */}
      {editDialog &&
        ReactDOM.createPortal(
          <div style={dialogStyles}>
            <form
              onSubmit={confirmEditMarker}
              style={formStyles}
            >
              <h2>Modify Travel Details</h2>
              <label>Header: <input type="text" name="header" value={formData.header || ""} onChange={handleInputChange} required /></label>
              <label>Date: <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} required /></label>
              <label>Location: <input type="text" name="location" value={formData.location || ""} onChange={handleInputChange} required /></label>
              <label>Paragraph: <textarea name="paragraph" value={formData.paragraph || ""} onChange={handleInputChange} required /></label>
              <label>Picture: <input type="file" accept="image/*" onChange={handleImageChange} /></label>
              <button type="submit">Save</button>
              <button type="button" onClick={resetForm}>Cancel</button>
            </form>
          </div>,
          document.body
        )}
        </>
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

const toggleButtonStyles = {
  position: "fixed",
  top: "20px",
  right: "20px",
  padding: "10px 20px",
  backgroundColor: "#007bff", // Bootstrap blue
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
  zIndex: 1000,
  transition: "background-color 0.3s ease",
};

toggleButtonStyles[":hover"] = {
  backgroundColor: "#0056b3", // Darker blue on hover
};

toggleButtonStyles[":active"] = {
  transform: "scale(0.98)", // Slight shrink effect on click
};



export default LocationMarker;
