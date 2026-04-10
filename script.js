// User data structure
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let userTrainings = JSON.parse(localStorage.getItem('userTrainings')) || {};

// Level thresholds
const levelThresholds = {
    'E-Rank': 0,
    'D-Rank': 1000,
    'C-Rank': 2000,
    'B-Rank': 4000,
    'A-Rank': 8000,
    'S-Rank': 16000,
    'SS-Rank': 32000,
    'SSS-Rank': 64000,
    'National Level': 128000,
    'Shadow Monarch': 256000
};

const levelOrder = Object.keys(levelThresholds);

// Side Missions (Habits)
const sideMissions = [
    {
        id: 'water',
        icon: '💧',
        title: 'Hydration Mission',
        description: 'Drink 2–3 liters of water throughout the day',
        reward: 50
    },
    {
        id: 'healthy_food',
        icon: '🥗',
        title: 'Clean Eating',
        description: 'Avoid junk food and sugary drinks today',
        reward: 50
    },
    {
        id: 'sleep',
        icon: '😴',
        title: 'Quality Rest',
        description: 'Get 7–8 hours of quality sleep',
        reward: 50
    },
    {
        id: 'screens',
        icon: '📱',
        title: 'Digital Detox',
        description: 'Avoid screens at least 1 hour before bed',
        reward: 50
    },
    {
        id: 'protein',
        icon: '🍗',
        title: 'Protein Power',
        description: 'Include some protein in every meal',
        reward: 50
    },
    {
        id: 'healthy_habits',
        icon: '🚭',
        title: 'Healthy Lifestyle',
        description: 'Avoid smoking or unhealthy habits today',
        reward: 50
    },
    {
        id: 'consistency',
        icon: '🎯',
        title: 'Consistency Mastery',
        description: 'Stay consistent with your routine today',
        reward: 50
    }
];

// ============ AUTHENTICATION ============
function showSignup() {
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('signupCard').style.display = 'block';
}

function showLogin() {
    document.getElementById('signupCard').style.display = 'none';
    document.getElementById('loginCard').style.display = 'block';
}

// Signup
document.getElementById('signupForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fullname = document.getElementById('signupFullname').value;
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        alert('Username already exists!');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        fullname,
        username,
        email,
        password,
        level: 'E-Rank',
        xp: 0,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Initialize training data for new user
    userTrainings[newUser.id] = {
        quests: {
            pushups: 0,
            situps: 0,
            squats: 0,
            run: 0
        },
        sideMissions: {},
        history: [],
        lastDailyReward: null,
        lastSideMissionClaim: null
    };
    
    // Initialize side missions progress
    sideMissions.forEach(mission => {
        userTrainings[newUser.id].sideMissions[mission.id] = false;
    });
    
    localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
    
    alert('Account created successfully! Please login.');
    showLogin();
    document.getElementById('signupForm').reset();
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid username or password!');
    }
});

// Check auth on dashboard load
if (window.location.pathname.includes('dashboard.html')) {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
        window.location.href = 'index.html';
    } else {
        currentUser = JSON.parse(storedUser);
        initializeDashboard();
    }
}

// ============ DASHBOARD FUNCTIONS ============
function initializeDashboard() {
    // Load user data
    document.getElementById('userNameDisplay').textContent = currentUser.username;
    
    // Load training data
    if (!userTrainings[currentUser.id]) {
        userTrainings[currentUser.id] = {
            quests: {
                pushups: 0,
                situps: 0,
                squats: 0,
                run: 0
            },
            sideMissions: {},
            history: [],
            lastDailyReward: null,
            lastSideMissionClaim: null
        };
        
        // Initialize side missions
        sideMissions.forEach(mission => {
            userTrainings[currentUser.id].sideMissions[mission.id] = false;
        });
        
        localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
    }
    
    const userData = userTrainings[currentUser.id];
    
    // Initialize side missions if not exists
    if (!userData.sideMissions) {
        userData.sideMissions = {};
        sideMissions.forEach(mission => {
            userData.sideMissions[mission.id] = false;
        });
        localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
    }
    
    // Update UI with saved progress
    updateQuestUI('pushups', userData.quests.pushups);
    updateQuestUI('situps', userData.quests.situps);
    updateQuestUI('squats', userData.quests.squats);
    updateQuestUI('run', userData.quests.run);
    
    updateLevelAndXP();
    loadHistory();
    checkDailyQuestCompletion();
    renderSideMissions();
}

function updateQuestUI(quest, value) {
    const userData = userTrainings[currentUser.id];
    
    if (quest === 'pushups') {
        document.getElementById('pushupsSlider').value = value;
        document.getElementById('pushupsCount').textContent = `${value}/100`;
    } else if (quest === 'situps') {
        document.getElementById('situpsSlider').value = value;
        document.getElementById('situpsCount').textContent = `${value}/100`;
    } else if (quest === 'squats') {
        document.getElementById('squatsSlider').value = value;
        document.getElementById('squatsCount').textContent = `${value}/100`;
    } else if (quest === 'run') {
        document.getElementById('runSlider').value = value;
        document.getElementById('runCount').textContent = `${value}/10 km`;
    }
    
    // Update slider colors
    const slider = document.getElementById(`${quest}Slider`);
    if (slider) {
        const percent = quest === 'run' ? (value / 10) * 100 : (value / 100) * 100;
        slider.style.background = `linear-gradient(90deg, #ffd700 ${percent}%, rgba(255,255,255,0.2) ${percent}%)`;
    }
}

function addProgress(quest, amount) {
    const userData = userTrainings[currentUser.id];
    let current = userData.quests[quest];
    let max = quest === 'run' ? 10 : 100;
    let newValue = Math.min(current + amount, max);
    
    userData.quests[quest] = newValue;
    userTrainings[currentUser.id] = userData;
    localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
    
    updateQuestUI(quest, newValue);
    checkDailyQuestCompletion();
    
    // Add to history if completed
    if (newValue === max && current !== max) {
        addToHistory(`Completed ${getQuestName(quest)}!`, quest);
    }
}

function completeQuest(quest) {
    const userData = userTrainings[currentUser.id];
    let max = quest === 'run' ? 10 : 100;
    
    if (userData.quests[quest] !== max) {
        userData.quests[quest] = max;
        userTrainings[currentUser.id] = userData;
        localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
        
        updateQuestUI(quest, max);
        addToHistory(`Completed ${getQuestName(quest)}!`, quest);
        checkDailyQuestCompletion();
    }
}

function getQuestName(quest) {
    const names = {
        pushups: '100 Push-ups',
        situps: '100 Sit-ups',
        squats: '100 Squats',
        run: '10km Run'
    };
    return names[quest];
}

// ============ SIDE MISSIONS FUNCTIONS ============
function renderSideMissions() {
    const habitsGrid = document.getElementById('habitsGrid');
    const userData = userTrainings[currentUser.id];
    
    if (!habitsGrid) return;
    
    let html = '';
    let completedCount = 0;
    
    sideMissions.forEach(mission => {
        const isCompleted = userData.sideMissions[mission.id] || false;
        if (isCompleted) completedCount++;
        
        html += `
            <div class="habit-card ${isCompleted ? 'completed' : ''}" data-mission="${mission.id}">
                <div class="habit-content">
                    <div class="habit-icon">${mission.icon}</div>
                    <div class="habit-info">
                        <h4>${mission.title}</h4>
                        <p>${mission.description}</p>
                        <span class="habit-reward">⭐ +${mission.reward} XP</span>
                    </div>
                    <div class="habit-checkbox">
                        <input type="checkbox" 
                               ${isCompleted ? 'checked' : ''} 
                               onchange="toggleSideMission('${mission.id}', this.checked)">
                    </div>
                </div>
            </div>
        `;
    });
    
    habitsGrid.innerHTML = html;
    
    // Update stats
    document.getElementById('completedMissions').textContent = completedCount;
    document.getElementById('totalMissions').textContent = sideMissions.length;
    const potentialXP = completedCount * 50;
    document.getElementById('potentialXP').textContent = potentialXP;
    
    // Enable/disable claim button
    const claimBtn = document.getElementById('claimSideBtn');
    if (claimBtn) {
        claimBtn.disabled = completedCount === 0;
    }
}

function toggleSideMission(missionId, completed) {
    const userData = userTrainings[currentUser.id];
    userData.sideMissions[missionId] = completed;
    userTrainings[currentUser.id] = userData;
    localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
    
    // Update UI
    renderSideMissions();
}

function claimSideMissionRewards() {
    const userData = userTrainings[currentUser.id];
    const today = new Date().toDateString();
    
    // Check if already claimed today
    if (userData.lastSideMissionClaim === today) {
        alert('You already claimed your side mission rewards today! Come back tomorrow for more.');
        return;
    }
    
    // Get completed missions
    const completedMissions = [];
    let totalXP = 0;
    
    sideMissions.forEach(mission => {
        if (userData.sideMissions[mission.id]) {
            completedMissions.push(mission);
            totalXP += mission.reward;
        }
    });
    
    if (completedMissions.length === 0) {
        alert('Complete at least one side mission before claiming rewards!');
        return;
    }
    
    // Award XP
    currentUser.xp += totalXP;
    
    // Update user in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex].xp = currentUser.xp;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Mark as claimed
    userData.lastSideMissionClaim = today;
    userTrainings[currentUser.id] = userData;
    localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
    
    // Add to history
    addToHistory(`Completed ${completedMissions.length} Side Missions! Earned ${totalXP} XP!`, 'side-mission');
    
    // Reset side missions for next day
    sideMissions.forEach(mission => {
        userData.sideMissions[mission.id] = false;
    });
    localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
    
    // Update UI
    renderSideMissions();
    updateLevelAndXP();
    
    alert(`⭐ Amazing! You earned ${totalXP} XP from Side Missions! ⭐\n\nCompleted: ${completedMissions.map(m => m.title).join(', ')}`);
}

function checkDailyQuestCompletion() {
    const userData = userTrainings[currentUser.id];
    const allCompleted = 
        userData.quests.pushups === 100 &&
        userData.quests.situps === 100 &&
        userData.quests.squats === 100 &&
        userData.quests.run === 10;
    
    const statusElement = document.getElementById('questStatus');
    if (allCompleted) {
        statusElement.textContent = 'Complete! ✓';
        statusElement.classList.add('completed');
        statusElement.style.background = 'rgba(40, 167, 69, 0.8)';
    } else {
        statusElement.textContent = 'Incomplete';
        statusElement.classList.remove('completed');
        statusElement.style.background = 'rgba(220, 53, 69, 0.8)';
    }
    
    return allCompleted;
}

function completeDailyQuest() {
    const userData = userTrainings[currentUser.id];
    const allCompleted = checkDailyQuestCompletion();
    
    if (!allCompleted) {
        alert('Complete all main quests first to claim your daily reward!');
        return;
    }
    
    // Check if already claimed today
    const today = new Date().toDateString();
    if (userData.lastDailyReward === today) {
        alert('You already claimed your daily reward today! Come back tomorrow for more training.');
        return;
    }
    
    // Award XP
    const xpGain = 100;
    currentUser.xp += xpGain;
    
    // Update user in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex].xp = currentUser.xp;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Mark reward as claimed
    userData.lastDailyReward = today;
    userTrainings[currentUser.id] = userData;
    localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
    
    // Reset quests for next day
    userData.quests = {
        pushups: 0,
        situps: 0,
        squats: 0,
        run: 0
    };
    localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
    
    // Update UI
    updateQuestUI('pushups', 0);
    updateQuestUI('situps', 0);
    updateQuestUI('squats', 0);
    updateQuestUI('run', 0);
    
    updateLevelAndXP();
    addToHistory(`Daily Main Quest Complete! Earned ${xpGain} XP!`, 'daily');
    
    alert(`🎉 Daily Main Quest Complete! You earned ${xpGain} XP! 🎉`);
    checkDailyQuestCompletion();
}

function updateLevelAndXP() {
    let currentLevel = 'E-Rank';
    let currentXP = currentUser.xp || 0;
    let nextLevelXP = levelThresholds['D-Rank'];
    
    for (let i = 0; i < levelOrder.length - 1; i++) {
        if (currentXP >= levelThresholds[levelOrder[i + 1]]) {
            currentLevel = levelOrder[i + 1];
        } else {
            nextLevelXP = levelThresholds[levelOrder[i + 1]];
            break;
        }
    }
    
    // Update user level
    currentUser.level = currentLevel;
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex].level = currentLevel;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    document.getElementById('currentLevel').textContent = currentLevel;
    document.getElementById('userRank').textContent = currentLevel;
    document.getElementById('currentXP').textContent = currentXP;
    document.getElementById('nextLevelXP').textContent = nextLevelXP;
    
    const xpForNextLevel = nextLevelXP - levelThresholds[currentLevel];
    const xpProgress = currentXP - levelThresholds[currentLevel];
    const progressPercent = (xpProgress / xpForNextLevel) * 100;
    
    document.getElementById('levelProgress').style.width = `${progressPercent}%`;
    document.getElementById('levelProgress').textContent = `${Math.round(progressPercent)}%`;
    
    // Update total quests count
    const userData = userTrainings[currentUser.id];
    const totalQuests = userData.history.filter(h => h.type !== 'daily' && h.type !== 'side-mission').length;
    document.getElementById('totalQuests').textContent = totalQuests;
    
    // Update side missions completed count
    const sideMissionsCompleted = userData.history.filter(h => h.type === 'side-mission').length;
    document.getElementById('sideMissionsCompleted').textContent = sideMissionsCompleted;
}

function addToHistory(message, type) {
    const userData = userTrainings[currentUser.id];
    const historyEntry = {
        id: Date.now(),
        message: message,
        type: type,
        date: new Date().toLocaleString()
    };
    
    userData.history.unshift(historyEntry);
    userTrainings[currentUser.id] = userData;
    localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
    
    loadHistory();
}

function loadHistory() {
    const userData = userTrainings[currentUser.id];
    const historyList = document.getElementById('historyList');
    
    if (!userData.history || userData.history.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaa;">No training history yet. Start your journey!</div>';
        return;
    }
    
    let html = '';
    userData.history.forEach(entry => {
        let icon = '⚔️';
        if (entry.type === 'daily') icon = '🏆';
        else if (entry.type === 'side-mission') icon = '⭐';
        
        html += `
            <div class="history-item">
                <span>${icon} ${escapeHtml(entry.message)}</span>
                <span class="history-date">${entry.date}</span>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

function clearHistory() {
    if (confirm('Clear all training history?')) {
        const userData = userTrainings[currentUser.id];
        userData.history = [];
        userTrainings[currentUser.id] = userData;
        localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
        loadHistory();
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Initialize sliders
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        setTimeout(() => {
            const sliders = ['pushups', 'situps', 'squats', 'run'];
            sliders.forEach(quest => {
                const slider = document.getElementById(`${quest}Slider`);
                if (slider) {
                    slider.addEventListener('input', (e) => {
                        if (!currentUser) return;
                        const userData = userTrainings[currentUser.id];
                        let value = parseFloat(e.target.value);
                        userData.quests[quest] = value;
                        userTrainings[currentUser.id] = userData;
                        localStorage.setItem('userTrainings', JSON.stringify(userTrainings));
                        updateQuestUI(quest, value);
                        checkDailyQuestCompletion();
                    });
                }
            });
        }, 100);
    }
});