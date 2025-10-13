import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions, themeBalham } from 'ag-grid-community';
import React, { useState } from 'react'
import Title from 'antd/es/typography/Title';
import cekRoles from '../../helper/cekRoles';
import { Button, Flex, Select } from 'antd';
import { decodeCookies } from '../../helper/parsingCookies';
import ListUPT from "../../assets/uptNewGrouping.json";
import { protectDelete, protectGet } from '../../helper/axiosHelper';
import Swal from 'sweetalert2';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined
} from '@ant-design/icons';
import FormMasterShift from './FormMasterShift';

const pagination = true;
const paginationPageSize = 20;
const paginationPageSizeSelector = [10, 20, 50, 100];

ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({
    theme: "legacy",
});

export default function MasterShift() {
    const myTheme = themeBalham.withParams({ accentColor: 'blue' });
    const user = decodeCookies("user")
    let [filterText, setFilterText] = useState("");
    let [openModal, setOpenModal] = useState(false);
    let [dataSelected, setDataSelected] = useState("");
    let [datatabel, setDatatabel] = useState([]);
    let [loading, setLoading] = useState(false);
    let [upt, setUpt] = useState(user?.upt_id);
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

    const getShift = async (uptt) => {
        Swal.fire("Loading pegawai..");
        Swal.showLoading();
        setLoading(true);
        try {
            const pegawai = await protectGet("/masterWaktuPresensi/upt?upt=" + (typeof uptt === "string" ? uptt : upt));
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
    function deleteMasterShift(e) {
        Swal.fire({
            icon: "warning",
            title: "Perhatian!",
            text: "Shift " + e?.nama_setting + " akan dihapus. Anda yakin ?",
            showDenyButton: true,
            confirmButtonText: "Yakin",
            confirmButtonColor: "red",
            denyButtonColor: "green",
            denyButtonText: "Batal"
        }).then((result) => {
            if (result.isConfirmed) {
                const payload = {
                    id_setting_waktu_presensi: e.id_setting_waktu_presensi
                }
                Swal.fire("Menghapus data..")
                Swal.showLoading()
                protectDelete("/masterWaktuPresensi", payload)
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
        { field: 'nama_setting', headerName: "Nama Shift", cellStyle: { whiteSpace: "normal" }, },
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
        { field: 'hari_pulang', headerName: "Hari pulang", cellStyle: { whiteSpace: "normal" }, },
        {
            field: 'act', headerName: "Act", width: 120, cellRenderer: params => {
                return <Flex gap="small" >
                    <Button onClick={() => setOpenModal(true) & setDataSelected(params.data)} variant='solid' shape="round" color='orange' icon={<EditOutlined />} size={"small"}></Button>
                    <Button onClick={() => deleteMasterShift(params.data)} variant='solid' shape="round" color='danger' icon={<DeleteOutlined />} size={"small"}></Button>
                </Flex>
            }
        },
    ]);
    return (
        <>
            <Title level={4} style={{ margin: 0, padding: 0, textAlign: "end" }}>Manajemen waktu shift</Title>
            {cekRoles("admin") ||
                (cekRoles("adm-peg") && user?.upt_id == "1000") ?
                <div className="mb-2">
                    <label className="block font-medium mb-1 text-left">UPT</label>
                    <Select
                        showSearch
                        // allowClear
                        value={upt}
                        className="w-1/2 text-left"
                        placeholder="Bagian..."
                        optionFilterProp="label"
                        onChange={(e) => {
                            setUpt(e)
                            getShift(e)
                        }}
                        options={listUPT()}
                    />
                </div>
                : ""}
            <Button onClick={() => setOpenModal(true)} color="blue" variant="solid" icon={<PlusOutlined />} className='mb-2 mr-2'>Input Baru</Button>
            <FormMasterShift
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataSelected={dataSelected}
                getShift={getShift}
            />
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
        </>
    )
}
