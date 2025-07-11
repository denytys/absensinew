import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();
  const [foto, setFoto] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")) || {
      foto: "",
    };
    setFoto(userData.foto || "");
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Maximal ukuran file 5MB
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert("Ukuran foto maksimal 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFoto(reader.result); // base64
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
    <div className="container">
      <div className="bg-white bg-opacity-50 rounded-xl p-4">
        <h3>Ganti Foto Profil</h3>
        <div className="mb-3">
          <label className="form-label">Foto Baru (max 5MB)</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
          />
          {foto && (
            <div className="text-center mt-3">
              <img
                src={foto}
                alt="Preview"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </div>
          )}
        </div>
        <button className="btn btn-primary me-2" onClick={handleSave}>
          Simpan
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/home")}>
          Batal
        </button>
      </div>
    </div>
  );
}
