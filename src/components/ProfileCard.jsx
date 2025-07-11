import { useEffect, useState } from "react";
import axios from "axios";

export default function ProfileCard() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("Token tidak ditemukan. Silakan login ulang.");
          return;
        }

        const apiUrl = "http://localhost/absensi-be/index.php/auth/profile";

        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res = response.data;

        if (res.status) {
          setProfile(res.data);
        } else {
          setError(res.message || "Gagal mengambil data profile.");
        }
      } catch (err) {
        console.error("Error ambil data profile:", err);
        if (err.response) {
          // Error dari server (misal 404, 401, 500)
          setError(
            err.response.data.message || `Error: ${err.response.status}`
          );
        } else if (err.request) {
          // Request tidak terkirim / tidak ada response
          setError("Tidak dapat terhubung ke server. Pastikan API berjalan.");
        } else {
          // Error lain
          setError("Terjadi error: " + err.message);
        }
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="bg-white bg-opacity-50 rounded-xl p-3 mb-3">
      <div className="text-left md:text-center">
        <h5>{profile.nama}</h5>
        <p>{profile.nip}</p>
      </div>
    </div>
  );
}
