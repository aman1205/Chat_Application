import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthRoute = () => {
  const isAuthenticated = useSelector((state) => state.authReducer.isAuthenticated);

  return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
};

export default AuthRoute;
