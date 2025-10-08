# Changelog - TaskQuest

## [2025.1.1] - 2025-12-19

### 🔧 Fixed
- **Pomodoro Loop Infinito**: Corregido el problema donde el sistema entraba en loops infinitos al terminar cada ciclo de pomodoro
- **Validación de Tareas Activas**: Mejorada la lógica para que solo las sesiones de trabajo requieran tarea activa, permitiendo descansos sin tarea seleccionada

### ✨ Added
- **Funciones Específicas de Pomodoro**: 
  - `startWorkSession()` - Requiere tarea activa
  - `startBreakSession()` - NO requiere tarea activa  
  - `startLongBreakSession()` - NO requiere tarea activa
- **Funciones de Timer Separadas**:
  - `startWorkTimer()` - Solo inicia timer de trabajo
  - `startBreakTimer()` - Solo inicia timer de descanso
  - `startLongBreakTimer()` - Solo inicia timer de descanso largo
- **Separación de Responsabilidades**: Preparar ciclos vs Iniciar timers

### 🔄 Changed
- **Flujo de Transición**: Mejorado el flujo entre ciclos para evitar doble preparación
- **Lógica de `prepareNextCycle()`**: Ahora es más inteligente sobre cuándo preparar trabajo vs descanso
- **Validación en `resumePomodoro()`**: Solo valida tarea activa para sesiones de trabajo

### 🎯 Behavior Changes
- **Descansos sin tarea activa**: Ahora es posible iniciar descansos (cortos y largos) sin tener una tarea activa seleccionada
- **Transiciones más suaves**: Los ciclos de pomodoro ahora transicionan correctamente sin loops infinitos
- **Experiencia más intuitiva**: El sistema determina automáticamente qué tipo de sesión iniciar según el contexto

### 🐛 Bug Fixes
- Eliminado el loop infinito que ocurría al terminar cada ciclo de pomodoro
- Corregida la doble preparación de ciclos que causaba conflictos
- Mejorada la consistencia en la validación de tareas activas

---

## [2025.1.0] - 2025-12-18

### 🎉 Initial Release
- Sistema de gamificación para tareas
- Técnica Pomodoro integrada
- Sistema de puntos y niveles
- Estadísticas y progreso
- Notificaciones y sonidos
- PWA (Progressive Web App) support
