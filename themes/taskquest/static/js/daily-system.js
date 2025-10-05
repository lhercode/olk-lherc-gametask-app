// Sistema Diario para TaskQuest - Tareas se eliminan al final del día

class DailySystem {
    constructor(game) {
        this.game = game;
    }

    // Verificar y manejar el cambio de día
    checkDailyStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const lastCompleted = this.game.data.lastCompletedDate;

        // Si es un nuevo día
        if (lastCompleted && lastCompleted !== today) {
            // Calcular estadísticas del día anterior
            const totalCompletedYesterday = Object.values(this.game.data.completedToday).reduce((a, b) => a + b, 0);
            const pomodorosYesterday = this.game.data.pomodoro.pomodorosToday;
            const focusTimeYesterday = this.game.data.pomodoro.focusTimeToday;
            
            // Determinar si se mantiene la racha
            if (totalCompletedYesterday >= 3) {
                this.game.data.streak++;
                this.showStreakNotification();
            } else {
                this.game.data.streak = 0;
                this.showStreakLostNotification();
            }

            // Guardar resumen del día anterior
            this.saveDailySummary(lastCompleted, totalCompletedYesterday, pomodorosYesterday, focusTimeYesterday);
            
            // ELIMINAR TODAS LAS TAREAS al final del día
            this.clearAllTasks();
            
            // Resetear contadores diarios
            this.resetDailyCounters();
            
            // Mostrar resumen del día anterior
            this.showDailySummary(totalCompletedYesterday, pomodorosYesterday, focusTimeYesterday);
        }
    }

    // Eliminar todas las tareas al final del día
    clearAllTasks() {
        this.game.data.tasks = {
            comunicacion: [],
            estudiar: [],
            proyectos: [],
            personal: []
        };
        
        // Limpiar tarea activa
        this.game.data.activeTask = null;
        
        console.log('🗑️ Todas las tareas eliminadas para el nuevo día');
    }

    // Resetear contadores diarios
    resetDailyCounters() {
        this.game.data.completedToday = {
            comunicacion: 0,
            estudiar: 0,
            proyectos: 0,
            personal: 0
        };
        
        // Resetear estadísticas del pomodoro
        this.game.data.pomodoro.pomodorosToday = 0;
        this.game.data.pomodoro.focusTimeToday = 0;
        
        this.game.saveData();
    }

    // Guardar resumen del día
    saveDailySummary(date, tasksCompleted, pomodorosCompleted, focusTime) {
        if (!this.game.data.dailySummaries) {
            this.game.data.dailySummaries = [];
        }

        const summary = {
            date: date,
            tasksCompleted: tasksCompleted,
            pomodorosCompleted: pomodorosCompleted,
            focusTime: focusTime,
            pointsEarned: this.calculateDailyPoints(),
            streak: this.game.data.streak,
            categories: {
                comunicacion: this.game.data.completedToday.comunicacion,
                estudiar: this.game.data.completedToday.estudiar,
                proyectos: this.game.data.completedToday.proyectos,
                personal: this.game.data.completedToday.personal
            }
        };

        this.game.data.dailySummaries.push(summary);
        
        // Mantener solo los últimos 30 días
        if (this.game.data.dailySummaries.length > 30) {
            this.game.data.dailySummaries = this.game.data.dailySummaries.slice(-30);
        }
    }

    // Calcular puntos ganados en el día
    calculateDailyPoints() {
        // Calcular puntos basados en tareas completadas
        let dailyPoints = 0;
        Object.values(this.game.data.tasks).forEach(categoryTasks => {
            categoryTasks.forEach(task => {
                if (task.completed) {
                    dailyPoints += task.points;
                }
            });
        });
        
        // Añadir puntos de pomodoros
        dailyPoints += this.game.data.pomodoro.pomodorosToday * 15;
        
        return dailyPoints;
    }

    // Mostrar notificación de racha mantenida
    showStreakNotification() {
        const streakDays = this.game.data.streak;
        let message = '';
        let icon = '🔥';
        
        if (streakDays === 1) {
            message = '¡Primer día de racha! 🎉';
            icon = '🌟';
        } else if (streakDays === 3) {
            message = '¡Racha de 3 días! 🔥';
            icon = '🔥';
        } else if (streakDays === 7) {
            message = '¡Una semana completa! 🏆';
            icon = '👑';
        } else if (streakDays === 14) {
            message = '¡Dos semanas seguidas! 🚀';
            icon = '💎';
        } else if (streakDays === 30) {
            message = '¡UN MES COMPLETO! 🎊';
            icon = '🏅';
        } else {
            message = `¡Racha de ${streakDays} días! 🔥`;
        }

        this.game.showNotification(`${icon} ${message}`, 'success');
    }

    // Mostrar notificación de racha perdida
    showStreakLostNotification() {
        this.game.showNotification('💔 Racha perdida. ¡Empieza de nuevo!', 'info');
    }

    // Mostrar resumen del día anterior
    showDailySummary(tasksCompleted, pomodorosCompleted, focusTime) {
        setTimeout(() => {
            const hours = Math.floor(focusTime / 60);
            const minutes = focusTime % 60;
            const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            
            const message = `
                📊 Resumen de ayer:
                ✅ ${tasksCompleted} tareas completadas
                🍅 ${pomodorosCompleted} pomodoros
                ⏱️ ${timeString} enfocado
                🔥 Racha: ${this.game.data.streak} días
            `;
            
            this.createDailySummaryModal(message, tasksCompleted, pomodorosCompleted);
        }, 2000);
    }

    // Crear modal de resumen diario
    createDailySummaryModal(message, tasksCompleted, pomodorosCompleted) {
        const modal = document.createElement('div');
        modal.className = 'modal daily-summary-modal';
        modal.innerHTML = `
            <div class="modal-content daily-summary-content">
                <div class="summary-header">
                    <span class="summary-icon">📊</span>
                    <h2>Resumen del Día Anterior</h2>
                </div>
                <div class="summary-body">
                    <div class="summary-stats">
                        <div class="stat-item">
                            <span class="stat-icon">✅</span>
                            <div class="stat-info">
                                <div class="stat-value">${tasksCompleted}</div>
                                <div class="stat-label">Tareas Completadas</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">🍅</span>
                            <div class="stat-info">
                                <div class="stat-value">${pomodorosCompleted}</div>
                                <div class="stat-label">Pomodoros</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">🔥</span>
                            <div class="stat-info">
                                <div class="stat-value">${this.game.data.streak}</div>
                                <div class="stat-label">Días de Racha</div>
                            </div>
                        </div>
                    </div>
                    <div class="summary-message">
                        <p>¡Excelente trabajo! Las tareas han sido eliminadas para empezar un nuevo día.</p>
                    </div>
                </div>
                <div class="summary-actions">
                    <button class="summary-btn continue-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                        ¡Empezar Nuevo Día!
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
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
        `;
        
        document.body.appendChild(modal);
        
        // Auto-cerrar después de 15 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 15000);
    }

    // Obtener estadísticas de la semana
    getWeeklyStats() {
        if (!this.game.data.dailySummaries) return null;
        
        const last7Days = this.game.data.dailySummaries.slice(-7);
        const totalTasks = last7Days.reduce((sum, day) => sum + day.tasksCompleted, 0);
        const totalPomodoros = last7Days.reduce((sum, day) => sum + day.pomodorosCompleted, 0);
        const totalFocusTime = last7Days.reduce((sum, day) => sum + day.focusTime, 0);
        
        return {
            days: last7Days.length,
            totalTasks,
            totalPomodoros,
            totalFocusTime,
            averageTasks: Math.round(totalTasks / last7Days.length),
            averagePomodoros: Math.round(totalPomodoros / last7Days.length)
        };
    }

    // Obtener estadísticas del mes
    getMonthlyStats() {
        if (!this.game.data.dailySummaries) return null;
        
        const last30Days = this.game.data.dailySummaries.slice(-30);
        const totalTasks = last30Days.reduce((sum, day) => sum + day.tasksCompleted, 0);
        const totalPomodoros = last30Days.reduce((sum, day) => sum + day.pomodorosCompleted, 0);
        const totalFocusTime = last30Days.reduce((sum, day) => sum + day.focusTime, 0);
        
        return {
            days: last30Days.length,
            totalTasks,
            totalPomodoros,
            totalFocusTime,
            averageTasks: Math.round(totalTasks / last30Days.length),
            averagePomodoros: Math.round(totalPomodoros / last30Days.length)
        };
    }
}

// CSS para el modal de resumen diario
const dailySummaryCSS = `
.daily-summary-modal .daily-summary-content {
    background: var(--card-bg);
    margin: 10% auto;
    padding: 40px;
    border-radius: 20px;
    width: 90%;
    max-width: 600px;
    position: relative;
    animation: slideDown 0.3s ease;
}

.summary-header {
    text-align: center;
    margin-bottom: 25px;
}

.summary-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 15px;
}

.summary-header h2 {
    font-size: 24px;
    color: var(--text-primary);
    margin: 0;
}

.summary-body {
    background: var(--background);
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 25px;
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.summary-stats .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--card-bg);
    padding: 15px;
    border-radius: 10px;
    box-shadow: var(--shadow);
}

.summary-stats .stat-icon {
    font-size: 24px;
}

.summary-stats .stat-info {
    flex: 1;
}

.summary-stats .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--primary);
    line-height: 1;
}

.summary-stats .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 3px;
}

.summary-message {
    text-align: center;
    color: var(--text-secondary);
    font-style: italic;
}

.summary-actions {
    text-align: center;
}

.summary-btn {
    padding: 15px 30px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Poppins', sans-serif;
}

.summary-btn:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-lg);
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
const style = document.createElement('style');
style.textContent = dailySummaryCSS;
document.head.appendChild(style);
