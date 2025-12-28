import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Box, Card, CardContent,
  Avatar, Chip, TextField, InputAdornment, Grid, CircularProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider,
  useMediaQuery, useTheme, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  Public as PublicIcon,
  AttachMoney as MoneyIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  VpnKey as VpnKeyIcon,
  Numbers as NumbersIcon,
  FileDownload as DownloadIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import api from '../services/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, totalRevenue: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Forex rates for order revenue display
  const [forexRates, setForexRates] = useState({
    usdToGhs: 12, // Fallback GHS rate
    lastUpdated: null
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.orders);
      calculateStats(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchForexRates(); // Fetch initial forex rates

    // Set up periodic forex rate updates every 5 minutes
    const forexInterval = setInterval(fetchForexRates, 5 * 60 * 1000);

    return () => {
      clearInterval(forexInterval);
    };
  }, [fetchOrders]);

  useEffect(() => {
    const filtered = orders.filter(order =>
      (
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.country && order.country.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (statusFilter ? order.status === statusFilter : true) &&
      (countryFilter ? (order.country || '') === countryFilter : true)
    );
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, countryFilter]);

  const calculateStats = (orderList) => {
    const stats = {
      total: orderList.length,
      completed: orderList.filter(o => o.status === 'completed').length,
      pending: orderList.filter(o => o.status === 'pending').length,
      totalRevenue: orderList.reduce((sum, o) => sum + o.totalPrice, 0)
    };
    setStats(stats);
  };

  const fetchForexRates = async () => {
    try {
      // Using exchangerate-api.com for free forex rates
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();

      setForexRates({
        usdToGhs: data.rates.GHS,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to fetch forex rates:', error);
      // Fallback to approximate rate if API fails
      setForexRates({
        usdToGhs: 12, // Approximate GHS rate
        lastUpdated: new Date()
      });
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/orders/${orderId}`);
      setOrderDetails(response.data.order);
      setSelectedOrder(orderId);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const handleCopyCredentials = () => {
    if (!orderDetails) return;
    const cred = orderDetails.username && orderDetails.password
      ? `${orderDetails.username}:${orderDetails.password}`
      : '';
    if (!cred) return;
    navigator.clipboard.writeText(cred).then(() => {
      setSnackbarMessage('Credentials copied to clipboard');
      setSnackbarOpen(true);
    });
  };

  const handleExportCSV = () => {
    if (!filteredOrders.length) return;
    const headers = ['OrderID','Email','Quantity','Country','TotalPriceUSD','Status','CreatedAt'];
    const rows = filteredOrders.map(o => [
      o._id,
      o.user.email,
      o.quantity,
      o.country || 'Any',
      o.totalPrice,
      o.status,
      new Date(o.createdAt).toISOString()
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'pending': return <ScheduleIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return <ReceiptIcon />;
    }
  };

  if (loading && orders.length === 0) {
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
          Order Management
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
          Monitor and manage all customer orders, track revenue, and oversee order fulfillment.
        </Typography>
      </Box>

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
                <ShoppingCartIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
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
                Total Orders
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
                {stats.completed}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Completed
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
                <ScheduleIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                {stats.pending}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Pending
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
                <MoneyIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      wordBreak: 'break-word'
                    }}
                  >
                    ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.85,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                    color="#fff"
                  >
                    GHS: ₵{(stats.totalRevenue * forexRates.usdToGhs).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }} color="#fff">
                    Rate: {forexRates.usdToGhs?.toFixed ? forexRates.usdToGhs.toFixed(2) : forexRates.usdToGhs} • Updated {forexRates.lastUpdated ? new Date(forexRates.lastUpdated).toLocaleTimeString() : '—'}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Filters */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search orders by email, status, or country..."
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
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="country-filter-label">Country</InputLabel>
                <Select
                  labelId="country-filter-label"
                  label="Country"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {[...new Set(orders.map(o => o.country).filter(Boolean))].map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Export CSV
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Orders List - Mobile Cards / Desktop Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          {isMobile ? (
            // Mobile Card View
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {filteredOrders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
                  <ShoppingCartIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    {searchTerm ? 'No orders found matching your search' : 'No orders placed yet'}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {filteredOrders.map((order) => (
                    <Card key={order._id} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{
                            bgcolor: 'primary.main',
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 },
                            mr: 2
                          }}>
                            {order.user.email.charAt(0).toUpperCase()}
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
                              {order.user.email}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              ID: {order._id.slice(-8)}
                            </Typography>
                          </Box>
                        </Box>

                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Quantity
                            </Typography>
                            <Chip
                              label={`${order.quantity} IPs`}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                color: 'primary.main',
                                fontSize: '0.7rem',
                                height: '24px'
                              }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Total
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                color: 'success.main',
                                fontSize: { xs: '1rem', sm: '1.1rem' }
                              }}
                            >
                              ${order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PublicIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {order.country || 'Any'}
                            </Typography>
                          </Box>
                          <Chip
                            icon={getStatusIcon(order.status)}
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              fontSize: '0.7rem',
                              height: '24px'
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>

                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleViewDetails(order._id)}
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
              <TableContainer sx={{
                overflowX: 'auto',
                maxHeight: { xs: '60vh', md: '70vh' },
                '& .MuiTable-root': {
                  minWidth: { xs: '800px', md: '100%' }
                }
              }}>
                <Table stickyHeader>
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
                      <TableCell>Customer</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="center">Country</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((order, index) => (
                      <TableRow
                        key={order._id}
                        sx={{
                          '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.04)' },
                          '&:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                          transition: 'background-color 0.2s ease',
                          '& .MuiTableCell-body': {
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            py: { xs: 1.5, sm: 2 },
                            px: { xs: 1, sm: 2 }
                          }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                            <Avatar sx={{
                              bgcolor: 'primary.main',
                              width: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 }
                            }}>
                              {order.user.email.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}>
                                {order.user.email}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{
                                fontSize: { xs: '0.65rem', sm: '0.75rem' }
                              }}>
                                ID: {order._id.slice(-8)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${order.quantity} IPs`}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              color: 'primary.main',
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 },
                              '& .MuiChip-label': {
                                px: { xs: 0.5, sm: 1 }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <PublicIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {order.country || 'Any'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" sx={{
                            fontWeight: 600,
                            color: 'success.main',
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}>
                            ${order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            ₵{(order.totalPrice * forexRates.usdToGhs).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={getStatusIcon(order.status)}
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              minWidth: { xs: '80px', sm: '100px' },
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 },
                              '& .MuiChip-label': {
                                px: { xs: 0.5, sm: 1 }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary" sx={{
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleViewDetails(order._id)}
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease',
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 }
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredOrders.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {searchTerm ? 'No orders found matching your search' : 'No orders placed yet'}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onClose={handleCloseDetails}
        maxWidth="md"
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
            <ShoppingCartIcon />
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
              Order Details
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Complete order information and credentials
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : orderDetails && (
            <Box>
              {/* Order Information Section */}
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
                  Order Information
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <NumbersIcon />
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">Order ID</Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontFamily: 'monospace',
                                wordBreak: 'break-word'
                              }}
                            >
                              {orderDetails._id}
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
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">Customer Email</Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                wordBreak: 'break-word'
                              }}
                            >
                              {orderDetails.user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Credentials Section */}
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
                  <VpnKeyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Proxy Credentials
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">Username</Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontFamily: 'monospace',
                                wordBreak: 'break-word'
                              }}
                            >
                              {orderDetails.username || 'Not assigned'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <VpnKeyIcon />
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">Password</Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontFamily: 'monospace',
                                wordBreak: 'break-word'
                              }}
                            >
                              {orderDetails.password || 'Not assigned'}
                            </Typography>
                          </Box>
                          {orderDetails.username && orderDetails.password && (
                            <Tooltip title="Copy credentials">
                              <IconButton onClick={handleCopyCredentials} sx={{ color: 'primary.main' }}>
                                <ContentCopyIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <NumbersIcon />
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">Total IPs</Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontFamily: 'monospace',
                                wordBreak: 'break-word'
                              }}
                            >
                              {orderDetails.TotalIp || orderDetails.quantity || 'Not assigned'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Order Details Section */}
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
                  Order Summary
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}>
                          <NumbersIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
                        </Avatar>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Total IPs</Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: 'success.main',
                            fontSize: { xs: '1.5rem', sm: '1.75rem' }
                          }}
                        >
                          {orderDetails.quantity}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}>
                          <MoneyIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
                        </Avatar>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Total Price</Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            fontSize: { xs: '1.5rem', sm: '1.75rem' }
                          }}
                        >
                          ${orderDetails.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2, width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}>
                          <PublicIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
                        </Avatar>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Country</Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: 'info.main',
                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                          }}
                        >
                          {orderDetails.country || 'Any'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Additional Details */}
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={{ xs: 1, sm: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Order Date</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Date(orderDetails.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Status</Typography>
                          <Chip
                            label={orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                            color={
                              orderDetails.status === 'completed' ? 'success' :
                              orderDetails.status === 'pending' ? 'warning' : 'error'
                            }
                            size="small"
                            sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
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
          {orderDetails && orderDetails.username && orderDetails.password && (
            <Button
              onClick={handleCopyCredentials}
              variant="contained"
              color="primary"
              startIcon={<ContentCopyIcon />}
              fullWidth={{ xs: true, sm: false }}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                order: { xs: 2, sm: 1 },
                minHeight: { xs: '44px', sm: 'auto' }
              }}
            >
              Copy Credentials
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderManagement;