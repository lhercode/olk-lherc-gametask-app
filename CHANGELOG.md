# Changelog - TaskQuest

## [2025.1.3] - 2025-12-19

### 🔧 Fixed
- **Validación Silenciosa**: Eliminadas las notificaciones de error cuando no hay tarea activa
- **Comportamiento Silencioso**: El sistema ahora funciona silenciosamente sin mostrar alertas molestas

### ✨ Added
- **Validación Sin Notificaciones**: 
  - `startWorkTimer()` ya no muestra notificaciones de error
  - `resumePomodoro()` ya no muestra notificaciones de error
  - El sistema simplemente no inicia si no hay tarea activa

### 🔄 Changed
- **Experiencia Silenciosa**: 
  - Sin notificaciones de error para tareas activas faltantes
  - Sin apertura automática del selector de tareas
  - El sistema simplemente no responde si no hay tarea activa
- **Logs de Consola**: Mantenidos los logs de consola para debugging

### 🎯 Behavior Changes
- **Sin Interrupciones**: No se muestran notificaciones molestas al usuario
- **Funcionamiento Silencioso**: El sistema funciona en segundo plano sin alertas
- **Validación Interna**: Las validaciones siguen funcionando pero de forma silenciosa

### 🐛 Bug Fixes
- Eliminadas las notificaciones de error innecesarias
- Mejorada la experiencia de usuario al no mostrar alertas constantes
- El sistema mantiene la funcionalidad pero de forma más discreta

---

## [2025.1.2] - 2025-12-19

### 🔧 Fixed
- **Acumulación de Pomodoros**: Corregido el problema donde el sistema acumulaba múltiples pomodoros/descansos sin detenerse
- **Detención Completa**: Mejorada la lógica para asegurar que el timer se detiene completamente al terminar cada ciclo
- **Prevención de Múltiples Inicios**: Agregadas validaciones para prevenir que se inicien múltiples timers simultáneamente

### ✨ Added
- **Validaciones de Estado**: 
  - `startPomodoro()` ahora verifica si ya hay un timer corriendo
  - `startTimer()` previene múltiples inicios simultáneos
  - `tick()` se detiene automáticamente si el timer no está corriendo
- **Limpieza de Intervalos**: Asegura que no hay intervalos previos antes de iniciar nuevos timers

### 🔄 Changed
- **Eliminado setTimeout**: Removido el delay de 2 segundos que causaba problemas de sincronización
- **Reset Inmediato**: El flag `isCompleting` se resetea inmediatamente después de completar una sesión
- **Validaciones Mejoradas**: Múltiples capas de validación para prevenir estados inconsistentes

### 🎯 Behavior Changes
- **Detención Inmediata**: Los ciclos se detienen completamente al terminar, sin acumulación
- **Sin Múltiples Inicios**: No es posible iniciar múltiples timers simultáneamente
- **Estado Consistente**: El sistema mantiene un estado consistente en todo momento

### 🐛 Bug Fixes
- Eliminada la acumulación de pomodoros/descansos cuando el usuario presiona "Iniciar" rápidamente
- Corregido el problema donde el timer continuaba ejecutándose después de completar
- Mejorada la sincronización entre el estado del timer y la interfaz de usuario

---

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
