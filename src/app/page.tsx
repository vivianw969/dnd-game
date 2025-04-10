'use client';
import Home from '../components/Home';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      {/* Navigation Bar */}
      {isClient && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: '1.5rem',
            zIndex: 20,
            display: 'flex',
            gap: '1rem',
            pointerEvents: 'auto'
          }}
        >
          <motion.button
            onClick={() => {
              console.log('Navigating to login...');
              router.push('/login');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              position: 'relative',
              zIndex: 21
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
          <motion.button
            onClick={() => {
              console.log('Navigating to signup...');
              router.push('/login?signup=true');
            }}
            style={{
              background: 'linear-gradient(90deg, #BB86FC, #03DAC6)',
              color: '#000000',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              position: 'relative',
              zIndex: 21
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up
          </motion.button>
        </motion.div>
      )}
      <Home />
    </div>
  );
}