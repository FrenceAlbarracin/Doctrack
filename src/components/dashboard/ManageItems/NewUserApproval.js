import React, { useState } from 'react';
import styles from './ManageItems.module.css';

const NewUserApproval = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', status: 'Pending' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'Pending' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Pending' },
  ]);

  const handleApprove = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: 'Approved' } : user
    ));
  };

  const handleReject = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: 'Rejected' } : user
    ));
  };

  return (
    <div className={styles.manageContainer}>
      <h2 className={styles.title}>New User Approval</h2>
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
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={`${styles.status} ${styles[user.status.toLowerCase()]}`}>
                  {user.status}
                </span>
              </td>
              <td>
                <button 
                  className={`${styles.actionButton} ${styles.approveButton}`}
                  onClick={() => handleApprove(user.id)}
                  disabled={user.status !== 'Pending'}
                >
                  Approve
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.rejectButton}`}
                  onClick={() => handleReject(user.id)}
                  disabled={user.status !== 'Pending'}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NewUserApproval;
