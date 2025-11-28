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
  Divider,
  useMediaQuery,
  useTheme
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3, lg: 4 }, maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, textAlign: 'center' }}>
        <Typography
          variant="h3"
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
          Support Management
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
          Monitor and respond to customer support tickets and inquiries.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
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
                  <SupportIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </Avatar>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                  }}
                >
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Total Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: 'white'
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
                  <CancelIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </Avatar>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                  }}
                >
                  {stats.open}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Open Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              color: 'white'
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
                  <ScheduleIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </Avatar>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                  }}
                >
                  {stats.inProgress}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              color: 'white'
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
                  <CheckCircleIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </Avatar>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                  }}
                >
                  {stats.closed}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Closed Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 3 },
        mb: { xs: 2, sm: 3 },
        alignItems: { xs: 'stretch', sm: 'center' },
        p: { xs: 2, sm: 3 },
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ borderRadius: 2 }}
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
          onClick={loadTickets}
          sx={{
            borderRadius: 2,
            alignSelf: { xs: 'flex-end', sm: 'auto' },
            minWidth: { xs: '100%', sm: 'auto' }
          }}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mb: { xs: 2, sm: 3 }
      }}>
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

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Tickets List */}
        <Grid item xs={12} md={selectedTicket ? 6 : 12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Support Tickets ({tickets.length})
              </Typography>

              {/* Desktop Table View */}
              {!isMobile && (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: { xs: 500, sm: 600 } }}>
                    <TableHead sx={{
                      '& .MuiTableCell-head': {
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        color: 'text.primary',
                        borderBottom: '2px solid rgba(0,0,0,0.08)'
                      }
                    }}>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Subject</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Priority</TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Last Message</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tickets.map((ticket) => (
                        <TableRow
                          key={ticket._id}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                            '& .MuiTableCell-root': {
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              py: { xs: 1.5, sm: 2 }
                            }
                          }}
                          onClick={() => loadMessages(ticket._id)}
                        >
                          <TableCell sx={{ minWidth: { xs: 150, sm: 200 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
                                <PersonIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                              </Avatar>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight="600"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {ticket.userId?.username || 'Unknown'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: { xs: 'none', sm: 'block' }
                                  }}
                                >
                                  {ticket.userId?.email || ''}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, maxWidth: 200 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {ticket.subject}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(ticket.status)}
                              label={ticket.status.replace('_', ' ')}
                              color={getStatusColor(ticket.status)}
                              size="small"
                              sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: getPriorityColor(ticket.priority),
                                  flexShrink: 0
                                }}
                              />
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {ticket.priority}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(ticket.lastMessage).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {ticket.status === 'open' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(ticket._id, 'in_progress');
                                  }}
                                  sx={{
                                    fontSize: '0.7rem',
                                    px: { xs: 1, sm: 2 },
                                    minWidth: 'auto'
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
                                  sx={{
                                    fontSize: '0.7rem',
                                    px: { xs: 1, sm: 2 },
                                    minWidth: 'auto'
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
              )}

              {/* Mobile Card View */}
              {isMobile && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {tickets.map((ticket) => (
                    <Card
                      key={ticket._id}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onClick={() => loadMessages(ticket._id)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            <PersonIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body1" fontWeight="600" sx={{ fontSize: '0.9rem' }}>
                              {ticket.userId?.username || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ticket.userId?.email || ''}
                            </Typography>
                          </Box>
                          <Chip
                            icon={getStatusIcon(ticket.status)}
                            label={ticket.status.replace('_', ' ')}
                            color={getStatusColor(ticket.status)}
                            size="small"
                            sx={{ fontSize: '0.65rem', fontWeight: 600 }}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            mb: 1.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.4
                          }}
                        >
                          {ticket.subject}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: getPriorityColor(ticket.priority),
                                flexShrink: 0
                              }}
                            />
                            <Typography variant="caption" sx={{ textTransform: 'capitalize', color: 'text.secondary' }}>
                              {ticket.priority}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {ticket.status === 'open' && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(ticket._id, 'in_progress');
                                }}
                                sx={{ fontSize: '0.7rem', px: 1, minWidth: 'auto' }}
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
                                sx={{ fontSize: '0.7rem', px: 1, minWidth: 'auto' }}
                              >
                                Close
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {tickets.length === 0 && (
                <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 8 } }}>
                  <SupportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No support tickets found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Chat Panel */}
        {selectedTicket && (
          <Grid item xs={12} md={6}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: { xs: '500px', sm: '600px' },
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  mb: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                    <Avatar sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, mr: 1.5, flexShrink: 0 }}>
                      <PersonIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {selectedTicket.subject}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {selectedTicket.user?.username} ({selectedTicket.user?.email})
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    gap: 0.5,
                    flexWrap: 'wrap',
                    alignSelf: { xs: 'flex-start', sm: 'auto' }
                  }}>
                    <Chip
                      label={selectedTicket.status.replace('_', ' ')}
                      color={getStatusColor(selectedTicket.status)}
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={selectedTicket.category}
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Messages */}
                <Box sx={{
                  flex: 1,
                  overflow: 'auto',
                  mb: 2,
                  p: 1,
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  minHeight: 0
                }}>
                  {messages.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                        No messages yet
                      </Typography>
                    </Box>
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
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          maxWidth: { xs: '85%', sm: '80%' },
                          minWidth: 0
                        }}>
                          <Avatar sx={{
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 },
                            mr: 1,
                            mt: 0.5,
                            flexShrink: 0
                          }}>
                            {message.senderType === 'admin' ? <AdminIcon /> : <PersonIcon />}
                          </Avatar>
                          <Paper
                            sx={{
                              p: { xs: 1, sm: 1.5 },
                              bgcolor: message.senderType === 'admin' ? 'primary.main' : 'background.paper',
                              color: message.senderType === 'admin' ? 'white' : 'text.primary',
                              borderRadius: message.senderType === 'admin' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              wordBreak: 'break-word'
                            }}
                          >
                            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {message.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                opacity: 0.7,
                                textAlign: message.senderType === 'admin' ? 'right' : 'left',
                                fontSize: '0.7rem'
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
                  <Box sx={{
                    display: 'flex',
                    gap: 1,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'flex-end' }
                  }}>
                    <TextField
                      fullWidth
                      placeholder="Type your response..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={loading}
                      multiline
                      maxRows={3}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={loading || !newMessage.trim()}
                      startIcon={<SendIcon />}
                      sx={{
                        alignSelf: { xs: 'flex-end', sm: 'auto' },
                        minWidth: { xs: '100%', sm: 'auto' },
                        mt: { xs: 1, sm: 0 }
                      }}
                    >
                      {loading ? 'Sending...' : 'Send'}
                    </Button>
                  </Box>
                )}

                {selectedTicket.status === 'closed' && (
                  <Alert
                    severity="info"
                    sx={{
                      mt: 1,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    This ticket is closed. You cannot send new messages.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SupportManagement;