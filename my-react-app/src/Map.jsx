import './App.css'
import './index.css'
import "leaflet/dist/leaflet.css";
import LocationMarker from './LocationMarker';
import {MapContainer, Marker, TileLayer, Popup} from "react-leaflet";
import L, {Icon} from "leaflet";

function Map() {


    const markers = [
        {
          geocode: [45.812623, 9.083214],
          popUp: "Hello, I was here 3/2024"
        },
        {
          geocode: [45.811111, 9.081111],
          popUp: "Hello, I was here 6/2024"
        },
        {
          geocode: [45.812100, 9.082333],
          popUp: "Hello, I was here 9/2024"
        },
      ]

  return (
    <>
      <MapContainer center={[45.816666, 9.083333]} zoom={13} 
        style={{ height: "100vh", width: "100%" }} // Ensure proper dimensions
      >
        <TileLayer
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <LocationMarker />
        {markers.map(marker =>(
          <Marker position={marker.geocode}>
            <Popup>
              <div>
                <h2>
                  {marker.popUp}
                  {/* <h3>{marker.header}</h3>
                  <p>{marker.date}</p>
                  <p>{marker.paragraph}</p> */}
                </h2>
              </div>
            </Popup>
          </Marker>
        ))
        }
      </MapContainer>
    </>
  )
}

export default Map
