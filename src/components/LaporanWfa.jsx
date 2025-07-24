import { useEffect, useState } from "react";

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
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white/30 shadow rounded-lg p-6 mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Form Input Laporan WFA
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Judul
            </label>
            <textarea
              className="w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              rows={2}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Uraian Kegiatan
            </label>
            <textarea
              className="w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={kegiatan}
              onChange={(e) => setKegiatan(e.target.value)}
              rows={3}
            ></textarea>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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

      <div className="bg-white/30 shadow rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Riwayat Laporan WFA
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 font-medium">Tanggal</th>
                <th className="px-4 py-2 font-medium">Judul</th>
                <th className="px-4 py-2 font-medium">Uraian Kegiatan</th>
              </tr>
            </thead>
            <tbody className="min-w-full divide-y divide-gray-100">
              {perizinanList.length > 0 ? (
                perizinanList.map((p, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{p.tanggal_lap}</td>
                    <td className="px-4 py-2">{p.judul}</td>
                    <td className="px-4 py-2">{p.uraian}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    Tidak ada data laporan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
