import { FormEvent, ReactElement, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const AdminLogin = (): ReactElement => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginAsAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = ((location.state as LocationState)?.from?.pathname) || '/admin/dashboard';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    const result = await loginAsAdmin(email.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Unable to authenticate.');
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0a09] text-[#f0ebe1] flex items-center justify-center px-6 py-12">
      <section className="w-full max-w-lg rounded-[28px] border border-[#2f2d2a] bg-[#12110f]/95 p-10 shadow-[0_40px_120px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="space-y-4 text-center mb-10">
          <p className="text-[0.65rem] uppercase tracking-[0.45em] text-[#c9a96e]/70">Administrator access</p>
          <h1 className="text-4xl font-light tracking-tight text-[#f0ebe1]">Élvar Portal</h1>
          <p className="text-sm leading-7 text-[#d7cec2]/80">
            Secure login for the Élvar admin dashboard. This page is intentionally hidden from the public storefront.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="admin-email" className="text-xs uppercase tracking-[0.35em] text-[#d7cec2]/70">
              Email address
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="off"
              className="w-full rounded-2xl border border-[#3a3834] bg-[#0f0d0c] px-4 py-3 text-sm text-[#f0ebe1] outline-none transition focus:border-[#c9a96e]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-password" className="text-xs uppercase tracking-[0.35em] text-[#d7cec2]/70">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="w-full rounded-2xl border border-[#3a3834] bg-[#0f0d0c] px-4 py-3 text-sm text-[#f0ebe1] outline-none transition focus:border-[#c9a96e]"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-700/50 bg-red-900/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#c9a96e] px-6 py-3 text-sm uppercase tracking-[0.35em] text-[#0a0a08] transition hover:bg-[#b09a5f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs uppercase tracking-[0.35em] text-[#d7cec2]/60">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="underline hover:text-[#f0ebe1]"
          >
            Return to storefront
          </button>
        </div>
      </section>
    </main>
  );
};

export default AdminLogin;
