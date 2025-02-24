.. polyEval documentation master file, created by
   sphinx-quickstart on Tue Feb  4 21:53:45 2025.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

PolyEval documentation
======================
Introduction
----------------
Evaluating large language models, especially for low-resource languages, remains challenging due to fragmented benchmarks focused on high-resource languages. PolyEval addresses this by offering an Automatic Evaluation Toolkit, a suite of tools for standardized LLM performance assessment that supports custom evaluation pipelines across multiple tasks, benchmarks, and metrics.
The results, products of this toolkit, will be displayed through a user-friendly interface, allowing for horizontal comparisons in charts and providing human evaluations.

Supported tasks and benchmarks
----------------
* Text Classification: SIB-200 and Taxi-1500.
* Machine Translation: Flores200.
* Summarization: XL-Sum
* Open-ended Generation: Aya, PolyWrite
* Machine Comprehension: BELEBELE, arc_multilingual
* Intrinsic Evaluation: glot500, pbc

Key Features
-------

Data Visualization
~~~~~~~~~~~~~~~~~~
Error Analysis
~~~~~~~~~~~~~~~~~~
Human Evaluation
~~~~~~~~~~~~~~~~~~

Frameworks
-------

.. toctree::
   :maxdepth: 2
   :caption: Guidelines

   src/installation
   src/trouble-shooting
   

.. toctree::
   :maxdepth: 2
   :caption: System Designs

   src/architecture
   src/components
   src/api
   src/database
   
   src/whats-next