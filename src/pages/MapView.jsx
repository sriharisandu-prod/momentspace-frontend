// src/pages/MapView.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import memoryService from "../services/memoryService";
import LocationCard from "../components/LocationCard";
import "leaflet/dist/leaflet.css";

const MapView = () => {
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    // Fetch all memories with location data
    memoryService.getAllMemories()
      .then((res) => setMemories(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="flex">
      {/* Map Section */}
      <div className="w-2/3 h-[80vh]">
        <MapContainer center={[15.2993, 74.1240]} zoom={6} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {memories.map((m) => (
            <Marker
              key={m.id}
              position={[m.latitude, m.longitude]}
            >
              <Popup>
                <strong>{m.title}</strong>
                <br />
                {m.location}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Sidebar Section */}
      <div className="w-1/3 p-4 overflow-y-auto h-[80vh] bg-gray-100">
        <h2 className="text-xl font-bold mb-4">Popular Memories</h2>
        {memories.map((m) => (
          <LocationCard key={m.id} memory={m} />
        ))}
      </div>
    </div>
  );
};

export default MapView;
