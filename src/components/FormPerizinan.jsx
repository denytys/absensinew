import { useState, useRef, useEffect, useCallback } from "react";
import { Form, Input, Select, Button, DatePicker, Upload, message } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  UploadOutlined,
  CameraOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { decodeCookies } from "../helper/parsingCookies";
import "react-datepicker/dist/react-datepicker.css";
import { Toaster, toast } from "react-hot-toast";

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
  const [jenis, setJenis] = useState("Dinas Luar");
  const [nomor, setNomor] = useState("");
  const [tanggalAwal, setTanggalAwal] = useState(null);
  const [tanggalAkhir, setTanggalAkhir] = useState(null);
  const [perihal, setPerihal] = useState("");
  const [lampiran, setLampiran] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [perizinanList, setPerizinanList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [filterTanggal, setFilterTanggal] = useState(null); // [start, end]
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

  const handleFileChange = (info) => {
    const file = info.file.originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageData(reader.result);
        setLampiran(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchPerizinan = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ABSEN_BE}/perizinan?nip=${user.nip}`
      );
      setPerizinanList(res.data.data);
    } catch (err) {
      if (import.meta.env.MODE === "development") {
        console.error("Gagal mengambil data perizinan:", err);
      }
    }
  }, [user.nip]);

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!lampiran) {
      message.warning("Silakan ambil foto atau upload file terlebih dahulu.");
      setIsLoading(false);
      return;
    }

    const payload = {
      nomor,
      perihal,
      jenis_izin: jenis,
      tgl_mulai: tanggalAwal?.toISOString().slice(0, 10),
      tgl_selesai: tanggalAkhir?.toISOString().slice(0, 10),
      p_upt: user.upt_id,
      p_bagian: user.bagian_id,
      user_input: user.nama,
      nip: user.nip,
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const fileToUpload =
      typeof lampiran === "string"
        ? dataURLtoFile(lampiran, "lampiran.png")
        : lampiran;

    formData.append("lampiran", fileToUpload);

    try {
      await axios.post(`${import.meta.env.VITE_ABSEN_BE}/perizinan`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Data berhasil disimpan");
      await fetchPerizinan();
    } catch (err) {
      if (import.meta.env.MODE === "development") {
        console.error("Gagal simpan:", err);
      }
      toast.error("Gagal menyimpan data");
    } finally {
      setIsLoading(false);
      form.resetFields();
      setNomor("");
      setJenis("Dinas Luar");
      setTanggalAwal(null);
      setTanggalAkhir(null);
      setPerihal("");
      setLampiran(null);
      setImageData(null);
    }
  };

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
      <Toaster position="top-right" reverseOrder={false} />
      {/* Form */}
      <div className="bg-white/70 shadow-md rounded-xl p-6 mb-6">
        {/* backdrop-blur-md  */}
        <h2 className="text-lg font-bold mb-4">Form Input Perizinan</h2>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{ jenis: "Dinas Luar" }}
          className="text-start"
        >
          <Form.Item
            label="Jenis Izin"
            name="jenis"
            rules={[{ required: true }]}
          >
            <Select value={jenis} onChange={(value) => setJenis(value)}>
              <Option value="Dinas Luar">Dinas Luar</Option>
              <Option value="Cuti Tahunan">Cuti Tahunan</Option>
              <Option value="Cuti Sakit">Cuti Sakit</Option>
              <Option value="Cuti Besar">Cuti Besar</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Nomor" name="nomor">
            <Input
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              placeholder="Masukkan nomor surat"
              // style={{
              //   backgroundColor: "rgba(255, 255, 255, 0.8)",
              //   borderColor: "white",
              // }}
            />
          </Form.Item>

          <Form.Item
            label="Tanggal"
            name="tanggal"
            rules={[{ required: false }]}
          >
            <div className="flex flex-row gap-2 md:gap-4">
              <DatePicker
                placeholder="tgl mulai"
                selected={tanggalAwal}
                onChange={(date) => setTanggalAwal(date)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <DatePicker
                placeholder="tgl selesai"
                selected={tanggalAkhir}
                onChange={(date) => setTanggalAkhir(date)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </Form.Item>

          <Form.Item
            label="Perihal"
            name="perihal"
            rules={[{ required: true }]}
          >
            <TextArea
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              rows={3}
              // style={{
              //   border: "none",
              // }}
            />
          </Form.Item>

          <div className="mb-4">
            <label className="block font-normal mb-1 text-start">Pegawai</label>
            <Input value={user.nama} disabled />
          </div>

          <Form.Item label="Lampiran">
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

                  return false; // prevent automatic upload
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
          {/* <div className="w-40 mb-4">
            <DatePicker.RangePicker
              size="small"
              onChange={(dates) => {
                setFilterTanggal(dates);
                setCurrentPage(1);
              }}
              className="mt-1 w-full"
              allowClear
            />
          </div> */}

          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs uppercase bg-gray-600 text-white">
              <tr>
                <th className="p-2 text-center rounded-s-lg">No</th>
                <th className="p-2 text-start">Nomor Doc</th>
                <th className="p-2 text-center">Jenis</th>
                <th className="p-2 text-center">Tanggal</th>
                <th className="p-2 text-center">Perihal</th>
                <th className="p-2 text-center">Lampiran</th>
                <th className="p-2 text-center">Act</th>
                <th className="p-2 text-center text-gray-600 rounded-r-lg">
                  Act
                </th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="p-1 text-center">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </td>
                  <td className="p-1 text-start">{p.nomor}</td>
                  <td className="p-1 text-center">{p.jenis_izin}</td>
                  <td className="p-1 text-center">
                    {new Date(p.tgl_mulai).toLocaleDateString("id-ID")}-{" "}
                    {new Date(p.tgl_selesai).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-1 text-center">{p.perihal}</td>
                  <td className="p-1 text-center">
                    {p.lampiran ? (
                      <a
                        href={`${import.meta.env.VITE_ABSEN_BE}/uploads/${
                          p.lampiran
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
                      onClick={() => handleEdit(i)}
                      className="bg-amber-500 text-white px-2 py-1 rounded-full hover:bg-amber-600"
                    >
                      <EditOutlined />
                    </button>
                  </td>
                  <td className="p-1 text-center">
                    <button className="bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600">
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
                  className={`px-3 py-2 rounded-full shadow-sm text-xs ${
                    currentPage === page
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
