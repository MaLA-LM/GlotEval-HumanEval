const express = require('express');
const cors = require('cors');
const evaluatorRouter = require('./evaluator');

const app = express();
const port = process.env.PORT || 8000
;

app.use(cors({
    origin: '*', // Allow all origins (for testing purposes)
}));
app.use(express.json());
app.use('/api/evaluator', evaluatorRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
