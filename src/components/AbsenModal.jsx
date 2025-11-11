import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { decodeCookies } from "../helper/parsingCookies";
import Swal from "sweetalert2";
import { protectPostPut } from "../helper/axiosHelper";
import DigitalClock from "./DigitalClock";
import { LoadingOutlined } from "@ant-design/icons";
import { Modal, Select } from "antd";

export default function AbsenModal({
  modalAbsen,
  setModalAbsen,
  jenisAbsen,
  location,
  lokasiTerdekat,
  history,
  getHistory
}) {
  let [jenisWf, setJenisWf] = useState("wfo");
  let [isLoading, setIsLoading] = useState(false);
  let [ipaddress, setIpaddress] = useState("0.0.0.0");
  let [idPresensi, setIdPresensi] = useState("");
  let [listIdPresensi, setListIdPresensi] = useState([]);
  const waktu = decodeCookies("waktu");
  const user = decodeCookies("user");

  const onSubmit = async () => {
    // Swal.fire("sedang menyimpan..")
    // Swal.showLoading()
    if (!idPresensi) {
      Swal.fire({
        icon: "warning",
        title: "Gagal absen",
        text: "Mohon pilih jadwal absen",
      })
      return;
    }
    const values = {
      id_user: user?.id_user,
      zona: user?.zona_waktu,
      jenis_presensi: jenisAbsen,
      waktu_presensi_id: idPresensi,
      latitude: location?.lat,
      longitude: location?.lng,
      raw_lokasi: location?.dataLoc,
      lokasi_kantor_id: lokasiTerdekat?.id,
      bagian_id: user?.bagian_id,
      shifting: user?.shifting,
      cek_wfo: jenisWf,
      ipaddress: ipaddress,
    };
    setIsLoading(true);
    try {
      const response = await protectPostPut("post", "/presensi", values);
      Swal.fire({
        icon: "success",
        title: "Berhasil simpan",
        text: response?.data?.message ?? "Berhasil menyimpan data",
      });
      getHistory()
    } catch (err) {
      if (import.meta.env.MODE === "development") {
        console.error("Gagal simpan:", err);
      }
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan",
        text: err.response?.data?.message ?? "Gagal menyimpan data",
      });
    } finally {
      setModalAbsen();
      setIsLoading(false);
    }
  };

  const getIpAddress = useCallback(() => {
    const response = axios.get("https://api.ipify.org/?format=json");
    response
      .then((response) => {
        if (import.meta.env.MODE === "development") {
          console.log("lokasi", response?.data?.ip);
        }
        setIpaddress(response?.data?.ip);
      })
      .catch((err) => {
        if (import.meta.env.MODE === "development") {
          console.log("ip", err);
        }
      });
  }, []);

  useEffect(() => {
    getIpAddress();
  }, [getIpAddress]);

  useEffect(() => {
    if (waktu.length == 1) {
      setIdPresensi(waktu[0]?.id_setting_waktu_presensi)
    } else {
      const sel = waktu?.map((item) => {
        return {
          value: item.id_setting_waktu_presensi,
          label: item.nama_setting + " (" + item.batas_waktu_masuk + " s.d " + item.batas_waktu_pulang + ") ",
          data: item,
        };
      });
      setListIdPresensi(sel)
    }
  }, [waktu]);

  // console.log("history absen", history)
  useEffect(() => {
    if (history) {
      setJenisWf(history.cekwf)
    }
  }, [history])
  return (
    <Modal
      open={modalAbsen}
      centered
      footer={false}
      // onOk={setModalAbsen}
      onCancel={setModalAbsen}
      className="fixed inset-0 z-10 w-screen overflow-y-auto"
    >
      <div className="field-sizing-fixed text-center w-full mt-3">
        <div className="text-2xl text-center font-semibold mb-2 text-gray-900">
          Absensi {jenisAbsen}
        </div>
        <hr className="mb-1" />
        <DigitalClock />
        {waktu?.length > 1 ?
          <div className="mb-2">
            <label className="block font-medium mb-1 text-left">Pilih jadwal shift</label>
            <Select
              showSearch
              allowClear
              value={idPresensi}
              className="w-full text-left"
              placeholder="Jadwal shift..."
              optionFilterProp="label"
              onChange={(e) => setIdPresensi(e)}
              options={listIdPresensi}
            />
          </div>
        : ""}
        {user?.shifting != 'Y' ?
        <fieldset className="flex gap-x-8 my-4">
          <div className="flex items-center gap-x-3">
            <input
              value="wfo"
              onChange={(e) => setJenisWf(e.target.value)}
              id="wfo"
              name="jenisWf"
              checked={jenisWf == "wfo" ? true : false}
              disabled={history && jenisAbsen == 'pulang' ? true : false}
              type="radio"
              className="relative size-4"
            />
            <label
              htmlFor="wfo"
              className="block text-sm/6 font-medium text-gray-900"
            >
              WFO
            </label>
          </div>
          <div className="flex items-center gap-x-3">
            <input
              value="wfa"
              onChange={(e) => setJenisWf(e.target.value)}
              id="wfa"
              name="jenisWf"
              checked={jenisWf == "wfa" ? true : false}
              disabled={history && jenisAbsen == 'pulang' ? true : false}
              type="radio"
              className="relative size-4"
            />
            <label
              htmlFor="wfa"
              className="block text-sm/6 font-medium text-gray-900"
            >
              WFA
            </label>
          </div>
        </fieldset>
        : ""}
        <div className="mt-6 flex items-center gap-x-6">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onSubmit()}
            className="rounded-xl w-full mx-4 bg-emerald-800 py-2 font-semibold text-white disabled:bg-emerald-950 disabled:text-gray-500"
          >
            {isLoading ? <LoadingOutlined className="me-2" /> : ""}
            Submit
          </button>
        </div>
      </div>
    </Modal>
  );
}
