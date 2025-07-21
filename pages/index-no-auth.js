import React from 'react';
import Dashboard from '../components/Dashboard';

export default function Home() {
  // Temporarily disable authentication to test the dashboard
  const currentUser = 'test-user';

  const handleLogout = () => {
    console.log('🚪 Logout clicked (temp disabled)');
  };

  console.log('✅ Rendering Dashboard without authentication (temp)');
  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
}
