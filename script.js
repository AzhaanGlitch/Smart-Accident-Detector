document.addEventListener('DOMContentLoaded', () => {
  // ===== DOM Elements =====
  const loginPage = document.getElementById('loginPage');
  const dashboard = document.getElementById('dashboard');
  const themeToggleBtn = document.querySelector('.theme-toggle');
  const body = document.body;
  const logoutBtn = document.getElementById('logoutBtn');
  const userNameSpan = document.getElementById('userName');

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

  themeToggleBtn?.addEventListener('click', () => {
    const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('skywatch-theme', newTheme);
    setThemeIcon();
  });

  function setThemeIcon() {
    if (!themeToggleBtn) return;
    themeToggleBtn.textContent = body.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  }

  // ================== GOOGLE LOGIN ==================
  const googleBtn = document.querySelector('.google-btn');
  googleBtn?.addEventListener('click', () => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: '860294680521-pbqoefl46mkc5i17l2potqjaccdveatr.apps.googleusercontent.com',
      scope: 'openid email profile',
      callback: (tokenResponse) => {
        if (!tokenResponse || !tokenResponse.id_token) return;
        const base64Url = tokenResponse.id_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const user = JSON.parse(window.atob(base64));

        const name = user.name || 'User';
        localStorage.setItem('userName', name);

        // Show dashboard and name
        if (userNameSpan) userNameSpan.textContent = name;
        if (loginPage) loginPage.style.display = 'none';
        if (dashboard) dashboard.style.display = 'flex';

        // Initialize dashboard after login
        initializeDashboard();
      }
    });
    client.requestAccessToken();
  });

  // ================== SHOW STORED NAME ==================
  const storedName = localStorage.getItem('userName');
  if (storedName) {
    if (userNameSpan) userNameSpan.textContent = storedName;
    if (loginPage) loginPage.style.display = 'none';
    if (dashboard) dashboard.style.display = 'flex';
    initializeDashboard();
  }

  // ================== LOGOUT ==================
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('userName');
    if (loginPage) loginPage.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
  });

  // ================== FILE UPLOAD ==================
  fileUpload?.addEventListener('change', () => {
    const file = fileUpload.files[0];
    if (fileNameDisplay) fileNameDisplay.textContent = file ? `✅ File selected: ${file.name}` : '';
  });

  uploadBtn?.addEventListener('click', () => {
    const file = fileUpload.files[0];
    if (!file) return alert('Please select an image or video first.');

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
      card.innerHTML = `<div class="result-title">${title}</div><div class="result-value">${value}</div>`;
      resultsGrid.appendChild(card);
    });

    setTimeout(() => fileUpload.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  });

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
    const feedContent = document.querySelector('.live-feed .card-content .live-feed-box');
    if (!feedContent) return;
    const isConnected = Math.random() > 0.3;
    feedContent.innerHTML = isConnected
      ? `<div class="detected-object-box"><p>Object Detected</p><small>Confidence: ${Math.floor(Math.random()*20)+80}%</small></div>`
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

    const randomAlerts = alerts.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
    alertsSection.innerHTML = randomAlerts.map(alert => `
      <div class="alert-row">
        <span class="alert-icon">⚠️</span>
        <span class="alert-text">${alert.text}</span>
        <span class="alert-badge ${alert.status}">${alert.status.toUpperCase()}</span>
        <span class="alert-time">${alert.time}</span>
      </div>
    `).join('') || '<p>No recent alerts.</p>';
  }

  // ================== DRONE FLEET ==================
  function updateDroneFleet() {
    const fleetSection = document.getElementById('droneFleet');
    if (!fleetSection) return;

    const statuses = ['online', 'offline', 'warning'];
    const statusLabels = { online:'ONLINE', offline:'OFFLINE', warning:'WARNING' };
    const droneCount = Math.floor(Math.random() * 5) + 1;

    fleetSection.innerHTML = Array.from({length: droneCount}, (_, i) => {
      const status = statuses[Math.floor(Math.random()*statuses.length)];
      return `
        <div class="drone-card">
          <div class="drone-info">
            <span class="drone-name">Drone ${i+1}</span>
            <span class="drone-status ${status}">${statusLabels[status]}</span>
          </div>
          <div class="drone-actions"><button>Details</button></div>
        </div>`;
    }).join('') || '<p>No drones available.</p>';
  }

  // ================== INIT DASHBOARD ==================
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

  // Automatically initialize if dashboard is visible
  if (dashboard && dashboard.style.display !== 'none') initializeDashboard();
});
