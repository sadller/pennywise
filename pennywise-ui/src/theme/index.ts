import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

export const theme = createTheme({
  shape: {
    borderRadius: 2, // base border radius
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Material-UI blue
      light: '#1976d2',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748b', // Slate gray
      light: '#94a3b8',
      dark: '#475569',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // Emerald green
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#06b6d4', // Cyan
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Slate 50
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Slate 800
      secondary: '#64748b', // Slate 500
    },
    divider: '#e2e8f0', // Slate 200
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          padding: '8px 16px',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
          },
        }),
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        }),
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          backgroundImage: 'none',
        }),
        rounded: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
        outlined: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          border: '1px solid #e2e8f0',
        }),
      },
    },
    MuiDialog: {
      defaultProps: {
        container: document.body,
        disableScrollLock: true,
        scroll: 'body',
      },
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
        paper: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          fontWeight: 500,
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: theme.shape.borderRadius,
          },
        }),
      },
    },
    MuiPopover: {
      defaultProps: {
        container: document.body,
        disableScrollLock: true,
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiMenu: {
      defaultProps: {
        container: document.body,
        disableScrollLock: true,
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        disablePortal: false,
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: '#f1f5f9',
          },
          '&.Mui-selected': {
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            '&:hover': {
              backgroundColor: '#bbdefb',
            },
          },
        }),
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: '2px solid',
          borderColor: theme.palette.grey[100],
          backgroundColor: 'white',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: theme.palette.grey[100],
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '1px solid',
            borderColor: theme.palette.grey[200],
            backgroundColor: theme.palette.grey[50],
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: '1px solid',
            borderColor: theme.palette.grey[200],
            fontWeight: 600,
          },
          '& .MuiDataGrid-toolbar': {
            backgroundColor: `${theme.palette.grey[50]} !important`,
            borderBottom: '1px solid',
            borderColor: theme.palette.grey[200],
          },
          '& .MuiDataGrid-toolbarContainer': {
            backgroundColor: `${theme.palette.grey[50]} !important`,
            padding: '8px 16px',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#e3f2fd',
            '& .MuiDataGrid-cell': {
              border: 'none',
            },
          },
          '& .MuiDataGrid-row.MuiDataGrid-row--editing': {
            backgroundColor: '#e8f5e8',
          },
          '& .MuiDataGrid-footerContainer': {
            overflow: 'unset',
            borderTop: '2px solid',
            borderColor: theme.palette.grey[200],
            '& .MuiTablePagination-root': {
              overflow: 'unset',
            },
          },
        }),
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          '& > .MuiGrid-item': {
            paddingTop: '24px',
            paddingLeft: '24px',
          },
        },
        container: {
          margin: '0',
          padding: '0',
          marginTop: '-24px',
          marginLeft: '-24px',
          width: 'calc(100% + 24px)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          height: '100%',
          width: '100%',
        },
        body: {
          height: '100%',
          margin: 0,
          padding: 0,
        },
        '#root': {
          height: '100%',
        },
        'input[type=number]': {
          MozAppearance: 'textfield',
          '&::-webkit-outer-spin-button': {
            margin: 0,
            WebkitAppearance: 'none',
          },
          '&::-webkit-inner-spin-button': {
            margin: 0,
            WebkitAppearance: 'none',
          },
        },
        img: {
          maxWidth: '100%',
          height: 'auto',
        },
      },
    },
  },
}); 