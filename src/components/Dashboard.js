import React, { useState, useEffect } from 'react';
import {
  Grid, Typography, Box, Card, CardContent, Container,
  Avatar, IconButton, Tooltip, Chip, LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  AccountBalance as DepositsIcon,
  MonetizationOn as SpentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  Router,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  MonetizationOn
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalDeposits: 0,
    totalSpent: 0,
    countryStats: {}
  });
  const [ipStats, setIpStats] = useState({
    total: 0,
    assigned: 0,
    unassigned: 0,
    ipTierStats: []
  });
  const [performanceData, setPerformanceData] = useState({
    topIPTiers: [],
    topUsers: []
  });
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [ghanaExchangeRate, setGhanaExchangeRate] = useState(null);

  useEffect(() => {
    fetchStats();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh && !refreshing) {
        fetchStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshing]);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const [dashboardRes, depositsRes, spentRes, ipStatsRes, topIPTiersRes, topUsersRes, pricingRes, exchangeRateRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/stats/deposits'),
        api.get('/admin/stats/spent'),
        api.get('/pia/stats'),
        api.get('/admin/stats/top-ip-tiers?limit=5'),
        api.get('/admin/stats/top-users?limit=5'),
        api.get('/admin/pricing'),
        api.get('/admin/ghana-payments/exchange-rate').catch(() => ({ data: { rate: null } }))
      ]);

      setStats({
        totalUsers: dashboardRes.data.totalUsers || 0,
        totalOrders: dashboardRes.data.totalOrders || 0,
        totalDeposits: depositsRes.data.totalDeposits || 0,
        totalSpent: spentRes.data.totalSpent || 0,
        countryStats: dashboardRes.data.countryStats || {}
      });

      setIpStats(ipStatsRes.data);
      setPerformanceData({
        topIPTiers: topIPTiersRes.data.topIPTiers,
        topUsers: topUsersRes.data.topUsers
      });
      setPricing(pricingRes.data.pricings || []);
      setGhanaExchangeRate(exchangeRateRes.data.rate);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const StatCard = ({ title, value, values, icon, color, bgColor, subtitle }) => (
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
      <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2 } }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              backdropFilter: 'blur(10px)'
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ textAlign: 'right', minWidth: 0, flex: 1, ml: 2 }}>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Chip
                label={subtitle}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.65rem',
                  height: '18px',
                  mt: 0.5
                }}
              />
            )}
          </Box>
        </Box>
        {values ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            {values.map((currencyValue, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                    opacity: 0.9,
                    minWidth: '35px'
                  }}
                >
                  {currencyValue.split(' ')[0]}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                    lineHeight: 1.2,
                    wordBreak: 'break-word'
                  }}
                >
                  {currencyValue.split(' ').slice(1).join(' ')}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              lineHeight: 1.2,
              wordBreak: 'break-word'
            }}
          >
            {value}
          </Typography>
        )}
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
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box sx={{
        mb: { xs: 3, sm: 4 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DashboardIcon sx={{ mr: 2, fontSize: { xs: '2rem', sm: '2.5rem' }, color: 'primary.main' }} />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1a237e',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Monitor your proxy platform performance and metrics
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Auto-refresh:
            </Typography>
            <Chip
              label={autoRefresh ? "ON" : "OFF"}
              color={autoRefresh ? "success" : "default"}
              size="small"
              onClick={() => setAutoRefresh(!autoRefresh)}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={fetchStats}
              disabled={refreshing}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                width: { xs: 44, sm: 48 },
                height: { xs: 44, sm: 48 }
              }}
            >
              <RefreshIcon sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #1976d2 0%, #1976d2dd 100%)',
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
            <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2 } }}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <PeopleIcon />
                </Avatar>
                <Box sx={{ textAlign: 'right', minWidth: 0, flex: 1, ml: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.8,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Total Users
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                  mb: 1
                }}
              >
                {(stats.totalUsers || 0).toLocaleString()}
              </Typography>
              {Object.keys(stats.countryStats).length > 0 ? (
                <Box sx={{ mt: 1 }}>
                  {Object.entries(stats.countryStats)
                    .slice(0, 3) // Show top 3 countries
                    .map(([country, count], index) => (
                      <Box
                        key={country}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 0.25,
                          px: 0.5,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          mb: index < 2 ? 0.5 : 0, // Don't add margin to last item
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'white',
                            fontWeight: 500,
                            fontSize: 'inherit'
                          }}
                        >
                          {country}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'white',
                            opacity: 0.9,
                            fontSize: 'inherit',
                            fontWeight: 600
                          }}
                        >
                          {count}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    mt: 0.5,
                    display: 'block'
                  }}
                >
                  Active accounts
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Orders"
            value={(stats.totalOrders || 0).toLocaleString()}
            icon={<OrdersIcon />}
            bgColor="#388e3c"
            subtitle="Proxy purchases"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Deposits"
            values={[
              `USD ${(stats.totalDeposits || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              ghanaExchangeRate ? `GHS ${((stats.totalDeposits || 0) * ghanaExchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'GHS Rate not set'
            ]}
            icon={<DepositsIcon />}
            bgColor="#7b1fa2"
            subtitle="User funds"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Spent"
            values={[
              `USD ${(stats.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              ghanaExchangeRate ? `GHS ${((stats.totalSpent || 0) * ghanaExchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'GHS Rate not set'
            ]}
            icon={<SpentIcon />}
            bgColor="#d32f2f"
            subtitle="On proxies"
          />
        </Grid>
      </Grid>

      {/* IP Tier Availability Section */}
      <Box sx={{ mt: { xs: 3, sm: 4 } }}>
        <Card sx={{
          border: '1px solid #e3f2fd',
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mb: { xs: 2, sm: 3 },
              flexDirection: { xs: 'column', sm: 'row' },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <Router sx={{
                mr: { xs: 0, sm: 2 },
                mb: { xs: 1, sm: 0 },
                color: 'primary.main',
                fontSize: { xs: '1.5rem', sm: '1.8rem' }
              }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#1976d2',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                IP Pool Availability by Tier
              </Typography>
            </Box>

            {ipStats?.ipTierStats?.length > 0 ? (
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {ipStats?.ipTierStats?.map((tier) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={tier.ip}>
                    <Card
                      sx={{
                        border: '1px solid #e8f5e8',
                        bgcolor: tier.totalAvailable > 0 ? '#f1f8e9' : '#ffebee',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: tier.totalAvailable > 0 ? '#2e7d32' : '#d32f2f',
                            mb: 0.5,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                          }}
                        >
                          {tier.ip}IP
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: tier.totalAvailable > 0 ? '#388e3c' : '#f44336',
                            mb: 0.5,
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          }}
                        >
                          {tier.totalAvailable}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          Available
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={tier.allTimeTotal > 0 ? (tier.totalAssigned / tier.allTimeTotal) * 100 : 0}
                            sx={{
                              height: { xs: 4, sm: 6 },
                              borderRadius: 3,
                              bgcolor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: tier.totalAvailable > 0 ? '#4caf50' : '#f44336'
                              }
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                <Router sx={{
                  fontSize: { xs: '2rem', sm: '3rem' },
                  color: 'text.disabled',
                  mb: 2
                }} />
                <Typography variant="body1" color="text.secondary">
                  No IP pools configured yet
                </Typography>
              </Box>
            )}

            <Box sx={{
              mt: { xs: 2, sm: 3 },
              pt: { xs: 1.5, sm: 2 },
              borderTop: '1px solid #e3f2fd'
            }}>
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1976d2',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      {ipStats?.total || 0}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      Total Accounts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#2e7d32',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      {ipStats?.unassigned || 0}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      Available
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#f57c00',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      {ipStats?.assigned || 0}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      Assigned
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* IP Tier Pricing Section */}
      <Box sx={{ mt: { xs: 3, sm: 4 } }}>
        <Card sx={{
          border: '1px solid #e8f5e8',
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mb: { xs: 2, sm: 3 },
              flexDirection: { xs: 'column', sm: 'row' },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <MonetizationOn sx={{
                mr: { xs: 0, sm: 2 },
                mb: { xs: 1, sm: 0 },
                color: '#2e7d32',
                fontSize: { xs: '1.5rem', sm: '1.8rem' }
              }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#2e7d32',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                IP Tier Pricing
              </Typography>
            </Box>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              All prices are displayed in USD. Users see these exact prices on the purchase page.
            </Typography>

            {pricing.length > 0 ? (
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                {pricing.map((tier, index) => (
                  <Grid item xs={12} sm={6} md={4} key={tier._id || tier.range}>
                    <Card
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: '#fafafa',
                        border: '1px solid #e0e0e0',
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
                        {tier.range}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MonetizationOn sx={{ color: '#1976d2', fontSize: '1.2rem' }} />
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 700, 
                            color: '#1976d2',
                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                          }}
                        >
                          ${tier.price.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Total price for {tier.min} proxies
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                <MonetizationOn sx={{
                  fontSize: { xs: '2rem', sm: '3rem' },
                  color: 'text.disabled',
                  mb: 2
                }} />
                <Typography variant="body1" color="text.secondary">
                  No pricing configured yet
                </Typography>
              </Box>
            )}

            <Box sx={{
              mt: { xs: 2, sm: 3 },
              pt: { xs: 1.5, sm: 2 },
              borderTop: '1px solid #c8e6c9',
              textAlign: 'center'
            }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  fontStyle: 'italic'
                }}
              >
                💡 Prices shown are total tier costs (IPs × Price per IP)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Performance Analytics Section */}
      <Box sx={{ mt: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: '#1a237e',
            display: 'flex',
            alignItems: 'center',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          <BarChartIcon sx={{ mr: 2, color: 'primary.main' }} />
          Performance Analytics
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Top Performing IP Tiers */}
          <Grid item xs={12} lg={6}>
            <Card sx={{
              border: '1px solid #e3f2fd',
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: '#1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  <Router sx={{ mr: 1.5, fontSize: '1.3rem' }} />
                  Top Performing IP Tiers
                </Typography>

                {performanceData?.topIPTiers?.length > 0 ? (
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData?.topIPTiers || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="ipTier"
                          stroke="#666"
                          fontSize={12}
                          tickFormatter={(value) => `${value}IP`}
                        />
                        <YAxis
                          stroke="#666"
                          fontSize={12}
                          tickFormatter={(value) => `₵${(value || 0).toLocaleString()}`}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value, name) => [
                            name === 'totalRevenue' ? `₵${(value || 0).toLocaleString()}` : value,
                            name === 'totalRevenue' ? 'Total Revenue' : 'Orders'
                          ]}
                          labelFormatter={(label) => `${label} IP Tier`}
                        />
                        <Bar
                          dataKey="totalRevenue"
                          fill="#1976d2"
                          radius={[4, 4, 0, 0]}
                          name="totalRevenue"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <BarChartIcon sx={{ fontSize: '3rem', color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No performance data available yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Performing Users */}
          <Grid item xs={12} lg={6}>
            <Card sx={{
              border: '1px solid #e3f2fd',
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: '#1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  <PersonIcon sx={{ mr: 1.5, fontSize: '1.3rem' }} />
                  Top Performing Users
                </Typography>

                {performanceData?.topUsers?.length > 0 ? (
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={performanceData?.topUsers || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        layout="horizontal"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          type="number"
                          stroke="#666"
                          fontSize={12}
                          tickFormatter={(value) => `₵${(value || 0).toLocaleString()}`}
                        />
                        <YAxis
                          type="category"
                          dataKey="email"
                          stroke="#666"
                          fontSize={11}
                          width={80}
                          tickFormatter={(value) => value.split('@')[0]}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value, name) => [
                            `₵${(value || 0).toLocaleString()}`,
                            'Total Spent'
                          ]}
                          labelFormatter={(label) => `User: ${label}`}
                        />
                        <Bar
                          dataKey="totalSpent"
                          fill="#388e3c"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <PersonIcon sx={{ fontSize: '3rem', color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No user performance data available yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Summary Section */}
      <Box sx={{ mt: { xs: 3, sm: 4 } }}>
        <Card sx={{
          bgcolor: '#f8f9fa',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              sx={{
                mb: { xs: 1.5, sm: 2 },
                fontWeight: 600,
                color: '#495057',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Platform Summary
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'success.main', fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      Revenue Generated: {ghanaExchangeRate ? `GHS ${((stats.totalSpent || 0) * ghanaExchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'GHS Rate not set'} (estimated)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingDownIcon sx={{ mr: 1, color: 'info.main', fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      IP Utilization: {stats.totalOrders > 0 ? Math.round((stats.totalOrders / (stats.totalOrders + (ipStats?.unassigned || 0))) * 100) : 0}% of total capacity
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Last updated: {lastUpdated?.toLocaleString() || 'Never'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    System Status: <Chip
                      label="Operational"
                      color="success"
                      size="small"
                      sx={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Dashboard;