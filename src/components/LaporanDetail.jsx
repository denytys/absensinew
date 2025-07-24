import {AgGridReact} from 'ag-grid-react';
import { AllEnterpriseModule, ModuleRegistry } from 'ag-grid-enterprise';
import React, { useMemo, useState } from 'react'
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
const pagination = true;
const paginationPageSize = 20;
const paginationPageSizeSelector = [10, 20, 50, 100];

ModuleRegistry.registerModules([AllEnterpriseModule]);
export default function LaporanDetail({ datatabel, loading }) {
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
    const [colDefs, setColDefs] = useState([
        {
            headerName: "No",
            valueGetter: (params) => params.node.rowIndex + 1,
            width: 40,
            cellStyle: { textAlign: "center" },
        },
        { field: 'unit_kerja', headerName: "UNIT KERJA" },
        { field: 'nama', headerName: "NAMA" },
        { field: 'tanggal', headerName: "TANGGAL", width: 120 },
        {
            field: 'waktu_presensi_masuk', headerName: "MASUK", width: 105, cellStyle: params => {
                return {
                    color: params?.data?.waktu_presensi_masuk > params?.data?.batas_waktu_presensi_masuk ? 'red' : 'black',
                };
            }
        },
        {
            field: 'waktu_presensi_pulang', headerName: "PULANG", width: 110, cellStyle: params => {
                return {
                    color: params?.data?.waktu_presensi_pulang < params?.data?.batas_waktu_presensi_pulang ? 'red' : 'black',
                };
            }
        },
        {
            field: 'jenis_absen_masuk', headerName: "WFA/WFO", width: 70, cellRenderer: params => {
                return params.data.jenis_absen_masuk ?? params.data.jenis_absen_pulang
            }
        },
        {
            field: 'status', headerName: "STATUS", width: 280, cellRenderer: params => {
                const pulang = new Date(`1970-01-01T${params.data.waktu_presensi_pulang}Z`);
                const bataspulang = new Date(`1970-01-01T${params.data.batas_waktu_presensi_pulang}Z`);
                const pulanglebih = pulang - bataspulang
                const masuk = new Date(`1970-01-01T${params.data.waktu_presensi_masuk}Z`);
                const batasmasuk = new Date(`1970-01-01T${params.data.batas_waktu_presensi_masuk}Z`);
                const masuklebih = masuk - batasmasuk
                return <>
                    <div className={(params.data.status != "Tepat waktu" && pulanglebih - masuklebih < 0) || isNaN(pulanglebih) || isNaN(masuklebih) ? 'text-red-600' : ''}>{params.data.status?.replace("(FWA)", "")}<span class={(pulanglebih - masuklebih > 0 && params.data.status != "Tepat waktu" ? 'text-green-400' : "")}>{(pulanglebih - masuklebih > 0 && params.data.status != "Tepat waktu" ? ' (FWA)' : "")}</span></div>

                </>
            }
        },
    ]);
  return (
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
              pagination={pagination}
              paginationPageSize={paginationPageSize}
              paginationPageSizeSelector={paginationPageSizeSelector}
              defaultColDef={{ filter: true, sortable: true, autoHeight: true, autoHeaderHeight: true, cellStyle: { textAlign: 'left' } }}
              rowData={datatabel}
              statusBar={statusBar}
              columnDefs={colDefs}
          // onGridReady={getRekapLaporan}
          // debug
          />
      </div>
  )
}
