import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Grid, Button,
  TextField, Alert, Snackbar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar,
  Tabs, Tab, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Paper, FormControl,
  InputLabel, Select, MenuItem, Accordion, AccordionSummary,
  AccordionDetails, InputAdornment, Divider
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
  const [exchangeRate, setExchangeRate] = useState(null);
  const [exchangeRateInfo, setExchangeRateInfo] = useState(null);
  const [newExchangeRate, setNewExchangeRate] = useState('');
  const [isEditingRate, setIsEditingRate] = useState(false);
  
  // Ghanaian exchange rate state
  const [ghanaExchangeRate, setGhanaExchangeRate] = useState(null);
  const [ghanaExchangeRateInfo, setGhanaExchangeRateInfo] = useState(null);
  const [newGhanaExchangeRate, setNewGhanaExchangeRate] = useState('');
  const [isEditingGhanaRate, setIsEditingGhanaRate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nigerianTransactions, setNigerianTransactions] = useState([]);
  const [ghanaTransactions, setGhanaTransactions] = useState([]);
  const [stats, setStats] = useState({
    nigerian: { totalTransactions: 0, totalAmount: 0, totalAmountNGN: 0, todayTransactions: 0 },
    ghana: { totalTransactions: 0, totalAmount: 0, todayTransactions: 0 },
    crypto: { totalTransactions: 0, totalAmount: 0, todayTransactions: 0 }
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

  // Forex rates for Nigerian payments display
  const [forexRates, setForexRates] = useState({
    usdToNgn: 1620, // Fallback NGN rate
    usdToGhs: 12,   // Fallback GHS rate
    lastUpdated: null
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

  const [cryptoTransactions, setCryptoTransactions] = useState([]);
  const [cryptoFilters, setCryptoFilters] = useState({
    status: '',
    userEmail: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: ''
  });

  const [filtersExpanded, setFiltersExpanded] = useState({
    nigerian: false,
    ghana: false,
    crypto: false
  });

  const fetchExchangeRate = useCallback(async () => {
    try {
      const response = await api.get('/admin/nigerian-payments/exchange-rate');
      setExchangeRate(response.data.rate);
      setExchangeRateInfo({
        rate: response.data.rate,
        lastUpdated: response.data.lastUpdated,
        setBy: response.data.setBy
      });
    } catch (error) {
      if (error.response?.status === 404) {
        // No exchange rate set yet
        setExchangeRate(null);
        setExchangeRateInfo(null);
        console.log('No exchange rate set yet - admin needs to configure it');
      } else {
        console.error('Failed to fetch exchange rate:', error);
        showSnackbar('Failed to fetch exchange rate', 'error');
      }
    }
  }, []);

  const fetchGhanaExchangeRate = useCallback(async () => {
    try {
      const response = await api.get('/admin/ghana-payments/exchange-rate');
      setGhanaExchangeRate(response.data.rate);
      setGhanaExchangeRateInfo({
        rate: response.data.rate,
        lastUpdated: response.data.lastUpdated,
        setBy: response.data.setBy
      });
    } catch (error) {
      if (error.response?.status === 404) {
        // No exchange rate set yet
        setGhanaExchangeRate(null);
        setGhanaExchangeRateInfo(null);
        console.log('No Ghana exchange rate set yet - admin needs to configure it');
      } else {
        console.error('Failed to fetch Ghana exchange rate:', error);
        showSnackbar('Failed to fetch Ghana exchange rate', 'error');
      }
    }
  }, []);

  const fetchForexRates = async () => {
    try {
      // Using exchangerate-api.com for free forex rates
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();

      setForexRates({
        usdToNgn: data.rates.NGN,
        usdToGhs: data.rates.GHS,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to fetch forex rates:', error);
      // Fallback to approximate rates if API fails
      setForexRates({
        usdToNgn: 1620, // Approximate NGN rate
        usdToGhs: 12,   // Approximate GHS rate
        lastUpdated: new Date()
      });
    }
  };

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

  const fetchCryptoTransactions = useCallback(async (filters = cryptoFilters) => {
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
      const url = `/admin/crypto-payments/transactions${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      setCryptoTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch crypto transactions:', error);
      showSnackbar('Failed to fetch crypto transactions', 'error');
    }
  }, [cryptoFilters]);

  const fetchStats = useCallback(async () => {
    try {
      const [nigeriaStats, ghanaStats, cryptoStats] = await Promise.all([
        api.get('/admin/nigerian-payments/stats'),
        api.get('/admin/ghana-payments/stats'),
        api.get('/admin/crypto-payments/stats')
      ]);

      setStats({
        nigerian: {
          totalTransactions: nigeriaStats.data.stats.totalTransactions || 0,
          totalAmount: nigeriaStats.data.stats.totalAmountUSD || 0,
          totalAmountNGN: nigeriaStats.data.stats.totalAmountNGN || 0,
          todayTransactions: nigeriaStats.data.stats.todayTransactions || 0
        },
        ghana: {
          totalTransactions: ghanaStats.data.stats.totalTransactions || 0,
          totalAmount: ghanaStats.data.stats.totalAmount || 0,
          todayTransactions: ghanaStats.data.stats.todayTransactions || 0
        },
        crypto: {
          totalTransactions: cryptoStats.data.stats.totalTransactions || 0,
          totalAmount: cryptoStats.data.stats.totalAmount || 0,
          todayTransactions: cryptoStats.data.stats.todayTransactions || 0
        }
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRate();
    fetchGhanaExchangeRate();
    fetchNigerianTransactions();
    fetchGhanaTransactions();
    fetchStats();
    fetchForexRates(); // Fetch initial forex rates

    // Set up periodic forex rate updates every 5 minutes
    const forexInterval = setInterval(fetchForexRates, 5 * 60 * 1000);

    return () => {
      clearInterval(forexInterval);
    };
  }, [fetchExchangeRate, fetchGhanaExchangeRate, fetchNigerianTransactions, fetchGhanaTransactions, fetchStats]);

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

      // Refresh exchange rate data
      await fetchExchangeRate();
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

  const updateGhanaExchangeRate = async () => {
    if (!newGhanaExchangeRate || parseFloat(newGhanaExchangeRate) <= 0) {
      showSnackbar('Please enter a valid exchange rate', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.put('/admin/ghana-payments/exchange-rate', {
        rate: parseFloat(newGhanaExchangeRate)
      });

      // Refresh exchange rate data
      await fetchGhanaExchangeRate();
      setIsEditingGhanaRate(false);
      setNewGhanaExchangeRate('');
      showSnackbar('Ghana exchange rate updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update Ghana exchange rate:', error);
      showSnackbar('Failed to update Ghana exchange rate', 'error');
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

  const handleCryptoFilterChange = (field, value) => {
    setCryptoFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyCryptoFilters = () => {
    fetchCryptoTransactions(cryptoFilters);
  };

  const clearCryptoFilters = () => {
    setCryptoFilters({
      status: '',
      userEmail: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: ''
    });
    fetchCryptoTransactions({
      status: '',
      userEmail: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleEditAmount = (transaction, country) => {
    if (country === 'crypto') {
      showSnackbar('Crypto transaction amounts cannot be edited', 'warning');
      return;
    }

    const displayAmount = country === 'nigeria'
      ? transaction.amount * (exchangeRate || forexRates.usdToNgn)
      : country === 'ghana'
      ? (transaction.ghsAmount ?? (transaction.amount * forexRates.usdToGhs))
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
        : editDialog.country === 'ghana'
        ? `/admin/ghana-payments/transaction/${editDialog.transaction._id}`
        : `/admin/crypto-payments/transaction/${editDialog.transaction._id}`;

      const usdAmount = editDialog.country === 'nigeria'
        ? parseFloat(editDialog.newAmount) / (exchangeRate || forexRates.usdToNgn)
        : editDialog.country === 'ghana'
        ? parseFloat(editDialog.newAmount) / forexRates.usdToGhs
        : parseFloat(editDialog.newAmount);

      await api.put(endpoint, {
        amount: usdAmount
      });

      // Refresh transactions
      if (editDialog.country === 'nigeria') {
        fetchNigerianTransactions();
      } else if (editDialog.country === 'ghana') {
        fetchGhanaTransactions();
      } else {
        fetchCryptoTransactions();
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
        : country === 'ghana'
        ? `/admin/ghana-payments/transaction/${transactionId}/approve`
        : `/admin/crypto-payments/transaction/${transactionId}/approve`;

      await api.put(endpoint);

      // Refresh transactions
      if (country === 'nigeria') {
        fetchNigerianTransactions();
      } else if (country === 'ghana') {
        fetchGhanaTransactions();
      } else {
        fetchCryptoTransactions();
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
        : country === 'ghana'
        ? `/admin/ghana-payments/transaction/${transactionId}/disapprove`
        : `/admin/crypto-payments/transaction/${transactionId}/disapprove`;

      await api.put(endpoint);

      // Refresh transactions
      if (country === 'nigeria') {
        fetchNigerianTransactions();
      } else if (country === 'ghana') {
        fetchGhanaTransactions();
      } else {
        fetchCryptoTransactions();
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
        : country === 'ghana'
        ? `/admin/ghana-payments/transaction/${transactionId}`
        : `/admin/crypto-payments/transaction/${transactionId}`;

      await api.delete(endpoint);

      // Refresh transactions
      if (country === 'nigeria') {
        fetchNigerianTransactions();
      } else if (country === 'ghana') {
        fetchGhanaTransactions();
      } else {
        fetchCryptoTransactions();
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
    if (country === 'crypto' || country === 'usa') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }
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
                    {country === 'nigeria'
                      ? formatCurrency(transaction.amount * (exchangeRate || forexRates.usdToNgn), 'nigeria')
                      : country === 'ghana'
                      ? formatCurrency((transaction.ghsAmount ?? (transaction.amount * forexRates.usdToGhs)), 'ghana')
                      : formatCurrency(transaction.amount, 'crypto')
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
                        disabled={country === 'crypto'} // Disable editing for crypto transactions
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
        <Grid item xs={12} md={4}>
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      USD: {formatCurrency(stats.nigerian.totalAmount, 'crypto')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      GHS: {formatCurrency((stats.nigerian.totalAmount * forexRates.usdToGhs), 'ghana')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      NGN: {formatCurrency(stats.nigerian.totalAmountNGN || (stats.nigerian.totalAmount * (exchangeRate || forexRates.usdToNgn)), 'nigeria')}
                    </Typography>
                  </Box>
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
        <Grid item xs={12} md={4}>
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      GHS: {formatCurrency((stats.ghana.totalAmount * forexRates.usdToGhs), 'ghana')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      USD: {formatCurrency(stats.ghana.totalAmount, 'crypto')}
                    </Typography>
                  </Box>
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
        <Grid item xs={12} md={4}>
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
                    ₿ Crypto Payments
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '2.125rem' }
                    }}
                  >
                    {stats.crypto.totalTransactions}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      GHS: {formatCurrency((stats.crypto.totalAmount * forexRates.usdToGhs), 'ghana')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      USD: {formatCurrency(stats.crypto.totalAmount, 'crypto')}
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: { xs: 48, sm: 56 }, 
                  height: { xs: 48, sm: 56 }
                }}>
                  <AttachMoneyIcon />
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
                      USD Transactions
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
            <Tab
              label={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 0.5, sm: 1 },
                  minWidth: { xs: 'auto', sm: '200px' }
                }}>
                  <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>₿</Typography>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: { sm: '0.9rem' } }}>
                      Crypto Payments
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      USD Transactions
                    </Typography>
                  </Box>
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      Crypto
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
              <Card sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                overflow: 'hidden'
              }}>
                <Box sx={{
                  bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  p: 3,
                  color: 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <CurrencyExchangeIcon sx={{ fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Currency Exchange Rate Management
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Manage the official USD to NGN exchange rate for Nigerian payments
                  </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{
                        p: 3,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.06)'
                      }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                          Current Exchange Rate
                        </Typography>

                        {!isEditingRate ? (
                          <Box>
                            {exchangeRate ? (
                              <>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                                  <Typography variant="h3" sx={{
                                    fontWeight: 800,
                                    color: 'primary.main',
                                    fontSize: { xs: '2rem', sm: '2.5rem' }
                                  }}>
                                    ₦{exchangeRate.toLocaleString()}
                                  </Typography>
                                  <Typography variant="body1" color="text.secondary">
                                    per 1 USD
                                  </Typography>
                                </Box>

                                {exchangeRateInfo && (
                                  <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                      Last Updated: {new Date(exchangeRateInfo.lastUpdated).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Rate ID: {exchangeRateInfo.setBy}
                                    </Typography>
                                  </Box>
                                )}

                                <Button
                                  variant="contained"
                                  startIcon={<EditIcon />}
                                  onClick={() => setIsEditingRate(true)}
                                  sx={{
                                    mt: 2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600
                                  }}
                                >
                                  Update Rate
                                </Button>
                              </>
                            ) : (
                              <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CurrencyExchangeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                                  No Exchange Rate Set
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                                  Set the official USD to NGN exchange rate for Nigerian payments
                                </Typography>
                                <Button
                                  variant="contained"
                                  startIcon={<EditIcon />}
                                  onClick={() => setIsEditingRate(true)}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600
                                  }}
                                >
                                  Set Exchange Rate
                                </Button>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                              Enter the new exchange rate (NGN per 1 USD):
                            </Typography>

                            <TextField
                              fullWidth
                              size="medium"
                              type="number"
                              value={newExchangeRate}
                              onChange={(e) => setNewExchangeRate(e.target.value)}
                              placeholder="e.g., 162.50"
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                              }}
                              sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                              helperText="Enter a positive number greater than 0"
                            />

                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={updateExchangeRate}
                                disabled={loading || !newExchangeRate || parseFloat(newExchangeRate) <= 0}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  flex: 1
                                }}
                              >
                                {loading ? 'Updating...' : 'Save Rate'}
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={() => {
                                  setIsEditingRate(false);
                                  setNewExchangeRate('');
                                }}
                                disabled={loading}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none'
                                }}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{
                        p: 3,
                        bgcolor: 'success.50',
                        borderRadius: 2,
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        height: '100%'
                      }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'success.main' }}>
                          💱 Rate Impact Preview
                        </Typography>

                        {exchangeRate ? (
                          <Box>
                            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                              Example conversion for $10 USD:
                            </Typography>
                            <Box sx={{
                              p: 2,
                              bgcolor: 'white',
                              borderRadius: 1,
                              border: '1px solid rgba(0,0,0,0.06)'
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1">Amount in USD:</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>$10.00</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1">Exchange Rate:</Typography>
                                <Typography variant="body1">1 USD = ₦{exchangeRate.toLocaleString()}</Typography>
                              </Box>
                              <Divider sx={{ my: 1 }} />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Amount in NGN:</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                                  ₦{(10 * exchangeRate).toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CurrencyExchangeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                              Set an exchange rate to see conversion preview
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
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
              {/* Exchange Rate Management */}
              <Card sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                overflow: 'hidden'
              }}>
                <Box sx={{
                  bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  p: 3,
                  color: 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <CurrencyExchangeIcon sx={{ fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Currency Exchange Rate Management
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Manage the official USD to GHS exchange rate for Ghanaian payments
                  </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{
                        p: 3,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.06)'
                      }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                          Current Exchange Rate
                        </Typography>

                        {!isEditingGhanaRate ? (
                          <Box>
                            {ghanaExchangeRate ? (
                              <>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                                  <Typography variant="h3" sx={{
                                    fontWeight: 800,
                                    color: 'primary.main',
                                    fontSize: { xs: '2rem', sm: '2.5rem' }
                                  }}>
                                    ₵{ghanaExchangeRate.toLocaleString()}
                                  </Typography>
                                  <Typography variant="body1" color="text.secondary">
                                    per 1 USD
                                  </Typography>
                                </Box>

                                {ghanaExchangeRateInfo && (
                                  <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                      Last Updated: {new Date(ghanaExchangeRateInfo.lastUpdated).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Rate ID: {ghanaExchangeRateInfo.setBy}
                                    </Typography>
                                  </Box>
                                )}

                                <Button
                                  variant="contained"
                                  startIcon={<EditIcon />}
                                  onClick={() => setIsEditingGhanaRate(true)}
                                  sx={{
                                    mt: 2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600
                                  }}
                                >
                                  Update Rate
                                </Button>
                              </>
                            ) : (
                              <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CurrencyExchangeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                                  No Exchange Rate Set
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                                  Set the official USD to GHS exchange rate for Ghanaian payments
                                </Typography>
                                <Button
                                  variant="contained"
                                  startIcon={<EditIcon />}
                                  onClick={() => setIsEditingGhanaRate(true)}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600
                                  }}
                                >
                                  Set Exchange Rate
                                </Button>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                              Enter the new exchange rate (GHS per 1 USD):
                            </Typography>

                            <TextField
                              fullWidth
                              size="medium"
                              type="number"
                              value={newGhanaExchangeRate}
                              onChange={(e) => setNewGhanaExchangeRate(e.target.value)}
                              placeholder="e.g., 12.50"
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₵</InputAdornment>,
                              }}
                              sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                              helperText="Enter a positive number greater than 0"
                            />

                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={updateGhanaExchangeRate}
                                disabled={loading || !newGhanaExchangeRate || parseFloat(newGhanaExchangeRate) <= 0}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  flex: 1
                                }}
                              >
                                {loading ? 'Updating...' : 'Save Rate'}
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={() => {
                                  setIsEditingGhanaRate(false);
                                  setNewGhanaExchangeRate('');
                                }}
                                disabled={loading}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none'
                                }}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{
                        p: 3,
                        bgcolor: 'success.50',
                        borderRadius: 2,
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        height: '100%'
                      }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'success.main' }}>
                          💱 Rate Impact Preview
                        </Typography>

                        {ghanaExchangeRate ? (
                          <Box>
                            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                              Example conversion for $10 USD:
                            </Typography>
                            <Box sx={{
                              p: 2,
                              bgcolor: 'white',
                              borderRadius: 1,
                              border: '1px solid rgba(0,0,0,0.06)'
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1">Amount in USD:</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>$10.00</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1">Exchange Rate:</Typography>
                                <Typography variant="body1">1 USD = ₵{ghanaExchangeRate.toLocaleString()}</Typography>
                              </Box>
                              <Divider sx={{ my: 1 }} />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Amount in GHS:</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                                  ₵{(10 * ghanaExchangeRate).toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CurrencyExchangeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                              Set an exchange rate to see conversion preview
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

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

          {/* Crypto Payments Tab */}
          {activeTab === 2 && (
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
                  Crypto Payment Transactions
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchCryptoTransactions}
                  size="small"
                  sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}
                >
                  Refresh
                </Button>
              </Box>

              {/* Crypto Filters */}
              <Accordion
                expanded={filtersExpanded.crypto}
                onChange={() => setFiltersExpanded(prev => ({ ...prev, crypto: !prev.crypto }))}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ bgcolor: 'grey.50' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Filter Crypto Transactions
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={cryptoFilters.status}
                          onChange={(e) => handleCryptoFilterChange('status', e.target.value)}
                          label="Status"
                        >
                          <MenuItem value="">All Status</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="failed">Failed</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="User Email"
                        value={cryptoFilters.userEmail}
                        onChange={(e) => handleCryptoFilterChange('userEmail', e.target.value)}
                        placeholder="user@example.com"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Min Amount (USD)"
                        type="number"
                        value={cryptoFilters.minAmount}
                        onChange={(e) => handleCryptoFilterChange('minAmount', e.target.value)}
                        placeholder="10"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Max Amount (USD)"
                        type="number"
                        value={cryptoFilters.maxAmount}
                        onChange={(e) => handleCryptoFilterChange('maxAmount', e.target.value)}
                        placeholder="1000"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Start Date"
                        type="date"
                        value={cryptoFilters.startDate}
                        onChange={(e) => handleCryptoFilterChange('startDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="End Date"
                        type="date"
                        value={cryptoFilters.endDate}
                        onChange={(e) => handleCryptoFilterChange('endDate', e.target.value)}
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
                          onClick={clearCryptoFilters}
                          size="small"
                          fullWidth={{ xs: true, sm: false }}
                        >
                          Clear Filters
                        </Button>
                        <Button
                          variant="contained"
                          onClick={applyCryptoFilters}
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

              {renderTransactionTable(cryptoTransactions, 'crypto')}
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
          Edit Payment Amount ({editDialog.country === 'nigeria' ? 'NGN' : 'GHS'})
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <TextField
            autoFocus
            margin="dense"
            label={`New Amount (${editDialog.country === 'nigeria' ? 'NGN' : 'GHS'})`}
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