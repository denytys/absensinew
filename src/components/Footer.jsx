export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-blue-500 p-2">
      <div className="flex justify-around text-center text-sm text-gray-600">
        <a
          href="/home"
          className="bg-white text-gray-800 rounded-full shadow w-12 h-12 flex items-center justify-center"
          title="Home"
        >
          <i className="bi bi-house text-xl"></i>
        </a>
        <a
          href="/riwayat"
          className="bg-white text-gray-800 rounded-full shadow w-12 h-12 flex items-center justify-center"
          title="Riwayat Absen"
        >
          <i className="bi bi-clock-history text-xl"></i>
        </a>
        <a
          href="/izin"
          className="bg-white text-gray-800 rounded-full shadow w-12 h-12 flex items-center justify-center"
          title="Input Perijinan"
        >
          <i className="bi bi-pencil-square text-xl"></i>
        </a>
        <a
          href="/wfa"
          className="bg-white text-gray-800 rounded-full shadow w-12 h-12 flex items-center justify-center"
          title="Laporan WFA"
        >
          <i className="bi bi-journal-text text-xl"></i>
        </a>
      </div>
    </footer>
  );
}
