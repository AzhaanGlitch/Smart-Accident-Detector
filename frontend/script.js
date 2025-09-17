document.addEventListener('DOMContentLoaded', () => {
  // ===== DOM Elements =====
  const loginPage = document.getElementById('loginPage');
  const dashboard = document.getElementById('dashboard');
  const themeToggleBtn = document.querySelector('.theme-toggle');
  const body = document.body;
  const logoutBtn = document.getElementById('logoutBtn');

  // Mobile menu elements
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const sidebar = document.getElementById('sidebar');

  // Upload elements
  const fileUpload = document.getElementById('fileUpload');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const uploadBtn = document.getElementById('uploadBtn');
  const predictionBox = document.getElementById('predictionBox');
  const resultImage = document.getElementById('resultImage');
  const resultVideo = document.getElementById('resultVideo');
  const resultsGrid = document.getElementById('resultsGrid');

  // ================== MOBILE MENU ==================
  function toggleMobileMenu() {
    if (mobileMenuToggle && sidebar && mobileOverlay) {
      const isActive = sidebar.classList.contains('active');
      
      if (isActive) {
        // Close menu
        sidebar.classList.remove('active');
        mobileOverlay.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        // Open menu
        sidebar.classList.add('active');
        mobileOverlay.classList.add('active');
        mobileMenuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
  }

  function closeMobileMenu() {
    if (sidebar && mobileOverlay && mobileMenuToggle) {
      sidebar.classList.remove('active');
      mobileOverlay.classList.remove('active');
      mobileMenuToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Mobile menu event listeners
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close mobile menu when clicking on sidebar links
  if (sidebar) {
    const sidebarLinks = sidebar.querySelectorAll('.sidebar-nav a');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Close mobile menu on window resize if screen becomes large
  window.addEventListener('resize', () => {
    if (window.innerWidth > 991) {
      closeMobileMenu();
    }
  });

  // Theme toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    });
  }

  // File upload change
  if (fileUpload) {
    fileUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        fileNameDisplay.textContent = file.name;
      }
    });
  }

  // Upload button click (modified with backend integration)
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
      resultImage.style.display = 'none';
      resultVideo.style.display = 'none';

      if (file.type.startsWith('image')) {
        resultImage.src = URL.createObjectURL(file);
        resultImage.style.display = 'block';
        resultImage.style.maxWidth = '400px';
        resultImage.style.maxHeight = '250px';
      } else if (file.type.startsWith('video')) {
        resultVideo.src = URL.createObjectURL(file);
        resultVideo.style.display = 'block';
        resultVideo.style.maxWidth = '400px';
        resultVideo.style.maxHeight = '250px';
        // Note: Backend video support can be added later
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('https://smart-accident-detector-backend.onrender.com/predict', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Prediction failed');

        const data = await response.json();

        const outcomes = {
          'Accident Status': data.accident_detected ? 'Accident Detected' : 'No Accident',
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

        setTimeout(() => smoothScrollIntoView(predictionBox), 80);
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to get prediction: ' + error.message);
      }
    });
  }

  // ================== NAME MODAL ==================
  const nameModal = new bootstrap.Modal(document.getElementById('nameModal'));
  const userGreeting = document.getElementById('userGreeting');
  const userNameInput = document.getElementById('userNameInput');
  const saveNameBtn = document.getElementById('saveNameBtn');

  function checkUserName() {
    const storedName = localStorage.getItem('userName') || localStorage.getItem('googleName');
    if (storedName) {
      userGreeting.textContent = `Hi ${storedName}`;
    } else {
      nameModal.show();
    }
  }

  if (saveNameBtn) {
    saveNameBtn.addEventListener('click', () => {
      const enteredName = userNameInput.value.trim();
      if (enteredName) {
        localStorage.setItem('userName', enteredName);
        userGreeting.textContent = `Hi ${enteredName}`;
        if (nameModal) nameModal.hide();
      }
    });
  }

  // ================== SYSTEM STATS ==================
  function updateSystemStats() {
    const activeDrones = Math.floor(Math.random() * 5) + 1;
    const alertsToday = Math.floor(Math.random() * 10);
    const detectionRate = Math.floor(Math.random() * 30) + 70;

    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 4) {
      statValues[0].textContent = activeDrones;
      statValues[1].textContent = alertsToday;
      statValues[2].textContent = detectionRate + '%';
      statValues[3].textContent = 'ONLINE';
    }
  }

  function updateLiveFeed() { 
    // Placeholder for live feed updates
  }
  
  function updateAlerts() { 
    // Placeholder for alerts updates
  }
  
  function updateDroneFleet() { 
    // Placeholder for drone fleet updates
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('userName');
      localStorage.removeItem('googleName');
      window.location.href = "/index.html";
    });
  }

  // ================== INIT ==================
  function initializeDashboard() {
    updateSystemStats();
    updateLiveFeed();
    updateAlerts();
    updateDroneFleet();
    checkUserName();

    setInterval(updateSystemStats, 5000);
    setInterval(updateLiveFeed, 3000);
    setInterval(updateAlerts, 10000);
    setInterval(updateDroneFleet, 7000);
  }

  if (dashboard) {
    initializeDashboard();
  }

  // ================== RESPONSIVE IMAGE/VIDEO HANDLING ==================
  function handleResponsiveMedia() {
    const mediaElements = document.querySelectorAll('.preview-img, .preview-video, .result-media');
    
    mediaElements.forEach(element => {
      if (window.innerWidth <= 480) {
        element.style.maxWidth = '100%';
        element.style.maxHeight = '200px';
      } else if (window.innerWidth <= 767) {
        element.style.maxWidth = '100%';
        element.style.maxHeight = '220px';
      } else {
        element.style.maxWidth = '400px';
        element.style.maxHeight = '250px';
      }
    });
  }

  // Handle responsive media on window resize
  window.addEventListener('resize', handleResponsiveMedia);
  
  // Initial call
  handleResponsiveMedia();
});