import { redirect } from "react-router-dom";
import { decodeCookies } from "../helper/parsingCookies";
// import Swal from "sweetalert2";

export const protectedLoader = () => {
    const token = decodeCookies("token");
    const exp = decodeCookies("expired") * 1000
    if (!token || Date.now() > exp) {
        // Swal.fire({
        //     icon: 'warning',
        //     text: "Silakan login terlebih dahulu."
        // })
        // navigate("/");
        return redirect("/login");
    }
    return null;
};