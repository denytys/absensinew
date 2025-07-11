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
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        background: "rgba(240, 240, 255, 0.1)",
        zIndex: 9999,
      }}
    >
      <div
        className="p-4 rounded-lg"
        style={{
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "rgba(255, 255, 255, 0.45)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          borderRadius: "20px",
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              zIndex: 10,
              cursor: "pointer",
            }}
          >
            <a
              href="/manual-ePresensiOLD.pdf"
              download
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "rgba(242,108,79,0.9)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                backdropFilter: "blur(4px)",
                textDecoration: "none",
                fontSize: "11px",
                fontWeight: "lighter",
                color: "#ffffff",
              }}
            >
              ▼
            </a>

            <div
              style={{
                position: "absolute",
                top: "40px",
                right: "0px",
                background: "#fff",
                padding: "8px 12px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transform: showTooltip ? "scale(1)" : "scale(0.8)",
                opacity: showTooltip ? 1 : 0,
                transformOrigin: "top right",
                transition: "all 0.25s ease",
                whiteSpace: "nowrap",
                fontSize: "13px",
              }}
            >
              Unduh Manual Aplikasi
            </div>
          </div>
        </div>

        <div className="justify-items-center">
          <img
            src="logo-e-presensi.png"
            alt="logo"
            width="200"
            className="mb-3"
          />
          <h5 className="fw-bold">Selamat Datang</h5>
          <p className="text-muted mb-4">di Presensi Online BARANTIN</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-2">
            Login
          </button>
        </form>

        <div className="text-center">
          <small className="text-muted">Lupa password? Hubungi admin.</small>
        </div>
      </div>
    </div>
  );
}
