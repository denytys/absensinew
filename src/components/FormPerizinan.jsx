import { useState, useRef, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Upload,
  message,
  Modal,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  UploadOutlined,
  CameraOutlined,
  SearchOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { decodeCookies } from "../helper/parsingCookies";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { protectPostPut } from "../helper/axiosHelper";
import Swal from "sweetalert2";

const { Option } = Select;
const { TextArea } = Input;

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

export default function FormPerizinan() {
  const user = decodeCookies("user");
  const [form] = Form.useForm();
  let [jenis, setJenis] = useState("1");
  let [nomor, setNomor] = useState("");
  let [tanggalAwal, setTanggalAwal] = useState(null);
  let [tanggalAkhir, setTanggalAkhir] = useState(null);
  let [perihal, setPerihal] = useState("");
  let [lampiran, setLampiran] = useState(null);
  let [idFrom, setIdFrom] = useState("");
  let [imageData, setImageData] = useState(null);
  let [isCameraActive, setIsCameraActive] = useState(false);
  let [isLoading, setIsLoading] = useState(false);
  let [perizinanList, setPerizinanList] = useState([]);
  let [currentPage, setCurrentPage] = useState(1);
  let [searchText, setSearchText] = useState("");
  let [filterTanggal, setFilterTanggal] = useState(null);
  let [openDeleteModal, setOpenDeleteModal] = useState(false);
  let [linkUploadExist, setLinkUploadExist] = useState("");
  let [selectedId, setSelectedId] = useState(null);
  let [messageApi, contextHolder] = message.useMessage();
  let [modal, contextHolderModal] = Modal.useModal(); // untuk notifikasi sukses

  const itemsPerPage = 5;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = () => {
    setIsCameraActive(true);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        if (import.meta.env.MODE === "development") {
          console.error("Gagal mengakses kamera:", err);
          message.error("Gagal mengakses kamera");
        }
      });
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imgURL = canvasRef.current.toDataURL("image/png");
      setImageData(imgURL);
      setLampiran(imgURL);
      setIsCameraActive(false);
      const tracks = videoRef.current?.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
    }
  };

  const fetchPerizinan = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ABSEN_BE}/perizinan?ui=${user.id_user}`
      );
      setPerizinanList(res.data.data);
    } catch (err) {
      if (import.meta.env.MODE === "development") {
        console.error("Gagal mengambil data perizinan:", err);
      }
    }
  }, [user.id_user]);

  const MASTER_IZIN = [
    { id: 1, kode: "DL", deskripsi: "Dinas Luar" },
    { id: 2, kode: "CT", deskripsi: "Cuti Tahunan" },
    { id: 3, kode: "CS", deskripsi: "Cuti Sakit" },
    { id: 4, kode: "CB", deskripsi: "Cuti Besar" },
    { id: 5, kode: "CP", deskripsi: "Cuti Alasan Penting" },
    { id: 6, kode: "CM", deskripsi: "Cuti Melahirkan" },
  ];

  const handleSubmit = async (values) => {
    setIsLoading(true);
    const payload = {
      nomor,
      perihal,
      jenis_izin: jenis,
      tgl_mulai: tanggalAwal,
      tgl_selesai: tanggalAkhir,
      p_upt: user.upt_id,
      p_bagian: user.bagian_id,
      user_input: user.id_user,
      nip: user.nip,
    };
    if (idFrom) {
      payload['id'] = idFrom
    }

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (lampiran) {
      const fileToUpload = (lampiran == "yanglama" ? lampiran :
        (typeof lampiran === "string"
          ? dataURLtoFile(lampiran, "lampiran.png")
          : lampiran)
      )

      formData.append("lampiran", fileToUpload);
    } else if (values.lampiran_lama) {
      formData.append("lampiran_lama", values.lampiran_lama);
    } else {
      message.warning("Silakan unggah atau ambil foto terlebih dahulu.");
      setIsLoading(false);
      return;
    }

    try {
      // return;
      const res = await axios.post(
        `${import.meta.env.VITE_ABSEN_BE}/perizinan`,
        formData
      );

      if (res.data?.status === true) {
        showSuccessModal();

        message.success("Perizinan berhasil disimpan");
        form.resetFields();
        setNomor("");
        setPerihal("");
        setTanggalAwal(null);
        setTanggalAkhir(null);
        setLampiran(null);
        setImageData(null);
        setIdFrom("")
        fetchPerizinan();
      } else {
        message.error("Gagal menyimpan perizinan.");
      }
    } catch (err) {
      if (import.meta.env.MODE === "development") {
        console.error("Gagal submit:", err);
      }
      message.error("Terjadi kesalahan saat mengirim data.");
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessModal = () => {
    let secondsToGo = 3;
    const instance = modal.success({
      title: "Berhasil Disimpan",
      content: `Form perizinan berhasil disimpan. Modal ini akan tertutup dalam ${secondsToGo} detik.`,
    });

    const timer = setInterval(() => {
      secondsToGo -= 1;
      instance.update({
        content: `Form perizinan berhasil disimpan. Modal ini akan tertutup dalam ${secondsToGo} detik.`,
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };

  const handleDelete = (id) => {
    setSelectedId(id);
    setOpenDeleteModal(true);
  };

  const cekNomorDL = () => {
    const payload = {
      nomor: nomor
    }
    protectPostPut('post', '/perizinan/getByNomor', payload)
      .then((response) => {
        // console.log("response izin", response)
        const izin = response.data.data
        // console.log("izin", izin)
        setPerihal(izin.perihal)
        setIdFrom(izin.id)
        setLampiran("yanglama")
        setLinkUploadExist(`${import.meta.env.VITE_ABSEN_BE}/uploads/${izin.lampiran}`)
        setTanggalAwal(izin.tgl_mulai)
        setTanggalAkhir(izin.tgl_selesai)
      })
      .catch((error) => {
        // console.log("error izin", error)
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        if (error?.response?.status == 404) {
          Toast.fire({
            icon: "success",
            title: "Surat nomor " + nomor + " belum pernah diupload"
          });
        } else {
          Toast.fire({
            icon: "error",
            title: "Terjadi kesalahan saat cek nomor"
          });
        }
      })
  }

  useEffect(() => {
    fetchPerizinan();
  }, [fetchPerizinan]);

  const filteredItems = perizinanList.filter((item) => {
    const searchLower = searchText.toLowerCase();
    const matchSearch =
      item.nomor?.toLowerCase().includes(searchLower) ||
      item.perihal?.toLowerCase().includes(searchLower);

    let matchTanggal = true;
    if (filterTanggal && filterTanggal.length === 2) {
      const itemStart = new Date(item.tgl_mulai);
      const itemEnd = new Date(item.tgl_selesai);
      matchTanggal =
        itemStart >= filterTanggal[0].startOf("day").toDate() &&
        itemEnd <= filterTanggal[1].endOf("day").toDate();
    }

    return matchSearch && matchTanggal;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="mx-auto p-1">
      {contextHolderModal}
      <Modal
        open={openDeleteModal}
        footer={null}
        onCancel={() => setOpenDeleteModal(false)}
        centered
        closable={false}
        width="100%"
        style={{ maxWidth: 300, padding: "0 20px", margin: "0 8px" }}
      >
        {contextHolder}
        <div className="flex items-start space-x-3">
          <ExclamationCircleOutlined
            style={{ color: "#DC2525" }}
            className="text-2xl mt-1 mb-4"
          />
          <div>
            <h3 className="font-semibold text-lg mb-1">Hapus Riwayat Ini?</h3>
            <p>ini akan menghapus data secara permanen</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setOpenDeleteModal(false)}
            className="bg-blue-500 text-white px-4 py-1.5 rounded hover:bg-blue-600"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              const key = "deleteStatus";
              try {
                messageApi.open({
                  key,
                  type: "loading",
                  content: "Menghapus data...",
                });

                await axios.delete(
                  `${import.meta.env.VITE_ABSEN_BE}/perizinan/${selectedId}`
                );

                setTimeout(() => {
                  messageApi.open({
                    key,
                    type: "success",
                    content: "Data berhasil dihapus.",
                    duration: 2,
                  });
                }, 1000);

                fetchPerizinan();
              } catch (error) {
                if (import.meta.env.MODE === "development") {
                  console.error("Gagal menghapus:", error);
                }
                messageApi.open({
                  key,
                  type: "error",
                  content: "Gagal menghapus data.",
                  duration: 2,
                });
              } finally {
                setOpenDeleteModal(false);
              }
            }}
            className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 transition"
          >
            Hapus
          </button>
        </div>
      </Modal>
      {/* Form */}
      <div className="bg-white/70 shadow-md rounded-xl p-6 mb-6">
        {/* backdrop-blur-md  */}
        <h2 className="text-lg font-bold mb-4">Form Input Perizinan</h2>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            jenis: "Dinas Luar",
          }}
          className="text-start"
        >
          <Form.Item
            label="Jenis Izin"
            name="jenis"
          // rules={[{ required: true }]}
          >
            <Select value={jenis} onChange={(value) => setJenis(value)}>
              {MASTER_IZIN.map((izin) => (
                <Select.Option key={izin.id} value={izin.id}>
                  {izin.deskripsi}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Nomor" name="nomor">
            <Input
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              placeholder="Masukkan nomor surat"
              onBlur={() => jenis == 1 ? cekNomorDL() : null}
            />
          </Form.Item>

          {/* tanggal */}
          <div className="flex flex-row gap-2 md:gap-4">
            <Form.Item label="Tanggal Mulai">
              <DatePicker
                value={tanggalAwal ? dayjs(tanggalAwal) : null}
                onChange={(date) =>
                  setTanggalAwal(date?.toDate().toLocaleDateString("en-CA"))
                }
              />
            </Form.Item>

            <Form.Item label="Tanggal Selesai">
              <DatePicker
                value={tanggalAkhir ? dayjs(tanggalAkhir) : null}
                onChange={(date) =>
                  setTanggalAkhir(date?.toDate().toLocaleDateString("en-CA"))
                }
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Perihal"
          // name="perihal"
          // rules={[{ required: true }]}
          >
            <TextArea
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              rows={3}
            />
          </Form.Item>

          <div className="mb-4">
            <label className="block font-normal mb-1 text-start">Pegawai</label>
            <Input value={user.nama} disabled />
          </div>

          <Form.Item label={lampiran == "yanglama" ? "" : "Lampiran"}>
            {lampiran == "yanglama" ? "" :
              <div className="flex gap-2 mb-2">
                <Upload
                  accept="image/*,application/pdf"
                  listType="picture-card"
                  beforeUpload={(file) => {
                    setLampiran(file);

                    if (file.type.startsWith("image/")) {
                      const reader = new FileReader();
                      reader.onload = () => setImageData(reader.result);
                      reader.readAsDataURL(file);
                    } else {
                      setImageData(null);
                    }

                    return false;
                  }}
                  showUploadList={false}
                >
                  <div
                    className="flex flex-col items-center justify-center rounded-md bg-white hover:text-blue-500"
                    style={{
                      width: 100,
                      height: 100,
                    }}
                  >
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>

                <Button
                  icon={<CameraOutlined />}
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center border border-gray-300 rounded-md"
                  style={{
                    width: 100,
                    height: 102,
                  }}
                >
                  Kamera
                </Button>
              </div>
            }

            {isCameraActive && (
              <div className="mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-xs border rounded"
                />
                <Button onClick={capturePhoto} className="mt-2">
                  Capture Photo
                </Button>
              </div>
            )}

            {lampiran && (
              <div className="mt-4">
                <p className="font-semibold">Preview Lampiran:</p>
                {imageData ? (
                  <img
                    src={imageData}
                    alt="Preview"
                    className="max-w-xs border rounded shadow mt-2"
                  />
                ) : (
                  <div className="text-sm mt-2">{lampiran.name}</div>
                )}
                {linkUploadExist ? <a href={linkUploadExist} target="_blank">[View]</a> : ""}
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </Form.Item>

          <div className="flex gap-2">
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Submit
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setLampiran(null);
                setImageData(null);
                setIsCameraActive(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </div>
      {/* Riwayat Table */}
      <div className="bg-white/70 backdrop-blur-md shadow-md rounded-xl p-6 mb-12">
        <h3 className="text-lg font-bold mb-4">Riwayat Perizinan</h3>
        <div className="overflow-x-auto">
          <div className="w-32 md:w-40 mb-4">
            <Input
              placeholder="Cari"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.7)",
              }}
              allowClear
              prefix={<SearchOutlined className="mr-2" />}
              className="w-full sm:w-1/2"
            />
          </div>

          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs uppercase bg-gray-600 text-white">
              <tr>
                <th className="p-2 text-center rounded-s-lg">No</th>
                <th className="p-2 text-start">Nomor Doc</th>
                <th className="p-2 text-center">Jenis</th>
                <th className="p-2 text-center">Tanggal</th>
                <th className="p-2 text-center">Perihal</th>
                <th className="p-2 text-center">Lampiran</th>
                <th className="p-2 text-center rounded-r-lg">Act</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="p-1 text-center">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </td>
                  <td className="p-1 text-start">{p.nomor}</td>
                  <td className="p-1 text-center">{p.jenis_izin_desc}</td>
                  <td className="p-1 text-center">
                    {new Date(p.tgl_mulai).toLocaleDateString("id-ID")}-{" "}
                    {new Date(p.tgl_selesai).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-1 text-center">{p.perihal}</td>
                  <td className="p-1 text-center">
                    {p.lampiran ? (
                      <a
                        href={`${import.meta.env.VITE_ABSEN_BE}/uploads/${p.lampiran
                          }`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 underline"
                      >
                        {p.lampiran}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-1 text-center">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600"
                    >
                      <DeleteOutlined />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-8 space-x-2 items-center mb-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md text-gray-500 disabled:opacity-0 hover:text-black"
            >
              <LeftOutlined />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 3) return true;
                if (currentPage <= 2) return page <= 3;
                if (currentPage >= totalPages - 1)
                  return page >= totalPages - 2;
                return Math.abs(page - currentPage) <= 1;
              })
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-full shadow-sm text-xs ${currentPage === page
                      ? "bg-gray-500 text-white"
                      : "bg-white hover:bg-gray-300 text-gray-500 hover:text-black"
                    }`}
                >
                  {page}
                </button>
              ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs rounded-md text-gray-500 disabled:opacity-0 hover:text-black"
            >
              <RightOutlined />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
