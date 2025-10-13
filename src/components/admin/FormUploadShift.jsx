import { UploadOutlined } from '@ant-design/icons'
import { Button, DatePicker, Form, Modal, Select, Upload } from 'antd'
import Title from 'antd/es/typography/Title'
import React, { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs';
import { protectGet, protectPostPut } from '../../helper/axiosHelper';
import Swal from 'sweetalert2';
import { decodeCookies } from '../../helper/parsingCookies';
const { RangePicker } = DatePicker;
import * as XLSX from "xlsx";
import ListUPT from "../../assets/uptNewGrouping.json";

function getnamaupt(id){
    const data = ListUPT.filter(item => item.id == id)
    return data[0]['nama']
}

export default function FormUploadShift({
    openModal, setOpenModal, getShift, flag, setFlag, valueSelected
}) {
    let [fileUpload, setFileUpload] = useState("")
    let [listFileUpload, setListFileUpload] = useState([])
    let [pegawaiSelect, setPegawaiSelect] = useState([])
    let [valueInput, setValueInput] = useState({
        id: "",
        tanggal: dayjs(),
        id_user: "",
        shift_id: ""
    })
    let [shiftSelect, setShiftSelect] = useState([])
    let [periodeStart, setPeriodeStart] = useState("")
    let [periodeEnd, setPeriodeEnd] = useState("")
    const user = decodeCookies("user")
    
    async function getContohFile() {
        Swal.fire("Mengunduh format upload shift..");
        Swal.showLoading();
        try {
            const upt = {
                upt: user?.upt_id?.slice(0, 2)
            }
            const response = await protectPostPut('post', "/shiftPegawai/uploadShift", upt, "blob");
            if (import.meta.env.MODE == "development") {
                console.log(response);
            }
            const url = window.URL.createObjectURL(
                new Blob([response.data], {
                    type:
                        response.headers["content-type"] || "application/octet-stream",
                })
            );
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `shift ePresensi.xlsx`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (import.meta.env.MODE == "development") {
                console.log(error);
            }
        } finally {
            Swal.close();
        }
    }

    const getMasterShift = useCallback(async () => {
        try {
            const pegawai = await protectGet("/masterWaktuPresensi/upt?upt=" + user?.upt_id);
            if (import.meta.env.MODE == "development") {
                console.log(pegawai);
            }
            const sel = pegawai.data.data?.map((item) => {
                item.value = item.id_setting_waktu_presensi
                item.label = item.nama_setting + " (" + item.batas_waktu_masuk + " - " + item.batas_waktu_pulang + ")"
                return item;
            });
            setShiftSelect(sel);
        } catch (error) {
            if (import.meta.env.MODE == "development") {
                console.log(error);
            }
            setShiftSelect([]);
        }
    }, [])

    const getPegawaiUpt = useCallback(async () => {
        try {
            const cari = {
                upt: user?.upt_id,
                bagian: "all",
            };
            const pegawai = await protectPostPut("post", "/pegawai/getBy", cari);
            if (import.meta.env.MODE == "development") {
                console.log(pegawai);
            }
            const sel = pegawai.data.data?.map((item) => {
                item.value = item.id_user
                item.label = item.nama + " - " + (item.nip == 0 ? item.nik : item.nip)
                return item;
            });
            setPegawaiSelect(sel);
        } catch (error) {
            if (import.meta.env.MODE == "development") {
                console.log(error);
            }
            setPegawaiSelect([]);
        }
    }, [])

    function ceknip(result) {
        if (result.length > 0) {
            for (const item of result) {
                if (pegawaiSelect.length === 0) {
                    getPegawaiUpt()
                    return "Gagal cek data pegawai, mohon coba lagi";
                }
                const cekpeg = pegawaiSelect.find(peg => (peg.nip == 0 ? peg.nik : peg.nip) == item.nip)
                if (!cekpeg) {
                    return `${item.nip} tidak terdaftar di ${getnamaupt(user?.upt_id)?.replace("Balai Karantina Hewan, Ikan, dan Tumbuhan", "BKHIT")?.replace("Balai Besar Karantina Hewan, Ikan, dan Tumbuhan", "BBKHIT") }`
                }
                for (const sh of item.shifts) {
                    if (shiftSelect.length === 0) {
                        getMasterShift()
                        return "Gagal cek data shift, mohon coba lagi";
                    }
                    const ceksif = shiftSelect.find(sif => sif.id_setting_waktu_presensi == sh.shiftId)
                    if (!ceksif) {
                        return `${sh.shiftId} tidak terdaftar di ${getnamaupt(user?.upt_id)?.replace("Balai Karantina Hewan, Ikan, dan Tumbuhan", "BKHIT")?.replace("Balai Besar Karantina Hewan, Ikan, dan Tumbuhan", "BBKHIT") }`
                    }
                }
            }
            return true
        } else {
            return "Data update kosong, mohon cek data yang diupload"
        }
    }

    function validasiFile(file) {
        Swal.fire("Mohon tunggu, sedang cek data pada file")
        Swal.showLoading()
        const allowedExtensions = ["xlsx"];
        const fileExtension = file.name.split(".").pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            Swal.fire({
                icon: "error",
                title: "Format file: .xlsx",
            })
            setFileUpload("")
            setListFileUpload([])
            return;
        }
        const maxSize = 1 * 1024 * 1024; //1MB
        if (file.size > maxSize) {
            Swal.fire({
                icon: "error",
                title: "Ukuran file maksimal 1 MB",
            })
            setFileUpload("")
            setListFileUpload([])
            return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            // Ambil sheet pertama
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert ke JSON
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const headers = json[0];
            let result = json?.map((row, index) => {
                if (index != 0 && row[0] != undefined) {
                    let obj = {
                        no: row[0],
                        nama: row[1],
                        nip: row[2]?.replace(/'/g, ""),
                        id_user: pegawaiSelect.filter(item => (item.nip == 0 ? item.nik : item.nip) == row[2]?.replace(/'/g, ""))[0]?.id_user,
                        shifts: []
                    };

                    for (let i = 3; i < row.length; i++) {
                        obj.shifts.push({
                            tanggal: headers[i],
                            shiftId: row[i]
                        });
                    }
                    return obj
                }
            });
            result = result.filter(Boolean);

            const cekdatanip = ceknip(result)
            if (cekdatanip != true) {
                Swal.fire('Warning', cekdatanip, 'warning')
                setFileUpload("")
                setListFileUpload([])
                return
            }
            setFileUpload(result)
        };
        reader.readAsArrayBuffer(file.originFileObj);
        setListFileUpload([file])
        Swal.fire('Sukses', 'Data sesuai', 'success')
    }
    
    async function submitShiftPegawai(e) {
        e.preventDefault();
        let lengthShift = fileUpload[0]['shifts'].length
        let cekDateStart = periodeStart 
        const dateStart = new Date(cekDateStart);
        const dayStart = dateStart.getDate()
        let cekDateEnd = periodeEnd 
        const dateEnd = new Date(cekDateEnd);
        const dayEnd = dateEnd.getDate()
        if (fileUpload[0]['shifts'][0]['tanggal'] != dayStart) {
            Swal.fire('Perhatian', "Tanggal awal dan periode tanggal awal yang dipilih tidak sama", 'warning');
            return
        }
        if (fileUpload[0]['shifts'][lengthShift - 1]['tanggal'] != dayEnd) {
            Swal.fire('Perhatian', "Tanggal akhir dan periode tanggal akhir yang dipilih tidak sama", 'warning');
            return
        }
        Swal.fire("Mohon tunggu..");
        Swal.showLoading();
        
        try {
            const payload = {
                tglStart: periodeStart,
                tglEnd: periodeEnd,
                lampiran: fileUpload
            }
            // console.log("payload", payload)
            // return
            const response = await protectPostPut('post', "/shiftPegawai/inputExcel", payload);
            if (import.meta.env.MODE == "development") {
                console.log(response);
            }
            if (response.data.status) {
                setPeriodeStart(dayjs())
                setPeriodeEnd(dayjs())
                setListFileUpload("")
                setOpenModal(false)
                setFlag("")
                await Swal.fire('Sukses', response?.data?.message ?? "Berhasil", 'success');
                getShift()
            }
        } catch (error) {
            if (import.meta.env.MODE == "development") {
                console.log(error);
            }
            Swal.fire('Gagal', error.response?.data?.message ?? "Gagal upload", 'error');
        // } finally {
        //     Swal.close();
        }
    }

    function resetValueInput() {
        setValueInput(values => ({
            ...values,
            id: "",
            tanggal: dayjs(),
            id_user: "",
            shift_id: ""
        }))
    }

    async function inputShiftPegawai(e) {
        e.preventDefault()
        Swal.fire("Mohon tunggu..");
        Swal.showLoading();

        try {
            const response = await protectPostPut(valueInput.id ? 'put' : 'post', "/shiftPegawai", valueInput);
            if (import.meta.env.MODE == "development") {
                console.log(response);
            }
            if (response.data.status) {
                resetValueInput()
                setOpenModal(false)
                setFlag("")
                await Swal.fire('Sukses', response?.data?.message ?? "Berhasil", 'success');
                getShift()
            }
        } catch (error) {
            if (import.meta.env.MODE == "development") {
                console.log(error);
            }
            Swal.fire('Gagal', error.response?.data?.message ?? "Gagal upload", 'error');
            // } finally {
            //     Swal.close();
        }
    }

    useEffect(() => {
        getPegawaiUpt()
        getMasterShift()
    }, [getPegawaiUpt, getMasterShift])

    useEffect(() => {
        if (valueSelected) {
            setValueInput(values => ({
                ...values,
                id: valueSelected.id,
                tanggal: dayjs(valueSelected.tanggal),
                id_user: valueSelected.id_user,
                shift_id: valueSelected.shift_id
            }))
        }
    }, [valueSelected])
    return (
        <Modal
            open={openModal}
            footer={null}
            onCancel={() => setOpenModal(false) & resetValueInput()}
            centered
            width={400}
        >
            <Title level={4}>{flag == 'excel' ? 'Upload' : (flag == 'user' ? (valueInput.id ? 'Edit' : 'Input') : '')} jadwal shift pegawai</Title>
            {flag == 'excel' ?
                <form style={{ padding: "20px" }} onSubmit={submitShiftPegawai}>
                    <Form.Item label="Periode">
                        <RangePicker
                            defaultValue={[dayjs(), dayjs()]}
                            format="YYYY-MM-DD"
                            onChange={(dates) => {
                                if (dates) {
                                    setPeriodeStart(dates[0].format('YYYY-MM-DD'))
                                    setPeriodeEnd(dates[1].format('YYYY-MM-DD'))
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item label="Upload">
                        <Upload
                            listType="picture"
                            accept=".xlsx,.xls"
                            maxCount={1}
                            fileList={listFileUpload}
                            onChange={(e) => e.fileList.length == 0 ? setFileUpload("") & setListFileUpload([]) : validasiFile(e.file)}
                        >
                            {fileUpload ? "" :
                                <Button icon={<UploadOutlined />}>Click to Upload</Button>
                            }
                        </Upload>
                        <p>Contoh file upload: <Button type='link' htmlType='button' onClick={() => getContohFile()}>Unduh file</Button></p>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit" className='me-2'>
                            Submit
                        </Button>
                        <Button type="default" onClick={() => setOpenModal(false)} className='mt-2'>
                            Tutup
                        </Button>
                    </Form.Item>
                </form>
                : 
                <form style={{ padding: "20px" }} onSubmit={inputShiftPegawai}>
                    <Form.Item label="Tanggal">
                        <DatePicker
                            value={dayjs(valueInput.tanggal)}
                            format="YYYY-MM-DD"
                            onChange={(dates) => setValueInput(values => ({ ...values, tanggal: dates }))}
                        />
                    </Form.Item>
                    <Form.Item label="Pegawai">
                        <Select
                            showSearch
                            allowClear
                            value={valueInput.id_user}
                            placeholder="Pegawai..."
                            optionFilterProp="label"
                            onChange={(e) => setValueInput(values => ({ ...values, id_user: e })) }
                            className="text-left w-auto max-w-full sm:w-[300px]"
                            popupMatchSelectWidth={false}
                            popupStyle={{ width: 'auto' }}
                            options={pegawaiSelect}
                        />
                    </Form.Item>
                    <Form.Item label="Shift">
                        <Select
                            showSearch
                            allowClear
                            value={valueInput.shift_id}
                            placeholder="Shift..."
                            optionFilterProp="label"
                            onChange={(e) => setValueInput(values => ({ ...values, shift_id: e })) }
                            className="text-left w-auto max-w-full sm:w-[300px]"
                            popupMatchSelectWidth={false}
                            popupStyle={{ width: 'auto' }}
                            options={shiftSelect}
                        />
                    </Form.Item>
                    <Form.Item label={null}>
                        <Button variant='solid' color={valueInput.id ? 'orange' : 'primary'} htmlType="submit" className='me-2'>
                            {valueInput.id ? 'Edit' : 'Submit'}
                        </Button>
                        <Button type="default" onClick={() => setOpenModal(false) & resetValueInput()} className='mt-2'>
                            Tutup
                        </Button>
                    </Form.Item>
            </form>}
        </Modal>
    )
}
