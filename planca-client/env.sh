#!/bin/sh

# Azure Container Apps environment variable injection
# Bu script container başlatıldığında environment variable'ları
# React uygulamasına inject eder

echo "🔧 Environment variables injection başlatılıyor..."

# Default API URL if not provided
API_URL=${VITE_API_URL:-"https://planca-api.graymeadow-92ecb79d.northeurope.azurecontainerapps.io/api"}

echo "🌐 API URL: $API_URL"

# Create runtime config file for the frontend
cat > /usr/share/nginx/html/config.js << EOF
window.ENV = {
  VITE_API_URL: '$API_URL',
  REACT_APP_API_URL: '$API_URL'
};
console.log('🔧 Environment config loaded:', window.ENV);
EOF

echo "✅ Environment variables injection tamamlandı!"
echo "📁 Config file created at: /usr/share/nginx/html/config.js"

# Show the generated config for debugging
echo "📋 Generated config:"
cat /usr/share/nginx/html/config.js 