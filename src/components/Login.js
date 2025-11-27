import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Fade,
  
  useTheme,
  Card,
  CardContent,
  Avatar,
  
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
  Shield,
  
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, setUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      setError('Google authentication failed. Please try again.');
      // Clean URL
      window.history.replaceState({}, document.title, '/login');
      return;
    }

    if (token) {
      localStorage.setItem('adminToken', token);
      // Clean URL
      window.history.replaceState({}, document.title, '/login');
      api.get('/auth/profile').then(response => {
        setUser(response.data.user);
        navigate('/dashboard');
      }).catch(() => {
        setError('Authentication failed');
      });
    }
  }, [navigate, setUser]);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Admin Login attempt on device:', navigator.userAgent);
    console.log('API URL:', process.env.REACT_APP_API_URL);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Calling admin login API...');
      await login(formData.email, formData.password);
      console.log('Admin login successful');
      navigate('/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 2 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.1,
        }
      }}
    >
      <Fade in={true} timeout={800}>
        <Card
          elevation={24}
          sx={{
            maxWidth: { xs: '100%', sm: 450 },
            width: '100%',
            mx: { xs: 1, sm: 2 },
            borderRadius: { xs: 2, sm: 4 },
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
              <Avatar
                sx={{
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  mx: 'auto',
                  mb: 2,
                  background: 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)',
                  boxShadow: '0 8px 25px rgba(26, 35, 126, 0.3)',
                }}
              >
                <AdminPanelSettings sx={{ fontSize: { xs: 30, sm: 40 }, color: 'white' }} />
              </Avatar>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                Admin Portal
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Secure access to ProxyVanta administration
              </Typography>
            </Box>

            {/* Error Message */}
            {error && (
              <Fade in={true}>
                <Alert
                  severity="error"
                  icon={<ErrorIcon />}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: '#f44336',
                    }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Admin Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                autoComplete="email"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Email sx={{ color: 'action.active', mr: 1, fontSize: { xs: 18, sm: 20 } }} />
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                autoComplete="current-password"
                sx={{
                  mb: { xs: 2, sm: 3 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Lock sx={{ color: 'action.active', mr: 1, fontSize: { xs: 18, sm: 20 } }} />
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                startIcon={loading ? null : <Shield />}
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)',
                  boxShadow: '0 4px 15px rgba(26, 35, 126, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #151b5e 0%, #28167a 100%)',
                    boxShadow: '0 6px 20px rgba(26, 35, 126, 0.6)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {loading ? 'Authenticating...' : 'Access Admin Panel'}
              </Button>
            </Box>

            {/* Google Sign In */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => window.location.href = `${api.defaults.baseURL}/auth/google/admin`}
                startIcon={<img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 20, height: 20 }} />}
                sx={{
                  borderColor: '#4285f4',
                  color: '#4285f4',
                  '&:hover': {
                    borderColor: '#357ae8',
                    backgroundColor: '#f8f9fa'
                  }
                }}
              >
                Sign in with Google
              </Button>
            </Box>

            {/* Links */}
            <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: 'center', gap: 1, display: 'flex', flexDirection: 'column' }}>
              <Button
                variant="text"
                onClick={() => navigate('/register')}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    textDecoration: 'underline',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Create Admin Account
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/forgot-password')}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    textDecoration: 'underline',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Forgot Password?
              </Button>
            </Box>

            {/* Security Notice */}
            <Box sx={{ mt: { xs: 3, sm: 4 }, p: { xs: 1.5, sm: 2 }, background: 'rgba(26, 35, 126, 0.04)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                <Shield sx={{ fontSize: { xs: 14, sm: 16 } }} />
                Admin Security Notice
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                • This portal is restricted to authorized administrators only<br/>
                • All access attempts are logged and monitored<br/>
                • Use strong passwords and enable two-factor authentication
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default Login;