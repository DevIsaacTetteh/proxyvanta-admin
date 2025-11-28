import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Switch,
  FormControlLabel,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
  Announcement as AnnouncementIcon,
  Update as UpdateIcon,
  Build as BuildIcon,
  LocalOffer as PromotionIcon,
  PriorityHigh as HighPriorityIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Videocam as VideocamIcon
} from '@mui/icons-material';
import api from '../services/api';

const NewsManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    videoThumbnail: '',
    videoFile: null,
    thumbnailFile: null,
    type: 'announcement',
    priority: 'medium'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchNews = useCallback(async () => {
    try {
      const response = await api.get('/admin/news');
      setNews(response.data.news);
    } catch (error) {
      showSnackbar('Failed to fetch news', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Auto-set content when video is provided (file or URL)
  useEffect(() => {
    if ((formData.videoFile || formData.videoUrl.trim()) && !formData.content.trim()) {
      const videoName = formData.videoFile ? formData.videoFile.name : 'Video URL';
      setFormData(prev => ({
        ...prev,
        content: `🎥 Video Content: ${videoName}`
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.videoFile, formData.videoUrl]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (newsItem = null) => {
    if (newsItem) {
      setEditingNews(newsItem);
      setFormData({
        title: newsItem.title,
        content: newsItem.content,
        videoUrl: newsItem.videoUrl || '',
        videoThumbnail: newsItem.videoThumbnail || '',
        videoFile: null,
        thumbnailFile: null,
        type: newsItem.type,
        priority: newsItem.priority
      });
    } else {
      setEditingNews(null);
      setFormData({
        title: '',
        content: '',
        videoUrl: '',
        videoThumbnail: '',
        videoFile: null,
        thumbnailFile: null,
        type: 'announcement',
        priority: 'medium'
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingNews(null);
    setFormData({
      title: '',
      content: '',
      videoUrl: '',
      videoThumbnail: '',
      videoFile: null,
      thumbnailFile: null,
      type: 'announcement',
      priority: 'medium'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showSnackbar('Title is required', 'error');
      return;
    }

    // Content is required unless a video is provided
    if (!formData.content.trim() && !formData.videoFile && !formData.videoUrl.trim()) {
      showSnackbar('Content is required unless a video is provided', 'error');
      return;
    }

    try {
      let videoFilePath = null; // Will be set if file is uploaded
      let thumbnailFilePath = formData.videoThumbnail; // Use URL if no file uploaded

      // Upload video file if provided
      if (formData.videoFile) {
        const videoFormData = new FormData();
        videoFormData.append('video', formData.videoFile);
        const videoResponse = await api.post('/admin/upload/video', videoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        videoFilePath = videoResponse.data.filePath;
      }

      // Upload thumbnail file if provided
      if (formData.thumbnailFile) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('thumbnail', formData.thumbnailFile);
        const thumbnailResponse = await api.post('/admin/upload/thumbnail', thumbnailFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        thumbnailFilePath = thumbnailResponse.data.filePath;
      }

      const newsData = {
        title: formData.title,
        content: formData.content,
        videoUrl: formData.videoUrl || null,
        videoFile: formData.videoFile ? videoFilePath : null,
        videoThumbnail: thumbnailFilePath,
        type: formData.type,
        priority: formData.priority
      };

      if (editingNews) {
        await api.put(`/admin/news/${editingNews._id}`, newsData);
        showSnackbar('News updated successfully');
      } else {
        await api.post('/admin/news', newsData);
        showSnackbar('News created successfully');
      }
      fetchNews();
      handleCloseDialog();
    } catch (error) {
      showSnackbar('Failed to save news', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) {
      return;
    }

    try {
      await api.delete(`/admin/news/${id}`);
      showSnackbar('News deleted successfully');
      fetchNews();
    } catch (error) {
      showSnackbar('Failed to delete news', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/admin/news/${id}/toggle`);
      showSnackbar('News status updated successfully');
      fetchNews();
    } catch (error) {
      showSnackbar('Failed to update news status', 'error');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'announcement': return <AnnouncementIcon />;
      case 'update': return <UpdateIcon />;
      case 'maintenance': return <BuildIcon />;
      case 'promotion': return <PromotionIcon />;
      default: return <CampaignIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'announcement': return 'primary';
      case 'update': return 'info';
      case 'maintenance': return 'warning';
      case 'promotion': return 'success';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return <WarningIcon color="error" />;
      case 'high': return <HighPriorityIcon color="error" />;
      case 'medium': return <InfoIcon color="warning" />;
      case 'low': return <CheckCircleIcon color="success" />;
      default: return <InfoIcon />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
        <Typography variant="h4" gutterBottom>News Management</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: { xs: 'center', sm: 'space-between' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 2, sm: 0 },
        mb: { xs: 2, sm: 3 }
      }}>
        <Typography
          variant={isSmallScreen ? "h5" : "h4"}
          component="h1"
          sx={{
            fontWeight: 600,
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          News Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          fullWidth={isSmallScreen}
          sx={{
            borderRadius: 2,
            px: { xs: 2, sm: 3 },
            py: { xs: 1.25, sm: 1.5 },
            fontSize: { xs: '0.875rem', sm: '0.95rem' },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
            }
          }}
        >
          {isSmallScreen ? 'Create' : 'Create News'}
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 1, sm: 2, md: 0 } }}>
          {isMobile ? (
            // Mobile Card Layout
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {news.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No news items found. Create your first news item!
                  </Typography>
                </Box>
              ) : (
                news.map((item) => (
                  <Card
                    key={item._id}
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      opacity: item.isActive ? 1 : 0.6,
                      border: item.isActive ? 'none' : '1px solid #e0e0e0'
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                            {item.title}
                          </Typography>
                          {(item.videoUrl || item.videoFile) && (
                            <VideocamIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4
                        }}>
                          {item.content}
                        </Typography>
                      </Box>
                        <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(item)}
                              sx={{ color: 'primary.main' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(item._id)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                        <Chip
                          icon={getTypeIcon(item.type)}
                          label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          color={getTypeColor(item.type)}
                          size="small"
                          sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getPriorityIcon(item.priority)}
                          <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                            {item.priority}
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={item.isActive}
                              onChange={() => handleToggleStatus(item._id)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </Typography>
                          }
                          sx={{ ml: 0 }}
                        />
                      </Box>

                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          ) : (
            // Desktop Table Layout
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{
                    '& .MuiTableCell-head': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }
                  }}>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {news.map((item) => (
                    <TableRow
                      key={item._id}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        opacity: item.isActive ? 1 : 0.6
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {item.title}
                            </Typography>
                            {(item.videoUrl || item.videoFile) && (
                              <VideocamIcon sx={{ color: 'primary.main', fontSize: '1rem' }} />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '300px'
                          }}>
                            {item.content}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getTypeIcon(item.type)}
                          label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          color={getTypeColor(item.type)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getPriorityIcon(item.priority)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {item.priority}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={item.isActive}
                              onChange={() => handleToggleStatus(item._id)}
                              color="primary"
                              size="small"
                            />
                          }
                          label={item.isActive ? 'Active' : 'Inactive'}
                          sx={{ ml: 0 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleOpenDialog(item)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDelete(item._id)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {news.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary">
                          No news items found. Create your first news item!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isSmallScreen}
        PaperProps={{
          sx: {
            borderRadius: isSmallScreen ? 0 : 3,
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            m: isSmallScreen ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: isSmallScreen ? 2 : 3,
          px: isSmallScreen ? 2 : 3
        }}>
          <CampaignIcon />
          <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
            {editingNews ? 'Edit News' : 'Create News'}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: isSmallScreen ? 2 : 3 }}>
            <Grid container spacing={isSmallScreen ? 2 : 3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                  size={isSmallScreen ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={formData.videoFile || formData.videoUrl ? "Content (Optional)" : "Content"}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  multiline
                  rows={isSmallScreen ? 4 : 6}
                  placeholder={formData.videoFile || formData.videoUrl
                    ? "Optional: Add additional text content, or leave blank if video is the main content"
                    : "Enter the news content here..."
                  }
                  helperText={formData.videoFile || formData.videoUrl
                    ? "Since a video is provided, content is optional. The video will be displayed as the main content."
                    : "Required: Enter the news content here"
                  }
                  size={isSmallScreen ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size={isSmallScreen ? "small" : "medium"}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    label="Type"
                  >
                    <MenuItem value="announcement">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AnnouncementIcon fontSize="small" />
                        Announcement
                      </Box>
                    </MenuItem>
                    <MenuItem value="update">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <UpdateIcon fontSize="small" />
                        Update
                      </Box>
                    </MenuItem>
                    <MenuItem value="maintenance">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BuildIcon fontSize="small" />
                        Maintenance
                      </Box>
                    </MenuItem>
                    <MenuItem value="promotion">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PromotionIcon fontSize="small" />
                        Promotion
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size={isSmallScreen ? "small" : "medium"}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="low">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon fontSize="small" color="success" />
                        Low
                      </Box>
                    </MenuItem>
                    <MenuItem value="medium">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoIcon fontSize="small" color="warning" />
                        Medium
                      </Box>
                    </MenuItem>
                    <MenuItem value="high">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HighPriorityIcon fontSize="small" color="error" />
                        High
                      </Box>
                    </MenuItem>
                    <MenuItem value="critical">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon fontSize="small" color="error" />
                        Critical
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Video URL (Optional)"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  helperText="Enter a YouTube, Vimeo, or direct video URL"
                  size={isSmallScreen ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Or Upload Video File (MP4, max 100MB)
                  </Typography>
                  <input
                    type="file"
                    accept="video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm"
                    onChange={(e) => setFormData({ ...formData, videoFile: e.target.files[0] })}
                    style={{ width: '100%' }}
                  />
                  {formData.videoFile && (
                    <Typography variant="caption" color="text.secondary">
                      Selected: {formData.videoFile.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Video Thumbnail URL (Optional)"
                  value={formData.videoThumbnail}
                  onChange={(e) => setFormData({ ...formData, videoThumbnail: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                  helperText="Enter a thumbnail image URL for the video"
                  size={isSmallScreen ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Or Upload Thumbnail Image (JPG, PNG, max 5MB)
                  </Typography>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => setFormData({ ...formData, thumbnailFile: e.target.files[0] })}
                    style={{ width: '100%' }}
                  />
                  {formData.thumbnailFile && (
                    <Typography variant="caption" color="text.secondary">
                      Selected: {formData.thumbnailFile.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{
            p: isSmallScreen ? 2 : 3,
            pt: 0,
            flexDirection: isSmallScreen ? 'column' : 'row',
            gap: isSmallScreen ? 1 : 0
          }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              fullWidth={isSmallScreen}
              sx={{
                borderRadius: 2,
                py: isSmallScreen ? 1.5 : 'auto'
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth={isSmallScreen}
              sx={{
                borderRadius: 2,
                py: isSmallScreen ? 1.5 : 'auto',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              {editingNews ? 'Update News' : 'Create News'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewsManagement;