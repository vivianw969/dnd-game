'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeIn } from '@/utils/motion';
import { supabase } from '@/utils/supabase/client';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.8) 0%, rgba(17, 24, 39, 0.95) 100%)',
    padding: '2rem',
    color: '#ffffff',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  content: {
    maxWidth: '400px',
    margin: '0 auto',
    position: 'relative' as const,
    zIndex: 1
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #BB86FC, #03DAC6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '1rem'
  },
  form: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)'
  },
  inputGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.875rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  button: {
    width: '100%',
    background: 'linear-gradient(90deg, #BB86FC, #03DAC6)',
    color: '#000000',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '1rem',
    transition: 'all 0.3s ease'
  },
  error: {
    color: '#CF6679',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    textAlign: 'center' as const
  },
  loadingSpinner: {
    width: '1.5rem',
    height: '1.5rem',
    border: '2px solid rgba(187, 134, 252, 0.3)',
    borderTop: '2px solid #BB86FC',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  }
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignUp = searchParams.get('signup') === 'true';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        router.push('/mode');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/mode');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeIn('up', 'tween', 0.2, 1)}
      style={styles.container}
    >
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          style={styles.form}
          variants={fadeIn('up', 'tween', 0.3, 1)}
        >
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <motion.button
            type="submit"
            style={styles.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={styles.loadingSpinner} />
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </motion.button>
        </motion.form>

        {/* Toggle between Sign In and Sign Up */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.4, 1)}
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.875rem'
          }}
        >
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <motion.span
                onClick={() => router.push('/login')}
                style={{
                  color: '#BB86FC',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                whileHover={{ textDecoration: 'underline' }}
              >
                Sign In
              </motion.span>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <motion.span
                onClick={() => router.push('/login?signup=true')}
                style={{
                  color: '#BB86FC',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                whileHover={{ textDecoration: 'underline' }}
              >
                Sign Up
              </motion.span>
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
} 