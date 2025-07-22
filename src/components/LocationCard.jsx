import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  Tooltip,
  Popup,
} from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { decodeCookies } from "../helper/parsingCookies";
import { EnvironmentOutlined, ReloadOutlined } from "@ant-design/icons";

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
    <div className="bg-white/50 text-gray-700 backdrop-blur-md rounded-xl pt-2 mb-12 max-w-md md:max-w-[600px] mx-auto md:mx-0">
      <div className="flex flex-row-reverse mb-0 mr-2">
        {/* <div className="flex flex-row gap-1 md:gap-2">
          <EnvironmentOutlined className="text-xl" />
          <p className="text-sm md:text-base font-semibold">Lokasi Anda</p>
        </div> */}
        {accuracy > 50 ? (
          <ReloadOutlined
            onClick={onRefresh}
            className="px-3 py-1 text-sm text-blue-600 bg-white/70 hover:bg-blue-300 rounded-lg"
          />
        ) : (
          ""
        )}
      </div>

      {location.lat && location.lng ? (
        <>
          <p
            className={`text-center font-medium text-sm ${
              lokasiTerdekat?.cekRadius ? "text-green-600" : "text-red-600"
            }`}
          >
            {lokasiTerdekat?.cekRadius
              ? "✅ Anda berada di radius absen"
              : "❌ Anda di luar radius absen"}
          </p>

          <p className="text-center text-xs text-gray-600 mb-2">
            Akurasi GPS: ± {accuracy ? `${accuracy.toFixed(1)} meter` : "-"}
          </p>
          <div className="mt-2 mb-15 rounded overflow-hidden border border-gray-200">
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={18}
              scrollWheelZoom={true}
              dragging={true}
              style={{ height: "242px", width: "100%" }}
              className="rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              <Marker position={[location.lat, location.lng]} icon={greenIcon}>
                <Popup>Posisi anda</Popup>
              </Marker>
              {lokasiKantor
                ? lokasiKantor?.map((item, index) => (
                    <span key={index}>
                      <Marker position={[item.lat, item.long]} icon={blueIcon}>
                        <Tooltip direction="auto" opacity={1} permanent>
                          {item.nama_lokasi}
                        </Tooltip>
                      </Marker>

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
                  ))
                : ""}
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
