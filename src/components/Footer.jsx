import {
  HomeOutlined,
  HistoryOutlined,
  FormOutlined,
  FileTextOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-100/75 p-2">
      <div className="flex justify-around text-center text-sm text-gray-600">
        <Link
          to="/home"
          className={`hover:text-black ${
            location.pathname == "/home" || location.pathname == ""
              ? "bg-blue-200/60"
              : ""
          } rounded-full w-16 h-16 flex flex-col items-center justify-center`}
          title="Home"
        >
          <HomeOutlined className="text-lg transition-transform duration-400 hover:scale-165 cursor-pointer" />
          <p className="text-xs mt-1">Home</p>
        </Link>
        <Link
          to="/riwayat"
          className={`hover:text-black ${
            location.pathname == "/riwayat" ? "bg-blue-200/60" : ""
          } rounded-full w-16 h-16 flex flex-col items-center justify-center`}
          title="Riwayat Absen"
        >
          <HistoryOutlined className="text-lg transition-transform duration-400 hover:scale-165 cursor-pointer" />
          <p className="text-xs mt-1">Riwayat</p>
        </Link>
        <Link
          to="/izin"
          className={`hover:text-black ${
            location.pathname == "/izin" ? "bg-blue-200/60" : ""
          } rounded-full w-16 h-16 flex flex-col items-center justify-center`}
          title="Input Perijinan"
        >
          <FormOutlined className="text-lg transition-transform duration-400 hover:scale-165 cursor-pointer" />
          <p className="text-xs mt-1">Perizinan</p>
        </Link>
        <Link
          to="/wfa"
          className={`hover:text-black ${
            location.pathname == "/wfa" ? "bg-blue-200/60" : ""
          } rounded-full w-16 h-16 flex flex-col items-center justify-center`}
          title="Laporan WFA"
        >
          <FileTextOutlined className="text-lg transition-transform duration-400 hover:scale-165 cursor-pointer" />
          <p className="text-xs mt-1">Lap wfa</p>
        </Link>
        <Link
          to="/rekap"
          className={`hover:text-black ${
            location.pathname == "/rekap" ? "bg-blue-200/60" : ""
          } 
          rounded-full w-16 h-16 flex flex-col items-center justify-center`}
          title="Rekap"
        >
          <FilePdfOutlined className="text-lg transition-transform duration-400 hover:scale-165 cursor-pointer" />
          <p className="text-xs mt-1">Rekap</p>
        </Link>
      </div>
    </footer>
  );
}
