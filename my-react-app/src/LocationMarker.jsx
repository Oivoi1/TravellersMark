import React, { useState, useEffect } from "react";
import { useMapEvents, Marker, Popup } from "react-leaflet";
import ReactDOM from "react-dom";

const LocationMarker = () => {
  const [markers, setMarkers] = useState([]); // All markers
  const [filteredMarkers, setFilteredMarkers] = useState([]); // Filtered markers
  const [showDialog, setShowDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [currentMarkerIndex, setCurrentMarkerIndex] = useState(null); // Marker being modified

  const [filter, setFilter] = useState({ date: "", startDate: "", endDate: "", location: "" });

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
      setClickedCoords(e.latlng);
      setShowDialog(true);
    },
  });

  // Confirm adding a marker
  const confirmAddMarker = (e) => {
    e.preventDefault();
    const newMarker = {
      lat: clickedCoords.lat,
      lng: clickedCoords.lng,
      ...formData,
    };
    setMarkers([...markers, newMarker]);
    resetForm();
  };

  // Delete a marker
  const deleteMarker = (index) => {
    setMarkers(markers.filter((_, i) => i !== index));
  };

  // Open edit dialog with marker details
  const openEditDialog = (index) => {
    const marker = markers[index];
    setFormData({
      header: marker.header,
      date: marker.date,
      paragraph: marker.paragraph,
      location: marker.location,
      image: marker.image,
    });
    setCurrentMarkerIndex(index);
    setEditDialog(true);
  };

  // Confirm editing a marker
  const confirmEditMarker = (e) => {
    e.preventDefault();
    const updatedMarkers = markers.map((marker, i) =>
      i === currentMarkerIndex ? { ...marker, ...formData } : marker
    );
    setMarkers(updatedMarkers);
    resetForm();
    setEditDialog(false);
  };

  const resetForm = () => {
    setFormData({ header: "", date: "", paragraph: "", image: null, location: "" });
    setShowDialog(false);
    setEditDialog(false);
    setClickedCoords(null);
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
            <h3>{marker.header}</h3>
            <p>Date: {marker.date}</p>
            <p>Location: {marker.location}</p>
            <p>{marker.paragraph}</p>
            {marker.image && <img src={marker.image} alt="Marker" style={{ width: "100%" }} />}
            <br />
            <button onClick={() => openEditDialog(index)}>Modify</button>
            <button onClick={() => deleteMarker(index)}>Delete</button>
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
              <label>Location: <input type="text" name="location" onChange={handleInputChange} required /></label>
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
            <form onSubmit={confirmEditMarker} style={formStyles}>
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


export default LocationMarker;
