import { useEffect, useState } from "react";
import Footer from "./Footer";

export default function LaporanWfa() {
  const [judul, setJudul] = useState("");
  const [kegiatan, setKegiatan] = useState("");
  const [perizinanList, setPerizinanList] = useState([]);

  const userId = 1;

  useEffect(() => {
    fetch(`http://127.0.0.1/absensi-be/index.php/wfa/get?user_id=${userId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setPerizinanList(result.data);
        } else {
          alert("Gagal ambil data: " + result.message);
        }
      })
      .catch((err) => {
        console.error("Gagal ambil laporan:", err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1/absensi-be/index.php/wfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          judul: judul,
          uraian: kegiatan,
        }),
      });

      const response = await res.json();
      if (response.success) {
        alert("Berhasil disimpan!");
        setJudul("");
        setKegiatan("");

        const r = await fetch(
          `http://127.0.0.1/absensi-be/index.php/wfa/get?user_id=${userId}`
        );
        const rJson = await r.json();
        if (rJson.success) setPerizinanList(rJson.data);
      } else {
        alert("Gagal: " + response.message);
      }
    } catch (error) {
      console.error("Error saat mengirim data:", error);
      alert("Terjadi error saat mengirim data.");
    }
  };
  return (
    <div className="container py-2">
      <div className="glass-card p-3 mb-4">
        <h4>FORM INPUT LAPORAN KEGIATAN WFA</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Judul</label>
            <textarea
              className="form-control"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              rows={2}
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Uraian Kegiatan</label>
            <textarea
              className="form-control"
              value={kegiatan}
              onChange={(e) => setKegiatan(e.target.value)}
              rows={3}
            ></textarea>
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setJudul("");
                setKegiatan("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card p-4">
        <h5>RIWAYAT LAPORAN WFA</h5>
        <table className="table table-glass">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Judul</th>
              <th>Uraian Kegiatan</th>
            </tr>
          </thead>
          <tbody>
            {perizinanList.map((p, index) => (
              <tr key={index}>
                <td>{p.tanggal_lap}</td>
                <td>{p.judul}</td>
                <td>{p.uraian}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Footer />
    </div>
  );
}
