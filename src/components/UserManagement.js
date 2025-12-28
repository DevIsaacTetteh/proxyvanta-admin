import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Card, CardContent, Avatar, Chip, TextField, InputAdornment,
  Grid, CircularProgress, IconButton, Tooltip, Divider, useMediaQuery, useTheme,
  Tabs, Tab, Alert, Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  AccountBalanceWallet as WalletIcon,
  AdminPanelSettings as AdminIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  CreditCard as CreditCardIcon,
  VpnKey as VpnKeyIcon,
  Numbers as NumbersIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  HowToReg as HowToRegIcon,
  Pending as PendingIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import api from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, admins: 0, totalBalance: 0 });
  const [ghanaRate, setGhanaRate] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [admins, setAdmins] = useState([]);
  const [adminStats, setAdminStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [isDefaultAdmin, setIsDefaultAdmin] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingWallet, setEditingWallet] = useState(false);
  const [newWalletBalance, setNewWalletBalance] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
      calculateStats(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await api.get('/admin/admins');
      setAdmins(response.data.admins);
      calculateAdminStats(response.data.admins);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setSnackbar({ open: true, message: 'Failed to fetch admins', severity: 'error' });
    }
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const calculateStats = (userList) => {
    const stats = {
      total: userList.length,
      active: userList.filter(u => u.walletBalance > 0).length,
      admins: userList.filter(u => u.role === 'admin').length,
      totalBalance: userList.reduce((sum, u) => sum + u.walletBalance, 0)
    };
    setStats(stats);
  };

  const calculateAdminStats = (adminList) => {
    const stats = {
      total: adminList.length,
      pending: adminList.filter(a => !a.isApproved).length,
      approved: adminList.filter(a => a.isApproved).length
    };
    setAdminStats(stats);
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      setIsDefaultAdmin(response.data.user.email === 'proxyvanta@gmail.com');
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAdmins();
    fetchCurrentUser();

    // Fetch Ghana exchange rate for balance conversion
    (async () => {
      try {
        const res = await api.get('/admin/ghana-payments/exchange-rate');
        setGhanaRate(res.data.rate || null);
      } catch (_) {
        setGhanaRate(null);
      }
    })();

    return () => {
      // Cleanup if needed
    };
  }, [fetchUsers, fetchAdmins, fetchCurrentUser]);

  const handleApproveAdmin = async (adminId) => {
    try {
      await api.patch(`/admin/admins/${adminId}/approve`);
      setSnackbar({ open: true, message: 'Admin approved successfully', severity: 'success' });
      fetchAdmins();
    } catch (error) {
      console.error('Failed to approve admin:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to approve admin', severity: 'error' });
    }
  };

  const handleDisapproveAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to disapprove this admin? They will lose admin privileges.')) {
      return;
    }

    try {
      await api.patch(`/admin/admins/${adminId}/disapprove`);
      setSnackbar({ open: true, message: 'Admin disapproved successfully', severity: 'success' });
      fetchAdmins();
    } catch (error) {
      console.error('Failed to disapprove admin:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to disapprove admin', severity: 'error' });
    }
  };

  const handleDeleteAdmin = async (adminId, adminEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete admin ${adminEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/admins/${adminId}`);
      setSnackbar({ open: true, message: 'Admin deleted successfully', severity: 'success' });
      fetchAdmins();
    } catch (error) {
      console.error('Failed to delete admin:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete admin', severity: 'error' });
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${userId}`);
      setUserDetails(response.data);
      setSelectedUser(userId);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  const handleUpdateWalletBalance = async () => {
    try {
      await api.put(`/admin/users/${selectedUser}/wallet`, { balance: newWalletBalance });
      setEditingWallet(false);
      // Refresh user details to show updated balance
      const response = await api.get(`/admin/users/${selectedUser}`);
      setUserDetails(response.data);
      setSnackbar({ open: true, message: 'Wallet balance updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to update wallet balance:', error);
      setSnackbar({ open: true, message: 'Failed to update wallet balance', severity: 'error' });
    }
  };

  const handleApproveTransaction = async (transactionId) => {
    try {
      await api.put(`/admin/transactions/${transactionId}/approve`);
      // Refresh user details to show updated transaction status
      if (selectedUser) {
        const response = await api.get(`/admin/users/${selectedUser}`);
        setUserDetails(response.data);
      }
    } catch (error) {
      console.error('Failed to approve transaction:', error);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${userEmail}? This action cannot be undone and will delete all associated data.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      // Refresh the users list
      await fetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleSuspension = async (userId, userEmail, currentlySuspended) => {
    const action = currentlySuspended ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} user ${userEmail}?`)) {
      return;
    }

    try {
      await api.patch(`/admin/users/${userId}/toggle-suspension`);
      // Refresh the users list
      await fetchUsers();
      alert(`User ${action}ed successfully`);
    } catch (error) {
      console.error('Failed to toggle user suspension:', error);
      alert(`Failed to ${action} user: ` + (error.response?.data?.message || error.message));
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? <AdminIcon /> : <PersonIcon />;
  };

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3, lg: 4 }, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.5rem' }
          }}
        >
          User Management
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: '600px',
            mx: 'auto',
            px: { xs: 2, sm: 0 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Monitor and manage all registered users, their balances, and account activities.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} centered>
          <Tab label="Users" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Admins" icon={<AdminIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Panel 0 - Users */}
      {currentTab === 0 && (
        <>
      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: { xs: '80px', sm: '100px' },
              height: { xs: '80px', sm: '100px' },
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(30px, -30px)',
            }
          }}>
            <CardContent sx={{
              textAlign: 'center',
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
              position: 'relative',
              zIndex: 1
            }}>
              <Avatar sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                mx: 'auto',
                mb: 1,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 }
              }}>
                <PeopleIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Total Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: { xs: '80px', sm: '100px' },
              height: { xs: '80px', sm: '100px' },
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(30px, -30px)',
            }
          }}>
            <CardContent sx={{
              textAlign: 'center',
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
              position: 'relative',
              zIndex: 1
            }}>
              <Avatar sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                mx: 'auto',
                mb: 1,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 }
              }}>
                <CheckCircleIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                {stats.active}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Active Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: { xs: '80px', sm: '100px' },
              height: { xs: '80px', sm: '100px' },
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(30px, -30px)',
            }
          }}>
            <CardContent sx={{
              textAlign: 'center',
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
              position: 'relative',
              zIndex: 1
            }}>
              <Avatar sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                mx: 'auto',
                mb: 1,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 }
              }}>
                <AdminIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                {stats.admins}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Administrators
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: { xs: '80px', sm: '100px' },
              height: { xs: '80px', sm: '100px' },
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(30px, -30px)',
            }
          }}>
            <CardContent sx={{
              textAlign: 'center',
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
              position: 'relative',
              zIndex: 1
            }}>
              <Avatar sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                mx: 'auto',
                mb: 1,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 }
              }}>
                <WalletIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  USD: ${stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.85,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                  color="text.secondary"
                >
                  GHS: {ghanaRate ? `₵${(stats.totalBalance * ghanaRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Rate not set'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Total User Wallet Balance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Search and Filters */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <TextField
            fullWidth
            placeholder="Search users by email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: { xs: '100%', sm: '400px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(102, 126, 234, 0.04)',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                }
              }
            }}
          />
        </CardContent>
      </Card>
      {/* Users List - Mobile Cards / Desktop Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          {isMobile ? (
            // Mobile Card View
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {filteredUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
                  <PeopleIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    {searchTerm ? 'No users found matching your search' : 'No users registered yet'}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {filteredUsers.map((user, index) => (
                    <Card key={user._id} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{
                            bgcolor: 'primary.main',
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 },
                            mr: 2
                          }}>
                            {user.email.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {user.email}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              ID: {user._id.slice(-8)}
                            </Typography>
                          </Box>
                        </Box>

                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Balance
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                color: 'success.main',
                                fontSize: { xs: '1rem', sm: '1.1rem' }
                              }}
                            >
                              ${user.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Role
                            </Typography>
                            <Chip
                              icon={getRoleIcon(user.role)}
                              label={user.role}
                              color={getRoleColor(user.role)}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                fontSize: '0.7rem',
                                height: '24px'
                              }}
                            />
                          </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            icon={user.suspended ? <BlockIcon /> : <CheckCircleIcon />}
                            label={user.suspended ? 'Suspended' : 'Active'}
                            color={user.suspended ? 'error' : 'success'}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: '24px'
                            }}
                          />

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                onClick={() => handleViewDetails(user._id)}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': {
                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                  },
                                  width: 32,
                                  height: 32
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: '1rem' }} />
                              </IconButton>
                            </Tooltip>

                            {user.role !== 'admin' && (
                              <>
                                <Tooltip title={user.suspended ? 'Unsuspend User' : 'Suspend User'}>
                                  <IconButton
                                    onClick={() => handleToggleSuspension(user._id, user.email, user.suspended)}
                                    sx={{
                                      color: user.suspended ? 'success.main' : 'warning.main',
                                      '&:hover': {
                                        backgroundColor: user.suspended
                                          ? 'rgba(76, 175, 80, 0.1)'
                                          : 'rgba(255, 152, 0, 0.1)',
                                      },
                                      width: 32,
                                      height: 32
                                    }}
                                  >
                                    {user.suspended ? (
                                      <ActiveIcon sx={{ fontSize: '1rem' }} />
                                    ) : (
                                      <BlockIcon sx={{ fontSize: '1rem' }} />
                                    )}
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete User">
                                  <IconButton
                                    onClick={() => handleDeleteUser(user._id, user.email)}
                                    sx={{
                                      color: 'error.main',
                                      '&:hover': {
                                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                      },
                                      width: 32,
                                      height: 32
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: '1rem' }} />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            // Desktop Table View
            <>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 500, sm: 600 } }}>
                  <TableHead sx={{
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    '& .MuiTableCell-head': {
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: 'text.primary',
                      borderBottom: 'none',
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 1, sm: 2 }
                    }
                  }}>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell align="center">Country</TableCell>
                      <TableCell align="right">Balance</TableCell>
                      <TableCell align="center">Role</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow
                        key={user._id}
                        sx={{
                          '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.04)' },
                          '&:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                            <Avatar sx={{
                              bgcolor: 'primary.main',
                              width: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 },
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}>
                              {user.email.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: { xs: '120px', sm: '200px' }
                                }}
                              >
                                {user.email}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                              >
                                ID: {user._id.slice(-8)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: { xs: 1.5, sm: 2 },
                            px: { xs: 1, sm: 2 },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: 'text.primary',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              {user.country || 'Unknown'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: { xs: 1.5, sm: 2 },
                            px: { xs: 1, sm: 2 },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: 'success.main',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            ${user.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}
                        >
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={user.role}
                            color={getRoleColor(user.role)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              minWidth: { xs: '70px', sm: '80px' },
                              fontSize: { xs: '0.625rem', sm: '0.75rem' },
                              height: { xs: '24px', sm: '28px' }
                            }}
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}
                        >
                          <Chip
                            icon={user.suspended ? <BlockIcon /> : <CheckCircleIcon />}
                            label={user.suspended ? 'Suspended' : 'Active'}
                            color={user.suspended ? 'error' : 'success'}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              minWidth: { xs: '80px', sm: '90px' },
                              fontSize: { xs: '0.625rem', sm: '0.75rem' },
                              height: { xs: '24px', sm: '28px' }
                            }}
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}
                        >
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Tooltip title="View Details">
                              <IconButton
                                onClick={() => handleViewDetails(user._id)}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': {
                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease',
                                  width: { xs: 32, sm: 36 },
                                  height: { xs: 32, sm: 36 }
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                              </IconButton>
                            </Tooltip>

                            {user.role !== 'admin' && (
                              <>
                                <Tooltip title={user.suspended ? 'Unsuspend User' : 'Suspend User'}>
                                  <IconButton
                                    onClick={() => handleToggleSuspension(user._id, user.email, user.suspended)}
                                    sx={{
                                      color: user.suspended ? 'success.main' : 'warning.main',
                                      '&:hover': {
                                        backgroundColor: user.suspended
                                          ? 'rgba(76, 175, 80, 0.1)'
                                          : 'rgba(255, 152, 0, 0.1)',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease',
                                      width: { xs: 32, sm: 36 },
                                      height: { xs: 32, sm: 36 }
                                    }}
                                  >
                                    {user.suspended ? (
                                      <ActiveIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                                    ) : (
                                      <BlockIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                                    )}
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete User">
                                  <IconButton
                                    onClick={() => handleDeleteUser(user._id, user.email)}
                                    sx={{
                                      color: 'error.main',
                                      '&:hover': {
                                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease',
                                      width: { xs: 32, sm: 36 },
                                      height: { xs: 32, sm: 36 }
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredUsers.length === 0 && (
                <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 }, px: { xs: 2, sm: 3 } }}>
                  <PeopleIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    {searchTerm ? 'No users found matching your search' : 'No users registered yet'}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog
        open={!!selectedUser}
        onClose={handleCloseDetails}
        maxWidth="lg"
        fullWidth
        fullScreen={{ xs: true, sm: false }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            m: { xs: 0, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 }
        }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
            <PersonIcon />
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              User Details
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Comprehensive user information and activity
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : userDetails && (
            <Box>
              {/* User Info Section */}
              <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: 'primary.main',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  User Information
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <EmailIcon />
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">Email Address</Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                wordBreak: 'break-word'
                              }}
                            >
                              {userDetails.user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <WalletIcon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Wallet Balance</Typography>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingWallet(true);
                                  setNewWalletBalance(userDetails.user.walletBalance);
                                }}
                                sx={{ color: 'primary.main' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            {editingWallet ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={newWalletBalance}
                                  onChange={(e) => setNewWalletBalance(parseFloat(e.target.value) || 0)}
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                  }}
                                  sx={{ flex: 1 }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={handleUpdateWalletBalance}
                                  sx={{ color: 'success.main' }}
                                >
                                  <CheckIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => setEditingWallet(false)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: 'success.main',
                                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                }}
                              >
                                ${userDetails.user.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Transactions Section */}
              <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: 'primary.main',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Transaction History
                </Typography>
                {userDetails.transactions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ReceiptIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No transactions found
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: { xs: '300px', sm: '400px' }, overflow: 'auto' }}>
                    {userDetails.transactions.map((tx, index) => (
                      <Card key={tx._id} sx={{
                        mb: 2,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.06)'
                      }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
                            <Grid item xs={12} sm={6} md={4}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                                <Avatar sx={{
                                  bgcolor: tx.type === 'deposit' ? 'success.main' : tx.type === 'purchase' ? 'primary.main' : 'error.main',
                                  width: { xs: 36, sm: 40 },
                                  height: { xs: 36, sm: 40 }
                                }}>
                                  <CreditCardIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: { xs: '0.875rem', sm: '1rem' }
                                    }}
                                  >
                                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      wordBreak: 'break-word'
                                    }}
                                  >
                                    Ref: {tx.reference}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: tx.type === 'deposit' ? 'success.main' : 'error.main',
                                  fontSize: { xs: '1rem', sm: '1.25rem' }
                                }}
                              >
                                {tx.type === 'deposit' ? '+' : '-'}₵{tx.amount.toLocaleString()}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                {tx.description}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1, sm: 0 } }}>
                                <Chip
                                  label={tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                  color={
                                    tx.status === 'completed' ? 'success' :
                                    tx.status === 'pending' ? 'warning' : 'error'
                                  }
                                  size="small"
                                  icon={
                                    tx.status === 'completed' ? <CheckCircleIcon /> :
                                    tx.status === 'pending' ? <ScheduleIcon /> : <CloseIcon />
                                  }
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.625rem', sm: '0.75rem' },
                                    height: { xs: '24px', sm: '28px' }
                                  }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                                >
                                  {new Date(tx.createdAt).toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              {tx.status === 'pending' && tx.type === 'deposit' && (
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={<CheckIcon />}
                                  onClick={() => handleApproveTransaction(tx._id)}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    minWidth: { xs: '80px', sm: '100px' },
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    height: { xs: '32px', sm: '36px' }
                                  }}
                                >
                                  Approve
                                </Button>
                              )}
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Orders Section */}
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: 'primary.main',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Order History
                </Typography>
                {userDetails.orders.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ShoppingCartIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No orders found
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: { xs: '300px', sm: '400px' }, overflow: 'auto' }}>
                    {userDetails.orders.map((order, index) => (
                      <Card key={order._id} sx={{
                        mb: 2,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.06)'
                      }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                                <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                                  <NumbersIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="body2" color="text.secondary">Order ID</Typography>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: 'monospace',
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }}
                                  >
                                    {order._id.slice(-8).toUpperCase()}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                                <Avatar sx={{ bgcolor: 'info.main', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                                  <VpnKeyIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="body2" color="text.secondary">Credentials</Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: 'monospace',
                                      fontWeight: 500,
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      wordBreak: 'break-word'
                                    }}
                                  >
                                    {order.username && order.password ? `${order.username}:${order.password}` : 'Not assigned'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                                <Avatar sx={{ bgcolor: 'success.main', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                                  <ShoppingCartIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">Total IPs</Typography>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 700,
                                      color: 'success.main',
                                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}
                                  >
                                    {order.quantity}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                <Typography variant="body2" color="text.secondary">Total Price</Typography>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 700,
                                    color: 'primary.main',
                                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                  }}
                                >
                                  ₵{order.totalPrice.toLocaleString()}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  <Chip
                                    label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    color={
                                      order.status === 'completed' ? 'success' :
                                      order.status === 'pending' ? 'warning' : 'error'
                                    }
                                    size="small"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: { xs: '0.625rem', sm: '0.75rem' },
                                      height: { xs: '24px', sm: '28px' }
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                              <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                gap: { xs: 1, sm: 0 }
                              }}>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                  >
                                    Country: {order.country || 'Any'} • Type: {order.proxyType}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CalendarIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                                  >
                                    {new Date(order.createdAt).toLocaleString()}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: { xs: 2, sm: 3 },
          pt: { xs: 1.5, sm: 2 },
          borderTop: '1px solid rgba(0,0,0,0.08)',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button
            onClick={handleCloseDetails}
            variant="outlined"
            fullWidth={{ xs: true, sm: false }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              order: { xs: 1, sm: 2 },
              minHeight: { xs: '44px', sm: 'auto' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      </>
      )}

      {/* Tab Panel 1 - Admins */}
      {currentTab === 1 && (
        <>
          {/* Admin Statistics Cards */}
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {adminStats.total}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Admins
                      </Typography>
                    </Box>
                    <AdminIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {adminStats.pending}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Pending Approval
                      </Typography>
                    </Box>
                    <PendingIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {adminStats.approved}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Approved
                      </Typography>
                    </Box>
                    <HowToRegIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {!isDefaultAdmin && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Admin Management Restricted:</strong> Only the default admin account can approve, disapprove, or delete other admin accounts.
              </Typography>
            </Alert>
          )}

          {/* Admins List */}
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '& .MuiTableCell-head': {
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Approved By</TableCell>
                      <TableCell align="center">Approval Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin._id} sx={{
                        '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.04)' },
                        '&:last-child td': { border: 0 }
                      }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                              bgcolor: admin.isApproved ? 'success.main' : 'warning.main',
                              width: 36,
                              height: 36
                            }}>
                              <EmailIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {admin.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={admin.isApproved ? 'Approved' : 'Pending'}
                            color={admin.isApproved ? 'success' : 'warning'}
                            size="small"
                            icon={admin.isApproved ? <CheckCircleIcon /> : <PendingIcon />}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary">
                            {admin.approvedBy?.email || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary">
                            {admin.approvedAt ? new Date(admin.approvedAt).toLocaleDateString() : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {admin.isApproved ? (
                            isDefaultAdmin ? (
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Tooltip title="Disapprove Admin">
                                  <IconButton
                                    onClick={() => handleDisapproveAdmin(admin._id)}
                                    sx={{
                                      bgcolor: 'warning.main',
                                      color: 'white',
                                      '&:hover': { bgcolor: 'warning.dark' },
                                      width: 36,
                                      height: 36
                                    }}
                                  >
                                    <CloseIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                                {admin.email !== 'proxyvanta@gmail.com' && (
                                  <Tooltip title="Delete Admin">
                                    <IconButton
                                      onClick={() => handleDeleteAdmin(admin._id, admin.email)}
                                      sx={{
                                        bgcolor: 'error.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'error.dark' },
                                        width: 36,
                                        height: 36
                                      }}
                                    >
                                      <DeleteIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            ) : (
                              <Chip
                                label="Active"
                                color="success"
                                size="small"
                                variant="outlined"
                              />
                            )
                          ) : (
                            isDefaultAdmin ? (
                              <Tooltip title="Approve Admin">
                                <IconButton
                                  onClick={() => handleApproveAdmin(admin._id)}
                                  sx={{
                                    bgcolor: 'success.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'success.dark' },
                                    width: 36,
                                    height: 36
                                  }}
                                >
                                  <CheckIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Chip
                                label="Pending"
                                color="warning"
                                size="small"
                                variant="outlined"
                              />
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {admins.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <AdminIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No admins found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;