import React, { useState, useEffect } from 'react';
import {
  Button, Typography, Box, Alert, Card, CardContent, Grid, IconButton,
  TextField, Paper, Chip, Avatar, Container
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Inventory as InventoryIcon, Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon, Save as SaveIcon
} from '@mui/icons-material';
import api from '../services/api';

const PricingConfig = () => {
  const [selectedIPs, setSelectedIPs] = useState(5);
  const [pricingGroups, setPricingGroups] = useState([]);
  
  const [proxyStats, setProxyStats] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState('10');
  
  // Dollar rate state
  const [dollarRate, setDollarRate] = useState('');
  const [editingDollarRate, setEditingDollarRate] = useState('');
  const [dollarRateLoading, setDollarRateLoading] = useState(false);

  const ipOptions = [5, 10, 25, 50, 100, 200, 300, 400, 800, 1000, 1200, 1600, 2200, 3000];

  useEffect(() => {
    fetchCurrentPricing();
    fetchMasterBalance();
    fetchProxyStats();
    fetchDollarRate();
  }, []);

  useEffect(() => {
    // Set editing price when pricing groups or selected IPs change
    const group = pricingGroups.find(g => selectedIPs >= g.min && selectedIPs <= g.max);
    if (group) {
      setEditingPrice(group.price.toString());
    }
  }, [pricingGroups, selectedIPs]);

  const fetchCurrentPricing = async () => {
    try {
      const response = await api.get('/admin/pricing');
      if (response.data.pricings && response.data.pricings.length > 0) {
        setPricingGroups(response.data.pricings);
      } else {
        // Set default pricing
        setPricingGroups([
          { range: '5 IPs', min: 5, max: 5, price: 10 },
          { range: '10 IPs', min: 10, max: 10, price: 9 },
          { range: '25 IPs', min: 25, max: 25, price: 8 },
          { range: '50 IPs', min: 50, max: 50, price: 7 },
          { range: '100 IPs', min: 100, max: 100, price: 6 },
          { range: '200 IPs', min: 200, max: 200, price: 5 },
          { range: '300 IPs', min: 300, max: 300, price: 4 },
          { range: '400 IPs', min: 400, max: 400, price: 3.5 },
          { range: '800 IPs', min: 800, max: 800, price: 3 },
          { range: '1000 IPs', min: 1000, max: 1000, price: 2.5 },
          { range: '1200 IPs', min: 1200, max: 1200, price: 2.2 },
          { range: '1600 IPs', min: 1600, max: 1600, price: 2 },
          { range: '2200 IPs', min: 2200, max: 2200, price: 1.8 },
          { range: '3000 IPs', min: 3000, max: 3000, price: 1.5 }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
      // Set default pricing
      setPricingGroups([
        { range: '5 IPs', min: 5, max: 5, price: 10 },
        { range: '10 IPs', min: 10, max: 10, price: 9 },
        { range: '25 IPs', min: 25, max: 25, price: 8 },
        { range: '50 IPs', min: 50, max: 50, price: 7 },
        { range: '100 IPs', min: 100, max: 100, price: 6 },
        { range: '200 IPs', min: 200, max: 200, price: 5 },
        { range: '300 IPs', min: 300, max: 300, price: 4 },
        { range: '400 IPs', min: 400, max: 400, price: 3.5 },
        { range: '800 IPs', min: 800, max: 800, price: 3 },
        { range: '1000 IPs', min: 1000, max: 1000, price: 2.5 },
        { range: '1200 IPs', min: 1200, max: 1200, price: 2.2 },
        { range: '1600 IPs', min: 1600, max: 1600, price: 2 },
        { range: '2200 IPs', min: 2200, max: 2200, price: 1.8 },
        { range: '3000 IPs', min: 3000, max: 3000, price: 1.5 }
      ]);
    }
  };

  const fetchMasterBalance = async () => {
    try {
      await api.get('/admin/master/balance');
    } catch (error) {
      console.error('Failed to fetch master balance:', error);
    }
  };

  const fetchProxyStats = async () => {
    try {
      const response = await api.get('/pia/stats');
      setProxyStats(response.data);
    } catch (error) {
      console.error('Failed to fetch proxy stats:', error);
    }
  };

  const fetchDollarRate = async () => {
    try {
      const response = await api.get('/admin/dollar-rate');
      setDollarRate(response.data.rate.toString());
      setEditingDollarRate(response.data.rate.toString());
    } catch (error) {
      console.error('Failed to fetch dollar rate:', error);
      // Set default rate if not found
      setDollarRate('12.00');
      setEditingDollarRate('12.00');
    }
  };

  const getCurrentPrice = () => {
    const group = pricingGroups.find(g => selectedIPs >= g.min && selectedIPs <= g.max);
    return group ? group.price : 10;
  };

  const handlePriceUpdate = async () => {
    const newPrice = parseFloat(editingPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      setError('Please enter a valid price');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Update the specific pricing group
      const updatedGroups = pricingGroups.map(group => {
        if (selectedIPs >= group.min && selectedIPs <= group.max) {
          return { ...group, price: newPrice };
        }
        return group;
      });

      await api.post('/admin/pricing', { pricingGroups: updatedGroups });
      setPricingGroups(updatedGroups);
      setMessage('Pricing updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleDollarRateUpdate = async () => {
    const newRate = parseFloat(editingDollarRate);
    if (isNaN(newRate) || newRate <= 0) {
      setError('Please enter a valid dollar rate');
      return;
    }

    setDollarRateLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/admin/dollar-rate', { rate: newRate });
      setDollarRate(newRate.toString());
      setMessage('Dollar rate updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update dollar rate');
    } finally {
      setDollarRateLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 }
      }}
    >
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            color: '#1a237e',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
          }}
        >
          <SettingsIcon sx={{ mr: { xs: 1, sm: 2 }, verticalAlign: 'middle' }} />
          Pricing Configuration
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Manage proxy pricing tiers and monitor account balances
        </Typography>
      </Box>

      {/* Master Account Balances */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12}>
          <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#e3f2fd', mr: { xs: 1, sm: 2 } }}>
                    <InventoryIcon sx={{ color: '#1976d2' }} />
                  </Avatar>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                  >
                    Available IP Addresses
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => {
                    fetchMasterBalance();
                    fetchProxyStats();
                  }}
                  disabled={loading}
                  size="small"
                  sx={{ color: '#666' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#2e7d32', 
                  mb: 1,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                {proxyStats?.unassigned?.toLocaleString() || '0'}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Proxies available for purchase
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Pricing Overview */}
      <Card sx={{ mb: { xs: 3, sm: 4 }, boxShadow: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center',
              fontSize: { xs: '1.125rem', sm: '1.25rem' }
            }}
          >
            <TrendingUpIcon sx={{ mr: 1 }} />
            Current Pricing Overview
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 1, sm: 2 } }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1976d2', 
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' }
                }}
              >
                GHS {getCurrentPrice().toFixed(2)}
              </Typography>
              {dollarRate && (
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#2e7d32', 
                    mb: 1,
                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' }
                  }}
                >
                  ${(getCurrentPrice() / parseFloat(dollarRate)).toFixed(2)} USD
                </Typography>
              )}
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                per IP for {selectedIPs} IPs
              </Typography>
              <Chip
                label={pricingGroups.find(g => selectedIPs >= g.min && selectedIPs <= g.max)?.range}
                sx={{ 
                  mt: 1, 
                  bgcolor: '#e3f2fd', 
                  color: '#1976d2',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* IP Quantity Selector */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600, 
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '1.125rem', sm: '1.25rem' }
                }}
              >
                Select IP Quantity to Configure
              </Typography>
              <Grid container spacing={1}>
                {ipOptions.map((ip) => (
                  <Grid item xs={6} sm={4} md={3} key={ip}>
                    <Button
                      variant={selectedIPs === ip ? 'contained' : 'outlined'}
                      fullWidth
                      onClick={() => setSelectedIPs(ip)}
                      sx={{
                        py: { xs: 1, sm: 1.5 },
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        ...(selectedIPs === ip && {
                          bgcolor: '#1976d2',
                          '&:hover': { bgcolor: '#1565c0' }
                        })
                      }}
                    >
                      {ip} IPs
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Price Editor */}
        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2, borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1.125rem', sm: '1.25rem' }
                }}
              >
                Edit Price
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                {pricingGroups.find(g => selectedIPs >= g.min && selectedIPs <= g.max)?.range}
              </Typography>
              <TextField
                label="Price per IP (GHS)"
                type="number"
                value={editingPrice}
                onChange={(e) => setEditingPrice(e.target.value)}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
              <Button
                variant="contained"
                fullWidth
                startIcon={<SaveIcon />}
                onClick={handlePriceUpdate}
                disabled={loading}
                sx={{
                  py: { xs: 1, sm: 1.5 },
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {loading ? 'Updating...' : 'Update Price'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dollar Rate Configuration */}
      <Card sx={{ mt: { xs: 2, sm: 3 }, boxShadow: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              display: 'flex', 
              alignItems: 'center',
              fontSize: { xs: '1.125rem', sm: '1.25rem' }
            }}
          >
            <TrendingUpIcon sx={{ mr: 1 }} />
            Dollar Rate Configuration
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Set the current USD to GHS exchange rate. This rate is used to display prices in USD to users.
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                label="USD to GHS Rate"
                type="number"
                value={editingDollarRate}
                onChange={(e) => setEditingDollarRate(e.target.value)}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SaveIcon />}
                onClick={handleDollarRateUpdate}
                disabled={dollarRateLoading}
                sx={{
                  py: { xs: 1.5, sm: 1.75 },
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' }
                }}
              >
                {dollarRateLoading ? 'Updating...' : 'Update Rate'}
              </Button>
            </Grid>
          </Grid>
          {dollarRate && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  color: '#2e7d32',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Current Rate: 1 USD = {parseFloat(dollarRate).toFixed(2)} GHS
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Last updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Pricing Tiers Table */}
      <Card sx={{ mt: { xs: 2, sm: 3 }, boxShadow: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '1.125rem', sm: '1.25rem' }
            }}
          >
            Current Pricing Tiers
          </Typography>
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            {pricingGroups.map((group, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    bgcolor: selectedIPs >= group.min && selectedIPs <= group.max ? '#e3f2fd' : '#fafafa',
                    border: selectedIPs >= group.min && selectedIPs <= group.max ? '2px solid #1976d2' : '1px solid #e0e0e0'
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    {group.range}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#1976d2',
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                    }}
                  >
                    GHS {group.price.toFixed(2)}
                  </Typography>
                  {dollarRate && (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2e7d32',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      ${(group.price / parseFloat(dollarRate)).toFixed(2)} USD
                    </Typography>
                  )}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    per IP
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Messages */}
      <Box sx={{ mt: 3 }}>
        {message && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default PricingConfig;