# 🎮 TaskQuest - Gamifica tus Tareas

TaskQuest es una aplicación web construida con Hugo que gamifica tus tareas diarias, especialmente diseñada para personas con TDAH. Inspirada en Duolingo, convierte tu productividad en un juego divertido y motivador.

## ✨ Características

### 🎯 Sistema de Gamificación
- **Puntos de Experiencia (XP)**: Gana puntos por cada tarea completada
- **Niveles**: Sube de nivel conforme acumulas XP
- **Rachas Diarias**: Mantén tu racha completando tareas cada día
- **Logros**: Desbloquea insignias por alcanzar hitos especiales

### 📋 4 Categorías de Tareas
1. **💬 Comunicación**: Conecta con personas importantes (llamadas, mensajes, reuniones)
2. **📚 Estudiar**: Expande tus conocimientos (lectura, cursos, videos educativos)
3. **🚀 Proyectos**: Trabaja en tus proyectos creativos y productivos
4. **💪 Personal**: Cuida tu salud y bienestar (ejercicio, caminar, autocuidado)

### 🧠 Diseño Amigable para TDAH
- **Recompensas Inmediatas**: Celebraciones visuales al completar tareas
- **Interfaz Clara**: Diseño limpio sin distracciones
- **Colores Motivadores**: Gradientes vibrantes y elementos visuales atractivos
- **Progreso Visual**: Barras de progreso y estadísticas claras
- **Feedback Positivo**: Mensajes motivacionales personalizados

### ⏰ Block Time - Técnica Pomodoro
- **Timer Visual**: Cronómetro circular con progreso animado
- **Sesiones Configurables**: 15, 25, 30 o 45 minutos de trabajo
- **Descansos Inteligentes**: 3-10 min cortos, 15-30 min largos
- **Notificaciones**: Alertas visuales para transiciones
- **Estadísticas**: Pomodoros completados y tiempo enfocado
- **Integración**: Gana 15 XP por cada Pomodoro completado

## 🚀 Instalación

### Requisitos Previos
- [Hugo](https://gohugo.io/installation/) versión 0.80.0 o superior

### Pasos de Instalación

1. **Clona o descarga este repositorio**:
```bash
cd /Users/lherc/repository/idnod/spike/task-game
```

2. **Inicia el servidor de desarrollo de Hugo**:
```bash
hugo server -D
```

3. **Abre tu navegador** en:
```
http://localhost:1313
```

¡Y listo! Ya puedes empezar a usar TaskQuest.

## 📖 Cómo Usar

### Añadir Tareas
1. Haz clic en el botón **"+ Añadir tarea"** en cualquier categoría
2. Escribe el nombre de la tarea
3. Selecciona la dificultad:
   - **Fácil**: 5 XP (tareas rápidas de 5-10 minutos)
   - **Media**: 10 XP (tareas de 15-30 minutos)
   - **Difícil**: 20 XP (tareas de más de 30 minutos)
4. Haz clic en **"Crear Tarea"**

### Completar Tareas
- Haz clic en el círculo junto a la tarea para marcarla como completada
- ¡Disfruta de la celebración y gana XP!
- Puedes desmarcar tareas si fue un error

### Eliminar Tareas
- Haz clic en el botón **×** rojo para eliminar una tarea

### ⏰ Usar Block Time (Pomodoro)
1. **Configura tus tiempos** en la sección "⚙️ Configuración"
2. **Haz clic en "▶️ Iniciar"** para comenzar una sesión de trabajo
3. **Enfócate** durante el tiempo configurado (por defecto 25 minutos)
4. **Toma descansos** cuando el timer te lo indique
5. **Gana 15 XP** por cada Pomodoro completado
6. **Ve tus estadísticas** de pomodoros y tiempo enfocado

### Sistema de Rachas
- Completa **al menos 3 tareas** en un día para mantener tu racha
- Las rachas se incrementan cada día que completas este objetivo
- ¡No rompas la racha!

### Logros Desbloqueables
- 🌟 **Primera Tarea**: Completa tu primera tarea
- 🔥 **Racha de 3**: Mantén 3 días de racha
- 🏆 **Nivel 5**: Alcanza el nivel 5
- ⭐ **Veterano**: Completa 10 tareas
- 👑 **Maestro**: Completa 50 tareas
- 🌈 **Equilibrado**: Completa tareas en todas las categorías en un día

## 🎨 Personalización

### Modificar Colores
Edita el archivo `themes/taskquest/static/css/style.css` y modifica las variables CSS:
```css
:root {
    --primary: #6c63ff;      /* Color principal */
    --secondary: #58b368;    /* Color secundario */
    --danger: #ff6b6b;       /* Color de peligro */
    --warning: #ffd93d;      /* Color de advertencia */
}
```

### Añadir Nuevos Logros
Edita `themes/taskquest/static/js/app.js` en el método `checkAchievements()` para añadir más logros personalizados.

### Modificar Mensajes Motivacionales
En el archivo `app.js`, busca el método `updateMotivation()` para personalizar los mensajes.

## 💾 Almacenamiento de Datos

TaskQuest usa **localStorage** del navegador para guardar tus datos:
- Todas las tareas y progreso se guardan automáticamente
- Los datos persisten incluso si cierras el navegador
- Para resetear todo, abre la consola del navegador y ejecuta:
  ```javascript
  localStorage.removeItem('taskQuestData')
  ```

## 🏗️ Estructura del Proyecto

```
task-game/
├── config.toml                          # Configuración de Hugo
├── themes/
│   └── taskquest/
│       ├── theme.toml                   # Configuración del tema
│       ├── layouts/
│       │   └── index.html               # Template principal
│       └── static/
│           ├── css/
│           │   └── style.css            # Estilos
│           └── js/
│               └── app.js               # Lógica de gamificación
└── README.md
```

## 🌐 Construcción para Producción

Para generar el sitio estático listo para producción:

```bash
hugo
```

Los archivos se generarán en la carpeta `public/`. Puedes subir esta carpeta a cualquier servicio de hosting:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- O cualquier servidor web

## 🤝 Consejos para Personas con TDAH

1. **Empieza con tareas pequeñas**: Usa la dificultad "Fácil" para generar momentum
2. **Divide tareas grandes**: Una tarea grande de 2 horas es mejor dividirla en 4 tareas de 30 minutos
3. **Usa la racha como motivación**: Ver tu racha crecer es muy gratificante
4. **Celebra cada victoria**: Disfruta las animaciones de celebración, son tu recompensa
5. **Balancea categorías**: El logro "Equilibrado" te ayuda a no descuidar áreas importantes
6. **Revisa tu progreso**: Las estadísticas visuales te muestran cuánto has logrado

## 🎯 Estrategias de Uso

### Rutina Matutina
1. Abre TaskQuest al empezar tu día
2. Añade 2-3 tareas prioritarias en cada categoría
3. Empieza con la más fácil para generar momentum

### Técnica Pomodoro
- **Usa Block Time**: Configura sesiones de 25 minutos con descansos
- **Enfócate intensamente**: Sin distracciones durante el tiempo de trabajo
- **Toma descansos reales**: Levántate, estírate, hidrátate
- **Gana XP automático**: 15 puntos por cada Pomodoro completado
- **Ve tu progreso**: Estadísticas de tiempo enfocado y pomodoros

### Gamificación Social
- Comparte tus logros con amigos
- Compite sanamente con otros usuarios
- Usa las rachas como motivación grupal

## 🐛 Solución de Problemas

### Las tareas no se guardan
- Verifica que tu navegador permita localStorage
- Asegúrate de no estar en modo incógnito

### El sitio no carga
- Verifica que Hugo esté instalado correctamente
- Ejecuta `hugo version` para confirmar la instalación

### Las animaciones van lentas
- Cierra otras pestañas del navegador
- Actualiza tu navegador a la última versión

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🌟 Contribuciones

¡Las contribuciones son bienvenidas! Siéntete libre de mejorar el código, añadir características o reportar bugs.

---

**¡Hecho con 💜 para hacer la productividad más divertida!**

¿Preguntas? ¿Sugerencias? ¡Abre un issue o contribuye al proyecto!
