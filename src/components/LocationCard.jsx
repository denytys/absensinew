import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { decodeCookies } from "../helper/parsingCookies";

// ✅ Custom icon hijau untuk user
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ✅ Custom icon biru untuk kantor
const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ✅ Komponen untuk auto-fit lokasi user dan kantor
function FitBounds({ location, kantor }) {
  const map = useMap();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done && location?.lat && location?.lng) {
      const bounds = L.latLngBounds([
        [location?.lat, location?.lng],
        [kantor?.lat, kantor?.long],
      ]);
      map.fitBounds(bounds, { padding: [30, 30] });
      setDone(true);
    }
  }, [location, kantor, map, done]);

  return null;
}
const lokasiKantor = decodeCookies("lokasi_kantor");

export default function LocationCard({
  location,
  accuracy,
  onRefresh,
  lokasiTerdekat,
}) {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-xl p-4 max-w-md md:max-w-[600px] mx-auto md:mx-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Lokasi Anda</h2>
        <button
          onClick={onRefresh}
          className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
        >
          Refresh Lokasi
        </button>
      </div>

      {location.lat && location.lng ? (
        <>
          <p
            className={`text-center font-medium ${
              lokasiTerdekat?.cekRadius ? "text-green-600" : "text-red-600"
            }`}
          >
            {lokasiTerdekat?.cekRadius
              ? "✅ Anda berada di radius absen"
              : "❌ Anda di luar radius absen"}
          </p>

          <p className="text-center text-sm text-gray-600 mb-2">
            Akurasi GPS: ± {accuracy ? `${accuracy.toFixed(1)} meter` : "-"}
          </p>
          <div className="mt-2 rounded overflow-hidden border border-gray-200">
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={18}
              scrollWheelZoom={true}
              dragging={true}
              style={{ height: "220px", width: "100%" }}
              className="rounded"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />

              <Marker
                position={[location.lat, location.lng]}
                icon={greenIcon}
              />
              {lokasiKantor?.map((item, index) => (
                <span key={index}>
                  <Marker position={[item.lat, item.long]} icon={blueIcon} />

                  <Circle
                    center={[item.lat, item.long]}
                    radius={lokasiTerdekat.radius}
                    pathOptions={{
                      fillColor: "blue",
                      fillOpacity: 0.2,
                      color: "blue",
                      weight: 1,
                    }}
                  />
                </span>
              ))}
              {location && lokasiTerdekat ? (
                <FitBounds location={location} kantor={lokasiTerdekat} />
              ) : (
                ""
              )}
            </MapContainer>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500 mt-4">Memuat lokasi Anda...</p>
      )}
    </div>
  );
}
