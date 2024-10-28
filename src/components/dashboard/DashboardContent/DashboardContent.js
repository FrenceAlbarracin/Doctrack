import React from 'react';
import styles from './DashboardContent.module.css';
import { StatisticsSection } from './StatisticsSection';
import { TransactionHistory } from './TransactionHistory';
import { useParams } from 'react-router-dom';
import { Profile } from '../Profile/Profile';
import TransferredInDashboard from '../TransferredInDashboard/TransferredInDashboard';
import TransferredOutDashboard from '../TransferredOutDashboard/TransferredOutDashboard';
import NewUserApproval from '../ManageItems/NewUserApproval';
import ManageUsers from '../ManageItems/ManageUsers';

export function DashboardContent() {
  const { documentType } = useParams();

  return (
    <section className={styles.dashboardContent}>
      {documentType === 'profile' ? (
        <Profile />
      ) : documentType === 'transferred-in' ? (
        <TransferredInDashboard />
      ) : documentType === 'transferred-out' ? (
        <TransferredOutDashboard />
      ) : documentType === 'new-user-approval' ? (
        <NewUserApproval />
      ) : documentType === 'manage-users' ? (
        <ManageUsers />
      ) : (
        <>
          {!documentType && <StatisticsSection />}
          <TransactionHistory documentType={documentType} />
        </>
      )}
    </section>
  );
}
