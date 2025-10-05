// Debug script para TaskQuest
console.log('🔍 Iniciando debug de TaskQuest...');

// Verificar que los elementos del DOM existan
const requiredElements = [
    'points', 'level', 'streak', 'levelProgress', 'currentPoints', 'nextLevelPoints',
    'motivationText', 'tasks-comunicacion', 'tasks-estudiar', 'tasks-proyectos', 'tasks-personal',
    'progress-comunicacion', 'progress-estudiar', 'progress-proyectos', 'progress-personal',
    'achievements', 'timerDisplay', 'timerLabel', 'pomodorosToday', 'focusTime',
    'startBtn', 'pauseBtn', 'resetBtn', 'workDuration', 'breakDuration', 'longBreakDuration',
    'pomodorosUntilLongBreak', 'addTaskForm', 'addTaskModal', 'celebrationModal'
];

console.log('📋 Verificando elementos del DOM...');
const missingElements = [];
requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
        missingElements.push(id);
    }
});

if (missingElements.length > 0) {
    console.error('❌ Elementos faltantes:', missingElements);
} else {
    console.log('✅ Todos los elementos del DOM están presentes');
}

// Verificar que la clase TaskQuestGame esté definida
if (typeof TaskQuestGame !== 'undefined') {
    console.log('✅ Clase TaskQuestGame definida');
} else {
    console.error('❌ Clase TaskQuestGame no encontrada');
}

// Verificar que la variable game esté definida
if (typeof game !== 'undefined' && game !== null) {
    console.log('✅ Instancia de game creada');
    console.log('📊 Datos cargados:', game.data);
    
    // Verificar datos del pomodoro específicamente
    if (game.data.pomodoro) {
        console.log('✅ Datos del pomodoro presentes:', game.data.pomodoro);
    } else {
        console.error('❌ Datos del pomodoro faltantes');
    }
    
    // Verificar métodos
    if (typeof game.toggleTask === 'function') {
        console.log('✅ Método toggleTask disponible');
    } else {
        console.error('❌ Método toggleTask no encontrado');
    }
    
    if (typeof game.deleteTask === 'function') {
        console.log('✅ Método deleteTask disponible');
    } else {
        console.error('❌ Método deleteTask no encontrado');
    }
} else {
    console.error('❌ Variable game no definida');
}

// Verificar localStorage
if (typeof localStorage !== 'undefined') {
    const data = localStorage.getItem('taskQuestData');
    if (data) {
        console.log('💾 Datos en localStorage:', JSON.parse(data));
    } else {
        console.log('💾 No hay datos en localStorage (primera vez)');
    }
} else {
    console.error('❌ localStorage no disponible');
}

console.log('🔍 Debug completado');
