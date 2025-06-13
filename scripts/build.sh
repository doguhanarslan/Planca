echo "🔨 Building application..."

# Clean ve build
dotnet clean > /dev/null
dotnet restore > /dev/null
dotnet build --configuration Release --no-restore > /dev/null

echo "✅ Build completed"

# Publish
echo "📦 Publishing..."
dotnet publish Planca.API/Planca.API.csproj \
  --configuration Release \
  --output ./publish \
  --no-build \
  --verbosity quiet

echo "✅ Publish completed"

# Create deployment package
echo "📦 Creating deployment package..."
cd publish
zip -r ../deployment.zip . > /dev/null
cd ..

echo "✅ Package created"

# Deploy to Azure
echo "🚀 Deploying to Azure..."
az webapp deployment source config-zip \
  --resource-group rg-planca-demo-06082150 \
  --name planca-demo-api-06082150 \
  --src deployment.zip \
  --output none

echo "✅ Deployed to Azure"

# App settings
echo "⚙️ Configuring app settings..."
az webapp config appsettings set \
  --resource-group rg-planca-demo-06082150 \
  --name planca-demo-api-06082150 \
  --settings \
    "ASPNETCORE_ENVIRONMENT=Production" \
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false" \
  --output none

# Restart app
echo "🔄 Restarting application..."
az webapp restart \
  --resource-group rg-planca-demo-06082150 \
  --name planca-demo-api-06082150 \
  --output none

echo "✅ Application restarted"