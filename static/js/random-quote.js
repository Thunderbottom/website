document.addEventListener('DOMContentLoaded', function() {
  const quotes = [
    "DevOps by day, <s>Batman</s> DevOps by night",
    "Orchestrating chaos, one deployment at a time",
    "Security engineer by day, terminal philosopher by night",
    "DevOps wizard with a side of existential curiosity",
    "Automating the complex, contemplating the absurd",
    "Code, coffee, and cosmic questions",
    "Building robust systems in an unpredictable universe",
    "Infrastructure as code, life as poetry",
  ];
  
  const quoteElement = document.getElementById('random-quote');
  if (quoteElement) {
    const maxQuoteLength = Math.max(...quotes.map(q => q.length));
    const estimatedHeight = Math.ceil(maxQuoteLength / 50) * 24;
    quoteElement.style.minHeight = `${estimatedHeight}px`;
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.innerHTML = "\"" + quotes[randomIndex] + "\"";
  }
});
