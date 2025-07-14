import { useEffect, useState } from "react";

export default function ProfileCard() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user")); // Ambil user dari sessionStorage

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
      <div className="text-left md:text-center">
        <h5>{profile.nama}</h5>
        <p>{profile.nip}</p>
      </div>
    </div>
  );
}
