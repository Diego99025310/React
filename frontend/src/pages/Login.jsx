import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createLoginIdentifierMask } from '../services/formatters.js';
import { validators } from '../services/validation.js';
import { useAuth } from '../hooks/useAuth.js';

const useQueryParams = () => {
  const location = useLocation();
  return useMemo(() => {
    try {
      return new URLSearchParams(location.search);
    } catch (error) {
      return new URLSearchParams();
    }
  }, [location.search]);
};

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const params = useQueryParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [submitting, setSubmitting] = useState(false);
  const autoLoginTriggered = useRef(false);
  const identifierInputRef = useRef(null);
  const maskRef = useRef(createLoginIdentifierMask());

  useEffect(() => {
    document.body.dataset.page = 'login';
    return () => {
      delete document.body.dataset.page;
      maskRef.current.reset();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.role === 'master') {
      navigate('/master', { replace: true });
    } else {
      navigate('/influencer', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const presetIdentifier = params.get('email')?.trim() || '';
    const presetPassword = params.get('password') || '';
    if (presetIdentifier) {
      setIdentifier(maskRef.current(presetIdentifier));
    }
    if (presetPassword) {
      setPassword(presetPassword);
    }
  }, [params]);

  const setFeedback = useCallback((text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
  }, []);

  const clearLoginParams = useCallback(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('email');
      url.searchParams.delete('password');
      const newSearch = url.searchParams.toString();
      const newUrl = newSearch ? `${url.pathname}?${newSearch}` : url.pathname;
      window.history.replaceState({}, '', newUrl);
    } catch (error) {
      // noop
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    const cleanedIdentifier = identifier.trim();
    const cleanedPassword = password.trim();

    const identifierValid = validators.loginIdentifier(cleanedIdentifier);
    const passwordValid = validators.password(cleanedPassword);

    if (!identifierValid || !passwordValid) {
      setFeedback(
        'Informe um email ou telefone valido e uma senha (minimo 6 caracteres).',
        'error'
      );
      if (!identifierValid) {
        identifierInputRef.current?.focus();
      }
      return;
    }

    clearLoginParams();
    setSubmitting(true);
    setFeedback('Entrando...', 'info');

    try {
      const session = await login({ identifier: cleanedIdentifier, password: cleanedPassword });
      setFeedback('Login realizado com sucesso! Redirecionando...', 'success');
      window.setTimeout(() => {
        if (session.role === 'master') {
          navigate('/master', { replace: true });
        } else {
          navigate('/influencer', { replace: true });
        }
      }, 600);
    } catch (error) {
      if (error.status === 401) {
        setFeedback('Credenciais invalidas. Verifique e tente novamente.', 'error');
      } else {
        setFeedback(error.message || 'Nao foi possivel realizar o login.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }, [identifier, password, navigate, login, setFeedback, clearLoginParams, submitting]);

  useEffect(() => {
    const presetIdentifier = params.get('email')?.trim();
    const presetPassword = params.get('password');
    if (autoLoginTriggered.current) return;
    if (!presetIdentifier || !presetPassword) return;
    if (!validators.loginIdentifier(presetIdentifier) || !validators.password(presetPassword)) return;
    autoLoginTriggered.current = true;
    setFeedback('Entrando automaticamente...', 'info');
    const timer = window.setTimeout(() => {
      handleSubmit();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [params, handleSubmit, setFeedback]);

  const handleIdentifierChange = (event) => {
    const { value } = event.target;
    const masked = maskRef.current(value);
    setIdentifier(masked);
  };

  const handleIdentifierBlur = () => {
    if (!identifier.trim()) {
      maskRef.current.reset();
      setIdentifier('');
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" data-page="login">
      <div className="container max-w-md w-full">
        <section className="card bg-neutral-900/80 backdrop-blur border border-white/10 rounded-3xl p-10 space-y-6 shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-brand-pink">Login Pinklover</h2>
          <form id="loginForm" className="space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm font-medium text-neutral-200 space-y-2">
              <span>Email ou telefone</span>
              <input
                id="loginEmail"
                name="email"
                type="text"
                placeholder="Digite seu email ou telefone"
                required
                autoComplete="username"
                value={identifier}
                onChange={handleIdentifierChange}
                onBlur={handleIdentifierBlur}
                ref={identifierInputRef}
                className="w-full rounded-xl bg-neutral-800/80 border border-white/10 px-4 py-3 text-base focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/60"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-200 space-y-2">
              <span>Senha</span>
              <input
                id="loginPassword"
                name="password"
                type="password"
                placeholder="********"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl bg-neutral-800/80 border border-white/10 px-4 py-3 text-base focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/60"
              />
            </label>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-pink to-brand-purple px-6 py-3 text-base font-semibold tracking-wide shadow-lg shadow-brand-pink/30 transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-pink disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div
            id="loginMessage"
            className={`message text-center text-sm ${
              messageType === 'error'
                ? 'text-red-400'
                : messageType === 'success'
                ? 'text-emerald-400'
                : 'text-neutral-300'
            }`}
            aria-live="polite"
          >
            {message}
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
