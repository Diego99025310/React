import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { apiFetch } from '../services/api.js';
import { clearSession, readSession, writeSession } from '../services/session.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const persisted = readSession();
    return {
      token: persisted.token || '',
      role: persisted.role || '',
      userId: persisted.userId || '',
      userEmail: persisted.userEmail || ''
    };
  });

  useEffect(() => {
    if (state.token) {
      writeSession(state);
    }
  }, [state]);

  const login = useCallback(async ({ identifier, password }) => {
    const payload = await apiFetch('/login', {
      method: 'POST',
      body: { identifier, password },
      auth: false
    });

    const nextState = {
      token: payload.token || '',
      role: payload.user?.role || payload.role || '',
      userId: payload.user?.id != null ? String(payload.user.id) : payload.userId || '',
      userEmail: payload.user?.email || identifier
    };

    writeSession(nextState);
    setState(nextState);
    return nextState;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setState({ token: '', role: '', userId: '', userEmail: '' });
  }, []);

  const value = useMemo(
    () => ({
      token: state.token,
      user: {
        role: state.role,
        id: state.userId,
        email: state.userEmail
      },
      isAuthenticated: Boolean(state.token),
      login,
      logout
    }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return ctx;
};
