import '@testing-library/react';

// Headlamp pluginLib globals — minimal stubs so components don't crash in tests
(window as any).pluginLib = {
  MuiCore: {
    Typography: ({ children, ...p }: any) => children,
    Box: ({ children, ...p }: any) => children,
    Paper: ({ children, ...p }: any) => children,
    CircularProgress: () => null,
    Alert: ({ children }: any) => children,
    TextField: () => null,
    InputAdornment: ({ children }: any) => children,
    Chip: ({ label }: any) => label,
    MenuItem: ({ children }: any) => children,
  },
  CommonComponents: {
    SectionBox: ({ children }: any) => children,
  },
};
