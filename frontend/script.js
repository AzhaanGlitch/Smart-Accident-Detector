if (uploadBtn) {
  uploadBtn.addEventListener('click', async () => {
    const file = fileUpload.files[0];
    if (!file) {
      alert('Please select an image or video first.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Only images supported for now.');
      return;
    }

    predictionBox.style.display = 'block';
    resultImage.src = URL.createObjectURL(file);
    resultImage.style.display = 'block';
    resultImage.style.maxWidth = '400px';
    resultImage.style.maxHeight = '250px';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://smart-accident-detector-backend.onrender.com/predict', {  // Replace with your Render URL
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Prediction failed');

      const data = await response.json();

      const outcomes = {
        'Accident Status': data.accident_detected ? '🚨 Accident Detected' : '✅ No Accident',
        'Final Model': `${data.final_model.prediction} (${data.final_model.confidence.toFixed(2)}%)`,
        'Best Model': `${data.best_model.prediction} (${data.best_model.confidence.toFixed(2)}%)`,
        'Location': data.location || 'N/A'
      };

      resultsGrid.innerHTML = '';
      Object.entries(outcomes).forEach(([title, value]) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
          <div class="result-title">${title}</div>
          <div class="result-value">${value}</div>
        `;
        resultsGrid.appendChild(card);
      });

      smoothScrollIntoView(predictionBox);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get prediction: ' + error.message);
    }
  });
}