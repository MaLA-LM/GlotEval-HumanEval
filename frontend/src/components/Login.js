import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useLocation } from "react-router-dom";
function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/"; // pass the previous location to redirect to after login
  const outputBoardParams = location.state?.outputBoardParams || {}; //store the Params from outputBoard

  console.log("Received outputBoardParams:", outputBoardParams);
  const handleSubmit = async () => {
    try {
      const res = await api.post("/api/login", { username, password });
      setUser(res.data.username);
      localStorage.setItem("username", res.data.username);

      const searchParams = new URLSearchParams(outputBoardParams).toString();
      navigate(from + (searchParams ? `?${searchParams}` : ""));
    } catch (err) {
      setError(err.response.data.error);
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
          Welcome Back
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
          Login
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
    </Box>
  );
}

export default Login;
