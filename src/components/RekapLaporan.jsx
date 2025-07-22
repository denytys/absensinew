import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import React, { useCallback, useEffect, useState } from "react";
import ReactSelect from "react-select";
import cekRoles from "../helper/cekRoles";
import { protectGet, protectPostPut } from "../helper/axiosHelper";
import { decodeCookies } from "../helper/parsingCookies";
import Swal from "sweetalert2";
import { cekGanjil, getDaysInMonth } from "../helper/formHelper";
const customSelect = {
  control: (provided, state) => ({
    ...provided,
    background: "white",
    borderColor: "#D4D8DD",
    textAlign: "left",
    cursor: "text",
    minHeight: "30px",
    height: "30px",
    boxShadow: state.isFocused ? null : null,
  }),

  valueContainer: (provided, state) => ({
    ...provided,
    height: "30px",
    padding: "0 6px",
  }),
  input: (provided, state) => ({
    ...provided,
    margin: "0px",
  }),
  indicatorSeparator: (state) => ({
    display: "none",
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: "30px",
  }),
};
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

function uiLap(data) {
  let balik = {};
  switch (data) {
    case "tam":
      balik = {
        text: "TAM",
        css: "bg-red-500",
      };
      break;
    case "tam_psw":
      balik = {
        text: "TAM,PSW",
        css: "bg-red-500",
      };
      break;
    case "tap":
      balik = {
        text: "TAP",
        css: "bg-red-500",
      };
      break;
    case "tl_tap":
      balik = {
        text: "TL,TAP",
        css: "bg-red-500",
      };
      break;
    case "tam_tap":
      balik = {
        text: "TAM,TAP",
        css: "bg-red-500",
      };
      break;
    case "tw":
      balik = {
        text: "v",
        css: "bg-green-400",
      };
      break;
    case "tl":
      balik = {
        text: "TL",
        css: "bg-red-500",
      };
      break;
    case "psw":
      balik = {
        text: "PSW",
        css: "bg-amber-600",
      };
      break;
    case "tl_psw":
      balik = {
        text: "TL,PSW",
        css: "bg-amber-600",
      };
      break;
    case undefined:
      balik = {
        text: "TA",
        css: "bg-red-500",
      };
      break;
    default:
      balik = {
        text: data,
        css: "bg-blue-400",
      };
  }
  return balik;
}

export default function RekapLaporan() {
  const d = new Date();
  const user = decodeCookies("user");
  const [pegawaiSelect, setPegawaiSelect] = useState([]);
  const [bagianSelect, setBagianSelect] = useState([]);
  const [tanggalan, setTanggalan] = useState(
    getDaysInMonth(d.getMonth(), d.getFullYear())
  );
  let [datatabel, setDatatabel] = useState(false);
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
    tahun: d.getFullYear(),
  });
  function handleChange(tag, e) {
    setValueSelect((values) => ({
      ...values,
      [tag]: e ? e.value : "all",
      [tag + "View"]: e ? e.label : "-Semua-",
    }));
    if (tag == "bagian") {
      getPegawai(e.value);
    }
  }

  const getPegawai = useCallback(async (bag) => {
    Swal.fire("Loading pegawai..");
    Swal.showLoading();
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
      setPegawaiSelect(sel);
    } catch (error) {
      if (import.meta.env.MODE == "development") {
        console.log(error);
      }
      setPegawaiSelect([]);
    } finally {
      Swal.close();
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
    valueSelect["jesni"] = data;
    try {
      const response = await protectPostPut(
        "post",
        "/laporan/rekap",
        valueSelect
      );
      const tbl = Object.entries(response.data.data);
      setDatatabel(tbl);
      if (import.meta.env.MODE === "development") {
        console.log("tbl", tbl);
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
    }
  }, [getPegawai, getBagian]);
  return (
    <div className="mb-8">
      <div className="border-b border-gray-200 dark:border-gray-700 mb-2 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold">Rekap Absen</h2>
        <div className="mb-2">
          <label className="block font-medium mb-1 text-left">Bagian</label>
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
        <div className="mb-2">
          <label className="block font-medium mb-1 text-left">Pegawai</label>
          <ReactSelect
            styles={customSelect}
            value={{
              id: valueSelect?.pegawai,
              label: valueSelect?.pegawaiView,
            }}
            onChange={(e) => handleChange("pegawai", e)}
            className="w-full rounded-lg"
            options={pegawaiSelect}
            placeholder="Pegawai..."
            isClearable
          />
        </div>
        <div className="mb-2">
          <label className="block font-medium mb-1 text-left">Periode</label>
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
        <button
          type="button"
          onClick={() => getRekapLaporan("view")}
          className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
        >
          <EyeOutlined className="me-2" />
          View
        </button>
        <button
          type="button"
          onClick={() => getRekapLaporan("unduh")}
          className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          <DownloadOutlined /> Download
        </button>
      </div>

      <div
        className="relative overflow-x-auto shadow-md rounded-xl"
        style={{ display: datatabel ? "block" : "none" }}
      >
        <p className="whitespace-nowrap">
          *Keterangan: V = Tepat Waktu, TL = Terlambat Masuk, PSW = Pulang
          Sebelum Waktunya, TAM: Tidak Absen Masuk, TAP: Tidak Absen Pulang
        </p>
        <table className="w-full text-sm text-center text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-black font-bold uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" rowSpan={2} className="py-4 px-2 border-1">
                No
              </th>
              <th scope="col" rowSpan={2} className="py-4 px-2 border-1">
                Nama
              </th>
              <th
                scope="col"
                colSpan={tanggalan?.length}
                className="py-2 px-2 border-1"
              >
                {valueSelect.bulanView + " " + valueSelect.tahun}
              </th>
            </tr>
            <tr>
              {tanggalan
                ? tanggalan?.map((item) => (
                    <th
                      scope="col"
                      key={item}
                      className={
                        "py-2 px-2 w-11 border-1 text-center " +
                        (cekGanjil(item) ? "bg-gray-100" : "")
                      }
                    >
                      {item}
                    </th>
                  ))
                : ""}
            </tr>
          </thead>
          <tbody>
            {datatabel
              ? datatabel?.map((tab, index) => (
                  <tr
                    key={index}
                    className={
                      cekGanjil(index)
                        ? "odd:bg-white odd:dark:bg-gray-900 text-black even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                        : "odd:bg-white odd:dark:bg-gray-900 text-black even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                    }
                  >
                    <td className="border-1">{index + 1}</td>
                    <td
                      className={
                        "text-left px-1 py-1 font-medium border-1 text-gray-900 whitespace-nowrap" +
                        (cekGanjil(index) ? " bg-gray-100" : "")
                      }
                    >
                      {(pegawaiSelect
                        ? pegawaiSelect?.find((e) => e.nip == tab[0])?.label
                        : user?.nama
                      )?.toUpperCase()}
                    </td>
                    {/* <td className={'text-left px-1 py-1 font-medium border-1 text-gray-900 whitespace-nowrap' + (cekGanjil(index) ? " bg-gray-100" : "")}>{tab[0]}</td> */}
                    {tanggalan
                      ? tanggalan?.map((item) => (
                          <td
                            key={item}
                            className={
                              "px-1 text-center py-1 border-1 whitespace-nowrap " +
                              (!(
                                new Date(
                                  valueSelect.tahun +
                                    "-" +
                                    valueSelect.bulan +
                                    "-" +
                                    ("0" + item).substring(-2)
                                ).getDay() % 6
                              )
                                ? " bg-gray-300"
                                : uiLap(tab[1][item])?.css)
                            }
                          >
                            {tab[1][item]
                              ? uiLap(tab[1][item])?.text
                              : !(
                                  new Date(
                                    valueSelect.tahun +
                                      "-" +
                                      valueSelect.bulan +
                                      "-" +
                                      ("0" + item).substring(-2)
                                  ).getDay() % 6
                                )
                              ? ""
                              : "TA"}
                          </td>
                        ))
                      : ""}
                  </tr>
                ))
              : ""}
          </tbody>
        </table>
      </div>
    </div>
  );
}
