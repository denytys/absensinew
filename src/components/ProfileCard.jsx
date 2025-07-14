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

        const apiUrl = import.meta.env.VITE_ABSEN_BE + "/auth/profile";
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res = response.data;

        if (res.status) {
          setProfile(res.data);
        } else {
          setError(res.message || "Gagal mengambil data profil.");
        }
      } catch (err) {
        console.error("Error ambil data profile:", err);
        if (err.response) {
          setError(
            err.response.data.message || `Error: ${err.response.status}`
          );
        } else {
          setError("Tidak dapat menghubungi server.");
        }
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <div className="text-red-500 bg-red-100 p-2 rounded">{error}</div>;
  }

  if (!profile) {
    return <div>Memuat profil...</div>;
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
