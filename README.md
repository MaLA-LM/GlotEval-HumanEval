# GlotEval-HumanEval

Large Language Models (LLMs) are widely used, but can generate misleading outputs, posing potential risks. Evaluating LLMs, especially in low-resource languages, remains challenging due to limited benchmarks. GlotEval
addresses this gap by providing an automatic evaluation toolkit that supports diverse tasks, benchmarks, and metrics. It also integrates human feedback mechanisms, enabling qualitative assessments alongside automated evaluation. By combining both approaches, GlotEval ensures a more comprehensive and reliable assessment of LLM performance across diverse linguistic settings.

GlotEval-HumanEval is a part of the GlotEval. In this part, the results, products of this toolkit, will be displayed through a user-friendly interface, allowing for horizontal comparisons in charts and providing human evaluations.

## 🌟 Key Features

- **Multi-Task Support**: Evaluate models across text classification, machine translation, summarization, open-ended generation, and machine comprehension
- **Interactive Visualization**: Compare results across benchmarks and languages with dynamic charts
- **Human Feedback Collection**: Gather and manage human evaluations with an intuitive interface
- **Translation Tools**: Built-in translation support for result analysis
- **Customizable Metrics**: Support for various evaluation metrics and custom evaluation pipelines

## Getting Started

### Prerequisites

- Python 3.08 or higher
- Flask
- Node.js and npm
- Git

### Installation

1. Clone the repository:

Open your terminal and then type:\
`git clone https://github.com/MaLA-LM/GlotEval-HumanEval.git` \
That clones the repo.

Then, cd into the new folder by typing:\
$`CD GlotEval-HumanEval`

Then, cd into the backend folder by typing:\
$`CD backend`

Then, install all the required dependencies by typing:\
$`pip install -r requirements.txt`

Then, type:\
$ `python app.py`
This starts the backend\

Then, in another terminal, cd into the frontend folder by typing:\
$`CD GlotEval-HumanEval/frontend`

Then, type:\
$ `npm install`
This installs the required dependencies.\

To run the React project:\
$ `npm start`

# 📖Documentation

You can view the full documentation here:  
👉 [Read the Docs](https://gloteval-humaneval.readthedocs.io/en/latest/)
