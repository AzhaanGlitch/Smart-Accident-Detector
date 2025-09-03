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
        client_id: '860294680521-pbqoefl46mkc5i17l2potqjaccdveatr.apps.googleusercontent.com', // ✅ your new Client ID
        scope: 'openid email profile',
        ux_mode: 'popup',
        redirect_uri: 'https://smart-accident-detector.vercel.app/index.html', // ✅ must match in Google Cloud Console
        callback: (response) => {
          console.log("Google login response:", response);

          if (response && response.code) {
            // ✅ Show loader before redirect
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
      showLoading(githubBtn, "Signing in with GitHub...");
    });
  }

  function showLoading(button, message) {
    const originalText = button.innerHTML;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${message}`;
    button.disabled = true;
    setTimeout(() => {
      loginPage.classList.add('d-none');
      dashboard.classList.remove('d-none');
      initializeDashboard();
      button.innerHTML = originalText;
      button.disabled = false;
    }, 1500);
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

      // Reset media
      resultImage.style.display = 'none';
      resultVideo.style.display = 'none';

      // Show uploaded file inside results
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

      // Example realistic outcomes
      const outcomes = {
        'Accident Status':
          Math.random() > 0.5 ? '🚨 Accident Detected' : '✅ No Accident',
        'Severity Level': ['Minor', 'Moderate', 'Severe'][Math.floor(Math.random() * 3)],
        'Number of Vehicles': Math.floor(Math.random() * 4) + 1,
        'Confidence Score': `${Math.floor(Math.random() * 21) + 80}%`
      };

      // Inject outcome cards
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

      // Smooth auto-scroll to the prediction results
      setTimeout(() => smoothScrollIntoView(predictionBox), 80);
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

  // ================== LIVE FEED ==================
  function updateLiveFeed() {
    const feedContent = document.querySelector(
      '.live-feed .card-content .live-feed-box'
    );
    if (!feedContent) return;
    const isConnected = Math.random() > 0.3;
    feedContent.innerHTML = isConnected
      ? `<div class="detected-object-box"><p>Object Detected</p><small>Confidence: ${Math.floor(
          Math.random() * 20
        ) + 80}%</small></div>`
      : `<p>Live feed is currently disconnected.</p>`;
  }

  // ================== ALERTS ==================
  function updateAlerts() {
    const alertsSection = document.getElementById('recentAlerts');
    if (!alertsSection) return;

    const alerts = [
      { text: 'System Update Available', status: 'resolved', time: '10:43:39 PM' },
      { text: 'Connection Lost', status: 'resolved', time: '10:03:47 PM' },
      { text: 'Critical Anomaly Detected', status: 'critical', time: '10:10:58 PM' },
      { text: 'Drone Battery Low (Drone 1)', status: 'warning', time: '9:55:01 PM' },
      { text: 'Unauthorized Access Attempt', status: 'critical', time: '9:30:15 PM' }
    ];

    const randomAlerts = alerts
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);

    let alertsHtml = '';
    randomAlerts.forEach((alert) => {
      alertsHtml += `
        <div class="alert-row">
          <span class="alert-icon">⚠️</span>
          <span class="alert-text">${alert.text}</span>
          <span class="alert-badge ${alert.status}">${alert.status.toUpperCase()}</span>
          <span class="alert-time">${alert.time}</span>
        </div>
      `;
    });
    alertsSection.innerHTML = alertsHtml || '<p>No recent alerts.</p>';
  }

  // ================== DRONE FLEET ==================
  function updateDroneFleet() {
    const fleetSection = document.getElementById('droneFleet');
    if (!fleetSection) return;

    const statuses = ['online', 'offline', 'warning'];
    const statusLabels = {
      online: 'ONLINE',
      offline: 'OFFLINE',
      warning: 'WARNING'
    };

    const droneCount = Math.floor(Math.random() * 5) + 1;
    let fleetHtml = '';
    for (let i = 1; i <= droneCount; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      fleetHtml += `
        <div class="drone-card">
          <div class="drone-info">
            <span class="drone-name">Drone ${i}</span>
            <span class="drone-status ${status}">${statusLabels[status]}</span>
          </div>
          <div class="drone-actions">
            <button>Details</button>
          </div>
        </div>
      `;
    }
    fleetSection.innerHTML = fleetHtml || '<p>No drones available.</p>';
  }

  // ================== LOGOUT ==================
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dashboard.classList.add('d-none');
      loginPage.classList.remove('d-none');
    });
  }

  // ================== INIT ==================
  function initializeDashboard() {
    updateSystemStats();
    updateLiveFeed();
    updateAlerts();
    updateDroneFleet();

    setInterval(updateSystemStats, 5000);
    setInterval(updateLiveFeed, 3000);
    setInterval(updateAlerts, 10000);
    setInterval(updateDroneFleet, 7000);
  }
});
