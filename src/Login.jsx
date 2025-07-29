import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import { encodeCookies } from "./helper/parsingCookies";
import { protectGet } from "./helper/axiosHelper";
import { Input } from "antd";

export default function Login() {
  // const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // mulai loading
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
        encodeCookies("token", res.data.token);
        encodeCookies("expired", res.data.expired);
        encodeCookies("user", res.data.data);
        encodeCookies("role", res.data.role);
        encodeCookies("waktu", res.data.setting_waktu);
        encodeCookies("lokasi_kantor", res.data.lokasi_kantor);

        const responseSett = protectGet("/presensi/setting", res.data.token);
        responseSett
          .then((response) => {
            // alert(JSON.stringify(response.data))
            if (response.data.status) {
              encodeCookies("setting_presensi", response.data.data);
              // navigate("/");
              window.location.replace("/");
            } else {
              alert("Gagal load setting presensi");
            }
          })
          .catch((error) => {
            if (import.meta.env.MODE === "development") {
              console.log("error set", error);
            }
            alert(
              error.response?.data?.message || "Gagal load setting presensi"
            );
          });
      } else {
        alert(res.message || "Login gagal!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat login.");
    } finally {
      setIsLoading(false); // selesai loading
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(240,240,255,0.1)]">
      <div className="w-xs md:w-full max-w-sm p-8 bg-white/45 shadow-lg rounded-3xl backdrop-blur-md relative">
        {/* Tooltip and Download Button */}
        <div className="absolute top-[15px] md:top-[10px] right-[15px] md:right-[10px] z-10">
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
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: 16, height: 35, paddingLeft: 15 }}
          />

          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: 16, height: 35, paddingLeft: 15 }}
          />

          {isLoading ? (
            <button
              disabled
              type="button"
              className="w-3xs md:w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex justify-center items-center"
            >
              <svg
                aria-hidden="true"
                role="status"
                className="w-4 h-4 mr-2 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
              Login
            </button>
          ) : (
            <button
              type="submit"
              className="w-3xs md:w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          )}
        </form>

        {/* Footer */}
        <div className="text-center mt-4">
          <small className="text-gray-500">Lupa password? Hubungi admin.</small>
        </div>
      </div>
    </div>
  );
}
