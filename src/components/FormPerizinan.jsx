export default function FormPerizinan() {
  return (
    <div className="container mt-4">
      <div className="glass-card p-4">
        <h3 className="mb-3">Form Perizinan</h3>
        <textarea
          className="form-control mb-3"
          rows="4"
          placeholder="Tulis alasan izin..."
        ></textarea>
        <button className="btn btn-primary">Kirim</button>
      </div>
    </div>
  );
}
