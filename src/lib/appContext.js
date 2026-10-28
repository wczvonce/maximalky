import { createContext, useContext } from 'react';

// Navigation, toasts and the shared entry form, provided by the shell in App.jsx.
export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);
