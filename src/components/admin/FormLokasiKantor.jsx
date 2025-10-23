import { Button, Form, Input, InputNumber, Modal, Select, Space } from 'antd'
import Title from 'antd/es/typography/Title'
import React, { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import Swal from 'sweetalert2';
import { protectPostPut } from '../../helper/axiosHelper';
import { decodeCookies } from '../../helper/parsingCookies';

const removeNonNumeric = num => num.toString().replace(/[^0-9.]/g, "")

export default function FormLokasiKantor({
    openModal, setOpenModal, valueInput, listUPT, getLokasi, setValueInput
}) {
    const user = decodeCookies("user")
    const [form] = Form.useForm();
    let formValue = Form.useWatch([], form)

    const handleLatChange = (e) => {
        const cleaned = e.target.value.replace(/[^0-9.-]/g, '');
        form.setFieldsValue({ lat: cleaned });
    }
    const handleLongChange = (e) => {
        const cleaned = e.target.value.replace(/[^0-9.-]/g, '');
        form.setFieldsValue({ long: cleaned });
    }

    function FixMapSize() {
        const map = useMap();
        useEffect(() => {
            setTimeout(() => {
                map.invalidateSize();
            }, 300); // beri delay sedikit
        }, [map]);
        return null;
    }

    const submitMasterShift = async (values) => {
        Swal.fire("Sedang menyimpan..");
        Swal.showLoading();
        values.user_id = user?.id_user
        try {
            const response = await protectPostPut((values?.id ? 'put' : 'post'), "/lokasiKantor", values);
            if (import.meta.env.MODE == "development") {
                console.log(response);
            }
            await Swal.fire("Sukses", response?.data?.message, "success")
            getLokasi()
            setValueInput("")
            setOpenModal(false)
            form.resetFields()
        } catch (error) {
            if (import.meta.env.MODE == "development") {
                console.log(error);
            }
            Swal.fire("Gagal", error?.response?.data?.message, "error")
        }
    }

    useEffect(() => {
        if(valueInput) {
            form.setFieldsValue({
                id: valueInput?.id,
                nama_lokasi: valueInput?.nama_lokasi,
                alamat: valueInput?.alamat,
                lat: valueInput?.lat,
                long: valueInput?.long,
                user_id: valueInput?.user_id,
                upt_id: valueInput?.upt_id,
            });
        } else {
            form.resetFields();
        }
    }, [form, valueInput])

    return (
        <Modal
            open={openModal}
            footer={null}
            onCancel={() => setOpenModal(false) & form.resetFields()}
            centered
            width={500}
        >
            <Title level={4}>{formValue?.id ? 'Edit' : 'Input'} lokasi kantor</Title>
            <Form
                form={form}
                className='d-flex'
                style={{ padding: "20px" }} onFinish={submitMasterShift}>
                <Form.Item name="id" hidden></Form.Item>
                <Form.Item label="UPT" name="upt_id" rules={[{ required: true }]}>
                    <Select
                        showSearch
                        className="w-full text-left"
                        placeholder="UPT..."
                        optionFilterProp="label"
                        options={listUPT()}
                    />
                </Form.Item>
                <Form.Item name="nama_lokasi" label="Nama lokasi" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="alamat" label="Alamat" rules={[{ required: false }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="lokasi">
                    <Space.Compact>
                        <Form.Item
                            name="lat"
                            noStyle
                            rules={[
                                { required: true, message: 'Latitude is required' },
                                {
                                    pattern: /^-?\d{0,3}\.?\d*$/,
                                    message: 'Masukkan angka valid (contoh: -6.1754)',
                                },
                            ]}
                        >
                            <Input onChange={handleLatChange} style={{ width: '50%' }} placeholder="Input Lattitude" />
                        </Form.Item>
                        <Form.Item
                            name="long"
                            noStyle
                            rules={[
                                { required: true, message: 'Longitude is required' },
                                {
                                    pattern: /^-?\d{0,3}\.?\d*$/,
                                    message: 'Masukkan angka valid (contoh: 106.8272)',
                                },
                            ]}
                        >
                            <Input onChange={handleLongChange} style={{ width: '50%' }} placeholder="Input Longitude" />
                        </Form.Item>
                    </Space.Compact>
                </Form.Item>
                {formValue?.lat && formValue?.long && 
                <MapContainer
                        center={[formValue.lat, formValue.long]}
                    zoom={17}
                    scrollWheelZoom={true}
                    dragging={true}
                    style={{ height: "242px", width: "100%" }}
                    className="rounded-lg"
                    whenReady={(map) => map.target.invalidateSize()}
                >
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                        <Marker position={[formValue.lat, formValue.long]} />
                    <FixMapSize />
                </MapContainer>
                }
                <Form.Item label={null}>
                    <Button variant='solid' color={formValue?.id ? 'orange' : 'primary'} htmlType="submit" className='me-2'>
                        {formValue?.id ? 'Edit' : 'Submit'}
                    </Button>
                    <Button type="default" onClick={() => setOpenModal(false) & form.resetFields()} className='mt-2'>
                        Tutup
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    )
}
