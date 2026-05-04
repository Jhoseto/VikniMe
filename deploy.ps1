# deploy.ps1 — Deploy Vikni.me to Google Cloud Run
# Run: .\deploy.ps1 -ProjectId "your-project-id"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,

    [string]$Region  = "europe-west1",
    [string]$Service = "vikni-me",
    [string]$Image   = "gcr.io/$ProjectId/vikni-me"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Deploying Vikni.me to Google Cloud Run..." -ForegroundColor Cyan
Write-Host "   Project : $ProjectId"
Write-Host "   Region  : $Region"
Write-Host "   Service : $Service"
Write-Host "   Image   : $Image`n"

# 1. Set project
Write-Host "1/4 Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# 2. Enable required APIs (idempotent)
Write-Host "2/4 Enabling APIs..." -ForegroundColor Yellow
gcloud services enable `
    run.googleapis.com `
    cloudbuild.googleapis.com `
    containerregistry.googleapis.com

# 3. Build & push via Cloud Build (no local Docker needed)
Write-Host "3/4 Building image via Cloud Build..." -ForegroundColor Yellow
gcloud builds submit `
    --config cloudbuild.yaml `
    --substitutions="_REGION=$Region,_SERVICE=$Service"

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green

# 4. Get the service URL
Write-Host "4/4 Fetching service URL..." -ForegroundColor Yellow
$url = gcloud run services describe $Service `
    --region $Region `
    --format "value(status.url)"

Write-Host "`n🌐 App is live at: $url" -ForegroundColor Cyan
Write-Host "   Share this URL with anyone!`n"
