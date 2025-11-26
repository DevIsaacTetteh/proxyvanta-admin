import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Chip
} from '@mui/material';
import api from '../services/api';

const SupportTickets = () => {
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Support Tickets
      </Typography>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket._id}>
                <TableCell>{ticket.user.email}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>
                  <Chip
                    label={ticket.status}
                    color={getStatusColor(ticket.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button onClick={() => setSelectedTicket(ticket._id)}>
                    Respond
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)} maxWidth="md" fullWidth>
        <DialogTitle>Respond to Ticket</DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box>
              <Typography variant="h6">Ticket Details</Typography>
              <Typography><strong>Subject:</strong> {tickets.find(t => t._id === selectedTicket)?.subject}</Typography>
              <Typography><strong>Message:</strong> {tickets.find(t => t._id === selectedTicket)?.message}</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTicket(null)}>Cancel</Button>
          <Button onClick={handleRespond} variant="contained">Send Response</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportTickets;