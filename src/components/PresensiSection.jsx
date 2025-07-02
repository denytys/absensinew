export default function PresensiSection({
  presensiList,
  handlePresensi,
  sudahMasuk,
  sudahPulang,
}) {
  return (
    <div className="card shadow-sm p-3 mb-2 glass-card">
      <div className="d-flex mb-3">
        <button
          className="btn btn-success me-2"
          onClick={() => handlePresensi("masuk")}
          //   disabled={sudahMasuk}
        >
          Masuk
        </button>
        <button
          className="btn btn-danger"
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
