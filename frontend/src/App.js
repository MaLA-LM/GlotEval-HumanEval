import React, { useState, useEffect } from "react";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/OutputBoard";
import api from "./services/api";
import DataVisualisation from "./components/DataVisualisation/DataVisualisation";
import AnnotationGuidelines from "./components/AnnotationGuideline";
import Metrics from "./components/Metrics/Metrics";
import Analytics from "./components/DataVisualisation/Analytics";
import CustomEvaluator from "./components/DataVisualisation/CustomEvaluator";
import Home from "./components/Home";

// Protected Route component
const ProtectedRoute = ({ children, user }) => {
  const location = useLocation();

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for a logged-in user stored in localStorage
    const username = localStorage.getItem("username");
    if (username) {
      // Verify the session is still valid with the backend
      api
        .get("/api/verify-session")
        .then(() => {
          setUser(username);
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            // Session expired or invalid
            localStorage.removeItem("username");
            setUser(null);
          }
        });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
      localStorage.removeItem("username");
      setUser(null);
    } catch (err) {
      setError("Failed to logout. Please try again.");
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <Router>
      <CssBaseline />

      <AppBar position="static">
        <Toolbar sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h4"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              "&:hover": {
                cursor: "pointer",
              },
            }}
          >
            GlotEval-HumanEval
          </Typography>
          <NavigationButtons user={user} handleLogout={handleLogout} />
        </Toolbar>
      </AppBar>

      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={3000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      )}

      <Box>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/data-visualisation" element={<DataVisualisation />} />
          <Route
            path="/metrics"
            element={
              // <ProtectedRoute user={user}>
              // <Metrics user={user} />
              // </ProtectedRoute>
              <Metrics />
            }
          />
          <Route path="/guideline" element={<AnnotationGuidelines />} />
          <Route path="/human-feedback" element={<Dashboard user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          {/* <Route path="/analytics" element={<Analytics />} /> */}
          <Route path="/custom-evaluator" element={<CustomEvaluator />} />
        </Routes>
      </Box>
    </Router>
  );
}

function NavigationButtons({ user, handleLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLoginRedirect = () => {
    const searchParams = new URLSearchParams(location.search);
    navigate("/login", {
      state: {
        from: location.pathname,
        outputBoardParams: Object.fromEntries(searchParams),
      },
    });
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
        <Button
          color="inherit"
          onClick={handleMenuOpen}
          aria-controls="data-analytics-menu"
          aria-haspopup="true"
        >
          Data Visualisation
        </Button>
        <Menu
          id="data-analytics-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {/* <MenuItem component={Link} to="/analytics" onClick={handleMenuClose}>
            Graphs
          </MenuItem> */}
          <MenuItem
            component={Link}
            to="/data-visualisation"
            onClick={handleMenuClose}
          >
            Data Analytics
          </MenuItem>
          <MenuItem component={Link} to="/metrics" onClick={handleMenuClose}>
            Comparative Metrics View
          </MenuItem>
        </Menu>
        <Button color="inherit" component={Link} to="/human-feedback">
          Human Feedback
        </Button>
        <Button color="inherit" component={Link} to="/guideline">
          Guidelines
        </Button>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {user ? (
          <>
            <Typography variant="body1" sx={{ textAlign: "right" }}>
              Welcome, {user}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button color="inherit" onClick={handleLoginRedirect}>
            Login
          </Button>
        )}
      </Box>
    </>
  );
}

export default App;
