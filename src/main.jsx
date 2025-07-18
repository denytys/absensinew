// import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App";
import "leaflet/dist/leaflet.css";
import "./App.css";
import "react-datepicker/dist/react-datepicker.css";
import { router } from "./routes";
import { RouterProvider } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
