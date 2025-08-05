import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Upload,
  message,
  Typography,
  Avatar,
  Modal,
  Radio,
  Select,
  Result,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { decodeCookies } from "./helper/parsingCookies";
import axios from "axios";

const { Title } = Typography;

export default function EditProfile() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [nip, setNip] = useState("");
  const [fotoBase64, setFotoBase64] = useState("");
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // useEffect(() => {
  //   const token = decodeCookies("token");
  //   if (!token) {
  //     message.warning("Silakan login terlebih dahulu.");
  //     navigate("/");
  //   }

  //   const userData = decodeCookies("user") || {};
  //   setNip(userData.nip || "");
  //   setFotoBase64(userData.foto || "");
  // }, []);

  useEffect(() => {
    navigate("/maintenance");
  }, []);

  const handleUploadChange = ({ fileList }) => {
    const file = fileList[0]?.originFileObj;
    if (!file) return;

    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      message.error("Ukuran file maksimal 5MB.");
      return;
    }

    setFileList(fileList);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (values) => {
    const token = decodeCookies("token");

    // Validasi manual jika ubah password diaktifkan
    if (showPasswordFields) {
      const { passwordbaru, ulangipassword } = values;
      if (passwordbaru !== ulangipassword) {
        message.error("Ulangi password tidak cocok.");
        return;
      }
      if (!passwordlama || !passwordbaru) {
        message.error("Password lama dan baru harus diisi.");
        return;
      }
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_ABSEN_BE}/auth/reset_password`,
        {
          nip,
          foto_base64: fotoBase64,
          ...(showPasswordFields
            ? {
                password_lama: values.passwordlama,
                password_baru: values.passwordbaru,
              }
            : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.status) {
        const BASE_URL = import.meta.env.VITE_ABSEN_BE;
        const currentUser = JSON.parse(localStorage.getItem("user"));

        // Jika ada avatar baru di response, simpan ke localStorage
        if (res.data.avatar) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...currentUser,
              foto: `${BASE_URL}/${res.data.avatar}`,
            })
          );
        }
        message.success("Profil berhasil diperbarui!");
        setIsModalVisible(true);
      } else {
        message.error(res.data.message || "Gagal memperbarui profil.");
      }
    } catch (err) {
      message.error("Terjadi kesalahan saat menyimpan data.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white/45 shadow-md rounded-xl p-6 mb-30">
        <Title level={4}>Edit Profil</Title>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Upload Foto */}
          <Form.Item label="Upload Foto Profil">
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              fileList={fileList}
              onChange={handleUploadChange}
              accept="image/*"
            >
              {fileList.length >= 1 ? null : (
                <button
                  style={{
                    color: "inherit",
                    cursor: "pointer",
                    border: 0,
                    background: "none",
                  }}
                  type="button"
                >
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              )}
            </Upload>
            {fotoBase64 && (
              <div className="text-center mt-2">
                <Avatar src={fotoBase64} size={96} />
              </div>
            )}
          </Form.Item>

          {/* Zona */}
          <Form.Item label="Zona Nyaman">
            <Radio.Group
              name="radiogroup"
              defaultValue={1}
              style={{ display: "flex", justifyContent: "flex-start" }}
            >
              <Radio value={1}>WIB</Radio>
              <Radio value={2}>WITA</Radio>
              <Radio value={3}>WIT</Radio>
            </Radio.Group>
          </Form.Item>

          {/* UPT */}
          <Form.Item label="Nama UPT" name="UPT" rules={[{ required: false }]}>
            <Select>
              <Option value="Kantor Pusat">Kantor Pusat</Option>
              <Option value="BBKHIT DKI Jakarta">BBKHIT DKI Jakarta</Option>
              <Option value="BBKHIT Jawa Tengah">BBKHIT Jawa Tengah</Option>
              <Option value="BBKHIT Jawa Timur">BBKHIT Jawa Timur</Option>
            </Select>
          </Form.Item>

          {/* LOKASI */}
          <Form.Item
            label="Lokasi Kantor"
            name="Kantor"
            rules={[{ required: false }]}
          >
            <Select>
              <Option value="Kantor Utama">Kantor Utama</Option>
              <Option value="Kantor 1">Kantor 1</Option>
              <Option value="Kantor 2">Kantor 2</Option>
              <Option value="Kantor 3">Kantor 3</Option>
            </Select>
          </Form.Item>

          {/* RULES */}
          <Form.Item label="Bagian" name="Bagian" rules={[{ required: false }]}>
            <Select>
              <Option value="Bagian 1">Bagian 1</Option>
              <Option value="Bagian 2">Bagian 2</Option>
              <Option value="Bagian 3">Bagian 3</Option>
              <Option value="Bagian 4">Bagian 4</Option>
            </Select>
          </Form.Item>

          {/* Jabatan */}
          <Form.Item
            label="Jabatan"
            name="Jabatan"
            rules={[{ required: false }]}
          >
            <Select>
              <Option value="Bagian 1">Bagian 1</Option>
              <Option value="Bagian 2">Bagian 2</Option>
              <Option value="Bagian 3">Bagian 3</Option>
              <Option value="Bagian 4">Bagian 4</Option>
            </Select>
          </Form.Item>

          {/* Role */}
          <Form.Item label="Role" name="Role" rules={[{ required: false }]}>
            <Select
              mode="multiple"
              defaultValue={["user"]}
              placeholder="Outlined"
              style={{ flex: 1 }}
              options={[
                { value: "user", label: "User" },
                { value: "admin kepegawaian", label: "Admin Kepegawaian" },
                { value: "tata usaha", label: "Tata Usaha" },
              ]}
            />
          </Form.Item>

          {/* Tombol Aksi */}
          <Form.Item className="text-end mt-6">
            <Button
              onClick={() => navigate("/home")}
              style={{ marginRight: 8 }}
            >
              Batal
            </Button>
            <Button type="primary" htmlType="submit">
              Simpan
            </Button>
          </Form.Item>
        </Form>

        <Modal
          open={isModalVisible}
          footer={null}
          closable={false}
          centered
          width={400}
        >
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p style={{ fontSize: "18px", marginBottom: 24 }}>
              Profil berhasil diperbarui!
            </p>
            <Button type="primary" onClick={() => navigate("/login")}>
              Tutup
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
