import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions, themeBalham } from 'ag-grid-community';
import React, { useState } from 'react'
import Title from 'antd/es/typography/Title';
import cekRoles from '../../helper/cekRoles';
import { Button, Flex, Select } from 'antd';
import { decodeCookies, encodeCookies } from '../../helper/parsingCookies';
import ListUPT from "../../assets/uptNewGrouping.json";
import { protectPostPut } from '../../helper/axiosHelper';
import Swal from 'sweetalert2';
import {
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const pagination = true;
const paginationPageSize = 20;
const paginationPageSizeSelector = [10, 20, 50, 100];

ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({
  theme: "legacy",
});

export default function AdminPegawai() {
  const myTheme = themeBalham.withParams({ accentColor: 'blue' });
  const user = decodeCookies("user")
  let [filterText, setFilterText] = useState("");
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
  const [colDefs, setColDefs] = useState([
    {
      headerName: "No",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 40,
      cellStyle: { textAlign: "center" },
    },
    { field: 'unit_kerja', headerName: "UNIT KERJA", cellStyle: { whiteSpace: "normal" }, },
    { field: 'nama', headerName: "NAMA", cellStyle: { whiteSpace: "normal" }, },
    {
      field: 'nip', headerName: "NIP", width: 150, cellRenderer: params => {
        return params.data.nip == 0 ? params.data.nik : params.data.nip
      }
    },
    { field: 'username', headerName: "Username", width: 120 },
    { field: 'role_peg', headerName: "Role", width: 120, cellStyle: { whiteSpace: "normal" }, },
    {
      field: 'act', headerName: "Act", width: 120, cellRenderer: params => {
        return <Flex gap="small" >
          <Button onClick={() => encodeCookies("userGet", params.data) & window.location.replace('/edit-profile')} variant='solid' shape="round" color='orange' icon={<EditOutlined />} size={"small"}></Button>
          <Button variant='solid' shape="round" color='danger' icon={<DeleteOutlined />} size={"small"}></Button>
        </Flex>
      }
    },
  ]);

  const getPegawai = async (uptt) => {
    Swal.fire("Loading pegawai..");
    Swal.showLoading();
    setLoading(true);
    try {
      const cari = {
        upt: typeof uptt === "string" ? uptt : upt,
      };
      const pegawai = await protectPostPut("post", "/pegawai/lengkap", cari);
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
  return (
    <>
      <Title level={4} style={{ margin: 0, padding: 0, textAlign: "end" }}>User Manager</Title>
      {cekRoles("admin") ||
        (cekRoles("adm-peg") && user?.upt_id == "1000") ?
        <div className="mb-2">
          <label className="block font-medium mb-1 text-left">UPT</label>
          <Select
            showSearch
            allowClear
            value={upt}
            className="w-1/2 text-left"
            placeholder="Bagian..."
            optionFilterProp="label"
            onChange={(e) => {
              setUpt(e)
              getPegawai(e)
            }}
            options={listUPT()}
          />
        </div>
        : ""}
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
          onGridReady={getPegawai}
        // debug
        />
      </div>
    </>
  )
}
