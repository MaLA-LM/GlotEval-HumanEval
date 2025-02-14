import React, { useState } from "react";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Tooltip, IconButton } from "@mui/material";
import { ExpandMore, Info } from "@mui/icons-material";
import { FaClipboardList } from "react-icons/fa";

// Data structure containing the guidelines for annotation
const guidelinesData = {
  "General Criteria": [
    {
      title: "Fluency and Coherence",
      description: "The output should be grammatically correct, natural, and easy to follow, with logical connections between ideas.",
      scale: [
        "5: Flawless, grammatically correct, and flows logically with no awkwardness.",
        "4: Minor phrasing or flow issues that slightly affect readability but remain natural.",
        "3: Noticeable grammar or coherence issues that mildly affect comprehension.",
        "2: Frequent grammar errors or awkward phrasing that disrupt the logical flow.",
        "1: Grammatically incorrect and incoherent; hard to understand.",
      ],
    },
    {
      title: "Accuracy and Relevance",
      description: "The content should accurately represent the input or task requirements and remain on-topic.",
      scale: [
        "5: Completely accurate and entirely on-topic with no errors or irrelevant information.",
        "4: Slight inaccuracies or minor deviations from the topic that don’t mislead.",
        "3: Noticeable inaccuracies or partially off-topic content.",
        "2: Significant inaccuracies or content mostly off-topic.",
        "1: Grossly inaccurate or irrelevant to the task requirements.",
      ],
    },
    {
      title: "Readability and Style",
      description: "The text should be easy to read and tailored to the audience, including proper tone, formality, and formatting.",
      scale: [
        "5: Fully readable, polished, and perfectly suited to the audience.",
        "4: Slight stylistic inconsistencies or minor formatting issues.",
        "3: Readable but with noticeable stylistic inconsistencies or awkward phrasing.",
        "2: Hard to read due to poor structure, style, or formatting.",
        "1: Difficult to read or entirely inappropriate for the audience."
        ]
    },
    {
      title: "Cultural Sensitivity and Politeness",
      description: "The output should respect cultural norms, avoid stereotypes, and maintain a respectful tone.",
      scale: [
        "5: Fully respectful and culturally appropriate with no offensive elements.",
        "4: Minor insensitivity or potential cultural misunderstandings.",
        "3: Noticeable but unintended cultural insensitivity or stereotype usage.",
        "2: Significant insensitivity or culturally inappropriate elements.",
        "1: Offensive, disrespectful, or harmful to cultural norms."
      ]
        
    }
     // Additional criteria go here
  ],
  "Task-Specific Criteria": [
    {
      title: "Summarization - Conciseness and Coverage",
      description: "The summary should capture the essence of the source text, including key points, without unnecessary details or omissions.",
      scale: [
        "5: Fully concise and comprehensive with all key points included.",
        "4: Mostly concise but includes minor unnecessary details or omits less critical points.",
        "3: Covers key points but with noticeable omissions or excessive detail.",
        "2: Fails to capture important points or includes excessive irrelevant details.",
        "1: Lacks conciseness and omits major parts of the source text.",
      ],
    },
    {
      title: "Summarization - Informativeness and Neutrality",
      description: "The summary should be factually accurate, unbiased, and informative, reflecting the original content faithfully.",
      scale: [
        "5: Fully informative and unbiased with complete factual accuracy.",
        "4: Slight bias or minor factual errors that don’t significantly affect informativeness.",
        "3: Noticeable factual inaccuracies or biased phrasing.",
        "2: Significant bias or frequent factual errors.",
        "1: Misleading, highly biased, or factually incorrect."
      ],

    },
    {
      title: "Translation - Expressiveness",
      description: "The phrasing and grammar should follow the norms of the target language. Avoid overly literal translations and adapt idioms/metaphors to fit the context.",
      scale: [
        "5: Natural and smooth, perfectly adapted to the target language.",
        "4: Slightly literal or awkward phrasing in rare instances.",
        "3: Noticeable literal translations or awkward phrasing.",
        "2: Frequent literal translations or unnatural phrasing that impede comprehension.",
        "1: Stilted or robotic translation that is hard to understand.",
      ],
    },
    {
      title: "Translation - Elegance",
      description: "The text should be aesthetically pleasing, avoiding clunky expressions, and match the tone and style of the original text.",
      scale: [
        "5: Highly polished and stylistically refined, matching the original’s tone.",
        "4: Minor stylistic issues or slightly clunky expressions.",
        "3: Noticeable awkwardness or inappropriate tone in some parts.",
        "2: Frequently awkward or mismatched tone.",
        "1: Awkward and poorly styled throughout."
      ],
    },
    {
      title: "Open-ended Generation - Engagement and Creativity",
      description: "Responses should be engaging, imaginative, and foster further interaction.",
      scale: [
        "5: Highly engaging, creative, and encourages interaction effectively.",
        "4: Mostly engaging but with minor lack of originality.",
        "3: Moderately engaging but lacks creativity or depth.",
        "2: Barely engaging or unoriginal.",
        "1: Dull and fails to foster interaction."
      ],
    },
    {
      title: "Open-ended Generation - Empathy and Helpfulness",
      description: "The output should address the user’s needs effectively, showing understanding and providing actionable guidance.",
      scale: [
        "5: Highly empathetic and helpful, fully addressing the user’s needs.",
        "4: Mostly empathetic with minor gaps in understanding or usefulness.",
        "3: Moderately helpful or partially misses the user’s needs.",
        "2: Barely helpful or shows limited empathy.",
        "1: Unhelpful and lacks understanding of the user’s needs."
      ],
    },
    // Additional task-specific criteria go here
   ],
  "Final Notes for Annotators": [
    {
      title: "Consistency",
      description: "Apply the scales uniformly across all tasks.",
      scale: []
    },
    {
      title: "Comments",
      description: "Provide brief justifications for any score of 3 or below, especially if the issue can inform improvements.",
      scale: []

    },
    {
      title: "Balance",
      description: "Aim for fair scoring that highlights both strengths and weaknesses.",
      scale: []
    }
  ]
};

// Main functional component for rendering annotation guidelines
const AnnotationGuidelines = () => {
  return (
    <Box sx={{ padding: 4, maxWidth: "800px", margin: "auto", textAlign:"left" }}>

      {/* Header section with title */}
      <Typography variant="h4" gutterBottom>
        <FaClipboardList style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Annotation Guidelines
      </Typography>

      {/* Rendering the guidelines accordion */}
      {Object.entries(guidelinesData).map(([section, criteria]) => (
        <Accordion key={section} sx={{ marginBottom: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">{section}</Typography>
          </AccordionSummary>
          <AccordionDetails>

            {/* Iterate over criteria to render each guideline item */}
            {criteria.map((item, index) => (
              <Box key={index} sx={{ marginBottom: 3 }}>

                {/* Title with a tooltip for the description */}
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {item.title}{" "}
                  <Tooltip title={item.description} arrow>
                    <IconButton size="small">
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>

                {/* List of scales for each criterion */}
                <ul style={{ marginLeft: "16px", textAlign: "left" }}>
                  {item.scale.map((point, i) => (
                    <li key={i} style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                      {point}
                    </li>
                  ))}
                </ul>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default AnnotationGuidelines;
