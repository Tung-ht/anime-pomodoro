/**
 * ============================================================================
 * POMODORO TIMER CORE ENGINE & STUDY TRACKER
 * English Edition
 * Features:
 *   - Precision Delta-Time Engine (no drift in background tabs)
 *   - Modes: Focus (Pomodoro), Short Break, Long Break
 *   - Circular Glowing Progress Ring SVG
 *   - Dynamic Browser Tab Title & Notification Chimes
 *   - Task / Goal Manager with Pomo Counter per task
 *   - Daily Study Stats (Completed sessions & Total minutes)
 *   - Full LocalStorage Persistence
 * ============================================================================
 */

class PomodoroEngine {
  constructor() {
    this.storageSettingsKey = 'anime_pomo_settings_en';
    this.storageStatsKey = 'anime_pomo_daily_stats_en';
    this.storageTasksKey = 'anime_pomo_tasks_en';

    // Settings (in minutes)
    this.settings = {
      pomodoroTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      cyclesBeforeLongBreak: 4,
      autoStartBreak: false,
      autoStartPomodoro: false,
      soundChime: true
    };

    // Modes: 'pomodoro', 'shortBreak', 'longBreak'
    this.currentMode = 'pomodoro';
    this.isRunning = false;
    this.totalSeconds = 25 * 60;
    this.timeLeft = 25 * 60;

    // Timer Interval & Delta Sync
    this.timerId = null;
    this.lastTickTime = null;

    // Daily Stats & Cycles
    this.dailyStats = {
      date: new Date().toDateString(),
      completedPomos: 0,
      totalMinutes: 0
    };
    this.cycleCount = 0; // count within current cycle round

    // Tasks
    this.tasks = [];
    this.activeTaskId = null;

    // Circular Ring Radius
    this.ringCircumference = 2 * Math.PI * 140; // ~879.64

    this.init();
  }

  init() {
    this.loadSettings();
    this.loadDailyStats();
    this.loadTasks();

    this.totalSeconds = this.settings.pomodoroTime * 60;
    this.timeLeft = this.totalSeconds;

    this.bindEvents();
    this.updateDisplay();
    this.renderSessionDots();
    this.renderTasks();
  }

  // ==========================================================================
  // TIMER TICK & ACCURACY
  // ==========================================================================

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTickTime = Date.now();

    this.updateControlsUI();

    this.timerId = setInterval(() => {
      const now = Date.now();
      const deltaSec = Math.floor((now - this.lastTickTime) / 1000);

      if (deltaSec >= 1) {
        this.timeLeft = Math.max(0, this.timeLeft - deltaSec);
        this.lastTickTime = now;
        this.updateDisplay();

        if (this.timeLeft <= 0) {
          this.onTimerComplete();
        }
      }
    }, 250);
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timerId);
    this.timerId = null;
    this.updateControlsUI();
  }

  toggleStart() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  reset() {
    this.pause();
    this.timeLeft = this.totalSeconds;
    this.updateDisplay();
  }

  skip() {
    this.pause();
    this.onTimerComplete(true);
  }

  adjustTime(deltaMinutes) {
    const deltaSec = deltaMinutes * 60;
    this.timeLeft = Math.max(60, this.timeLeft + deltaSec);
    this.totalSeconds = Math.max(this.totalSeconds, this.timeLeft);
    this.updateDisplay();
  }

  // ==========================================================================
  // TIMER COMPLETION & MODE SWITCHING
  // ==========================================================================

  onTimerComplete(isSkipped = false) {
    this.pause();

    // 1. Play Peaceful Chime Sound
    if (this.settings.soundChime && window.ambientSynth && !isSkipped) {
      window.ambientSynth.playChime();
    }

    // 2. Desktop Notification
    if (!isSkipped && 'Notification' in window && Notification.permission === 'granted') {
      const modeName = this.currentMode === 'pomodoro' ? 'Focus Session Completed!' : 'Break Time Finished!';
      const msg = this.currentMode === 'pomodoro' 
        ? 'Great job! Take a breath and relax under the starlight 🌙' 
        : 'Ready to embark on the next focus session? ✨';
      new Notification(modeName, { 
        body: msg, 
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌙</text></svg>' 
      });
    }

    // 3. Update stats if pomodoro completed
    if (this.currentMode === 'pomodoro' && !isSkipped) {
      this.dailyStats.completedPomos++;
      this.dailyStats.totalMinutes += this.settings.pomodoroTime;
      this.cycleCount++;
      this.saveDailyStats();

      // Add pomo count to active task
      if (this.activeTaskId) {
        const task = this.tasks.find(t => t.id === this.activeTaskId);
        if (task) {
          task.pomos = (task.pomos || 0) + 1;
          this.saveTasks();
          this.renderTasks();
        }
      }

      this.renderSessionDots();
    }

    // 4. Switch to next mode
    let nextMode = 'pomodoro';
    let shouldAutoStart = false;

    if (this.currentMode === 'pomodoro') {
      if (this.cycleCount >= this.settings.cyclesBeforeLongBreak) {
        nextMode = 'longBreak';
        this.cycleCount = 0;
      } else {
        nextMode = 'shortBreak';
      }
      shouldAutoStart = this.settings.autoStartBreak;
    } else {
      nextMode = 'pomodoro';
      shouldAutoStart = this.settings.autoStartPomodoro;
    }

    this.switchMode(nextMode);

    if (shouldAutoStart) {
      this.start();
    }
  }

  switchMode(mode) {
    this.pause();
    this.currentMode = mode;

    if (mode === 'pomodoro') {
      this.totalSeconds = this.settings.pomodoroTime * 60;
    } else if (mode === 'shortBreak') {
      this.totalSeconds = this.settings.shortBreakTime * 60;
    } else if (mode === 'longBreak') {
      this.totalSeconds = this.settings.longBreakTime * 60;
    }

    this.timeLeft = this.totalSeconds;

    // Update active tab UI
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    this.updateDisplay();
  }

  // ==========================================================================
  // UI & PROGRESS DISPLAY
  // ==========================================================================

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Main Card Display
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) timerDisplay.textContent = timeFormatted;

    // Zen Mode Display
    const zenTime = document.getElementById('zen-time');
    if (zenTime) zenTime.textContent = timeFormatted;

    // Status label
    const statusLabel = document.getElementById('timer-status');
    const zenSub = document.getElementById('zen-sub');
    let statusText = 'Ready to Focus';
    if (this.currentMode === 'pomodoro') {
      statusText = this.isRunning ? '🌙 Deep focus in progress...' : 'Focus paused';
    } else if (this.currentMode === 'shortBreak') {
      statusText = this.isRunning ? '☕ Rest & unwind...' : 'Break paused';
    } else if (this.currentMode === 'longBreak') {
      statusText = this.isRunning ? '✨ Extended restorative break...' : 'Long break paused';
    }

    if (statusLabel) statusLabel.textContent = statusText;
    if (zenSub) zenSub.textContent = statusText;

    // Circular Progress Ring
    const ring = document.getElementById('ring-progress');
    if (ring) {
      const progressRatio = (this.totalSeconds - this.timeLeft) / this.totalSeconds;
      const offset = this.ringCircumference * (1 - progressRatio);
      ring.style.strokeDashoffset = offset;
    }

    // Browser Tab Title
    const modeEmoji = this.currentMode === 'pomodoro' ? '🌙' : '☕';
    const modeLabel = this.currentMode === 'pomodoro' ? 'Focus' : 'Break';
    document.title = `(${timeFormatted}) ${modeEmoji} ${modeLabel} | Starlight Pomodoro`;
  }

  updateControlsUI() {
    const playText = document.getElementById('play-text');
    const playIcon = document.getElementById('play-icon');

    if (playText) {
      playText.textContent = this.isRunning ? 'Pause' : 'Start';
    }

    if (playIcon) {
      playIcon.setAttribute('data-lucide', this.isRunning ? 'pause' : 'play');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  renderSessionDots() {
    const container = document.getElementById('pomo-dots');
    const statPomos = document.getElementById('stat-completed-count');
    const statMinutes = document.getElementById('stat-total-minutes');

    if (statPomos) statPomos.textContent = this.dailyStats.completedPomos;
    if (statMinutes) statMinutes.textContent = this.dailyStats.totalMinutes;

    if (!container) return;
    container.innerHTML = '';

    const maxDots = this.settings.cyclesBeforeLongBreak;
    for (let i = 0; i < maxDots; i++) {
      const dot = document.createElement('div');
      dot.className = `pomo-dot ${i < this.cycleCount ? 'filled' : ''}`;
      container.appendChild(dot);
    }
  }

  // ==========================================================================
  // TASK / STUDY GOAL MANAGEMENT
  // ==========================================================================

  addTask(title) {
    if (!title.trim()) return;
    const newTask = {
      id: 'task_' + Date.now(),
      title: title.trim(),
      completed: false,
      pomos: 0
    };
    this.tasks.push(newTask);
    if (!this.activeTaskId) {
      this.activeTaskId = newTask.id;
    }
    this.saveTasks();
    this.renderTasks();
    this.updateActiveTaskDisplay();
  }

  toggleTaskCompleted(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    if (this.activeTaskId === id) {
      this.activeTaskId = this.tasks.length > 0 ? this.tasks[0].id : null;
    }
    this.saveTasks();
    this.renderTasks();
    this.updateActiveTaskDisplay();
  }

  setActiveTask(id) {
    this.activeTaskId = id;
    this.renderTasks();
    this.updateActiveTaskDisplay();
  }

  updateActiveTaskDisplay() {
    const pill = document.getElementById('current-task-display');
    if (!pill) return;
    const activeTask = this.tasks.find(t => t.id === this.activeTaskId);
    const textEl = pill.querySelector('.task-text');
    if (textEl) {
      textEl.textContent = activeTask ? activeTask.title : 'No goal selected';
    }
  }

  renderTasks() {
    const container = document.getElementById('task-list-container');
    if (!container) return;

    if (this.tasks.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-dim); padding: 24px;">
          No goals added yet. Add a study goal to stay on track!
        </div>
      `;
      this.updateActiveTaskDisplay();
      return;
    }

    container.innerHTML = '';
    this.tasks.forEach(task => {
      const isSelected = (task.id === this.activeTaskId);
      const card = document.createElement('div');
      card.className = `task-card ${isSelected ? 'active' : ''} ${task.completed ? 'completed' : ''}`;

      card.innerHTML = `
        <div class="task-card-left" data-select="${task.id}">
          <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-toggle="${task.id}">
            ${task.completed ? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : ''}
          </div>
          <span class="task-card-title">${this.escapeHtml(task.title)}</span>
        </div>
        <div class="task-card-right">
          <span class="task-pomo-badge" title="Completed Pomodoro sessions">🍅 ${task.pomos || 0}</span>
          <button class="item-del-btn" data-delete="${task.id}" title="Delete goal">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;

      card.querySelector('.task-checkbox').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTaskCompleted(task.id);
      });

      card.querySelector('.task-card-left').addEventListener('click', () => {
        this.setActiveTask(task.id);
      });

      card.querySelector('.item-del-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteTask(task.id);
      });

      container.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
    this.updateActiveTaskDisplay();
  }

  // ==========================================================================
  // EVENT BINDINGS
  // ==========================================================================

  bindEvents() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        this.switchMode(mode);
      });
    });

    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.addEventListener('click', () => this.toggleStart());

    const btnSkip = document.getElementById('btn-skip');
    if (btnSkip) btnSkip.addEventListener('click', () => this.skip());

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) btnReset.addEventListener('click', () => this.reset());

    const btnPlus = document.getElementById('btn-quick-plus');
    if (btnPlus) btnPlus.addEventListener('click', () => this.adjustTime(5));

    const btnMinus = document.getElementById('btn-quick-minus');
    if (btnMinus) btnMinus.addEventListener('click', () => this.adjustTime(-5));

    const taskPill = document.getElementById('current-task-display');
    if (taskPill) {
      taskPill.addEventListener('click', () => {
        const modal = document.getElementById('modal-tasks');
        if (modal) modal.classList.add('open');
      });
    }

    const formTask = document.getElementById('form-add-task');
    if (formTask) {
      formTask.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('input-task-name');
        if (input && input.value) {
          this.addTask(input.value);
          input.value = '';
        }
      });
    }

    document.addEventListener('click', () => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }, { once: true });
  }

  // ==========================================================================
  // STORAGE
  // ==========================================================================

  loadSettings() {
    try {
      const data = localStorage.getItem(this.storageSettingsKey);
      if (data) {
        Object.assign(this.settings, JSON.parse(data));
      }
    } catch (e) {}
  }

  saveSettings() {
    try {
      localStorage.setItem(this.storageSettingsKey, JSON.stringify(this.settings));
    } catch (e) {}
  }

  loadDailyStats() {
    try {
      const data = localStorage.getItem(this.storageStatsKey);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.date === new Date().toDateString()) {
          this.dailyStats = parsed;
        } else {
          this.dailyStats = {
            date: new Date().toDateString(),
            completedPomos: 0,
            totalMinutes: 0
          };
          this.saveDailyStats();
        }
      }
    } catch (e) {}
  }

  saveDailyStats() {
    try {
      localStorage.setItem(this.storageStatsKey, JSON.stringify(this.dailyStats));
    } catch (e) {}
  }

  loadTasks() {
    try {
      const data = localStorage.getItem(this.storageTasksKey);
      if (data) {
        this.tasks = JSON.parse(data);
        if (this.tasks.length > 0) {
          this.activeTaskId = this.tasks[0].id;
        }
      }
    } catch (e) {}
  }

  saveTasks() {
    try {
      localStorage.setItem(this.storageTasksKey, JSON.stringify(this.tasks));
    } catch (e) {}
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Global instance exposed
window.pomodoroEngine = new PomodoroEngine();
