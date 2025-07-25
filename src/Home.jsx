import { useCallback, useEffect, useState } from "react";

import ProfileCard from "./components/ProfileCard";
import LocationCard from "./components/LocationCard";
import PresensiSection from "./components/PresensiSection";
import AbsenModal from "./components/AbsenModal";
import { decodeCookies } from "./helper/parsingCookies";
import { hitungJarak } from "./helper/hitungJarak";
import InformasiUpdate from "./components/InformasiUpdate";
import Swal from "sweetalert2";
import { protectPostPut } from "./helper/axiosHelper";
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
  // const [time, setTime] = useState(new Date());
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
  const startAccelerometer = useCallback((position) => {
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", (event) => {
        setCekGps((value) => ({
          ...value,
          accelerationData: event.accelerationIncludingGravity,
        }));
        detectGPSSpoofing(position, event.accelerationIncludingGravity);
      });
    } else {
      setCekGps((value) => ({
        ...value,
        accelerationData: false,
      }));
      // Swal.fire({
      //   icon: 'warning',
      //   text: 'Accelerometer tidak didukung di perangkat ini'
      // })
      // console.error("Accelerometer tidak didukung di perangkat ini.");
    }
  }, []);
  // const [presensiList, setPresensiList] = useState(
  //   () => JSON.parse(localStorage.getItem("presensiList")) || []
  // );

  // const user = JSON.parse(localStorage.getItem("user")) || {
  //   nama: "Nama Default",
  //   nip: "0000000000",
  //   kantor: "Kantor Pusat",
  //   foto: "https://via.placeholder.com/80",
  // };

  const funcLokasiTerdekat = (locLat, locLong) => {
    const lokasi_kantor = decodeCookies("lokasi_kantor");
    const setting = decodeCookies("setting_presensi");
    let dekatKantor = [];
    lokasi_kantor?.map((item) => {
      let jarak = hitungJarak(item.lat, item.long, locLat, locLong);
      // let jarak = getDistance(item.lat, item.long, geolocation.coords.latitude, geolocation.coords.longitude);
      jarak = jarak * 1000;
      item["jarak"] = jarak;
      dekatKantor.push(jarak);
    });
    let radius = parseInt(setting.radius_nilai);
    if (setting.radius_satuan == "km") {
      radius = radius * 1000;
    }
    dekatKantor.sort(function (a, b) {
      return a - b;
    });
    let lokKantorTerdekat = lokasi_kantor.filter(
      (item) => item.jarak == dekatKantor[0]
    );
    setLokasiTerdekat(lokKantorTerdekat[0]);
    if (radius > dekatKantor[0]) {
      setLokasiTerdekat((value) => ({
        ...value,
        cekRadius: true,
        radius: radius,
      }));
    } else {
      setLokasiTerdekat((value) => ({
        ...value,
        cekRadius: false,
        radius,
      }));
    }
  };

  const getLocation = useCallback(() => {
    Swal.fire("Mengambil lokasi GPS..");
    Swal.showLoading();
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        Swal.close();
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          akurasi: pos.coords.accuracy,
          dataLoc: pos,
          error: null,
        });
        funcLokasiTerdekat(pos.coords.latitude, pos.coords.longitude);

        setAccuracy(pos.coords.accuracy);
        if (pos.coords.accuracy <= 1) {
          Swal.fire({
            icon: "warning",
            title: "Warning!",
            text: "Kemungkinan GPS/lokasi palsu terdeteksi",
          });
        }
        startAccelerometer(pos);
      },
      (err) => {
        setLocation((loc) => ({ ...loc, error: err.message }));
        if (err.message === "Timeout expired") {
          Swal.fire({
            icon: "error",
            title: "Terjadi kesalahan",
            text: "Gagal mengambil lokasi, mohon refresh halaman",
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "Izin lokasi tidak diberikan",
            text: "mohon allow izin lokasi sebelum menggunakan ePresensi",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  let [history, setHistory] = useState("")
  const getHistory = useCallback(async () => {
    const user = decodeCookies('user')
    const waktuabsen = decodeCookies('waktu')
    const shiftId = waktuabsen?.map(item => {
      return item.id_setting_waktu_presensi
    })
    try {
      const datenow = new Date
      const data = {
        id_user: user?.id_user,
        tanggal: datenow.toISOString().split('T')[0],
        shifting: user?.shifting,
        shift_id: shiftId
      }
      const response = await protectPostPut('post', '/presensi/history', data)
      setHistory(response?.data?.data)
    } catch (error) {
      setHistory("")
    }
  }, [decodeCookies])

  useEffect(() => {
    getLocation();
    getHistory()
    // localStorage.setItem("presensiList", JSON.stringify(presensiList));
  }, [getLocation, getHistory]);

  // Filter presensi hanya milik user login
  // const presensiUser = presensiList.filter((p) => p.nama === user.nama);

  // const today = new Date().toISOString().slice(0, 10);
  // const presensiHariIni = presensiUser.filter((p) =>
  //   p.waktu_presensi.startsWith(today)
  // );
  // const sudahMasuk = presensiHariIni.some((p) => p.jenis === "masuk");
  // const sudahPulang = presensiHariIni.some((p) => p.jenis === "pulang");

  const handlePresensi = (jenis) => {
    if (cekGps?.gpsSpeed * 3.6 > 300 && cekGps?.accelerationMagnitude < 0.5) {
      Swal.fire({
        icon: "error",
        title: "Perhatian",
        text: "Kemungkinan GPS/lokasi palsu terdeteksi",
      });
      return;
    }
    if (accuracy <= 1) {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: "Kemungkinan GPS/lokasi palsu terdeteksi",
      });
      return;
    }
    const user = decodeCookies('user')
    if (user?.shifting != 'Y') {
      const d = new Date()
      const time = d.toLocaleString('en-US', { hour12: false })
      const waktu = decodeCookies('waktu')
      console.log("waktu", waktu)
      if(jenis == 'masuk') {
        if (time.substring(11) <= waktu[0]['waktu_masuk_awal']) {
          Swal.fire({
            icon: 'error',
            title: 'Absen masuk belum dimulai',
            text: 'Batas masuk awal: ' + waktu[0]['waktu_masuk_awal']
          })
          return
        }
        if (time.substring(11) >= waktu[0]['waktu_masuk_akhir']) {
          Swal.fire({
            icon: 'error',
            title: 'Absen masuk sudah lewat',
            text: 'Batas masuk akhir: ' + waktu[0]['waktu_masuk_akhir']
          })
          return
        }
      }
      if (jenis == 'pulang') {
        let bataspulang = waktu[0]['waktu_pulang_awal']
        if (d.getDay() == 5) {
          const [hours, minutes, seconds] = bataspulang.split(":").map(Number);
          const batasbaru = new Date()
          batasbaru.setHours(hours)
          batasbaru.setMinutes(minutes)
          batasbaru.setSeconds(seconds)
          batasbaru.setMinutes(batasbaru.getMinutes() + 30)
          bataspulang = batasbaru.toTimeString().split(" ")[0]
        }
        if (time.substring(11) <= bataspulang) {
          Swal.fire({
            icon: 'error',
            title: 'Absen pulang belum dimulai',
            text: 'Batas pulang awal: ' + bataspulang
          })
          return
        }
      }
    }
    setModalAbsen(true);
    setJenisAbsen(jenis);
  };

  return (
    <>
      {/* Baris 1: ProfileCard */}
      <div className="grid gap-4 mb-2">
        <ProfileCard />
      </div>

      {/* Baris 2: PresensiSection dan LocationCard sejajar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <PresensiSection
            history={history}
            handlePresensi={handlePresensi}
          />
          <InformasiUpdate />
        </div>
        <div>
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
        location={location}
        lokasiTerdekat={lokasiTerdekat}
        history={history}
      />
    </>
  );
}
