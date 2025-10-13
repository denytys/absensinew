import React from 'react';
import {
    EnvironmentOutlined,
    FieldTimeOutlined,
    PieChartOutlined,
    UsergroupAddOutlined,
    CaretLeftOutlined,
    UserOutlined,
    ScheduleOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;
function getItem({ key, title = '', label, icon = '', visible = "block", disabled = false, children }) {
    return {
        disabled,
        label,
        title,
        key,
        icon,
        style: { display: visible },
        children,
    };
}
const items = [
    getItem({ key: "1", label: <Link to="/admins">Home admin</Link>, icon: <PieChartOutlined /> }),
    getItem({
        key: "sub1", label: 'Data Master', icon: <UserOutlined />, children: [
            getItem({ key: "3", label: <Link to="/admins/pegawai">Master Pegawai</Link>, icon: <UsergroupAddOutlined /> }),
            getItem({ key: "4", label: <Link to="/admins/mshift">Master shift</Link>, icon: <FieldTimeOutlined /> }),
            getItem({ key: "5", label: <Link to="/admins/mlokasi">Lokasi Kantor</Link>, icon: <EnvironmentOutlined /> }),
        ]
    }),
    getItem({ key: "6", label: <Link to="/admins/shiftpeg">Shift Pegawai</Link>, icon: <ScheduleOutlined /> }),
];
const LayoutAdmin = () => {
    const navigate = useNavigate()
    // const [collapsed, setCollapsed] = useState(false);
    const {
        token: { borderRadiusLG },
    } = theme.useToken();
    return (
        <div className="">
            <Layout style={{ textAlign: "start"}}>
                <Sider
                    breakpoint="lg"
                    collapsedWidth="0"
                    className='min-h-screen'
                >
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} style={{
                        textAlign: "left",
                    }} items={items} />
                </Sider>
                <Layout>
                    {/* <Header style={{ padding: 0 }} /> */}
                    <Button type="default" shape="round" icon={<CaretLeftOutlined />} onClick={() => navigate("/")} size={"small"} className='mx-2 mt-2 w-46'>
                        Keluar halaman admin
                    </Button>
                    <Content >
                        <div
                            style={{
                                padding: '2px 14px 14px 14px',
                                minHeight: 360,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            <Outlet />
                        </div>
                    </Content>
                    {/* <Footer style={{ textAlign: 'center' }}>
                        Ant Design ©{new Date().getFullYear()} Created by Ant UED
                    </Footer> */}
                </Layout>
            </Layout>
        </div>
    );
};
export default LayoutAdmin;