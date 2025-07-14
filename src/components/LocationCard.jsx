import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

export default function LocationCard({ location, onRefresh }) {
  const kantor = { lat: -6.2, lng: 106.816 }; // lokasi kantor
  const [jarak, setJarak] = useState(null);

  // hitung jarak antara kantor dan user
  useEffect(() => {
    if (location.lat && location.lng) {
      const from = L.latLng(location.lat, location.lng);
      const to = L.latLng(kantor.lat, kantor.lng);
      const distance = from.distanceTo(to); // in meter
      setJarak(distance);
    }
  }, [location]);

  return (
    <div className="bg-white/45 rounded-xl p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* <h5 className="card-title mb-0">Lokasi Anda</h5> */}
        <button onClick={onRefresh} className="btn btn-outline-primary btn-m">
          refresh lokasi
        </button>
      </div>

      {location.lat && location.lng ? (
        <>
          <p
            className={`text-center fw-semibold mt-2 ${
              jarak <= 1000 ? "text-success" : "text-danger"
            }`}
          >
            {jarak <= 200
              ? "✅ Anda berada di radius absen."
              : "❌ Anda di luar radius absen."}
          </p>
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={17}
            scrollWheelZoom={false}
            style={{ height: "165px", width: "100%" }}
            className="rounded"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            <Marker position={[location.lat, location.lng]} />
            <Circle
              center={[kantor.lat, kantor.lng]}
              radius={200}
              pathOptions={{
                fillColor: "blue",
                fillOpacity: 0.2,
                color: "blue",
              }}
            />
          </MapContainer>
        </>
      ) : (
        <p className="text-muted">Memuat lokasi Anda...</p>
      )}
    </div>
  );
}
