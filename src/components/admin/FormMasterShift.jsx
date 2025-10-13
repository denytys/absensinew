import { Button, Flex, Form, Input, Modal, Select, TimePicker } from 'antd'
import Title from 'antd/es/typography/Title'
import React, { useState, useEffect } from 'react'
import { decodeCookies } from '../../helper/parsingCookies'
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { protectPostPut } from '../../helper/axiosHelper';

export default function FormMasterShift({
    openModal, setOpenModal, dataSelected, getShift
}) {

    const user = decodeCookies("user")
    let [valueInput, setValueInput] = useState({
        id_setting_waktu_presensi: '',
        nama_setting: '',
        batas_waktu_masuk: '00:00:00',
        batas_waktu_pulang: '00:00:00',
        hari_pulang: '',
        waktu_masuk_awal: '00:00:00',
        waktu_masuk_akhir: '00:00:00',
        waktu_pulang_awal: '00:00:00',
        waktu_pulang_akhir: '00:00:00',
        upt: user?.upt_id?.slice(0, 2),
        jenis: 'shift',
        is_romadon: '',
    })
    function resetValueInput() {
        setValueInput(values => ({ ...values, 
            id_setting_waktu_presensi: "",
            nama_setting: "",
            batas_waktu_masuk: "",
            batas_waktu_pulang: "",
            hari_pulang: "",
            waktu_masuk_awal: "",
            waktu_masuk_akhir: "",
            waktu_pulang_awal: "",
            waktu_pulang_akhir: "",
            upt: "",
            jenis: "",
            is_romadon: "",
        }))
    }
    async function submitMasterShift(e) {
        e.preventDefault();
        Swal.fire("Mohon tunggu..");
        Swal.showLoading();
        try {
            const response = await protectPostPut(valueInput.id_setting_waktu_presensi ? 'put' : 'post', "/masterWaktuPresensi", valueInput);
            if (import.meta.env.MODE == "development") {
                console.log(response);
            }
            if (response.data.status) {
                resetValueInput()
                setOpenModal(false)
                await Swal.fire('Sukses', response?.data?.message ?? "Berhasil", 'success');
                getShift()
            }
        } catch (error) {
            if (import.meta.env.MODE == "development") {
                console.log(error);
            }
            Swal.fire('Gagal', error.response?.data?.message ?? "Gagal upload", 'error');
        }
    }
    
    useEffect(() => {
        if (dataSelected) {
            setValueInput(values => ({
                ...values,
                id_setting_waktu_presensi: dataSelected.id_setting_waktu_presensi,
                nama_setting: dataSelected.nama_setting,
                batas_waktu_masuk: dataSelected.batas_waktu_masuk,
                batas_waktu_pulang: dataSelected.batas_waktu_pulang,
                hari_pulang: dataSelected.hari_pulang,
                waktu_masuk_awal: dataSelected.waktu_masuk_awal,
                waktu_masuk_akhir: dataSelected.waktu_masuk_akhir,
                waktu_pulang_awal: dataSelected.waktu_pulang_awal,
                waktu_pulang_akhir: dataSelected.waktu_pulang_akhir,
                upt: dataSelected.upt,
                jenis: dataSelected.jenis,
                is_romadon: dataSelected.is_romadon
            }))
        }
    }, [dataSelected])
    
    return (
        <Modal
            open={openModal}
            footer={null}
            onCancel={() => setOpenModal(false) & resetValueInput()}
            centered
            width={500}
        >
            <Title level={4}>{valueInput.id_setting_waktu_presensi ? 'Edit' : 'Input'} jadwal shift</Title>
            <form
                className='d-flex'
                style={{ padding: "20px" }} onSubmit={submitMasterShift}>
                <Form.Item label="Nama Shift">
                    <Input
                        placeholder="Masukkan nama shift"
                        value={valueInput.nama_setting}
                        onChange={(e) => setValueInput(values => ({...values, nama_setting: e.target.value }))}
                    />
                </Form.Item>
                <Form.Item label="Waktu masuk">
                    <TimePicker
                        defaultValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format='HH:mm:ss'
                        required
                        value={dayjs(valueInput.batas_waktu_masuk, 'HH:mm:ss')}
                        onChange={(dates) => setValueInput(values => ({ ...values, batas_waktu_masuk: dates ? dates.format('HH:mm:ss') : dayjs('00:00:00', 'HH:mm:ss') }))}
                    />
                </Form.Item>
                <Form.Item label="Periode masuk">
                    <TimePicker
                        defaultValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format='HH:mm:ss'
                        required
                        value={dayjs(valueInput.waktu_masuk_awal, 'HH:mm:ss')}
                        onChange={(dates) => setValueInput(values => ({ ...values, waktu_masuk_awal: dates ? dates.format('HH:mm:ss') : dayjs('00:00:00', 'HH:mm:ss') }))}
                        />
                    <TimePicker
                        defaultValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format='HH:mm:ss'
                        required
                        value={dayjs(valueInput.waktu_masuk_akhir, 'HH:mm:ss')}
                        onChange={(dates) => setValueInput(values => ({ ...values, waktu_masuk_akhir: dates ? dates.format('HH:mm:ss') : dayjs('00:00:00', 'HH:mm:ss') }))}
                        />
                </Form.Item>
                <Form.Item label="Waktu pulang">
                    <TimePicker
                        defaultValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format='HH:mm:ss'
                        required
                        value={dayjs(valueInput.batas_waktu_pulang, 'HH:mm:ss')}
                        onChange={(dates) => setValueInput(values => ({ ...values, batas_waktu_pulang: dates ? dates.format('HH:mm:ss') : dayjs('00:00:00', 'HH:mm:ss') }))}
                        />
                </Form.Item>
                <Form.Item label="Periode pulang">
                    <TimePicker
                        defaultValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format='HH:mm:ss'
                        value={dayjs(valueInput.waktu_pulang_awal, 'HH:mm:ss')}
                        onChange={(dates) => setValueInput(values => ({ ...values, waktu_pulang_awal: dates ? dates.format('HH:mm:ss') : dayjs('00:00:00', 'HH:mm:ss') }))}
                        />
                    <TimePicker
                        defaultValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format='HH:mm:ss'
                        value={dayjs(valueInput.waktu_pulang_akhir, 'HH:mm:ss')}
                        onChange={(dates) => setValueInput(values => ({ ...values, waktu_pulang_akhir: dates ? dates.format('HH:mm:ss') : dayjs('00:00:00', 'HH:mm:ss') }))}
                    />
                </Form.Item>
                <Flex gap="middle">
                    <Form.Item label="Hari pulang" style={{ width: '50%' }}>
                        <Select
                            value={valueInput.hari_pulang}
                            required
                            optionFilterProp="label"
                            onChange={(e) => setValueInput(values => ({ ...values, hari_pulang: e }))}
                            className="text-left w-auto max-w-full sm:w-[300px]"
                            popupMatchSelectWidth={false}
                            popupStyle={{ width: 'auto' }}
                            options={[
                                {
                                    value: "sama_hari_masuk",
                                },
                                {
                                    value: "hari_berikutnya",
                                },
                            ]}
                        >
                        </Select>
                    </Form.Item>
                    <Form.Item label="Jenis Absen" style={{ width: '50%' }}>
                        <Select
                            value={valueInput.is_romadon}
                            optionFilterProp="label"
                            required
                            onChange={(e) => setValueInput(values => ({ ...values, is_romadon: e }))}
                            className="text-left w-auto max-w-full sm:w-[300px]"
                            popupMatchSelectWidth={false}
                            popupStyle={{ width: 'auto' }}
                            options={[
                                {
                                    value: "0",
                                    label: "Absen biasa",
                                },
                                {
                                    value: "1",
                                    label: "Absen romadhon",
                                },
                            ]}
                        >
                        </Select>
                    </Form.Item>
                </Flex>
                <Form.Item label={null}>
                    <Button variant='solid' color={valueInput.id_setting_waktu_presensi ? 'orange' : 'primary'} htmlType="submit" className='me-2'>
                        {valueInput.id_setting_waktu_presensi ? 'Edit' : 'Submit'}
                    </Button>
                    <Button type="default" onClick={() => setOpenModal(false) & resetValueInput()} className='mt-2'>
                        Tutup
                    </Button>
                </Form.Item>
            </form>
        </Modal>
    )
}
