import { LeftOutlined } from '@ant-design/icons';
import { Button, Tabs } from 'antd';
import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom';

export default function LayoutAdmin() {
    const navigate = useNavigate()
    const OperationsSlot = {
        // left: <Button className="tabs-extra-demo-button">Left Extra Action</Button>,
        right: <Button color="cyan" variant="filled" icon={<LeftOutlined />} onClick={() => navigate('/')}>Kembali ke home</Button>,
    };
  return (
      <Tabs
          tabBarExtraContent={OperationsSlot}
          defaultActiveKey="1"
          style={{ height: 220 }}
          onClick={(e) => console.log(e)}
          items={
              [{
                  label: `Tab-1`,
                  key: 'tab1',
                  children: <Outlet/>,
              },
              {
                  label: `Tab-2`,
                  key: 'tab2',
                  children: <Outlet />,
              }]
          }
      />
  )
}
