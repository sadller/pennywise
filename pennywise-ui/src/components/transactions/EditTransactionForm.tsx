'use client';

import React from 'react';
import { TransactionCreate, Transaction } from '@/types/transaction';
import { User } from '@/types/user';
import { GroupMember } from '@/types/group';
import TransactionForm from './TransactionForm';

interface EditTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionCreate & { id: number }) => Promise<void>;
  transaction: Transaction | null;
  groupMembers: GroupMember[];
  currentUser: User;
  isLoading?: boolean;
}

export default function EditTransactionForm({
  open,
  onClose,
  onSubmit,
  transaction,
  groupMembers = [],
  currentUser,
  isLoading = false
}: EditTransactionFormProps) {
  const handleSubmit = async (data: TransactionCreate & { id?: number }) => {
    // Ensure id is present for edit operation
    if (!data.id) {
      throw new Error('Transaction ID is required for editing');
    }
    await onSubmit(data as TransactionCreate & { id: number });
  };

  if (!transaction) return null;

  return (
    <TransactionForm
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      mode="edit"
      groupId={transaction.group_id}
      currentUser={currentUser}
      groupMembers={groupMembers}
      transaction={transaction}
      isLoading={isLoading}
    />
  );
}
