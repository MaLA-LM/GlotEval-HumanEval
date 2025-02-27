import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Rating from '@mui/material/Rating'; // Import the Rating component

// Modal style
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// Rating criteria
const ratingCriteria = {
   classification: [
    { key: "general", label: "General Rating" },
  ],
  summarization: [
    { key: "conciseness", label: "Conciseness and Coverage" },
    { key: "informativeness", label: "Informativeness and Neutrality" },
    { key: "fluency", label: "Fluency and Coherence" },
    { key: "accuracy", label: "Accuracy and Relevance" },
    { key: "readability", label: "Readability and Style" },
    { key: "culturalSensitivity", label: "Cultural Sensitivity and Politeness" },
  ],
  translation: [
    { key: "expressiveness", label: "Expressiveness" },
    { key: "elegance", label: "Elegance" },
    { key: "fluency", label: "Fluency and Coherence" },
    { key: "accuracy", label: "Accuracy and Relevance" },
    { key: "readability", label: "Readability and Style" },
    { key: "culturalSensitivity", label: "Cultural Sensitivity and Politeness" },
  ],
  generation: [
    { key: "engagement", label: "Engagement and Creativity" },
    { key: "empathy", label: "Empathy and Helpfulness" },
    { key: "fluency", label: "Fluency and Coherence" },
    { key: "accuracy", label: "Accuracy and Relevance" },
    { key: "readability", label: "Readability and Style" },
    { key: "culturalSensitivity", label: "Cultural Sensitivity and Politeness" },
  ],
};

export const FeedbackModal = ({ open, setOpen ,type, setAvg}) => {
  const [ratings, setRatings] = React.useState(ratingCriteria[type]?.map(v=>0)||[]); // State to store ratings

  const handleClose = () => setOpen(false);

  // Handle rating change
  const handleRatingChange = (index, newValue) => {
    console.log(index,newValue)
    setRatings((prev) => {
        prev[index]=newValue;
        return prev.map(v=>v);
    });
  };


  const onSubmit=()=>{
    console.log(ratings);
    let sum= ratings.reduce((prev,curr)=>{
        return prev+curr;
    }, 0)

    setAvg(Math.round((sum/ratings.length) * 100) / 100)
    setOpen(false);
    setRatings(ratingCriteria[type]?.map(v=>0)||[]);
  }
  return (
    <div>
    <Button onClick={()=>setOpen(true)}>Add</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Feedback Criteria
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Please rate the following criteria:
          </Typography>
          <div>
            {ratingCriteria[type]?.map((criteria,index) => (
              <div key={criteria.key}>
                <Typography>{criteria.label}</Typography>
                <Rating
                  value={ratings[index]}
                  onChange={(event, newValue) => handleRatingChange(index, newValue)}
                  size="large"
                  precision={0.2}
                  sx={{ color: "primary.main" }}
                />
              </div>
            ))}
          </div>
          <Button onClick={()=>onSubmit()}>Save</Button>

        </Box>
      </Modal>
    </div>
  );
};