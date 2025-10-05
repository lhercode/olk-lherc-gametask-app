# 🚀 Guía de Despliegue a GitHub Pages

Esta guía te ayudará a desplegar tu sitio TaskQuest a GitHub Pages.

## 📋 Requisitos Previos

1. **Cuenta de GitHub**: Necesitas una cuenta en GitHub
2. **Repositorio**: Tu código debe estar en un repositorio de GitHub
3. **Permisos**: Debes tener permisos de administrador en el repositorio

## 🔧 Pasos para el Despliegue

### 1. Preparar el Repositorio

Asegúrate de que tu repositorio tenga la siguiente estructura:
```
task-game/
├── .github/
│   └── workflows/
│       └── gh-pages.yml
├── .gitignore
├── config.toml
├── content/
├── themes/
└── public/
    └── .nojekyll
```

### 2. Configurar GitHub Pages

1. **Ve a tu repositorio en GitHub**
2. **Haz clic en "Settings"** (Configuración)
3. **En el menú lateral, busca "Pages"**
4. **En "Source", selecciona "GitHub Actions"**
5. **Guarda los cambios**

### 3. Hacer Push del Código

```bash
# Añadir todos los archivos
git add .

# Hacer commit
git commit -m "Configurar para GitHub Pages"

# Subir a GitHub
git push origin main
```

### 4. Verificar el Despliegue

1. **Ve a la pestaña "Actions"** en tu repositorio
2. **Verifica que el workflow "GitHub Pages" se ejecute correctamente**
3. **Una vez completado, tu sitio estará disponible en:**
   ```
   https://taskquest.lherc.com/
   ```

## 🔍 Solución de Problemas

### El sitio no se despliega

1. **Verifica la configuración de Pages**:
   - Source debe estar en "GitHub Actions"
   - No en "Deploy from a branch"

2. **Revisa los logs de Actions**:
   - Ve a la pestaña "Actions"
   - Haz clic en el workflow fallido
   - Revisa los logs para encontrar el error

### El sitio se ve roto

1. **Verifica la configuración de `baseURL`** en `config.toml`:
   ```toml
   baseURL = "https://taskquest.lherc.com/"
   ```

2. **Asegúrate de que el archivo `.nojekyll` existe** en la carpeta `public/`

### Los assets no cargan

1. **Verifica que las rutas sean relativas** en el HTML generado
2. **Asegúrate de que el tema esté correctamente configurado**

## 🛠️ Comandos Útiles

### Desarrollo Local
```bash
# Servidor de desarrollo
hugo server -D

# Construir para producción
hugo --minify
```

### Limpiar y Reconstruir
```bash
# Limpiar archivos generados
rm -rf public resources

# Reconstruir
hugo --minify
```

## 📝 Notas Importantes

- **El archivo `.nojekyll`** es crucial para que GitHub Pages sirva correctamente los archivos estáticos
- **La configuración de `baseURL`** debe coincidir con la URL de tu repositorio
- **Los workflows de GitHub Actions** se ejecutan automáticamente en cada push a la rama `main`

## 🎉 ¡Listo!

Una vez completados estos pasos, tu sitio TaskQuest estará disponible en GitHub Pages y se actualizará automáticamente cada vez que hagas push de cambios.

**URL de tu sitio**: `https://taskquest.lherc.com/`
