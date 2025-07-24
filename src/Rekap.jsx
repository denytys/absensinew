import React, { useState } from 'react'
import RekapDashboard from './components/RekapDashboard'
import RekapLaporan from './components/RekapLaporan'

export default function Rekap() {
    const cssActive = " active text-blue-600 border-b-2 border-blue-600 rounded-t-lg dark:text-blue-500 dark:border-blue-500 group"
    const cssNonActive = " border-b-2 border-transparent rounded-t-lg hover:text-gray-800 hover:border-gray-400 dark:hover:text-gray-300 group"
    const [tab, setTab] = useState("Laporan")

    return (
        <>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-2">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                    <li className="me-2">
                        <button type='button' onClick={() => setTab("Laporan")} className={"inline-flex items-center justify-center p-4" + (tab == "Laporan" ? cssActive : cssNonActive)}>
                            Laporan
                        </button>
                    </li>
                    <li className="me-2">
                        <button type='button' onClick={() => setTab("Grafik")} className={"inline-flex items-center justify-center p-4" + (tab == "Grafik" ? cssActive : cssNonActive)}>
                            Grafik
                        </button>
                    </li>
                </ul>
            </div>
            <div className="bg-white/45 rounded-xl p-3 mb-2 w-full">
                {tab == "Laporan" ?
                    <RekapLaporan /> : ""}
                {tab == "Grafik" ?
                    <RekapDashboard /> : ""}
            </div>
        </>
    )
}
