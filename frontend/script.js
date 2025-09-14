document.addEventListener('DOMContentLoaded', () => {
  // ===== DOM Elements =====
  const loginPage = document.getElementById('loginPage');
  const dashboard = document.getElementById('dashboard');
  const themeToggleBtn = document.querySelector('.theme-toggle');
  const body = document.body;
  const logoutBtn = document.getElementById('logoutBtn');

  // Upload elements
  const fileUpload = document.getElementById('fileUpload');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const uploadBtn = document.getElementById('uploadBtn');
  const predictionBox = document.getElementById('predictionBox');
  const resultImage = document.getElementById('resultImage');
  const resultVideo = document.getElementById('resultVideo');
  const resultsGrid = document.getElementById('resultsGrid');

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
            // Store a placeholder Google name (replace later with real fetch)
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
        fileNameDisplay.textContent = `✅ File selected: ${file.name}`;
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

  // ================== RUN TEST ==================
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      const file = fileUpload.files[0];
      if (!file) {
        alert('Please select an image or video first.');
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
      }

      const outcomes = {
        'Accident Status': Math.random() > 0.5 ? '🚨 Accident Detected' : '✅ No Accident',
        'Severity Level': ['Minor', 'Moderate', 'Severe'][Math.floor(Math.random() * 3)],
        'Number of Vehicles': Math.floor(Math.random() * 4) + 1,
        'Confidence Score': `${Math.floor(Math.random() * 21) + 80}%`
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

  // Try to get Google name if available
  const googleName = localStorage.getItem('googleName');

  function checkUserName() {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      userGreeting.textContent = `Hi ${savedName}`;
    } else if (nameModal) {
      if (googleName) {
        userNameInput.value = googleName; // Pre-fill with Google name
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

  function updateLiveFeed() { /* keep as before */ }
  function updateAlerts() { /* keep as before */ }
  function updateDroneFleet() { /* keep as before */ }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dashboard.classList.add('d-none');
      loginPage.classList.remove('d-none');
      setTimeout(() => {
        window.location.href = url("/index.html");
      }, 100);
    });
  }

  // ================== INIT ==================
  function initializeDashboard() {
    updateSystemStats();
    updateLiveFeed();
    updateAlerts();
    updateDroneFleet();
    checkUserName(); // 🔹 ask/show name here

    setInterval(updateSystemStats, 5000);
    setInterval(updateLiveFeed, 3000);
    setInterval(updateAlerts, 10000);
    setInterval(updateDroneFleet, 7000);
  }

  if (dashboard) {
    initializeDashboard();
  }
});
