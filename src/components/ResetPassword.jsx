import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import DigitalClock from './DigitalClock';
import { Button, Form, Input, Modal } from 'antd';
import Title from 'antd/es/typography/Title';
import { decodeCookies, encodeCookies } from '../helper/parsingCookies';
import Swal from 'sweetalert2';
import { protectPostPut } from '../helper/axiosHelper';
import cekRoles from '../helper/cekRoles';

export default function ResetPassword() {
    const navigate = useNavigate()
    const location = useLocation();
    const { status, user, setting } = location.state || {}
    const userCo = decodeCookies("user")
    let [userState, setUserState] = useState("")
    let [modNip, setModNip] = useState(false)
    let [nipUbah, setNipUbah] = useState("")

    const {
        control,
        register,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm()

    useEffect(() => {
        if (userCo) {
            setUserState(userCo)
        } else if (user) {
            setUserState(user.data)
        } else {
            navigate("/login")
        }
    }, [])

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
        .catch((error)=> {
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
