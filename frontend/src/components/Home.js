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

const WavePattern = () => (
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "100%",
      opacity: 0.1,
      zIndex: 0,
      background: `
        radial-gradient(circle at 100% 50%, transparent 20%, rgba(255,255,255,0.3) 21%, rgba(255,255,255,0.3) 34%, transparent 35%, transparent),
        radial-gradient(circle at 0% 50%, transparent 20%, rgba(255,255,255,0.3) 21%, rgba(255,255,255,0.3) 34%, transparent 35%, transparent) 0 -50px`,
      backgroundSize: "75px 100px",
    }}
  />
);

const DiagonalPattern = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "100%",
        opacity: 0.05,
        zIndex: 0,
        background: `
          linear-gradient(135deg, ${theme.palette.primary.main}33 25%, transparent 25%) -10px 0,
          linear-gradient(225deg, ${theme.palette.primary.main}33 25%, transparent 25%) -10px 0,
          linear-gradient(315deg, ${theme.palette.primary.main}33 25%, transparent 25%),
          linear-gradient(45deg, ${theme.palette.primary.main}33 25%, transparent 25%)`,
        backgroundSize: "30px 30px",
        backgroundRepeat: "repeat",
      }}
    />
  );
};

const Home = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      minHeight: "100vh",
      background: theme.palette.background.default,
      position: "relative",
      "&::before": {
        content: '""',
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 30%, ${theme.palette.primary.main}15 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, ${theme.palette.secondary.main}15 0%, transparent 50%)
        `,
        opacity: 0.8,
        zIndex: 0,
      }
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          background: `linear-gradient(135deg, 
            ${theme.palette.primary.main}CC 0%,
            ${theme.palette.primary.dark}CC 50%,
            ${theme.palette.secondary.main}CC 100%)`,
          pt: 12,
          pb: 20,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 95%)",
        }}
      >
        <WavePattern />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ mb: 8, color: "white", textAlign: "center" }}>
            <Typography
              component="h1"
              variant="h1"
              sx={{
                fontWeight: 900,
                mb: 4,
                fontSize: { xs: "2.5rem", md: "4rem" },
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                background: "linear-gradient(45deg, #fff, #f0f0f0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              GlotEval-HumanEval
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              A Comprehensive Platform for Multilingual Model Evaluation
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                maxWidth: "800px",
                mx: "auto",
                fontSize: "1.1rem",
                lineHeight: 1.8,
                opacity: 0.9,
              }}
            >
              Evaluate language models across multiple tasks, languages, and
              metrics. From text classification to machine translation, GlotEval-HumanEval
              provides the tools you need for thorough model assessment.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        position: "relative",
        mt: -24,
        pb: 24,
        pt: 8,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(180deg, 
            rgba(255,255,255,0.5) 0%,
            rgba(255,255,255,0.6) 30%,
            rgba(255,255,255,0.6) 70%,
            ${theme.palette.secondary.light}40 100%
          )`,
          backdropFilter: "blur(20px)",
        },
        clipPath: "polygon(0 5%, 100% 0, 100% 100%, 0 100%)",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60%",
          background: `linear-gradient(to bottom,
            transparent,
            ${theme.palette.secondary.light}40
          )`,
          opacity: 0.8,
        }
      }}>
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 8,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-16px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "80px",
                height: "4px",
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: "2px",
              },
            }}
          >
            Powerful Features
          </Typography>

          <Grid 
            container 
            spacing={4} 
            justifyContent="center"
            sx={{ maxWidth: "1200px", margin: "0 auto" }}
          >
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <Card
                  sx={{
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 4,
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      background: "rgba(255, 255, 255, 0.95)",
                      "& .feature-icon": {
                        transform: "scale(1.1) rotate(5deg)",
                      },
                    },
                    animation: `fadeIn 0.6s ease-out ${index * 0.2}s both`,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 4 }}>
                    <Box
                      className="feature-icon"
                      sx={{
                        mb: 3,
                        color: theme.palette.primary.main,
                        transform: "scale(1.2)",
                        transition: "transform 0.3s ease-in-out",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "0 auto",
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        backgroundColor: `${theme.palette.primary.main}15`,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h2"
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.primary.dark,
                        mb: 2,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        mt: 2,
                        lineHeight: 1.7,
                        fontSize: "1rem",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "center", pb: 4 }}>
                    <Button
                      component={Link}
                      to={feature.link}
                      variant="contained"
                      color="primary"
                      sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: 3,
                        textTransform: "none",
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        "&:hover": {
                          boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                        },
                      }}
                    >
                      Explore
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Box
        sx={{
          position: "relative",
          mt: -16,
          pt: 12,
          pb: 12,
          background: `linear-gradient(135deg, 
            ${theme.palette.secondary.main}95 0%,
            ${theme.palette.secondary.dark}95 100%)`,
          clipPath: "polygon(0 8%, 100% 0, 100% 100%, 0 100%)",
          backdropFilter: "blur(10px)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              repeating-linear-gradient(45deg,
                rgba(255,255,255,0.05) 0px,
                rgba(255,255,255,0.05) 1px,
                transparent 1px,
                transparent 10px
              )
            `,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Typography
            variant="h3"
            sx={{
              color: "white",
              textAlign: "center",
              mb: 8,
              fontWeight: 700,
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-16px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "80px",
                height: "4px",
                background: "linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,255,255,0.4))",
                borderRadius: "2px",
              },
            }}
          >
            Platform Statistics
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              { label: "Supported Languages", value: "x+" },
              { label: "Evaluation Tasks", value: "y" },
              { label: "Evaluation Metrics", value: "z+" },
              { label: "Model Evaluations", value: "1M+" },
            ].map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Paper
                  sx={{
                    p: 4,
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.95)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                    border: "1px solid rgba(255,255,255,0.2)",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                      background: "rgba(255, 255, 255, 0.98)",
                    },
                  }}
                >
                  <Typography
                    variant="h2"
                    component="div"
                    sx={{ 
                      fontWeight: 700, 
                      mb: 1,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.1))",
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ 
                      fontWeight: 500,
                      color: theme.palette.secondary.dark,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
