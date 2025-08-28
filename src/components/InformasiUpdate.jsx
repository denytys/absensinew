import React, { useState } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

export default function InformasiUpdate() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleContent = () => setIsOpen(!isOpen);

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-xl mt-4">
      <div className="bg-none md:bg-white/40 rounded-xl flex items-center justify-center gap-25 py-2 text-gray-700">
        <div className="flex flex-row md:flex-col items-center gap-1">
          <ExclamationCircleOutlined className="text-xl text-red-600" />
          <p className="text-base px-2 rounded">Informasi Update</p>
        </div>
        {/* Tombol toggle hanya tampil di mobile */}
        <button
          className="sm:hidden text-sm md:text-xl"
          onClick={toggleContent}
        >
          {isOpen ? <UpOutlined /> : <DownOutlined />}
        </button>
      </div>

      <div className={`${isOpen ? "block" : "hidden"} sm:block`}>
        <div className="text-left md:text-center pl-4 md:pl-0 pt-2 pb-2">
          <p className="text-xs">Update e-Presensi versi 2</p>
          {/* <p className="text-xs">2. Klik submit = rudal balansik aktif</p>
          <p className="text-xs">3. Gak ngeklik apa-apa gak dapet sepeda</p>
          <p className="text-xs">4. Salah klik = tiup seruling di tugu tani</p> */}
        </div>
      </div>
    </div>
  );
}
