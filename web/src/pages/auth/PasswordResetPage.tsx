import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Logo size={80} />
            </div>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Check Your Email</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We've sent password reset instructions to <strong className="text-gray-900 dark:text-white">{email}</strong>
            </p>
            <Link to="/login" className="btn-primary btn-md">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-4">
            <Logo size={96} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset your <span className="text-primary-300">Our Game</span> Password</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Enter your email to receive reset instructions</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className="w-full btn-primary btn-md">
              Send Reset Instructions
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
