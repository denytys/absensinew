import { Collapse, Space } from 'antd'
import React from 'react'
import PenggunaanPresensi from './grafik/PenggunaanPresensi';
import cekRoles from '../helper/cekRoles';

export default function RekapDashboard() {
  return (
    cekRoles("admin") || cekRoles("adm-peg") ?
    <Space direction="vertical" className='w-full text-start'>
      <Collapse
        collapsible="header"
        defaultActiveKey={['1']}
        items={[
          {
            key: '1',
            label: 'Penggunaan presensi per UPT',
            children: <PenggunaanPresensi/>,
          },
        ]}
      />
    </Space>
    : <div>Tunggu update selanjutnya 😉</div>
  )
}
