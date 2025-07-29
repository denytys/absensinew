import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Typography,
  Avatar,
  Modal,
  Switch,
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

  useEffect(() => {
    const token = decodeCookies("token");
    if (!token) {
      message.warning("Silakan login terlebih dahulu.");
      navigate("/");
    }

    const userData = decodeCookies("user") || {};
    setNip(userData.nip || "");
    setFotoBase64(userData.foto || "");
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

    // console.log("Data yang dikirim:", {
    //   nip,
    //   foto_base64: fotoBase64,
    //   ...(showPasswordFields && values.passwordbaru
    //     ? {
    //         password_lama: values.passwordlama,
    //         password_baru: values.passwordbaru,
    //       }
    //     : {}),
    // });

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
      <div className="bg-white/45 shadow-md rounded-xl p-6">
        <Title level={4}>Edit Profil</Title>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Upload Foto */}
          <Form.Item label="Upload Foto Profil (masih pengembangan)">
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

          {/* Switch Ubah Password */}
          <Form.Item label="Ingin Ubah Password?">
            <Switch
              checked={showPasswordFields}
              onChange={setShowPasswordFields}
            />
          </Form.Item>

          {/* Form Password (conditional) */}
          {showPasswordFields && (
            <>
              <Form.Item
                label="Password Lama"
                name="passwordlama"
                rules={[{ required: true, message: "Masukkan password lama" }]}
              >
                <Input.Password placeholder="Masukkan password lama" />
              </Form.Item>

              <Form.Item
                label="Password Baru"
                name="passwordbaru"
                dependencies={["passwordlama"]}
                rules={[
                  { required: true, message: "Masukkan password baru" },
                  { min: 6, message: "Minimal 6 karakter" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value === getFieldValue("passwordlama")) {
                        return Promise.reject(
                          new Error(
                            "Password baru tidak boleh sama dengan password lama"
                          )
                        );
                      }
                      const regex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
                      if (!regex.test(value)) {
                        return Promise.reject(
                          new Error("Harus mengandung huruf dan angka")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Masukkan password baru" />
              </Form.Item>

              <Form.Item
                label="Ulangi Password Baru"
                name="ulangipassword"
                dependencies={["passwordbaru"]}
                rules={[
                  { required: true, message: "Ulangi password baru" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || value === getFieldValue("passwordbaru")) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Password tidak cocok dengan yang baru")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Ulangi password baru" />
              </Form.Item>
            </>
          )}

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
