import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Grid, Button,
  TextField, Alert, Snackbar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar,
  Tabs, Tab, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Paper, FormControl,
  InputLabel, Select, MenuItem, Accordion, AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  RateReview as RateReviewIcon,
  AttachMoney as AttachMoneyIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import api from '../services/api';

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(162);
  const [newExchangeRate, setNewExchangeRate] = useState('');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nigerianTransactions, setNigerianTransactions] = useState([]);
  const [ghanaTransactions, setGhanaTransactions] = useState([]);
  const [stats, setStats] = useState({
    nigerian: { totalTransactions: 0, totalAmount: 0, totalAmountNGN: 0, todayTransactions: 0 },
    ghana: { totalTransactions: 0, totalAmount: 0, todayTransactions: 0 }
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    transaction: null,
    newAmount: '',
    country: ''
  });

  // Filter states
  const [nigerianFilters, setNigerianFilters] = useState({
    status: '',
    userEmail: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: ''
  });

  const [ghanaFilters, setGhanaFilters] = useState({
    status: '',
    userEmail: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: ''
  });

  const [filtersExpanded, setFiltersExpanded] = useState({
    nigerian: false,
    ghana: false
  });

  const fetchExchangeRate = useCallback(async () => {
    try {
      const response = await api.get('/admin/nigerian-payments/exchange-rate');
      setExchangeRate(response.data.rate);
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      showSnackbar('Failed to fetch exchange rate', 'error');
    }
  }, []);

  const fetchNigerianTransactions = useCallback(async (filters = nigerianFilters) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const queryString = params.toString();
      const url = `/admin/nigerian-payments/transactions${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      setNigerianTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch Nigerian transactions:', error);
      showSnackbar('Failed to fetch Nigerian transactions', 'error');
    }
  }, [nigerianFilters]);

  const fetchGhanaTransactions = useCallback(async (filters = ghanaFilters) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const queryString = params.toString();
      const url = `/admin/ghana-payments/transactions${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      setGhanaTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch Ghana transactions:', error);
      showSnackbar('Failed to fetch Ghana transactions', 'error');
    }
  }, [ghanaFilters]);

  const fetchStats = useCallback(async () => {
    try {
      const [nigeriaStats, ghanaStats] = await Promise.all([
        api.get('/admin/nigerian-payments/stats'),
        api.get('/admin/ghana-payments/stats')
      ]);

      setStats({
        nigerian: {
          totalTransactions: nigeriaStats.data.stats.totalTransactions || 0,
          totalAmount: nigeriaStats.data.stats.totalAmountGHS || 0,
          totalAmountNGN: nigeriaStats.data.stats.totalAmountNGN || 0,
          todayTransactions: nigeriaStats.data.stats.todayTransactions || 0
        },
        ghana: {
          totalTransactions: ghanaStats.data.stats.totalTransactions || 0,
          totalAmount: ghanaStats.data.stats.totalAmount || 0,
          todayTransactions: ghanaStats.data.stats.todayTransactions || 0
        }
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRate();
    fetchNigerianTransactions();
    fetchGhanaTransactions();
    fetchStats();
  }, [fetchExchangeRate, fetchNigerianTransactions, fetchGhanaTransactions, fetchStats]);

  // Auto-apply filters when they change
  useEffect(() => {
    fetchNigerianTransactions(nigerianFilters);
  }, [nigerianFilters, fetchNigerianTransactions]);

  useEffect(() => {
    fetchGhanaTransactions(ghanaFilters);
  }, [ghanaFilters, fetchGhanaTransactions]);

  const updateExchangeRate = async () => {
    if (!newExchangeRate || parseFloat(newExchangeRate) <= 0) {
      showSnackbar('Please enter a valid exchange rate', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.put('/admin/nigerian-payments/exchange-rate', {
        rate: parseFloat(newExchangeRate)
      });

      setExchangeRate(parseFloat(newExchangeRate));
      setIsEditingRate(false);
      setNewExchangeRate('');
      showSnackbar('Exchange rate updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update exchange rate:', error);
      showSnackbar('Failed to update exchange rate', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleNigerianFilterChange = (field, value) => {
    setNigerianFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGhanaFilterChange = (field, value) => {
    setGhanaFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyNigerianFilters = () => {
    fetchNigerianTransactions(nigerianFilters);
  };

  const applyGhanaFilters = () => {
    fetchGhanaTransactions(ghanaFilters);
  };

  const clearNigerianFilters = () => {
    setNigerianFilters({
      status: '',
      userEmail: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: ''
    });
    fetchNigerianTransactions({
      status: '',
      userEmail: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: ''
    });
  };

  const clearGhanaFilters = () => {
    setGhanaFilters({
      status: '',
      userEmail: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: ''
    });
    fetchGhanaTransactions({
      status: '',
      userEmail: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleEditAmount = (transaction, country) => {
    const displayAmount = country === 'nigeria' && transaction.convertedAmount
      ? transaction.convertedAmount
      : transaction.amount;

    setEditDialog({
      open: true,
      transaction,
      newAmount: displayAmount.toString(),
      country
    });
  };

  const handleSaveAmount = async () => {
    if (!editDialog.newAmount || parseFloat(editDialog.newAmount) <= 0) {
      showSnackbar('Please enter a valid amount', 'error');
      return;
    }

    try {
      const endpoint = editDialog.country === 'nigeria'
        ? `/admin/nigerian-payments/transaction/${editDialog.transaction._id}`
        : `/admin/ghana-payments/transaction/${editDialog.transaction._id}`;

      await api.put(endpoint, {
        amount: parseFloat(editDialog.newAmount)
      });

      // Refresh transactions
      if (editDialog.country === 'nigeria') {
        fetchNigerianTransactions();
      } else {
        fetchGhanaTransactions();
      }

      setEditDialog({ open: false, transaction: null, newAmount: '', country: '' });
      showSnackbar('Amount updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update amount:', error);
      showSnackbar('Failed to update amount', 'error');
    }
  };

  const handleApprovePayment = async (transactionId, country) => {
    try {
      const endpoint = country === 'nigeria'
        ? `/admin/nigerian-payments/transaction/${transactionId}/approve`
        : `/admin/ghana-payments/transaction/${transactionId}/approve`;

      await api.put(endpoint);

      // Refresh transactions
      if (country === 'nigeria') {
        fetchNigerianTransactions();
      } else {
        fetchGhanaTransactions();
      }

      showSnackbar('Payment approved successfully', 'success');
    } catch (error) {
      console.error('Failed to approve payment:', error);
      showSnackbar('Failed to approve payment', 'error');
    }
  };

  const handleDisapprovePayment = async (transactionId, country) => {
    try {
      const endpoint = country === 'nigeria'
        ? `/admin/nigerian-payments/transaction/${transactionId}/disapprove`
        : `/admin/ghana-payments/transaction/${transactionId}/disapprove`;

      await api.put(endpoint);

      // Refresh transactions
      if (country === 'nigeria') {
        fetchNigerianTransactions();
      } else {
        fetchGhanaTransactions();
      }

      showSnackbar('Payment disapproved successfully', 'success');
    } catch (error) {
      console.error('Failed to disapprove payment:', error);
      showSnackbar('Failed to disapprove payment', 'error');
    }
  };

  const handleDeletePayment = async (transactionId, country) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      const endpoint = country === 'nigeria'
        ? `/admin/nigerian-payments/transaction/${transactionId}`
        : `/admin/ghana-payments/transaction/${transactionId}`;

      await api.delete(endpoint);

      // Refresh transactions
      if (country === 'nigeria') {
        fetchNigerianTransactions();
      } else {
        fetchGhanaTransactions();
      }

      showSnackbar('Payment deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete payment:', error);
      showSnackbar('Failed to delete payment', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatCurrency = (amount, country) => {
    return new Intl.NumberFormat(country === 'nigeria' ? 'en-NG' : 'en-GH', {
      style: 'currency',
      currency: country === 'nigeria' ? 'NGN' : 'GHS'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'pending': return <RateReviewIcon />;
      case 'failed': return <CancelIcon />;
      default: return null;
    }
  };

  const renderTransactionTable = (transactions, country) => (
    <TableContainer component={Paper} sx={{ 
      mt: 2, 
      borderRadius: 2,
      overflowX: 'auto', // Enable horizontal scrolling on small screens
      '& .MuiTable-root': {
        minWidth: { xs: 600, sm: 700, md: '100%' } // Minimum width for proper display
      }
    }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              minWidth: 120
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                User Email
              </Box>
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              minWidth: 100
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyIcon fontSize="small" />
                Amount {country === 'nigeria' ? '(₦ NGN)' : '(₵ GHS)'}
              </Box>
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              minWidth: 120,
              display: { xs: 'none', sm: 'table-cell' } // Hide on extra small screens
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon fontSize="small" />
                Reference
              </Box>
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              minWidth: 100
            }}>
              Status
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              minWidth: 100,
              display: { xs: 'none', md: 'table-cell' } // Hide on small screens
            }}>
              Date
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              minWidth: 120
            }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={{ xs: 4, sm: 5, md: 6 }} 
                sx={{ textAlign: 'center', py: 4 }}
              >
                <Typography variant="body2" color="text.secondary">
                  No transactions found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction._id} hover>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {transaction.user?.email || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {country === 'nigeria' && transaction.convertedAmount
                      ? formatCurrency(transaction.convertedAmount, 'nigeria')
                      : formatCurrency(transaction.amount, country)
                    }
                  </Typography>
                </TableCell>
                <TableCell sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  display: { xs: 'none', sm: 'table-cell' }
                }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {transaction.reference || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <Chip
                    icon={getStatusIcon(transaction.status)}
                    label={transaction.status || 'pending'}
                    color={getStatusColor(transaction.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  display: { xs: 'none', md: 'table-cell' }
                }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit Amount">
                      <IconButton
                        size="small"
                        onClick={() => handleEditAmount(transaction, country)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {transaction.status !== 'completed' && (
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          onClick={() => handleApprovePayment(transaction._id, country)}
                          sx={{ color: 'success.main' }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {transaction.status !== 'failed' && (
                      <Tooltip title="Disapprove">
                        <IconButton
                          size="small"
                          onClick={() => handleDisapprovePayment(transaction._id, country)}
                          sx={{ color: 'warning.main' }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePayment(transaction._id, country)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            mb: 2, 
            color: 'primary.main',
            fontSize: { xs: '1.5rem', sm: '2.125rem' }
          }}
        >
          Payment Management
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Manage payments from Nigerian and Ghanaian users
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: 'primary.main', 
                      mb: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                  >
                    🇳🇬 Nigerian Payments
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '2.125rem' }
                    }}
                  >
                    {stats.nigerian.totalTransactions}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Total: {formatCurrency(stats.nigerian.totalAmount, 'ghana')}
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: { xs: 48, sm: 56 }, 
                  height: { xs: 48, sm: 56 }
                }}>
                  <PaymentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: 'primary.main', 
                      mb: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                  >
                    🇬🇭 Ghanaian Payments
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '2.125rem' }
                    }}
                  >
                    {stats.ghana.totalTransactions}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Total: {formatCurrency(stats.ghana.totalAmount, 'ghana')}
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: { xs: 48, sm: 56 }, 
                  height: { xs: 48, sm: 56 }
                }}>
                  <PaymentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
                textTransform: 'none'
              }
            }}
          >
            <Tab
              label={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 0.5, sm: 1 },
                  minWidth: { xs: 'auto', sm: '200px' }
                }}>
                  <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>🇳🇬</Typography>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: { sm: '0.9rem' } }}>
                      Nigerian Payments
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      NGN Transactions
                    </Typography>
                  </Box>
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      Nigeria
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 0.5, sm: 1 },
                  minWidth: { xs: 'auto', sm: '200px' }
                }}>
                  <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>🇬🇭</Typography>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: { sm: '0.9rem' } }}>
                      Ghanaian Payments
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      GHS Transactions
                    </Typography>
                  </Box>
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      Ghana
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Tabs>

          {/* Nigerian Payments Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Exchange Rate Management */}
              <Card sx={{ mb: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 2, sm: 0 },
                    justifyContent: { sm: 'space-between' }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CurrencyExchangeIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}>
                          NGN Exchange Rate
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current rate for Nigerian users
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: { xs: 'space-between', sm: 'flex-end' }
                    }}>
                      {!isEditingRate ? (
                        <>
                          <Typography variant="h5" sx={{ 
                            fontWeight: 800, 
                            color: 'primary.main',
                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                          }}>
                            {`₦${exchangeRate?.toLocaleString() || '162'}`}
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditingRate(true)}
                            size="small"
                            sx={{ minWidth: { xs: 'auto', sm: '64px' } }}
                          >
                            Edit
                          </Button>
                        </>
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          width: { xs: '100%', sm: 'auto' }
                        }}>
                          <TextField
                            size="small"
                            type="number"
                            value={newExchangeRate}
                            onChange={(e) => setNewExchangeRate(e.target.value)}
                            placeholder="Enter new rate"
                            sx={{ 
                              width: { xs: '100%', sm: 120 },
                              flex: { xs: 1, sm: 'none' }
                            }}
                          />
                          <IconButton
                            color="primary"
                            onClick={updateExchangeRate}
                            disabled={loading}
                            size="small"
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => {
                              setIsEditingRate(false);
                              setNewExchangeRate('');
                            }}
                            size="small"
                          >
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Nigerian Transactions Table */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: { sm: 'space-between' }, 
                mb: 2,
                gap: { xs: 2, sm: 0 }
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  Nigerian Payment Transactions
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchNigerianTransactions}
                  size="small"
                  sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}
                >
                  Refresh
                </Button>
              </Box>

              {/* Nigerian Filters */}
              <Accordion
                expanded={filtersExpanded.nigerian}
                onChange={() => setFiltersExpanded(prev => ({ ...prev, nigerian: !prev.nigerian }))}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ bgcolor: 'grey.50' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon />
                    <Typography sx={{ fontWeight: 600 }}>Filters</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
                  <Grid container spacing={{ xs: 2, sm: 2, md: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={nigerianFilters.status}
                          label="Status"
                          onChange={(e) => handleNigerianFilterChange('status', e.target.value)}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="disapproved">Disapproved</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="User Email"
                        value={nigerianFilters.userEmail}
                        onChange={(e) => handleNigerianFilterChange('userEmail', e.target.value)}
                        placeholder="Search by email"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Min Amount"
                        type="number"
                        value={nigerianFilters.minAmount}
                        onChange={(e) => handleNigerianFilterChange('minAmount', e.target.value)}
                        placeholder="0"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Max Amount"
                        type="number"
                        value={nigerianFilters.maxAmount}
                        onChange={(e) => handleNigerianFilterChange('maxAmount', e.target.value)}
                        placeholder="100000"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Start Date"
                        type="date"
                        value={nigerianFilters.startDate}
                        onChange={(e) => handleNigerianFilterChange('startDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="End Date"
                        type="date"
                        value={nigerianFilters.endDate}
                        onChange={(e) => handleNigerianFilterChange('endDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        justifyContent: { xs: 'center', sm: 'flex-end' },
                        flexDirection: { xs: 'column', sm: 'row' }
                      }}>
                        <Button
                          variant="outlined"
                          startIcon={<ClearIcon />}
                          onClick={clearNigerianFilters}
                          size="small"
                          fullWidth={{ xs: true, sm: false }}
                        >
                          Clear Filters
                        </Button>
                        <Button
                          variant="contained"
                          onClick={applyNigerianFilters}
                          size="small"
                          fullWidth={{ xs: true, sm: false }}
                        >
                          Apply Filters
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {renderTransactionTable(nigerianTransactions, 'nigeria')}
            </Box>
          )}

          {/* Ghanaian Payments Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: { sm: 'space-between' }, 
                mb: 2,
                gap: { xs: 2, sm: 0 }
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  Ghanaian Payment Transactions
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchGhanaTransactions}
                  size="small"
                  sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}
                >
                  Refresh
                </Button>
              </Box>

              {/* Ghanaian Filters */}
              <Accordion
                expanded={filtersExpanded.ghana}
                onChange={() => setFiltersExpanded(prev => ({ ...prev, ghana: !prev.ghana }))}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ bgcolor: 'grey.50' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon />
                    <Typography sx={{ fontWeight: 600 }}>Filters</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
                  <Grid container spacing={{ xs: 2, sm: 2, md: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={ghanaFilters.status}
                          label="Status"
                          onChange={(e) => handleGhanaFilterChange('status', e.target.value)}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="disapproved">Disapproved</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="User Email"
                        value={ghanaFilters.userEmail}
                        onChange={(e) => handleGhanaFilterChange('userEmail', e.target.value)}
                        placeholder="Search by email"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Min Amount"
                        type="number"
                        value={ghanaFilters.minAmount}
                        onChange={(e) => handleGhanaFilterChange('minAmount', e.target.value)}
                        placeholder="0"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Max Amount"
                        type="number"
                        value={ghanaFilters.maxAmount}
                        onChange={(e) => handleGhanaFilterChange('maxAmount', e.target.value)}
                        placeholder="1000"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Start Date"
                        type="date"
                        value={ghanaFilters.startDate}
                        onChange={(e) => handleGhanaFilterChange('startDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="End Date"
                        type="date"
                        value={ghanaFilters.endDate}
                        onChange={(e) => handleGhanaFilterChange('endDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        justifyContent: { xs: 'center', sm: 'flex-end' },
                        flexDirection: { xs: 'column', sm: 'row' }
                      }}>
                        <Button
                          variant="outlined"
                          startIcon={<ClearIcon />}
                          onClick={clearGhanaFilters}
                          size="small"
                          fullWidth={{ xs: true, sm: false }}
                        >
                          Clear Filters
                        </Button>
                        <Button
                          variant="contained"
                          onClick={applyGhanaFilters}
                          size="small"
                          fullWidth={{ xs: true, sm: false }}
                        >
                          Apply Filters
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {renderTransactionTable(ghanaTransactions, 'ghana')}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Edit Amount Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, transaction: null, newAmount: '', country: '' })}
        fullWidth
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '95%', sm: 'auto' },
            margin: { xs: 2, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 }
        }}>
          Edit Payment Amount
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <TextField
            autoFocus
            margin="dense"
            label="New Amount"
            type="number"
            fullWidth
            value={editDialog.newAmount}
            onChange={(e) => setEditDialog({ ...editDialog, newAmount: e.target.value })}
            sx={{ 
              mt: 2,
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          gap: 1,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button 
            onClick={() => setEditDialog({ open: false, transaction: null, newAmount: '', country: '' })}
            fullWidth={{ xs: true, sm: false }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAmount} 
            variant="contained"
            fullWidth={{ xs: true, sm: false }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PaymentManagement;