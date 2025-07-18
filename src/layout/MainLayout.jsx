import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Swal from 'sweetalert2';
import { removeSession } from '../helper/funcLogout';
import { decodeCookies } from '../helper/parsingCookies';

export default function MainLayout() {
    const navigate = useNavigate()
    useEffect(() => {
        const token = decodeCookies("token");
        const exp = decodeCookies("expired") * 1000
        const interval = setInterval(() => {
            if (token && exp && Date.now() > exp) {
                Swal.fire({
                    icon: 'warning',
                    text: "Session habis"
                })
                removeSession()
                navigate("/login");
            }
        }, 30000); // cek setiap 30 detik

        return () => clearInterval(interval); // clear on unmount
    }, []);
    return (
        <div className="cmax-w-screen-lg mx-auto px-2 relative min-h-screen">
            <Header />
            <Outlet />
            <Footer />
        </div>
    )
}
