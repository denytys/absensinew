import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function RiwayatAbsen() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [dataAbsen, setDataAbsen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = 1; // nanti ganti dengan user login

  useEffect(() => {
    fetch(
      `http://localhost/absensi-be/index.php/absen/getRiwayat?user_id=${userId}`
    )
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const mapped = result.data.map((item) => ({
            tanggal: `${item.tanggal}T${item.waktu}`,
            jenis: item.jenis_presensi,
            cekwf: item.cekwf,
          }));
          setDataAbsen(mapped);
        } else {
          setError(result.message || "Gagal mengambil data.");
        }
        setLoading(false);
      })
      .catch((err) => {
        if (import.meta.env.MODE === "development") {
          console.error("Fetch error:", err);
        }
        setError("Terjadi kesalahan saat mengambil data.");
        setLoading(false);
      });
  }, []);

  const filtered = dataAbsen.filter((item) => {
    const date = new Date(item.tanggal);
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  });

  const grouped = {};
  filtered.forEach((item) => {
    const key = format(new Date(item.tanggal), "yyyy-MM-dd");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <div className="container py-2">
      <div className="bg-white/60 shadow-md rounded-xl p-6 mb-6">
        <h5 className="text-lg font-bold  mb-3">RIWAYAT ABSENSI</h5>

        {/* Filter Tanggal */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-sm whitespace-nowrap">
            Pilih Rentang Tanggal:
          </label>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            className="bg-white text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            dateFormat="yyyy-MM-dd"
            placeholderText="tanggal awal dan akhir"
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        {/* Loading */}
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <div className="space-y-4">
            {Object.keys(grouped).length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada riwayat absen.</p>
            ) : (
              Object.keys(grouped)
                .sort((a, b) => new Date(b) - new Date(a))
                .map((tanggal) => (
                  <div key={tanggal} className="border-b pb-2">
                    <p className="font-semibold text-sm text-gray-700 mb-1 text-left">
                      {format(new Date(tanggal), "EEEE, dd MMMM yyyy", {
                        locale: id,
                      })}
                    </p>
                    <table className="ml-4 w-full table-fixed text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="text-left w-1/3">Jenis</th>
                          <th className="text-center w-1/3">Waktu</th>
                          <th className="text-right pr-4 align-middle">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {grouped[tanggal].map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-1 text-left">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    item.jenis === "masuk"
                                      ? "/images/in.svg"
                                      : "/images/out.svg"
                                  }
                                  alt={item.jenis}
                                  className="w-4 h-4"
                                />
                                <span
                                  className={
                                    item.jenis === "masuk"
                                      ? "text-green-500"
                                      : "text-gray-500"
                                  }
                                >
                                  {item.jenis === "masuk" ? "Masuk" : "Pulang"}
                                </span>
                              </div>
                            </td>
                            <td className="text-center align-middle">
                              {format(new Date(item.tanggal), "HH:mm")}
                            </td>
                            <td className="text-right pr-4 align-middle">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  item.cekwf === "wfo"
                                    ? "bg-green-100 text-green-700"
                                    : item.cekwf === "wfa"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {item.cekwf?.toUpperCase() || "-"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
