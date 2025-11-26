import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, IconButton, Alert, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Undo as UndoIcon,
  Upload as UploadIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import api from '../services/api';

const ProxyPoolManagement = () => {
  const [proxies, setProxies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bulk upload dialog
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Manual add dialog
  const [manualOpen, setManualOpen] = useState(false);
  const [manualData, setManualData] = useState({
    username: '',
    password: '',
    TotalIp: 1
  });
  const [manualLoading, setManualLoading] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: '',
    username: '',
    password: '',
    TotalIp: 1
  });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchProxies();
  }, []);

  const fetchProxies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pia/list');
      setProxies(response.data.proxies);
    } catch (err) {
      setError('Failed to fetch proxies');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    try {
      setBulkLoading(true);
      const lines = bulkText.trim().split('\n');
      const proxies = lines.map(line => {
        const [username, password, TotalIp] = line.split(',');
        return {
          username: username?.trim(),
          password: password?.trim(),
          TotalIp: parseInt(TotalIp?.trim()) || 1
        };
      }).filter(p => p.username && p.password);

      if (proxies.length === 0) {
        setError('No valid proxies found in input');
        return;
      }

      await api.post('/pia/create', { proxies });
      setSuccess(`${proxies.length} proxies added successfully`);
      setBulkOpen(false);
      setBulkText('');
      fetchProxies();
    } catch (err) {
      setError('Failed to add proxies');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleManualAdd = async () => {
    try {
      setManualLoading(true);
      await api.post('/pia/create', { proxies: [manualData] });
      setSuccess('Proxy added successfully');
      setManualOpen(false);
      setManualData({ username: '', password: '', TotalIp: 1 });
      fetchProxies();
    } catch (err) {
      setError('Failed to add proxy');
    } finally {
      setManualLoading(false);
    }
  };

  const handleRelease = async (id) => {
    try {
      await api.patch(`/pia/release/${id}`);
      setSuccess('Proxy released successfully');
      fetchProxies();
    } catch (err) {
      setError('Failed to release proxy');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this proxy?')) return;

    try {
      await api.delete(`/pia/remove/${id}`);
      setSuccess('Proxy deleted successfully');
      fetchProxies();
    } catch (err) {
      setError('Failed to delete proxy');
    }
  };

  const handleEdit = (proxy) => {
    setEditData({
      id: proxy._id,
      username: proxy.username,
      password: proxy.password,
      TotalIp: proxy.TotalIp
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      setEditLoading(true);
      await api.put(`/pia/update/${editData.id}`, {
        username: editData.username,
        password: editData.password,
        TotalIp: editData.TotalIp
      });
      setSuccess('Proxy updated successfully');
      setEditOpen(false);
      fetchProxies();
    } catch (err) {
      setError('Failed to update proxy');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Proxy Pool Management
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setBulkOpen(true)}
          >
            Bulk Upload
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setManualOpen(true)}
          >
            Add Single
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchProxies}
          >
            Refresh
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Password</TableCell>
                  <TableCell>Total IP</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Assigned At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proxies.map((proxy) => (
                  <TableRow key={proxy._id}>
                    <TableCell>{proxy.username}</TableCell>
                    <TableCell>{proxy.password}</TableCell>
                    <TableCell>{proxy.TotalIp}</TableCell>
                    <TableCell>
                      <Chip
                        label={proxy.isAssigned ? 'Assigned' : 'Available'}
                        color={proxy.isAssigned ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{proxy.assignedTo?.email || '-'}</TableCell>
                    <TableCell>
                      {proxy.assignedAt ? new Date(proxy.assignedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {proxy.isAssigned && (
                        <IconButton
                          color="primary"
                          onClick={() => handleRelease(proxy._id)}
                          title="Release proxy"
                        >
                          <UndoIcon />
                        </IconButton>
                      )}
                      <IconButton
                        color="secondary"
                        onClick={() => handleEdit(proxy)}
                        title="Edit proxy"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(proxy._id)}
                        title="Delete proxy"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Upload Proxies</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter proxies in CSV format: username,password,TotalIp (one per line)
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="user1,pass123,5&#10;user2,pass456,10"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBulkUpload}
            variant="contained"
            disabled={bulkLoading}
          >
            {bulkLoading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Add Dialog */}
      <Dialog open={manualOpen} onClose={() => setManualOpen(false)}>
        <DialogTitle>Add Single Proxy</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            value={manualData.username}
            onChange={(e) => setManualData({ ...manualData, username: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            value={manualData.password}
            onChange={(e) => setManualData({ ...manualData, password: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Total IP"
            type="number"
            value={manualData.TotalIp}
            onChange={(e) => setManualData({ ...manualData, TotalIp: parseInt(e.target.value) })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualOpen(false)}>Cancel</Button>
          <Button
            onClick={handleManualAdd}
            variant="contained"
            disabled={manualLoading}
          >
            {manualLoading ? <CircularProgress size={20} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Proxy</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            value={editData.username}
            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            value={editData.password}
            onChange={(e) => setEditData({ ...editData, password: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Total IP"
            type="number"
            value={editData.TotalIp}
            onChange={(e) => setEditData({ ...editData, TotalIp: parseInt(e.target.value) })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={editLoading}
          >
            {editLoading ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProxyPoolManagement;