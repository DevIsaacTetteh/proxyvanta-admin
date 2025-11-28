import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Chip, useMediaQuery, useTheme, Card, CardContent, Avatar
} from '@mui/material';
import api from '../services/api';

const SupportTickets = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/admin/tickets');
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedTicket || !response.trim()) return;

    try {
      await api.post(`/admin/tickets/${selectedTicket}/respond`, { response });
      setResponse('');
      setSelectedTicket(null);
      fetchTickets(); // Refresh tickets
    } catch (error) {
      console.error('Failed to respond to ticket:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'closed': return 'success';
      default: return 'default';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}>
        Support Tickets
      </Typography>
      {/* Desktop Table View */}
      {!isMobile && (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 400, sm: 600 } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>User</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Subject</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Created</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{ticket.user.email}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{ticket.subject}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    <Chip
                      label={ticket.status}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    <Button
                      onClick={() => setSelectedTicket(ticket._id)}
                      size="small"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: { xs: 'auto', sm: '64px' } }}
                    >
                      Respond
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Mobile Card View */}
      {isMobile && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tickets.map((ticket) => (
            <Card
              key={ticket._id}
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {ticket.user.email.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="600" sx={{ fontSize: '0.9rem' }}>
                        {ticket.user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={ticket.status}
                    color={getStatusColor(ticket.status)}
                    size="small"
                    sx={{ fontSize: '0.65rem', fontWeight: 600 }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4
                  }}
                >
                  <strong>Subject:</strong> {ticket.subject}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4
                  }}
                >
                  <strong>Message:</strong> {ticket.message}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    onClick={() => setSelectedTicket(ticket._id)}
                    size="small"
                    variant="contained"
                    sx={{ fontSize: '0.75rem', px: 2 }}
                  >
                    Respond
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Respond to Ticket</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {selectedTicket && (
            <Box>
              <Typography variant="h6" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, mb: 2 }}>Ticket Details</Typography>
              <Typography sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                <strong>Subject:</strong> {tickets.find(t => t._id === selectedTicket)?.subject}
              </Typography>
              <Typography sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                <strong>Message:</strong> {tickets.find(t => t._id === selectedTicket)?.message}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                sx={{ 
                  mt: 2,
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button 
            onClick={() => setSelectedTicket(null)} 
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRespond} 
            variant="contained"
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Send Response
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportTickets;