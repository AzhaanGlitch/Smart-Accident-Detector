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

  // Backend API URL
  const BACKEND_URL = 'https://azhaanglitch-smart-accident-detector-backend-v2.hf.space';

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
    if (window.innerWidth >= 768) {
      closeMobileMenu();
    }
  });

  // ================== THEME ==================
  const savedTheme = localStorage.getItem('skywatch-theme');
  body.setAttribute('data-theme', savedTheme || 'dark');
  setThemeIcon();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('skywatch-theme', newTheme);
      setThemeIcon();
    });
  }

  function setThemeIcon() {
    if (!themeToggleBtn) return;
    themeToggleBtn.textContent =
      body.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  }

  // ================== LOGIN BUTTONS ==================
  const googleBtn = document.querySelector('.google-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', function () {
      const codeClient = google.accounts.oauth2.initCodeClient({
        client_id: '860294680521-pbqoefl46mkc5i17l2potqjaccdveatr.apps.googleusercontent.com',
        scope: 'openid email profile',
        ux_mode: 'popup',
        redirect_uri: 'https://smart-accident-detector.vercel.app/index.html',
        callback: (response) => {
          console.log("Google login response:", response);
          if (response && response.code) {
            localStorage.setItem('googleName', 'Google User');
            googleBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Redirecting...`;
            googleBtn.disabled = true;
            setTimeout(() => {
              window.location.href = "base.html";
            }, 2000);
          } else {
            console.error("Google login failed: No code received");
          }
        }
      });
      codeClient.requestCode();
    });
  }

  const githubBtn = document.querySelector('.github-btn');
  if (githubBtn) {
    githubBtn.addEventListener('click', function () {
      githubBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Redirecting...`;
      githubBtn.disabled = true;
      window.location.href = '/api/github/login';
    });
  }

  // ================== FILE UPLOAD CONFIRMATION ==================
  if (fileUpload) {
    fileUpload.addEventListener('change', () => {
      const file = fileUpload.files[0];
      if (file && fileNameDisplay) {
        fileNameDisplay.textContent = `File selected: ${file.name}`;
      } else if (fileNameDisplay) {
        fileNameDisplay.textContent = '';
      }
    });
  }

  // ===== Auto-scroll helper =====
  function smoothScrollIntoView(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ================== RUN TEST (BACKEND INTEGRATION) ==================
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const file = fileUpload.files[0];
      if (!file) {
        alert('Please select an image or video first.');
        return;
      }

      // Show loading state
      uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing...';
      uploadBtn.disabled = true;

      // Show prediction box with loading
      predictionBox.style.display = 'block';
      resultImage.style.display = 'none';
      resultVideo.style.display = 'none';
      resultsGrid.innerHTML = '<div class="loading-text">Analyzing media... Please wait.</div>';

      // Display the uploaded media
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
      }

      try {
        // Create FormData to send file to backend
        const formData = new FormData();
        formData.append('file', file);

        // Make API call to backend
        const response = await fetch(`${BACKEND_URL}/predict`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Display results from backend
        resultsGrid.innerHTML = '';
        
        // Handle your backend's response format
        let outcomes = {};
        
        if (result.error) {
          // Show error from backend
          outcomes = {
            'Status': 'Error',
            'Message': result.error,
            'Details': result.message || 'Check backend logs'
          };
        } else {
          // Process successful prediction results
          const finalModel = result.final_model || {};
          const bestModel = result.best_model || {};
          
          outcomes = {
            'Accident Status': result.accident_detected ? 'Accident Detected' : 'No Accident',
            'Final Model': `${finalModel.prediction || 'N/A'} (${Math.round(finalModel.confidence || 0)}%)`,
            'Best Model': `${bestModel.prediction || 'N/A'} (${Math.round(bestModel.confidence || 0)}%)`,
          };
        }

        Object.entries(outcomes).forEach(([title, value]) => {
          const card = document.createElement('div');
          card.className = 'result-card';
          card.innerHTML = `
            <div class="result-title">${title}</div>
            <div class="result-value">${value}</div>
          `;
          resultsGrid.appendChild(card);
        });

      } catch (error) {
        console.error('Error calling backend API:', error);
        
        // Show error message
        resultsGrid.innerHTML = `
          <div class="result-card" style="border-color: #ef4444;">
            <div class="result-title">Error</div>
            <div class="result-value" style="color: #ef4444;">
              Failed to process media. Please try again.
            </div>
          </div>
        `;
        
        // Optionally show more detailed error for debugging
        if (error.message.includes('Failed to fetch')) {
          resultsGrid.innerHTML += `
            <div class="result-card" style="border-color: #f59e0b;">
              <div class="result-title">Connection Issue</div>
              <div class="result-value" style="color: #f59e0b; font-size: 14px;">
                Unable to connect to backend server. Please check your internet connection.
              </div>
            </div>
          `;
        }
      } finally {
        // Reset button state
        uploadBtn.innerHTML = 'Run Test';
        uploadBtn.disabled = false;
        
        // Scroll to results
        setTimeout(() => smoothScrollIntoView(predictionBox), 100);
      }
    });
  }

  // ================== GREETING (NAME INPUT) ==================
  const userGreeting = document.getElementById('userGreeting');
  const nameModalElement = document.getElementById('nameModal');
  let nameModal = null;
  if (nameModalElement) {
    nameModal = new bootstrap.Modal(nameModalElement);
  }
  const saveNameBtn = document.getElementById('saveNameBtn');
  const userNameInput = document.getElementById('userNameInput');

  const googleName = localStorage.getItem('googleName');

  function checkUserName() {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      userGreeting.textContent = `Hi ${savedName}`;
    } else if (nameModal) {
      if (googleName) {
        userNameInput.value = googleName;
      }
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