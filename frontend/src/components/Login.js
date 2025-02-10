import React, { useState } from "react";
import { TextField, Button, Box, Typography, Link as MuiLink } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await api.post("/api/login", { username, password });
      setUser(res.data.username);
      localStorage.setItem("username", res.data.username);
      navigate("/");
    } catch (err) {
      setError(err.response.data.error);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Login
      </Typography>
      <TextField
        label="Username"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }} fullWidth>
        Login
      </Button>
      <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
        No account?{" "}
        <MuiLink component={Link} to="/signup">
          Sign up
        </MuiLink>
      </Typography>
    </Box>
  );
}

export default Login;
