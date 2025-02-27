export const getFilename = (dataset, metric) => {
    const sameName = [
      "SIB-200",
      "Taxi-1500",
      "arc_multilingual",
      "BELEBELE",
      "glot500",
      "pbc",
      "PolyWrite"
    ];
  
    if (sameName.includes(dataset)) return dataset;
    if (dataset === "Aya") return "Aya-BLEU";
    if (dataset === "Aya (Self BLEU)") return "Aya-Self-BLEU";
    if (dataset === "Flores200 Eng-X") {
      return metric === "BLEU" 
        ? "Flores-200-Eng-X-BLEU" 
        : "Flores-200-Eng-X-chrF";
    }
    if (dataset === "Flores200 X-Eng") {
      return metric === "BLEU" 
        ? "Flores-200-X-Eng-BLEU" 
        : "Flores-200-X-Eng-chrF";
    }
    if (dataset === "XLSum") {
      return metric === "BERTScore" 
        ? "XL-Sum-BERTScore" 
        : "XL-Sum-ROUGE";
    }
    return "";
  };