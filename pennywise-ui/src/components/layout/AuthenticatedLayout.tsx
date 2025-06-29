'use client';

import React from 'react';
import Header from './Header';
import styles from '../../app/page.module.css';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  onSwitchGroup?: () => void;
}

export default function AuthenticatedLayout({ children, onSwitchGroup }: AuthenticatedLayoutProps) {
  return (
    <div className={styles.container}>
      <Header onSwitchGroup={onSwitchGroup} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
} 