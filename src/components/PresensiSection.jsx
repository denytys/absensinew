import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";

export default function PresensiSection({
  history,
  handlePresensi,
  // sudahMasuk,
  // sudahPulang,
}) {
  return (
    // <div className="bg-white/45 rounded-xl p-3 mb-2">
    <div className="flex gap-4">
      <div className="bg-white/45 rounded-xl w-72 h-28 md:h-auto">
        {/* <a>
          <img src="/images/iconmasuk.png" alt="" className="w-52 h-52 ml-11" />
        </a> */}
        <button
          className="mt-4 md:mt-10 mb-2 md:mb-4 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          onClick={() => handlePresensi("masuk")}
        >
          <span className="inline-flex items-center">
            <LoginOutlined className="mr-2" />
            Masuk
          </span>
        </button>

        <p
          className={
            (history?.presensi_masuk ? "" : "text-red-700 ") + "text-sm"
          }
        >
          {history?.presensi_masuk ? "Sudah absen" : "Belum absen"}
        </p>
        <p className="mb-4 text-sm">
          {history?.presensi_masuk ? history?.presensi_masuk : "-"}
        </p>
      </div>
      <div className="bg-white/45 rounded-xl w-72 h-28 md:h-auto">
        {/* <a>
          <img
            src="/images/iconkeluar.png"
            alt=""
            className="w-52 h-52 ml-11"
          />
        </a> */}
        <button
          className="mt-4 md:mt-10 mb-2 md:mb-4 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={() => handlePresensi("pulang")}
          //   disabled={!sudahMasuk || sudahPulang}
        >
          <span className="inline-flex items-center">
            <LogoutOutlined className="mr-2" />
            Pulang
          </span>
        </button>
        <p
          className={
            (history?.presensi_pulang ? "" : "text-red-700 ") + "text-sm"
          }
        >
          {history?.presensi_pulang ? "Sudah absen" : "Belum absen"}
        </p>
        <p className="mb-4 text-sm">
          {history?.presensi_pulang ? history?.presensi_pulang : "-"}
        </p>
      </div>
    </div>
  );
}
