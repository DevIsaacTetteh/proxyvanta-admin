import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import OrderManagement from './components/OrderManagement';
import PricingConfig from './components/PricingConfig';
import ProxyPoolManagement from './components/ProxyPoolManagement';
import ProxyStatsDashboard from './components/ProxyStatsDashboard';
import LogsMonitor from './components/LogsMonitor';
import SupportManagement from './components/SupportManagement';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  VpnKey as VpnKeyIcon,
  BarChart as BarChartIcon,
  Assessment as AssessmentIcon,
  Support as SupportIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: '#1a237e', // Deep blue
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#ff6f00', // Orange accent
      light: '#ffa040',
      dark: '#c43e00',
    },
    background: {
      default: '#f5f7f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      fontWeight: 800,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 'clamp(1.25rem, 3vw, 1.875rem)',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: 'clamp(1rem, 2vw, 1.25rem)',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
    },
    caption: {
      fontSize: 'clamp(0.7rem, 1.2vw, 0.75rem)',
      lineHeight: 1.5,
    },
  },
  spacing: (factor) => `${0.25 * factor}rem`,
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: {
            xs: 16,
            sm: 24,
            md: 32,
            lg: 40,
          },
          paddingRight: {
            xs: 16,
            sm: 24,
            md: 32,
            lg: 40,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 30%, #3f51b5 70%, #5e35b1 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #1a237e 0%, #283593 50%, #303f9f 100%)',
          color: 'white',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
          width: {
            xs: 280,
            sm: 300,
            md: 320,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: {
            xs: '12px 16px',
            sm: '14px 20px',
            md: '16px 24px',
          },
          fontSize: {
            xs: '0.85rem',
            sm: '0.9rem',
            md: '0.95rem',
          },
          minHeight: {
            xs: 44,
            sm: 48,
            md: 52,
          },
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: {
            xs: 12,
            sm: 16,
            md: 20,
          },
          boxShadow: {
            xs: '0 4px 12px rgba(0,0,0,0.08)',
            sm: '0 6px 20px rgba(0,0,0,0.1)',
            md: '0 8px 32px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: {
            xs: '0.75rem',
            sm: '0.8rem',
            md: '0.85rem',
          },
          height: {
            xs: 28,
            sm: 32,
            md: 36,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: {
            xs: 8,
            sm: 10,
            md: 12,
          },
          margin: {
            xs: '4px 8px',
            sm: '6px 12px',
            md: '8px 16px',
          },
          padding: {
            xs: '12px 16px',
            sm: '14px 18px',
            md: '16px 20px',
          },
        },
      },
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Typography>Loading...</Typography>;
  return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Users', path: '/users', icon: <PeopleIcon /> },
    { text: 'Orders', path: '/orders', icon: <ShoppingCartIcon /> },
    { text: 'Pricing', path: '/pricing', icon: <AttachMoneyIcon /> },
    { text: 'Proxy Pool', path: '/proxies/pool', icon: <VpnKeyIcon /> },
    { text: 'Proxy Stats', path: '/proxies/stats', icon: <BarChartIcon /> },
    { text: 'Logs', path: '/logs', icon: <AssessmentIcon /> },
    { text: 'Support', path: '/tickets', icon: <SupportIcon /> },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box sx={{ width: 280 }}>
      {/* Logo Section */}
      <Box sx={{
        p: 3,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              mr: 2,
              width: 48,
              height: 48,
              boxShadow: '0 4px 12px rgba(255,111,0,0.3)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            <SecurityIcon sx={{ color: 'white', fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: '1.2rem',
                color: 'white',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              PROXYVANTA PIA S5
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.75rem',
                lineHeight: 1,
                fontWeight: 500,
                letterSpacing: '0.02em'
              }}
            >
              Admin Panel
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component="a"
              href={item.path}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: '1.4rem',
                letterSpacing: '-0.02em',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              PROXYVANTA PIA S5 Admin
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: '1.2rem',
                letterSpacing: '-0.02em',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                display: { xs: 'block', sm: 'none' }
              }}
            >
              PROXYVANTA PIA S5 Admin
            </Typography>
          </Box>

          {/* User Info */}
          <Box sx={{ flexGrow: 1 }} />
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={`Admin: ${user.email}`}
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  display: { xs: 'none', md: 'flex' },
                  '& .MuiChip-label': {
                    fontWeight: 500,
                    fontSize: '0.85rem'
                  }
                }}
                icon={<AdminIcon />}
              />
              <Button
                color="inherit"
                onClick={logout}
                startIcon={<LogoutIcon />}
                sx={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0,0,0,0.08)',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout><UserManagement /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Layout><OrderManagement /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/pricing" element={
              <ProtectedRoute>
                <Layout><PricingConfig /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/logs" element={
              <ProtectedRoute>
                <Layout><LogsMonitor /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/proxies/pool" element={
              <ProtectedRoute>
                <Layout><ProxyPoolManagement /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/proxies/stats" element={
              <ProtectedRoute>
                <Layout><ProxyStatsDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <Layout><SupportManagement /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
