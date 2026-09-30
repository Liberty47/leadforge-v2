import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CheckCircle } from 'lucide-react';

export default function Activation() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const activate = useStore((state) => state.activate);
  const navigate = useNavigate();

  const handleActivate = async () => {
    const success = await activate(key);
    if (success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setError('Invalid activation key. Try DEMO-LEADFORGE-2026');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {success ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle size={48} className="text-accent" />
            </div>
            <h2 className="text-2xl font-semibold text-text mb-2">Activation successful</h2>
            <p className="text-text-muted">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-accent mb-2">LEAD FORGE</h1>
              <p className="text-text-muted">Find leads. Personalize outreach. Stay in control.</p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <label className="block text-sm font-medium text-text mb-2">
                Activation Key
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError('');
                }}
                placeholder="Enter activation key"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-subtle focus:outline-none focus:border-accent transition-colors"
              />
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
              <button
                onClick={handleActivate}
                className="w-full mt-4 px-4 py-3 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
              >
                Activate
              </button>
              <p className="mt-4 text-xs text-text-subtle text-center">
                Demo key: DEMO-LEADFORGE-2026
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
