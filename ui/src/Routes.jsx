import React, { useContext, useState } from 'react';
import { UserContext } from './UserContext';
import LoginForm from './Page/Login';
import RegistrationForm from './Page/Register';
import Main from './Component/Main';
const Routes = () => {
  const { username, id } = useContext(UserContext);
  const [showRegister, setShowRegister] = useState(false);

  const handleRegisterClick = () => {
    setShowRegister(true);
  };

  if (username || id) {
    return <Main />;
  }

  return (
    <>
      {!showRegister ? (
        <LoginForm onRegisterClick={handleRegisterClick} />
      ) : (
        <RegistrationForm />
      )}
    </>
  );
};

export default Routes;
