import React from 'react';
import { Routes, Route } from 'react-router-dom';
// import AdminLayout from './AdminLayout';
import ManageOrganizations from './ManageOrganizations'; // Ensure this import is correct

const AdminRoutes = () => {
  return (
    //<AdminLayout>
      <Routes>
        <Route path="manage-organizations" element={<ManageOrganizations />} />
        {/* Add other admin routes here as needed */}
      </Routes>
    //</AdminLayout>
  );
};

export default AdminRoutes; 