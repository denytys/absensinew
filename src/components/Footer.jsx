export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-blue-500 p-2">
      <div className="flex justify-around text-center text-sm text-gray-600">
        <a
          href="/home"
          className="bg-white text-gray-800 rounded-full shadow w-12 h-12 flex items-center justify-center"
          title="Home"
        >
          <img src="/images/home.svg" alt="" className="w-6 h-6" />
        </a>
        <a
          href="/riwayat"
          className="bg-white text-gray-800 rounded-full shadow w-12 h-12 flex items-center justify-center"
          title="Riwayat Absen"
        >
          <img src="/images/absen.svg" alt="" className="w-6 h-6" />
        </a>
        <a
          href="/izin"
          className="bg-white text-gray-800 rounded-full shadow w-12 h-12 flex items-center justify-center"
          title="Input Perijinan"
        >
          <img src="/images/ijin.svg" alt="" className="w-6 h-6" />
        </a>
        <a
          href="/wfa"
          className="bg-white text-gray-800 rounded-full shadow w-12 h-12 flex items-center justify-center"
          title="Laporan WFA"
        >
          <img src="/images/wfa.svg" alt="" className="w-6 h-6" />
        </a>
      </div>
    </footer>
  );
}
