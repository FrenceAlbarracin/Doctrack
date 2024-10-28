import React, { useState } from 'react';
import styles from './ManageItems.module.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  ]);

  const [editingUser, setEditingUser] = useState(null);

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSave = () => {
    setUsers(users.map(user => 
      user.id === editingUser.id ? editingUser : user
    ));
    setEditingUser(null);
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  const handleChange = (e, field) => {
    setEditingUser({ ...editingUser, [field]: e.target.value });
  };

  return (
    <div className={styles.manageContainer}>
      <h2 className={styles.title}>Manage Users</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                {editingUser && editingUser.id === user.id ? (
                  <input1 
                    type="text" 
                    value={editingUser.name} 
                    onChange={(e) => handleChange(e, 'name')}
                  />
                ) : user.name}
              </td>
              <td>
                {editingUser && editingUser.id === user.id ? (
                  <input1
                    type="email" 
                    value={editingUser.email} 
                    onChange={(e) => handleChange(e, 'email')}
                  />
                ) : user.email}
              </td>
              <td>
                {editingUser && editingUser.id === user.id ? (
                  <select1 
                    value={editingUser.role} 
                    onChange={(e) => handleChange(e, 'role')}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select1>
                ) : user.role}
              </td>
              <td>
                <span className={`${styles.status} ${styles[user.status.toLowerCase()]}`}>
                  {user.status}
                </span>
              </td>
              <td>
                {editingUser && editingUser.id === user.id ? (
                  <>
                    <button 
                      className={`${styles.actionButton} ${styles.saveButton}`}
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.cancelButton}`}
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
