import React, { useState, useEffect } from "react";
import { CssBaseline, AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import api from "./services/api";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for a logged-in user stored in localStorage.
    const username = localStorage.getItem("username");
    if (username) setUser(username);
  }, []);

  const handleLogout = async () => {
    await api.post("/api/logout");
    localStorage.removeItem("username");
    setUser(null);
  };

  return (
    <Router>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">
            Annotation Feedback System
          </Typography>
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body1" sx={{ textAlign: "right" }}>
                Welcome, {user}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
