import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Upload,
  Typography,
  Avatar,
  Radio,
  Select,
  Col,
  Row,
  Flex,
  Input,
  DatePicker
} from "antd";
const { TextArea } = Input;
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import { decodeCookies } from "./helper/parsingCookies";
import ListUPT from "../src/assets/uptNewGrouping.json";
import WilProvinsi from "../src/assets/wilayah_propinsi.json";
import WilKotaKab from "../src/assets/wilayah_kabupaten.json";
import WilKecamatan from "../src/assets/wilayah_kecamatan.json";
import WilKelurahan from "../src/assets/wilayah_kelurahan.json";
import { protectGet, protectPostPut } from "./helper/axiosHelper";
import Swal from "sweetalert2";
import cekRoles from "./helper/cekRoles";
import dayjs from 'dayjs';

const listUPT = () => {
  const dataUpt = ListUPT.map(item => {
    return {
      value: item.id?.toString(),
      label: item.nama?.replace("Balai Karantina Hewan, Ikan, dan Tumbuhan", "BKHIT")?.replace("Balai Besar Karantina Hewan, Ikan, dan Tumbuhan", "BBKHIT")?.replace("Balai Uji Terap Teknik dan Metode Karantina Hewan, Ikan, dan Tumbuhan", "BUTTMKHIT")?.replace("Balai Besar Uji Standar Karantina Hewan, Ikan, dan Tumbuhan", "BBUSKHIT"),
      data: item
    }
  })
  return dataUpt
}
const listProp = () => {
  const dataUpt = WilProvinsi.map(item => {
    return {
      value: item.id_wilayah_propinsi?.toString(),
      label: item.nama_propinsi,
      data: item
    }
  })
  return dataUpt
}
const listKotaKab = (e) => {
  let dataUpt = WilKotaKab.filter(item => item.id_wilayah_propinsi == e)
  dataUpt = dataUpt.map(item => {
    return {
      value: item.id_wilayah_kabupaten?.toString(),
      label: item.jenis_kabupaten_kota + " " + item.nama_kabupaten,
      data: item
    }
  })
  return dataUpt
}
const listKecamatan = (e) => {
  let dataUpt = WilKecamatan.filter(item => item.id_wilayah_kabupaten == e)
  dataUpt = dataUpt.map(item => {
    return {
      value: item.id_wilayah_kecamatan?.toString(),
      label: item.nama_kecamatan,
      data: item
    }
  })
  return dataUpt
}

const listKelurahan = (e) => {
  let dataUpt = WilKelurahan.filter(item => item.id_wilayah_kecamatan == e)
  dataUpt = dataUpt.map(item => {
    return {
      value: item.id_wilayah_kelurahan?.toString(),
      label: item.nama_kelurahan,
      data: item
    }
  })
  return dataUpt
}
const { Title } = Typography;

export default function EditProfile() {
  const [form] = Form.useForm();
  let formValue = Form.useWatch([], form)
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  let [lokasiSelect, setLokasiSelect] = useState([]);
  let [fotoBase64, setFotoBase64] = useState("");
  let [bagianSelect, setBagianSelect] = useState([]);
  let [dataSelect, setDataSelect] = useState("");

  const user = decodeCookies("user")
  const userGet = decodeCookies("userGet")

  const getDataUser = useCallback(async () => {
    let userid = ""
    if (userGet) {
      userid = userGet?.id_user
    } else {
      userid = user?.id_user
    }
    Swal.fire("Loading data user..");
    Swal.showLoading();
    try {
      const datapeg = await protectGet(
        "/pegawai?id=" + userid
      );
      if (import.meta.env.MODE == "development") {
        console.log("datapeg", datapeg);
      }
      const userpeg = datapeg.data.data
      userpeg.lokasi_kantor_id = userpeg?.lokasi_kantor_id?.split(",")
      setDataSelect(userpeg)
      form.setFieldsValue({
        id_user: userpeg?.id_user,
        avatar: userpeg?.avatar,
        bagian_id: userpeg?.bagian_id,
        lokasi_kantor_id: userpeg?.lokasi_kantor_id,
        role: userpeg?.role,
        alamat: userpeg?.alamat,
        email: userpeg?.email,
        jabatan: userpeg?.jabatan,
        kecamatan: userpeg?.kecamatan,
        kelurahan: userpeg?.kelurahan,
        kota_kab: userpeg?.kota_kab,
        nama: userpeg?.nama,
        nik: userpeg?.nik,
        nip: userpeg?.nip,
        no_hp: userpeg?.no_hp,
        id_wilayah_propinsi: userpeg?.id_wilayah_propinsi,
        id_wilayah_kabupaten: userpeg?.id_wilayah_kabupaten,
        id_wilayah_kecamatan: userpeg?.id_wilayah_kecamatan,
        id_wilayah_kelurahan: userpeg?.id_wilayah_kelurahan,
        tempat_lahir: userpeg?.tempat_lahir,
        tgl_lahir: dayjs(userpeg?.tgl_lahir ?? null),
        jenis_kelamin: userpeg?.jenis_kelamin,
        zona_waktu: userpeg?.zona_waktu,
        shifting: userpeg?.shifting,
        upt_id: userpeg?.upt_id,
        username: userpeg?.username,
      });
    } catch (error) {
      if (import.meta.env.MODE == "development") {
        console.log(error);
      }
    } finally {
      Swal.close();
    }
  }, [form])

  const getLokasi = useCallback(async (e) => {
    Swal.fire("Loading lokasi..");
    Swal.showLoading();
    try {
      const bagian = await protectGet(
        "/lokasiKantor/byUPT?upt=" + (e ? e : user.upt_id)
      );
      if (import.meta.env.MODE == "development") {
        console.log(bagian);
      }
      const sel = bagian.data.data?.map((item) => {
        return {
          value: item.id.toString(),
          label: item.nama_lokasi,
        };
      });
      setLokasiSelect(sel);
    } catch (error) {
      if (import.meta.env.MODE == "development") {
        console.log(error);
      }
      setLokasiSelect([]);
    } finally {
      Swal.close();
    }
  }, []);

  const getBagian = useCallback(async (e) => {
    Swal.fire("Loading bagian..");
    Swal.showLoading();
    try {
      const bagian = await protectGet(
        "/bagian/getBy?jenis=" + (e ? (e == "1000" ? "1000" : "upt") : (user?.upt_id == "1000" ? "1000" : "upt"))
      );
      if (import.meta.env.MODE == "development") {
        console.log(bagian);
      }
      const sel = bagian.data.data?.map((item) => {
        return {
          value: item.id?.toString(),
          label: item.nama,
        };
      });
      setBagianSelect(sel);
    } catch (error) {
      if (import.meta.env.MODE == "development") {
        console.log(error);
      }
      setBagianSelect([]);
    } finally {
      Swal.close();
    }
  }, []);

  const handleUploadChange = (file) => {
    // const file = fileList?.originFileObj;
    if (!file) return;

    const maxSizeMB = 1;
    if (file.size > maxSizeMB * 1024 * 1024) {
      Swal.fire('Perhatian', 'Ukuran file maksimal 1MB', 'warning')
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoBase64(reader.result);
    };
    reader.readAsDataURL(file.originFileObj);
    setFileList([file]);
  };

  const handleSubmit = async (values) => {
    values['avatarBase64'] = fotoBase64
    values['tgl_lahir'] = values.tgl_lahir ? dayjs(values.tgl_lahir).format('YYYY-MM-DD') : null
    if (values.jabatan) {
      values['jabatan'] = values.jabatan.join(",")
    }
    if (values.lokasi_kantor_id) {
      values['lokasi_kantor_id'] = values.lokasi_kantor_id.join(",")
    }
    if (values.role) {
      values['role'] = values.role.join(",")
    }
    // console.log("values", values)
    // console.log("values", values?.id_user)
    // return;
    Swal.fire("Sedang menyimpan..");
    Swal.showLoading();
    try {
      const response = await protectPostPut((values?.id_user ? 'put' : 'post'),"/pegawai", values);
      if (import.meta.env.MODE == "development") {
        console.log(response);
      }
      await Swal.fire("Sukses", response?.data?.message, "success")
      getDataUser()
      setFileList([])
    } catch (error) {
      if (import.meta.env.MODE == "development") {
        console.log(error);
      }
      Swal.fire("Gagal", error?.response?.data?.message, "error")
    }
  };

  useEffect(() => {
    getLokasi()
    getBagian()
    getDataUser()
  }, [getLokasi, getBagian, getDataUser])

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="bg-white/45 shadow-md rounded-xl p-6 mb-30">
        <Title level={4}>Edit Profil</Title>

        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          layout="horizontal"
          onFinish={handleSubmit}>
          <Row gutter={18}>
            <Col span={24} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              
              <Form.Item name="id_user" hidden></Form.Item>
              <Form.Item label="">
                <Flex gap={8}>
                  {dataSelect?.avatar && fileList?.length == 0 ?
                    <Avatar src={
                      dataSelect?.avatar && fileList?.length == 0
                        ? `${import.meta.env.VITE_ABSEN_BE}/assets/user/${dataSelect?.avatar}`
                        : "/images/user.png"
                    }
                      size={100} style={{ minWidth: 100 }} />
                    : ""}
                  <Upload
                    listType={"picture-circle"}
                    accept="image/*"
                    maxCount={1}
                    fileList={fileList}
                    onChange={(e) => e.fileList.length == 0 ? setFileList([]) : handleUploadChange(e.file)}
                  >
                    {fileList?.length == 0 && dataSelect?.avatar ?
                      <><EditOutlined /> Edit </>
                      :
                      (fileList?.length > 0 ? "" : <>
                        <UploadOutlined /> Upload
                      </>)
                    }
                  </Upload>
                </Flex>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              {cekRoles("admin") ?
                <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                  <Input disabled={cekRoles("admin") ? false : true} />
                </Form.Item>
                :
                <Form.Item label="Username">
                  <Input
                    value={dataSelect?.username}
                    disabled={cekRoles("admin") ? false : true}
                  />
                </Form.Item>
              }
              <Form.Item name="nama" label="Nama" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="nip" label="NIP" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="nik" label="NIK" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="tempat_lahir" label="Tempat Lahir" rules={[{ required: false }]}>
                <Input />
              </Form.Item>
              <Form.Item name="tgl_lahir" label="Tgl Lahir" rules={[{ required: false }]} getValueFromEvent={(date, dateString) => (date ? dateString : null)} normalize={(value) => (value ? dayjs(value, 'YYYY-MM-DD') : null)}>
                <DatePicker
                  placeholder="Select date"
                  style={{ width: '100%', textAlign: 'left' }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
              <Form.Item name="alamat" label="Alamat" rules={[{ required: false }]}>
                <TextArea rows={2} />
              </Form.Item>
              <Form.Item
                label="Provinsi"
                name="id_wilayah_propinsi"
                rules={[{ required: false }]}
              >
                <Select
                  showSearch
                  className="w-full text-left"
                  placeholder="Provinsi..."
                  optionFilterProp="label"
                  options={listProp()}
                />
              </Form.Item>
              <Form.Item
                label="Kota/kab"
                name="id_wilayah_kabupaten"
                rules={[{ required: false }]}
              >
                <Select
                  showSearch
                  className="w-full text-left"
                  placeholder="Provinsi..."
                  optionFilterProp="label"
                  options={listKotaKab(formValue?.id_wilayah_propinsi ?? "")}
                />
              </Form.Item>
              <Form.Item
                label="Kecamatan"
                name="id_wilayah_kecamatan"
                rules={[{ required: false }]}
              >
                <Select
                  showSearch
                  className="w-full text-left"
                  placeholder="Kecamatan..."
                  optionFilterProp="label"
                  options={listKecamatan(formValue?.id_wilayah_kabupaten ?? "")}
                />
              </Form.Item>
              <Form.Item
                label="Kelurahan"
                name="id_wilayah_kelurahan"
                rules={[{ required: false }]}
              >
                <Select
                  showSearch
                  className="w-full text-left"
                  placeholder="Kelurahan..."
                  optionFilterProp="label"
                  options={listKelurahan(formValue?.id_wilayah_kecamatan ?? "")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Form.Item label="Jenis Kelamin" name="jenis_kelamin">
                <Radio.Group
                  style={{ display: "flex", justifyContent: "flex-start" }}
                >
                  <Radio value="L">Laki-laki</Radio>
                  <Radio value="P">Perempuan</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: false }]}>
                <Input />
              </Form.Item>
              <Form.Item name="no_hp" label="No. HP" rules={[{ required: false }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Zona Waktu" name="zona_waktu">
                <Radio.Group
                  style={{ display: "flex", justifyContent: "flex-start" }}
                >
                  <Radio value="WIB">WIB</Radio>
                  <Radio value="WITA">WITA</Radio>
                  <Radio value="WIT">WIT</Radio>
                </Radio.Group>
              </Form.Item>
              {cekRoles("admin") || (cekRoles("adm-peg") && user?.upt_id == '1000')
                ?
                <Form.Item label="UPT" name="upt_id" rules={[{ required: true }]}>
                  <Select
                    showSearch
                    disabled={cekRoles("admin") || (cekRoles("adm-peg") && user?.upt_id == '1000') ? false : true}
                    className="w-full text-left"
                    placeholder="UPT..."
                    optionFilterProp="label"
                    options={listUPT()}
                    onChange={(e) => {
                      getLokasi(e)
                      getBagian(e)
                    }}
                  />
                </Form.Item>
                :
                <Form.Item label="UPT">
                  <Select
                    disabled
                    className="w-full text-left"
                    placeholder="UPT..."
                    value={dataSelect?.upt_id}
                    options={listUPT()}
                  />
                </Form.Item>
              }
              {cekRoles("admin") || cekRoles("adm-peg") ?
              <Form.Item
                label="Lokasi Kantor"
                name="lokasi_kantor_id"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  disabled={cekRoles("admin") || cekRoles("adm-peg") ? false : true}
                  className="w-full text-left"
                  placeholder="Lokasi..."
                  optionFilterProp="label"
                  options={lokasiSelect}
                  mode="multiple"
                />
              </Form.Item>
              : 
                <Form.Item
                  label="Lokasi Kantor"
                >
                  <Select
                    showSearch
                    disabled
                    className="w-full text-left"
                    placeholder="Lokasi..."
                    optionFilterProp="label"
                    value={dataSelect?.lokasi_kantor_id}
                    options={lokasiSelect}
                    mode="multiple"
                  />
                </Form.Item>
              }
              {cekRoles("admin") || cekRoles("adm-peg") ?
              <Form.Item label="Bagian" name="bagian_id" rules={[{ required: false }]}>
                <Select
                  showSearch
                  className="w-full text-left"
                  disabled={cekRoles("admin") || cekRoles("adm-peg") ? false : true}
                  placeholder="Bagian..."
                  optionFilterProp="label"
                  options={bagianSelect}
                />
              </Form.Item>
              :
              <Form.Item label="Bagian" >
                <Select
                  className="w-full text-left"
                  disabled={cekRoles("admin") || cekRoles("adm-peg") ? false : true}
                  placeholder="Bagian..."
                  optionFilterProp="label"
                    value={dataSelect?.bagian_id}
                  options={bagianSelect}
                />
              </Form.Item>
              }
              {cekRoles("admin") || cekRoles("adm-peg") ?
              <Form.Item label="Absen Shift" name="shifting">
                <Radio.Group
                  disabled={cekRoles("admin") || cekRoles("adm-peg") ? false : true}
                  style={{ display: "flex", justifyContent: "flex-start" }}
                >
                  <Radio value="Y">Ya</Radio>
                  <Radio value="T">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              :
              <Form.Item label="Absen Shift">
                <Radio.Group
                  disabled={cekRoles("admin") || cekRoles("adm-peg") ? false : true}
                  style={{ display: "flex", justifyContent: "flex-start" }}
                    value={dataSelect?.shifting}
                >
                  <Radio value="Y">Ya</Radio>
                  <Radio value="T">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              }
              <Form.Item
                label="Jabatan"
                name="jabatan"
                rules={[{ required: false }]}
              >
                <Select
                  className="w-full text-left"
                  showSearch
                  mode="multiple"
                >
                  <Option value="6">Kepala Balai</Option>
                  <Option value="7">Fungsional Umum</Option>
                  <Option value="8">Fungsional tertentu</Option>
                  <Option value="9">Eselon I</Option>
                  <Option value="10">Eselon II</Option>
                  <Option value="11">Eselon III</Option>
                  <Option value="12">Eselon IV</Option>
                  <Option value="13">Kepala Sub Bagian Umum</Option>
                  <Option value="14">PPPK</Option>
                </Select>
              </Form.Item>
              {cekRoles("admin") ?
                <Form.Item label="Role" name="role" rules={[{ required: false }]}>
                  <Select
                    mode="multiple"
                  >
                    <Option value="1">Super Admin</Option>
                    <Option value="5">Admin Kepegawaian</Option>
                    <Option value="6">Tata Usaha</Option>
                    <Option value="2">User</Option>
                  </Select>
                </Form.Item>
                : ""}
            </Col>
            <Col span={24}>
              <Flex style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="mt-6">
                <Button
                  onClick={() => navigate("/home")}
                  style={{ marginRight: 8 }}
                >
                  Batal
                </Button>
                <Button type="primary" htmlType="submit">
                  Simpan
                </Button>
              </Flex>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
