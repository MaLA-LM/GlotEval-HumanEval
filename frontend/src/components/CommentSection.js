// src/components/CommentSection.js
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
} from "@mui/material";
import { ThumbUp, ThumbDown, Edit, Delete, ExpandMore, ExpandLess } from "@mui/icons-material";
import api from "../services/api";

function CommentSection({ refreshFlag }) {
  const [comments, setComments] = useState([]);
  const [votedComments, setVotedComments] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCommentData, setEditCommentData] = useState(null);
  const [expandedCommentIds, setExpandedCommentIds] = useState({});
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
      await api.post("/api/comments/thumbs", { comment_id: id, vote_type: voteType });
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
    setEditCommentData(comment);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await api.put(`/api/comments/${editCommentData.id}`, editCommentData);
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

  const renderComment = (comment) => (
    <Paper key={comment.id} sx={{ p: 2, my: 1 }}>
      <Grid container alignItems="center" spacing={1}>
        <Grid item>
          <Avatar>{comment.username.charAt(0).toUpperCase()}</Avatar>
        </Grid>
        <Grid item xs>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {comment.username}
          </Typography>
        </Grid>
        <Grid item>
          <Rating value={comment.rating} readOnly size="small" />
        </Grid>
        <Grid item>
          <Typography variant="caption">
            {new Date(comment.timestamp).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2">
          <strong>Entry ID:</strong> {comment.entry_id}
        </Typography>
        <Typography variant="body2">
          <strong>Question:</strong> {comment.question}
        </Typography>
        <Typography variant="body1">
          <strong>Feedback:</strong> {comment.feedback}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
        <IconButton
          onClick={() => handleVote(comment.id, "up")}
          disabled={votedComments[comment.id] !== undefined}
          color={votedComments[comment.id] === "up" ? "primary" : "default"}
        >
          <ThumbUp fontSize="small" />
        </IconButton>
        <Typography variant="caption">{comment.thumbs_up}</Typography>
        <IconButton
          onClick={() => handleVote(comment.id, "down")}
          disabled={votedComments[comment.id] !== undefined}
          color={votedComments[comment.id] === "down" ? "primary" : "default"}
        >
          <ThumbDown fontSize="small" />
        </IconButton>
        <Typography variant="caption">{comment.thumbs_down}</Typography>
        {comment.username === currentUser && (
          <>
            <IconButton onClick={() => handleEdit(comment)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton onClick={() => handleDelete(comment.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </>
        )}
        <IconButton onClick={() => toggleExpand(comment.id)}>
          {expandedCommentIds[comment.id] ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      <Collapse in={expandedCommentIds[comment.id]} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1, p: 1, border: "1px solid #ccc" }}>
          <Typography variant="caption">
            <strong>Row Data:</strong> {JSON.stringify(comment.row_data)}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6">Comments</Typography>
      {comments.map(renderComment)}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            label="Edit Comment"
            fullWidth
            multiline
            rows={3}
            value={editCommentData?.feedback || ""}
            onChange={(e) =>
              setEditCommentData({ ...editCommentData, feedback: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CommentSection;
