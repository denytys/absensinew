import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { decodeCookies } from "../helper/parsingCookies";
import Swal from "sweetalert2";
import { protectPostPut } from "../helper/axiosHelper";
import DigitalClock from "./DigitalClock";
import { LoadingOutlined } from "@ant-design/icons";
import { Modal } from "antd";

export default function AbsenModal({
  modalAbsen,
  setModalAbsen,
  jenisAbsen,
  location,
  lokasiTerdekat,
  history
}) {
  let [jenisWf, setJenisWf] = useState("wfo");
  let [isLoading, setIsLoading] = useState(false);
  let [ipaddress, setIpaddress] = useState("0.0.0.0");

  const onSubmit = async () => {
    const user = decodeCookies("user");
    const waktu = decodeCookies("waktu");
    // Swal.fire("sedang menyimpan..")
    // Swal.showLoading()
    const values = {
      id_user: user?.id_user,
      zona: user?.zona_waktu,
      jenis_presensi: jenisAbsen,
      waktu_presensi_id: waktu[0]?.id_setting_waktu_presensi,
      latitude: location?.lat,
      longitude: location?.lng,
      raw_lokasi: location?.dataLoc,
      lokasi_kantor_id: lokasiTerdekat?.id,
      bagian_id: user?.bagian_id,
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
      {/* <Dialog open={modalAbsen || false} onClose={setModalAbsen || false} className="relative z-10"> */}
      {/* <div
        transition
        aria-hidden="true"
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      /> */}

      {/* <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
          <div
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 sm:p-6 sm:pb-4">
              <div className="flex sm:items-start">
                <div className="field-sizing-fixed w-full mt-3 sm:text-left">
                  <div className="text-2xl text-center font-semibold text-gray-900">
                    Absensi {jenisAbsen}
                  </div>
                  <hr className="mb-1" />
                  <DigitalClock />
                  <fieldset className="flex gap-x-8">
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
                      // className="relative size-4  rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                      />
                      <label
                        htmlFor="wfa"
                        className="block text-sm/6 font-medium text-gray-900"
                      >
                        WFA
                      </label>
                    </div>
                  </fieldset>
                  <div className="my-6 flex items-center gap-x-6">
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
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </Modal>
  );
}
