import React, { useState, useEffect } from 'react';
import {
  Button, Typography, Box, Alert, Card, CardContent, Grid, IconButton,
  TextField, Paper, Chip, Avatar, Container
} from '@mui/material';
import {
  Refresh as RefreshIcon, MonetizationOn as MoneyIcon,
  Inventory as InventoryIcon, Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon, Save as SaveIcon
} from '@mui/icons-material';
import api from '../services/api';

const PricingConfig = () => {
  const [selectedIPs, setSelectedIPs] = useState(5);
  const [pricingGroups, setPricingGroups] = useState([]);
  const [masterBalance, setMasterBalance] = useState(0);
  const [currencyBalance, setCurrencyBalance] = useState(0);
  const [proxyStats, setProxyStats] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState('10');

  const ipOptions = [5, 10, 25, 50, 100, 200, 300, 400, 800, 1000, 1200, 1600, 2200, 3000];

  useEffect(() => {
    fetchCurrentPricing();
    fetchMasterBalance();
    fetchProxyStats();
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
      const response = await api.get('/admin/master/balance');
      setMasterBalance(response.data.balance);
      setCurrencyBalance(response.data.currencyBalance);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
          <SettingsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Pricing Configuration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage proxy pricing tiers and monitor account balances
        </Typography>
      </Box>

      {/* Master Account Balances */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#e3f2fd', mr: 2 }}>
                    <InventoryIcon sx={{ color: '#1976d2' }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32', mb: 1 }}>
                {proxyStats?.unassigned?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Proxies available for purchase
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#fff3e0', mr: 2 }}>
                  <MoneyIcon sx={{ color: '#f57c00' }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Currency Balance
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#f57c00', mb: 1 }}>
                {currencyBalance.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available funds for purchasing IPs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Pricing Overview */}
      <Card sx={{ mb: 4, boxShadow: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ mr: 1 }} />
            Current Pricing Overview
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
                GHS {getCurrentPrice().toFixed(2)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                per IP for {selectedIPs} IPs
              </Typography>
              <Chip
                label={pricingGroups.find(g => selectedIPs >= g.min && selectedIPs <= g.max)?.range}
                sx={{ mt: 1, bgcolor: '#e3f2fd', color: '#1976d2' }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      <Grid container spacing={3}>
        {/* IP Quantity Selector */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
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
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
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
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Edit Price
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
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
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                {loading ? 'Updating...' : 'Update Price'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pricing Tiers Table */}
      <Card sx={{ mt: 3, boxShadow: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Current Pricing Tiers
          </Typography>
          <Grid container spacing={2}>
            {pricingGroups.map((group, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: selectedIPs >= group.min && selectedIPs <= group.max ? '#e3f2fd' : '#fafafa',
                    border: selectedIPs >= group.min && selectedIPs <= group.max ? '2px solid #1976d2' : '1px solid #e0e0e0'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {group.range}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    GHS {group.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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