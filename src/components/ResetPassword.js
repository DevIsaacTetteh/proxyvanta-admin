import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Fade,
  Zoom,
  useTheme,
  Card,
  CardContent,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  LockReset,
  CheckCircle,
  Error as ErrorIcon,
  Security,
  AdminPanelSettings
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowPasswordConfirm(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 50) {
      setError('Password is too weak. Please use a stronger password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: formData.password
      });

      setResetSuccess(true);
      setMessage('Password reset successful! Redirecting to admin login...');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 25) return '#f44336';
    if (passwordStrength < 50) return '#ff9800';
    if (passwordStrength < 75) return '#2196f3';
    return '#4caf50';
  };

  const getStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
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
                Reset Admin Password
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Enter your new admin password below
              </Typography>
            </Box>

            {/* Success Message */}
            {resetSuccess && (
              <Zoom in={true}>
                <Alert
                  severity="success"
                  icon={<CheckCircle />}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: '#4caf50',
                    }
                  }}
                >
                  {message}
                </Alert>
              </Zoom>
            )}

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
            {!resetSuccess && (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* New Password */}
                <TextField
                  fullWidth
                  label="New Admin Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Password Strength
                      </Typography>
                      <Typography variant="body2" sx={{ color: getStrengthColor(), fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {getStrengthText()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      sx={{
                        height: { xs: 6, sm: 8 },
                        borderRadius: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getStrengthColor(),
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Use at least 8 characters with uppercase, lowercase, and numbers
                    </Typography>
                  </Box>
                )}

                {/* Confirm Password */}
                <TextField
                  fullWidth
                  label="Confirm New Admin Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  required
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
                      <Security sx={{ color: 'action.active', mr: 1, fontSize: { xs: 18, sm: 20 } }} />
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                  startIcon={loading ? null : <LockReset />}
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
                  {loading ? 'Resetting...' : 'Reset Admin Password'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default ResetPassword;