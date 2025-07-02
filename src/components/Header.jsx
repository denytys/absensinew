import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Header({ time }) {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(true);
  const [user, setUser] = useState({ nama: "", foto: "" });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user")) || {
      nama: "User",
      foto: "https://via.placeholder.com/40",
    };
    setUser(data);
  }, []);

  const handleLogout = () => {
    setLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-0">
      <div className="ms-2 text-start">
        <h2 className="mb-0">Presensi App</h2>
        <p className="text-muted">{time.toLocaleString("id-ID")}</p>
      </div>

      <div className="dropdown">
        <img
          src={user.foto}
          alt="user"
          className="rounded-circle"
          role="button"
          id="dropdownUser"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          width={40}
          height={40}
          style={{ cursor: "pointer" }}
        />
        <ul
          className="dropdown-menu dropdown-menu-end"
          aria-labelledby="dropdownUser"
        >
          <li>
            <button className="dropdown-item" onClick={() => navigate("/")}>
              Home
            </button>
          </li>
          <li>
            <button
              className="dropdown-item"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profil
            </button>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button className="dropdown-item" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
