// /src/redux/actions/authActions.js

export const loginSuccess = (user, accessToken) => ({
    type: 'LOGIN_SUCCESS',
    payload: { user, accessToken },
  });
  
  export const logout = () => ({
    type: 'LOGOUT',
  });
  