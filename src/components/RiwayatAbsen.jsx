import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Footer from "./Footer";

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
          }));
          setDataAbsen(mapped);
        } else {
          setError(result.message || "Gagal mengambil data.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Terjadi kesalahan saat mengambil data.");
        setLoading(false);
      });
  }, []);

  // Filter berdasarkan tanggal
  const filtered = dataAbsen.filter((item) => {
    const date = new Date(item.tanggal);
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  });

  // Grouping per tanggal
  const grouped = {};
  filtered.forEach((item) => {
    const key = format(new Date(item.tanggal), "yyyy-MM-dd");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <div className="container py-2">
      <div className="glass-card p-4">
        <h5 className="mb-3">RIWAYAT ABSENSI</h5>

        {/* Filter Tanggal */}
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm whitespace-nowrap">
            Pilih Rentang Tanggal:
          </label>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            className="form-control"
            dateFormat="yyyy-MM-dd"
            placeholderText="Pilih tanggal awal dan akhir"
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
                    <table className="ml-4 text-sm w-full max-w-xs table-fixed">
                      <thead>
                        <tr className="text-left text-gray-500"></tr>
                      </thead>
                      <tbody>
                        {grouped[tanggal].map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-1">
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
                            <td className="text-right pr-2 align-middle">
                              {format(new Date(item.tanggal), "HH:mm")}
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
      <Footer />
    </div>
  );
}
