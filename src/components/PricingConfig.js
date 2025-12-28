import React, { useState, useEffect } from 'react';
import {
  Button, Typography, Box, Alert, Card, CardContent, Grid, IconButton,
  TextField, Paper, Chip, Avatar, Container, Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Inventory as InventoryIcon, Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon, Save as SaveIcon, AttachMoney as MoneyIcon
} from '@mui/icons-material';
import api from '../services/api';

const PricingConfig = () => {
  const [selectedTier, setSelectedTier] = useState(5);
  const [pricingGroups, setPricingGroups] = useState([]);
  
  const [proxyStats, setProxyStats] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState('0.81');
  
  // Tier options with default USD prices
  const tierOptions = [
    { ips: 5, defaultPrice: 0.81 },
    { ips: 10, defaultPrice: 1.50 },
    { ips: 25, defaultPrice: 3.50 },
    { ips: 50, defaultPrice: 6.50 },
    { ips: 100, defaultPrice: 12.00 },
    { ips: 200, defaultPrice: 22.00 },
    { ips: 300, defaultPrice: 30.00 },
    { ips: 400, defaultPrice: 35.00 },
    { ips: 800, defaultPrice: 60.00 },
    { ips: 1000, defaultPrice: 70.00 },
    { ips: 1200, defaultPrice: 80.00 },
    { ips: 1600, defaultPrice: 100.00 },
    { ips: 2200, defaultPrice: 130.00 },
    { ips: 3000, defaultPrice: 160.00 }
  ];

  useEffect(() => {
    fetchCurrentPricing();
    fetchMasterBalance();
    fetchProxyStats();
  }, []);

  useEffect(() => {
    // Set editing price when pricing groups or selected tier change
    const group = pricingGroups.find(g => selectedTier >= g.min && selectedTier <= g.max);
    if (group) {
      setEditingPrice(group.price.toString());
    } else {
      // Set default price for new tier
      const defaultTier = tierOptions.find(t => t.ips === selectedTier);
      if (defaultTier) {
        setEditingPrice(defaultTier.defaultPrice.toString());
      }
    }
  }, [pricingGroups, selectedTier]);

  const fetchCurrentPricing = async () => {
    try {
      const response = await api.get('/admin/pricing');
      if (response.data.pricings && response.data.pricings.length > 0) {
        setPricingGroups(response.data.pricings);
      } else {
        // Set default tier-based pricing in USD
        setPricingGroups([
          { range: '5 IPs', min: 5, max: 5, price: 0.81 },
          { range: '10 IPs', min: 10, max: 10, price: 1.50 },
          { range: '25 IPs', min: 25, max: 25, price: 3.50 },
          { range: '50 IPs', min: 50, max: 50, price: 6.50 },
          { range: '100 IPs', min: 100, max: 100, price: 12.00 },
          { range: '200 IPs', min: 200, max: 200, price: 22.00 },
          { range: '300 IPs', min: 300, max: 300, price: 30.00 },
          { range: '400 IPs', min: 400, max: 400, price: 35.00 },
          { range: '800 IPs', min: 800, max: 800, price: 60.00 },
          { range: '1000 IPs', min: 1000, max: 1000, price: 70.00 },
          { range: '1200 IPs', min: 1200, max: 1200, price: 80.00 },
          { range: '1600 IPs', min: 1600, max: 1600, price: 100.00 },
          { range: '2200 IPs', min: 2200, max: 2200, price: 130.00 },
          { range: '3000 IPs', min: 3000, max: 3000, price: 160.00 }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
      // Set default tier-based pricing in USD
      setPricingGroups([
        { range: '5 IPs', min: 5, max: 5, price: 0.81 },
        { range: '10 IPs', min: 10, max: 10, price: 1.50 },
        { range: '25 IPs', min: 25, max: 25, price: 3.50 },
        { range: '50 IPs', min: 50, max: 50, price: 6.50 },
        { range: '100 IPs', min: 100, max: 100, price: 12.00 },
        { range: '200 IPs', min: 200, max: 200, price: 22.00 },
        { range: '300 IPs', min: 300, max: 300, price: 30.00 },
        { range: '400 IPs', min: 400, max: 400, price: 35.00 },
        { range: '800 IPs', min: 800, max: 800, price: 60.00 },
        { range: '1000 IPs', min: 1000, max: 1000, price: 70.00 },
        { range: '1200 IPs', min: 1200, max: 1200, price: 80.00 },
        { range: '1600 IPs', min: 1600, max: 1600, price: 100.00 },
        { range: '2200 IPs', min: 2200, max: 2200, price: 130.00 },
        { range: '3000 IPs', min: 3000, max: 3000, price: 160.00 }
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

  const getCurrentPrice = () => {
    const group = pricingGroups.find(g => selectedTier >= g.min && selectedTier <= g.max);
    return group ? group.price : 0.81;
  };

  const handlePriceUpdate = async () => {
    const newPrice = parseFloat(editingPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      setError('Please enter a valid price in USD');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Update the specific pricing group
      const updatedGroups = pricingGroups.map(group => {
        if (selectedTier >= group.min && selectedTier <= group.max) {
          return { ...group, price: newPrice };
        }
        return group;
      });

      await api.post('/admin/pricing', { pricingGroups: updatedGroups });
      setPricingGroups(updatedGroups);
      setMessage('Tier pricing updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pricing');
    } finally {
      setLoading(false);
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
          <MoneyIcon sx={{ mr: { xs: 1, sm: 2 }, verticalAlign: 'middle' }} />
          Proxy Pricing Configuration
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Set tier-based proxy prices in USD. Users will see these prices directly without currency conversion.
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
            Current Tier Pricing
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
                ${getCurrentPrice().toFixed(2)}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                for {selectedTier} IP proxies
              </Typography>
              <Chip
                label={`${selectedTier}IP = $${getCurrentPrice().toFixed(2)}`}
                sx={{ 
                  mt: 1, 
                  bgcolor: '#e3f2fd', 
                  color: '#1976d2',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 600
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Tier Selector */}
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
                Select Proxy Tier to Configure
              </Typography>
              <Grid container spacing={1}>
                {tierOptions.map((tier) => (
                  <Grid item xs={6} sm={4} md={3} key={tier.ips}>
                    <Button
                      variant={selectedTier === tier.ips ? 'contained' : 'outlined'}
                      fullWidth
                      onClick={() => setSelectedTier(tier.ips)}
                      sx={{
                        py: { xs: 1, sm: 1.5 },
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        ...(selectedTier === tier.ips && {
                          bgcolor: '#1976d2',
                          '&:hover': { bgcolor: '#1565c0' }
                        })
                      }}
                    >
                      {tier.ips} IPs
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
                Edit Tier Price
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                {pricingGroups.find(g => selectedTier >= g.min && selectedTier <= g.max)?.range}
              </Typography>
              <TextField
                label="Price in USD"
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
            Current Proxy Pricing Tiers
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            All prices are displayed in USD. Users will see these exact prices on the purchase page.
          </Typography>
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            {pricingGroups.map((group, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    bgcolor: selectedTier >= group.min && selectedTier <= group.max ? '#e3f2fd' : '#fafafa',
                    border: selectedTier >= group.min && selectedTier <= group.max ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MoneyIcon sx={{ color: '#1976d2', fontSize: '1.2rem' }} />
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#1976d2',
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                      }}
                    >
                      ${group.price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Total price for {group.min} proxies
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