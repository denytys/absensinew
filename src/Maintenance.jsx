import React from "react";
import { SmileOutlined } from "@ant-design/icons";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function Maintenance() {
  const navigate = useNavigate();

  return (
    <div className="bg-white/45 shadow-md rounded-xl p-6 mb-30">
      <Result
        icon={<SmileOutlined />}
        title="maaf, halaman ini sedang dalam perbaikan!"
        extra={
          <Button type="primary" onClick={() => navigate("/home")}>
            ← Kembali
          </Button>
        }
      />
    </div>
  );
}
