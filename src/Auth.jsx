import { useState } from 'react';
import { supabase } from './lib/supabaseClient'; // Adjust path to your Supabase client
import './Auth.css';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMsg('');

    if (isSignUp) {
      // Sign Up flow
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Optional: attaches custom metadata to the user object
          data: {
            username: username.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setMessage(
          'Account created! Check your email to confirm (or sign in if confirmation is disabled).',
        );
      }
    } else {
      // Sign In flow
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
        <p className="auth-subtitle">
          {isSignUp
            ? 'Join the distraction-free community.'
            : 'Sign in to join the conversation.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="username">Display Name</label>
              <input
                id="username"
                type="text"
                placeholder="e.g., quiet_reader"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {errorMsg && <p className="auth-error">{errorMsg}</p>}
          {message && <p className="auth-success">{message}</p>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle">
          <span>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            type="button"
            className="toggle-link-btn"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
              setMessage('');
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
