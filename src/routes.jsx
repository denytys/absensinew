// src/routes.jsx
import { createBrowserRouter } from "react-router-dom";
import { protectedLoader } from "./layout/protectedLoader";
import Login from "./Login";
import MainLayout from "./layout/MainLayout";
import Home from "./Home";
import RiwayatAbsen from "./components/RiwayatAbsen";
import LaporanWfa from "./components/LaporanWfa";
import EditProfile from "./EditProfile";
import FormPerizinan from "./components/FormPerizinan";
import ErrorPage from "./pages/ErrorPage";
import Rekap from "./Rekap";
import ResetPassword from "./components/ResetPassword";
import Maintenance from "./Maintenance";
import LayoutAdmin from "./layout/LayoutAdmin";
import AdminHome from "./components/admin/AdminHome";
import AdminPegawai from "./components/admin/AdminPegawai";
import ShiftPegawai from "./components/admin/ShiftPegawai";
import MasterShift from "./components/admin/MasterShift";
import MasterLokasiKantor from "./components/admin/MasterLokasiKantor";

export const router = createBrowserRouter([
  {
    path: "login",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "reset-password",
    element: <ResetPassword />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: <MainLayout />,
    loader: protectedLoader,
    children: [
      { index: true, element: <Home />, errorElement: <ErrorPage /> },
      { path: "home", element: <Home />, errorElement: <ErrorPage /> },
      {
        path: "riwayat",
        element: <RiwayatAbsen />,
        errorElement: <ErrorPage />,
      },
      { path: "izin", element: <FormPerizinan />, errorElement: <ErrorPage /> },
      { path: "wfa", element: <LaporanWfa />, errorElement: <ErrorPage /> },
      { path: "rekap", element: <Rekap />, errorElement: <ErrorPage /> },
      {
        path: "edit-profile",
        element: <EditProfile />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/maintenance",
        element: <Maintenance />,
        errorElement: <ErrorPage />,
      },
    ],
  },
  {
    path: "/admins",
    element: <LayoutAdmin />,
    loader: protectedLoader,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AdminHome />, errorElement: <ErrorPage /> },
      { path: "home", element: <AdminHome />, errorElement: <ErrorPage /> },
      { path: "pegawai", element: <AdminPegawai />, errorElement: <ErrorPage /> },
      { path: "shiftpeg", element: <ShiftPegawai />, errorElement: <ErrorPage /> },
      { path: "mshift", element: <MasterShift />, errorElement: <ErrorPage /> },
      { path: "mlokasi", element: <MasterLokasiKantor />, errorElement: <ErrorPage /> },
    ]
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);
