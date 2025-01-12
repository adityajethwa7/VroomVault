import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthContext';

// Set the correct base URL for the server
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/users/me');
      setUser(res.data);
      setLoading(false);
      return res.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      setLoading(false);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      return res.data.user;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        throw error.response.data;
      } else if (error.request) {
        throw { msg: 'No response received from the server. Please try again.' };
      } else {
        throw { msg: 'Error setting up the request. Please try again.' };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post('/api/users/register', { name, email, password, role });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      return res.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        throw error.response.data;
      } else if (error.request) {
        throw { msg: 'No response received from the server. Please try again.' };
      } else {
        throw { msg: 'Error setting up the request. Please try again.' };
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;

