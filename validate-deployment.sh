#!/bin/bash

# Script de validación para GitHub Pages
echo "🔍 Validando configuración para GitHub Pages..."

# Verificar que Hugo está instalado
if ! command -v hugo &> /dev/null; then
    echo "❌ Hugo no está instalado. Instálalo desde: https://gohugo.io/installation/"
    exit 1
fi

echo "✅ Hugo está instalado: $(hugo version)"

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf public resources

# Construir el sitio
echo "🏗️ Construyendo el sitio..."
hugo --minify

# Verificar archivos críticos
echo "🔍 Verificando archivos críticos..."

# Verificar que index.html existe
if [ ! -f "public/index.html" ]; then
    echo "❌ public/index.html no existe"
    exit 1
fi
echo "✅ public/index.html existe"

# Verificar que .nojekyll existe
if [ ! -f "public/.nojekyll" ]; then
    echo "❌ public/.nojekyll no existe"
    exit 1
fi
echo "✅ public/.nojekyll existe"

# Verificar que los assets existen
if [ ! -f "public/css/style.css" ]; then
    echo "❌ public/css/style.css no existe"
    exit 1
fi
echo "✅ public/css/style.css existe"

if [ ! -f "public/js/app.js" ]; then
    echo "❌ public/js/app.js no existe"
    exit 1
fi
echo "✅ public/js/app.js existe"

# Verificar configuración
echo "🔍 Verificando configuración..."

# Verificar baseURL
if grep -q 'baseURL = "https://taskquest\.lherc\.com' config.toml; then
    echo "✅ baseURL configurado para taskquest.lherc.com"
else
    echo "❌ baseURL no está configurado para taskquest.lherc.com"
    echo "   Debe ser: baseURL = \"https://taskquest.lherc.com/\""
fi

# Verificar que el workflow existe
if [ -f ".github/workflows/gh-pages.yml" ]; then
    echo "✅ Workflow de GitHub Actions existe"
else
    echo "❌ Workflow de GitHub Actions no existe"
fi

# Verificar .gitignore
if [ -f ".gitignore" ]; then
    echo "✅ .gitignore existe"
else
    echo "❌ .gitignore no existe"
fi

echo ""
echo "🎉 Validación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Haz commit y push de todos los archivos"
echo "2. Ve a Settings > Pages en tu repositorio"
echo "3. Configura Source como 'GitHub Actions'"
echo "4. Tu sitio estará disponible en: https://taskquest.lherc.com/"
echo ""
echo "📖 Para más detalles, consulta DEPLOYMENT.md"
