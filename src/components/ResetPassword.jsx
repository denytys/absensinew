import React, { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import DigitalClock from './DigitalClock';
import { Button, Divider, Form, Input, Modal, Select } from 'antd';
import Title from 'antd/es/typography/Title';
import { decodeCookies, encodeCookies } from '../helper/parsingCookies';
import Swal from 'sweetalert2';
import { protectGet, protectPostPut } from '../helper/axiosHelper';
import cekRoles from '../helper/cekRoles';

export default function ResetPassword() {
    const navigate = useNavigate()
    const location = useLocation();
    const { status, user, setting } = location.state || {}
    const userCo = decodeCookies("user")
    let [userState, setUserState] = useState("")
    let [modNip, setModNip] = useState(false)
    let [bagianSelect, setBagianSelect] = useState([])
    let [lokasiSelect, setLokasiSelect] = useState([])
    let [nipUbah, setNipUbah] = useState("")

    const {
        control,
        register,
        setValue,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const getBagian = useCallback(async (e) => {
        Swal.fire("Loading bagian..");
        Swal.showLoading();
        try {
            const bagian = await protectGet(
                "/bagian/getBy?jenis=" + (e == "1000" ? "1000" : "upt"), (user?.token ?? null)
            );
            if (import.meta.env.MODE == "development") {
                console.log(bagian);
            }
            const sel = bagian.data.data?.map((item) => {
                return {
                    value: item.id,
                    label: item.nama,
                };
            });
            sel.unshift({ value: "all", label: "-Semua-" });
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

    const getLokasi = useCallback(async (e) => {
        Swal.fire("Loading lokasi..");
        Swal.showLoading();
        try {
            const bagian = await protectGet(
                "/lokasiKantor/byUPT?upt=" + e, (user?.token ?? null)
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
            sel.unshift({ value: "all", label: "-Semua-" });
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

    const onsubmit = (values) => {
        values['id_user'] = userState.id_user
        Swal.fire("Sedang menyimpan..")
        Swal.showLoading()
        protectPostPut("post", "/auth/resetPass", values, false, (user?.token ?? null))
            .then((response) => {
                if (response?.data?.status) {
                    Swal.fire("Berhasil simpan data", response?.data?.message ?? "Berhasil simpan data", "success")
                    if (status == 'reset') {
                        encodeCookies("token", user.token)
                        encodeCookies("expired", user.expired)
                        encodeCookies("user", user.data);
                        encodeCookies("role", user.role);
                        encodeCookies("waktu", user.setting_waktu);
                        encodeCookies("lokasi_kantor", user.lokasi_kantor);
                        encodeCookies("setting_presensi", setting);
                    }
                    setTimeout(() => {
                        window.location.replace("/")
                    }, 1500)
                }
            })
            .catch((error) => {
                Swal.fire("Terjadi kesalahan", error?.response?.data?.message ?? "Gagal simpan data", "error")
            })
    }

    const submitUbahPassword = () => {
        if (!nipUbah) {
            Swal.fire("Perhatian!", "Mohon isi nip yang mau direset password", "warning")
            return;
        }
        Swal.fire("Sedang menyimpan..")
        Swal.showLoading()
        const nipKirim = {
            nip: nipUbah,
            upt: userCo?.upt_id
        }
        protectPostPut("post", "/auth/resetPassByNIP", nipKirim)
            .then((response) => {
                if (response?.data?.status) {
                    Swal.fire("Berhasil simpan data", response?.data?.message ?? "Berhasil simpan data", "success")
                }
            })
            .catch((error) => {
                Swal.fire("Terjadi kesalahan", error?.response?.data?.message ?? "Gagal simpan data", "error")
            })
    }

    useEffect(() => {
        if (userCo) {
            setUserState(userCo)
            if (userCo.bagian_id == '0') {
                getBagian(userCo.upt_id)
                setValue("zona_waktu", userCo.zona_waktu)
            }
            if (userCo.lokasi_kantor_id == '') {
                getLokasi(userCo.upt_id)
                setValue("zona_waktu", userCo.zona_waktu)
            }
        } else if (user) {
            setUserState(user.data)
            if (user?.data?.bagian_id == '0') {
                getBagian(user?.data?.upt_id)
                setValue("zona_waktu", user?.data?.zona_waktu)
            }
            if (user?.data?.lokasi_kantor_id == '') {
                getLokasi(user?.data?.upt_id)
                setValue("zona_waktu", user?.data?.zona_waktu)
            }
        } else {
            navigate("/login")
        }
    }, [getBagian, getLokasi])
    return (
        <div className="cmax-w-screen-lg mx-auto px-2 relative min-h-screen">
            <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-800">
                    Presensi BARANTIN
                </h2>
                <p className="text-sm text-gray-500"><DigitalClock /></p>
            </div>
            <div className="bg-white/45 rounded-xl p-3 my-4 w-full">
                {decodeCookies("token") && (cekRoles("admin") || cekRoles("adm-peg") || cekRoles('adm-tu')) ?
                    <Button onClick={() => setModNip(true)}>By NIP</Button>
                    : ""}
                <Form
                    layout={"vertical"}
                    autoComplete='off'
                    onFinish={handleSubmit(onsubmit)}
                    className='w-full'
                >
                    <Form.Item label="Nama" className='text-left mb-0'>
                        <Title level={4} className='mb-0'>{userState.nama}</Title>
                    </Form.Item>
                    {userState.bagian_id == '0' ?
                        <Form.Item
                            label="Bagian"
                            name="bagian_id"
                            required={userState.bagian_id == '0' ? true : false}
                            validateStatus={errors.bagian_id ? "error" : ""}
                            help={errors.bagian_id?.message}
                            className="text-left"
                        >
                            <Controller
                                name="bagian_id"
                                control={control}
                                initialValues=""
                                rules={{ required: (userState.bagian_id == '0' ? "Mohon isi bagian anda" : false) }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        showSearch
                                        allowClear
                                        value={watch('bagian_id')}
                                        className="w-full text-left"
                                        placeholder="Bagian..."
                                        optionFilterProp="label"
                                        onChange={(e) => {
                                            setValue('bagian_id', e)
                                        }}
                                        options={bagianSelect}
                                    />
                                )}
                            />
                        </Form.Item>
                        : ""}
                    {userState.lokasi_kantor_id == '' ?
                        <Form.Item
                            label="Lokasi"
                            name="lokasi_kantor_id"
                            required={userState.lokasi_kantor_id == '' ? true : false}
                            validateStatus={errors.lokasi_kantor_id ? "error" : ""}
                            help={errors.lokasi_kantor_id?.message}
                            className="text-left"
                        >
                            <Controller
                                name="lokasi_kantor_id"
                                control={control}
                                initialValues=""
                                rules={{ required: (userState.lokasi_kantor_id == '' ? "Mohon isi lokasi anda" : false) }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        showSearch
                                        allowClear
                                        value={watch('lokasi_kantor_id')}
                                        className="w-full text-left"
                                        placeholder="Lokasi..."
                                        optionFilterProp="label"
                                        onChange={(e) => {
                                            setValue('lokasi_kantor_id', e)
                                        }}
                                        options={lokasiSelect}
                                    />
                                )}
                            />
                        </Form.Item>
                        : ""}
                    {userState.bagian_id == '0' && userState.lokasi_kantor_id == '' ?
                        <Form.Item
                            label="Zona waktu"
                            name="zona_waktu"
                            required={userState.bagian_id == '0' && userState.lokasi_kantor_id == '' ? true : false}
                            validateStatus={errors.zona_waktu ? "error" : ""}
                            help={errors.zona_waktu?.message}
                            className="text-left"
                        >
                            <Controller
                                name="zona_waktu"
                                control={control}
                                initialValues=""
                                rules={{ required: (userState.bagian_id == '0' && userState.lokasi_kantor_id == '' ? "Mohon isi zona waktu anda" : false) }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        showSearch
                                        allowClear
                                        value={watch('zona_waktu')}
                                        className="w-full text-left"
                                        placeholder="Zona waktu..."
                                        optionFilterProp="label"
                                        onChange={(e) => {
                                            setValue('zona_waktu', e)
                                        }}
                                        options={[
                                            {
                                                value:"WIB"
                                            },
                                            {
                                                value:"WITA"
                                            },
                                            {
                                                value:"WIT"
                                            },
                                        ]}
                                    />
                                )}
                            />
                        </Form.Item>
                    : ""}
                    <Divider />
                    <Form.Item
                        label="Password lama"
                        name="passwordlama"
                        required
                        validateStatus={errors.passwordlama ? "error" : ""}
                        help={errors.passwordlama?.message}
                        className="text-left"
                    >
                        <Controller
                            name="passwordlama"
                            control={control}
                            initialValues=""
                            rules={{ required: "Mohon isi password lama anda" }}
                            render={({ field }) => (
                                <Input.Password {...field} placeholder="************" autoComplete="current-password" />
                            )}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Password Baru"
                        name="password"
                        required
                        validateStatus={errors.password ? "error" : ""}
                        help={errors.password?.message}
                        className="text-left"
                    >
                        <Controller
                            name="password"
                            control={control}
                            initialValues=""
                            rules={{
                                required: "Password wajib diisi",
                                minLength: {
                                    value: 8,
                                    message: "Password minimal 8 karakter",
                                },
                                pattern: {
                                    value:
                                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\S]{8,}$/,
                                    message:
                                        "Password harus mengandung huruf besar, huruf kecil, angka, dan simbol",
                                },
                            }}
                            render={({ field }) => (
                                <Input.Password {...field} placeholder="************" autoComplete="new-password" />
                            )}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Ulangi Password baru"
                        name="konfirmPassword"
                        required
                        validateStatus={errors.konfirmPassword ? "error" : ""}
                        help={errors.konfirmPassword?.message}
                        className="text-left"
                    >
                        <Controller
                            name="konfirmPassword"
                            control={control}
                            validateStatus={errors.konfirmPassword ? "error" : ""}
                            help={errors.konfirmPassword?.message}
                            initialValues=""
                            rules={{
                                validate: (val) => {
                                    if (watch('password') != val) {
                                        return "Password tidak sama";
                                    }
                                },
                            }}
                            render={({ field }) => (
                                <Input.Password {...field} placeholder="************" autoComplete="new-password" />
                            )}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Submit</Button>
                    </Form.Item>
                </Form>
                <Modal
                    open={modNip}
                    footer={null}
                    centered
                    onCancel={() => setModNip(false)}
                    width={400}
                >
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <p style={{ fontSize: "18px", marginBottom: 24 }}>
                            Reset Password! <br />
                            Default: <b>JanganLupaLagi45:)</b>
                        </p>
                        <Input onChange={(e) => setNipUbah(e.target.value)} placeholder="Masukan NIP" />
                        <Button type="primary" className='mt-2' onClick={submitUbahPassword}>
                            Ubah password
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    )
}
