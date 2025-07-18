// src/components/DigitalClock.jsx
import { useEffect, useState } from "react";

const DigitalClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
        // const interval = setInterval(setTime(new Date()), 1000); // update tiap 1 detik
        // return () => clearInterval(interval); // cleanup saat unmount
    }, []);

    const hari = time.toLocaleDateString("id-ID", { weekday: 'long' })
    const tanggal = time.toLocaleDateString("id-ID", {
        day: '2-digit',
        year: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })

    return (
        <>
            {hari + ", " + tanggal}
        </>
    );
};

export default DigitalClock;
