import React from 'react'
import { cekGanjil } from '../helper/formHelper';
import { decodeCookies } from '../helper/parsingCookies';
import { Tooltip } from 'antd';
function uiLap(data) {
    let balik = {}
    switch (data) {
        case 'tam':
            balik = {
                text: "TAM",
                css: "bg-red-500"
            }
            break;
        case 'tam_psw':
            balik = {
                text: "TAM,PSW",
                css: "bg-red-500"
            }
            break;
        case 'tap':
            balik = {
                text: "TAP",
                css: "bg-red-500"
            }
            break;
        case 'tl_tap':
            balik = {
                text: "TL,TAP",
                css: "bg-red-500"
            }
            break;
        case 'tam_tap':
            balik = {
                text: "TAM,TAP",
                css: "bg-red-500"
            }
            break;
        case 'tw':
            balik = {
                text: "v",
                css: "bg-green-400"
            }
            break;
        case 'tl':
            balik = {
                text: "TL",
                css: "bg-red-500"
            }
            break;
        case 'tl_f':
            balik = {
                text: "TL,F",
                css: "bg-green-400"
            }
            break;
        case 'psw_f':
            balik = {
                text: "PSW,F",
                css: "bg-green-400"
            }
            break;
        case 'psw':
            balik = {
                text: "PSW",
                css: "bg-amber-600"
            }
            break;
        case 'tl_psw':
            balik = {
                text: "TL,PSW",
                css: "bg-amber-600"
            }
            break;
        case undefined:
            balik = {
                text: "TA",
                css: "bg-red-500"
            }
            break;
        default:
            balik = {
                text: data,
                css: "bg-blue-400"
            }
    }
    return balik
}
export default function LaporanSummary({ datatabel, valueSelect, tanggalan, pegawaiSelect }) {
    const user = decodeCookies("user")
    return (
        <div className="relative overflow-x-auto text-left shadow-md" style={{ display: datatabel ? "block" : "none" }}>
            <Tooltip title={valueSelect?.jenis == "uangmakan" ? "*Keterangan: 1 = Dihitung, 0 = Tidak Dihitung" : "*Keterangan: V = Tepat Waktu, TL = Terlambat Masuk, TL_F = Terlambat Masuk (FWA), PSW = Pulang Sebelum Waktunya,PSW_F = Pulang Sebelum Waktunya (FWA), TAM: Tidak Absen Masuk, TAP: Tidak Absen Pulang"}>
                <>
                <span>*Keterangan</span>
                </>
            </Tooltip>
            <table className="w-full text-sm text-center text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-black font-bold uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" rowSpan={2} className="py-4 px-2 border-1">
                            No
                        </th>
                        <th scope="col" rowSpan={2} className="py-4 px-2 border-1">
                            Nama
                        </th>
                        <th scope="col" colSpan={tanggalan?.length + (valueSelect?.jenis == "uangmakan" ? 1 : 0)} className="py-2 px-2 border-1">
                            {valueSelect?.bulanView + " " + valueSelect?.tahun}
                        </th>
                    </tr>
                    <tr>
                        {tanggalan ? tanggalan?.map(item => (
                            <th scope="col" key={item} className={"py-2 px-2 w-11 border-1 text-center " + (cekGanjil(item) ? "bg-gray-100" : "")}>
                                {item}
                            </th>
                        )) : ""}
                        {valueSelect?.jenis == "uangmakan" ?
                            <th className="py-2 px-2 border-1">Total</th>
                            : ""}
                    </tr>
                </thead>
                <tbody>
                    {datatabel ?
                        datatabel?.map((tab, index) => (
                            <tr key={index} className={cekGanjil(index) ? "odd:bg-white odd:dark:bg-gray-900 text-black even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200" : "odd:bg-white odd:dark:bg-gray-900 text-black even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"}>
                                <td className='border-1'>{index + 1}</td>
                                <td className={'text-left px-1 py-1 font-medium border-1 text-gray-900 whitespace-nowrap' + (cekGanjil(index) ? " bg-gray-100" : "")}>{(pegawaiSelect?.length > 0 ? pegawaiSelect?.find(e => e.nip == tab[0])?.label : user?.nama)?.toUpperCase()}</td>
                                {tanggalan ? tanggalan?.map(item => (
                                    (valueSelect?.jenis == "summary" ?
                                        <td key={item} className={"px-1 text-center py-1 border-1 whitespace-nowrap " + (!(new Date(valueSelect?.tahun + "-" + valueSelect?.bulan + "-" + ("0" + item).substring(-2)).getDay() % 6) ? " bg-gray-300" : uiLap(tab[1][item])?.css)}>
                                            {tab[1][item] ? uiLap(tab[1][item])?.text : (!(new Date(valueSelect?.tahun + "-" + valueSelect?.bulan + "-" + ("0" + item).substring(-2)).getDay() % 6) ? "" : "TA")}
                                        </td>
                                        :
                                        <td key={item} className={"px-1 text-center py-1 border-1 whitespace-nowrap " + (!(new Date(valueSelect?.tahun + "-" + valueSelect?.bulan + "-" + ("0" + item).substring(-2)).getDay() % 6) ? " bg-gray-300" : uiLap(tab[1][item])?.css)}>
                                            {tab[1][item] ? (tab[1][item] == tab[1][item].toLowerCase() ? 1 : 0) : (!(new Date(valueSelect?.tahun + "-" + valueSelect?.bulan + "-" + ("0" + item).substring(-2)).getDay() % 6) ? "" : 0)}
                                        </td>
                                    )
                                )) : ""}
                                {valueSelect?.jenis == "uangmakan" ?
                                    <td className='text-center px-1 py-1 font-medium border-1 text-gray-900 whitespace-nowrap'>{Object.entries(tab[1]).filter(([_k, v]) => v === v.toLowerCase()).length}</td>
                                : ""}
                            </tr>
                        ))
                        : <></>}
                </tbody>
            </table>
        </div>
    )
}
