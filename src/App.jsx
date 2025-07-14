// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import FormPerizinan from "./components/FormPerizinan"; // ganti sesuai struktur kamu
import EditProfile from "./EditProfile"; // import komponen baru
import Login from "./Login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/izin" element={<FormPerizinan />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
    </Router>
  );
}
