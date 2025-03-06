import React, { useState } from "react";
import { TextField, Button, Box, Typography, Link as MuiLink } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await api.post("/api/signup", { username, password });
      setUser(res.data.username);
      localStorage.setItem("username", res.data.username);
      navigate("/");
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message === "Network Error") {
        setError("Unable to connect to server. Please check your internet connection.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
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
          Create Account
        </Typography>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          onChange={(e) => setPassword(e.target.value)}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        {error && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleSubmit}
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
          Sign Up
        </Button>
        <Typography variant="body1" sx={{ mt: 3, textAlign: "center" }}>
          Already have an account?{" "}
          <MuiLink 
            component={Link} 
            to="/login"
            sx={{
              textDecoration: 'none',
              fontWeight: 'bold',
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            Login
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}

export default Signup;
