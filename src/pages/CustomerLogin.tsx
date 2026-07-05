import { useState, ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CustomerLoginProps {
  onSuccess: () => void;
  onBack:    () => void;
}

type Tab = 'login' | 'register';

const CustomerLogin = ({ onSuccess, onBack }: CustomerLoginProps): ReactElement => {
  const { loginAsCustomer, register } = useAuth();
  const [tab, setTab] = useState<Tab>('login');

  // Login state
  const [loginEmail,    setLoginEmail]    = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError,    setLoginError]    = useState<string>('');
  const [loginLoading,  setLoginLoading]  = useState<boolean>(false);

  // Register state
  const [regName,     setRegName]     = useState<string>('');
  const [regEmail,    setRegEmail]    = useState<string>('');
  const [regPhone,    setRegPhone]    = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirm,  setRegConfirm]  = useState<string>('');
  const [regError,    setRegError]    = useState<string>('');
  const [regLoading,  setRegLoading]  = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter your email and password.');
      return;
    }
    setLoginLoading(true);
    const result = await loginAsCustomer(loginEmail.trim(), loginPassword);
    setLoginLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setLoginError(result.message);
    }
  };

  const handleRegister = async (): Promise<void> => {
    setRegError('');
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Name, email and password are required.');
      return;
    }
    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters.');
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match.');
      return;
    }
    setRegLoading(true);
    const result = await register(regName.trim(), regEmail.trim(), regPassword, regPhone || undefined);
    setRegLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setRegError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-elvar-bg flex">

      {/* Decorative left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-elvar-surface p-12 border-r border-elvar-border flex-shrink-0">
        <div>
          <p className="font-body text-xs tracking-widest3 uppercase text-elvar-muted mb-6">
            Élvar Clothing
          </p>
          <h2 className="font-display text-5xl font-light text-elvar-cream leading-tight">
            Dressed<br />
            <em>with</em><br />
            Purpose.
          </h2>
          <div className="gold-line mt-8" />
        </div>
        <div>
          <p className="font-body text-xs text-elvar-muted leading-relaxed">
            Handcrafted haute couture from the<br />island of Sri Lanka.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Back */}
          <button onClick={onBack} className="flex items-center gap-2 text-elvar-muted text-xs font-body tracking-widest uppercase mb-10 hover:text-elvar-cream transition-colors">
            <span>&#8592;</span> Back to Store
          </button>

          <p className="font-body text-xs tracking-widest3 uppercase text-elvar-muted mb-2">
            My Account
          </p>

          {/* Tabs */}
          <div className="flex mb-8 border-b border-elvar-border">
            <button
              onClick={() => setTab('login')}
              className={'pb-3 mr-8 font-body text-sm tracking-widest uppercase transition-colors ' +
                (tab === 'login'
                  ? 'text-elvar-gold border-b border-elvar-gold'
                  : 'text-elvar-muted hover:text-elvar-cream')}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={'pb-3 font-body text-sm tracking-widest uppercase transition-colors ' +
                (tab === 'register'
                  ? 'text-elvar-gold border-b border-elvar-gold'
                  : 'text-elvar-muted hover:text-elvar-cream')}
            >
              Create Account
            </button>
          </div>

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <div className="space-y-8">
              <div>
                <label className="elvar-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="you@example.com"
                  className="elvar-input"
                />
              </div>
              <div>
                <label className="elvar-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="elvar-input"
                />
              </div>
              {loginError && (
                <p className="text-red-400 text-xs font-body">{loginError}</p>
              )}
              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="elvar-btn w-full"
              >
                {loginLoading ? 'Signing In…' : 'Sign In to Your Account'}
              </button>
              <p className="text-center text-xs text-elvar-muted font-body">
                New to Élvar?{' '}
                <button
                  onClick={() => setTab('register')}
                  className="text-elvar-gold hover:text-elvar-gold-light underline underline-offset-2"
                >
                  Create an account
                </button>
              </p>
            </div>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <div className="space-y-8">
              <div>
                <label className="elvar-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Your full name"
                  className="elvar-input"
                />
              </div>
              <div>
                <label className="elvar-label" htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="elvar-input"
                />
              </div>
              <div>
                <label className="elvar-label" htmlFor="reg-phone">Phone Number <span className="normal-case font-light">(optional)</span></label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+94 77 000 0000"
                  className="elvar-input"
                />
              </div>
              <div>
                <label className="elvar-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="elvar-input"
                />
              </div>
              <div>
                <label className="elvar-label" htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={regConfirm}
                  onChange={e => setRegConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  placeholder="Repeat your password"
                  className="elvar-input"
                />
              </div>
              {regError && (
                <p className="text-red-400 text-xs font-body">{regError}</p>
              )}
              <button
                onClick={handleRegister}
                disabled={regLoading}
                className="elvar-btn w-full"
              >
                {regLoading ? 'Creating Account…' : 'Create My Account'}
              </button>
              <p className="text-center text-xs text-elvar-muted font-body">
                Already have an account?{' '}
                <button
                  onClick={() => setTab('login')}
                  className="text-elvar-gold hover:text-elvar-gold-light underline underline-offset-2"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
