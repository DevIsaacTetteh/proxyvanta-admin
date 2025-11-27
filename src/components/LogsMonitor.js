import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Chip, Card, CardContent, useMediaQuery, useTheme
} from '@mui/material';
import api from '../services/api';

const LogsMonitor = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/logs');
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    if (statusCode >= 500) return 'error';
    return 'default';
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
          mb: { xs: 2, sm: 3 }
        }}
      >
        API Logs & Monitor
      </Typography>
      
      {/* Mobile Card View */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {logs.map((log) => (
            <Card key={log._id} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Method:</Typography>
                  <Chip label={log.method} size="small" color="primary" />
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1, 
                    wordBreak: 'break-all',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {log.endpoint}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <Chip
                    label={log.statusCode}
                    color={getStatusColor(log.statusCode)}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">User:</Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {log.user?.email || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">IP:</Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace',
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    {log.ip}
                  </Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {new Date(log.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Timestamp</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Method</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Endpoint</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Status</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>User</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    <Chip label={log.method} size="small" color="primary" />
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{log.endpoint}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    <Chip
                      label={log.statusCode}
                      color={getStatusColor(log.statusCode)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{log.user?.email || 'N/A'}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default LogsMonitor;