.. polyEval documentation master file, created by
   sphinx-quickstart on Tue Feb  4 21:53:45 2025.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

GlotEval documentation
======================
Introduction
----------------
Evaluating large language models, especially for low-resource languages, remains challenging due to fragmented benchmarks focused on high-resource languages. GlotEval addresses this by offering an Automatic Evaluation Toolkit, a suite of tools for standardized LLM performance assessment that supports custom evaluation pipelines across multiple tasks, benchmarks, and metrics.
The results, products of this toolkit, will be displayed through a user-friendly interface, allowing for horizontal comparisons in charts and providing human evaluations.

Supported tasks and benchmarks
-------------------------------
* Text Classification: SIB-200 and Taxi-1500.
* Machine Translation: Flores200.
* Summarization: XL-Sum
* Open-ended Generation: Aya, PolyWrite
* Machine Comprehension: BELEBELE, arc_multilingual
* Intrinsic Evaluation: glot500, pbc

🌟Key Features
-----------------
.. container:: admonition-container

   .. admonition:: Compare the results across benchmarks and languages

      .. image:: _static/data-visualization.png

   .. admonition:: Comparative Metrics

      .. image:: _static/Praneeth.png

.. container:: admonition-container

   .. admonition:: View the output results 

      .. image:: _static/datatable-translated.png

   .. admonition:: Give feedback on the output results

      .. image:: _static/Eval1by1.png

   

Frameworks
------------
We are using the following frameworks and libraries:

.. raw:: html

   <div style="display: flex;" >
     <div style="text-align: center; margin: 10px;">
       <img src="_static/react-icon.png" style="width:200px; margin-bottom: 5px;" alt="React">
       <p>React</p>
     </div>
     <div style="text-align: center; margin: 10px;">
       <img src="_static/ui-logo.svg" style="width:200px; margin-bottom: 5px;" alt="Material UI">
       <p>Material UI</p>
     </div>
     <div style="text-align: center; margin: 10px;">
       <img src="_static/Flask_logo.svg" style="width:200px; margin-bottom: 5px;" alt="Python Flask">
       <p>Python Flask</p>
     </div>
     <div style="text-align: center; margin: 10px;">
       <img src="_static/SQLite.png" style="width:200px; margin-bottom: 5px;" alt="Sqlite">
       <p>SQLite</p>
     </div>
   </div>


.. toctree::
   :maxdepth: 2
   :caption: User Guide

   src/installation
   src/trouble-shooting
   src/features
   

.. toctree::
   :maxdepth: 2
   :caption: System Designs

   src/architecture
   src/components
   src/api
   src/database
   
   src/whats-next