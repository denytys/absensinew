export const removeSession = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("expired");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("waktu");
    sessionStorage.removeItem("lokasi_kantor");
    sessionStorage.removeItem("setting_presensi");
};