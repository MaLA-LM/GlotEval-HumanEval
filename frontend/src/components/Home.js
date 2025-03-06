import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  useTheme,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  BarChart as BarChartIcon,
  Analytics as AnalyticsIcon,
  Feedback as FeedbackIcon,
  Description as DescriptionIcon,
  Compare as CompareIcon,
  Code as CodeIcon,
} from "@mui/icons-material";

const features = [
  {
    title: "Data Analytics",
    description:
      "Analyze model performance across different languages and tasks with interactive visualizations.",
    icon: <AnalyticsIcon fontSize="large" />,
    link: "/data-visualisation",
  },
  {
    title: "Performance Graphs",
    description:
      "View detailed performance metrics and trends through intuitive graphical representations.",
    icon: <BarChartIcon fontSize="large" />,
    link: "/analytics",
  },
  {
    title: "Human Feedback",
    description:
      "Contribute human evaluations and feedback on model outputs across languages.",
    icon: <FeedbackIcon fontSize="large" />,
    link: "/human-feedback",
  },
  {
    title: "Annotation Guidelines",
    description:
      "Access comprehensive guidelines for consistent evaluation across different tasks.",
    icon: <DescriptionIcon fontSize="large" />,
    link: "/guideline",
  },
  {
    title: "Comparative Metrics",
    description:
      "Compare different models and their performance using standardized metrics.",
    icon: <CompareIcon fontSize="large" />,
    link: "/metrics",
  },
  {
    title: "Custom Evaluator",
    description:
      "Create and apply custom evaluation metrics for specialized use cases.",
    icon: <CodeIcon fontSize="large" />,
    link: "/custom-evaluator",
  },
];

const Home = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
        pt: 8,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ mb: 8, color: "white", textAlign: "center" }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{
              fontWeight: "bold",
              mb: 4,
            }}
          >
            Welcome to GlotEval-HumanEval
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            A Comprehensive Platform for Multilingual Model Evaluation
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, maxWidth: "800px", mx: "auto" }}
          >
            Evaluate language models across multiple tasks, languages, and
            metrics. From text classification to machine translation, GlotEval-HumanEval
            provides the tools you need for thorough model assessment.
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                  <Box sx={{ mb: 2, color: theme.palette.primary.main }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography>{feature.description}</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                  <Button
                    component={Link}
                    to={feature.link}
                    variant="contained"
                    color="primary"
                  >
                    Explore
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Statistics Section */}
        <Box sx={{ mt: 8, mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ color: "white", textAlign: "center", mb: 4 }}
          >
            Platform Statistics
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {[
              { label: "Supported Languages", value: "x+" },
              { label: "Evaluation Tasks", value: "y" },
              { label: "Evaluation Metrics", value: "z+" },
              { label: "Model Evaluations", value: "1M+" },
            ].map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  <Typography variant="h3" component="div" color="primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
