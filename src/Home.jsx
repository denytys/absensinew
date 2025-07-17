import { useEffect, useState } from "react";

import Header from "./components/Header";
import ProfileCard from "./components/ProfileCard";
import LocationCard from "./components/LocationCard";
import PresensiSection from "./components/PresensiSection";
import AbsenModal from "./components/AbsenModal";
import Footer from "./components/Footer";
import { decodeCookies } from "./helper/parsingCookies";
import { hitungJarak } from "./helper/hitungJarak";
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
export default function Home() {
  const [time, setTime] = useState(new Date());
  const [lokasiTerdekat, setLokasiTerdekat] = useState(false);
  const [modalAbsen, setModalAbsen] = useState(false);
  const [jenisAbsen, setJenisAbsen] = useState("");
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    error: null,
  });
  const [accuracy, setAccuracy] = useState(null);
  let [previousTimestamp, setPreviousTimestamp] = useState(0);
  let [previousLocation, setPreviousLocation] = useState({
    latitude: "",
    longitude: "",
  });
  let [cekGps, setCekGps] = useState({
    gpsSpeed: 0,
    accelerationMagnitude: 0,
  });
  const detectGPSSpoofing = (position, accelerationData) => {
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
        accelerationData?.x ** 2 +
        accelerationData?.y ** 2 +
        accelerationData?.z ** 2
      );
      if (gpsSpeed * 3.6 > 300 && accelerationMagnitude < 0.5) {
        setCekGps((value) => ({
          ...value,
          gpsPalsu: "Kemungkinan GPS/lokasi palsu terdeteksi",
        }));
      }
      setCekGps((value) => ({
        ...value,
        gpsSpeed: gpsSpeed,
        accelerationMagnitude: accelerationMagnitude,
      }));

    }
    // Perbarui lokasi sebelumnya
    setPreviousLocation((value) => ({
      ...value,
      latitude: latitude,
      longitude: longitude,
    }));
    setPreviousTimestamp(timestamp);
  };
  function startAccelerometer(position) {
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", (event) => {
        console.log(event);
        setCekGps((value) => ({
          ...value,
          accelerationData: event.accelerationIncludingGravity,
        }));
        detectGPSSpoofing(position, event.accelerationIncludingGravity)
      });
    } else {
      setCekGps((value) => ({
        ...value,
        accelerationData: false
      }));
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

  const funcLokasiTerdekat = (locLat, locLong) => {
    const lokasi_kantor = decodeCookies("lokasi_kantor")
    const setting = decodeCookies("setting_presensi")
    let dekatKantor = []
    lokasi_kantor?.map(item => {
      let jarak = hitungJarak(item.lat, item.long, locLat, locLong);
      // let jarak = getDistance(item.lat, item.long, geolocation.coords.latitude, geolocation.coords.longitude);
      jarak = jarak * 1000;
      item['jarak'] = jarak
      dekatKantor.push(jarak)
    })
    let radius = parseInt(setting.radius_nilai)
    if (setting.radius_satuan == "km") {
      radius = radius * 1000
    }
    dekatKantor.sort(function (a, b) { return a - b })
    let lokKantorTerdekat = lokasi_kantor.filter(item => item.jarak == dekatKantor[0])
    setLokasiTerdekat(lokKantorTerdekat[0])
    if (radius > dekatKantor[0]) {
      setLokasiTerdekat((value) => ({
        ...value,
        cekRadius: true,
        radius: radius
      }));
    } else {
      setLokasiTerdekat((value) => ({
        ...value,
        cekRadius: false,
        radius
      }));
    }
  }

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          akurasi: pos.coords.accuracy,
          dataLoc: pos,
          error: null,
        });
        funcLokasiTerdekat(pos.coords.latitude, pos.coords.longitude)

        setAccuracy(pos.coords.accuracy);
        if (pos.coords.accuracy <= 1) {
          alert("⚠️ Kemungkinan GPS/lokasi palsu terdeteksi");
        }
        startAccelerometer(pos)
      },
      (err) => {
        setLocation((loc) => ({ ...loc, error: err.message }));
        if (err.message === "Timeout expired") {
          alert("Gagal mengambil lokasi, mohon refresh halaman");
        } else {
          alert(
            "Izin lokasi tidak diberikan, mohon allow izin lokasi sebelum menggunakan ePresensi"
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    startAccelerometer()
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

  return (
    <div className="container py-2">
      <Header time={time} />

      {/* Baris 1: ProfileCard */}
      <div className="row g-4 mb-4">
        <div className="col-md-12">
          <ProfileCard />
        </div>
      </div>

      {/* Baris 2: PresensiSection dan LocationCard sejajar */}
      <div className="row g-4">
        <div className="col-md-6">
          <PresensiSection
            presensiList={presensiUser}
            sudahMasuk={sudahMasuk}
            sudahPulang={sudahPulang}
            handlePresensi={handlePresensi}
          />
        </div>
        <div className="col-md-6">
          <LocationCard
            location={location}
            accuracy={accuracy}
            onRefresh={getLocation}
            lokasiTerdekat={lokasiTerdekat}
          />
        </div>
      </div>
      <AbsenModal
        modalAbsen={modalAbsen}
        setModalAbsen={setModalAbsen}
        jenisAbsen={jenisAbsen}
        time={time}
        location={location}
      />
      <Footer />
      {/* Floating Button Footer */}
      <Footer />
    </div>
  );
}
