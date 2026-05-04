# Деплой на Vikni.me → Google Cloud Run

Приложението е **статичен React SPA** (Vite build → nginx). Няма backend — всичко е mock данни в браузъра.

---

## Бърз старт (5 стъпки)

### 1. Инсталирай Google Cloud SDK

Свали от: https://cloud.google.com/sdk/docs/install-sdk

```powershell
# Провери инсталацията
gcloud --version
```

### 2. Влез в Google акаунта си

```powershell
gcloud auth login
```

### 3. Създай Google Cloud проект (или използвай съществуващ)

```powershell
# Създай нов проект
gcloud projects create vikni-me-prod --name="Vikni.me"

# ИЛИ избери съществуващ
gcloud projects list
gcloud config set project <PROJECT_ID>
```

> ⚠️ Нужен е **активен billing акаунт** в GCP Console за Cloud Run.
> Cloud Run е безплатен до 2 000 000 заявки/месец.

### 4. Деплойни с един команд

```powershell
# От директорията h:\Apps\VikniMe\VikniMe
.\deploy.ps1 -ProjectId "vikni-me-prod"
```

Скриптът автоматично:
- Активира Cloud Run, Cloud Build и Container Registry APIs
- Билдва Docker image **в облака** (не е нужен локален Docker)
- Пуша image-а в Google Container Registry
- Деплойва на Cloud Run с публичен достъп
- Извежда финалния URL

### 5. Отвори URL-а

След 2-3 минути ще видиш нещо като:

```
🌐 App is live at: https://vikni-me-abc123-ew.a.run.app
```

---

## Ръчен деплой (без скрипта)

```powershell
$PROJECT = "vikni-me-prod"
$REGION  = "europe-west1"
$SERVICE = "vikni-me"
$IMAGE   = "gcr.io/$PROJECT/vikni-me"

# Билд + пуш + деплой наведнъж
gcloud builds submit --config cloudbuild.yaml `
    --project $PROJECT `
    --substitutions="_REGION=$REGION,_SERVICE=$SERVICE"
```

---

## Персонализиран домейн

```powershell
# Добави собствен домейн (напр. vikni.me)
gcloud run domain-mappings create `
    --service vikni-me `
    --domain vikni.me `
    --region europe-west1
```

Добави показания DNS запис при твоя домейн доставчик.

---

## Обновяване (след промени в кода)

Просто пусни отново:

```powershell
.\deploy.ps1 -ProjectId "vikni-me-prod"
```

---

## Цени (приблизително)

| Ресурс | Безплатно | Цена след лимита |
|---|---|---|
| Cloud Run заявки | 2M/месец | $0.40 / 1M |
| Cloud Build | 120 мин/ден | $0.003 / мин |
| Container Registry | 0.5 GB | $0.10 / GB |

За demo/preview трафик — **практически $0**.

---

## Demo акаунти

| Email | Парола | Роля |
|---|---|---|
| `demo@vikni.me` | `demo1234` | Клиент |
| `supplier@vikni.me` | `demo1234` | Доставчик |
| `admin@vikni.me` | `demo1234` | Администратор |
