import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ data }) => {
  if (!data) return null;
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSticky}>
        <div className={styles.brandRow}>
          <span className={styles.brandName}>{data.name}</span>
        </div>
        <div>{data.rating} · 리뷰 {data.reviewCount}</div>
        <button className={styles.ctaPrimary}>상담신청</button>
      </div>
    </aside>
  );
};

export default Sidebar;
