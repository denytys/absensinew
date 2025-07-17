import { useEffect, useState } from "react";
import { decodeCookies } from "../helper/parsingCookies";

export default function ProfileCard() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = decodeCookies("user"); // Ambil user dari sessionStorage

    if (!user) {
      setError("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    setProfile(user); // Set profile dengan data user yang ada di sessionStorage
  }, []);

  if (error) {
    return <div className="text-red-500 bg-red-100 p-2 rounded">{error}</div>;
  }

  if (!profile) {
    return <div>Memuat profil...</div>;
  }

  return (
    <div className="bg-white/45 rounded-xl p-3 mb-2">
      <div className="text-center">
        <p className="text-lg">{profile.nama}</p>
        <p className="text-sm">{profile.nip}</p>
        {/* <p>{profile.alamat}</p> */}
      </div>
    </div>
  );
}
