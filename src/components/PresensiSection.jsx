export default function PresensiSection({
  presensiList,
  handlePresensi,
  sudahMasuk,
  sudahPulang,
}) {
  return (
    <div className="bg-white/45 rounded-xl p-3 mb-2">
      <div className="flex gap-1 mb-2">
        <button
          className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          onClick={() => handlePresensi("masuk")}
          //   disabled={sudahMasuk}
        >
          Masuk
        </button>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={() => handlePresensi("pulang")}
          //   disabled={!sudahMasuk || sudahPulang}
        >
          Pulang
        </button>
      </div>

      <div style={{ maxHeight: "214px", overflowY: "auto" }}>
        <table className="table table-hover table-borderless table-glass">
          <thead className="table-light">
            <tr>
              <th>Tanggal</th>
              <th>Jam</th>
              <th>Jenis</th>
              <th>Lokasi</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "14px" }}>
            {presensiList.map((p) => {
              const date = new Date(p.waktu_presensi);
              return (
                <tr key={p.id}>
                  <td>{date.toLocaleDateString("id-ID")}</td>
                  <td>
                    {date.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="text-capitalize">{p.jenis}</td>
                  <td>Kantor Utama</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
