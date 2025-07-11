// Home.jsx
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import Header from "./components/Header";
import ProfileCard from "./components/ProfileCard";
import LocationCard from "./components/LocationCard";
import PresensiSection from "./components/PresensiSection";
import { AntiFakeGps } from '@dhamaddam/anti-fake-gps';


export default function Home() {
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    error: null,
  });
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

  useEffect( () => {
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
        })
        const result = await AntiFakeGps.getMock({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now()
        });

        console.log('Is Fake Location?', result.results[0].isMock); // true / false
      },
      (err) => setLocation((loc) => ({ ...loc, error: err.message }))
    );
  }, []);
  useEffect(() => {
    localStorage.setItem("presensiList", JSON.stringify(presensiList));
    getMock()
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
    if (!location.lat || !location.lng) return alert("Lokasi belum tersedia");

    const newPresensi = {
      id: Date.now(),
      nama: user.nama,
      jenis,
      lat: location.lat,
      lng: location.lng,
      waktu_presensi: new Date().toISOString(),
    };

    setPresensiList((prev) => [newPresensi, ...prev]);
  };

  const refreshLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
        }),
      (err) => setLocation((loc) => ({ ...loc, error: err.message }))
    );
  };

  return (
    <div className="container py-2">
      <Header time={time} />

      {/* Baris 1: ProfileCard */}
      <div className="row g-4 mb-2">
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
          <LocationCard location={location} onRefresh={refreshLocation} />
        </div>
      </div>

      {/* Floating Button Footer */}
      <footer
        className="position-fixed bottom-0 start-0 end-0 p-2 text-center"
        style={{ borderRadius: "0" }}
      >
        <a
          href="/izin"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-light rounded-circle shadow"
          style={{
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <i className="bi bi-pencil-square fs-4"></i>
        </a>
      </footer>
    </div>
  );
}
