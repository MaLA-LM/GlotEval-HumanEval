import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Link as MuiLink,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const outputBoardParams = location.state?.outputBoardParams || {};

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Correctly prevent default submission
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/api/login", { username, password });
      setUser(res.data.username);
      localStorage.setItem("username", res.data.username);

      const searchParams = new URLSearchParams(outputBoardParams).toString();
      navigate(from + (searchParams ? `?${searchParams}` : ""));
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid username or password");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message === "Network Error") {
        setError("Unable to connect to server. Please check your internet connection.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      {/* Wrap everything inside the <form> element */}
      <form onSubmit={handleSubmit} style={{width:'100%'}}> 
        <Box
          sx={{
            maxWidth: 400,
            width: '100%',
            mx: "auto",
            p: 4,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#667eea',
            }}
          >
            Welcome Back
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            disabled={isLoading}
            error={error === "Username is required"}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            disabled={isLoading}
            error={error === "Password is required"}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />

          <Button
            type="submit" // Important: Button now knows it's submitting a form
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1.1rem',
              textTransform: 'none',
              bgcolor: '#667eea',
              '&:hover': {
                bgcolor: '#5a6fd6',
              },
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
              }
            }}
            fullWidth
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>

          <Typography variant="body1" sx={{ mt: 3, textAlign: "center" }}>
            No account?{" "}
            <MuiLink
              component={Link}
              to="/signup"
              sx={{
                textDecoration: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Sign up
            </MuiLink>
          </Typography>
        </Box>
      </form>
    </Box>
  );
}

export default Login;
