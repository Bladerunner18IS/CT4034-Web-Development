import React from 'react';
import { AuthProvider } from './AuthContext.js';
import App from './App.js'


const AuthApp = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AuthApp;
