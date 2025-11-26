import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider
} from '@mui/material';
import {
  Support as SupportIcon,
  Send as SendIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../services/api';

const SupportManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;

      const response = await api.get('/admin/support/tickets', { params });
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setError('Failed to load support tickets');
    }
  }, [statusFilter, priorityFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await api.get('/admin/support/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [loadTickets, loadStats]);

  const loadMessages = async (ticketId) => {
    try {
      const response = await api.get(`/admin/support/tickets/${ticketId}/messages`);
      if (response.data.success) {
        setSelectedTicket(response.data.ticket);
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setLoading(true);
    try {
      const response = await api.post(
        `/admin/support/tickets/${selectedTicket.id}/messages`,
        { message: newMessage }
      );
      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
        await loadTickets(); // Refresh ticket list
        await loadStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      const response = await api.patch(
        `/admin/support/tickets/${ticketId}/status`,
        { status }
      );
      if (response.data.success) {
        setSuccess(`Ticket status updated to ${status.replace('_', ' ')}`);
        await loadTickets();
        await loadStats();
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(response.data.ticket);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update ticket status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'closed': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#1976d2';
      case 'low': return '#388e3c';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <CancelIcon />;
      case 'in_progress': return <ScheduleIcon />;
      case 'closed': return <CheckCircleIcon />;
      default: return <SupportIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SupportIcon sx={{ mr: 2 }} />
        Support Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Tickets
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Open Tickets
                </Typography>
                <Typography variant="h4" color="error.main">{stats.open}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h4" color="warning.main">{stats.inProgress}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Closed Tickets
                </Typography>
                <Typography variant="h4" color="success.main">{stats.closed}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <MenuItem value="all">All Priority</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            loadTickets();
            loadStats();
          }}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Tickets List */}
        <Grid item xs={12} md={selectedTicket ? 6 : 12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Support Tickets ({tickets.length})
            </Typography>

            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Last Message</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow
                      key={ticket._id}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        bgcolor: selectedTicket?.id === ticket._id ? 'action.selected' : 'inherit'
                      }}
                      onClick={() => loadMessages(ticket._id)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {ticket.userId?.username || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ticket.userId?.email || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {ticket.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(ticket.status)}
                          label={ticket.status.replace('_', ' ')}
                          color={getStatusColor(ticket.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: getPriorityColor(ticket.priority),
                            display: 'inline-block',
                            mr: 1
                          }}
                        />
                        {ticket.priority}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(ticket.lastMessage).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {ticket.status === 'open' && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(ticket._id, 'in_progress');
                              }}
                            >
                              Start
                            </Button>
                          )}
                          {ticket.status === 'in_progress' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(ticket._id, 'closed');
                              }}
                            >
                              Close
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {tickets.length === 0 && (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No support tickets found
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Chat Panel */}
        {selectedTicket && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedTicket.subject}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedTicket.user?.username} ({selectedTicket.user?.email})
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={selectedTicket.status.replace('_', ' ')}
                    color={getStatusColor(selectedTicket.status)}
                    size="small"
                  />
                  <Chip
                    label={selectedTicket.category}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', mb: 2, p: 1 }}>
                {messages.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                    No messages yet
                  </Typography>
                ) : (
                  messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        mb: 2,
                        justifyContent: message.senderType === 'admin' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, mt: 0.5 }}>
                          {message.senderType === 'admin' ? <AdminIcon /> : <PersonIcon />}
                        </Avatar>
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: message.senderType === 'admin' ? 'primary.main' : 'grey.100',
                            color: message.senderType === 'admin' ? 'white' : 'text.primary',
                            borderRadius: message.senderType === 'admin' ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                          }}
                        >
                          <Typography variant="body2">{message.message}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.7,
                              textAlign: message.senderType === 'admin' ? 'right' : 'left'
                            }}
                          >
                            {new Date(message.createdAt).toLocaleString()}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>

              {/* Message Input */}
              {selectedTicket.status !== 'closed' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Type your response..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={loading}
                    multiline
                    maxRows={3}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim()}
                    endIcon={<SendIcon />}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Send
                  </Button>
                </Box>
              )}

              {selectedTicket.status === 'closed' && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  This ticket is closed. You cannot send new messages.
                </Alert>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SupportManagement;