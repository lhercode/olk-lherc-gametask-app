// Service Worker para TaskQuest - Notificaciones en Background
// Permite que las notificaciones y sonidos funcionen incluso con el teléfono apagado
// Optimizado para iPhone y dispositivos iOS

const CACHE_NAME = 'taskquest-v1.0.0-ios';
const urlsToCache = [
    '/',
    '/css/style.css',
    '/js/app.js',
    '/js/daily-system.js',
    '/favicon.svg'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activado');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Devolver desde cache si está disponible
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// ========== NOTIFICACIONES PUSH ==========

// Manejar notificaciones push
self.addEventListener('push', (event) => {
    console.log('📱 Service Worker: Notificación push recibida');
    
    let notificationData = {
        title: 'TaskQuest',
        body: '¡Es hora de continuar con tus tareas!',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'taskquest-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'Abrir TaskQuest',
                icon: '/favicon.svg'
            },
            {
                action: 'dismiss',
                title: 'Descartar',
                icon: '/favicon.svg'
            }
        ]
    };

    // Si hay datos en el push event, usarlos
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (e) {
            console.log('📱 Service Worker: Datos push no válidos, usando defaults');
        }
    }

    const promiseChain = self.registration.showNotification(
        notificationData.title,
        notificationData
    );

    event.waitUntil(promiseChain);
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Service Worker: Notificación clickeada');
    
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Abrir o enfocar la aplicación
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Si ya hay una ventana abierta, enfocarla
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no hay ventana abierta, abrir una nueva
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// ========== BACKGROUND SYNC ==========

// Manejar Background Sync para mantener timers activos
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync activado');
    
    if (event.tag === 'pomodoro-timer') {
        event.waitUntil(handlePomodoroSync());
    } else if (event.tag === 'task-reminder') {
        event.waitUntil(handleTaskReminder());
    }
});

// Sincronizar timer de Pomodoro
async function handlePomodoroSync() {
    console.log('🍅 Service Worker: Sincronizando timer Pomodoro');
    
    try {
        // Obtener datos del timer desde IndexedDB
        const pomodoroData = await getPomodoroData();
        
        if (pomodoroData && pomodoroData.isRunning) {
            const now = Date.now();
            const elapsed = now - pomodoroData.startTime;
            const remaining = pomodoroData.duration - elapsed;
            
            if (remaining <= 0) {
                // Timer completado, enviar notificación
                await sendTimerCompleteNotification(pomodoroData.type);
            } else {
                // Programar próxima verificación
                setTimeout(() => {
                    self.registration.sync.register('pomodoro-timer');
                }, Math.min(remaining, 60000)); // Verificar cada minuto máximo
            }
        }
    } catch (error) {
        console.error('❌ Service Worker: Error en sync Pomodoro:', error);
    }
}

// Manejar recordatorios de tareas
async function handleTaskReminder() {
    console.log('📝 Service Worker: Procesando recordatorios de tareas');
    
    try {
        const taskData = await getTaskData();
        
        if (taskData && taskData.reminders) {
            const now = new Date();
            
            taskData.reminders.forEach(reminder => {
                if (new Date(reminder.time) <= now && !reminder.sent) {
                    sendTaskReminderNotification(reminder);
                    reminder.sent = true;
                }
            });
            
            await saveTaskData(taskData);
        }
    } catch (error) {
        console.error('❌ Service Worker: Error en recordatorios:', error);
    }
}

// ========== FUNCIONES AUXILIARES ==========

// Enviar notificación de timer completado
async function sendTimerCompleteNotification(timerType) {
    const messages = {
        'work': {
            title: '🍅 Pomodoro Completado',
            body: '¡Tiempo de trabajo terminado! Tómate un descanso.',
            icon: '/favicon.svg'
        },
        'break': {
            title: '☕ Descanso Terminado',
            body: '¡Hora de volver al trabajo!',
            icon: '/favicon.svg'
        },
        'longBreak': {
            title: '🎉 Descanso Largo Terminado',
            body: '¡Recargado y listo para continuar!',
            icon: '/favicon.svg'
        }
    };

    const notification = messages[timerType] || messages['work'];
    
    await self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        badge: '/favicon.svg',
        tag: 'timer-complete',
        requireInteraction: true,
        actions: [
            {
                action: 'continue',
                title: 'Continuar',
                icon: '/favicon.svg'
            }
        ]
    });
}

// Enviar recordatorio de tarea
async function sendTaskReminderNotification(reminder) {
    await self.registration.showNotification('📝 Recordatorio de Tarea', {
        body: `No olvides: ${reminder.taskName}`,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: `task-reminder-${reminder.id}`,
        requireInteraction: true,
        actions: [
            {
                action: 'complete',
                title: 'Marcar Completada',
                icon: '/favicon.svg'
            },
            {
                action: 'snooze',
                title: 'Recordar más tarde',
                icon: '/favicon.svg'
            }
        ]
    });
}

// Obtener datos del Pomodoro desde IndexedDB
async function getPomodoroData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TaskQuestDB', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['gameData'], 'readonly');
            const store = transaction.objectStore('gameData');
            const getRequest = store.get('pomodoro');
            
            getRequest.onsuccess = () => {
                resolve(getRequest.result);
            };
            
            getRequest.onerror = () => {
                reject(getRequest.error);
            };
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Obtener datos de tareas desde IndexedDB
async function getTaskData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TaskQuestDB', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['gameData'], 'readonly');
            const store = transaction.objectStore('gameData');
            const getRequest = store.get('tasks');
            
            getRequest.onsuccess = () => {
                resolve(getRequest.result);
            };
            
            getRequest.onerror = () => {
                reject(getRequest.error);
            };
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Guardar datos de tareas en IndexedDB
async function saveTaskData(data) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TaskQuestDB', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['gameData'], 'readwrite');
            const store = transaction.objectStore('gameData');
            const putRequest = store.put(data, 'tasks');
            
            putRequest.onsuccess = () => {
                resolve();
            };
            
            putRequest.onerror = () => {
                reject(putRequest.error);
            };
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

// ========== MESSAGE HANDLING ==========

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data && event.data.type === 'START_TIMER') {
        handleStartTimer(event.data.timerData);
    } else if (event.data && event.data.type === 'STOP_TIMER') {
        handleStopTimer();
    }
});

// Manejar inicio de timer
async function handleStartTimer(timerData) {
    console.log('⏰ Service Worker: Iniciando timer:', timerData);
    
    // Programar verificación del timer
    setTimeout(() => {
        self.registration.sync.register('pomodoro-timer');
    }, 1000);
}

// Manejar parada de timer
async function handleStopTimer() {
    console.log('⏹️ Service Worker: Deteniendo timer');
    // Limpiar cualquier sync pendiente
}

console.log('🚀 Service Worker: Cargado y listo');
