import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Grid, TextField, Button,
  Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem,
  Chip, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider,
  IconButton, Badge
} from '@mui/material';
import {
  Send as SendIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Support as SupportIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Mail as MailIcon
} from '@mui/icons-material';
import api from '../services/api';

const EmailManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Individual email
  const [individualEmail, setIndividualEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [individualSubject, setIndividualSubject] = useState('');
  const [individualMessage, setIndividualMessage] = useState('');

  // Broadcast email
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastConfirm, setBroadcastConfirm] = useState(false);

  // Support emails
  const [supportEmails, setSupportEmails] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [replyDialog, setReplyDialog] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleIndividualSend = async () => {
    if (!individualEmail && !selectedUser) {
      setError('Please select a user or enter an email address');
      return;
    }
    if (!individualSubject.trim() || !individualMessage.trim()) {
      setError('Please fill in both subject and message');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const recipient = selectedUser ? users.find(u => u._id === selectedUser)?.email : individualEmail;

      await api.post('/admin/send-email', {
        to: recipient,
        subject: individualSubject,
        message: individualMessage
      });

      setSuccess('Email sent successfully!');
      setIndividualEmail('');
      setSelectedUser('');
      setIndividualSubject('');
      setIndividualMessage('');
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastSend = async () => {
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      setError('Please fill in both subject and message');
      return;
    }
    if (!broadcastConfirm) {
      setError('Please confirm broadcast to all users');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await api.post('/admin/broadcast-email', {
        subject: broadcastSubject,
        message: broadcastMessage
      });

      setSuccess(`Broadcast email sent to ${users.length} users successfully!`);
      setBroadcastSubject('');
      setBroadcastMessage('');
      setBroadcastConfirm(false);
    } catch (err) {
      setError('Failed to send broadcast email');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    const user = users.find(u => u._id === userId);
    if (user) {
      setIndividualEmail(user.email);
    }
  };

  // Support email functions
  const fetchSupportEmails = useCallback(async () => {
    try {
      setSupportLoading(true);
      const response = await api.get(`/admin/support-emails?status=${statusFilter}`);
      setSupportEmails(response.data.emails || []);
    } catch (err) {
      console.error('Failed to fetch support emails:', err);
      setError('Failed to load support emails');
    } finally {
      setSupportLoading(false);
    }
  }, [statusFilter]);

  const handleEmailClick = async (email) => {
    try {
      const response = await api.get(`/admin/support-emails/${email._id}`);
      setSelectedEmail(response.data.email);
    } catch (err) {
      setError('Failed to load email details');
    }
  };

  const handleReply = () => {
    setReplyDialog(true);
    setReplyMessage('');
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      setError('Reply message cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/admin/support-emails/${selectedEmail._id}/reply`, {
        message: replyMessage
      });

      setSuccess('Reply sent successfully');
      setReplyDialog(false);
      setReplyMessage('');
      fetchSupportEmails(); // Refresh the list

      // Update the selected email status
      setSelectedEmail(prev => ({ ...prev, status: 'replied' }));
    } catch (err) {
      setError('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (emailId, newStatus) => {
    try {
      await api.patch(`/admin/support-emails/${emailId}/status`, {
        status: newStatus
      });
      fetchSupportEmails();
      if (selectedEmail && selectedEmail._id === emailId) {
        setSelectedEmail(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError('Failed to update email status');
    }
  };

  useEffect(() => {
    fetchUsers();
    if (activeTab === 1) {
      fetchSupportEmails();
    }
  }, [activeTab, statusFilter, fetchSupportEmails]);

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
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
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.5rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Email Management
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: '600px',
            mx: { xs: 'auto', sm: 0 },
            px: { xs: 2, sm: 0 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Send emails to users and manage incoming support emails.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Outgoing Emails" />
          <Tab label="Support Inbox" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Individual Email */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Send to Individual User
                  </Typography>
                </Box>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select User</InputLabel>
                  <Select
                    value={selectedUser}
                    onChange={(e) => handleUserSelect(e.target.value)}
                    label="Select User"
                  >
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.username} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Or Enter Email Address"
                  value={individualEmail}
                  onChange={(e) => setIndividualEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  type="email"
                />

                <TextField
                  fullWidth
                  label="Subject"
                  value={individualSubject}
                  onChange={(e) => setIndividualSubject(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Message"
                  value={individualMessage}
                  onChange={(e) => setIndividualMessage(e.target.value)}
                  multiline
                  rows={6}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  onClick={handleIndividualSend}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                >
                  {loading ? 'Sending...' : 'Send Email'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Broadcast Email */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GroupIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Broadcast to All Users
                  </Typography>
                  <Chip
                    label={`${users.length} users`}
                    size="small"
                    color="primary"
                    sx={{ ml: 'auto' }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Subject"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Message"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  multiline
                  rows={6}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    This will send the email to all {users.length} registered users.
                  </Typography>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={broadcastConfirm}
                      onChange={(e) => setBroadcastConfirm(e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <Typography variant="body2">
                      I confirm I want to broadcast this message to all users
                    </Typography>
                  </label>
                </Box>

                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
                  onClick={handleBroadcastSend}
                  disabled={loading || !broadcastConfirm}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6a4190 0%, #5a6fd8 100%)'
                    }
                  }}
                >
                  {loading ? 'Broadcasting...' : 'Broadcast Email'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Support Email List */}
          <Grid item xs={12} md={selectedEmail ? 5 : 12}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SupportIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Support Inbox
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="unread">Unread</MenuItem>
                        <MenuItem value="read">Read</MenuItem>
                        <MenuItem value="replied">Replied</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton onClick={fetchSupportEmails} size="small">
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </Box>

                {supportLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : supportEmails.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <MailIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No support emails found
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                    {supportEmails.map((email) => (
                      <ListItem
                        key={email._id}
                        button
                        onClick={() => handleEmailClick(email)}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          backgroundColor: selectedEmail?._id === email._id ? 'action.selected' : 'background.paper',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            color={email.status === 'unread' ? 'error' : 'default'}
                            variant="dot"
                            invisible={email.status !== 'unread'}
                          >
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {email.from.charAt(0).toUpperCase()}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {email.from}
                              </Typography>
                              <Chip
                                label={email.status}
                                size="small"
                                color={
                                  email.status === 'unread' ? 'error' :
                                  email.status === 'replied' ? 'success' :
                                  email.status === 'closed' ? 'default' : 'warning'
                                }
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {email.subject}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(email.createdAt).toLocaleDateString()} • {email.message.substring(0, 50)}...
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Support Email Detail */}
          {selectedEmail && (
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Email Details
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={handleReply}
                        color="primary"
                        size="small"
                        title="Reply"
                      >
                        <ReplyIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleStatusChange(selectedEmail._id, 'closed')}
                        color="default"
                        size="small"
                        title="Mark as Closed"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">From:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{selectedEmail.from}</Typography>

                    <Typography variant="subtitle2" color="text.secondary">Subject:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{selectedEmail.subject}</Typography>

                    <Typography variant="subtitle2" color="text.secondary">Status:</Typography>
                    <Chip
                      label={selectedEmail.status}
                      size="small"
                      color={
                        selectedEmail.status === 'unread' ? 'error' :
                        selectedEmail.status === 'replied' ? 'success' :
                        selectedEmail.status === 'closed' ? 'default' : 'warning'
                      }
                      sx={{ mb: 2 }}
                    />

                    <Typography variant="subtitle2" color="text.secondary">Received:</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {new Date(selectedEmail.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Message:</Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    mb: 3,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedEmail.message}
                  </Box>

                  {selectedEmail.replies && selectedEmail.replies.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Replies ({selectedEmail.replies.length}):
                      </Typography>
                      {selectedEmail.replies.map((reply, index) => (
                        <Box key={index} sx={{
                          p: 2,
                          bgcolor: 'primary.50',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'primary.200',
                          mb: 2
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {reply.from}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(reply.sentAt).toLocaleString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {reply.message}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Reply to Support Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Replying to: {selectedEmail?.from} - {selectedEmail?.subject}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Reply Message"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Enter your reply message here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSendReply}
            variant="contained"
            disabled={loading || !replyMessage.trim()}
          >
            {loading ? <CircularProgress size={20} /> : 'Send Reply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmailManagement;