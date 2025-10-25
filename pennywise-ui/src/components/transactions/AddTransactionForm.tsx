'use client';

import React from 'react';
import { TransactionType, TransactionCreate } from '@/types/transaction';
import { User } from '@/types/user';
import { GroupMember } from '@/types/group';
import TransactionForm from './TransactionForm';

interface AddTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionCreate) => Promise<void>;
  groupId: number | null;
  currentUser: User;
  groupMembers?: GroupMember[];
  isLoading?: boolean;
  initialTransactionType?: TransactionType | null;
}

export default function AddTransactionForm({
  open,
  onClose,
  onSubmit,
  groupId,
  currentUser,
  groupMembers = [],
  isLoading = false,
  initialTransactionType = null
}: AddTransactionFormProps) {
  const handleSubmit = async (data: TransactionCreate & { id?: number }) => {
    // Remove id field for add operation
    const transactionData: TransactionCreate = {
      group_id: data.group_id!,
      user_id: data.user_id,
      amount: data.amount,
      type: data.type,
      note: data.note,
      category: data.category,
      payment_mode: data.payment_mode,
      date: data.date,
      paid_by: data.paid_by,
    };
    await onSubmit(transactionData);
  };

  return (
    <TransactionForm
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      mode="add"
      groupId={groupId}
      currentUser={currentUser}
      groupMembers={groupMembers}
      isLoading={isLoading}
      initialTransactionType={initialTransactionType}
    />
  );
} 