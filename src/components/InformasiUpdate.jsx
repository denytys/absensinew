import React, { useState } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

export default function InformasiUpdate() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleContent = () => setIsOpen(!isOpen);

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-xl mt-4">
      <div className="flex items-center justify-center gap-15 py-2">
        <div className="flex flex-row md:flex-col items-center gap-2">
          <ExclamationCircleOutlined className="text-xl text-red-600" />
          <p className="text-xl px-2 rounded">Informasi Update</p>
        </div>
        {/* Tombol toggle hanya tampil di mobile */}
        <button
          className="sm:hidden text-sm md:text-xl text-gray-700"
          onClick={toggleContent}
        >
          {isOpen ? <UpOutlined /> : <DownOutlined />}
        </button>
      </div>

      <div className={`${isOpen ? "block" : "hidden"} sm:block`}>
        <div className="text-left md:text-center ml-4 md:ml-0 pb-3">
          <p className="text-sm">1. Filter foto biar mirip giring nidji</p>
          <p className="text-sm">2. Klik submit = rudal balansik aktif</p>
          <p className="text-sm">3. Gak ngeklik apa-apa gak dapet sepeda</p>
        </div>
      </div>
    </div>
  );
}
