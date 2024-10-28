import React from 'react';
import styles from './Profile.module.css';
import universityLogo from '../../../assets/logo.png';

export function Profile() {
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarContainer}>
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/40de4afe7756242bae0b94bb31dd4d0e506fdfca0602fd790cfcf481e417d257?placeholderIfAbsent=true&apiKey=1194e150faa74888af77be55eb83006a" alt="User Avatar" className={styles.profileAvatar} />
          <div className={styles.cameraIcon}>📷</div>
        </div>
        <h2 className={styles.profileTitle}>Profile Information</h2>
      </div>
      <div className={styles.profileContent}>
        <div className={styles.profileForm}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" value="Conor" readOnly />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName" value="McGregor" readOnly />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" value="User00001" readOnly />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value="user00001@servicedeck.io" readOnly />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="number">Number</label>
            <input type="tel" id="number" value="+63 906 1738 619" readOnly />
          </div>
        </div>
        <div className={styles.profileLogo}>
          <img src={universityLogo} alt="University Logo" />
        </div>
      </div>
    </div>
  );
}
