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

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
        errorElement: <ErrorPage/>
    },
    {
        path: "/",
        element: <MainLayout />,
        loader: protectedLoader,
        children: [
            { index: true, element: <Home />, errorElement: <ErrorPage /> },
            { path: 'home', element: <Home />, errorElement: <ErrorPage /> },
            { path: "riwayat", element: <RiwayatAbsen />, errorElement: <ErrorPage /> },
            { path: "izin", element: <FormPerizinan />, errorElement: <ErrorPage /> },
            { path: "wfa", element: <LaporanWfa />, errorElement: <ErrorPage /> },
            { path: "rekap", element: <Rekap />, errorElement: <ErrorPage /> },
            { path: "edit-profile", element: <EditProfile />, errorElement: <ErrorPage /> },
        ],
    },
    {
        path: "*",
        element: <ErrorPage />,
    },
]);
