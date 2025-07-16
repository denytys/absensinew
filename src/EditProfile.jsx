import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircleFadingArrowUp } from "lucide-react";
import { decodeCookies } from "./helper/parsingCookies";

export default function EditProfile() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = decodeCookies("token");
    if (!token) {
      alert("Silakan login terlebih dahulu.");
      navigate("/");
    }
  }, []);
  const [foto, setFoto] = useState("");

  useEffect(() => {
    const userData = decodeCookies("user") || {
      foto: "",
    };
    setFoto(userData.foto || "");
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert("Ukuran foto maksimal 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    const updatedUser = { ...userData, foto };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    navigate("/home");
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Ganti Foto Profil</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Foto Baru (max 5MB)</label>
          <div className="flex flex-row gap-2">
            <CircleFadingArrowUp />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {foto && (
          <div className="flex justify-center mt-4">
            <img
              src={foto}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-full border"
            />
          </div>
        )}

        <div className="flex flex-row-reverse mt-6 gap-3">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Simpan
          </button>
          <button
            onClick={() => navigate("/home")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
