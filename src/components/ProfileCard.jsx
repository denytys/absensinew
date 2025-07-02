export default function ProfileCard() {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const user = {
    nama: storedUser.nama || "Herman Sekunder",
    nip: storedUser.nip || "199110122015031002",
    kantor: storedUser.kantor || "Kantor Pusat",
    foto: storedUser.foto || "https://via.placeholder.com/80",
  };

  return (
    <div className="card shadow-sm p-3 mb-2 d-flex flex-row align-items-center">
      <img
        src={user.foto}
        alt="Foto Profil"
        className="rounded-circle"
        width="80"
        height="80"
      />
      <div className="ms-3 text-start">
        {" "}
        {/* Tambahkan jarak dan rata kiri */}
        <h5 className="mb-0">{user.nama}</h5>
        <p className="mb-0 text-muted">{user.nip}</p>
        <p className="mb-0 text-muted">{user.kantor}</p>
      </div>
    </div>
  );
}
