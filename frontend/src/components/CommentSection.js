import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Avatar,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Rating,
  TablePagination,
} from "@mui/material";
import {
  ThumbUp,
  ThumbDown,
  Edit,
  Delete,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import api from "../services/api";

function CommentSection({ refreshFlag }) {
  const [comments, setComments] = useState([]);
  const [votedComments, setVotedComments] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCommentData, setEditCommentData] = useState(null);
  const [expandedCommentIds, setExpandedCommentIds] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const currentUser = localStorage.getItem("username");

  const fetchComments = async () => {
    try {
      const res = await api.get("/api/comments");
      setComments(res.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [refreshFlag]);

  const handleVote = async (id, voteType) => {
    if (votedComments[id]) return;
    try {
      await api.post("/api/comments/thumbs", {
        comment_id: id,
        vote_type: voteType,
      });
      setVotedComments((prev) => ({ ...prev, [id]: voteType }));
      fetchComments();
    } catch (error) {
      console.error("Error voting on comment:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/comments/${id}`);
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEdit = (comment) => {
    setEditCommentData({
      ...comment,
      rating: comment.rating || 0,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await api.put(`/api/comments/${editCommentData.id}`, {
        feedback: editCommentData.feedback,
        rating: editCommentData.rating,
      });
      setEditDialogOpen(false);
      setEditCommentData(null);
      fetchComments();
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCommentIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (commentToDelete) {
      try {
        await api.delete(`/api/comments/${commentToDelete.id}`);
        setDeleteDialogOpen(false);
        setCommentToDelete(null);
        fetchComments();
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const renderComment = (comment) => (
    <Grid item xs={12} sm={6} md={4} key={comment.id}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          height: "100%", // Ensure consistent height
          borderRadius: 2,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: 3,
          },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 32,
              height: 32,
              fontSize: "0.9rem",
            }}
          >
            {comment.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {comment.username}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              noWrap
            >
              {new Date(comment.timestamp).toLocaleString()}
            </Typography>
          </Box>
          <Rating
            value={comment.rating}
            readOnly
            precision={0.01}
            size="small"
            sx={{ color: "primary.main" }}
          />
        </Box>

        {/* Content section */}
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            bgcolor: "grey.50",
            borderRadius: 1,
            mb: 1.5,
            overflow: "auto",
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            <strong>Entry ID:</strong> {comment.entry_id}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            <strong>Q:</strong> {comment.question}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              maxHeight: "100px",
              overflow: "auto",
            }}
          >
            {comment.feedback}
          </Typography>
        </Box>

        {/* Actions section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            pt: 1,
            borderTop: "1px solid",
            borderColor: "grey.100",
          }}
        >
          <IconButton
            onClick={() => handleVote(comment.id, "up")}
            disabled={votedComments[comment.id] !== undefined}
            color={votedComments[comment.id] === "up" ? "primary" : "default"}
            size="small"
          >
            <ThumbUp fontSize="small" />
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {comment.thumbs_up}
            </Typography>
          </IconButton>

          <IconButton
            onClick={() => handleVote(comment.id, "down")}
            disabled={votedComments[comment.id] !== undefined}
            color={votedComments[comment.id] === "down" ? "primary" : "default"}
            size="small"
          >
            <ThumbDown fontSize="small" />
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {comment.thumbs_down}
            </Typography>
          </IconButton>

          {comment.username === currentUser && (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                onClick={() => handleEdit(comment)}
                size="small"
                sx={{ color: "info.main" }}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => handleDeleteClick(comment)}
                size="small"
                sx={{ color: "error.main" }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </>
          )}

          <IconButton
            onClick={() => toggleExpand(comment.id)}
            size="small"
            sx={{ ml: "auto" }}
          >
            {expandedCommentIds[comment.id] ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse
          in={expandedCommentIds[comment.id]}
          timeout="auto"
          unmountOnExit
        >
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              bgcolor: "grey.50",
              borderRadius: 1,
              border: "1px dashed grey.300",
              fontSize: "0.75rem",
            }}
          >
            <pre
              style={{
                margin: 0,
                overflow: "auto",
                maxHeight: "100px",
              }}
            >
              {JSON.stringify(comment.row_data, null, 2)}
            </pre>
          </Box>
        </Collapse>
      </Paper>
    </Grid>
  );

  // Calculate pagination
  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, comments.length - page * rowsPerPage);
  const paginatedComments = comments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ my: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          px: 1,
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Comments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {comments.length}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {paginatedComments.map(renderComment)}
      </Grid>

      <TablePagination
        component="div"
        count={comments.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[6, 9, 12]} // Adjusted for grid layout
        sx={{
          mt: 2,
          ".MuiTablePagination-select": {
            minHeight: "unset",
          },
        }}
      />

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Edit fontSize="small" color="primary" />
          Edit Comment
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Rating
            </Typography>
            <Rating
              value={editCommentData?.rating || 0}
              onChange={(event, newValue) => {
                setEditCommentData((prev) => ({
                  ...prev,
                  rating: newValue,
                }));
              }}
              size="large"
              precision={0.2}
              sx={{ color: "primary.main" }}
            />
          </Box>

          <TextField
            label="Comment"
            fullWidth
            multiline
            rows={4}
            value={editCommentData?.feedback || ""}
            onChange={(e) =>
              setEditCommentData((prev) => ({
                ...prev,
                feedback: e.target.value,
              }))
            }
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            sx={{
              px: 3,
              borderRadius: 2,
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CommentSection;
