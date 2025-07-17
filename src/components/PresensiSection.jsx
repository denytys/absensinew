export default function PresensiSection({
  presensiList,
  handlePresensi,
  sudahMasuk,
  sudahPulang,
}) {
  return (
    // <div className="bg-white/45 rounded-xl p-3 mb-2">
    <div className="flex gap-4">
      <div className="bg-white/45 rounded-xl w-72 h-32 md:h-auto">
        {/* <a>
          <img src="/images/iconmasuk.png" alt="" className="w-52 h-52 ml-11" />
        </a> */}
        <button
          className="mt-4 md:mt-14 mb-2 md:mb-4 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          onClick={() => handlePresensi("masuk")}
          //   disabled={sudahMasuk}
        >
          Masuk
        </button>
        <p>sudah absen</p>
        <p className="mb-4">07:12</p>
      </div>
      <div className="bg-white/45 rounded-xl w-72 h-32 md:h-auto">
        {/* <a>
          <img
            src="/images/iconkeluar.png"
            alt=""
            className="w-52 h-52 ml-11"
          />
        </a> */}
        <button
          className="mt-4 md:mt-14 mb-2 md:mb-4 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={() => handlePresensi("pulang")}
          //   disabled={!sudahMasuk || sudahPulang}
        >
          Pulang
        </button>
        <p className="text-red-700">belum absen</p>
        <p className="mb-4">-</p>
      </div>
    </div>
  );
}
