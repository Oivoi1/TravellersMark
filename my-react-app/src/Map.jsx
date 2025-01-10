import './App.css'
import './index.css'
import "leaflet/dist/leaflet.css";
import LocationMarker from './LocationMarker';
import {MapContainer, Marker, TileLayer, Popup} from "react-leaflet";

function Map() {

  return (
    <>
      <MapContainer 
        center={[45.816666, 9.083333]} 
        zoom={18} 
        style={{ height: "100vh", width: "100%" }} // Ensure proper dimensions
      >
        <TileLayer
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <LocationMarker />
      </MapContainer>
    </>
  )
}

export default Map
