import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import ReactSelect from 'react-select';
import cekRoles from '../helper/cekRoles';
import { protectGet, protectPostPut } from '../helper/axiosHelper';
import { decodeCookies } from '../helper/parsingCookies';
import Swal from "sweetalert2";
import { getDaysInMonth } from '../helper/formHelper';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
const pagination = true;
const paginationPageSize = 10;
const paginationPageSizeSelector = [10, 20, 50, 100];
const customSelect = {
  control: (provided, state) => ({
    ...provided,
    background: 'white',
    borderColor: '#D4D8DD',
    textAlign: 'left',
    cursor: 'text',
    minHeight: '30px',
    height: '30px',
    boxShadow: state.isFocused ? null : null,
  }),

  valueContainer: (provided, state) => ({
    ...provided,
    height: '30px',
    padding: '0 6px'
  }),
  input: (provided, state) => ({
    ...provided,
    margin: '0px',
  }),
  indicatorSeparator: state => ({
    display: 'none',
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: '30px',
  }),
}
const bulan = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' }
]
function tahun() {
  const start_year = new Date().getFullYear();
  const results = []
  for (var i = start_year; i >= 2023; i--) {
    results.push({ value: i, label: i });
  }
  return results
}

ModuleRegistry.registerModules([AllEnterpriseModule]);
export default function RekapLaporan() {
  const d = new Date()
  const user = decodeCookies("user")
  let [filterText, setFilterText] = useState("");
  const statusBar = useMemo(() => {
    return {
      statusPanels: [
        { statusPanel: 'agTotalAndFilteredRowCountComponent' },
        { statusPanel: 'agTotalRowCountComponent' },
        { statusPanel: 'agFilteredRowCountComponent' },
        { statusPanel: 'agSelectedRowCountComponent' },
        { statusPanel: 'agAggregationComponent' }
      ]
    };
  }, []);
  const [pegawaiSelect, setPegawaiSelect] = useState([])
  const [loading, setLoading] = useState(false)
  const [bagianSelect, setBagianSelect] = useState([])
  const [tanggalan, setTanggalan] = useState(getDaysInMonth(d.getMonth(), d.getFullYear()))
  let [datatabel, setDatatabel] = useState(false)
  let [valueSelect, setValueSelect] = useState({
    upt: user?.upt_id ?? "1000",
    bagian: "all",
    bagianView: "-Semua-",
    // pegawai: "all",
    // pegawaiView: "-Semua-",
    pegawai: user?.id_user ?? "all",
    pegawaiView: user?.nama ?? "-Semua-",
    bulan: bulan[d.getMonth()].value,
    bulanView: bulan[d.getMonth()].label,
    tahun: d.getFullYear()
  })
  function handleChange(tag, e) {
    setValueSelect(values => ({
      ...values,
      [tag]: e ? e.value : "all",
      [tag + "View"]: e ? e.label : "-Semua-"
    }))
    if (tag == 'bagian') {
      getPegawai(e.value)
    }
  }

  const getPegawai = useCallback(async (bag) => {
    Swal.fire("Loading pegawai..")
    Swal.showLoading()
    setLoading(true)
    try {
      const cari = {
        upt: cekRoles("admin") ? "all" : user?.upt_id,
        bagian: cekRoles("admin") || cekRoles("adm-peg") ? (bag ? bag : "all") : user?.bagian_id
      }
      const pegawai = await protectPostPut("post", "/pegawai/getBy", cari)
      if (import.meta.env.MODE == 'development') {
        console.log(pegawai)
      }
      const sel = pegawai.data.data?.map(item => {
        return {
          value: item.id_user,
          label: item.nama,
          nip: item.nip,
        }
      })
      setPegawaiSelect(sel)
    } catch (error) {
      if (import.meta.env.MODE == 'development') {
        console.log(error)
      }
      setPegawaiSelect([])
    } finally {
      Swal.close()
      setLoading(false)
    }
  }, [])
  const getBagian = useCallback(async () => {
    Swal.fire("Loading bagian..")
    Swal.showLoading()
    try {
      const bagian = await protectGet("/bagian/getBy?jenis=" + (user?.upt_id == "1000" ? "1000" : "upt"))
      if (import.meta.env.MODE == 'development') {
        console.log(bagian)
      }
      const sel = bagian.data.data?.map(item => {
        return {
          value: item.id,
          label: item.nama
        }
      })
      setBagianSelect(sel)
    } catch (error) {
      if (import.meta.env.MODE == 'development') {
        console.log(error)
      }
      setBagianSelect([])
    } finally {
      Swal.close()
    }
  }, [])

  const [colDefs, setColDefs] = useState([
    { field: 'unit_kerja', headerName: "UNIT KERJA" },
    { field: 'nama', headerName: "NAMA" },
    { field: 'tanggal', headerName: "TANGGAL", width: 120 },
    {
      field: 'waktu_presensi_masuk', headerName: "MASUK", width: 105, cellStyle: params => {
        return {
          color: params?.data?.waktu_presensi_masuk > params?.data?.batas_waktu_presensi_masuk ? 'red' : 'black',
          // fontWeight: params.value === 'Terlambat' ? 'bold' : 'normal',
        };
      }
    },
    {
      field: 'waktu_presensi_pulang', headerName: "PULANG", width: 110, cellStyle: params => {
        return {
          color: params?.data?.waktu_presensi_pulang < params?.data?.batas_waktu_presensi_pulang ? 'red' : 'black',
          // fontWeight: params.value === 'Terlambat' ? 'bold' : 'normal',
        };
      }
    },
    { field: 'jenis_absen_masuk', headerName: "WFA/WFO", width: 70, cellRenderer: params => {
      return params.data.jenis_absen_masuk ?? params.data.jenis_absen_pulang
    } 
  },
    {
      field: 'status', headerName: "STATUS", cellRenderer: params => {
        const pulang = new Date(`1970-01-01T${params.data.waktu_presensi_pulang}Z`);
        const bataspulang = new Date(`1970-01-01T${params.data.batas_waktu_presensi_pulang}Z`);
        const pulanglebih = pulang - bataspulang
        const masuk = new Date(`1970-01-01T${params.data.waktu_presensi_masuk}Z`);
        const batasmasuk = new Date(`1970-01-01T${params.data.batas_waktu_presensi_masuk}Z`);
        const masuklebih = masuk - batasmasuk
        return <>
          <div className={(params.data.status != "Tepat waktu" && pulanglebih - masuklebih < 0) || isNaN(pulanglebih) || isNaN(masuklebih) ? 'text-red-600' : ''}>{params.data.status}</div>
          <span class={(pulanglebih - masuklebih > 0 && params.data.status != "Tepat waktu" ? 'text-green-400' : "")}>{(pulanglebih - masuklebih > 0 && params.data.status != "Tepat waktu" ? '(FWA OK)' : "")}</span>
        </>
      }
    },
  ]);

  const getRekapLaporan = async (data) => {
    Swal.fire("Mohon tunggu..")
    Swal.showLoading()
    if (!data) {
      data = 'view'
    }
    valueSelect['jenis'] = data
    try {
      const response = await protectPostPut("post", "/laporan", valueSelect)
      const tbl = response.data.data
      setDatatabel(tbl)
      if (import.meta.env.MODE === "development") {
        console.log("tbl", tbl)
      }
      const tgl = getDaysInMonth(parseInt(valueSelect.bulan), valueSelect.tahun)
      setTanggalan(tgl)
    } catch (error) {
      setDatatabel([])
      if (import.meta.env.MODE === "development") {
        console.log("err get laporan", error)
      }
    } finally {
      Swal.close()
    }
  }

  useEffect(() => {
    if (cekRoles("admin") || cekRoles("adm-peg") || cekRoles("adm-tu")) {
      getPegawai()
      getBagian()
    }
  }, [getPegawai, getBagian])
  return (
    <div className='mb-24'>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-2 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold">Rekap Absen</h2>
        <div className='mb-2'>
          <label className="block font-medium mb-1 text-left">
            Bagian
          </label>
          <ReactSelect
            styles={customSelect}
            value={{ id: valueSelect?.bagian, label: valueSelect?.bagianView }}
            onChange={(e) => handleChange("bagian", e)}
            className="w-full rounded-lg"
            options={bagianSelect}
            placeholder="Bagian..."
            isClearable
          />
        </div>
        <div className='mb-2'>
          <label className="block font-medium mb-1 text-left">
            Pegawai
          </label>
          <ReactSelect
            styles={customSelect}
            value={{ id: valueSelect?.pegawai, label: valueSelect?.pegawaiView }}
            onChange={(e) => handleChange("pegawai", e)}
            className="w-full rounded-lg"
            options={pegawaiSelect}
            placeholder="Pegawai..."
            isClearable
          />
        </div>
        <div className='mb-2'>
          <label className="block font-medium mb-1 text-left">
            Periode
          </label>
          <div className="flex">
            <ReactSelect
              styles={customSelect}
              value={{ id: valueSelect?.bulan, label: valueSelect?.bulanView }}
              onChange={(e) => handleChange("bulan", e)}
              className="w-full rounded-lg"
              options={bulan}
              placeholder="Bulan..."
            />
            <ReactSelect
              styles={customSelect}
              value={{ id: valueSelect?.tahun, label: valueSelect?.tahun }}
              onChange={(e) => handleChange("tahun", e)}
              className="w-full rounded-lg"
              options={tahun()}
              placeholder="Tahun..."
            />
          </div>
        </div>
        <button type="button" onClick={() => getRekapLaporan("view")} className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ">
          <EyeOutlined className='me-2' />View</button>
        <button type="button" onClick={() => getRekapLaporan("unduh")} className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          <DownloadOutlined /> Download</button>
      </div>

      <div
        className="ag-theme-quartz" // applying the Data Grid theme
        style={{ height: 500, display: datatabel ? "block" : "none" }} // the Data Grid will fill the size of the parent container
      >
        <label htmlFor="search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div className="relative mb-1">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
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
          enableCellTextSelection={true}
          ensureDomOrder={true}
          // animateRows={true}
          pagination={pagination}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={paginationPageSizeSelector}
          defaultColDef={{ filter: true, sortable: true, autoHeight: true, autoHeaderHeight: true, cellStyle: { textAlign: 'left' } }}
          rowData={datatabel}
          statusBar={statusBar}
          columnDefs={colDefs}
          onGridReady={getRekapLaporan}
          debug
        />
      </div>
    </div>
  )
}