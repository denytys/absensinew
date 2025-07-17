import {
  HomeOutlined,
  HistoryOutlined,
  FormOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-100/75 p-2">
      <div className="flex justify-around text-center text-sm text-gray-600">
        <a
          href="/home"
          className="hover:text-black rounded-full w-12 h-12 flex flex-col items-center justify-center"
          title="Home"
        >
          <HomeOutlined className="text-lg transition-transform duration-400 hover:scale-165 cursor-pointer" />
          <p className="text-xs mt-1">home</p>
        </a>
        <a
          href="/riwayat"
          className="hover:text-black rounded-full w-12 h-12 flex flex-col items-center justify-center"
          title="Riwayat Absen"
        >
          <HistoryOutlined className="text-lg transition-transform duration-400 hover:scale-165 cursor-pointer" />
          <p className="text-xs mt-1">riwayat</p>
        </a>
        <a
          href="/izin"
          className="hover:text-black rounded-full w-12 h-12 flex flex-col items-center justify-center"
          title="Input Perijinan"
        >
          <FormOutlined className="text-lg transition-transform duration-400 hover:scale-165 cursor-pointer" />
          <p className="text-xs mt-1">perizinan</p>
        </a>
        <a
          href="/wfa"
          className="hover:text-black rounded-full w-12 h-12 flex flex-col items-center justify-center"
          title="Laporan WFA"
        >
          <FileTextOutlined className="text-lg transition-transform duration-400 hover:scale-165 cursor-pointer" />
          <p className="text-xs mt-1">lap wfa</p>
        </a>
      </div>
    </footer>
  );
}
