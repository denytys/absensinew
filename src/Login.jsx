import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post(
        import.meta.env.VITE_ABSEN_BE + "/auth/login",
        formData
      );

      const res = response.data;

      if (res.status) {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(res.data.data));
        navigate("/home");
      } else {
        alert(res.message || "Login gagal!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat login.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(240,240,255,0.1)] z-[9999]">
      <div className="w-full max-w-sm p-6 bg-white/45 shadow-lg rounded-3xl backdrop-blur-md relative">
        {/* Tooltip and Download Button */}
        <div className="absolute top-[10px] right-[10px] z-10">
          <div
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative"
          >
            <a
              href="/manual-ePresensiOLD.pdf"
              download
              className="w-7 h-7 flex items-center justify-center text-xs font-light text-white bg-[#f26c4f]/90 rounded-full shadow-md backdrop-blur cursor-pointer"
            >
              ▼
            </a>
            <div
              className={`absolute top-10 right-0 bg-white px-3 py-2 rounded-xl shadow-md text-sm whitespace-nowrap transition-all duration-300 origin-top-right ${
                showTooltip
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-0 pointer-events-none"
              }`}
            >
              Unduh Manual Aplikasi
            </div>
          </div>
        </div>

        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-4">
          <img
            src="logo-e-presensi.png"
            alt="logo"
            width="200"
            className="mb-3"
          />
          <h5 className="font-bold text-lg">Selamat Datang</h5>
          <p className="text-gray-600 text-sm">di Presensi Online BARANTIN</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-5 py-2.5 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-2.5 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2.5 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-4">
          <small className="text-gray-500">Lupa password? Hubungi admin.</small>
        </div>
      </div>
    </div>
  );
}
