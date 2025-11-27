import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Fade,
  Zoom,
  useTheme,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import {
  Email,
  ArrowBack,
  Send,
  CheckCircle,
  Error as ErrorIcon,
  AdminPanelSettings
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setEmailSent(true);
      setMessage('Password reset instructions have been sent to your email address.');

      // In development, also show the reset token for testing
      if (response.data.resetToken) {
        setMessage(`Password reset instructions have been sent to your email address.\n\nFor testing purposes:\nReset Token: ${response.data.resetToken}\n\nDirect Link: ${window.location.origin}/reset-password/${response.data.resetToken}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
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
                Admin Password Reset
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Enter your admin email address and we'll send you a link to reset your password
              </Typography>
            </Box>

            {/* Back to Login */}
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/login')}
                sx={{
                  color: theme.palette.primary.main,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '&:hover': {
                    backgroundColor: 'rgba(26, 35, 126, 0.08)',
                  }
                }}
              >
                Back to Admin Login
              </Button>
            </Box>

            {/* Success Message */}
            {emailSent && (
              <Zoom in={true}>
                <Alert
                  severity="success"
                  icon={<CheckCircle />}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: '#4caf50',
                    },
                    '& .MuiAlert-message': {
                      whiteSpace: 'pre-line',
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
            {!emailSent && (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth
                  label="Admin Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
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
                      <Email sx={{ color: 'action.active', mr: 1, fontSize: { xs: 18, sm: 20 } }} />
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? null : <Send />}
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
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Box>
            )}

            {/* Footer */}
            <Box sx={{ mt: { xs: 2, sm: 3 }, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Remember your password?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Admin Sign In
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default ForgotPassword;