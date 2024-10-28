import React, { useState } from 'react';
import styles from './TransferredOutDashboard.module.css';

const TransferredOutDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const transferredOutData = [
    { serialNumber: '10001', documentName: 'Apple', recipient: 'ExternalCorp', dateCreated: '5/03/2023', modified: '1 day ago' },
    { serialNumber: '10002', documentName: 'Amazon', recipient: 'PartnerInc', dateCreated: '5/03/2023', modified: '3 hours ago' },
    { serialNumber: '10003', documentName: 'Netflix', recipient: 'ClientLLC', dateCreated: '5/03/2023', modified: '2 days ago' },
    { serialNumber: '10004', documentName: 'Facebook', recipient: 'VendorCo', dateCreated: '5/03/2023', modified: '1 week ago' },
    { serialNumber: '10005', documentName: 'Twitter', recipient: 'SupplierInc', dateCreated: '5/03/2023', modified: '4 hours ago' },
    { serialNumber: '10006', documentName: 'LinkedIn', recipient: 'ConsultantGroup', dateCreated: '5/03/2023', modified: '1 day ago' },
    { serialNumber: '10007', documentName: 'Uber', recipient: 'ContractorLLC', dateCreated: '5/03/2023', modified: '3 days ago' },
    { serialNumber: '10008', documentName: 'Airbnb', recipient: 'OutsourceCorp', dateCreated: '5/03/2023', modified: '2 hours ago' },
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

  const filteredData = transferredOutData
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
      <h1 className={styles.title}>Transferred Out</h1>
      <div className={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="Search" 
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
              <td>
                <span className={`${styles.status} ${getStatusClass(item.modified)}`}>
                  {item.modified}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.pagination}>
        <span>Showing data 1 to 8 of 128K entries</span>
        <div className={styles.pageNumbers}>
          <button>&lt;</button>
          <button className={styles.active}>1</button>
          <button>2</button>
          <button>3</button>
          <button>4</button>
          <span>...</span>
          <button>20</button>
          <button>&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default TransferredOutDashboard;
