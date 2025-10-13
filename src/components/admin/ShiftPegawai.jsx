import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions, themeBalham } from 'ag-grid-community';
import React, { useState } from 'react'
import Title from 'antd/es/typography/Title';
import cekRoles from '../../helper/cekRoles';
import { Button, DatePicker, Flex, Select } from 'antd';
import { decodeCookies } from '../../helper/parsingCookies';
import ListUPT from "../../assets/uptNewGrouping.json";
import { protectDelete, protectGet } from '../../helper/axiosHelper';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import {
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    PlusOutlined
} from '@ant-design/icons';
import FormUploadShift from './FormUploadShift';

const pagination = true;
const paginationPageSize = 20;
const paginationPageSizeSelector = [10, 20, 50, 100];

ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({
    theme: "legacy",
});

export default function ShiftPegawai() {
    const myTheme = themeBalham.withParams({ accentColor: 'blue' });
    const user = decodeCookies("user")
    let [openModal, setOpenModal] = useState(false);
    let [valueSelected, setValueSelected] = useState("");
    let [filterText, setFilterText] = useState("");
    let [flag, setFlag] = useState("");
    let [datatabel, setDatatabel] = useState([]);
    let [loading, setLoading] = useState(false);
    let [upt, setUpt] = useState(user?.upt_id);
    let [periode, setPeriode] = useState(dayjs().format('YYYY-MM'));
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
        // if (user?.upt_id?.slice(0, 2) == '10') {
        //   dataUpt.unshift({ value: "", label: "-Semua UPT-" })
        // }
        return dataUpt
    }
    
    const getShift = async (uptt, periodee) => {
        Swal.fire("Loading pegawai..");
        Swal.showLoading();
        setLoading(true);
        try {
            const pegawai = await protectGet("/shiftPegawai/byUpt?upt=" + (typeof uptt === "string" ? uptt : upt) + '&periode=' + (periodee ? periodee : periode));
            if (import.meta.env.MODE == "development") {
                console.log(pegawai);
            }
            setDatatabel(pegawai.data.data)
        } catch (error) {
            if (import.meta.env.MODE == "development") {
                console.log(error);
            }
            setDatatabel([]);
        } finally {
            Swal.close();
            setLoading(false);
        }
    };
    function deleteShiftPegawai(e) {
        Swal.fire({
            icon: "warning",
            title: "Perhatian!",
            text: "Jadwal " + e?.nama_shift + " a/n  " + e?.nama + " tanggal " + e.tanggal + " akan dihapus. Anda yakin ?",
            showDenyButton: true,
            confirmButtonText: "Yakin",
            confirmButtonColor: "red",
            denyButtonColor: "green",
            denyButtonText: "Batal"
        }).then((result) => {
            if (result.isConfirmed) {
                const payload = {
                    id: e.id
                }
                Swal.fire("Menghapus data..")
                Swal.showLoading()
                protectDelete("/shiftPegawai", payload)
                    .then(async (response) => {
                        if (response.data.status) {
                            await Swal.fire({
                                icon: 'success',
                                title: 'Sukses!',
                                text: response?.data?.message ?? 'Data berhasil dihapus.'
                            })
                            getShift()
                        }
                    })
                    .catch((error) => {
                        Swal.fire({
                            icon: "error",
                            text: error.response.data?.message ?? 'Data gagal dihapus.'
                        })
                    })
            }
        })
    }
    const [colDefs, setColDefs] = useState([
        {
            headerName: "No",
            valueGetter: (params) => params.node.rowIndex + 1,
            width: 40,
            cellStyle: { textAlign: "center" },
        },
        { field: 'nama', headerName: "Petugas", cellStyle: { whiteSpace: "normal" }, },
        { field: 'tanggal', headerName: "Tanggal", width: 100, cellStyle: { whiteSpace: "normal" }, },
        { field: 'nama_shift', headerName: "Shift", width: 100, cellStyle: { whiteSpace: "normal" }, },
        {
            field: 'batas_waktu_masuk', headerName: "Batas waktu masuk", cellStyle: { whiteSpace: "normal" }, cellRenderer: params => {
                return params.data.batas_waktu_masuk + " (" + params.data.waktu_masuk_awal + " sd " + params.data.waktu_masuk_akhir + " )"
            }
        },
        {
            field: 'batas_waktu_pulang', headerName: "Batas waktu pulang", cellStyle: { whiteSpace: "normal" }, cellRenderer: params => {
                return params.data.batas_waktu_pulang + " (" + params.data.waktu_pulang_awal + " sd " + params.data.waktu_pulang_akhir + " )"
            }
        },
        { field: 'hari_pulang', headerName: "Hari pulang", width: 130, cellStyle: { whiteSpace: "normal" }, },
        {
            field: 'act', headerName: "Act", width: 120, cellRenderer: params => {
                return <Flex gap="small" >
                    <Button onClick={() => {
                        setValueSelected(params.data);
                        setOpenModal(true);
                        setFlag('user');
                    }} variant='solid' shape="round" color='orange' icon={<EditOutlined />} size={"small"}></Button>
                    <Button onClick={() => deleteShiftPegawai(params.data)} variant='solid' shape="round" color='danger' icon={<DeleteOutlined />} size={"small"}></Button>
                </Flex>
            }
        },
    ]);
    return (
        <>
            <Title level={4} style={{ margin: 0, padding: 0, textAlign: "end" }}>Manajemen waktu shift</Title>
            <Flex gap={2} style={{
                display: 'flex',
                flexWrap: 'wrap'
            }}>
                {cekRoles("admin") ||
                    (cekRoles("adm-peg") && user?.upt_id == "1000") ?
                    <div className="mb-2">
                        <label className="block font-medium mb-1 text-left">UPT</label>
                        <Select
                            showSearch
                            allowClear
                            value={upt}
                            placeholder="Bagian..."
                            optionFilterProp="label"
                            onChange={(e) => {
                                setUpt(e)
                                getShift(e, periode)
                            }}
                            className="text-left w-auto max-w-full sm:w-[300px]"
                            popupMatchSelectWidth={false}
                            popupStyle={{ width: 'auto' }}
                            options={listUPT()}
                        />
                    </div>
                    : ""}
                <div className="mb-2">
                    <label className="block font-medium mb-1 text-left">Periode</label>
                    <DatePicker
                        defaultValue={[dayjs()]}
                        picker="month"
                        value={dayjs(periode)}
                        format="YYYY-MM"
                        onChange={(dates) => {
                            setPeriode(dates.format('YYYY-MM'))
                            getShift(upt, dates.format('YYYY-MM'))
                        }}
                    />
                </div>
            </Flex>
            <Button onClick={() => setOpenModal(true) & setFlag('user')} color="purple" variant="solid" icon={<PlusOutlined />} className='mb-2 mr-2'>Input jadwal petugas</Button>
            <Button onClick={() => setOpenModal(true) & setFlag('excel')} color="green" variant="solid" icon={<UploadOutlined />} className='mb-2'>Upload Excel</Button>
            <div
                className="ag-theme-quartz" // applying the Data Grid theme
                style={{ height: 400, display: datatabel ? "block" : "none" }} // the Data Grid will fill the size of the parent container
            >
                <label htmlFor="search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative mb-1">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input type="search" id="search" className="block p-1 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                    />
                </div>
                <AgGridReact
                    quickFilterText={filterText}
                    loading={loading}
                    theme={myTheme}
                    enableCellTextSelection={true}
                    ensureDomOrder={true}
                    pagination={pagination}
                    paginationPageSize={paginationPageSize}
                    paginationPageSizeSelector={paginationPageSizeSelector}
                    defaultColDef={{ filter: true, sortable: true, autoHeight: true, autoHeaderHeight: true, cellStyle: { textAlign: 'left' } }}
                    rowData={datatabel}
                    //   statusBar={statusBar}
                    columnDefs={colDefs}
                    onGridReady={getShift}
                // debug
                />
            </div>
            <FormUploadShift
                openModal={openModal}
                setOpenModal={setOpenModal}
                getShift={getShift}
                flag={flag}
                setFlag={setFlag}
                valueSelected={valueSelected}
            />
        </>
    )
}
