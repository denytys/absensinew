// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import RiwayatAbsen from "./components/RiwayatAbsen";
import FormPerizinan from "./components/FormPerizinan"; // ganti sesuai struktur kamu
import EditProfile from "./EditProfile"; // import komponen baru
import LaporanWfa from "./components/LaporanWfa";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/riwayat" element={<RiwayatAbsen />} />
        <Route path="/izin" element={<FormPerizinan />} />
        <Route path="/wfa" element={<LaporanWfa />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
    </Router>
  );
}
