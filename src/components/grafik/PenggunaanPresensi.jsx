import { Button, Flex, Modal, Progress, Row, Select, Table } from 'antd'
import React, { useState } from 'react'
import { protectPostPut } from '../../helper/axiosHelper';
import { decodeCookies } from '../../helper/parsingCookies';
import Swal from 'sweetalert2';
import { SearchOutlined } from '@ant-design/icons';
import cekRoles from '../../helper/cekRoles';
import ListUPT from "../../assets/uptNewGrouping.json";
const bulan = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];
function tahun() {
    const start_year = new Date().getFullYear();
    const results = [];
    for (var i = start_year; i >= 2023; i--) {
        results.push({ value: i, label: i });
    }
    return results;
}

export default function PenggunaanPresensi() {
    const d = new Date();
    const user = decodeCookies("user");
    let [dataPenggunaan, setDataPenggunaan] = useState([])
    let [dataPenggunaanDetil, setDataPenggunaanDetil] = useState([])
    let [isModalVisible, setIsModalVisible] = useState(false)
    let [valueSelect, setValueSelect] = useState({
        upt: user?.upt_id,
        // bulan: "08",
        bulan: bulan[d.getMonth()].value,
        bulanView: bulan[d.getMonth()].label,
        tahun: d.getFullYear(),
        // upt: "all"
    })
    const listUPT = () => {
        let datauptjson = ListUPT
        if (user?.upt_id?.slice(0, 2) != '10') {
            datauptjson = datauptjson.filter(item => item.kode_upt == user?.upt_id?.slice(0, 2))
        }
        const dataUpt = datauptjson.map(item => {
            return {
                value: item.id?.toString(),
                label: item.nama?.replace("Balai Karantina Hewan, Ikan, dan Tumbuhan", "BKHIT")?.replace("Balai Besar Karantina Hewan, Ikan, dan Tumbuhan", "BBKHIT")
            }
        })
        if (user?.upt_id?.slice(0, 2) == '10') {
            dataUpt.unshift({ value: "all", label: "-Semua UPT-" })
        }
        return dataUpt
    }
    function getLaporan() {
        Swal.fire("Loading..")
        Swal.showLoading()
        protectPostPut("post", "/dashboard/penggunaan", valueSelect)
            .then((response) => {
                setDataPenggunaan(response.data.data)
                if (import.meta.env.MODE === "development") {
                    console.log("tbl", response);
                }
                Swal.close()
            })
            .catch((error) => {
                if (import.meta.env.MODE === "development") {
                    console.log("err get laporan", error);
                }
                Swal.close()
            })
    }

    function getPenggunaanPerPegawai(e) {
        Swal.fire("Loading..")
        Swal.showLoading()
        e['bulan'] = valueSelect.bulan
        e['tahun'] = valueSelect.tahun
        if (valueSelect.upt == 'all') {
            e['bagian_id'] = 'all'
        }
        protectPostPut("post", "/dashboard/perUptBagian", e)
            .then((response) => {
                setIsModalVisible(true)
                setDataPenggunaanDetil(response.data.data)
                if (import.meta.env.MODE === "development") {
                    console.log("tbl", response);
                }
                Swal.close()
            })
            .catch((error) => {
                if (import.meta.env.MODE === "development") {
                    console.log("err get laporan", error);
                }
                setDataPenggunaanDetil([])
                Swal.close()
            })
    }
    return (
        <div>
            <Flex gap="small" style={{
                display: 'flex',
                flexWrap: 'wrap'
            }}>
                {cekRoles("admin") ||
                    (cekRoles("adm-peg") && user?.upt_id == "1000") ?
                    // <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Flex vertical>
                        <label className="block font-medium mb-1 text-left">UPT</label>
                        <Select
                            showSearch
                            allowClear
                            style={{ width: "max-content", minWidth: "150px" }}
                            value={valueSelect.upt}
                            className="text-left w-auto max-w-full sm:w-[300px]"
                            popupMatchSelectWidth={false}
                            popupStyle={{ width: 'auto' }}
                            placeholder="Filter UPT..."
                            optionFilterProp="label"
                            onChange={(e) => {
                                setValueSelect((values) => ({
                                    ...values,
                                    upt: e,
                                }));
                                setDataPenggunaan([])
                            }}
                            options={listUPT()}
                        />
                    </Flex>
                    // </Row>
                    : ""}
                <Flex vertical>
                    <label className="block font-medium mb-1 text-left">Periode</label>
                    <Flex gap="small" >
                        <Select
                            showSearch
                            value={valueSelect.bulan}
                            className="w-full text-left"
                            placeholder="Pilih bulan"
                            optionFilterProp="label"
                            onChange={(e) => {
                                setValueSelect((values) => ({ ...values, bulan: e, bulanView: bulan.find(x => x.value == e).label }))
                                setDataPenggunaan([])
                            }}
                            options={bulan}
                        />
                        <Select
                            showSearch
                            value={valueSelect.tahun}
                            className="w-full text-left"
                            placeholder="Pilih tahun"
                            optionFilterProp="label"
                            onChange={(e) =>
                                setValueSelect((values) => ({ ...values, tahun: e })) &
                                setDataPenggunaan([])
                            }
                            options={tahun()}
                        />
                        <Button shape="round" type='primary' icon={<SearchOutlined />} onClick={getLaporan}>Submit</Button>
                    </Flex>
                </Flex>
            </Flex>
            <div style={{ overflowX: 'auto', display: dataPenggunaan?.length > 0 ? "block" : "none" }}>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>{valueSelect.upt == 'all' ? "UPT" : "Bagian"}</th>
                            <th>Persentase Penggunaan</th>
                            <th>Pengguna / Total User</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataPenggunaan?.length > 0 ?
                            dataPenggunaan.map((item, index) => (
                                <tr key={index}>
                                    <td className='p-2'>
                                        {index + 1}
                                    </td>
                                    <td className='px-2'>
                                        {valueSelect.upt == 'all' ? item.upt?.replace("Balai Karantina Hewan, Ikan, dan Tumbuhan", "BKHIT")?.replace("Balai Besar Karantina Hewan, Ikan, dan Tumbuhan", "BBKHIT")?.replace("Karantina Hewan, Ikan, dan Tumbuhan", "BBKHIT") : (item.nama_bagian ? item.nama_bagian : "Tidak terdefinisi")}
                                    </td>
                                    <td className='px-2'>
                                        <Progress
                                            percent={item.persentase_hadir}
                                            percentPosition={{ align: 'start', type: 'inner' }}
                                            size={[300, 30]}
                                            strokeColor={item.persentase_hadir > 80 ? "#B7EB8F" : (item.persentase_hadir > 50 ? "#ead88f" : "#ea8f8f")}
                                        />
                                    </td>
                                    <td className='px-2 text-right'>
                                        <Button type='link' onClick={() => getPenggunaanPerPegawai(item)}> {item.jumlah_presensi + " / " + item.total_user}</Button>
                                    </td>
                                </tr>
                            ))
                            : ""}
                    </tbody>
                </table>
            </div>
            <Modal
                open={isModalVisible}
                footer={null}
                onCancel={() => setIsModalVisible(false)}
                centered
                width={600}
            >
                <div style={{ textAlign: "start", padding: "20px" }}>
                    <p style={{ fontSize: "18px", marginBottom: 24 }}>
                        Detil Penggunaan ePresensi Periode {valueSelect.bulanView + ' ' + valueSelect.tahun}
                    </p>
                    <div style={{ overflowX: 'auto', display: dataPenggunaan?.length > 0 ? "block" : "none" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama</th>
                                    <th>NIP</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataPenggunaanDetil?.length > 0 ?
                                    dataPenggunaanDetil.map((item, index) => (
                                        <tr key={index}>
                                            <td className='p-2'>
                                                {index + 1}
                                            </td>
                                            <td className='px-2'>
                                                {item.nama}
                                            </td>
                                            <td className='px-2'>
                                                {item.nip}
                                            </td>
                                            <td className={'px-2 text-right' + (item.jumlah_presensi == 1 ? ' text-emerald-800' : ' text-red-500')}>
                                                {item.jumlah_presensi == 1 ? 'Pakai' : 'Belum'}
                                            </td>
                                        </tr>
                                    ))
                                    : ""}
                            </tbody>
                        </table>
                    </div>
                    <Button type="primary" onClick={() => setIsModalVisible(false)}>
                        Tutup
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
