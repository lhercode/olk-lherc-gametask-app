// TaskQuest - Sistema de Gamificación para Tareas

class TaskQuestGame {
    constructor() {
        this.categories = ['comunicacion', 'estudiar', 'proyectos', 'personal'];
        this.version = '2025.1.2'; // Versión que empieza con el año - Fix: Acumulación de pomodoros y detención completa
        this.loadData();
        this.init();
        this.initPomodoro();
        this.initDailySystem();
        this.initGoalsSystem();
        this.displayVersion();
        this.initRestAlertSystem();
        this.initScrollSpy();
        this.initPushNotifications();
    }

    init() {
        this.renderTasks();
        this.updateStats();
        this.updateProgress();
        this.checkDailyStreak();
        this.updateMotivation();
        this.renderAchievements();
        this.setupEventListeners();
        this.updateHistoricalStats();
        this.updateDailyStats();
        this.showHistory('daily'); // Mostrar historial diario por defecto
        
        // Debug: Verificar que los elementos del pomodoro existan
        this.debugPomodoroElements();
    }
    
    debugPomodoroElements() {
        console.log('🔍 Verificando elementos del Pomodoro:');
        const elements = ['startBtn', 'pauseBtn', 'resetBtn', 'timerDisplay', 'timerPercentage', 'timerLabel'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            console.log(`${id}: ${element ? '✅ Encontrado' : '❌ No encontrado'}`);
        });
        
        // Verificar estado del pomodoro
        console.log('📊 Estado del Pomodoro:', this.pomodoroState);
        
        // Si hay problemas, intentar reinicializar
        if (!this.pomodoroState) {
            console.log('🔄 Reinicializando Pomodoro...');
            this.initPomodoro();
        }
        
        // Verificar que los event listeners estén funcionando
        setTimeout(() => {
            this.verifyPomodoroFunctionality();
        }, 500);
    }
    
    // Función para reinicializar el pomodoro si es necesario
    reinitializePomodoro() {
        console.log('🔄 Reinicializando sistema Pomodoro...');
        
        // Limpiar intervalos existentes
        if (this.pomodoroState && this.pomodoroState.intervalId) {
            clearInterval(this.pomodoroState.intervalId);
        }
        
        // Limpiar estado de completado
        if (this.pomodoroState) {
            this.pomodoroState.isCompleting = false;
            this.pomodoroState.isRunning = false;
        }
        
        // Reinicializar completamente
        this.initPomodoro();
        this.updatePomodoroDisplay();
        this.updatePomodoroStats();
        
        // Reconfigurar event listeners
        this.attachPomodoroListeners();
        
        console.log('✅ Pomodoro reinicializado completamente');
    }
    
    // Función para probar el pomodoro
    testPomodoro() {
        console.log('🧪 Probando funcionalidad del Pomodoro...');
        
        // Probar botones
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (startBtn) {
            console.log('✅ startBtn encontrado');
            startBtn.click();
            setTimeout(() => {
                if (pauseBtn) {
                    console.log('✅ pauseBtn encontrado');
                    pauseBtn.click();
                    setTimeout(() => {
                        if (resetBtn) {
                            console.log('✅ resetBtn encontrado');
                            resetBtn.click();
                        }
                    }, 1000);
                }
            }, 2000);
        }
    }
    
    // Verificar que la funcionalidad del pomodoro esté funcionando
    verifyPomodoroFunctionality() {
        console.log('🔍 Verificando funcionalidad del Pomodoro...');
        
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (!startBtn || !pauseBtn || !resetBtn) {
            console.error('❌ Botones del pomodoro no encontrados, reintentando...');
            this.attachPomodoroListeners();
            return;
        }
        
        // Verificar que los event listeners estén funcionando
        const hasStartListener = startBtn.onclick !== null || startBtn.addEventListener !== undefined;
        const hasPauseListener = pauseBtn.onclick !== null || pauseBtn.addEventListener !== undefined;
        const hasResetListener = resetBtn.onclick !== null || resetBtn.addEventListener !== undefined;
        
        console.log('📊 Estado de los listeners:');
        console.log(`  startBtn: ${hasStartListener ? '✅' : '❌'}`);
        console.log(`  pauseBtn: ${hasPauseListener ? '✅' : '❌'}`);
        console.log(`  resetBtn: ${hasResetListener ? '✅' : '❌'}`);
        
        if (!hasStartListener || !hasPauseListener || !hasResetListener) {
            console.log('🔄 Reconfigurando event listeners...');
            this.attachPomodoroListeners();
        }
    }

    loadData() {
        const defaultData = {
            points: 0,
            level: 1,
            streak: 0,
            lastCompletedDate: null,
            tasks: {
                comunicacion: [],
                estudiar: [],
                proyectos: [],
                personal: []
            },
            completedToday: {
                comunicacion: 0,
                estudiar: 0,
                proyectos: 0,
                personal: 0
            },
            achievements: [],
            totalCompleted: 0,
            pomodoro: {
                pomodorosToday: 0,
                focusTimeToday: 0,
                settings: {
                    workDuration: 25,
                    breakDuration: 5,
                    longBreakDuration: 15,
                    pomodorosUntilLongBreak: 4
                }
            },
            activeTask: null,
            // Nuevo sistema de historial
            taskHistory: {
                daily: {}, // { "2024-01-15": { tasks: [], timeBlocks: [] } }
                weekly: {}, // { "2024-W03": { tasks: [], timeBlocks: [] } }
                monthly: {}  // { "2024-01": { tasks: [], timeBlocks: [] } }
            }
        };

        const savedData = localStorage.getItem('taskQuestData');
        this.data = savedData ? JSON.parse(savedData) : defaultData;
        
        console.log('📂 Datos cargados desde localStorage:', this.data);
        console.log('🎯 Tarea activa cargada:', this.data.activeTask);

        // Asegurar que la estructura de taskHistory exista para datos existentes
        if (!this.data.taskHistory) {
            this.data.taskHistory = {
                daily: {},
                weekly: {},
                monthly: {}
            };
            this.saveData();
        }
        
        // Migrar datos existentes si es necesario
        this.migrateExistingData();

        // Añadir tareas de ejemplo si es la primera vez
        if (!savedData) {
            this.addExampleTasks();
        }
    }

    saveData() {
        localStorage.setItem('taskQuestData', JSON.stringify(this.data));
    }
    
    // Migrar datos existentes para usuarios que ya tenían la app
    migrateExistingData() {
        // Verificar si necesitamos migrar datos
        const needsMigration = !this.data.taskHistory || 
                           Object.keys(this.data.taskHistory).length === 0;
        
        if (needsMigration) {
            console.log('🔄 Migrando datos existentes...');
            
            // Inicializar estructura de historial
            this.data.taskHistory = {
                daily: {},
                weekly: {},
                monthly: {}
            };
            
            // Si hay datos de pomodoro existentes, crear un historial básico
            if (this.data.pomodoro && this.data.pomodoro.pomodorosToday > 0) {
                const today = new Date();
                const dateKey = this.getDateKey(today);
                
                this.data.taskHistory.daily[dateKey] = {
                    tasks: [],
                    timeBlocks: {}
                };
                
                console.log('✅ Datos migrados correctamente');
            }
            
            this.saveData();
        }
    }

    // ========== HISTORIAL SYSTEM ==========
    
    // Obtener bloque de tiempo de 30 minutos (22:30-23:00, 23:00-23:30, etc.)
    getTimeBlock(date = new Date()) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        // Redondear hacia abajo a bloques de 30 minutos
        const blockStartMinutes = Math.floor(minutes / 30) * 30;
        const blockEndMinutes = blockStartMinutes + 30;
        
        const startHour = hours;
        const endHour = blockEndMinutes === 60 ? hours + 1 : hours;
        const endMinutes = blockEndMinutes === 60 ? 0 : blockEndMinutes;
        
        return {
            start: `${startHour.toString().padStart(2, '0')}:${blockStartMinutes.toString().padStart(2, '0')}`,
            end: `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`,
            blockId: `${startHour.toString().padStart(2, '0')}:${blockStartMinutes.toString().padStart(2, '0')}`
        };
    }
    
    // Obtener clave de fecha para el historial diario
    getDateKey(date = new Date()) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    // Obtener clave de semana para el historial semanal
    getWeekKey(date = new Date()) {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }
    
    // Obtener clave de mes para el historial mensual
    getMonthKey(date = new Date()) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`;
    }
    
    // Calcular número de semana
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    // Registrar tarea completada en el historial
    recordTaskCompletion(task, completionData) {
        // Asegurar que taskHistory exista
        if (!this.data.taskHistory) {
            this.data.taskHistory = {
                daily: {},
                weekly: {},
                monthly: {}
            };
        }
        
        const now = new Date();
        const dateKey = this.getDateKey(now);
        const weekKey = this.getWeekKey(now);
        const monthKey = this.getMonthKey(now);
        const timeBlock = this.getTimeBlock(now);
        
        const historyEntry = {
            id: Date.now(),
            taskId: task.id,
            taskName: task.name,
            category: task.category || 'unknown',
            points: task.points,
            completedAt: now.toISOString(),
            timeBlock: timeBlock,
            pomodorosUsed: completionData.pomodorosUsed || 0,
            breaksTaken: completionData.breaksTaken || 0,
            totalTimeSpent: completionData.totalTimeSpent || 0, // en minutos
            efficiency: completionData.efficiency || 0 // porcentaje
        };
        
        // Inicializar estructuras si no existen
        if (!this.data.taskHistory.daily[dateKey]) {
            this.data.taskHistory.daily[dateKey] = { tasks: [], timeBlocks: {} };
        }
        if (!this.data.taskHistory.weekly[weekKey]) {
            this.data.taskHistory.weekly[weekKey] = { tasks: [], timeBlocks: {} };
        }
        if (!this.data.taskHistory.monthly[monthKey]) {
            this.data.taskHistory.monthly[monthKey] = { tasks: [], timeBlocks: {} };
        }
        
        // Agregar a historial diario
        this.data.taskHistory.daily[dateKey].tasks.push(historyEntry);
        
        // Agregar a historial semanal
        this.data.taskHistory.weekly[weekKey].tasks.push(historyEntry);
        
        // Agregar a historial mensual
        this.data.taskHistory.monthly[monthKey].tasks.push(historyEntry);
        
        // Actualizar bloques de tiempo
        this.updateTimeBlockStats(dateKey, weekKey, monthKey, timeBlock, historyEntry);
        
        this.saveData();
    }
    
    // Actualizar estadísticas de bloques de tiempo
    updateTimeBlockStats(dateKey, weekKey, monthKey, timeBlock, historyEntry) {
        const blockId = timeBlock.blockId;
        
        // Función para inicializar o actualizar bloque
        const initTimeBlock = (timeBlocks) => {
            if (!timeBlocks[blockId]) {
                timeBlocks[blockId] = {
                    blockId: blockId,
                    timeRange: `${timeBlock.start}-${timeBlock.end}`,
                    tasksCompleted: 0,
                    pomodorosUsed: 0,
                    breaksTaken: 0,
                    totalTimeSpent: 0,
                    tasks: []
                };
            }
        };
        
        // Actualizar bloques de tiempo
        initTimeBlock(this.data.taskHistory.daily[dateKey].timeBlocks);
        initTimeBlock(this.data.taskHistory.weekly[weekKey].timeBlocks);
        initTimeBlock(this.data.taskHistory.monthly[monthKey].timeBlocks);
        
        // Actualizar estadísticas
        [this.data.taskHistory.daily[dateKey].timeBlocks[blockId],
         this.data.taskHistory.weekly[weekKey].timeBlocks[blockId],
         this.data.taskHistory.monthly[monthKey].timeBlocks[blockId]].forEach(block => {
            block.tasksCompleted++;
            block.pomodorosUsed += historyEntry.pomodorosUsed;
            block.breaksTaken += historyEntry.breaksTaken;
            block.totalTimeSpent += historyEntry.totalTimeSpent;
            block.tasks.push(historyEntry);
        });
    }
    
    // Calcular eficiencia de la tarea
    calculateTaskEfficiency(activeTask) {
        if (!activeTask || !activeTask.pomodorosCompleted) return 0;
        
        const expectedTime = activeTask.pomodorosCompleted * this.data.pomodoro.settings.workDuration;
        const actualTime = activeTask.totalTimeSpent || expectedTime;
        
        // Eficiencia = tiempo esperado / tiempo real * 100
        const efficiency = Math.min(100, Math.round((expectedTime / actualTime) * 100));
        return efficiency;
    }
    
    // Obtener historial por período
    getHistoryByPeriod(period, date = new Date()) {
        // Asegurar que taskHistory exista
        if (!this.data.taskHistory) {
            this.data.taskHistory = {
                daily: {},
                weekly: {},
                monthly: {}
            };
            this.saveData();
        }
        
        let key, data;
        
        switch (period) {
            case 'daily':
                key = this.getDateKey(date);
                data = this.data.taskHistory.daily[key];
                break;
            case 'weekly':
                key = this.getWeekKey(date);
                data = this.data.taskHistory.weekly[key];
                break;
            case 'monthly':
                key = this.getMonthKey(date);
                data = this.data.taskHistory.monthly[key];
                break;
            default:
                return null;
        }
        
        return data || { tasks: [], timeBlocks: {} };
    }
    
    // Mostrar historial en la interfaz
    showHistory(period = 'daily', date = new Date()) {
        const history = this.getHistoryByPeriod(period, date);
        if (!history) return;
        
        const historySection = document.getElementById('history');
        if (!historySection) return;
        
        // Crear contenido del historial
        let historyHTML = `
            <div class="history-content">
                <div class="history-header">
                    <h3>📊 Historial ${this.getPeriodLabel(period)}</h3>
                    <div class="history-date">${this.formatDateForPeriod(period, date)}</div>
                </div>
        `;
        
        // Mostrar resumen de tareas
        if (history.tasks && history.tasks.length > 0) {
            historyHTML += this.renderTasksHistory(history.tasks);
        }
        
        // Mostrar bloques de tiempo
        if (history.timeBlocks && Object.keys(history.timeBlocks).length > 0) {
            historyHTML += this.renderTimeBlocksHistory(history.timeBlocks);
        }
        
        // Si no hay datos
        if ((!history.tasks || history.tasks.length === 0) && 
            (!history.timeBlocks || Object.keys(history.timeBlocks).length === 0)) {
            historyHTML += `
                <div class="no-history">
                    <span class="no-history-icon">📝</span>
                    <p>No hay actividad registrada para este período</p>
                </div>
            `;
        }
        
        historyHTML += '</div>';
        
        // Actualizar el contenido
        const existingContent = historySection.querySelector('.history-content');
        if (existingContent) {
            existingContent.remove();
        }
        historySection.insertAdjacentHTML('beforeend', historyHTML);
    }
    
    // Renderizar historial de tareas
    renderTasksHistory(tasks) {
        let html = `
            <div class="tasks-history">
                <h4>✅ Tareas Completadas (${tasks.length})</h4>
                <div class="tasks-list">
        `;
        
        tasks.forEach(task => {
            html += `
                <div class="task-history-item">
                    <div class="task-info">
                        <span class="task-category-icon">${this.getCategoryIcon(task.category)}</span>
                        <div class="task-details">
                            <div class="task-name">${task.taskName}</div>
                            <div class="task-meta">
                                <span class="task-points">+${task.points} XP</span>
                                <span class="task-time">${this.formatTime(task.completedAt)}</span>
                                <span class="task-block">${task.timeBlock.start}-${task.timeBlock.end}</span>
                            </div>
                        </div>
                    </div>
                    <div class="task-stats">
                        <div class="stat-item">
                            <span class="stat-icon">🍅</span>
                            <span class="stat-value">${task.pomodorosUsed}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">☕</span>
                            <span class="stat-value">${task.breaksTaken}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">⏱️</span>
                            <span class="stat-value">${task.totalTimeSpent}m</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">📊</span>
                            <span class="stat-value">${task.efficiency}%</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    // Renderizar historial de bloques de tiempo
    renderTimeBlocksHistory(timeBlocks) {
        let html = `
            <div class="time-blocks-history">
                <h4>⏰ Bloques de Tiempo</h4>
                <div class="time-blocks-grid">
        `;
        
        // Ordenar bloques por hora
        const sortedBlocks = Object.values(timeBlocks).sort((a, b) => a.blockId.localeCompare(b.blockId));
        
        sortedBlocks.forEach(block => {
            html += `
                <div class="time-block-card">
                    <div class="block-header">
                        <span class="block-time">${block.timeRange}</span>
                        <span class="block-tasks">${block.tasksCompleted} tareas</span>
                    </div>
                    <div class="block-stats">
                        <div class="block-stat">
                            <span class="stat-icon">🍅</span>
                            <span class="stat-value">${block.pomodorosUsed}</span>
                        </div>
                        <div class="block-stat">
                            <span class="stat-icon">☕</span>
                            <span class="stat-value">${block.breaksTaken}</span>
                        </div>
                        <div class="block-stat">
                            <span class="stat-icon">⏱️</span>
                            <span class="stat-value">${block.totalTimeSpent}m</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    // Obtener icono de categoría
    getCategoryIcon(category) {
        const icons = {
            'comunicacion': '💬',
            'estudiar': '📚',
            'proyectos': '🚀',
            'personal': '💪'
        };
        return icons[category] || '📝';
    }
    
    // Formatear fecha para el período
    formatDateForPeriod(period, date) {
        switch (period) {
            case 'daily':
                return date.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            case 'weekly':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return `${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            case 'monthly':
                return date.toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long' 
                });
            default:
                return date.toLocaleDateString('es-ES');
        }
    }
    
    // Obtener etiqueta del período
    getPeriodLabel(period) {
        const labels = {
            'daily': 'Diario',
            'weekly': 'Semanal',
            'monthly': 'Mensual'
        };
        return labels[period] || 'Historial';
    }
    
    // Formatear tiempo
    formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    addExampleTasks() {
        this.data.tasks.comunicacion = [
            { id: Date.now() + 1, name: 'Enviar mensaje a un amigo', points: 5, completed: false },
            { id: Date.now() + 2, name: 'Llamar a un familiar', points: 10, completed: false }
        ];
        this.data.tasks.estudiar = [
            { id: Date.now() + 3, name: 'Leer 15 minutos', points: 10, completed: false },
            { id: Date.now() + 4, name: 'Ver video educativo', points: 5, completed: false }
        ];
        this.data.tasks.proyectos = [
            { id: Date.now() + 5, name: 'Trabajar 30 min en proyecto', points: 20, completed: false }
        ];
        this.data.tasks.personal = [
            { id: Date.now() + 6, name: 'Caminar 20 minutos', points: 10, completed: false },
            { id: Date.now() + 7, name: 'Hacer ejercicio 15 min', points: 10, completed: false }
        ];
        this.saveData();
    }

    setupEventListeners() {
        document.getElementById('addTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
    }

    renderTasks() {
        this.categories.forEach(category => {
            const container = document.getElementById(`tasks-${category}`);
            const tasks = this.data.tasks[category];

            if (tasks.length === 0) {
                container.innerHTML = '<div class="empty-state">Sin tareas. ¡Añade una nueva!</div>';
                return;
            }

            container.innerHTML = tasks.map(task => `
                <div class="task ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                    <div class="task-status">
                        ${task.completed ? '✅' : '📝'}
                    </div>
                    <div class="task-name">${task.name}</div>
                    <div class="task-points">${task.points} XP</div>
                    <button class="task-delete" onclick="window.game.deleteTask('${category}', ${task.id})">×</button>
                </div>
            `).join('');

            this.updateCategoryProgress(category);
        });
    }

    updateCategoryProgress(category) {
        const tasks = this.data.tasks[category];
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        document.getElementById(`progress-${category}`).textContent = `${completed}/${total}`;
    }

    toggleTask(category, taskId) {
        const task = this.data.tasks[category].find(t => t.id === taskId);
        if (!task) return;

        if (!task.completed) {
            // Validar requisitos antes de completar tarea
            const validationResult = this.validateTaskCompletion();
            if (!validationResult.valid) {
                this.showTaskCompletionError(validationResult.message);
                return;
            }
            
            // Completar tarea
            task.completed = true;
            this.data.points += task.points;
            this.data.totalCompleted++;
            this.data.completedToday[category]++;
            
            this.showCelebration(task.points);
            this.checkLevelUp();
            this.checkAchievements();
            this.updateLastCompletedDate();
        } else {
            // Desmarcar tarea
            task.completed = false;
            this.data.points = Math.max(0, this.data.points - task.points);
            this.data.completedToday[category] = Math.max(0, this.data.completedToday[category] - 1);
        }

        this.saveData();
        this.renderTasks();
        this.updateStats();
        this.updateProgress();
        this.updateMotivation();
        this.updateDailyStats();
        this.updateGoalMultipliers();
    }

    // Validar requisitos para completar una tarea
    validateTaskCompletion() {
        // 1. Verificar que hay una tarea activa
        if (!this.data.activeTask) {
            return {
                valid: false,
                message: '🎯 Necesitas seleccionar una tarea activa primero. Ve a "Block Time" y selecciona una tarea para enfocarte.'
            };
        }

        // 2. Verificar que se ha completado al menos un pomodoro hoy
        if (this.data.pomodoro.pomodorosToday < 1) {
            return {
                valid: false,
                message: '🍅 Necesitas completar al menos un pomodoro antes de marcar tareas como completadas. ¡Usa el Block Time!'
            };
        }

        // 3. Verificar que se ha tomado al menos un descanso hoy
        if (!this.data.restData || !this.data.restData.lastRestTime) {
            return {
                valid: false,
                message: '☕ Necesitas tomar al menos un descanso antes de completar tareas. ¡Cuida tu bienestar!'
            };
        }

        // 4. Verificar que el descanso fue reciente (no más de 4 horas)
        const lastRestTime = new Date(this.data.restData.lastRestTime);
        const now = new Date();
        const hoursSinceRest = (now - lastRestTime) / (1000 * 60 * 60);
        
        if (hoursSinceRest > 4) {
            return {
                valid: false,
                message: '⏰ Tu último descanso fue hace más de 4 horas. ¡Tómate un descanso antes de continuar!'
            };
        }

        // 5. Verificar que la tarea que se quiere completar es la tarea activa
        const currentTask = this.data.tasks[this.data.activeTask.category].find(t => t.id === this.data.activeTask.id);
        if (!currentTask || currentTask.completed) {
            return {
                valid: false,
                message: '🎯 Solo puedes completar tu tarea activa actual. Ve a "Block Time" para ver cuál es tu tarea activa.'
            };
        }

        return { valid: true };
    }

    // Mostrar error de validación
    showTaskCompletionError(message) {
        // Crear modal de error personalizado
        const errorModal = document.createElement('div');
        errorModal.className = 'modal task-error-modal';
        errorModal.innerHTML = `
            <div class="modal-content task-error-content">
                <div class="error-header">
                    <span class="error-icon">⚠️</span>
                    <h2>Requisitos No Cumplidos</h2>
                </div>
                <div class="error-body">
                    <p class="error-message">${message}</p>
                    <div class="error-requirements">
                        <h3>📋 Para completar tareas necesitas:</h3>
                        <ul class="requirements-list">
                            <li>🎯 Tener una tarea activa seleccionada</li>
                            <li>🍅 Completar al menos un pomodoro</li>
                            <li>☕ Tomar al menos un descanso</li>
                            <li>⏰ Descanso reciente (máximo 4 horas)</li>
                        </ul>
                    </div>
                </div>
                <div class="error-actions">
                    <button class="error-btn primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Entendido
                    </button>
                    <button class="error-btn secondary" onclick="this.parentElement.parentElement.parentElement.remove(); window.game.showTaskSelector();">
                        Seleccionar Tarea Activa
                    </button>
                </div>
            </div>
        `;
        
        // Añadir estilos
        errorModal.style.cssText = `
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
        `;
        
        document.body.appendChild(errorModal);
        
        // Auto-cerrar después de 10 segundos
        setTimeout(() => {
            if (errorModal.parentNode) {
                errorModal.remove();
            }
        }, 10000);
    }

    deleteTask(category, taskId) {
        if (confirm('¿Seguro que quieres eliminar esta tarea?')) {
            const taskIndex = this.data.tasks[category].findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                const task = this.data.tasks[category][taskIndex];
                if (task.completed) {
                    this.data.points = Math.max(0, this.data.points - task.points);
                }
                this.data.tasks[category].splice(taskIndex, 1);
                this.saveData();
                this.renderTasks();
                this.updateStats();
                this.updateProgress();
            }
        }
    }

    updateStats() {
        document.getElementById('points').textContent = this.data.points;
        document.getElementById('level').textContent = this.data.level;
        document.getElementById('streak').textContent = this.data.streak;
        this.updatePerformanceGrade();
    }

    updateProgress() {
        const pointsForNextLevel = this.calculatePointsForLevel(this.data.level + 1);
        const currentLevelPoints = this.calculatePointsForLevel(this.data.level);
        const pointsInCurrentLevel = this.data.points - currentLevelPoints;
        const pointsNeeded = pointsForNextLevel - currentLevelPoints;
        const progress = (pointsInCurrentLevel / pointsNeeded) * 100;

        // Mejorar visibilidad para niveles bajos
        let displayProgress = progress;
        
        // Aplicar ancho mínimo para niveles bajos (1-3)
        if (this.data.level <= 3 && progress > 0) {
            displayProgress = Math.max(progress, 8); // Mínimo 8% de ancho para niveles bajos
        }
        
        // Para niveles muy bajos (1-2), usar un ancho mínimo más generoso
        if (this.data.level <= 2 && progress > 0) {
            displayProgress = Math.max(progress, 12); // Mínimo 12% para niveles 1-2
        }

        // Asegurar que siempre haya un ancho mínimo visible si hay progreso
        if (progress > 0 && displayProgress < 2) {
            displayProgress = 2; // Mínimo absoluto del 2%
        }

        const progressFill = document.getElementById('levelProgress');
        if (progressFill) {
            const finalWidth = Math.min(displayProgress, 100);
            progressFill.style.width = `${finalWidth}%`;
            progressFill.style.minWidth = '2px'; // Asegurar ancho mínimo
            
            // Aplicar clases visuales según el progreso
            if (progress < 5 && pointsInCurrentLevel > 0) {
                progressFill.classList.add('low-progress');
            } else {
                progressFill.classList.remove('low-progress');
            }
            
            // Forzar reflow para asegurar que el cambio se aplique
            progressFill.offsetHeight;
        }
        
        // Actualizar texto de puntos
        const currentPointsEl = document.getElementById('currentPoints');
        const nextLevelPointsEl = document.getElementById('nextLevelPoints');
        if (currentPointsEl) currentPointsEl.textContent = this.data.points;
        if (nextLevelPointsEl) nextLevelPointsEl.textContent = pointsForNextLevel;
        
        // Añadir indicador visual adicional para progreso muy bajo
        this.updateProgressIndicator(progress, pointsInCurrentLevel, pointsNeeded);
        
        // Debug: mostrar información en consola
        console.log(`📊 Progreso: ${progress.toFixed(2)}% -> ${displayProgress.toFixed(2)}% (Nivel ${this.data.level}, Puntos: ${this.data.points})`);
    }

    calculatePointsForLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    updateProgressIndicator(actualProgress, pointsInCurrentLevel, pointsNeeded) {
        const progressText = document.querySelector('.progress-text');
        
        // Añadir indicador visual para progreso muy bajo
        if (actualProgress < 5 && pointsInCurrentLevel > 0) {
            // Mostrar mensaje motivacional para progreso bajo
            const motivationMessages = [
                '¡Cada punto cuenta! 💪',
                '¡Sigue así! 🚀',
                '¡Progreso constante! ⭐',
                '¡Cada paso te acerca! 🎯'
            ];
            
            const randomMessage = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
            progressText.innerHTML = `<span style="color: var(--primary); font-weight: 700;">${randomMessage}</span><br><span id="currentPoints">${this.data.points}</span> / <span id="nextLevelPoints">${this.calculatePointsForLevel(this.data.level + 1)}</span> XP`;
            
            // Añadir clase especial para animación
            progressText.classList.add('low-progress-motivation');
        } else {
            // Texto normal
            progressText.innerHTML = `<span id="currentPoints">${this.data.points}</span> / <span id="nextLevelPoints">${this.calculatePointsForLevel(this.data.level + 1)}</span> XP`;
            progressText.classList.remove('low-progress-motivation');
        }
        
        // Añadir indicador de proximidad al siguiente nivel
        if (actualProgress > 80) {
            progressText.classList.add('near-level-up');
        } else {
            progressText.classList.remove('near-level-up');
        }
    }

    // Función de debug para probar diferentes niveles de progreso
    testProgressLevels() {
        console.log('🧪 Probando mejoras de barra de progreso...');
        
        // Simular diferentes escenarios
        const testScenarios = [
            { level: 1, points: 5, description: 'Nivel 1 con 5 puntos (progreso muy bajo)' },
            { level: 1, points: 15, description: 'Nivel 1 con 15 puntos (progreso bajo)' },
            { level: 2, points: 25, description: 'Nivel 2 con 25 puntos (progreso medio-bajo)' },
            { level: 3, points: 50, description: 'Nivel 3 con 50 puntos (progreso medio)' }
        ];
        
        testScenarios.forEach(scenario => {
            const pointsForNextLevel = this.calculatePointsForLevel(scenario.level + 1);
            const currentLevelPoints = this.calculatePointsForLevel(scenario.level);
            const pointsInCurrentLevel = scenario.points - currentLevelPoints;
            const pointsNeeded = pointsForNextLevel - currentLevelPoints;
            const progress = (pointsInCurrentLevel / pointsNeeded) * 100;
            
            console.log(`${scenario.description}:`);
            console.log(`  - Progreso real: ${progress.toFixed(2)}%`);
            console.log(`  - Puntos en nivel actual: ${pointsInCurrentLevel}`);
            console.log(`  - Puntos necesarios: ${pointsNeeded}`);
            console.log(`  - Ancho mínimo aplicado: ${scenario.level <= 2 ? '12%' : scenario.level <= 3 ? '8%' : '0%'}`);
            console.log('---');
        });
    }

    // Función de debug para verificar el estado actual de la barra
    debugProgressBar() {
        console.log('🔍 Debug de la barra de progreso:');
        
        const progressFill = document.getElementById('levelProgress');
        const progressBar = document.querySelector('.progress-bar');
        
        if (!progressFill) {
            console.error('❌ Elemento levelProgress no encontrado');
            return;
        }
        
        if (!progressBar) {
            console.error('❌ Elemento .progress-bar no encontrado');
            return;
        }
        
        console.log('✅ Elementos encontrados:');
        console.log(`  - levelProgress: ${progressFill ? '✅' : '❌'}`);
        console.log(`  - .progress-bar: ${progressBar ? '✅' : '❌'}`);
        console.log(`  - Ancho actual: ${progressFill.style.width || 'no definido'}`);
        console.log(`  - Clases CSS: ${progressFill.className}`);
        console.log(`  - Puntos actuales: ${this.data.points}`);
        console.log(`  - Nivel actual: ${this.data.level}`);
        
        // Verificar estilos computados
        const computedStyle = window.getComputedStyle(progressFill);
        console.log('📊 Estilos computados:');
        console.log(`  - width: ${computedStyle.width}`);
        console.log(`  - display: ${computedStyle.display}`);
        console.log(`  - visibility: ${computedStyle.visibility}`);
        console.log(`  - opacity: ${computedStyle.opacity}`);
        console.log(`  - background: ${computedStyle.background}`);
        
        // Forzar actualización
        this.updateProgress();
        console.log('🔄 Barra de progreso actualizada');
        
        // Verificar después de la actualización
        setTimeout(() => {
            const newComputedStyle = window.getComputedStyle(progressFill);
            console.log('📊 Después de actualización:');
            console.log(`  - width: ${newComputedStyle.width}`);
            console.log(`  - style.width: ${progressFill.style.width}`);
        }, 100);
    }

    updatePerformanceGrade() {
        const grade = this.calculatePerformanceGrade();
        const gradeElement = document.getElementById('performanceGrade');
        const previousGrade = gradeElement.textContent;
        
        // Debug: mostrar información del rendimiento
        const totalCompletedToday = Object.values(this.data.completedToday).reduce((a, b) => a + b, 0);
        const pomodorosToday = this.data.pomodoro.pomodorosToday;
        const focusTimeToday = this.data.pomodoro.focusTimeToday;
        const streak = this.data.streak;
        
        console.log('📊 Rendimiento actual:', {
            tareas: totalCompletedToday,
            pomodoros: pomodorosToday,
            tiempoEnfocado: focusTimeToday,
            racha: streak,
            calificacion: grade.letter,
            descripcion: grade.description
        });
        
        // Remover clases anteriores
        gradeElement.className = 'performance-grade';
        
        // Añadir nueva clase
        gradeElement.textContent = grade.letter;
        gradeElement.classList.add(`grade-${grade.letter}`);
        
        // Añadir tooltip con información
        gradeElement.title = `${grade.description}\n\nCriterios:\n${grade.criteria}`;
        
        // Notificar cambio de calificación si es una mejora
        if (previousGrade && previousGrade !== grade.letter) {
            this.showGradeChangeNotification(previousGrade, grade.letter, grade.description);
        }
    }

    showGradeChangeNotification(oldGrade, newGrade, description) {
        const gradeOrder = ['F', 'D', 'C', 'B', 'A'];
        const oldIndex = gradeOrder.indexOf(oldGrade);
        const newIndex = gradeOrder.indexOf(newGrade);
        
        if (newIndex > oldIndex) {
            // Mejora en la calificación
            const messages = {
                'A': '🏆 ¡CALIFICACIÓN PERFECTA! ¡Eres una máquina de productividad!',
                'B': '🎉 ¡Excelente trabajo! ¡Muy buen rendimiento!',
                'C': '👍 ¡Buen progreso! ¡Sigue así!',
                'D': '💪 ¡Mejorando! ¡Continúa con el buen trabajo!'
            };
            
            this.showNotification(messages[newGrade] || `¡Calificación mejorada a ${newGrade}!`, 'success');
        }
    }

    calculatePerformanceGrade() {
        const totalCompletedToday = Object.values(this.data.completedToday).reduce((a, b) => a + b, 0);
        const pomodorosToday = this.data.pomodoro.pomodorosToday;
        const focusTimeToday = this.data.pomodoro.focusTimeToday;
        const streak = this.data.streak;
        
        // Sistema de puntuación más motivador y realista
        let score = 0;
        
        // Tareas completadas (40% del peso) - Criterios más accesibles
        if (totalCompletedToday >= 5) score += 40;
        else if (totalCompletedToday >= 4) score += 35;
        else if (totalCompletedToday >= 3) score += 30;
        else if (totalCompletedToday >= 2) score += 25;
        else if (totalCompletedToday >= 1) score += 20;
        
        // Pomodoros completados (30% del peso) - Criterios más accesibles
        if (pomodorosToday >= 4) score += 30;
        else if (pomodorosToday >= 3) score += 25;
        else if (pomodorosToday >= 2) score += 20;
        else if (pomodorosToday >= 1) score += 15;
        
        // Tiempo de enfoque (20% del peso) - Criterios más accesibles
        if (focusTimeToday >= 90) score += 20; // 1.5+ horas
        else if (focusTimeToday >= 60) score += 18; // 1+ hora
        else if (focusTimeToday >= 30) score += 15; // 30+ minutos
        else if (focusTimeToday >= 15) score += 10; // 15+ minutos
        else if (focusTimeToday >= 5) score += 5; // 5+ minutos
        
        // Racha (10% del peso) - Criterios más accesibles
        if (streak >= 5) score += 10;
        else if (streak >= 3) score += 8;
        else if (streak >= 1) score += 5;
        
        // Determinar calificación con criterios más motivadores
        if (score >= 85) {
            return {
                letter: 'A',
                description: 'Excelente rendimiento',
                criteria: '5+ tareas, 4+ pomodoros, 1.5+ horas enfocado'
            };
        } else if (score >= 70) {
            return {
                letter: 'B',
                description: 'Muy buen rendimiento',
                criteria: '4+ tareas, 3+ pomodoros, 1+ hora enfocado'
            };
        } else if (score >= 55) {
            return {
                letter: 'C',
                description: 'Buen rendimiento',
                criteria: '3+ tareas, 2+ pomodoros, 30+ minutos enfocado'
            };
        } else if (score >= 40) {
            return {
                letter: 'D',
                description: 'Rendimiento regular',
                criteria: '2+ tareas, 1+ pomodoro, 15+ minutos enfocado'
            };
        } else if (score >= 20) {
            return {
                letter: 'E',
                description: 'Rendimiento básico',
                criteria: '1+ tarea o 1+ pomodoro completado'
            };
        } else {
            return {
                letter: 'F',
                description: 'Necesitas empezar',
                criteria: 'Completa tu primera tarea o pomodoro'
            };
        }
    }

    checkLevelUp() {
        const pointsForNextLevel = this.calculatePointsForLevel(this.data.level + 1);
        if (this.data.points >= pointsForNextLevel) {
            this.data.level++;
            this.showCelebration(0, true, this.data.level);
            this.playSound('levelup');
        }
    }

    updateLastCompletedDate() {
        this.data.lastCompletedDate = new Date().toDateString();
        this.saveData();
    }

    initDailySystem() {
        // Verificar que DailySystem esté disponible
        if (typeof DailySystem !== 'undefined') {
            this.dailySystem = new DailySystem(this);
        } else {
            console.warn('DailySystem no está disponible, usando sistema básico');
            this.dailySystem = {
                checkDailyStreak: () => {
                    // Sistema básico de rachas sin funcionalidades avanzadas
                    const today = new Date().toDateString();
                    const lastCompleted = this.data.lastCompletedDate;
                    
                    if (lastCompleted && lastCompleted !== today) {
                        const totalCompletedYesterday = Object.values(this.data.completedToday).reduce((a, b) => a + b, 0);
                        
                        if (totalCompletedYesterday >= 3) {
                            this.data.streak++;
                        } else {
                            this.data.streak = 0;
                        }
                        
                        this.data.completedToday = {
                            comunicacion: 0,
                            estudiar: 0,
                            proyectos: 0,
                            personal: 0
                        };
                        
                        this.data.pomodoro.pomodorosToday = 0;
                        this.data.pomodoro.focusTimeToday = 0;
                        this.data.activeTask = null;
                        
                        this.saveData();
                    }
                }
            };
        }
    }

    checkDailyStreak() {
        if (this.dailySystem && typeof this.dailySystem.checkDailyStreak === 'function') {
            this.dailySystem.checkDailyStreak();
        } else {
            console.warn('dailySystem no está disponible, saltando checkDailyStreak');
        }
    }

    initGoalsSystem() {
        // Inicializar metas por defecto si no existen
        if (!this.data.goals) {
            this.data.goals = {
                taskGoal: 5,
                pomodoroGoal: 4,
                timeGoal: 120
            };
            this.saveData();
        }
        
        // Cargar valores en los inputs
        document.getElementById('taskGoal').value = this.data.goals.taskGoal;
        document.getElementById('pomodoroGoal').value = this.data.goals.pomodoroGoal;
        document.getElementById('timeGoal').value = this.data.goals.timeGoal;
        
        // Configurar event listeners
        this.setupGoalsEventListeners();
        
        // Actualizar display de metas
        this.updateGoalsDisplay();
    }

    setupGoalsEventListeners() {
        // Event listeners para cambios en las metas
        document.getElementById('taskGoal').addEventListener('change', (e) => {
            this.data.goals.taskGoal = parseInt(e.target.value);
            this.saveData();
            this.updateGoalsDisplay();
        });
        
        document.getElementById('pomodoroGoal').addEventListener('change', (e) => {
            this.data.goals.pomodoroGoal = parseInt(e.target.value);
            this.saveData();
            this.updateGoalsDisplay();
        });
        
        document.getElementById('timeGoal').addEventListener('change', (e) => {
            this.data.goals.timeGoal = parseInt(e.target.value);
            this.saveData();
            this.updateGoalsDisplay();
        });
    }

    updateGoalsDisplay() {
        // Actualizar badges de metas
        const taskGoal = this.data.goals.taskGoal;
        const pomodoroGoal = this.data.goals.pomodoroGoal;
        const timeGoal = this.data.goals.timeGoal;
        
        document.getElementById('taskAchievement').innerHTML = `
            <span class="achievement-icon">🎯</span>
            <span class="achievement-text">Meta: ${taskGoal} tareas</span>
        `;
        
        document.getElementById('pomodoroAchievement').innerHTML = `
            <span class="achievement-icon">🎯</span>
            <span class="achievement-text">Meta: ${pomodoroGoal} pomodoros</span>
        `;
        
        document.getElementById('timeAchievement').innerHTML = `
            <span class="achievement-icon">🎯</span>
            <span class="achievement-text">Meta: ${timeGoal} minutos</span>
        `;
        
        // Actualizar multiplicadores
        this.updateGoalMultipliers();
    }

    updateGoalMultipliers() {
        const totalCompletedToday = Object.values(this.data.completedToday).reduce((a, b) => a + b, 0);
        const pomodorosToday = this.data.pomodoro.pomodorosToday;
        const focusTimeToday = this.data.pomodoro.focusTimeToday;
        
        // Calcular multiplicadores
        const taskMultiplier = Math.floor(totalCompletedToday / this.data.goals.taskGoal);
        const pomodoroMultiplier = Math.floor(pomodorosToday / this.data.goals.pomodoroGoal);
        const timeMultiplier = Math.floor(focusTimeToday / this.data.goals.timeGoal);
        
        // Actualizar elementos
        this.updateMultiplierDisplay('taskMultiplier', taskMultiplier, totalCompletedToday, this.data.goals.taskGoal);
        this.updateMultiplierDisplay('pomodoroMultiplier', pomodoroMultiplier, pomodorosToday, this.data.goals.pomodoroGoal);
        this.updateMultiplierDisplay('timeMultiplier', timeMultiplier, focusTimeToday, this.data.goals.timeGoal);
    }

    updateMultiplierDisplay(elementId, multiplier, current, goal) {
        const element = document.getElementById(elementId);
        const achievementValue = element.querySelector('.achievement-value');
        const achievementItem = element;
        
        // Remover clases anteriores
        achievementItem.classList.remove('achieved', 'multiplied');
        
        if (multiplier >= 1) {
            achievementValue.textContent = `${multiplier}x`;
            if (multiplier >= 2) {
                achievementItem.classList.add('multiplied');
            } else {
                achievementItem.classList.add('achieved');
            }
        } else {
            achievementValue.textContent = `${current}/${goal}`;
        }
    }

    initRestAlertSystem() {
        // Inicializar datos de descanso si no existen
        if (!this.data.restData) {
            this.data.restData = {
                lastRestTime: null,
                restQuality: 'good', // exhausted, tired, regular, good, excellent
                consecutiveWorkTime: 0, // minutos trabajando sin descanso
                totalRestTime: 0, // minutos totales de descanso hoy
                restSessions: 0 // número de sesiones de descanso hoy
            };
            this.saveData();
        }
        
        // Actualizar display inicial
        this.updateRestAlert();
        
        // Configurar timer para actualizar cada minuto
        setInterval(() => {
            this.updateRestAlert();
        }, 60000); // Cada minuto
    }

    initPushNotifications() {
        // Inicializar notificaciones push cuando el Service Worker esté listo
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(() => {
                // Configurar notificaciones push
                this.setupPushNotifications();
                
                // Configurar notificaciones de background
                this.handleBackgroundNotifications();
                
                // Configurar notificaciones persistentes
                this.setupPersistentNotifications();
                
                // Configurar notificaciones inteligentes
                this.setupSmartNotifications();
                
                console.log('✅ Sistema de notificaciones push inicializado');
            });
        } else {
            console.log('❌ Service Worker no soportado, notificaciones push deshabilitadas');
        }
    }

    updateRestAlert() {
        const now = new Date();
        const lastRest = this.data.restData.lastRestTime ? new Date(this.data.restData.lastRestTime) : null;
        
        // Calcular tiempo trabajando sin descanso
        if (lastRest) {
            const timeSinceRest = Math.floor((now - lastRest) / (1000 * 60)); // minutos
            this.data.restData.consecutiveWorkTime = timeSinceRest;
        } else {
            this.data.restData.consecutiveWorkTime = 0;
        }
        
        // Determinar calidad de descanso basada en tiempo trabajando
        let restQuality = this.calculateRestQuality();
        this.data.restData.restQuality = restQuality;
        
        // Actualizar UI
        this.updateRestThermometer(restQuality);
        this.updateRestStatus(restQuality);
        this.updateRestButtons(restQuality);
        
        this.saveData();
    }

    calculateRestQuality() {
        const consecutiveWork = this.data.restData.consecutiveWorkTime;
        const totalWorkToday = this.data.pomodoro.focusTimeToday;
        const pomodorosToday = this.data.pomodoro.pomodorosToday;
        
        // Factores que afectan la calidad de descanso
        let qualityScore = 50; // Base score
        
        // Tiempo trabajando sin descanso (más tiempo = peor calidad)
        if (consecutiveWork > 120) qualityScore -= 30; // 2+ horas sin descanso
        else if (consecutiveWork > 90) qualityScore -= 20; // 1.5+ horas sin descanso
        else if (consecutiveWork > 60) qualityScore -= 10; // 1+ hora sin descanso
        
        // Tiempo total trabajado hoy (más tiempo = necesita más descanso)
        if (totalWorkToday > 300) qualityScore -= 20; // 5+ horas trabajadas
        else if (totalWorkToday > 240) qualityScore -= 15; // 4+ horas trabajadas
        else if (totalWorkToday > 180) qualityScore -= 10; // 3+ horas trabajadas
        
        // Pomodoros completados (más pomodoros = más cansancio)
        if (pomodorosToday > 8) qualityScore -= 15; // 8+ pomodoros
        else if (pomodorosToday > 6) qualityScore -= 10; // 6+ pomodoros
        else if (pomodorosToday > 4) qualityScore -= 5; // 4+ pomodoros
        
        // Tiempo de descanso total hoy (más descanso = mejor calidad)
        if (this.data.restData.totalRestTime > 60) qualityScore += 20; // 1+ hora de descanso
        else if (this.data.restData.totalRestTime > 30) qualityScore += 10; // 30+ minutos de descanso
        
        // Determinar calidad basada en score
        if (qualityScore >= 80) return 'excellent';
        else if (qualityScore >= 60) return 'good';
        else if (qualityScore >= 40) return 'regular';
        else if (qualityScore >= 20) return 'tired';
        else return 'exhausted';
    }

    updateRestThermometer(quality) {
        const thermometer = document.getElementById('restThermometerFill');
        
        // Remover clases anteriores
        thermometer.classList.remove('exhausted', 'tired', 'regular', 'good', 'excellent');
        
        // Aplicar nueva clase
        thermometer.classList.add(quality);
    }

    updateRestStatus(quality) {
        const statusElement = document.getElementById('restStatus');
        const timeElement = document.getElementById('restTime');
        const iconElement = document.getElementById('restIcon');
        const alertContainer = document.querySelector('.rest-alert-compact');
        
        const statusTexts = {
            exhausted: 'Agotado',
            tired: 'Cansado',
            regular: 'Regular',
            good: 'Bueno',
            excellent: 'Excelente'
        };
        
        const statusIcons = {
            exhausted: '😵',
            tired: '😴',
            regular: '😐',
            good: '😊',
            excellent: '😄'
        };
        
        const statusColors = {
            exhausted: 'var(--gradient-danger)',
            tired: 'linear-gradient(135deg, #ef4444, #f87171)',
            regular: 'var(--gradient-warm)',
            good: 'var(--gradient-secondary)',
            excellent: 'linear-gradient(135deg, #10b981, #34d399)'
        };
        
        // Actualizar texto y icono
        statusElement.textContent = statusTexts[quality];
        iconElement.textContent = statusIcons[quality];
        
        // Actualizar colores
        statusElement.style.background = statusColors[quality];
        
        // Actualizar tiempo desde último descanso
        this.updateRestTime();
        
        // Aplicar efectos especiales para estados críticos
        if (quality === 'exhausted' || quality === 'tired') {
            alertContainer.classList.add('urgent');
        } else {
            alertContainer.classList.remove('urgent');
        }
    }

    updateRestTime() {
        const timeElement = document.getElementById('restTime');
        const lastRest = this.data.restData.lastRestTime ? new Date(this.data.restData.lastRestTime) : null;
        
        if (lastRest) {
            const now = new Date();
            const diffMinutes = Math.floor((now - lastRest) / (1000 * 60));
            
            if (diffMinutes < 60) {
                timeElement.textContent = `Último descanso: hace ${diffMinutes}m`;
            } else if (diffMinutes < 1440) {
                const hours = Math.floor(diffMinutes / 60);
                timeElement.textContent = `Último descanso: hace ${hours}h`;
            } else {
                const days = Math.floor(diffMinutes / 1440);
                timeElement.textContent = `Último descanso: hace ${days}d`;
            }
        } else {
            timeElement.textContent = 'Sin descansos registrados';
        }
    }

    updateRestButtons(quality) {
        const takeBreakBtn = document.getElementById('takeBreakBtn');
        const logRestBtn = document.getElementById('logRestBtn');
        
        // Configurar botón de descanso según la calidad
        if (quality === 'excellent') {
            takeBreakBtn.disabled = true;
            takeBreakBtn.innerHTML = '<span class="btn-icon">😄</span><span class="btn-text">Excelente</span>';
            takeBreakBtn.style.background = 'var(--gradient-secondary)';
            takeBreakBtn.style.opacity = '0.7';
        } else if (quality === 'exhausted') {
            takeBreakBtn.disabled = false;
            takeBreakBtn.innerHTML = '<span class="btn-icon">🚨</span><span class="btn-text">¡URGENTE!</span>';
            takeBreakBtn.style.background = 'var(--gradient-danger)';
            takeBreakBtn.style.opacity = '1';
            takeBreakBtn.style.animation = 'restGlow 1s infinite';
        } else if (quality === 'tired') {
            takeBreakBtn.disabled = false;
            takeBreakBtn.innerHTML = '<span class="btn-icon">😴</span><span class="btn-text">Descansar</span>';
            takeBreakBtn.style.background = 'linear-gradient(135deg, #ef4444, #f87171)';
            takeBreakBtn.style.opacity = '1';
        } else if (quality === 'regular') {
            takeBreakBtn.disabled = false;
            takeBreakBtn.innerHTML = '<span class="btn-icon">☕</span><span class="btn-text">Descansar</span>';
            takeBreakBtn.style.background = 'var(--gradient-warm)';
            takeBreakBtn.style.opacity = '1';
        } else {
            takeBreakBtn.disabled = false;
            takeBreakBtn.innerHTML = '<span class="btn-icon">☕</span><span class="btn-text">Descansar</span>';
            takeBreakBtn.style.background = 'var(--gradient-primary)';
            takeBreakBtn.style.opacity = '1';
        }
        
        // Configurar botón de registro
        logRestBtn.innerHTML = '<span class="btn-icon">📝</span><span class="btn-text">Registrar</span>';
        logRestBtn.style.background = 'var(--background-alt)';
        logRestBtn.style.opacity = '1';
    }

    takeBreak() {
        // Efecto visual antes de la acción
        const takeBreakBtn = document.getElementById('takeBreakBtn');
        takeBreakBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            takeBreakBtn.style.transform = 'scale(1)';
        }, 150);
        
        // Iniciar descanso automático
        if (this.pomodoroState && !this.pomodoroState.isRunning) {
            // Si no hay pomodoro corriendo, iniciar descanso
            this.startBreak();
            this.showRestNotification('☕ Descanso iniciado automáticamente', 'info');
        } else if (this.pomodoroState && this.pomodoroState.isRunning) {
            // Si hay pomodoro corriendo, pausar y sugerir descanso
            this.pausePomodoro();
            this.showRestNotification('⏸️ Pomodoro pausado. ¡Tómate un descanso!', 'warning');
        } else {
            // Iniciar descanso manual
            this.logRest();
        }
    }

    logRest() {
        // Efecto visual antes de la acción
        const logRestBtn = document.getElementById('logRestBtn');
        logRestBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            logRestBtn.style.transform = 'scale(1)';
        }, 150);
        
        // Registrar descanso manual
        const now = new Date();
        this.data.restData.lastRestTime = now.toISOString();
        this.data.restData.restSessions++;
        
        // Incrementar contador específico de la tarea activa
        if (this.data.activeTask) {
            this.data.activeTask.breaksTaken++;
        }
        
        // Calcular duración del descanso (mínimo 5 minutos)
        const restDuration = 5; // minutos
        this.data.restData.totalRestTime += restDuration;
        
        // Actualizar display
        this.updateRestAlert();
        
        // Actualizar requisitos de tarea activa
        this.updateTaskRequirements();
        
        // Mostrar notificación especial
        this.showRestNotification('😴 Descanso registrado. ¡Recarga tus energías!', 'success');
        
        // Dar puntos por descansar
        this.data.points += 5;
        this.updateStats();
        this.saveData();
        
        // Efecto de celebración
        this.showRestCelebration();
    }

    showRestNotification(message, type) {
        // Crear notificación personalizada para descanso
        const notification = document.createElement('div');
        notification.className = `rest-notification ${type}`;
        notification.innerHTML = `
            <div class="rest-notification-content">
                <span class="rest-notification-icon">${message.split(' ')[0]}</span>
                <span class="rest-notification-text">${message}</span>
            </div>
        `;
        
        // Agregar estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--gradient-secondary)' : 
                        type === 'warning' ? 'var(--gradient-warm)' : 'var(--gradient-primary)'};
            color: white;
            padding: var(--space-md) var(--space-lg);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showRestCelebration() {
        // Crear efecto de celebración
        const celebration = document.createElement('div');
        celebration.className = 'rest-celebration';
        celebration.innerHTML = '✨';
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            z-index: 1001;
            animation: restCelebration 1s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            document.body.removeChild(celebration);
        }, 1000);
    }

    initScrollSpy() {
        // Inicializar scroll spy después de que el DOM esté listo
        setTimeout(() => {
            if (typeof initScrollSpy === 'function') {
                initScrollSpy();
            }
        }, 100);
    }

    updateMotivation() {
        const totalCompletedToday = Object.values(this.data.completedToday).reduce((a, b) => a + b, 0);
        const messages = [
            { threshold: 0, text: '¡Completa tu primera tarea del día! 💪', icon: '🌅' },
            { threshold: 1, text: '¡Buen comienzo! Sigue así 🔥', icon: '🎯' },
            { threshold: 3, text: '¡Increíble progreso! Vas muy bien 🚀', icon: '⭐' },
            { threshold: 5, text: '¡Eres imparable! Sigue conquistando tareas 💎', icon: '🏆' },
            { threshold: 8, text: '¡Wow! Eres una máquina de productividad 🎉', icon: '👑' }
        ];

        const message = messages.reverse().find(m => totalCompletedToday >= m.threshold);
        document.getElementById('motivationText').textContent = message.text;
        document.querySelector('.motivation-icon').textContent = message.icon;

        // Incrementar racha si completa al menos 3 tareas
        if (totalCompletedToday >= 3 && this.data.lastCompletedDate !== new Date().toDateString()) {
            this.data.streak++;
            this.saveData();
            this.updateStats();
        }
    }

    checkAchievements() {
        const achievements = [
            { id: 'first_task', name: 'Primera Tarea', desc: 'Completa tu primera tarea', check: () => this.data.totalCompleted >= 1, icon: '🌟' },
            { id: 'streak_3', name: 'Racha de 3', desc: 'Mantén 3 días de racha', check: () => this.data.streak >= 3, icon: '🔥' },
            { id: 'level_5', name: 'Nivel 5', desc: 'Alcanza el nivel 5', check: () => this.data.level >= 5, icon: '🏆' },
            { id: 'complete_10', name: 'Veterano', desc: 'Completa 10 tareas', check: () => this.data.totalCompleted >= 10, icon: '⭐' },
            { id: 'complete_50', name: 'Maestro', desc: 'Completa 50 tareas', check: () => this.data.totalCompleted >= 50, icon: '👑' },
            { id: 'all_categories', name: 'Equilibrado', desc: 'Completa al menos una tarea en cada categoría en un día', check: () => {
                return this.data.completedToday.comunicacion > 0 &&
                       this.data.completedToday.estudiar > 0 &&
                       this.data.completedToday.proyectos > 0 &&
                       this.data.completedToday.personal > 0;
            }, icon: '🌈' }
        ];

        achievements.forEach(achievement => {
            if (achievement.check() && !this.data.achievements.includes(achievement.id)) {
                this.data.achievements.push(achievement.id);
                this.showAchievementNotification(achievement);
            }
        });

        this.saveData();
        this.renderAchievements();
    }

    renderAchievements() {
        const container = document.getElementById('achievements');
        const achievements = [
            { id: 'first_task', name: 'Primera Tarea', desc: 'Completa tu primera tarea', icon: '🌟' },
            { id: 'streak_3', name: 'Racha de 3', desc: 'Mantén 3 días de racha', icon: '🔥' },
            { id: 'level_5', name: 'Nivel 5', desc: 'Alcanza el nivel 5', icon: '🏆' },
            { id: 'complete_10', name: 'Veterano', desc: 'Completa 10 tareas', icon: '⭐' },
            { id: 'complete_50', name: 'Maestro', desc: 'Completa 50 tareas', icon: '👑' },
            { id: 'all_categories', name: 'Equilibrado', desc: 'Completa todas las categorías en un día', icon: '🌈' }
        ];

        const unlockedAchievements = achievements.filter(a => this.data.achievements.includes(a.id));
        
        if (unlockedAchievements.length === 0) {
            container.innerHTML = '<div class="empty-state">Completa tareas para desbloquear logros</div>';
            return;
        }

        container.innerHTML = unlockedAchievements.map(achievement => `
            <div class="achievement">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        `).join('');
    }

    showAchievementNotification(achievement) {
        setTimeout(() => {
            alert(`🏆 ¡Nuevo logro desbloqueado!\n\n${achievement.icon} ${achievement.name}\n${achievement.desc}`);
        }, 1000);
    }

    showCelebration(points, isLevelUp = false, newLevel = 0) {
        const modal = document.getElementById('celebrationModal');
        const title = document.getElementById('celebrationTitle');
        const message = document.getElementById('celebrationMessage');
        const pointsEarned = document.getElementById('pointsEarned');
        const icon = document.querySelector('.celebration-icon');

        if (isLevelUp) {
            icon.textContent = '🎊';
            title.textContent = '¡SUBISTE DE NIVEL!';
            message.textContent = `¡Ahora eres nivel ${newLevel}!`;
            pointsEarned.textContent = '🎉';
        } else {
            const messages = [
                '¡Increíble!', '¡Genial!', '¡Excelente!', '¡Fantástico!', 
                '¡Brutal!', '¡Asombroso!', '¡Magnífico!'
            ];
            icon.textContent = '🎉';
            title.textContent = messages[Math.floor(Math.random() * messages.length)];
            message.textContent = '¡Has completado una tarea!';
            pointsEarned.textContent = `+${points} XP`;
        }

        modal.style.display = 'block';
        
        // Cerrar automáticamente después de 2 segundos
        setTimeout(() => {
            modal.style.display = 'none';
        }, 2000);
    }

    playSound(type) {
        // Placeholder para efectos de sonido
        // Se pueden añadir sonidos reales con Web Audio API
    }

    // Método para añadir tarea
    addTask() {
        const category = document.getElementById('taskCategory').value;
        const name = document.getElementById('taskName').value.trim();
        const points = parseInt(document.getElementById('taskDifficulty').value);

        if (!name) return;

        const newTask = {
            id: Date.now(),
            name: name,
            points: points,
            completed: false
        };

        this.data.tasks[category].push(newTask);
        this.saveData();
        this.renderTasks();
        closeAddTaskModal();
    }

    // ========== POMODORO FUNCTIONALITY ==========
    
    initPomodoro() {
        // Asegurar que los datos del pomodoro existan
        if (!this.data.pomodoro) {
            this.data.pomodoro = {
                pomodorosToday: 0,
                focusTimeToday: 0,
                settings: {
                    workDuration: 25,
                    breakDuration: 5,
                    longBreakDuration: 15,
                    pomodorosUntilLongBreak: 4,
                    soundNotifications: {
                        enabled: true,
                        workCompleteSound: 'bell',        // Sonido al terminar trabajo
                        workStartSound: 'ding',           // Sonido al iniciar trabajo
                        breakStartSound: 'chime',         // Sonido al iniciar descanso corto
                        breakEndSound: 'ding',            // Sonido al terminar descanso corto
                        longBreakStartSound: 'gong',      // Sonido al iniciar descanso largo
                        longBreakEndSound: 'bell'         // Sonido al terminar descanso largo
                    }
                }
            };
            this.saveData();
        }
        
        // Asegurar que la estructura de sonidos exista en datos existentes
        if (!this.data.pomodoro.settings.soundNotifications) {
            this.data.pomodoro.settings.soundNotifications = {
                enabled: true,
                workCompleteSound: 'bell',        // Sonido al terminar trabajo
                workStartSound: 'ding',           // Sonido al iniciar trabajo
                breakStartSound: 'chime',         // Sonido al iniciar descanso corto
                breakEndSound: 'ding',            // Sonido al terminar descanso corto
                longBreakStartSound: 'gong',      // Sonido al iniciar descanso largo
                longBreakEndSound: 'bell'         // Sonido al terminar descanso largo
            };
            this.saveData();
        }
        
        this.pomodoroState = {
            isRunning: false,
            isPaused: false,
            isCompleting: false, // Flag para prevenir bucles
            currentMode: 'work', // 'work', 'break', 'longBreak'
            timeLeft: this.data.pomodoro.settings.workDuration * 60, // en segundos
            totalTime: this.data.pomodoro.settings.workDuration * 60,
            pomodoroCount: 0,
            intervalId: null,
            startTime: null, // Timestamp cuando se inició el pomodoro
            pausedTime: null, // Timestamp cuando se pausó
            totalPausedTime: 0 // Tiempo total pausado en segundos
        };
        
        this.updatePomodoroDisplay();
        this.updatePomodoroStats();
        this.setupPomodoroEventListeners();
        this.loadPomodoroSettings();
        this.updateActiveTaskDisplay();
        this.initializeTimerProgress();
        this.setupVisibilityDetection();
        this.loadPomodoroState();
        this.checkBackgroundTimer();
    }

    setupPomodoroEventListeners() {
        // Esperar un poco para asegurar que el DOM esté listo
        setTimeout(() => {
            this.attachPomodoroListeners();
        }, 100);
    }
    
    attachPomodoroListeners() {
        // Verificar que los elementos existan antes de agregar event listeners
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        console.log('🔗 Configurando event listeners del Pomodoro...');
        
        if (startBtn) {
            // Remover listener anterior si existe
            startBtn.removeEventListener('click', this.startPomodoro);
            startBtn.addEventListener('click', () => {
                console.log('▶️ Botón Iniciar presionado');
                this.startPomodoro();
            });
            console.log('✅ startBtn listener configurado');
        } else {
            console.error('❌ startBtn not found');
        }
        
        if (pauseBtn) {
            // Remover listener anterior si existe
            pauseBtn.removeEventListener('click', this.pausePomodoro);
            pauseBtn.addEventListener('click', () => {
                console.log('⏸️ Botón Pausar presionado');
                this.pausePomodoro();
            });
            console.log('✅ pauseBtn listener configurado');
        } else {
            console.error('❌ pauseBtn not found');
        }
        
        if (resetBtn) {
            // Remover listener anterior si existe
            resetBtn.removeEventListener('click', this.resetPomodoro);
            resetBtn.addEventListener('click', () => {
                console.log('🔄 Botón Reiniciar presionado');
                this.resetPomodoro();
            });
            console.log('✅ resetBtn listener configurado');
        } else {
            console.error('❌ resetBtn not found');
        }
        
        // Settings listeners
        document.getElementById('workDuration').addEventListener('change', (e) => {
            this.data.pomodoro.settings.workDuration = parseInt(e.target.value);
            this.saveData();
            if (!this.pomodoroState.isRunning) this.resetPomodoro();
        });
        
        document.getElementById('breakDuration').addEventListener('change', (e) => {
            this.data.pomodoro.settings.breakDuration = parseInt(e.target.value);
            this.saveData();
        });
        
        document.getElementById('longBreakDuration').addEventListener('change', (e) => {
            this.data.pomodoro.settings.longBreakDuration = parseInt(e.target.value);
            this.saveData();
        });
        
        document.getElementById('pomodorosUntilLongBreak').addEventListener('change', (e) => {
            this.data.pomodoro.settings.pomodorosUntilLongBreak = parseInt(e.target.value);
            this.saveData();
        });
        
        // Sound settings listeners
        document.getElementById('soundNotificationsEnabled').addEventListener('change', (e) => {
            this.data.pomodoro.settings.soundNotifications.enabled = e.target.checked;
            this.saveData();
        });
        
        document.getElementById('workCompleteSound').addEventListener('change', (e) => {
            this.data.pomodoro.settings.soundNotifications.workCompleteSound = e.target.value;
            this.saveData();
        });
        
        document.getElementById('breakStartSound').addEventListener('change', (e) => {
            this.data.pomodoro.settings.soundNotifications.breakStartSound = e.target.value;
            this.saveData();
        });
        
        document.getElementById('longBreakStartSound').addEventListener('change', (e) => {
            this.data.pomodoro.settings.soundNotifications.longBreakStartSound = e.target.value;
            this.saveData();
        });
        
        // Test sound button
        document.getElementById('testSoundBtn').addEventListener('click', () => {
            this.testAllSounds();
        });
    }

    loadPomodoroSettings() {
        const settings = this.data.pomodoro.settings;
        document.getElementById('workDuration').value = settings.workDuration;
        document.getElementById('breakDuration').value = settings.breakDuration;
        document.getElementById('longBreakDuration').value = settings.longBreakDuration;
        document.getElementById('pomodorosUntilLongBreak').value = settings.pomodorosUntilLongBreak;
        
        // Load sound settings
        if (settings.soundNotifications) {
            document.getElementById('soundNotificationsEnabled').checked = settings.soundNotifications.enabled;
            document.getElementById('workCompleteSound').value = settings.soundNotifications.workCompleteSound;
            document.getElementById('breakStartSound').value = settings.soundNotifications.breakStartSound;
            document.getElementById('longBreakStartSound').value = settings.soundNotifications.longBreakStartSound;
        }
    }

    // Función específica para iniciar sesión de TRABAJO (requiere tarea activa)
    startWorkSession() {
        console.log('🚀 Iniciando sesión de trabajo...');
        
        // 🎯 VALIDACIÓN: Verificar que hay una tarea activa seleccionada
        console.log('🔍 Debug - Estado de tarea activa:', this.data.activeTask);
        console.log('🔍 Debug - Datos completos:', this.data);
        
        if (!this.data.activeTask) {
            console.log('❌ No hay tarea activa seleccionada para trabajar');
            this.showNotification('🎯 Necesitas seleccionar una tarea activa para trabajar', 'error');
            this.showTaskSelector();
            return;
        }
        
        // Verificar que la tarea activa aún existe y no está completada
        const currentTask = this.data.tasks[this.data.activeTask.category].find(t => t.id === this.data.activeTask.id);
        console.log('🔍 Debug - Tarea encontrada:', currentTask);
        console.log('🔍 Debug - Categoría:', this.data.activeTask.category);
        console.log('🔍 Debug - ID:', this.data.activeTask.id);
        
        if (!currentTask || currentTask.completed) {
            console.log('❌ La tarea activa ya no existe o está completada');
            this.showNotification('❌ La tarea activa ya no está disponible. Selecciona una nueva tarea.', 'error');
            this.data.activeTask = null;
            this.updateActiveTaskDisplay();
            this.showTaskSelector();
            return;
        }
        
        // Preparar sesión de trabajo
        this.prepareWork();
        
        // Iniciar el timer
        this.startTimer();
        
        console.log(`🎯 Iniciando trabajo en: ${this.data.activeTask.name}`);
    }

    // Función específica para iniciar sesión de DESCANSO CORTO (no requiere tarea activa)
    startBreakSession() {
        console.log('☕ Iniciando sesión de descanso corto...');
        
        // Preparar sesión de descanso
        this.prepareBreak();
        
        // Iniciar el timer
        this.startTimer();
        
        console.log('☕ Descanso corto iniciado');
    }

    // Función específica para iniciar sesión de DESCANSO LARGO (no requiere tarea activa)
    startLongBreakSession() {
        console.log('🎉 Iniciando sesión de descanso largo...');
        
        // Preparar sesión de descanso largo
        this.prepareLongBreak();
        
        // Iniciar el timer
        this.startTimer();
        
        console.log('🎉 Descanso largo iniciado');
    }

    // Función común para iniciar el timer (sin validaciones)
    startTimer() {
        // Prevenir inicio si ya hay un timer corriendo
        if (this.pomodoroState.isRunning && !this.pomodoroState.isPaused) {
            console.log('⚠️ Timer ya está corriendo, ignorando inicio...');
            return;
        }
        
        if (this.pomodoroState.isPaused) {
            console.log('🔄 Reanudando pomodoro pausado...');
            this.resumePomodoro();
        } else {
            console.log('🚀 Iniciando timer...');
            
            // Asegurar que no hay intervalos previos
            if (this.pomodoroState.intervalId) {
                clearInterval(this.pomodoroState.intervalId);
                this.pomodoroState.intervalId = null;
            }
            
            // NO reproducir sonidos de inicio - solo al terminar ciclos
            console.log('🔇 Iniciando ciclo sin sonido - solo se reproduce sonido al terminar');
            
            this.pomodoroState.isRunning = true;
            this.pomodoroState.isPaused = false;
            this.pomodoroState.startTime = Date.now();
            this.pomodoroState.pausedTime = null;
            this.pomodoroState.totalPausedTime = 0;
            this.pomodoroState.lastTickTime = Date.now();
            this.pomodoroState.intervalId = setInterval(() => this.tick(), 100); // Más frecuente para suavidad
            
            // Cambiar botones: ocultar iniciar, mostrar pausar
            const startBtn = document.getElementById('startBtn');
            const pauseBtn = document.getElementById('pauseBtn');
            if (startBtn) startBtn.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = 'block';
            
            console.log('✅ Timer iniciado - Botón cambiado a "Pausar"');
            this.updateTimerDisplay();
            this.savePomodoroState();
        }
    }

    // Funciones específicas para iniciar timers (sin preparar ciclos)
    startWorkTimer() {
        console.log('🚀 Iniciando timer de trabajo...');
        
        // Validar tarea activa solo para trabajo
        if (!this.data.activeTask) {
            console.log('❌ No hay tarea activa seleccionada para trabajar');
            this.showNotification('🎯 Necesitas seleccionar una tarea activa para trabajar', 'error');
            this.showTaskSelector();
            return;
        }
        
        // Verificar que la tarea activa aún existe y no está completada
        const currentTask = this.data.tasks[this.data.activeTask.category].find(t => t.id === this.data.activeTask.id);
        if (!currentTask || currentTask.completed) {
            console.log('❌ La tarea activa ya no existe o está completada');
            this.showNotification('❌ La tarea activa ya no está disponible. Selecciona una nueva tarea.', 'error');
            this.data.activeTask = null;
            this.updateActiveTaskDisplay();
            this.showTaskSelector();
            return;
        }
        
        // Solo iniciar el timer (el ciclo ya fue preparado)
        this.startTimer();
        console.log(`🎯 Iniciando trabajo en: ${this.data.activeTask.name}`);
    }

    startBreakTimer() {
        console.log('☕ Iniciando timer de descanso corto...');
        
        // Para descansos, no validar tarea activa
        // Solo iniciar el timer (el ciclo ya fue preparado)
        this.startTimer();
        console.log('☕ Descanso corto iniciado');
    }

    startLongBreakTimer() {
        console.log('🎉 Iniciando timer de descanso largo...');
        
        // Para descansos largos, no validar tarea activa
        // Solo iniciar el timer (el ciclo ya fue preparado)
        this.startTimer();
        console.log('🎉 Descanso largo iniciado');
    }

    // Función principal que determina qué tipo de sesión iniciar
    startPomodoro() {
        console.log('▶️ Iniciando pomodoro...');
        
        // Prevenir inicio si ya hay un timer corriendo
        if (this.pomodoroState.isRunning) {
            console.log('⚠️ Timer ya está corriendo, ignorando inicio...');
            return;
        }
        
        // Prevenir inicio si se está completando una sesión
        if (this.pomodoroState.isCompleting) {
            console.log('⚠️ Se está completando una sesión, ignorando inicio...');
            return;
        }
        
        // Verificar si necesitamos preparar un nuevo ciclo
        if (this.pomodoroState.timeLeft <= 0 || this.pomodoroState.currentMode === 'idle') {
            console.log('🔄 Preparando nuevo ciclo...');
            this.prepareNextCycle();
        }
        
        // Determinar qué tipo de sesión iniciar basado en el modo actual
        // NOTA: No llamamos a las funciones específicas que preparan el ciclo
        // porque ya fue preparado en prepareNextCycle()
        switch (this.pomodoroState.currentMode) {
            case 'work':
                this.startWorkTimer();
                break;
            case 'break':
                this.startBreakTimer();
                break;
            case 'longBreak':
                this.startLongBreakTimer();
                break;
            default:
                // Si no hay modo definido, intentar iniciar trabajo
                console.log('⚠️ Modo no definido, intentando iniciar sesión de trabajo...');
                this.startWorkTimer();
                break;
        }
    }

    // Preparar el siguiente ciclo basado en el contexto actual
    prepareNextCycle() {
        console.log('🔄 Determinando siguiente ciclo...');
        
        // Si no hay modo actual o está en idle, determinar qué hacer
        if (!this.pomodoroState.currentMode || this.pomodoroState.currentMode === 'idle') {
            // Si hay tarea activa, preparar trabajo
            if (this.data.activeTask) {
                console.log('🚀 Preparando primer ciclo de trabajo (tarea activa disponible)...');
                this.prepareWork();
            } else {
                // Si no hay tarea activa, preparar descanso por defecto
                console.log('☕ No hay tarea activa, preparando descanso corto por defecto...');
                this.prepareBreak();
            }
            return;
        }
        
        // Si acabamos de completar trabajo, preparar descanso
        if (this.pomodoroState.currentMode === 'work') {
            if (this.pomodoroState.pomodoroCount % this.data.pomodoro.settings.pomodorosUntilLongBreak === 0) {
                console.log('🎉 Preparando descanso largo...');
                this.prepareLongBreak();
            } else {
                console.log('☕ Preparando descanso corto...');
                this.prepareBreak();
            }
            return;
        }
        
        // Si acabamos de completar descanso, preparar trabajo
        if (this.pomodoroState.currentMode === 'break' || this.pomodoroState.currentMode === 'longBreak') {
            // Solo preparar trabajo si hay tarea activa
            if (this.data.activeTask) {
                console.log('🚀 Preparando siguiente ciclo de trabajo (tarea activa disponible)...');
                this.prepareWork();
            } else {
                // Si no hay tarea activa después del descanso, preparar otro descanso
                console.log('☕ No hay tarea activa después del descanso, preparando otro descanso...');
                this.prepareBreak();
            }
            return;
        }
        
        // Fallback: si hay tarea activa, preparar trabajo; si no, descanso
        if (this.data.activeTask) {
            console.log('🚀 Fallback: Preparando ciclo de trabajo (tarea activa disponible)...');
            this.prepareWork();
        } else {
            console.log('☕ Fallback: Preparando descanso (no hay tarea activa)...');
            this.prepareBreak();
        }
    }

    pausePomodoro() {
        console.log('⏸️ Pausando pomodoro...');
        
        this.pomodoroState.isPaused = true;
        this.pomodoroState.isRunning = false;
        this.pomodoroState.pausedTime = Date.now();
        
        // Limpiar el intervalo del timer
        if (this.pomodoroState.intervalId) {
            clearInterval(this.pomodoroState.intervalId);
            this.pomodoroState.intervalId = null;
        }
        
        // Cambiar botones: mostrar iniciar, ocultar pausar
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        console.log('✅ Pomodoro pausado - Botón cambiado a "Iniciar"');
        this.savePomodoroState();
    }

    resumePomodoro() {
        console.log('🔄 Reanudando pomodoro...');
        
        // Solo validar tarea activa si estamos en modo de trabajo
        if (this.pomodoroState.currentMode === 'work') {
            // 🎯 VALIDACIÓN: Verificar que hay una tarea activa seleccionada para trabajo
            if (!this.data.activeTask) {
                console.log('❌ No hay tarea activa seleccionada para reanudar trabajo');
                this.showNotification('🎯 Necesitas seleccionar una tarea activa para trabajar', 'error');
                this.showTaskSelector();
                return;
            }
            
            // Verificar que la tarea activa aún existe y no está completada
            const currentTask = this.data.tasks[this.data.activeTask.category].find(t => t.id === this.data.activeTask.id);
            if (!currentTask || currentTask.completed) {
                console.log('❌ La tarea activa ya no existe o está completada');
                this.showNotification('❌ La tarea activa ya no está disponible. Selecciona una nueva tarea.', 'error');
                this.data.activeTask = null;
                this.updateActiveTaskDisplay();
                this.showTaskSelector();
                return;
            }
        }
        
        // Para descansos, no validar tarea activa
        this.pomodoroState.isRunning = true;
        this.pomodoroState.isPaused = false;
        
        // Calcular tiempo pausado y agregarlo al total
        if (this.pomodoroState.pausedTime) {
            const pausedDuration = Math.floor((Date.now() - this.pomodoroState.pausedTime) / 1000);
            this.pomodoroState.totalPausedTime += pausedDuration;
            this.pomodoroState.pausedTime = null;
            console.log(`⏱️ Tiempo pausado: ${pausedDuration} segundos`);
        }
        
        this.pomodoroState.lastTickTime = Date.now();
        this.pomodoroState.intervalId = setInterval(() => this.tick(), 100); // Más frecuente para suavidad
        
        // Cambiar botones: ocultar iniciar, mostrar pausar
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'block';
        
        console.log(`✅ Pomodoro reanudado (modo: ${this.pomodoroState.currentMode}) - Botón cambiado a "Pausar"`);
        if (this.data.activeTask) {
            console.log(`🎯 Tarea activa: ${this.data.activeTask.name}`);
        }
        this.savePomodoroState();
    }

    resetPomodoro() {
        this.pomodoroState.isRunning = false;
        this.pomodoroState.isPaused = false;
        this.pomodoroState.currentMode = 'work';
        this.pomodoroState.timeLeft = this.data.pomodoro.settings.workDuration * 60;
        this.pomodoroState.totalTime = this.data.pomodoro.settings.workDuration * 60;
        this.pomodoroState.startTime = null;
        this.pomodoroState.pausedTime = null;
        this.pomodoroState.totalPausedTime = 0;
        
        clearInterval(this.pomodoroState.intervalId);
        
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        this.initializeTimerProgress();
        this.updateTimerDisplay();
        this.updatePomodoroDisplay();
        this.savePomodoroState();
    }

    tick() {
        // Prevenir ejecución si ya se está completando
        if (this.pomodoroState.isCompleting) {
            return;
        }
        
        // Prevenir ejecución si el timer no está corriendo
        if (!this.pomodoroState.isRunning) {
            console.log('⚠️ Tick llamado pero timer no está corriendo, deteniendo...');
            if (this.pomodoroState.intervalId) {
                clearInterval(this.pomodoroState.intervalId);
                this.pomodoroState.intervalId = null;
            }
            return;
        }
        
        const now = Date.now();
        const timeSinceLastTick = now - this.pomodoroState.lastTickTime;
        
        // Solo actualizar si ha pasado al menos 1 segundo
        if (timeSinceLastTick >= 1000) {
            const secondsPassed = Math.floor(timeSinceLastTick / 1000);
            this.pomodoroState.timeLeft -= secondsPassed;
            this.pomodoroState.lastTickTime = now;
            
            // Actualizar display siempre para suavidad visual
            this.updateTimerDisplay();
            
            // Guardar estado cada 10 segundos para persistencia
            if (this.pomodoroState.timeLeft % 10 === 0) {
                this.savePomodoroState();
            }
        } else {
            // Actualizar display para suavidad visual incluso si no ha pasado 1 segundo
            this.updateTimerDisplay();
        }
        
        // Verificar si el tiempo se agotó
        if (this.pomodoroState.timeLeft <= 0) {
            this.pomodoroState.timeLeft = 0;
            this.updateTimerDisplay();
            
            // DETENER EL TIMER INMEDIATAMENTE
            if (this.pomodoroState.intervalId) {
                clearInterval(this.pomodoroState.intervalId);
                this.pomodoroState.intervalId = null;
            }
            
            // Marcar como no corriendo inmediatamente
            this.pomodoroState.isRunning = false;
            
            // Solo completar si no se está completando ya
            if (!this.pomodoroState.isCompleting) {
                this.completePomodoroSession();
            }
        }
    }

    completePomodoroSession() {
        // Prevenir ejecución múltiple
        if (this.pomodoroState.isCompleting) {
            console.log('⚠️ Ya se está completando una sesión, ignorando...');
            return;
        }
        
        this.pomodoroState.isCompleting = true;
        console.log('🛑 Iniciando finalización de sesión...');
        
        // Limpiar completamente el intervalo
        if (this.pomodoroState.intervalId) {
            clearInterval(this.pomodoroState.intervalId);
            this.pomodoroState.intervalId = null;
        }
        
        // Asegurar que el timer esté completamente detenido
        this.pomodoroState.isRunning = false;
        this.pomodoroState.startTime = null;
        this.pomodoroState.pausedTime = null;
        this.pomodoroState.totalPausedTime = 0;
        
        // Cambiar botón de pausar a iniciar inmediatamente
        this.updatePomodoroButtons();
        
        console.log('🛑 Timer detenido completamente, botón cambiado a "Iniciar"');
        
        // Ejecutar lógica específica según el modo actual
        if (this.pomodoroState.currentMode === 'work') {
            this.completeWorkSession();
        } else if (this.pomodoroState.currentMode === 'break' || this.pomodoroState.currentMode === 'longBreak') {
            this.completeBreakSession();
        }
        
        // Actualizar estadísticas globales
        this.updatePomodoroStats();
        this.updateDailyStats();
        this.updateGoalMultipliers();
        this.saveData();
        this.savePomodoroState();
        
        // Resetear flag inmediatamente - no necesitamos delay
        this.pomodoroState.isCompleting = false;
        console.log('🔄 Flag isCompleting reseteado inmediatamente, listo para nuevo ciclo');
    }

    completeWorkSession() {
        console.log('🍅 Completando sesión de trabajo...');
        
        // Incrementar contadores (SOLO UNA VEZ)
        this.pomodoroState.pomodoroCount++;
        this.data.pomodoro.pomodorosToday++;
        this.data.pomodoro.focusTimeToday += this.data.pomodoro.settings.workDuration;
        
        console.log(`📊 Pomodoros completados: ${this.pomodoroState.pomodoroCount}`);
        console.log(`📊 Pomodoros hoy: ${this.data.pomodoro.pomodorosToday}`);
        
        // Incrementar contador específico de la tarea activa
        if (this.data.activeTask) {
            this.data.activeTask.pomodorosCompleted = (this.data.activeTask.pomodorosCompleted || 0) + 1;
            console.log(`🎯 Pomodoros en tarea activa: ${this.data.activeTask.pomodorosCompleted}`);
        }
        
        // Ganar puntos por completar un pomodoro
        let pointsEarned = 15;
        
        // Bonus extra si hay tarea activa
        if (this.data.activeTask) {
            pointsEarned += 5; // Bonus por tener tarea activa
            this.showNotification(`🎯 +5 XP bonus por tarea activa!`, 'success');
        }
        
        this.data.points += pointsEarned;
        this.updateStats();
        this.updateProgress();
        
        // Actualizar requisitos de tarea activa
        this.updateTaskRequirements();
        
        // Mostrar celebración
        this.showPomodoroCelebration();
        
        // Reproducir sonido de trabajo completado
        this.playNotificationSound('workCompleteSound');
        
        // 🛑 DETENER COMPLETAMENTE - Requerir iniciación manual
        console.log('🛑 Ciclo de trabajo terminado - SE DETIENE COMPLETAMENTE');
        console.log('✅ No se prepara el siguiente ciclo automáticamente');
        console.log('👆 El usuario debe iniciar manualmente el siguiente paso');
        
        // Mostrar mensaje informativo sobre el siguiente paso
        const nextStep = this.pomodoroState.pomodoroCount % this.data.pomodoro.settings.pomodorosUntilLongBreak === 0 
            ? 'descanso largo' 
            : 'descanso corto';
        
        this.showNotification(`🎉 ¡Trabajo completado! Presiona "Iniciar" para ${nextStep}`, 'success');
    }

    completeBreakSession() {
        console.log('☕ Completando sesión de descanso...');
        
        // Incrementar contador específico de la tarea activa (SOLO UNA VEZ)
        if (this.data.activeTask) {
            this.data.activeTask.breaksTaken++;
            console.log(`🎯 Descansos en tarea activa: ${this.data.activeTask.breaksTaken}`);
        }
        
        // Actualizar requisitos de tarea activa
        this.updateTaskRequirements();
        
        // Reproducir sonido según el tipo de descanso
        if (this.pomodoroState.currentMode === 'longBreak') {
            this.playNotificationSound('longBreakEndSound');
            this.showLongBreakEndNotification();
        } else {
            this.playNotificationSound('breakEndSound');
            this.showBreakEndNotification();
        }
        
        // 🛑 DETENER COMPLETAMENTE - Requerir iniciación manual
        console.log('🛑 Ciclo de descanso terminado - SE DETIENE COMPLETAMENTE');
        console.log('✅ No se prepara el siguiente ciclo automáticamente');
        console.log('👆 El usuario debe iniciar manualmente el siguiente paso');
        
        // Mostrar mensaje informativo sobre el siguiente paso
        this.showNotification('🎉 ¡Descanso terminado! Presiona "Iniciar" para continuar trabajando', 'success');
    }

    prepareWork() {
        console.log('🚀 Preparando sesión de trabajo...');
        this.pomodoroState.currentMode = 'work';
        this.pomodoroState.timeLeft = this.data.pomodoro.settings.workDuration * 60;
        this.pomodoroState.totalTime = this.data.pomodoro.settings.workDuration * 60;
        this.pomodoroState.isRunning = false;
        this.pomodoroState.isPaused = false;
        this.pomodoroState.startTime = null;
        this.pomodoroState.pausedTime = null;
        this.pomodoroState.totalPausedTime = 0;
        
        // Limpiar cualquier intervalo existente
        if (this.pomodoroState.intervalId) {
            clearInterval(this.pomodoroState.intervalId);
            this.pomodoroState.intervalId = null;
        }
        
        this.updatePomodoroDisplay();
        this.updateTimerDisplay();
        
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        // NO reproducir sonido automáticamente - solo mostrar notificación visual
        this.showNotification('🚀 Sesión de trabajo preparada - Presiona "Iniciar" para comenzar', 'info');
        
        console.log('✅ Sesión de trabajo preparada - Presiona "Iniciar" para comenzar');
    }

    startWork() {
        console.log('🚀 Iniciando sesión de trabajo...');
        this.pomodoroState.currentMode = 'work';
        this.pomodoroState.timeLeft = this.data.pomodoro.settings.workDuration * 60;
        this.pomodoroState.totalTime = this.data.pomodoro.settings.workDuration * 60;
        this.pomodoroState.isRunning = false;
        this.pomodoroState.isPaused = false;
        this.pomodoroState.startTime = null;
        this.pomodoroState.pausedTime = null;
        this.pomodoroState.totalPausedTime = 0;
        
        // Limpiar cualquier intervalo existente
        if (this.pomodoroState.intervalId) {
            clearInterval(this.pomodoroState.intervalId);
            this.pomodoroState.intervalId = null;
        }
        
        this.updatePomodoroDisplay();
        this.updateTimerDisplay();
        
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        console.log('✅ Sesión de trabajo lista para iniciar');
    }

    startBreak() {
        console.log('☕ Iniciando descanso corto...');
        
        // Limpiar el intervalo del timer ANTES de cambiar el estado
        if (this.pomodoroState.intervalId) {
            clearInterval(this.pomodoroState.intervalId);
            this.pomodoroState.intervalId = null;
        }
        
        // Marcar como no corriendo para detener el tick
        this.pomodoroState.isRunning = false;
        
        this.pomodoroState.currentMode = 'break';
        this.pomodoroState.timeLeft = this.data.pomodoro.settings.breakDuration * 60;
        this.pomodoroState.totalTime = this.data.pomodoro.settings.breakDuration * 60;
        
        // Actualizar botones para mostrar "Iniciar" en lugar de "Pausar"
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        this.updatePomodoroDisplay();
        this.updateTimerDisplay();
        
        this.showBreakNotification();
    }

    startLongBreak() {
        console.log('🎉 Iniciando descanso largo...');
        
        // Limpiar el intervalo del timer ANTES de cambiar el estado
        if (this.pomodoroState.intervalId) {
            clearInterval(this.pomodoroState.intervalId);
            this.pomodoroState.intervalId = null;
        }
        
        // Marcar como no corriendo para detener el tick
        this.pomodoroState.isRunning = false;
        
        this.pomodoroState.currentMode = 'longBreak';
        this.pomodoroState.timeLeft = this.data.pomodoro.settings.longBreakDuration * 60;
        this.pomodoroState.totalTime = this.data.pomodoro.settings.longBreakDuration * 60;
        
        // Actualizar botones para mostrar "Iniciar" en lugar de "Pausar"
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        this.updatePomodoroDisplay();
        this.updateTimerDisplay();
        
        this.showLongBreakNotification();
    }

    prepareBreak() {
        console.log('☕ Preparando descanso corto...');
        
        // Limpiar el intervalo del timer ANTES de cambiar el estado
        if (this.pomodoroState.intervalId) {
            clearInterval(this.pomodoroState.intervalId);
            this.pomodoroState.intervalId = null;
        }
        
        // Marcar como no corriendo para detener el tick
        this.pomodoroState.isRunning = false;
        
        this.pomodoroState.currentMode = 'break';
        this.pomodoroState.timeLeft = this.data.pomodoro.settings.breakDuration * 60;
        this.pomodoroState.totalTime = this.data.pomodoro.settings.breakDuration * 60;
        
        // Actualizar botones para mostrar "Iniciar" en lugar de "Pausar"
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        this.updatePomodoroDisplay();
        this.updateTimerDisplay();
        
        // NO reproducir sonido automáticamente - solo mostrar notificación visual
        this.showNotification('☕ Descanso corto preparado - Presiona "Iniciar" para comenzar', 'info');
        console.log('✅ Descanso corto preparado - Presiona "Iniciar" para comenzar');
    }

    prepareLongBreak() {
        console.log('🎉 Preparando descanso largo...');
        
        // Limpiar el intervalo del timer ANTES de cambiar el estado
        if (this.pomodoroState.intervalId) {
            clearInterval(this.pomodoroState.intervalId);
            this.pomodoroState.intervalId = null;
        }
        
        // Marcar como no corriendo para detener el tick
        this.pomodoroState.isRunning = false;
        
        this.pomodoroState.currentMode = 'longBreak';
        this.pomodoroState.timeLeft = this.data.pomodoro.settings.longBreakDuration * 60;
        this.pomodoroState.totalTime = this.data.pomodoro.settings.longBreakDuration * 60;
        
        // Actualizar botones para mostrar "Iniciar" en lugar de "Pausar"
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        this.updatePomodoroDisplay();
        this.updateTimerDisplay();
        
        // NO reproducir sonido automáticamente - solo mostrar notificación visual
        this.showNotification('🎉 Descanso largo preparado - Presiona "Iniciar" para comenzar', 'info');
        console.log('✅ Descanso largo preparado - Presiona "Iniciar" para comenzar');
    }

    initializeTimerProgress() {
        // Inicializar el progreso circular en 0%
        const progressRing = document.querySelector('.progress-ring-fill');
        const progressGlow = document.querySelector('.progress-ring-glow');
        
        // Circunferencia para radio de 110 (240px de diámetro)
        const circumference = 691.15; // 2 * PI * 110
        
        if (progressRing) {
            progressRing.style.strokeDasharray = circumference;
            progressRing.style.strokeDashoffset = circumference;
        }
        if (progressGlow) {
            progressGlow.style.strokeDasharray = circumference;
            progressGlow.style.strokeDashoffset = circumference;
        }
    }

    updateTimerDisplay() {
        // Calcular tiempo restante con precisión
        const totalSeconds = Math.max(0, this.pomodoroState.timeLeft);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = timeString;
        } else {
            console.error('timerDisplay element not found');
        }
        
        // Calcular progreso y porcentaje
        const progress = ((this.pomodoroState.totalTime - this.pomodoroState.timeLeft) / this.pomodoroState.totalTime) * 100;
        const percentage = Math.round(progress);
        
        // Actualizar porcentaje
        const timerPercentage = document.getElementById('timerPercentage');
        if (timerPercentage) {
            timerPercentage.textContent = `${percentage}%`;
        } else {
            console.error('timerPercentage element not found');
        }
        
        // Actualizar progreso circular con animación suave
        // Usar la circunferencia correcta para el radio de 110 (240px de diámetro)
        const circumference = 691.15; // 2 * PI * 110
        const offset = circumference - (progress / 100) * circumference;
        
        const progressRing = document.querySelector('.progress-ring-fill');
        const progressGlow = document.querySelector('.progress-ring-glow');
        
        if (progressRing) {
            progressRing.style.strokeDashoffset = offset;
        }
        if (progressGlow) {
            progressGlow.style.strokeDashoffset = offset;
        }
        
        // Actualizar estadísticas diarias cuando el timer está corriendo
        if (this.pomodoroState.isRunning) {
            this.updateDailyStats();
        }
    }

    updatePomodoroDisplay() {
        const display = document.querySelector('.timer-display');
        display.className = 'timer-display';
        
        if (this.pomodoroState.currentMode === 'work') {
            display.classList.add('work-mode');
            document.getElementById('timerLabel').textContent = 'Trabajo';
        } else if (this.pomodoroState.currentMode === 'break') {
            display.classList.add('break-mode');
            document.getElementById('timerLabel').textContent = 'Descanso';
        } else if (this.pomodoroState.currentMode === 'longBreak') {
            display.classList.add('long-break-mode');
            document.getElementById('timerLabel').textContent = 'Descanso Largo';
        }
        
        this.updateTimerDisplay();
    }

    updatePomodoroStats() {
        // Verificar que los datos del pomodoro existan
        if (!this.data.pomodoro) {
            this.data.pomodoro = {
                pomodorosToday: 0,
                focusTimeToday: 0,
                settings: {
                    workDuration: 25,
                    breakDuration: 5,
                    longBreakDuration: 15,
                    pomodorosUntilLongBreak: 4
                }
            };
            this.saveData();
        }
        
        document.getElementById('pomodorosToday').textContent = this.data.pomodoro.pomodorosToday;
        
        const hours = Math.floor(this.data.pomodoro.focusTimeToday / 60);
        const minutes = this.data.pomodoro.focusTimeToday % 60;
        const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        document.getElementById('focusTime').textContent = timeString;
    }

    updatePomodoroButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        console.log('🔄 Actualizando botones del Pomodoro...');
        console.log('📊 Estado actual:', {
            isRunning: this.pomodoroState.isRunning,
            isPaused: this.pomodoroState.isPaused,
            isCompleting: this.pomodoroState.isCompleting,
            hasActiveTask: !!this.data.activeTask
        });
        
        if (startBtn && pauseBtn) {
            if (this.pomodoroState.isRunning && !this.pomodoroState.isPaused) {
                // Timer corriendo: mostrar botón Pausar
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'block';
                console.log('⏸️ Mostrando botón Pausar');
            } else {
                // Timer detenido o pausado: mostrar botón Iniciar
                startBtn.style.display = 'block';
                pauseBtn.style.display = 'none';
                
                // Deshabilitar botón si no hay tarea activa
                if (!this.data.activeTask) {
                    startBtn.disabled = true;
                    startBtn.style.opacity = '0.5';
                    startBtn.style.cursor = 'not-allowed';
                    startBtn.title = 'Selecciona una tarea activa primero';
                    console.log('❌ Botón Iniciar deshabilitado - sin tarea activa');
                } else {
                    startBtn.disabled = false;
                    startBtn.style.opacity = '1';
                    startBtn.style.cursor = 'pointer';
                    startBtn.title = 'Iniciar Pomodoro';
                    console.log('✅ Botón Iniciar habilitado - con tarea activa');
                }
            }
        }
    }

    // Configurar detección de visibilidad para manejar timer en background
    setupVisibilityDetection() {
        // Detectar cuando el usuario regresa a la aplicación
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.pomodoroState.isRunning) {
                this.checkBackgroundTimer();
            }
        });

        // Detectar cuando la ventana se enfoca
        window.addEventListener('focus', () => {
            if (this.pomodoroState.isRunning) {
                this.checkBackgroundTimer();
            }
        });

        // Detectar cuando la página se carga
        window.addEventListener('load', () => {
            if (this.pomodoroState.isRunning) {
                this.checkBackgroundTimer();
            }
        });
    }

    // Verificar y ajustar timer después de estar en background
    checkBackgroundTimer() {
        if (!this.pomodoroState.isRunning || !this.pomodoroState.startTime) {
            return;
        }

        const now = Date.now();
        const startTime = this.pomodoroState.startTime;
        const totalPausedTime = this.pomodoroState.totalPausedTime;
        
        // Calcular tiempo transcurrido real
        const elapsedTime = Math.floor((now - startTime) / 1000) - totalPausedTime;
        const remainingTime = this.pomodoroState.totalTime - elapsedTime;

        if (remainingTime <= 0) {
            // El pomodoro debería haber terminado
            this.pomodoroState.timeLeft = 0;
            this.updateTimerDisplay();
            this.completePomodoroSession();
        } else {
            // Actualizar tiempo restante y sincronizar lastTickTime
            this.pomodoroState.timeLeft = remainingTime;
            this.pomodoroState.lastTickTime = now;
            this.updateTimerDisplay();
        }
    }

    // Guardar estado del pomodoro para persistencia
    savePomodoroState() {
        if (this.pomodoroState.isRunning) {
            this.data.pomodoroState = {
                isRunning: this.pomodoroState.isRunning,
                isPaused: this.pomodoroState.isPaused,
                currentMode: this.pomodoroState.currentMode,
                timeLeft: this.pomodoroState.timeLeft,
                totalTime: this.pomodoroState.totalTime,
                startTime: this.pomodoroState.startTime,
                pausedTime: this.pomodoroState.pausedTime,
                totalPausedTime: this.pomodoroState.totalPausedTime,
                pomodoroCount: this.pomodoroState.pomodoroCount
            };
        } else {
            this.data.pomodoroState = null;
        }
        this.saveData();
    }

    // Cargar estado del pomodoro al inicializar
    loadPomodoroState() {
        if (this.data.pomodoroState && this.data.pomodoroState.isRunning) {
            this.pomodoroState = { ...this.pomodoroState, ...this.data.pomodoroState };
            
            // Verificar si el pomodoro debería haber terminado
            this.checkBackgroundTimer();
        }
    }

    resetTaskCounters() {
        // Reiniciar contadores específicos para la nueva tarea activa
        if (this.data.activeTask) {
            this.data.activeTask.pomodorosCompleted = 0;
            this.data.activeTask.breaksTaken = 0;
            this.data.activeTask.canComplete = false;
        }
        
        // También reiniciar contadores globales del día si es necesario
        // (opcional: comentar estas líneas si quieres mantener contadores globales)
        // this.data.pomodoro.pomodorosToday = 0;
        // this.data.pomodoro.focusTimeToday = 0;
        
        console.log('🔄 Contadores de tarea reiniciados');
    }

    // Función para limpiar completamente el storage
    clearAllData() {
        console.log('🗑️ Iniciando limpieza de datos...');
        
        try {
            // Limpiar localStorage
            localStorage.removeItem('taskQuestData');
            console.log('✅ localStorage limpiado');
            
            // Limpiar sessionStorage si existe
            sessionStorage.clear();
            console.log('✅ sessionStorage limpiado');
            
            // Limpiar cache del navegador si es posible
            if ('caches' in window) {
                caches.keys().then(function(names) {
                    console.log('🗑️ Limpiando caches:', names);
                    for (let name of names) {
                        caches.delete(name);
                    }
                });
            }
            
            // Limpiar también el estado del pomodoro guardado
            localStorage.removeItem('pomodoroState');
            localStorage.removeItem('restData');
            localStorage.removeItem('activeTask');
            
            console.log('✅ Todos los datos eliminados');
            
            // Mostrar notificación de éxito
            this.showNotification('🗑️ Todos los datos han sido eliminados. La página se recargará...', 'info');
            
            // Recargar la página después de un breve delay
            setTimeout(() => {
                console.log('🔄 Recargando página...');
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error al limpiar datos:', error);
            this.showNotification('❌ Error al limpiar datos. Intenta recargar la página manualmente.', 'error');
        }
    }

    // Función para mostrar modal de confirmación
    showClearDataModal() {
        console.log('🔍 Mostrando modal de limpiar datos...');
        
        // Verificar si ya existe un modal
        const existingModal = document.querySelector('.clear-data-modal');
        if (existingModal) {
            console.log('⚠️ Modal ya existe, removiendo...');
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal clear-data-modal';
        modal.innerHTML = `
            <div class="modal-content clear-data-content">
                <div class="clear-data-header">
                    <span class="clear-data-icon">🗑️</span>
                    <h2>Limpiar Todos los Datos</h2>
                </div>
                <div class="clear-data-body">
                    <p class="warning-message">⚠️ Esta acción eliminará TODOS los datos de la aplicación:</p>
                    <ul class="data-list">
                        <li>📊 Puntos y nivel</li>
                        <li>📝 Todas las tareas</li>
                        <li>🍅 Progreso de pomodoros</li>
                        <li>📈 Estadísticas históricas</li>
                        <li>🏆 Logros desbloqueados</li>
                        <li>🎯 Tarea activa actual</li>
                    </ul>
                    <p class="warning-text">Esta acción NO se puede deshacer.</p>
                </div>
                <div class="clear-data-actions">
                    <button class="clear-data-btn cancel-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Cancelar
                    </button>
                    <button class="clear-data-btn confirm-btn" onclick="window.game.clearAllData(); this.parentElement.parentElement.parentElement.remove();">
                        Eliminar Todo
                    </button>
                </div>
            </div>
        `;
        
        // Añadir estilos
        modal.style.cssText = `
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Cerrar modal al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
        console.log('✅ Modal agregado al DOM');
        
        // Auto-cerrar después de 30 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                console.log('⏰ Auto-cerrando modal...');
                modal.remove();
            }
        }, 30000);
    }

    showPomodoroCelebration() {
        const messages = [
            '¡Pomodoro completado! 🍅',
            '¡Excelente trabajo! 🎯',
            '¡Enfoque perfecto! ⚡',
            '¡Sigue así! 🚀'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        // Reproducir sonido de finalización de trabajo
        this.playNotificationSound('workCompleteSound');
        
        // Mostrar notificación temporal
        this.showNotification(message, 'success');
    }

    showBreakNotification() {
        // NO reproducir sonido de inicio - solo al terminar ciclos
        this.showNotification('¡Hora de descansar! 🧘‍♀️ Tómate 5 minutos', 'info');
    }

    showLongBreakNotification() {
        // NO reproducir sonido de inicio - solo al terminar ciclos
        this.showNotification('¡Descanso largo! 🎉 Tómate 15 minutos para recargar', 'info');
    }

    showBreakEndNotification() {
        // Reproducir sonido de fin de descanso
        this.playNotificationSound('breakEndSound');
        
        this.showNotification('¡Descanso terminado! 🚀 Hora de volver al trabajo', 'success');
    }

    showLongBreakEndNotification() {
        // Reproducir sonido de fin de descanso largo
        this.playNotificationSound('longBreakEndSound');
        
        this.showNotification('¡Descanso largo terminado! 🎉 Hora de volver al trabajo', 'success');
    }

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '🎉' : type === 'info' ? 'ℹ️' : '⚠️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Añadir estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#58b368' : type === 'info' ? '#6c63ff' : '#ff6b6b'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // ========== SOUND NOTIFICATIONS ==========
    
    playNotificationSound(soundType) {
        console.log(`🔊 Intentando reproducir sonido: ${soundType}`);
        
        // Asegurar que la estructura de sonidos exista
        if (!this.data.pomodoro.settings.soundNotifications) {
            this.data.pomodoro.settings.soundNotifications = {
                enabled: true,
                workCompleteSound: 'bell',        // Sonido al terminar trabajo
                workStartSound: 'ding',           // Sonido al iniciar trabajo
                breakStartSound: 'chime',         // Sonido al iniciar descanso corto
                breakEndSound: 'ding',            // Sonido al terminar descanso corto
                longBreakStartSound: 'gong',      // Sonido al iniciar descanso largo
                longBreakEndSound: 'bell'         // Sonido al terminar descanso largo
            };
            this.saveData();
        }
        
        // Verificar si las notificaciones de sonido están habilitadas
        if (!this.data.pomodoro.settings.soundNotifications.enabled) {
            console.log('🔇 Sonidos deshabilitados');
            return;
        }

        const soundName = this.data.pomodoro.settings.soundNotifications[soundType];
        if (!soundName) {
            console.log(`❌ Sonido no encontrado para tipo: ${soundType}`);
            return;
        }

        console.log(`🎵 Reproduciendo sonido: ${soundName}`);

        // Crear y reproducir el sonido con manejo de errores
        try {
            this.playSound(soundName);
            console.log(`✅ Sonido ${soundName} reproducido exitosamente`);
        } catch (error) {
            console.warn('❌ Error al reproducir sonido:', error);
            // Continuar sin sonido si hay error
        }
    }

    playSound(soundName) {
        try {
            // Verificar si ya tenemos un contexto de audio activo
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Iniciar el contexto de audio si está suspendido (requerido por navegadores modernos)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('🔊 Contexto de audio iniciado');
                    this.createSound(this.audioContext, soundName);
                }).catch(error => {
                    console.warn('❌ Error al iniciar contexto de audio:', error);
                    // Fallback: intentar crear un nuevo contexto
                    this.createFallbackSound(soundName);
                });
            } else {
                this.createSound(this.audioContext, soundName);
            }
        } catch (error) {
            console.warn('❌ Error al crear contexto de audio:', error);
            // Fallback: usar método alternativo
            this.createFallbackSound(soundName);
        }
    }

    // Método fallback para cuando Web Audio API no está disponible
    createFallbackSound(soundName) {
        try {
            // Crear un elemento de audio temporal con data URI
            const audioData = this.getSoundDataURI(soundName);
            if (audioData) {
                const audio = new Audio(audioData);
                audio.volume = 0.3;
                audio.play().catch(error => {
                    console.warn('❌ Error al reproducir sonido fallback:', error);
                });
            }
        } catch (error) {
            console.warn('❌ Error en fallback de sonido:', error);
        }
    }

    // Generar data URI para sonidos básicos
    getSoundDataURI(soundName) {
        // Sonidos básicos generados como ondas senoidales
        const soundConfigs = {
            bell: { frequency: 800, duration: 0.5, type: 'sine' },
            chime: { frequency: 1000, duration: 0.3, type: 'sine' },
            gong: { frequency: 200, duration: 1.0, type: 'sine' },
            beep: { frequency: 600, duration: 0.2, type: 'square' },
            ding: { frequency: 1200, duration: 0.4, type: 'sine' }
        };

        const config = soundConfigs[soundName];
        if (!config) return null;

        // Crear un contexto temporal para generar el sonido
        try {
            const tempContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = tempContext.createOscillator();
            const gainNode = tempContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(tempContext.destination);
            
            oscillator.frequency.setValueAtTime(config.frequency, tempContext.currentTime);
            oscillator.type = config.type;
            
            gainNode.gain.setValueAtTime(0.3, tempContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, tempContext.currentTime + config.duration);
            
            oscillator.start(tempContext.currentTime);
            oscillator.stop(tempContext.currentTime + config.duration);
            
            return true; // Indica que el sonido se reprodujo exitosamente
        } catch (error) {
            console.warn('❌ Error al generar sonido fallback:', error);
            return null;
        }
    }

    createSound(audioContext, soundName) {
        // Definir los sonidos disponibles
        const sounds = {
            bell: this.createBellSound,
            chime: this.createChimeSound,
            gong: this.createGongSound,
            beep: this.createBeepSound,
            ding: this.createDingSound
        };

        if (sounds[soundName]) {
            sounds[soundName](audioContext);
        }
    }

    createBellSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    createChimeSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    createGongSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1.0);
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1.0);
    }

    createBeepSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    createDingSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    }

    testAllSounds() {
        const sounds = ['bell', 'chime', 'gong', 'beep', 'ding'];
        let currentIndex = 0;
        
        const playNextSound = () => {
            if (currentIndex < sounds.length) {
                this.showNotification(`Probando sonido: ${sounds[currentIndex]}`, 'info');
                this.playSound(sounds[currentIndex]);
                currentIndex++;
                setTimeout(playNextSound, 1000); // 1 segundo entre sonidos
            } else {
                this.showNotification('¡Prueba de sonidos completada! 🎵', 'success');
            }
        };
        
        playNextSound();
    }

    // ========== ACTIVE TASK FUNCTIONALITY ==========
    
    updateActiveTaskDisplay() {
        const noActiveTask = document.getElementById('noActiveTask');
        const activeTaskDisplay = document.getElementById('activeTaskDisplay');
        
        if (this.data.activeTask) {
            noActiveTask.style.display = 'none';
            activeTaskDisplay.style.display = 'block';
            
            // Actualizar información de la tarea activa
            const categoryIcons = {
                comunicacion: '💬',
                estudiar: '📚',
                proyectos: '🚀',
                personal: '💪'
            };
            
            document.getElementById('activeTaskCategory').textContent = categoryIcons[this.data.activeTask.category];
            document.getElementById('activeTaskName').textContent = this.data.activeTask.name;
            document.getElementById('activeTaskPoints').textContent = `${this.data.activeTask.points} XP`;
            
            // Mostrar bloque de tiempo y requisitos
            this.updateTaskRequirements();
            
            // Añadir clase visual al timer
            document.querySelector('.timer-display').classList.add('with-active-task');
        } else {
            noActiveTask.style.display = 'block';
            activeTaskDisplay.style.display = 'none';
            
            // Remover clase visual del timer
            document.querySelector('.timer-display').classList.remove('with-active-task');
        }
        
        // Actualizar botones del Pomodoro basado en el estado de la tarea activa
        this.updatePomodoroButtons();
    }
    
    showTaskSelector() {
        this.renderTaskSelector();
        document.getElementById('taskSelectorModal').style.display = 'block';
    }
    
    renderTaskSelector() {
        const categories = ['comunicacion', 'estudiar', 'proyectos', 'personal'];
        let hasTasks = false;
        
        categories.forEach(category => {
            const container = document.getElementById(`selector-tasks-${category}`);
            const tasks = this.data.tasks[category].filter(task => !task.completed);
            
            if (tasks.length > 0) {
                hasTasks = true;
                container.innerHTML = tasks.map(task => `
                    <div class="selector-task" onclick="window.game.selectActiveTask('${category}', ${task.id})">
                        <span class="selector-task-icon">${this.getCategoryIcon(category)}</span>
                        <div class="selector-task-info">
                            <div class="selector-task-name">${task.name}</div>
                            <div class="selector-task-points">${task.points} XP</div>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="empty-state">Sin tareas pendientes</div>';
            }
        });
        
        // Mostrar mensaje si no hay tareas
        document.getElementById('noTasksMessage').style.display = hasTasks ? 'none' : 'block';
        document.querySelector('.task-selector-categories').style.display = hasTasks ? 'block' : 'none';
    }
    
    getCategoryIcon(category) {
        const icons = {
            comunicacion: '💬',
            estudiar: '📚',
            proyectos: '🚀',
            personal: '💪'
        };
        return icons[category] || '📝';
    }
    
    selectActiveTask(category, taskId) {
        const task = this.data.tasks[category].find(t => t.id === taskId);
        if (task) {
            const now = new Date();
            const timeBlock = this.calculateTimeBlock(now);
            
            // Verificar si ya hay una tarea activa
            if (this.data.activeTask) {
                const currentTask = this.data.tasks[this.data.activeTask.category].find(t => t.id === this.data.activeTask.id);
                if (currentTask && !currentTask.completed) {
                    // Permitir cambio de tarea pero con confirmación
                    this.showTaskChangeConfirmation(task, category, timeBlock);
                    return;
                }
            }
            
            // Si no hay tarea activa o la actual está completada, proceder normalmente
            this.setNewActiveTask(task, category, timeBlock);
        }
    }

    // Mostrar confirmación para cambiar tarea activa
    showTaskChangeConfirmation(newTask, category, timeBlock) {
        const currentTaskName = this.data.activeTask.name;
        const modal = document.createElement('div');
        modal.className = 'modal task-change-modal';
        modal.innerHTML = `
            <div class="modal-content task-change-content">
                <div class="task-change-header">
                    <span class="task-change-icon">🔄</span>
                    <h2>Cambiar Tarea Activa</h2>
                </div>
                <div class="task-change-body">
                    <p class="change-message">¿Quieres cambiar de tarea activa?</p>
                    <div class="task-comparison">
                        <div class="current-task">
                            <h3>📋 Tarea Actual</h3>
                            <p class="task-name">${currentTaskName}</p>
                            <div class="task-progress">
                                <span>🍅 Pomodoros: ${this.data.activeTask.pomodorosCompleted}/1</span>
                                <span>☕ Descansos: ${this.data.activeTask.breaksTaken}/1</span>
                            </div>
                        </div>
                        <div class="new-task">
                            <h3>🎯 Nueva Tarea</h3>
                            <p class="task-name">${newTask.name}</p>
                            <div class="task-warning">
                                <span>⚠️ Los contadores se reiniciarán a 0</span>
                            </div>
                        </div>
                    </div>
                    <p class="warning-text">Al cambiar de tarea, tendrás que completar 1 pomodoro y 1 descanso nuevamente para poder finalizar la nueva tarea.</p>
                </div>
                <div class="task-change-actions">
                    <button class="task-change-btn cancel-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Cancelar
                    </button>
                    <button class="task-change-btn confirm-btn" onclick="window.game.confirmTaskChange('${category}', '${newTask.id}')">
                        Cambiar Tarea
                    </button>
                </div>
            </div>
        `;
        
        // Añadir estilos
        modal.style.cssText = `
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
        `;
        
        document.body.appendChild(modal);
        
        // Auto-cerrar después de 30 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 30000);
    }

    // Confirmar cambio de tarea
    confirmTaskChange(category, taskId) {
        const task = this.data.tasks[category].find(t => t.id === taskId);
        if (task) {
            const now = new Date();
            const timeBlock = this.calculateTimeBlock(now);
            
            // Cerrar modal
            const modal = document.querySelector('.task-change-modal');
            if (modal) {
                modal.remove();
            }
            
            // Establecer nueva tarea activa
            this.setNewActiveTask(task, category, timeBlock);
            
            // Mostrar notificación de cambio
            this.showNotification(`🔄 Tarea cambiada: ${task.name}\n🔄 Contadores reiniciados`, 'info');
        }
    }

    // Establecer nueva tarea activa (función auxiliar)
    setNewActiveTask(task, category, timeBlock) {
        console.log('🎯 Estableciendo nueva tarea activa:', task.name);
        console.log('🎯 Categoría:', category);
        console.log('🎯 Bloque de tiempo:', timeBlock);
        
        // Reiniciar contadores específicos de la tarea
        this.resetTaskCounters();
        
        this.data.activeTask = {
            id: task.id,
            name: task.name,
            points: task.points,
            category: category,
            startTime: new Date().toISOString(),
            timeBlock: timeBlock,
            pomodorosCompleted: 0,
            breaksTaken: 0,
            canComplete: false
        };
        
        console.log('🎯 Tarea activa establecida:', this.data.activeTask);
        
        this.saveData();
        console.log('💾 Datos guardados en localStorage');
        
        this.updateActiveTaskDisplay();
        this.closeTaskSelector();
        
        // Mostrar notificación con bloque de tiempo
        this.showNotification(`🎯 Tarea activa: ${task.name}\n⏰ Bloque: ${timeBlock}\n🔄 Contadores reiniciados`, 'info');
    }
    
    // Cerrar el selector de tareas
    closeTaskSelector() {
        const modal = document.getElementById('taskSelectorModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Calcular bloque de tiempo (ej: 9:00-9:30, 9:30-10:00)
    calculateTimeBlock(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        // Redondear a bloques de 30 minutos
        const blockStart = Math.floor(minutes / 30) * 30;
        const blockEnd = blockStart + 30;
        
        const startHour = hours;
        const endHour = blockEnd >= 60 ? hours + 1 : hours;
        const endMinutes = blockEnd >= 60 ? blockEnd - 60 : blockEnd;
        
        const formatTime = (h, m) => {
            const hour = h.toString().padStart(2, '0');
            const min = m.toString().padStart(2, '0');
            return `${hour}:${min}`;
        };
        
        return `${formatTime(startHour, blockStart)} - ${formatTime(endHour, endMinutes)}`;
    }
    
    // Actualizar requisitos de la tarea activa
    updateTaskRequirements() {
        if (!this.data.activeTask) return;
        
        // Usar contadores específicos de la tarea activa
        const taskPomodoros = this.data.activeTask.pomodorosCompleted;
        const taskBreaks = this.data.activeTask.breaksTaken;
        
        // Los requisitos son: 1 pomodoro Y 1 descanso (sin verificar tiempo reciente)
        this.data.activeTask.canComplete = taskPomodoros >= 1 && taskBreaks >= 1;
        
        // Actualizar el estado del pomodoro
        const statusElement = document.getElementById('pomodoroStatus');
        if (statusElement) {
            let statusText = `⏰ Bloque: ${this.data.activeTask.timeBlock}\n`;
            statusText += `🍅 Pomodoros: ${taskPomodoros}/1 `;
            statusText += taskPomodoros >= 1 ? '✅' : '❌';
            statusText += `\n☕ Descansos: ${taskBreaks}/1 `;
            statusText += taskBreaks >= 1 ? '✅' : '❌';
            
            if (this.data.activeTask.canComplete) {
                statusText += `\n🎯 ¡Lista para completar!`;
                statusElement.style.color = '#10b981';
            } else {
                statusText += `\n⏳ Completa los requisitos para finalizar`;
                statusElement.style.color = '#f59e0b';
            }
            
            statusElement.textContent = statusText;
        }
        
        // Actualizar estado del botón de completar
        const completeBtn = document.getElementById('completeTaskBtn');
        if (completeBtn) {
            if (this.data.activeTask.canComplete) {
                completeBtn.disabled = false;
                completeBtn.className = 'finalize-task-btn';
                completeBtn.textContent = '✅ Completar Tarea';
            } else {
                completeBtn.disabled = true;
                completeBtn.className = 'finalize-task-btn requirements-btn';
                completeBtn.textContent = '⏳ Cumple requisitos';
            }
        }
        
        this.saveData();
    }
    
    // Verificar si hay un descanso reciente
    checkRecentBreak() {
        if (!this.data.restData || !this.data.restData.lastRestTime) return false;
        
        const lastRestTime = new Date(this.data.restData.lastRestTime);
        const now = new Date();
        const hoursSinceRest = (now - lastRestTime) / (1000 * 60 * 60);
        
        return hoursSinceRest <= 4;
    }
    
    clearActiveTask() {
        this.data.activeTask = null;
        this.saveData();
        this.updateActiveTaskDisplay();
        this.showNotification('🧹 Tarea activa eliminada', 'info');
    }
    
    completeActiveTask() {
        if (!this.data.activeTask) {
            this.showNotification('❌ No hay tarea activa seleccionada', 'error');
            return;
        }

        // Verificar si la tarea puede completarse
        if (!this.data.activeTask.canComplete) {
            this.showTaskCompletionError('⏳ Necesitas completar 1 pomodoro y tomar 1 descanso antes de finalizar la tarea');
            return;
        }

        // Encontrar la tarea en el listado
        const task = this.data.tasks[this.data.activeTask.category].find(t => t.id === this.data.activeTask.id);
        if (!task) {
            this.showNotification('❌ Tarea no encontrada', 'error');
            return;
        }

        if (task.completed) {
            this.showNotification('✅ Esta tarea ya está completada', 'info');
            return;
        }

        // Completar la tarea
        task.completed = true;
        this.data.points += task.points;
        this.data.totalCompleted++;
        this.data.completedToday[this.data.activeTask.category]++;
        
        // Preparar datos para el historial
        const completionData = {
            pomodorosUsed: this.data.activeTask.pomodorosCompleted || 0,
            breaksTaken: this.data.activeTask.breaksTaken || 0,
            totalTimeSpent: this.data.activeTask.totalTimeSpent || 0,
            efficiency: this.calculateTaskEfficiency(this.data.activeTask)
        };
        
        // Registrar en el historial
        this.recordTaskCompletion(task, completionData);
        
        // Limpiar tarea activa después de completarla
        this.data.activeTask = null;
        
        // Mostrar celebración
        this.showCelebration(task.points);
        this.checkLevelUp();
        this.checkAchievements();
        this.updateLastCompletedDate();
        
        // Actualizar displays
        this.saveData();
        this.renderTasks();
        this.updateStats();
        this.updateProgress();
        this.updateMotivation();
        this.updateDailyStats();
        this.updateGoalMultipliers();
        this.updateActiveTaskDisplay();
        
        // Mostrar notificación de éxito
        this.showNotification(`🎉 ¡Tarea completada! +${task.points} XP`, 'success');
    }

    // Actualizar estadísticas diarias
    updateDailyStats() {
        const totalCompletedToday = Object.values(this.data.completedToday).reduce((a, b) => a + b, 0);
        const pomodorosToday = this.data.pomodoro.pomodorosToday;
        const focusTimeToday = this.data.pomodoro.focusTimeToday;
        
        // Actualizar valores principales
        document.getElementById('todayTasks').textContent = totalCompletedToday;
        document.getElementById('todayPomodoros').textContent = pomodorosToday;
        
        const hours = Math.floor(focusTimeToday / 60);
        const minutes = focusTimeToday % 60;
        const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        document.getElementById('todayFocusTime').textContent = timeString;
        
        // Calcular eficiencia
        const efficiency = this.calculateEfficiency(totalCompletedToday, pomodorosToday, focusTimeToday);
        document.getElementById('todayEfficiency').textContent = `${efficiency}%`;
        
        // Actualizar barras de progreso
        this.updateProgressBars(totalCompletedToday, pomodorosToday, focusTimeToday, efficiency);
    }

    calculateEfficiency(tasks, pomodoros, focusTime) {
        // Sistema de eficiencia basado en múltiples factores
        let score = 0;
        
        // Tareas (40%)
        if (tasks >= 8) score += 40;
        else if (tasks >= 6) score += 35;
        else if (tasks >= 4) score += 30;
        else if (tasks >= 3) score += 25;
        else if (tasks >= 2) score += 20;
        else if (tasks >= 1) score += 15;
        
        // Pomodoros (30%)
        if (pomodoros >= 6) score += 30;
        else if (pomodoros >= 4) score += 25;
        else if (pomodoros >= 3) score += 20;
        else if (pomodoros >= 2) score += 15;
        else if (pomodoros >= 1) score += 10;
        
        // Tiempo de enfoque (30%)
        if (focusTime >= 120) score += 30; // 2+ horas
        else if (focusTime >= 90) score += 25; // 1.5+ horas
        else if (focusTime >= 60) score += 20; // 1+ hora
        else if (focusTime >= 30) score += 15; // 30+ minutos
        else if (focusTime >= 15) score += 10; // 15+ minutos
        
        return Math.min(score, 100);
    }

    updateProgressBars(tasks, pomodoros, focusTime, efficiency) {
        // Progreso de tareas (meta: 5 tareas)
        const tasksProgress = Math.min((tasks / 5) * 100, 100);
        document.getElementById('tasksProgress').style.width = `${tasksProgress}%`;
        document.getElementById('tasksProgressText').textContent = `${tasks}/5`;
        
        // Progreso de pomodoros (meta: 4 pomodoros)
        const pomodorosProgress = Math.min((pomodoros / 4) * 100, 100);
        document.getElementById('pomodorosProgress').style.width = `${pomodorosProgress}%`;
        document.getElementById('pomodorosProgressText').textContent = `${pomodoros}/4`;
        
        // Progreso de tiempo enfocado (meta: 120 minutos)
        const focusProgress = Math.min((focusTime / 120) * 100, 100);
        document.getElementById('focusProgress').style.width = `${focusProgress}%`;
        document.getElementById('focusProgressText').textContent = `${focusTime}/120m`;
        
        // Progreso de eficiencia
        document.getElementById('efficiencyProgress').style.width = `${efficiency}%`;
        document.getElementById('efficiencyProgressText').textContent = `${efficiency}/100%`;
    }

    // Actualizar estadísticas históricas
    updateHistoricalStats() {
        if (this.dailySystem && typeof this.dailySystem.getWeeklyStats === 'function') {
            const weekStats = this.dailySystem.getWeeklyStats();
            const monthStats = this.dailySystem.getMonthlyStats();
            
            if (weekStats) {
                document.getElementById('weekTasks').textContent = weekStats.totalTasks;
                document.getElementById('weekPomodoros').textContent = weekStats.totalPomodoros;
                const hours = Math.floor(weekStats.totalFocusTime / 60);
                const minutes = weekStats.totalFocusTime % 60;
                document.getElementById('weekFocusTime').textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                document.getElementById('weekAverage').textContent = weekStats.averageTasks;
            }
            
            if (monthStats) {
                document.getElementById('monthTasks').textContent = monthStats.totalTasks;
                document.getElementById('monthPomodoros').textContent = monthStats.totalPomodoros;
                const hours = Math.floor(monthStats.totalFocusTime / 60);
                const minutes = monthStats.totalFocusTime % 60;
                document.getElementById('monthFocusTime').textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                document.getElementById('monthAverage').textContent = monthStats.averageTasks;
            }
        } else {
            // Mostrar valores por defecto si no hay sistema diario
            document.getElementById('weekTasks').textContent = '0';
            document.getElementById('weekPomodoros').textContent = '0';
            document.getElementById('weekFocusTime').textContent = '0m';
            document.getElementById('weekAverage').textContent = '0';
            
            document.getElementById('monthTasks').textContent = '0';
            document.getElementById('monthPomodoros').textContent = '0';
            document.getElementById('monthFocusTime').textContent = '0m';
            document.getElementById('monthAverage').textContent = '0';
        }
    }

    // ========== VERSION DISPLAY ==========
    
    displayVersion() {
        // Crear elemento de versión si no existe
        let versionElement = document.getElementById('app-version');
        if (!versionElement) {
            versionElement = document.createElement('div');
            versionElement.id = 'app-version';
            versionElement.className = 'app-version';
            versionElement.innerHTML = `
                <span class="version-label">TaskQuest</span>
                <span class="version-number">v${this.version}</span>
            `;
            
            // Agregar al final del body
            document.body.appendChild(versionElement);
        } else {
            // Actualizar versión si ya existe
            const versionNumber = versionElement.querySelector('.version-number');
            if (versionNumber) {
                versionNumber.textContent = `v${this.version}`;
            }
        }
        
        console.log(`📱 TaskQuest v${this.version} inicializado`);
    }

    // ========== PUSH NOTIFICATIONS & SERVICE WORKER INTEGRATION ==========

    // Configurar notificaciones push
    setupPushNotifications() {
        console.log('🔔 Configurando notificaciones push...');
        
        // Verificar soporte
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('❌ Push notifications no soportadas en este navegador');
            return;
        }

        // Configurar notificaciones para timers
        this.setupTimerNotifications();
        
        // Configurar notificaciones para tareas
        this.setupTaskNotifications();
        
        console.log('✅ Notificaciones push configuradas');
    }

    // Configurar notificaciones de timer
    setupTimerNotifications() {
        // Interceptar cuando se inicia un timer
        const originalStartWork = this.startWork.bind(this);
        this.startWork = () => {
            originalStartWork();
            this.notifyServiceWorker('START_TIMER', {
                type: 'work',
                duration: this.pomodoroState.totalTime,
                startTime: Date.now()
            });
        };

        const originalStartBreak = this.startBreak.bind(this);
        this.startBreak = () => {
            originalStartBreak();
            this.notifyServiceWorker('START_TIMER', {
                type: 'break',
                duration: this.pomodoroState.totalTime,
                startTime: Date.now()
            });
        };

        const originalStartLongBreak = this.startLongBreak.bind(this);
        this.startLongBreak = () => {
            originalStartLongBreak();
            this.notifyServiceWorker('START_TIMER', {
                type: 'longBreak',
                duration: this.pomodoroState.totalTime,
                startTime: Date.now()
            });
        };

        // Interceptar cuando se detiene un timer
        const originalPausePomodoro = this.pausePomodoro.bind(this);
        this.pausePomodoro = () => {
            originalPausePomodoro();
            this.notifyServiceWorker('STOP_TIMER');
        };

        const originalResetPomodoro = this.resetPomodoro.bind(this);
        this.resetPomodoro = () => {
            originalResetPomodoro();
            this.notifyServiceWorker('STOP_TIMER');
        };
    }

    // Configurar notificaciones de tareas
    setupTaskNotifications() {
        // Añadir recordatorios a tareas
        this.setupTaskReminders();
    }

    // Configurar recordatorios de tareas
    setupTaskReminders() {
        // Interceptar cuando se añade una tarea
        const originalAddTask = this.addTask.bind(this);
        this.addTask = () => {
            originalAddTask();
            this.scheduleTaskReminders();
        };
    }

    // Programar recordatorios de tareas
    scheduleTaskReminders() {
        if (!this.data.tasks) return;

        const reminders = [];
        
        // Crear recordatorios para tareas no completadas
        Object.keys(this.data.tasks).forEach(category => {
            this.data.tasks[category].forEach(task => {
                if (!task.completed) {
                    // Recordatorio después de 2 horas de inactividad
                    const reminderTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
                    reminders.push({
                        id: `task-${task.id}`,
                        taskName: task.name,
                        category: category,
                        time: reminderTime.toISOString(),
                        sent: false
                    });
                }
            });
        });

        // Guardar recordatorios
        this.data.reminders = reminders;
        this.saveData();
    }

    // Notificar al Service Worker
    notifyServiceWorker(type, data = {}) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: type,
                ...data
            });
        }
    }

    // Sincronizar con Service Worker
    syncWithServiceWorker() {
        console.log('🔄 Sincronizando con Service Worker...');
        
        // Enviar estado actual del pomodoro
        if (this.pomodoroState && this.pomodoroState.isRunning) {
            this.notifyServiceWorker('START_TIMER', {
                type: this.pomodoroState.currentMode,
                duration: this.pomodoroState.totalTime,
                startTime: this.pomodoroState.startTime,
                timeLeft: this.pomodoroState.timeLeft
            });
        }

        // Enviar recordatorios de tareas
        if (this.data.reminders) {
            this.notifyServiceWorker('UPDATE_REMINDERS', {
                reminders: this.data.reminders
            });
        }
    }

    // Enviar notificación push personalizada
    async sendPushNotification(title, body, options = {}) {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('❌ Push notifications no disponibles');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            
            await registration.showNotification(title, {
                body: body,
                icon: '/favicon.svg',
                badge: '/favicon.svg',
                tag: 'taskquest-notification',
                requireInteraction: true,
                ...options
            });
            
            console.log('✅ Notificación push enviada:', title);
        } catch (error) {
            console.error('❌ Error al enviar notificación push:', error);
        }
    }

    // Manejar notificaciones cuando la app está en background
    handleBackgroundNotifications() {
        // Escuchar mensajes del Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                const { type, data } = event.data;
                
                switch (type) {
                    case 'TIMER_COMPLETE':
                        this.handleTimerCompleteFromBackground(data);
                        break;
                    case 'TASK_REMINDER':
                        this.handleTaskReminderFromBackground(data);
                        break;
                }
            });
        }
    }

    // Manejar timer completado desde background
    handleTimerCompleteFromBackground(data) {
        console.log('🍅 Timer completado desde background:', data);
        
        // Actualizar estado local
        if (this.pomodoroState) {
            this.pomodoroState.isRunning = false;
            this.pomodoroState.isCompleting = true;
        }
        
        // Mostrar notificación local
        const messages = {
            'work': '¡Tiempo de trabajo terminado! Tómate un descanso.',
            'break': '¡Hora de volver al trabajo!',
            'longBreak': '¡Recargado y listo para continuar!'
        };
        
        this.showNotification(messages[data.type] || 'Timer completado', 'success');
        
        // Reproducir sonido
        this.playNotificationSound('workCompleteSound');
    }

    // Manejar recordatorio de tarea desde background
    handleTaskReminderFromBackground(data) {
        console.log('📝 Recordatorio de tarea desde background:', data);
        
        this.showNotification(`No olvides: ${data.taskName}`, 'info');
    }

    // Configurar notificaciones persistentes
    setupPersistentNotifications() {
        // Notificación cada 30 minutos si hay tareas pendientes
        setInterval(() => {
            const pendingTasks = this.getPendingTasksCount();
            if (pendingTasks > 0) {
                this.sendPushNotification(
                    'TaskQuest - Tareas Pendientes',
                    `Tienes ${pendingTasks} tareas pendientes. ¡Continúa con tu progreso!`,
                    {
                        tag: 'task-reminder',
                        actions: [
                            {
                                action: 'open',
                                title: 'Abrir TaskQuest'
                            }
                        ]
                    }
                );
            }
        }, 30 * 60 * 1000); // 30 minutos
    }

    // Obtener cantidad de tareas pendientes
    getPendingTasksCount() {
        if (!this.data.tasks) return 0;
        
        let count = 0;
        Object.values(this.data.tasks).forEach(categoryTasks => {
            count += categoryTasks.filter(task => !task.completed).length;
        });
        
        return count;
    }

    // Configurar notificaciones inteligentes
    setupSmartNotifications() {
        // Notificación de motivación diaria
        this.scheduleDailyMotivation();
        
        // Notificación de racha
        this.scheduleStreakReminders();
    }

    // Programar motivación diaria
    scheduleDailyMotivation() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
        
        const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.sendPushNotification(
                'TaskQuest - ¡Buenos días!',
                '¡Es un nuevo día! ¿Listo para completar tus tareas?',
                {
                    tag: 'daily-motivation',
                    actions: [
                        {
                            action: 'start',
                            title: 'Comenzar día'
                        }
                    ]
                }
            );
            
            // Programar para el siguiente día
            this.scheduleDailyMotivation();
        }, timeUntilTomorrow);
    }

    // Programar recordatorios de racha
    scheduleStreakReminders() {
        // Si la racha está en riesgo (menos de 3 tareas completadas y es tarde)
        const checkStreak = () => {
            const now = new Date();
            const hour = now.getHours();
            const totalCompleted = Object.values(this.data.completedToday || {}).reduce((a, b) => a + b, 0);
            
            // Si es después de las 6 PM y no se han completado suficientes tareas
            if (hour >= 18 && totalCompleted < 3) {
                this.sendPushNotification(
                    'TaskQuest - ¡Mantén tu racha!',
                    `Solo has completado ${totalCompleted} tareas hoy. ¡Completa al menos 3 para mantener tu racha!`,
                    {
                        tag: 'streak-reminder',
                        actions: [
                            {
                                action: 'complete',
                                title: 'Completar tareas'
                            }
                        ]
                    }
                );
            }
        };
        
        // Verificar cada hora después de las 6 PM
        setInterval(checkStreak, 60 * 60 * 1000);
    }
}

// Funciones para el modal de añadir tarea
function showAddTaskModal(category) {
    document.getElementById('taskCategory').value = category;
    document.getElementById('addTaskModal').style.display = 'block';
    document.getElementById('taskName').focus();
}

function closeAddTaskModal() {
    document.getElementById('addTaskModal').style.display = 'none';
    document.getElementById('addTaskForm').reset();
}

function closeCelebration() {
    document.getElementById('celebrationModal').style.display = 'none';
}

// Funciones globales para el sistema de descanso
function takeBreak() {
    if (window.game) {
        window.game.takeBreak();
    }
}

function logRest() {
    if (window.game) {
        window.game.logRest();
    }
}

// Función para cambiar pestañas de estadísticas históricas
function showStatsTab(tab) {
    // Ocultar todas las pestañas
    document.getElementById('weekStats').style.display = 'none';
    document.getElementById('monthStats').style.display = 'none';
    
    // Remover clase active de todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Mostrar la pestaña seleccionada
    if (tab === 'week') {
        document.getElementById('weekStats').style.display = 'block';
        document.querySelector('.tab-btn[onclick="showStatsTab(\'week\')"]').classList.add('active');
    } else if (tab === 'month') {
        document.getElementById('monthStats').style.display = 'block';
        document.querySelector('.tab-btn[onclick="showStatsTab(\'month\')"]').classList.add('active');
    }
}

// Función para navegación suave entre secciones
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Actualizar navegación activa
        updateActiveNavigation(sectionId);
        
        // Si es la sección de historial, mostrar el historial diario
        if (sectionId === 'history' && window.game) {
            window.game.showHistory('daily');
        }
    }
}

// Función para actualizar navegación activa
function updateActiveNavigation(activeSection) {
    // Remover clase active de todos los botones
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Agregar clase active al botón correspondiente
    const activeBtn = document.querySelector(`[data-section="${activeSection}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Función para detectar sección visible (scroll spy)
function initScrollSpy() {
    const sections = document.querySelectorAll('[id="categories"], [id="block-time"], [id="daily-stats"], [id="stats-history"], [id="history"], [id="goals"]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateActiveNavigation(entry.target.id);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-20% 0px -20% 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Funciones para el selector de tareas
function showTaskSelector() {
    if (window.game) {
        window.game.showTaskSelector();
    }
}

function closeTaskSelector() {
    document.getElementById('taskSelectorModal').style.display = 'none';
}

function clearActiveTask() {
    if (window.game) {
        window.game.clearActiveTask();
    }
}

// Función global para mostrar modal de limpiar datos
function showClearDataModal() {
    console.log('🔍 Función global showClearDataModal llamada');
    console.log('🔍 window.game existe:', !!window.game);
    
    if (window.game) {
        console.log('✅ Llamando a window.game.showClearDataModal()');
        window.game.showClearDataModal();
    } else {
        console.error('❌ window.game no está disponible');
        alert('Error: La aplicación no está inicializada correctamente. Recarga la página.');
    }
}

// Función global para confirmar cambio de tarea
function confirmTaskChange(category, taskId) {
    if (window.game) {
        window.game.confirmTaskChange(category, taskId);
    }
}

// Función de prueba para verificar que todo funcione
function testClearData() {
    console.log('🧪 Probando funcionalidad de limpiar datos...');
    console.log('🧪 localStorage antes:', localStorage.getItem('taskQuestData'));
    console.log('🧪 window.game existe:', !!window.game);
    
    if (window.game) {
        console.log('🧪 Llamando a showClearDataModal...');
        window.game.showClearDataModal();
    } else {
        console.error('🧪 window.game no está disponible');
    }
}

// Funciones para las pestañas de estadísticas
function showStatsTab(tab) {
    // Ocultar todas las pestañas
    document.getElementById('weekStats').style.display = 'none';
    document.getElementById('monthStats').style.display = 'none';
    
    // Remover clase active de todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Mostrar la pestaña seleccionada
    if (tab === 'week') {
        document.getElementById('weekStats').style.display = 'block';
        document.querySelector('.tab-btn[onclick*="week"]').classList.add('active');
    } else if (tab === 'month') {
        document.getElementById('monthStats').style.display = 'block';
        document.querySelector('.tab-btn[onclick*="month"]').classList.add('active');
    }
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const addModal = document.getElementById('addTaskModal');
    const celebModal = document.getElementById('celebrationModal');
    const taskSelectorModal = document.getElementById('taskSelectorModal');
    
    if (event.target === addModal) {
        closeAddTaskModal();
    }
    if (event.target === celebModal) {
        closeCelebration();
    }
    if (event.target === taskSelectorModal) {
        closeTaskSelector();
    }
}

// Inicializar el juego
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new TaskQuestGame();
    // Hacer la variable game disponible globalmente
    window.game = game;
    
    // Función global para probar mejoras de progreso
    window.testProgressImprovements = () => {
        if (game && game.testProgressLevels) {
            game.testProgressLevels();
        } else {
            console.log('❌ Game no está inicializado aún');
        }
    };
    
    // Función global para debug de la barra de progreso
    window.debugProgressBar = () => {
        if (game && game.debugProgressBar) {
            game.debugProgressBar();
        } else {
            console.log('❌ Game no está inicializado aún');
        }
    };
    
    // Función global para forzar ancho de prueba
    window.testProgressWidth = (width = '50%') => {
        const progressFill = document.getElementById('levelProgress');
        if (progressFill) {
            progressFill.style.width = width;
            console.log(`🧪 Ancho forzado a: ${width}`);
        } else {
            console.log('❌ Elemento levelProgress no encontrado');
        }
    };
    
    // Función global para probar visibilidad de la barra
    window.testBarVisibility = () => {
        const progressFill = document.getElementById('levelProgress');
        if (!progressFill) {
            console.log('❌ Elemento no encontrado');
            return;
        }
        
        console.log('🧪 Probando visibilidad de la barra...');
        
        const testWidths = ['5%', '10%', '25%', '50%', '75%', '100%'];
        let currentIndex = 0;
        
        const testNext = () => {
            if (currentIndex < testWidths.length) {
                const width = testWidths[currentIndex];
                progressFill.style.width = width;
                console.log(`📊 Probando ancho: ${width}`);
                currentIndex++;
                setTimeout(testNext, 1000);
            } else {
                console.log('✅ Prueba completada');
                // Restaurar ancho original
                if (game && game.updateProgress) {
                    game.updateProgress();
                }
            }
        };
        
        testNext();
    };
    
    console.log('🎮 TaskQuest inicializado. Usa debugProgressBar(), testProgressWidth(), o testBarVisibility() para probar la barra de progreso.');
});

// CSS para el modal de error de validación
const taskErrorCSS = `
.task-error-modal .task-error-content {
    background: var(--card-bg);
    margin: 10% auto;
    padding: 30px;
    border-radius: 20px;
    width: 90%;
    max-width: 500px;
    position: relative;
    animation: slideDown 0.3s ease;
    border: 2px solid #ef4444;
}

.error-header {
    text-align: center;
    margin-bottom: 20px;
}

.error-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 10px;
}

.error-header h2 {
    font-size: 22px;
    color: #ef4444;
    margin: 0;
}

.error-body {
    margin-bottom: 25px;
}

.error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 20px;
    color: #dc2626;
    font-weight: 500;
}

.error-requirements h3 {
    font-size: 16px;
    color: var(--text-primary);
    margin-bottom: 10px;
}

.requirements-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.requirements-list li {
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
    color: var(--text-secondary);
}

.requirements-list li:last-child {
    border-bottom: none;
}

.error-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.error-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Poppins', sans-serif;
}

.error-btn.primary {
    background: #ef4444;
    color: white;
}

.error-btn.primary:hover {
    background: #dc2626;
    transform: scale(1.05);
}

.error-btn.secondary {
    background: var(--background-alt);
    color: var(--text-primary);
    border: 1px solid var(--border);
}

.error-btn.secondary:hover {
    background: var(--background);
    transform: scale(1.05);
}

@keyframes slideDown {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
`;

// Añadir CSS al documento
const errorStyle = document.createElement('style');
errorStyle.textContent = taskErrorCSS;
document.head.appendChild(errorStyle);

// Funciones para el historial
function showHistoryTab(period) {
    if (window.game) {
        window.game.showHistory(period);
        
        // Actualizar botones de pestañas
        document.querySelectorAll('.history-tab-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[onclick="showHistoryTab('${period}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        } else {
            console.error(`Botón para periodo '${period}' no encontrado`);
        }
    }
}

function showHistoryDay(date) {
    if (window.game) {
        window.game.showHistory('daily', new Date(date));
    }
}

function showHistoryWeek(weekKey) {
    if (window.game) {
        // Convertir weekKey a fecha
        const [year, week] = weekKey.split('-W');
        const date = new Date(year, 0, 1);
        const weekStart = new Date(date.getTime() + (parseInt(week) - 1) * 7 * 24 * 60 * 60 * 1000);
        window.game.showHistory('weekly', weekStart);
    }
}

function showHistoryMonth(year, month) {
    if (window.game) {
        const date = new Date(year, month - 1, 1);
        window.game.showHistory('monthly', date);
    }
}

// Función global para reinicializar el pomodoro
function fixPomodoro() {
    if (window.game) {
        window.game.reinitializePomodoro();
        console.log('✅ Pomodoro reinicializado');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función global para probar el pomodoro
function testPomodoro() {
    if (window.game) {
        window.game.testPomodoro();
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función global para verificar el estado del pomodoro
function checkPomodoro() {
    if (window.game) {
        window.game.debugPomodoroElements();
        console.log('📊 Estado actual:', window.game.pomodoroState);
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función global para reparar datos corruptos
function fixDataStructure() {
    if (window.game) {
        console.log('🔧 Reparando estructura de datos...');
        
        // Asegurar que todas las estructuras necesarias existan
        if (!window.game.data.taskHistory) {
            window.game.data.taskHistory = {
                daily: {},
                weekly: {},
                monthly: {}
            };
        }
        
        if (!window.game.data.pomodoro) {
            window.game.data.pomodoro = {
                pomodorosToday: 0,
                focusTimeToday: 0,
                settings: {
                    workDuration: 25,
                    breakDuration: 5,
                    longBreakDuration: 15,
                    pomodorosUntilLongBreak: 4
                }
            };
        }
        
        // Guardar datos reparados
        window.game.saveData();
        console.log('✅ Estructura de datos reparada');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función global para detener bucles del pomodoro
function stopPomodoroLoop() {
    if (window.game) {
        console.log('🛑 Deteniendo bucles del Pomodoro...');
        
        // Limpiar intervalos
        if (window.game.pomodoroState && window.game.pomodoroState.intervalId) {
            clearInterval(window.game.pomodoroState.intervalId);
        }
        
        // Resetear flags
        if (window.game.pomodoroState) {
            window.game.pomodoroState.isCompleting = false;
            window.game.pomodoroState.isRunning = false;
            window.game.pomodoroState.intervalId = null;
        }
        
        console.log('✅ Bucles detenidos');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función global para reparar configuración de sonidos
function fixSoundSettings() {
    if (window.game) {
        console.log('🔧 Reparando configuración de sonidos...');
        
        // Asegurar que la estructura de sonidos exista
        if (!window.game.data.pomodoro.settings.soundNotifications) {
            window.game.data.pomodoro.settings.soundNotifications = {
                enabled: true,
                workCompleteSound: 'bell',        // Sonido al terminar trabajo
                workStartSound: 'ding',           // Sonido al iniciar trabajo
                breakStartSound: 'chime',         // Sonido al iniciar descanso corto
                breakEndSound: 'ding',            // Sonido al terminar descanso corto
                longBreakStartSound: 'gong',      // Sonido al iniciar descanso largo
                longBreakEndSound: 'bell'         // Sonido al terminar descanso largo
            };
        }
        
        // Guardar datos reparados
        window.game.saveData();
        console.log('✅ Configuración de sonidos reparada');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para establecer 30 segundos en el timer
function debug30Seconds() {
    if (window.game) {
        console.log('🐛 Modo Debug: Estableciendo 30 segundos...');
        
        // Establecer 30 segundos en el timer actual
        if (window.game.pomodoroState) {
            window.game.pomodoroState.timeLeft = 30;
            window.game.pomodoroState.totalTime = 30;
            window.game.updateTimerDisplay();
            window.game.updatePomodoroDisplay();
            console.log('✅ Timer establecido a 30 segundos');
        } else {
            console.error('❌ Pomodoro state not found');
        }
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para cambiar duración de trabajo a 5 minutos
function debug5Minutes() {
    if (window.game) {
        console.log('🐛 Modo Debug: Cambiando duración de trabajo a 5 minutos...');
        
        // Cambiar configuración a 5 minutos
        window.game.data.pomodoro.settings.workDuration = 5;
        window.game.saveData();
        
        // Actualizar selector en la interfaz
        const workDurationSelect = document.getElementById('workDuration');
        if (workDurationSelect) {
            workDurationSelect.value = '5';
        }
        
        // Si no hay pomodoro corriendo, actualizar el timer
        if (!window.game.pomodoroState.isRunning) {
            window.game.pomodoroState.timeLeft = 5 * 60; // 5 minutos en segundos
            window.game.pomodoroState.totalTime = 5 * 60;
            window.game.updateTimerDisplay();
            window.game.updatePomodoroDisplay();
        }
        
        console.log('✅ Duración de trabajo cambiada a 5 minutos');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar el flujo completo de pomodoro
function debugPomodoroFlow() {
    if (window.game) {
        console.log('🐛 Modo Debug: Probando flujo completo de pomodoro...');
        
        // Establecer 10 segundos para testing rápido
        window.game.pomodoroState.timeLeft = 10;
        window.game.pomodoroState.totalTime = 10;
        window.game.pomodoroState.currentMode = 'work';
        window.game.pomodoroState.lastTickTime = Date.now();
        window.game.updateTimerDisplay();
        window.game.updatePomodoroDisplay();
        
        console.log('✅ Timer establecido a 10 segundos para testing');
        console.log('📊 Estado actual:', window.game.pomodoroState);
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar countdown suave
function debugSmoothCountdown() {
    if (window.game) {
        console.log('🔄 Iniciando debug de countdown suave...');
        
        // Establecer 30 segundos para testing
        window.game.pomodoroState.timeLeft = 30;
        window.game.pomodoroState.totalTime = 30;
        window.game.pomodoroState.currentMode = 'work';
        window.game.pomodoroState.lastTickTime = Date.now();
        window.game.updateTimerDisplay();
        window.game.updatePomodoroDisplay();
        
        console.log('✅ Timer establecido a 30 segundos para testing de countdown suave');
        console.log('📊 Estado actual:', window.game.pomodoroState);
        console.log('💡 Usa startPomodoro() para iniciar el countdown suave');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar ciclo completo (trabajo + descanso)
function debugFullCycle() {
    if (window.game) {
        console.log('🔄 Iniciando debug de ciclo completo...');
        
        // Establecer 10 segundos para trabajo
        window.game.pomodoroState.timeLeft = 10;
        window.game.pomodoroState.totalTime = 10;
        window.game.pomodoroState.currentMode = 'work';
        window.game.pomodoroState.lastTickTime = Date.now();
        window.game.pomodoroState.isCompleting = false;
        window.game.updateTimerDisplay();
        window.game.updatePomodoroDisplay();
        
        console.log('✅ Timer establecido a 10 segundos para testing de ciclo completo');
        console.log('📊 Estado actual:', window.game.pomodoroState);
        console.log('💡 Usa startPomodoro() para iniciar el ciclo completo');
        console.log('🎯 Debería: Trabajo (10s) → Descanso (5s) → Trabajo (10s)');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar sonidos
function debugSounds() {
    if (window.game) {
        console.log('🔊 Probando todos los sonidos...');
        
        // Probar solo sonidos de finalización de ciclos
        const sounds = ['workCompleteSound', 'breakEndSound', 'longBreakEndSound'];
        
        sounds.forEach((sound, index) => {
            setTimeout(() => {
                console.log(`🎵 Probando sonido: ${sound}`);
                window.game.playNotificationSound(sound);
            }, index * 1000);
        });
        
        console.log('✅ Todos los sonidos serán probados en secuencia');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Funciones globales de fallback para los botones del pomodoro
function startPomodoroGlobal() {
    console.log('▶️ startPomodoroGlobal() llamado');
    if (window.game && window.game.startPomodoro) {
        window.game.startPomodoro();
    } else {
        console.error('❌ window.game.startPomodoro no disponible');
    }
}

function pausePomodoroGlobal() {
    console.log('⏸️ pausePomodoroGlobal() llamado');
    if (window.game && window.game.pausePomodoro) {
        window.game.pausePomodoro();
    } else {
        console.error('❌ window.game.pausePomodoro no disponible');
    }
}

function resetPomodoroGlobal() {
    console.log('🔄 resetPomodoroGlobal() llamado');
    if (window.game && window.game.resetPomodoro) {
        window.game.resetPomodoro();
    } else {
        console.error('❌ window.game.resetPomodoro no disponible');
    }
}

// ========== FUNCIONES DEBUG PARA 10 SEGUNDOS ==========

// Función debug para probar ciclo de trabajo (10 segundos) - SE DETIENE AL TERMINAR
function debugWork10s() {
    if (window.game) {
        console.log('🚀 Debug: Configurando ciclo de TRABAJO (10 segundos) - SE DETIENE AL TERMINAR...');
        
        // Configurar estado para trabajo
        window.game.pomodoroState.currentMode = 'work';
        window.game.pomodoroState.timeLeft = 10;
        window.game.pomodoroState.totalTime = 10;
        window.game.pomodoroState.isRunning = false;
        window.game.pomodoroState.isPaused = false;
        window.game.pomodoroState.isCompleting = false;
        window.game.pomodoroState.lastTickTime = Date.now();
        
        // Limpiar intervalos
        if (window.game.pomodoroState.intervalId) {
            clearInterval(window.game.pomodoroState.intervalId);
            window.game.pomodoroState.intervalId = null;
        }
        
        // Actualizar displays
        window.game.updateTimerDisplay();
        window.game.updatePomodoroDisplay();
        
        // Mostrar botón iniciar
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        // Marcar como modo debug para que se detenga al terminar
        window.game.pomodoroState.debugMode = true;
        
        console.log('✅ Ciclo de TRABAJO configurado (10s)');
        console.log('💡 Presiona "Iniciar" para comenzar el ciclo de trabajo');
        console.log('🛑 Al terminar: SE DETIENE COMPLETAMENTE - NO continúa al siguiente ciclo');
        console.log('🎯 Solo notificación y sonido, luego se detiene');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar ciclo de descanso corto (10 segundos)
function debugBreak10s() {
    if (window.game) {
        console.log('☕ Debug: Configurando ciclo de DESCANSO CORTO (10 segundos)...');
        
        // Configurar estado para descanso corto
        window.game.pomodoroState.currentMode = 'break';
        window.game.pomodoroState.timeLeft = 10;
        window.game.pomodoroState.totalTime = 10;
        window.game.pomodoroState.isRunning = false;
        window.game.pomodoroState.isPaused = false;
        window.game.pomodoroState.isCompleting = false;
        window.game.pomodoroState.lastTickTime = Date.now();
        
        // Limpiar intervalos
        if (window.game.pomodoroState.intervalId) {
            clearInterval(window.game.pomodoroState.intervalId);
            window.game.pomodoroState.intervalId = null;
        }
        
        // Actualizar displays
        window.game.updateTimerDisplay();
        window.game.updatePomodoroDisplay();
        
        // Mostrar botón iniciar
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        // Marcar como modo debug para que se detenga al terminar
        window.game.pomodoroState.debugMode = true;
        
        console.log('✅ Ciclo de DESCANSO CORTO configurado (10s)');
        console.log('💡 Presiona "Iniciar" para comenzar el descanso corto');
        console.log('🛑 Al terminar: SE DETIENE COMPLETAMENTE - NO continúa al siguiente ciclo');
        console.log('🎯 Solo notificación y sonido, luego se detiene');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar ciclo de descanso largo (10 segundos)
function debugLongBreak10s() {
    if (window.game) {
        console.log('🎉 Debug: Configurando ciclo de DESCANSO LARGO (10 segundos)...');
        
        // Configurar estado para descanso largo
        window.game.pomodoroState.currentMode = 'longBreak';
        window.game.pomodoroState.timeLeft = 10;
        window.game.pomodoroState.totalTime = 10;
        window.game.pomodoroState.isRunning = false;
        window.game.pomodoroState.isPaused = false;
        window.game.pomodoroState.isCompleting = false;
        window.game.pomodoroState.lastTickTime = Date.now();
        
        // Limpiar intervalos
        if (window.game.pomodoroState.intervalId) {
            clearInterval(window.game.pomodoroState.intervalId);
            window.game.pomodoroState.intervalId = null;
        }
        
        // Actualizar displays
        window.game.updateTimerDisplay();
        window.game.updatePomodoroDisplay();
        
        // Mostrar botón iniciar
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        // Marcar como modo debug para que se detenga al terminar
        window.game.pomodoroState.debugMode = true;
        
        console.log('✅ Ciclo de DESCANSO LARGO configurado (10s)');
        console.log('💡 Presiona "Iniciar" para comenzar el descanso largo');
        console.log('🛑 Al terminar: SE DETIENE COMPLETAMENTE - NO continúa al siguiente ciclo');
        console.log('🎯 Solo notificación y sonido, luego se detiene');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar ciclo completo (trabajo → descanso → trabajo)
function debugFullCycle10s() {
    if (window.game) {
        console.log('🔄 Debug: Configurando CICLO COMPLETO (10s cada fase)...');
        
        // Configurar estado inicial para trabajo
        window.game.pomodoroState.currentMode = 'work';
        window.game.pomodoroState.timeLeft = 10;
        window.game.pomodoroState.totalTime = 10;
        window.game.pomodoroState.isRunning = false;
        window.game.pomodoroState.isPaused = false;
        window.game.pomodoroState.isCompleting = false;
        window.game.pomodoroState.lastTickTime = Date.now();
        window.game.pomodoroState.pomodoroCount = 0; // Resetear contador
        
        // Limpiar intervalos
        if (window.game.pomodoroState.intervalId) {
            clearInterval(window.game.pomodoroState.intervalId);
            window.game.pomodoroState.intervalId = null;
        }
        
        // Actualizar displays
        window.game.updateTimerDisplay();
        window.game.updatePomodoroDisplay();
        
        // Mostrar botón iniciar
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        console.log('✅ CICLO COMPLETO configurado (10s cada fase)');
        console.log('💡 Presiona "Iniciar" para comenzar el ciclo completo');
        console.log('🎯 Flujo: Trabajo (10s) → Descanso (10s) → Trabajo (10s)');
        console.log('🔊 Cada transición incluye notificación y sonido');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar todas las notificaciones y sonidos
function debugAllNotifications() {
    if (window.game) {
        console.log('🔔 Debug: Probando todas las notificaciones y sonidos...');
        
        // Probar notificación de finalización de trabajo
        setTimeout(() => {
            console.log('🎯 Probando notificación de finalización de trabajo...');
            window.game.showPomodoroCelebration();
        }, 1000);
        
        // NO probar notificaciones de inicio - solo de finalización
        
        // Probar notificación de fin de descanso corto
        setTimeout(() => {
            console.log('🚀 Probando notificación de fin de descanso corto...');
            window.game.showBreakEndNotification();
        }, 7000);
        
        // Probar notificación de fin de descanso largo
        setTimeout(() => {
            console.log('🎉 Probando notificación de fin de descanso largo...');
            window.game.showLongBreakEndNotification();
        }, 9000);
        
        console.log('✅ Todas las notificaciones serán probadas en secuencia');
        console.log('🔊 Escucha los sonidos correspondientes a cada notificación');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar la versión
function debugVersion() {
    if (window.game) {
        console.log('📱 Debug: Información de versión...');
        console.log('  - Versión actual:', window.game.version);
        console.log('  - Elemento de versión:', document.getElementById('app-version'));
        
        // Probar actualización de versión
        const testVersion = '2024.1.1';
        console.log(`  - Probando actualización a v${testVersion}...`);
        
        const originalVersion = window.game.version;
        window.game.version = testVersion;
        window.game.displayVersion();
        
        setTimeout(() => {
            console.log('  - Restaurando versión original...');
            window.game.version = originalVersion;
            window.game.displayVersion();
        }, 3000);
        
        console.log('✅ Prueba de versión completada');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar comportamiento correcto de ciclos
function debugCycleBehavior() {
    if (window.game) {
        console.log('🔄 Debug: Probando comportamiento correcto de ciclos...');
        console.log('📋 REGLAS:');
        console.log('  1. Cada ciclo debe DETENERSE al terminar');
        console.log('  2. Botón debe cambiar a "Iniciar" automáticamente');
        console.log('  3. NO debe reproducir sonidos automáticamente al preparar siguiente ciclo');
        console.log('  4. Solo debe reproducir sonido AL TERMINAR ciclos');
        console.log('  5. NO reproduce sonidos al iniciar ciclos');
        console.log('  6. Cada ciclo requiere iniciación MANUAL');
        
        // Configurar un ciclo de trabajo de 5 segundos
        window.game.pomodoroState.currentMode = 'work';
        window.game.pomodoroState.timeLeft = 5;
        window.game.pomodoroState.totalTime = 5;
        window.game.pomodoroState.isRunning = false;
        window.game.pomodoroState.isPaused = false;
        window.game.pomodoroState.isCompleting = false;
        window.game.pomodoroState.debugMode = false; // NO usar modo debug
        window.game.pomodoroState.lastTickTime = Date.now();
        
        // Limpiar intervalos
        if (window.game.pomodoroState.intervalId) {
            clearInterval(window.game.pomodoroState.intervalId);
            window.game.pomodoroState.intervalId = null;
        }
        
        // Actualizar displays
        window.game.updateTimerDisplay();
        window.game.updatePomodoroDisplay();
        
        // Mostrar botón iniciar
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        console.log('✅ Ciclo de TRABAJO configurado (5s)');
        console.log('💡 Presiona "Iniciar" para probar el comportamiento correcto');
        console.log('🎯 Al terminar: Debe detenerse, cambiar botón a "Iniciar", y preparar descanso SIN sonido');
        console.log('🔊 Solo debe reproducir sonido AL TERMINAR el ciclo de trabajo');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar detención del timer
function debugTimerStop() {
    if (window.game) {
        console.log('⏱️ Debug: Probando detención del timer...');
        
        // Configurar un timer de 5 segundos para testing rápido
        window.game.pomodoroState.currentMode = 'work';
        window.game.pomodoroState.timeLeft = 5;
        window.game.pomodoroState.totalTime = 5;
        window.game.pomodoroState.isRunning = false;
        window.game.pomodoroState.isPaused = false;
        window.game.pomodoroState.isCompleting = false;
        window.game.pomodoroState.lastTickTime = Date.now();
        
        // Limpiar intervalos existentes
        if (window.game.pomodoroState.intervalId) {
            clearInterval(window.game.pomodoroState.intervalId);
            window.game.pomodoroState.intervalId = null;
        }
        
        // Actualizar displays
        window.game.updateTimerDisplay();
        window.game.updatePomodoroDisplay();
        
        // Mostrar botón iniciar
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        console.log('✅ Timer configurado a 5 segundos para testing');
        console.log('💡 Presiona "Iniciar" para probar la detención automática');
        console.log('🎯 El timer debería detenerse automáticamente en 5 segundos');
        console.log('🔘 El botón debería cambiar a "Iniciar" automáticamente');
        
        // Monitorear el estado del timer
        const monitorInterval = setInterval(() => {
            if (window.game.pomodoroState) {
                console.log(`⏱️ Timer: ${window.game.pomodoroState.timeLeft}s, Running: ${window.game.pomodoroState.isRunning}, Interval: ${window.game.pomodoroState.intervalId ? 'ACTIVO' : 'DETENIDO'}`);
                
                // Detener monitoreo si el timer se detiene
                if (!window.game.pomodoroState.isRunning && !window.game.pomodoroState.intervalId) {
                    clearInterval(monitorInterval);
                    console.log('✅ Timer detenido correctamente');
                }
            }
        }, 1000);
        
        // Limpiar monitoreo después de 10 segundos
        setTimeout(() => {
            clearInterval(monitorInterval);
        }, 10000);
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar funcionalidad de botones
function debugButtons() {
    if (window.game) {
        console.log('🔘 Debug: Probando funcionalidad de botones...');
        
        // Verificar que los botones existan
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (!startBtn) {
            console.error('❌ Botón "Iniciar" no encontrado');
            return;
        }
        
        if (!pauseBtn) {
            console.error('❌ Botón "Pausar" no encontrado');
            return;
        }
        
        console.log('✅ Botones encontrados');
        console.log('📊 Estado actual de botones:');
        console.log('  - Iniciar visible:', startBtn.style.display !== 'none');
        console.log('  - Pausar visible:', pauseBtn.style.display !== 'none');
        console.log('📊 Estado del pomodoro:');
        console.log('  - Ejecutándose:', window.game.pomodoroState.isRunning);
        console.log('  - Pausado:', window.game.pomodoroState.isPaused);
        console.log('  - Completando:', window.game.pomodoroState.isCompleting);
        
        // Probar cambio de botones
        console.log('🔄 Probando cambio de botones...');
        window.game.updatePomodoroButtons();
        
        setTimeout(() => {
            console.log('📊 Estado después de updatePomodoroButtons():');
            console.log('  - Iniciar visible:', startBtn.style.display !== 'none');
            console.log('  - Pausar visible:', pauseBtn.style.display !== 'none');
        }, 100);
        
        console.log('💡 Usa startPomodoro() y pausePomodoro() para probar funcionalidad');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para mostrar estado actual del pomodoro
function debugPomodoroState() {
    if (window.game && window.game.pomodoroState) {
        console.log('📊 Debug: Estado actual del Pomodoro:');
        console.log('🔄 Modo actual:', window.game.pomodoroState.currentMode);
        console.log('⏱️ Tiempo restante:', window.game.pomodoroState.timeLeft, 'segundos');
        console.log('⏱️ Tiempo total:', window.game.pomodoroState.totalTime, 'segundos');
        console.log('▶️ Ejecutándose:', window.game.pomodoroState.isRunning);
        console.log('⏸️ Pausado:', window.game.pomodoroState.isPaused);
        console.log('🔄 Completando:', window.game.pomodoroState.isCompleting);
        console.log('🍅 Pomodoros completados:', window.game.pomodoroState.pomodoroCount);
        console.log('🆔 Interval ID:', window.game.pomodoroState.intervalId);
        console.log('📅 Último tick:', new Date(window.game.pomodoroState.lastTickTime));
        
        // Mostrar configuración de sonidos
        if (window.game.data.pomodoro.settings.soundNotifications) {
            console.log('🔊 Configuración de sonidos (SOLO AL TERMINAR CICLOS):');
            console.log('  - Habilitados:', window.game.data.pomodoro.settings.soundNotifications.enabled);
            console.log('  - Sonido trabajo completo:', window.game.data.pomodoro.settings.soundNotifications.workCompleteSound);
            console.log('  - Sonido fin descanso corto:', window.game.data.pomodoro.settings.soundNotifications.breakEndSound);
            console.log('  - Sonido fin descanso largo:', window.game.data.pomodoro.settings.soundNotifications.longBreakEndSound);
            console.log('  - NOTA: NO se reproducen sonidos al iniciar ciclos');
        }
    } else {
        console.error('❌ Game instance o pomodoroState not found');
    }
}

// Función debug para verificar estado de tarea activa
function debugActiveTask() {
    if (window.game) {
        console.log('🎯 Debug: Estado de Tarea Activa:');
        console.log('📋 Tarea activa:', window.game.data.activeTask);
        
        if (window.game.data.activeTask) {
            console.log('✅ Hay tarea activa seleccionada');
            console.log('📝 Nombre:', window.game.data.activeTask.name);
            console.log('📂 Categoría:', window.game.data.activeTask.category);
            console.log('🆔 ID:', window.game.data.activeTask.id);
            console.log('🍅 Pomodoros completados:', window.game.data.activeTask.pomodorosCompleted);
            console.log('☕ Descansos tomados:', window.game.data.activeTask.breaksTaken);
            console.log('✅ Puede completarse:', window.game.data.activeTask.canComplete);
            
            // Verificar si la tarea aún existe
            const currentTask = window.game.data.tasks[window.game.data.activeTask.category].find(t => t.id === window.game.data.activeTask.id);
            if (currentTask) {
                console.log('✅ La tarea existe en el sistema');
                console.log('📋 Tarea encontrada:', currentTask);
                console.log('✅ Completada:', currentTask.completed);
            } else {
                console.log('❌ La tarea NO existe en el sistema');
                console.log('🔍 Tareas en categoría:', window.game.data.tasks[window.game.data.activeTask.category]);
            }
        } else {
            console.log('❌ No hay tarea activa seleccionada');
        }
        
        console.log('💾 Datos en localStorage:', localStorage.getItem('taskQuestData'));
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar flujo completo de tarea activa
function debugActiveTaskFlow() {
    if (window.game) {
        console.log('🔄 Debug: Flujo completo de tarea activa');
        
        // 1. Verificar estado actual
        debugActiveTask();
        
        // 2. Intentar iniciar pomodoro
        console.log('▶️ Intentando iniciar pomodoro...');
        window.game.startPomodoro();
        
        // 3. Mostrar estado después
        setTimeout(() => {
            console.log('📊 Estado después de intentar iniciar:');
            debugActiveTask();
        }, 1000);
    } else {
        console.error('❌ Game instance not found');
    }
}

// Función debug para probar flujo completo de ciclos Pomodoro
function debugPomodoroCycleFlow() {
    if (window.game) {
        console.log('🔄 Debug: Flujo completo de ciclos Pomodoro');
        
        // 1. Verificar estado actual
        console.log('📊 Estado inicial del Pomodoro:');
        debugPomodoroState();
        
        // 2. Verificar tarea activa
        console.log('🎯 Estado de tarea activa:');
        debugActiveTask();
        
        // 3. Verificar botones
        console.log('🔘 Estado de botones:');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        if (startBtn && pauseBtn) {
            console.log('  - Iniciar visible:', startBtn.style.display !== 'none');
            console.log('  - Iniciar habilitado:', !startBtn.disabled);
            console.log('  - Pausar visible:', pauseBtn.style.display !== 'none');
        }
        
        // 4. Mostrar resumen
        console.log('📋 Resumen del estado:');
        console.log('  - Timer corriendo:', window.game.pomodoroState.isRunning);
        console.log('  - Timer pausado:', window.game.pomodoroState.isPaused);
        console.log('  - Completando:', window.game.pomodoroState.isCompleting);
        console.log('  - Modo actual:', window.game.pomodoroState.currentMode);
        console.log('  - Tiempo restante:', window.game.pomodoroState.timeLeft);
        console.log('  - Tarea activa:', !!window.game.data.activeTask);
        
        console.log('💡 Comandos disponibles:');
        console.log('  - startPomodoro() - Iniciar timer');
        console.log('  - pausePomodoro() - Pausar timer');
        console.log('  - resetPomodoro() - Reiniciar timer');
        console.log('  - debugPomodoroState() - Ver estado detallado');
        console.log('  - debugActiveTask() - Ver tarea activa');
    } else {
        console.error('❌ Game instance not found');
    }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.game = new TaskQuestGame();
});