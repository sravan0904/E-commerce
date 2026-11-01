import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
