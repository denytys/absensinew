// Home.jsx
import { useEffect, useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";

import Header from "./components/Header";
import ProfileCard from "./components/ProfileCard";
import LocationCard from "./components/LocationCard";
import PresensiSection from "./components/PresensiSection";
import AbsenModal from "./components/AbsenModal";
import Footer from "./components/Footer";
import { SquarePen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [modalAbsen, setModalAbsen] = useState(false);
  const [jenisAbsen, setJenisAbsen] = useState("");
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    error: null,
  });
  let [previousTimestamp, setPreviousTimestamp] = useState(0);
  let [previousLocation, setPreviousLocation] = useState({
    latitude: "",
    longitude: "",
  });
  let [cekGps, setCekGps] = useState({
    gpsSpeed: 0,
    accelerationMagnitude: 0,
  });
  function startAccelerometer() {
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", (event) => {
        console.log(event);
        // accelerationData = event.accelerationIncludingGravity;
      });
    } else {
      // Swal.fire({
      //   icon: 'warning',
      //   text: 'Accelerometer tidak didukung di perangkat ini'
      // })
      // console.error("Accelerometer tidak didukung di perangkat ini.");
    }
  }
  const [presensiList, setPresensiList] = useState(
    () => JSON.parse(localStorage.getItem("presensiList")) || []
  );
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Radius bumi dalam meter
    const toRad = (angle) => (angle * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Jarak dalam meter
  };
  const detectGPSSpoofing = (position) => {
    const { latitude, longitude } = position.coords;
    const timestamp = position.timestamp;

    if (previousLocation && previousTimestamp) {
      const distance = calculateDistance(
        previousLocation.latitude,
        previousLocation.longitude,
        latitude,
        longitude
      );

      const timeElapsed = (timestamp - previousTimestamp) / 1000; // dalam detik
      const gpsSpeed = timeElapsed > 0 ? distance / timeElapsed : 0; // m/s

      // Cek apakah perubahan lokasi sesuai dengan sensor gerakan
      const accelerationMagnitude = Math.sqrt(
        accelerationData.x ** 2 +
          accelerationData.y ** 2 +
          accelerationData.z ** 2
      );
      if (gpsSpeed * 3.6 > 300 && accelerationMagnitude < 0.5) {
        alert("Kemungkinan GPS/lokasi palsu terdeteksi");
      }
      setCekGps((value) => ({
        ...value,
        gpsSpeed: gpsSpeed,
        accelerationMagnitude: accelerationMagnitude,
      }));

      // console.log(`Kecepatan GPS: ${(gpsSpeed * 3.6).toFixed(2)} km/jam`);
      // console.log(`Percepatan Sensor: ${accelerationMagnitude.toFixed(2)} m/s²`);
      // console.log(`Rotasi Gyroscope: Alpha ${gyroData.alpha}, Beta ${gyroData.beta}, Gamma ${gyroData.gamma}`);

      // Deteksi anomali jika kecepatan GPS terlalu tinggi tetapi percepatan sensor rendah
    }
    // Perbarui lokasi sebelumnya
    setPreviousLocation((value) => ({
      ...value,
      latitude: latitude,
      longitude: longitude,
    }));
    setPreviousTimestamp(timestamp);
  };

  const user = JSON.parse(localStorage.getItem("user")) || {
    nama: "Nama Default",
    nip: "0000000000",
    kantor: "Kantor Pusat",
    foto: "https://via.placeholder.com/80",
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        console.log("posisi", pos);
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          akurasi: pos.coords.accuracy,
          dataLoc: pos,
          error: null,
        });
        if (pos?.coords?.accuracy == 1) {
          alert("Kemungkinan GPS/lokasi palsu terdeteksi");
        }
        // detectGPSSpoofing(pos)
      },
      (err) => {
        setLocation((loc) => ({ ...loc, error: err.message }));
        if (err.message == "Timeout expired") {
          alert("Gagal mengambil lokasi, mohon refresh halaman");
        } else {
          alert(
            "Izin lokasi tidak diberikan, mohon allow izin lokasi sebelum menggunakan ePresensi"
          );
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    // startAccelerometer()
    getLocation();
    localStorage.setItem("presensiList", JSON.stringify(presensiList));
  }, [presensiList]);

  // Filter presensi hanya milik user login
  const presensiUser = presensiList.filter((p) => p.nama === user.nama);

  const today = new Date().toISOString().slice(0, 10);
  const presensiHariIni = presensiUser.filter((p) =>
    p.waktu_presensi.startsWith(today)
  );
  const sudahMasuk = presensiHariIni.some((p) => p.jenis === "masuk");
  const sudahPulang = presensiHariIni.some((p) => p.jenis === "pulang");

  const handlePresensi = (jenis) => {
    setModalAbsen(true);
    setJenisAbsen(jenis);
    // if (!location.lat || !location.lng) return alert("Lokasi belum tersedia");

    // const newPresensi = {
    //   id: Date.now(),
    //   nama: user.nama,
    //   jenis,
    //   lat: location.lat,
    //   lng: location.lng,
    //   waktu_presensi: new Date().toISOString(),
    // };

    // setPresensiList((prev) => [newPresensi, ...prev]);
  };
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Silakan login terlebih dahulu.");
      navigate("/");
    }
  }, []);
  return (
    <div className="container py-2">
      <Header time={time} />
      {/* Baris 1: ProfileCard */}
      <div className="grid gap-4 mb-4">
        <ProfileCard />
      </div>

      {/* Baris 2: PresensiSection dan LocationCard sejajar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PresensiSection
          presensiList={presensiUser}
          sudahMasuk={sudahMasuk}
          sudahPulang={sudahPulang}
          handlePresensi={handlePresensi}
        />
        <LocationCard location={location} onRefresh={getLocation} />
      </div>
      <AbsenModal
        modalAbsen={modalAbsen}
        setModalAbsen={setModalAbsen}
        jenisAbsen={jenisAbsen}
      />
      <Footer />
      {/* Floating Button Footer */}
      {/* <footer className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-white border-t border-gray-200">
        <a
          href="/izin"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition mt-2"
        >
          <SquarePen />
        </a>
      </footer> */}
    </div>
  );
}
