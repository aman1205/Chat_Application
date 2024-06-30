// /src/redux/reducers/authReducer.js

const initialState = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
  };
  
  const authReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'LOGIN_SUCCESS':
        return {
          ...state,
          isAuthenticated: true,
          user: action.payload.user,
          accessToken: action.payload.accessToken,
        };
      case 'LOGOUT':
        return {
          ...state,
          isAuthenticated: false,
          user: null,
          accessToken: null,
        };
      default:
        return state;
    }
  };
  
  export default authReducer;
  