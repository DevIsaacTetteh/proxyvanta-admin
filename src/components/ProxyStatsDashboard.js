import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Grid, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Avatar, useMediaQuery, useTheme
} from '@mui/material';
import {
  VpnKey as ProxyIcon,
  CheckCircle as AssignedIcon,
  RadioButtonUnchecked as AvailableIcon,
  BarChart as ChartIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../services/api';

const ProxyStatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // IP tiers from pricing config
  const ipTiers = [5, 10, 25, 50, 100, 200, 300, 400, 800, 1000, 1200, 1600, 2200, 3000];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/pia/stats');
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch proxy statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Prepare table data
  const getTableData = () => {
    return ipTiers.map(ip => {
      const tierStat = stats?.ipTierStats?.find(stat => stat.ip === ip) || {
        ip,
        allTimeTotal: 0,
        totalAssigned: 0,
        totalAvailable: 0
      };
      return tierStat;
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        <Typography
          variant="h4"
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
          Proxy Statistics
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
          Monitor proxy distribution, assignment status, and performance metrics across all IP tiers.
        </Typography>
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: { xs: 'center', sm: 'space-between' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: { xs: 3, sm: 4 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ChartIcon sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, color: 'primary.main' }} />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#1a237e',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Statistics Overview
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Real-time proxy metrics and analytics
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchStats}
          disabled={refreshing}
          fullWidth={{ xs: true, sm: false }}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
            }
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        {/* Total Proxies */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{
            height: '100%',
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
                <ProxyIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                {stats?.total || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Total Proxies
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Assigned Proxies */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{
              textAlign: 'center',
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 }
            }}>
              <Avatar sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                mx: 'auto',
                mb: 1,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 }
              }}>
                <AssignedIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                {stats?.assigned || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Assigned Proxies
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Available Proxies */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{
              textAlign: 'center',
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 }
            }}>
              <Avatar sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                mx: 'auto',
                mb: 1,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 }
              }}>
                <AvailableIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                {stats?.unassigned || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Available Proxies
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* IP Tier Statistics */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
            <ChartIcon sx={{ mr: 1, color: 'info.main', fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              IP Tier Statistics
            </Typography>
          </Box>

          {isMobile ? (
            // Mobile Card View
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {getTableData().map((row) => (
                <Card key={row.ip} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ProxyIcon sx={{ mr: 2, color: 'primary.main', fontSize: '1.5rem' }} />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        {row.ip} IPs
                      </Typography>
                    </Box>

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          All Time Total
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: 'primary.main',
                            fontSize: { xs: '1rem', sm: '1.1rem' }
                          }}
                        >
                          {row.allTimeTotal.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Total Assigned
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AssignedIcon sx={{ mr: 1, color: 'error.main', fontSize: '1rem' }} />
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: 'error.main',
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                          >
                            {row.totalAssigned.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Total Available
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AvailableIcon sx={{ mr: 1, color: 'success.main', fontSize: '1rem' }} />
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: 'success.main',
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                          >
                            {row.totalAvailable.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // Desktop Table View
            <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>IP Count</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">All Time Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Total Assigned</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Total Available</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTableData().map((row) => (
                    <TableRow key={row.ip} hover>
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ProxyIcon sx={{ mr: 1, color: 'primary.main' }} />
                          {row.ip} IPs
                        </Box>
                      </TableCell>
                      <TableCell align="right">{row.allTimeTotal.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <AssignedIcon sx={{ mr: 1, color: 'error.main' }} />
                          {row.totalAssigned.toLocaleString()}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <AvailableIcon sx={{ mr: 1, color: 'success.main' }} />
                          {row.totalAvailable.toLocaleString()}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProxyStatsDashboard;