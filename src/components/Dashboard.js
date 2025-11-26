import React, { useState, useEffect } from 'react';
import {
  Grid, Typography, Box, Card, CardContent, Container,
  Avatar, IconButton, Tooltip, Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Router as IpIcon,
  AccountBalance as DepositsIcon,
  MonetizationOn as SpentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    availableIPs: 0,
    totalDeposits: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const [usersRes, ordersRes, balanceRes, depositsRes, spentRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/orders'),
        api.get('/admin/master/balance'),
        api.get('/admin/stats/deposits'),
        api.get('/admin/stats/spent')
      ]);

      setStats({
        totalUsers: usersRes.data.users.length,
        totalOrders: ordersRes.data.orders.length,
        availableIPs: balanceRes.data.balance,
        totalDeposits: depositsRes.data.totalDeposits,
        totalSpent: spentRes.data.totalSpent
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const StatCard = ({ title, value, icon, color, bgColor, subtitle }) => (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'translate(30px, -30px)',
        },
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.875rem' }}>
              {title}
            </Typography>
            {subtitle && (
              <Chip
                label={subtitle}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: '20px'
                }}
              />
            )}
          </Box>
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: '2rem',
            mb: 1
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography variant="h6">Loading dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DashboardIcon sx={{ mr: 2, fontSize: '2rem', color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor your proxy platform performance and metrics
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton
            onClick={fetchStats}
            disabled={refreshing}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              width: 48,
              height: 48
            }}
          >
            <RefreshIcon sx={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={<PeopleIcon />}
            bgColor="#1976d2"
            subtitle="Active accounts"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            icon={<OrdersIcon />}
            bgColor="#388e3c"
            subtitle="Proxy purchases"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Available IPs"
            value={stats.availableIPs.toLocaleString()}
            icon={<IpIcon />}
            bgColor="#f57c00"
            subtitle="In inventory"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Deposits"
            value={`GHS ${stats.totalDeposits.toLocaleString()}`}
            icon={<DepositsIcon />}
            bgColor="#7b1fa2"
            subtitle="User funds"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Spent"
            value={`GHS ${stats.totalSpent.toLocaleString()}`}
            icon={<SpentIcon />}
            bgColor="#d32f2f"
            subtitle="On proxies"
          />
        </Grid>
      </Grid>

      {/* Summary Section */}
      <Box sx={{ mt: 4 }}>
        <Card sx={{ bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#495057' }}>
              Platform Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Revenue Generated: GHS {(stats.totalSpent * 0.1).toLocaleString()} (estimated)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingDownIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    IP Utilization: {stats.totalOrders > 0 ? Math.round((stats.totalOrders / (stats.totalOrders + stats.availableIPs)) * 100) : 0}% of total capacity
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Last updated: {new Date().toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  System Status: <Chip label="Operational" color="success" size="small" />
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Dashboard;