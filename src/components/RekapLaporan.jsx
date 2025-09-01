import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import React, { useCallback, useEffect, useState } from "react";
import { Select } from "antd";
import cekRoles from "../helper/cekRoles";
import { protectGet, protectPostPut } from "../helper/axiosHelper";
import { decodeCookies } from "../helper/parsingCookies";
import Swal from "sweetalert2";
import { getDaysInMonth } from "../helper/formHelper";
import LaporanSummary from "./LaporanSummary";
import LaporanDetail from "./LaporanDetail";

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

export default function RekapLaporan() {
  const d = new Date();
  const user = decodeCookies("user");
  const [pegawaiSelect, setPegawaiSelect] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bagianSelect, setBagianSelect] = useState([]);
  const [selectJenisLaporan, setSelectJenisLaporan] = useState([
    {
      value: "summary",
      label: "Summary",
    },
    {
      value: "detail",
      label: "Detail",
    },
  ]);
  const [tanggalan, setTanggalan] = useState(
    getDaysInMonth(d.getMonth(), d.getFullYear())
  );
  let [datatabel, setDatatabel] = useState(false);
  let [valueSelect, setValueSelect] = useState({
    upt: user?.upt_id ?? "1000",
    bagian: user?.bagian_id ?? "all",
    jenis: "summary",
    bagianView: "-Semua-",
    pegawai: user?.id_user ?? "all",
    pegawaiView: user?.nama ?? "-Semua-",
    bulan: bulan[d.getMonth()].value,
    bulanView: bulan[d.getMonth()].label,
    tahun: d.getFullYear(),
  });

  const getPegawai = useCallback(async (bag) => {
    Swal.fire("Loading pegawai..");
    Swal.showLoading();
    setLoading(true);
    try {
      const cari = {
        upt: cekRoles("admin") ? "all" : user?.upt_id,
        bagian:
          cekRoles("admin") || cekRoles("adm-peg")
            ? bag
              ? bag
              : "all"
            : user?.bagian_id,
      };
      const pegawai = await protectPostPut("post", "/pegawai/getBy", cari);
      if (import.meta.env.MODE == "development") {
        console.log(pegawai);
      }
      const sel = pegawai.data.data?.map((item) => {
        return {
          value: item.id_user,
          label: item.nama,
          nip: item.nip,
        };
      });
      sel.unshift({ value: "all", label: "-Semua-", nip: "" });
      setPegawaiSelect(sel);
    } catch (error) {
      if (import.meta.env.MODE == "development") {
        console.log(error);
      }
      setPegawaiSelect([]);
    } finally {
      Swal.close();
      setLoading(false);
    }
  }, []);
  const getBagian = useCallback(async () => {
    Swal.fire("Loading bagian..");
    Swal.showLoading();
    try {
      const bagian = await protectGet(
        "/bagian/getBy?jenis=" + (user?.upt_id == "1000" ? "1000" : "upt")
      );
      if (import.meta.env.MODE == "development") {
        console.log(bagian);
      }
      const sel = bagian.data.data?.map((item) => {
        return {
          value: item.id,
          label: item.nama,
        };
      });
      sel.unshift({ value: "all", label: "-Semua-" });
      setBagianSelect(sel);
    } catch (error) {
      if (import.meta.env.MODE == "development") {
        console.log(error);
      }
      setBagianSelect([]);
    } finally {
      Swal.close();
    }
  }, []);

  const getRekapLaporan = async (data) => {
    Swal.fire("Mohon tunggu..");
    Swal.showLoading();
    if (!data) {
      data = "view";
    }
    valueSelect["return"] = data;
    valueSelect["profiluser"] = user;
    let endpoint = "";
    switch (valueSelect.jenis) {
      case "summary":
        endpoint = "/laporan/rekap";
        break;
      case "uangmakan":
        endpoint = "/laporan/rekap";
        break;
      case "detail":
        endpoint = "/laporan";
        break;
      default:
        endpoint = "/laporan/rekap";
    }
    try {
      const response = await protectPostPut(
        "post",
        endpoint,
        valueSelect,
        data == "excel" || data == "pdf" ? "blob" : null
      );
      if (data == "view") {
        const tbl =
          valueSelect.jenis == "summary" || valueSelect.jenis == "uangmakan"
            ? Object.entries(response.data.data)
            : response.data.data;
        setDatatabel(tbl);
      } else if (data == "excel" || data == "pdf") {
        const url = window.URL.createObjectURL(
          new Blob([response.data], {
            type:
              response.headers["content-type"] || "application/octet-stream",
          })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `ePresensi ${valueSelect.bulan + valueSelect.tahun + "_" + Date.now()
          }.${data == "pdf" ? "pdf" : "xlsx"}`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setDatatabel(false);
      }
      if (import.meta.env.MODE === "development") {
        console.log("tbl", JSON.stringify(response));
      }
      const tgl = getDaysInMonth(
        parseInt(valueSelect.bulan),
        valueSelect.tahun
      );
      setTanggalan(tgl);
    } catch (error) {
      setDatatabel([]);
      if (import.meta.env.MODE === "development") {
        console.log("err get laporan", error);
      }
    } finally {
      Swal.close();
    }
  };

  useEffect(() => {
    if (cekRoles("admin") || cekRoles("adm-peg") || cekRoles("adm-tu")) {
      getPegawai();
      getBagian();

      if (cekRoles("admin") || cekRoles("adm-peg")) {
        setSelectJenisLaporan([
          {
            value: "summary",
            label: "Summary",
          },
          {
            value: "detail",
            label: "Detail",
          },
          {
            value: "uangmakan",
            label: "Uang makan",
          },
        ]);
      }
    }
  }, [getPegawai, getBagian]);
  return (
    <div className="mb-24">
      <div className="border-b border-gray-200 dark:border-gray-700 mb-2 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold">Rekap Laporan</h2>
        {cekRoles("admin") ||
          cekRoles("adm-peg") ||
          (cekRoles("adm-tu") && user?.upt_id != "1000") ? (
          <div className="mb-2">
            <label className="block font-medium mb-1 text-left">Bagian</label>
            <Select
              showSearch
              allowClear
              value={valueSelect.bagian}
              className="w-full text-left"
              placeholder="Bagian..."
              optionFilterProp="label"
              onChange={(e) => {
                setValueSelect((values) => ({
                  ...values,
                  bagian: e ? e : "all",
                  pegawai: "all",
                }));
                getPegawai(e);
              }}
              options={bagianSelect}
            />
          </div>
        ) : (
          ""
        )}
        {cekRoles("admin") || cekRoles("adm-peg") || cekRoles("adm-tu") ? (
          <div className="mb-2">
            <label className="block font-medium mb-1 text-left">Pegawai</label>
            <Select
              showSearch
              allowClear
              value={valueSelect.pegawai}
              className="w-full text-left"
              placeholder="Pegawai..."
              optionFilterProp="label"
              onChange={(e) =>
                setValueSelect((values) => ({
                  ...values,
                  pegawai: e ? e : "all",
                }))
              }
              options={pegawaiSelect}
            />
          </div>
        ) : (
          ""
        )}
        <div className="mb-2">
          <label className="block font-medium mb-1 text-left">Periode</label>
          <div className="flex">
            <Select
              showSearch
              value={valueSelect.bulan}
              className="w-full text-left"
              placeholder="Pilih bulan"
              optionFilterProp="label"
              onChange={(e) => {
                setValueSelect((values) => ({ ...values, bulan: e, bulanView: bulan.find(x => x.value == e).label }))
                setDatatabel(false)
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
                setDatatabel(false)
              }
              options={tahun()}
            />
          </div>
        </div>
        <div className="mb-2">
          <label className="block font-medium mb-1 text-left">
            Jenis Laporan
          </label>
          <Select
            showSearch
            value={valueSelect.jenis}
            className="w-full text-left"
            placeholder="Pilih jenis laporan"
            optionFilterProp="label"
            onChange={(e) =>
              setValueSelect((values) => ({ ...values, jenis: e })) &
              setDatatabel(false)
            }
            options={selectJenisLaporan}
          />
        </div>
        <button
          type="button"
          onClick={() => getRekapLaporan("view")}
          className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
        >
          <EyeOutlined className="me-2" />
          View
        </button>
        {valueSelect.jenis == "detail" ? (
          cekRoles("admin") || cekRoles("adm-peg") || cekRoles("adm-tu") ? (
            <>
              <button
                type="button"
                onClick={() => getRekapLaporan("excel")}
                className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                <DownloadOutlined /> Excel
              </button>
              <button
                type="button"
                onClick={() => getRekapLaporan("pdf")}
                className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                <DownloadOutlined /> Pdf
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => getRekapLaporan("pdf")}
              className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              <DownloadOutlined /> Pdf
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => getRekapLaporan("excel")}
            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            <DownloadOutlined /> Excel
          </button>
        )}
      </div>

      {valueSelect.jenis == "summary" || valueSelect.jenis == "uangmakan" ? (
        <LaporanSummary
          datatabel={datatabel}
          valueSelect={valueSelect}
          tanggalan={tanggalan}
          pegawaiSelect={pegawaiSelect}
        />
      ) : (
        ""
      )}
      {valueSelect.jenis == "detail" ? (
        <LaporanDetail datatabel={datatabel} loading={loading} />
      ) : (
        ""
      )}
    </div>
  );
}
