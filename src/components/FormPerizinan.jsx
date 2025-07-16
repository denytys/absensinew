import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Footer from "./Footer";
import axios from "axios";
import { decodeCookies } from "../helper/parsingCookies";

export default function FormPerizinan() {
  const user = decodeCookies("user");
  const [jenis, setJenis] = useState("Dinas Luar");
  const [nomor, setNomor] = useState("");
  const [tanggalAwal, setTanggalAwal] = useState(new Date());
  const [tanggalAkhir, setTanggalAkhir] = useState(new Date());
  const [perihal, setPerihal] = useState("");
  const [lampiran, setLampiran] = useState(null);
  const [lampiranMode, setLampiranMode] = useState("file");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [permissionPrompt, setPermissionPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [perizinanList, setPerizinanList] = useState(
    () => JSON.parse(sessionStorage.getItem("perizinanList")) || []
  );

  const handleEdit = (index) => {
    const perizinan = perizinanList[index];
    setEditIndex(index); // Menyimpan index item yang sedang diedit
    setNomor(perizinan.nomor || "");
    setJenis(perizinan.jenis);
    setTanggalAwal(new Date(perizinan.tanggalAwal));
    setTanggalAkhir(new Date(perizinan.tanggalAkhir));
    setPerihal(perizinan.perihal);
    setLampiran(perizinan.lampiran);
    setLampiranMode("file"); // Sesuaikan jika lampiran berupa file atau kamera
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setLampiran(file);
    setIsCameraActive(false);
  };

  const startCamera = () => {
    setIsCameraActive(true);
    setPermissionPrompt(false);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraPermissionDenied(false);
        }
      })
      .catch((err) => {
        console.error("Error accessing camera:", err);
        setCameraPermissionDenied(true);
        setPermissionPrompt(true);
      });
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      const imgURL = canvasRef.current.toDataURL("image/png");
      setImageData(imgURL);
      setLampiran(imgURL);
      setIsCameraActive(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // mulai loading

    const formData = new FormData();
    formData.append("nomor", nomor);
    formData.append("perihal", perihal);
    formData.append("jenis_izin", jenis);
    formData.append("tgl_mulai", tanggalAwal.toISOString().slice(0, 10));
    formData.append("tgl_selesai", tanggalAkhir.toISOString().slice(0, 10));
    formData.append("p_upt", user.upt_id);
    formData.append("p_bagian", "Bagian Umum");
    formData.append("lampiran", lampiran);
    formData.append("user_input", user.nama);
    formData.append("nip", user.nip);
    formData.append("p_bagian", user.bagian_id);

    try {
      await axios.post(import.meta.env.VITE_ABSEN_BE + "/perizinan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (editIndex !== null) {
        const updatedPerizinanList = [...perizinanList];
        updatedPerizinanList[editIndex] = {
          ...updatedPerizinanList[editIndex],
          nama: user.nama,
          nomor,
          jenis,
          tanggalAwal,
          tanggalAkhir,
          perihal,
          lampiran: lampiran ? lampiran.name || lampiran : "-",
        };

        setPerizinanList(updatedPerizinanList);
        sessionStorage.setItem(
          "perizinanList",
          JSON.stringify(updatedPerizinanList)
        );

        alert("Data berhasil diperbarui");
      } else {
        // Jika form masih baru (bukan edit)
        const newPerizinan = {
          nama: user.nama,
          nomor,
          jenis,
          tanggalAwal,
          tanggalAkhir,
          perihal,
          lampiran: lampiran ? lampiran.name || lampiran : "-",
        };

        const updatedPerizinanList = [...perizinanList, newPerizinan];
        setPerizinanList(updatedPerizinanList);
        sessionStorage.setItem(
          "perizinanList",
          JSON.stringify(updatedPerizinanList)
        );

        alert("Data berhasil disimpan");
      }
    } catch (err) {
      console.error("Gagal simpan:", err.response?.data || err.message);
      alert("Gagal menyimpan data");
    } finally {
      setIsLoading(false); // selesai loading
      setEditIndex(null); // Reset edit mode

      // Reset form setelah submit/edit berhasil
      setJenis("Dinas Luar");
      setTanggalAwal(new Date());
      setTanggalAkhir(new Date());
      setPerihal("");
      setLampiran(null);
      setLampiranMode("file");
      setNomor("");
    }
  };

  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (lampiranMode === "camera") startCamera();
  }, [lampiranMode]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Form */}
      <div className="bg-white/85 shadow-md rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Form Input Perizinan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jenis */}
          <div>
            <label className="block font-medium mb-1 text-left">
              Jenis Izin
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
            >
              <option value="Dinas Luar">Dinas Luar</option>
              <option value="Cuti Tahunan">Cuti Tahunan</option>
              <option value="Cuti Sakit">Cuti Sakit</option>
              <option value="Cuti Besar">Cuti Besar</option>
            </select>
          </div>

          {/* Nomor */}
          <div>
            <label className="block font-medium mb-1 text-left">Nomor</label>
            <input
              type="text"
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Masukkan nomor surat atau referensi"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="block font-medium mb-1 text-left">Tanggal</label>
            <div className="flex gap-2">
              <DatePicker
                selected={tanggalAwal}
                onChange={(date) => setTanggalAwal(date)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <DatePicker
                selected={tanggalAkhir}
                onChange={(date) => setTanggalAkhir(date)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Perihal */}
          <div>
            <label className="block font-medium mb-1 text-left">Perihal</label>
            <textarea
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              rows="3"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Pegawai */}
          <div>
            <label className="block font-medium mb-1 text-left">Pegawai</label>
            <input
              type="text"
              value={user.nama}
              disabled
              className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2"
            />
          </div>

          {/* Lampiran */}
          <div>
            <label className="block font-medium mb-1 text-left">Lampiran</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={lampiranMode}
              onChange={(e) => {
                setLampiranMode(e.target.value);
                setImageData(null);
                setLampiran(null);
                setPermissionPrompt(false);
              }}
            >
              <option value="kosong">---</option>
              <option value="camera">Open Kamera</option>
              <option value="file">Unggah File</option>
            </select>

            {lampiranMode === "camera" && (
              <div className="space-y-2">
                {isCameraActive ? (
                  <div className="flex flex-col items-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="rounded-lg border border-gray-300 w-full"
                    />
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Capture Photo
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Kamera sedang dimuat...
                  </p>
                )}
              </div>
            )}

            {lampiranMode === "file" && (
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            )}

            {/* {lampiran && (
              <div className="mt-4">
                <p className="font-semibold">Preview Lampiran:</p>
                {imageData ? (
                  <img
                    src={imageData}
                    alt="Lampiran"
                    className="max-w-full rounded-lg mt-2"
                  />
                ) : (
                  <p className="text-sm mt-2">{lampiran.name}</p>
                )}
              </div>
            )} */}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {isLoading ? (
              <button
                disabled
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
              >
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 me-3 text-white animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
                Submit
              </button>
            ) : (
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setJenis("Dinas Luar");
                setTanggalAwal(new Date());
                setTanggalAkhir(new Date());
                setPerihal("");
                setLampiran(null);
                setImageData(null);
                setIsCameraActive(false);
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Permission Warning */}
      {permissionPrompt && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4">
          Untuk menggunakan kamera, aktifkan izin kamera di browser Anda.
        </div>
      )}

      {/* Riwayat Table */}
      <div className="bg-white/85 shadow-md rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Riwayat Perizinan</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                {/* <th className="p-2 text-center">Nama</th> */}
                <th className="p-2 text-center">Nomor</th>
                <th className="p-2 text-center">Jenis</th>
                <th className="p-2 text-center">Tanggal</th>
                <th className="p-2 text-center">Perihal</th>
                <th className="p-2 text-center">Lampiran</th>
                <th className="p-2 text-center">Act</th>
              </tr>
            </thead>
            <tbody>
              {perizinanList.map((p, i) => (
                <tr key={i} className="border-b">
                  {/* <td className="p-2 text-center">{p.nama}</td> */}
                  <td className="p-2 text-center">{p.nomor}</td>
                  <td className="p-2 text-center">{p.jenis}</td>
                  <td className="p-2 text-center">
                    {new Date(p.tanggalAwal).toLocaleDateString("id-ID")} -{" "}
                    {new Date(p.tanggalAkhir).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-2 text-center">{p.perihal}</td>
                  <td className="p-2 text-center">{p.lampiran || "-"}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleEdit(i)} // Menyertakan index saat tombol edit diklik
                      className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
