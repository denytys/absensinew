import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

export default function FormPerizinan() {
  const user = JSON.parse(localStorage.getItem("user")) || { nama: "Anoman" };

  const [jenis, setJenis] = useState("Dinas Luar");
  const [tanggalAwal, setTanggalAwal] = useState(new Date());
  const [tanggalAkhir, setTanggalAkhir] = useState(new Date());
  const [perihal, setPerihal] = useState("");
  const [lampiran, setLampiran] = useState(null);
  const [lampiranMode, setLampiranMode] = useState("file"); // Default mode adalah 'file'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [permissionPrompt, setPermissionPrompt] = useState(false);

  // Refs untuk video dan canvas
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [perizinanList, setPerizinanList] = useState(
    () => JSON.parse(sessionStorage.getItem("perizinanList")) || []
  );

  // Handle file change (upload file)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setLampiran(file);
    setIsCameraActive(false); // Menonaktifkan kamera jika file diupload
  };

  // Handle camera activation
  const startCamera = () => {
    setIsCameraActive(true);
    setPermissionPrompt(false); // Menghilangkan prompt permission

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraPermissionDenied(false); // Izin kamera diberikan
        }
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
        setCameraPermissionDenied(true); // Izin kamera ditolak
        setPermissionPrompt(true); // Tampilkan prompt untuk meminta izin
      });
  };

  // Capture photo from the camera
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

      // Get the image from canvas
      const imgURL = canvasRef.current.toDataURL("image/png");
      setImageData(imgURL);
      setLampiran(imgURL); // Set image data as lampiran
      setIsCameraActive(false); // Stop the camera
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nomor", Date.now()); // atau generate lebih rapi
    formData.append("perihal", perihal);
    formData.append("jenis_izin", jenis);
    formData.append("tgl_mulai", tanggalAwal.toISOString().slice(0, 10));
    formData.append("tgl_selesai", tanggalAkhir.toISOString().slice(0, 10));
    formData.append("p_upt", "UPT Jakarta"); // opsional, bisa disesuaikan
    formData.append("p_bagian", "Bagian Umum");
    formData.append("lampiran", lampiran);
    formData.append("user_input", user.nama);

    try {
      const res = await axios.post(
        "http://localhost/presensi/perizinan", // Ganti sesuai URL backend kamu
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Data berhasil disimpan ke backend");
    } catch (err) {
      console.error("Gagal simpan:", err);
      alert("Gagal menyimpan data ke server");
    }
  };

  useEffect(() => {
    return () => {
      // Stop camera when the component is unmounted or camera is disabled
      const stream = videoRef.current?.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Start camera automatically when the lampiranMode is set to "camera"
    if (lampiranMode === "camera") {
      startCamera();
    }
  }, [lampiranMode]);

  return (
    <div className="container py-2">
      <div className="bg-white bg-opacity-50 rounded-xl p-3 mb-4">
        <h4>FORM INPUT PERIZINAN</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Jenis Izin</label>
            <select
              className="form-select"
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
            >
              <option value="Dinas Luar">Dinas Luar</option>
              <option value="Cuti Tahunan">Cuti Tahunan</option>
              <option value="Cuti Sakit">Cuti Sakit</option>
              <option value="Cuti Besar">Cuti Besar</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Tanggal</label>
            <div className="d-flex gap-2">
              <DatePicker
                selected={tanggalAwal}
                onChange={(date) => setTanggalAwal(date)}
                className="form-control"
              />
              <DatePicker
                selected={tanggalAkhir}
                onChange={(date) => setTanggalAkhir(date)}
                className="form-control"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Perihal</label>
            <textarea
              className="form-control"
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              rows={3}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Pegawai</label>
            <input
              type="text"
              className="form-control"
              value={user.nama}
              disabled
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Lampiran</label>
            <select
              className="form-select"
              value={lampiranMode}
              onChange={(e) => {
                setLampiranMode(e.target.value);
                setImageData(null); // Clear the image data if mode changes
                setLampiran(null); // Clear the lampiran if mode changes
                setPermissionPrompt(false); // Reset permission prompt
              }}
            >
              <option value="kosong">---</option>
              <option value="camera">Open Kamera</option>
              <option value="file">Unggah File</option>
            </select>

            {lampiranMode === "camera" && (
              <div>
                {/* Camera Preview */}
                {isCameraActive ? (
                  <div>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      width="100%"
                      height="auto"
                      style={{ borderRadius: "8px", marginBottom: "10px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={capturePhoto}
                    >
                      Capture Photo
                    </button>
                  </div>
                ) : (
                  <p>kamera sedang dimuat...</p>
                )}
              </div>
            )}

            {lampiranMode === "file" && (
              <div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="form-control"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {lampiran && (
              <div className="mt-3">
                <h5>Preview Lampiran</h5>
                {imageData ? (
                  <img
                    src={imageData}
                    alt="Captured"
                    style={{ maxWidth: "100%" }}
                  />
                ) : (
                  <p>{lampiran?.name}</p>
                )}
              </div>
            )}
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setJenis("Dinas Luar");
                setTanggalAwal(new Date());
                setTanggalAkhir(new Date());
                setPerihal("");
                setLampiran(null);
                setImageData(null);
                setIsCameraActive(false); // Stop camera
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Pop-up permintaan izin kamera */}
      {permissionPrompt && (
        <div className="alert alert-warning mt-3" role="alert">
          Untuk menggunakan kamera, Anda harus memberikan izin. Harap aktifkan
          izin kamera pada browser.
        </div>
      )}

      <div className="bg-white bg-opacity-50 rounded-xl p-4">
        <h5 className="mb-3">RIWAYAT PERIZINAN</h5>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="p-2 text-center">Nama</th>
                <th className="p-2 text-center">Jenis</th>
                <th className="p-2 text-center">Tanggal</th>
                <th className="p-2 text-center">Perihal</th>
                <th className="p-2 text-center">Lampiran</th>
              </tr>
            </thead>
            <tbody>
              {perizinanList.map((p) => (
                <tr key={p.id}>
                  <td className="p-2 text-center">{p.nama}</td>
                  <td className="p-2 text-center">{p.jenis}</td>
                  <td className="p-2 text-center">
                    {new Date(p.tanggalAwal).toLocaleDateString("id-ID")} -{" "}
                    {new Date(p.tanggalAkhir).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-2 text-center">{p.perihal}</td>
                  <td className="p-2 text-center">{p.lampiran || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
