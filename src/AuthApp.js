import React from 'react';
import { AuthProvider } from './AuthContext.js';
import { AuthInterceptor } from './Api.js';
import App from './App.js'


const AuthApp = () => {
  return (
    <AuthProvider>
      <AuthInterceptor>
        <App />
      </AuthInterceptor>
    </AuthProvider>
  );
}

export default AuthApp;
