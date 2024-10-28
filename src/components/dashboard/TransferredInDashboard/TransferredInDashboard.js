import React, { useState } from 'react';
import styles from './TransferredInDashboard.module.css';

const TransferredInDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const transferredInData = [
    { serialNumber: '00001', documentName: 'Microsoft', recipient: 'ComSoc', dateCreated: '1/03/2023', modified: '2 hours ago' },
    { serialNumber: '00002', documentName: 'Yahoo', recipient: 'Matigda', dateCreated: '1/03/2023', modified: 'a week ago' },
    { serialNumber: '00003', documentName: 'Adobe', recipient: 'SBO', dateCreated: '1/03/2023', modified: '15 minutes ago' },
    { serialNumber: '00004', documentName: 'Tesla', recipient: 'SBO', dateCreated: '1/03/2023', modified: 'a week ago' },
    { serialNumber: '00005', documentName: 'Google', recipient: 'Matigda', dateCreated: '1/03/2023', modified: '30 minutes ago' },
    { serialNumber: '00006', documentName: 'Adobe', recipient: 'SBO', dateCreated: '1/03/2023', modified: '15 minutes ago' },
    { serialNumber: '00007', documentName: 'Google', recipient: 'Matigda', dateCreated: '1/03/2023', modified: '30 minutes ago' },
    { serialNumber: '00008', documentName: 'Google', recipient: 'Matigda', dateCreated: '1/03/2023', modified: '30 minutes ago' },
  ];

  const getStatusClass = (modified) => {
    if (modified.includes('minutes') || modified.includes('hours')) {
      return styles.recent;
    } else if (modified.includes('week')) {
      return styles.old;
    } else {
      return styles.moderate;
    }
  };

  const filteredData = transferredInData
    .filter(item => 
      item.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.dateCreated) - new Date(a.dateCreated);
      } else {
        return new Date(a.dateCreated) - new Date(b.dateCreated);
      }
    });

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Transferred In</h1>
      <div className={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="Search by document name or recipient" 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className={styles.sortSelect}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Serial Number</th>
            <th>Document Name</th>
            <th>Recipient</th>
            <th>Date Created</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item.serialNumber}</td>
              <td>{item.documentName}</td>
              <td>{item.recipient}</td>
              <td>{item.dateCreated}</td>
              <td className={getStatusClass(item.modified)}>{item.modified}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.pagination}>
        <span>Showing data 1 to 8 of 256K entries</span>
        <div className={styles.pageNumbers}>
          <button>&lt;</button>
          <button className={styles.active}>1</button>
          <button>2</button>
          <button>3</button>
          <button>4</button>
          <span>...</span>
          <button>40</button>
          <button>&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default TransferredInDashboard;
