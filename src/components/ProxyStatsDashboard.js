import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Grid, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Proxy Statistics
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchStats}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Total Proxies */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ProxyIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Total Proxies</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {stats?.total || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Assigned Proxies */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignedIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="h6">Assigned</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {stats?.assigned || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Available Proxies */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AvailableIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Available</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {stats?.unassigned || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* IP Tier Statistics Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ChartIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">IP Tier Statistics</Typography>
            </Box>
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
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ProxyStatsDashboard;