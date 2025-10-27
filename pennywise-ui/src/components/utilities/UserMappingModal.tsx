import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { User } from '@/types/user';

interface UserMappingModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (mapping: Record<string, number | 'ignore'>) => void;
  csvUsers: string[];
  groupMembers: User[];
  isImporting: boolean;
}

const UserMappingModal: React.FC<UserMappingModalProps> = ({
  open,
  onClose,
  onConfirm,
  csvUsers,
  groupMembers,
  isImporting,
}) => {
  const [mapping, setMapping] = useState<Record<string, number | 'ignore'>>({});

  useEffect(() => {
    if (open && csvUsers.length > 0) {
      // Initialize mappings
      const initialMapping: Record<string, number | 'ignore'> = {};

      csvUsers.forEach((csvUser) => {
        const matchedMember = groupMembers.find(
          (member) => (member.full_name && member.full_name === csvUser) || (member.email && member.email === csvUser)
        );
        initialMapping[csvUser] = matchedMember ? matchedMember.id : 'ignore';
      });

      setMapping(initialMapping);
    }
  }, [open, csvUsers, groupMembers]);

  const handleMappingChange = (csvUser: string, memberId: number | 'ignore') => {
    setMapping((prev) => ({
      ...prev,
      [csvUser]: memberId,
    }));
  };

  const handleConfirm = () => {
    onConfirm(mapping);
  };

  // Check if all users are mapped (no 'ignore' values)
  const isComplete = csvUsers.length === 0 || csvUsers.every(user => mapping[user] !== 'ignore');

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="h2">
            Map &apos;Paid By&apos; Users
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Map all users from your CSV file to a group member to proceed.
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', maxHeight: 'calc(80vh - 200px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>CSV User</TableCell>
                <TableCell>Group Member</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {csvUsers.map((csvUser) => (
                <TableRow key={csvUser}>
                  <TableCell>{csvUser}</TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={mapping[csvUser] || 'ignore'}
                        onChange={(e) => handleMappingChange(csvUser, e.target.value as number | 'ignore')}
                      >
                        {groupMembers.map((member) => (
                          <MenuItem key={member.id} value={member.id}>
                            {member.full_name || member.username || 'Unknown User'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={isImporting || !isComplete}
          >
            {isImporting ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserMappingModal;
