import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, IconButton, Alert, CircularProgress, Card, CardContent,
  Tabs, Tab, useMediaQuery, useTheme, Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Undo as UndoIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import api from '../services/api';

const ProxyPoolManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [proxies, setProxies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bulk upload dialog
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('text'); // 'text' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

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
      let proxies = [];

      if (uploadMethod === 'text') {
        const lines = bulkText.trim().split('\n');
        proxies = lines.map(line => {
          const [username, password, TotalIp] = line.split(',');
          return {
            username: username?.trim(),
            password: password?.trim(),
            TotalIp: parseInt(TotalIp?.trim()) || 1
          };
        }).filter(p => p.username && p.password);
      } else if (uploadMethod === 'file' && selectedFile) {
        proxies = await parseXlsxFile(selectedFile);
      }

      if (proxies.length === 0) {
        setError('No valid proxies found in input');
        return;
      }

      await api.post('/pia/create', { proxies });
      setSuccess(`${proxies.length} proxies added successfully`);
      setBulkOpen(false);
      setBulkText('');
      setSelectedFile(null);
      setFileError('');
      fetchProxies();
    } catch (err) {
      setError('Failed to add proxies');
    } finally {
      setBulkLoading(false);
    }
  };

  const parseXlsxFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const proxies = jsonData.map(row => {
            // Handle different possible column names for TotalIP
            const totalIpValue = row.TotalIP || row.TotalIp || row.totalIP || row.totalIp || row['Total IP'] || row['total ip'] || row.Total_IP || 1;

            return {
              username: row.username?.toString().trim(),
              password: row.password?.toString().trim(),
              TotalIp: parseInt(totalIpValue) || 1
            };
          }).filter(p => p.username && p.password);

          resolve(proxies);
        } catch (error) {
          reject(new Error('Failed to parse XLSX file. Please ensure the file has columns: username, password, TotalIP'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
        setFileError('Please select a valid XLSX or XLS file');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setFileError('');
    }
  };

  const handleBulkDialogClose = () => {
    setBulkOpen(false);
    setBulkText('');
    setSelectedFile(null);
    setFileError('');
    setUploadMethod('text');
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
          Proxy Pool Management
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
          Manage your proxy inventory, add new proxies, and monitor assignment status.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{
        mb: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 2 },
        alignItems: { xs: 'stretch', sm: 'center' }
      }}>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setBulkOpen(true)}
          fullWidth={{ xs: true, sm: false }}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
            }
          }}
        >
          Bulk Upload
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setManualOpen(true)}
          fullWidth={{ xs: true, sm: false }}
          sx={{ borderRadius: 2 }}
        >
          Add Single
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchProxies}
          fullWidth={{ xs: true, sm: false }}
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      <>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 4, sm: 8 } }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
                        <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Password</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Total IP</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell>
                        <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Assigned At</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {proxies.map((proxy) => (
                        <TableRow
                          key={proxy._id}
                          sx={{
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                            '& .MuiTableCell-root': {
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              py: { xs: 1.5, sm: 2 }
                            }
                          }}
                        >
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{proxy.username}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{proxy.password}</TableCell>
                          <TableCell>
                            <Chip
                              label={proxy.TotalIp}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proxy.isAssigned ? 'Assigned' : 'Available'}
                              color={proxy.isAssigned ? 'error' : 'success'}
                              size="small"
                              sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: { xs: 120, sm: 150 } }}>
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {proxy.assignedTo?.email || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            {proxy.assignedAt ? new Date(proxy.assignedAt).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {proxy.isAssigned && (
                                <IconButton
                                  color="primary"
                                  onClick={() => handleRelease(proxy._id)}
                                  title="Release proxy"
                                  size="small"
                                  sx={{
                                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                                  }}
                                >
                                  <UndoIcon fontSize="small" />
                                </IconButton>
                              )}
                              <IconButton
                                color="secondary"
                                onClick={() => handleEdit(proxy)}
                                title="Edit proxy"
                                size="small"
                                sx={{
                                  '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.1)' }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(proxy._id)}
                                title="Delete proxy"
                                size="small"
                                sx={{
                                  '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
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
                  {proxies.map((proxy) => (
                    <Card
                      key={proxy._id}
                      sx={{
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: proxy.isAssigned ? '1px solid #f44336' : '1px solid #4caf50'
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {proxy.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="600" sx={{ fontFamily: 'monospace' }}>
                                {proxy.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {proxy.password}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={proxy.isAssigned ? 'Assigned' : 'Available'}
                            color={proxy.isAssigned ? 'error' : 'success'}
                            size="small"
                            sx={{ fontSize: '0.65rem', fontWeight: 600 }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total IPs:
                          </Typography>
                          <Chip
                            label={proxy.TotalIp}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>

                        {proxy.assignedTo && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Assigned to:
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                              {proxy.assignedTo.email}
                            </Typography>
                          </Box>
                        )}

                        {proxy.assignedAt && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Assigned at:
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(proxy.assignedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {proxy.isAssigned && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleRelease(proxy._id)}
                              sx={{ fontSize: '0.7rem', px: 1 }}
                            >
                              Release
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleEdit(proxy)}
                            sx={{ fontSize: '0.7rem', px: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(proxy._id)}
                            sx={{ fontSize: '0.7rem', px: 1 }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        {/* Bulk Upload Dialog */}
        <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="md" fullWidth fullScreen={{ xs: true, sm: false }}>
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
          <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
            <Button onClick={() => setBulkOpen(false)} fullWidth={{ xs: true, sm: false }}>Cancel</Button>
            <Button
              onClick={handleBulkUpload}
              variant="contained"
              disabled={bulkLoading}
              fullWidth={{ xs: true, sm: false }}
            >
              {bulkLoading ? <CircularProgress size={20} /> : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Manual Add Dialog */}
        <Dialog open={manualOpen} onClose={() => setManualOpen(false)} maxWidth="sm" fullWidth fullScreen={{ xs: true, sm: false }}>
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
          <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
            <Button onClick={() => setManualOpen(false)} fullWidth={{ xs: true, sm: false }}>Cancel</Button>
            <Button
              onClick={handleManualAdd}
              variant="contained"
              disabled={manualLoading}
              fullWidth={{ xs: true, sm: false }}
            >
              {manualLoading ? <CircularProgress size={20} /> : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth fullScreen={{ xs: true, sm: false }}>
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
          <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
            <Button onClick={() => setEditOpen(false)} fullWidth={{ xs: true, sm: false }}>Cancel</Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              disabled={editLoading}
              fullWidth={{ xs: true, sm: false }}
            >
              {editLoading ? <CircularProgress size={20} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog open={bulkOpen} onClose={handleBulkDialogClose} maxWidth="md" fullWidth fullScreen={{ xs: true, sm: false }}>
          <DialogTitle>Bulk Upload Proxies</DialogTitle>
          <DialogContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={uploadMethod} onChange={(e, newValue) => setUploadMethod(newValue)}>
                <Tab label="Text Input" value="text" />
                <Tab label="Excel File (.xlsx)" value="file" />
              </Tabs>
            </Box>

            {uploadMethod === 'text' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter proxy credentials in CSV format: username,password,TotalIP (one per line)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Proxy Data"
                  placeholder="user1,password1,5&#10;user2,password2,10&#10;user3,password3,3"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Box>
            )}

            {uploadMethod === 'file' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload an Excel file (.xlsx) with columns: username, password, TotalIP
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    id="excel-file-upload"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="excel-file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      sx={{ height: 100, border: '2px dashed', borderColor: 'primary.main' }}
                    >
                      {selectedFile ? selectedFile.name : 'Click to select Excel file'}
                    </Button>
                  </label>
                </Box>
                {fileError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {fileError}
                  </Alert>
                )}
                {selectedFile && !fileError && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    File selected: {selectedFile.name}
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
            <Button onClick={handleBulkDialogClose} fullWidth={{ xs: true, sm: false }}>Cancel</Button>
            <Button
              onClick={handleBulkUpload}
              variant="contained"
              disabled={bulkLoading || (uploadMethod === 'file' && !selectedFile) || (uploadMethod === 'text' && !bulkText.trim())}
              fullWidth={{ xs: true, sm: false }}
            >
              {bulkLoading ? <CircularProgress size={20} /> : `Upload ${uploadMethod === 'file' ? 'File' : 'Text'}`}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </Container>
  );
};

export default ProxyPoolManagement;