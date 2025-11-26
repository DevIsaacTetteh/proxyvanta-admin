import React, { useState, useEffect } from 'react';
import {
  Button, Typography, Box, Alert, Card, CardContent, Grid, IconButton,
  TextField, Paper
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import api from '../services/api';

const PricingConfig = () => {
  const [selectedIPs, setSelectedIPs] = useState(5);
  const [quantity, setQuantity] = useState(1);
  const [pricingGroups, setPricingGroups] = useState([]);
  const [masterBalance, setMasterBalance] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState('');

  const proxyType = 'PIA Proxy';

  const ipOptions = [5, 10, 25, 50, 100, 200, 300, 400, 800, 1000, 1200, 1600, 2200, 3000];

  useEffect(() => {
    fetchCurrentPricing();
    fetchMasterBalance();
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
          { range: '1-10 IPs', min: 1, max: 10, price: 10 },
          { range: '11-50 IPs', min: 11, max: 50, price: 9 },
          { range: '51-100 IPs', min: 51, max: 100, price: 8 },
          { range: '101-500 IPs', min: 101, max: 500, price: 7 },
          { range: '501+ IPs', min: 501, max: Infinity, price: 6 }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
      // Set default pricing
      setPricingGroups([
        { range: '1-10 IPs', min: 1, max: 10, price: 10 },
        { range: '11-50 IPs', min: 11, max: 50, price: 9 },
        { range: '51-100 IPs', min: 51, max: 100, price: 8 },
        { range: '101-500 IPs', min: 101, max: 500, price: 7 },
        { range: '501+ IPs', min: 501, max: Infinity, price: 6 }
      ]);
    }
  };

  const fetchMasterBalance = async () => {
    try {
      const response = await api.get('/admin/master/balance');
      setMasterBalance(response.data.balance);
    } catch (error) {
      console.error('Failed to fetch master balance:', error);
    }
  };

  const getCurrentPrice = () => {
    const group = pricingGroups.find(g => selectedIPs >= g.min && selectedIPs <= g.max);
    return group ? group.price : 10;
  };

  const totalPrice = selectedIPs * quantity * getCurrentPrice();

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
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, bgcolor: '#121212', minHeight: '100vh', color: 'white' }}>
      {/* Master Account Balance */}
      <Card sx={{ mb: 3, bgcolor: '#1e1e1e', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" align="center">
            Master Account Balance: GHS {masterBalance.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>

      {/* Proxy Type & Price */}
      <Card sx={{ mb: 3, bgcolor: '#1e1e1e', color: 'white' }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            {proxyType}
          </Typography>
          <Typography variant="h6" align="center" color="primary">
            GHS {getCurrentPrice().toFixed(2)} per IP
          </Typography>
        </CardContent>
      </Card>

      {/* Number of IPs Selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          Number of IPs
        </Typography>
        <Grid container spacing={1}>
          {ipOptions.map((ip) => (
            <Grid item xs={3} key={ip}>
              <Button
                variant={selectedIPs === ip ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => setSelectedIPs(ip)}
                sx={{
                  bgcolor: selectedIPs === ip ? '#1976d2' : '#333',
                  color: 'white',
                  borderColor: '#555',
                  '&:hover': {
                    bgcolor: selectedIPs === ip ? '#1565c0' : '#444',
                  }
                }}
              >
                {ip}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Price Editor */}
      <Card sx={{ mb: 3, bgcolor: '#1e1e1e', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Edit Price for {selectedIPs} IPs ({pricingGroups.find(g => selectedIPs >= g.min && selectedIPs <= g.max)?.range})
          </Typography>
          <TextField
            label="Price per IP (GHS)"
            type="number"
            value={editingPrice}
            onChange={(e) => setEditingPrice(e.target.value)}
            fullWidth
            sx={{
              mb: 2,
              '& .MuiInputBase-root': { bgcolor: '#333', color: 'white' },
              '& .MuiInputLabel-root': { color: '#ccc' },
              '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#555' } }
            }}
          />
        </CardContent>
      </Card>

      {/* Quantity Counter */}
      <Card sx={{ mb: 3, bgcolor: '#1e1e1e', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Preview Quantity
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <IconButton
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              sx={{ color: 'white' }}
            >
              <Remove />
            </IconButton>
            <Typography variant="h4" sx={{ mx: 3, minWidth: 50, textAlign: 'center' }}>
              {quantity}
            </Typography>
            <IconButton
              onClick={() => setQuantity(quantity + 1)}
              sx={{ color: 'white' }}
            >
              <Add />
            </IconButton>
          </Box>
          <Typography variant="body1" align="center">
            Total Preview: GHS {(selectedIPs * quantity * getCurrentPrice()).toFixed(2)}
          </Typography>
        </CardContent>
      </Card>

      {/* Description */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#1e1e1e', color: 'white' }}>
        <Typography variant="body2">
          Set competitive pricing for different IP quantity tiers. Lower prices for bulk purchases encourage larger orders and increase revenue.
        </Typography>
      </Paper>

      {/* Update Button */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handlePriceUpdate}
        disabled={loading}
        sx={{
          mb: 2,
          bgcolor: '#1976d2',
          '&:hover': { bgcolor: '#1565c0' },
          py: 1.5
        }}
      >
        {loading ? 'Updating...' : 'Update Pricing'}
      </Button>

      {/* Messages */}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default PricingConfig;