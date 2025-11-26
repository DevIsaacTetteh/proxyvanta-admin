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
    <Box>
      <Typography variant="h4" gutterBottom>
        API Logs & Monitor
      </Typography>
      <TableContainer component={Paper} sx={{ overflowX: { xs: 'auto', md: 'visible' } }}>
        <Table sx={{ minWidth: { xs: 600, md: 'auto' } }}>
          <TableHead sx={{
            '& .MuiTableCell-head': {
              display: { xs: 'none', md: 'table-cell' }
            }
          }}>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Endpoint</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>User</TableCell>
              <TableCell>IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <React.Fragment key={log._id}>
                {/* Mobile Card View */}
                {isMobile && (
                  <TableRow>
                    <TableCell sx={{ p: 0, border: 'none' }}>
                      <Card sx={{ m: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Method:</Typography>
                            <Chip label={log.method} size="small" color="primary" />
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, wordBreak: 'break-all' }}>
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
                            <Typography variant="body2">{log.user?.email || 'N/A'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">IP:</Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{log.ip}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.createdAt).toLocaleString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </TableCell>
                  </TableRow>
                )}
                {/* Desktop Table View */}
                {!isMobile && (
                  <TableRow>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{log.method}</TableCell>
                    <TableCell>{log.endpoint}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.statusCode}
                        color={getStatusColor(log.statusCode)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.user?.email || 'N/A'}</TableCell>
                    <TableCell>{log.ip}</TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LogsMonitor;