import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import { CSVMappingConfig } from "@/services/csvMappingService";

interface GroupMember {
  user_id: number;
  role: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  metadata?: {
    rowCount: number;
    columnCount: number;
    fileSize: string;
    lastModified: string;
  };
  mappingConfig?: CSVMappingConfig;
  uniqueEntryByValues?: string[];
}

interface CSVMappingModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (configs: Record<string, CSVMappingConfig>) => void;
  groupId: number;
  userId: number;
  groupMembers: GroupMember[];
  files: FileWithProgress[];
  isLoading?: boolean;
}

const CSVMappingModal: React.FC<CSVMappingModalProps> = ({
  open,
  onClose,
  onConfirm,
  groupId,
  userId,
  groupMembers,
  files,
  isLoading = false,
}) => {
  const [mappings, setMappings] = useState<
    Record<string, Record<string, number>>
  >({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && files.length > 0) {
      // Initialize mappings for all files
      const initialMappings: Record<string, Record<string, number>> = {};

      files.forEach((fileItem) => {
        if (
          fileItem.uniqueEntryByValues &&
          fileItem.uniqueEntryByValues.length > 0
        ) {
          const fileMapping: Record<string, number> = {};
          fileItem.uniqueEntryByValues.forEach((entryBy, index) => {
            if (groupMembers[index]) {
              fileMapping[entryBy] = groupMembers[index].user_id;
            } else if (groupMembers.length > 0) {
              fileMapping[entryBy] = groupMembers[0].user_id;
            }
          });
          initialMappings[fileItem.id] = fileMapping;
        }
      });

      setMappings(initialMappings);
    }
  }, [open, files, groupMembers]);

  const handleMappingChange = (
    fileId: string,
    fieldName: string,
    value: string,
    userId: number
  ) => {
    setMappings((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        [value]: userId,
      },
    }));
  };

  const handleConfirm = () => {
    // Validate that all files have complete mappings
    const unmappedFiles: string[] = [];

    files.forEach((fileItem) => {
      if (
        fileItem.uniqueEntryByValues &&
        fileItem.uniqueEntryByValues.length > 0
      ) {
        const fileMapping = mappings[fileItem.id];
        if (!fileMapping) {
          unmappedFiles.push(fileItem.file.name);
          return;
        }

        const unmappedValues = fileItem.uniqueEntryByValues.filter(
          (value) => !fileMapping[value]
        );
        if (unmappedValues.length > 0) {
          unmappedFiles.push(fileItem.file.name);
        }
      }
    });

    if (unmappedFiles.length > 0) {
      setError(`Please complete mapping for: ${unmappedFiles.join(", ")}`);
      return;
    }

    // Create configs for all files
    const configs: Record<string, CSVMappingConfig> = {};

    files.forEach((fileItem) => {
      if (
        fileItem.uniqueEntryByValues &&
        fileItem.uniqueEntryByValues.length > 0
      ) {
        const fileMapping = mappings[fileItem.id];
        if (fileMapping) {
          configs[fileItem.id] = {
            groupId,
            userId,
            entryByMapping: fileMapping,
          };
        }
      }
    });

    onConfirm(configs);
  };

  const getMemberDisplayName = (member: GroupMember): string => {
    return member.full_name || member.email;
  };

  const filesNeedingMapping = files.filter(
    (f) => f.uniqueEntryByValues && f.uniqueEntryByValues.length > 0
  );

  const renderCompactView = () => (
    <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>File</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Field</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Value</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>
              Map To
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filesNeedingMapping.map((fileItem) =>
            fileItem.uniqueEntryByValues?.map((value, index) => (
              <TableRow key={`${fileItem.id}-${value}`}>
                <TableCell>
                  {index === 0 && (
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      {fileItem.file.name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {index === 0 && (
                    <Chip label="Entry By" size="small" color="primary" />
                  )}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {value}
                  </Typography>
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={mappings[fileItem.id]?.[value] || ""}
                      onChange={(e) =>
                        handleMappingChange(
                          fileItem.id,
                          "Entry By",
                          value,
                          e.target.value
                        )
                      }
                      size="small"
                    >
                      {groupMembers.map((member) => (
                        <MenuItem key={member.user_id} value={member.user_id}>
                          {getMemberDisplayName(member)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Map CSV Field Values to Group Members</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please map each field value from your CSV files to a group member.
          This will determine who is recorded as the payer for each transaction.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Files Requiring Mapping ({filesNeedingMapping.length}):
          </Typography>

          {renderCompactView()}

          {filesNeedingMapping.length === 0 && (
            <Alert severity="info">
              All files already have mapping configurations or don&apos;t
              require mapping.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isLoading || filesNeedingMapping.length === 0}
        >
          Confirm All Mappings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CSVMappingModal;
