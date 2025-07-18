import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DigitalClock from "./DigitalClock";
import { removeSession } from "../helper/funcLogout";
import Swal from "sweetalert2";

export default function Header() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState({ nama: "", foto: "" });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user")) || {
      nama: "User",
      foto: "/images/user.png",
    };
    setUser(data);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    removeSession()
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Logout sukses",
      timer: 1500 
    })
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center mb-4 px-2">
      {/* Title and Time */}
      <div className="text-left">
        <h2 className="text-xl font-semibold text-gray-800">
          Presensi BARANTIN
        </h2>
        <p className="text-sm text-gray-500"><DigitalClock/></p>
      </div>

      {/* User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <img
          src={user.foto || "/images/user.png"}
          alt="User"
          className="w-10 h-10 rounded-full cursor-pointer object-cover"
          onClick={() => setDropdownOpen((prev) => !prev)}
        />

        {/* Dropdown with transition */}
        <div
          className={`absolute right-0 mt-2 w-44 bg-white/30 backdrop-blur-md shadow-xl rounded-xl z-50 text-sm text-gray-800 transform transition-all duration-200 ease-out origin-top-right ${
            dropdownOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          <button
            onClick={() => {
              navigate("/home");
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-300/20 transition"
          >
            Home
          </button>
          <button
            onClick={() => {
              navigate("/edit-profile");
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-300/20 transition"
          >
            Edit Profil
          </button>
          <hr className="my-1 border-gray-200" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-500 hover:bg-blue-300/20 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
