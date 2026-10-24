# Janaikya - Multilingual Healthcare Platform

A comprehensive healthcare platform supporting 8 Indian languages with AI-powered medical assistance, GPS location services, and complete medical ecosystem integration.

## 🌍 Supported Languages

- English
- Hindi (हिन्दी)
- Bengali (বাংলা)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Gujarati (ગુજરાતી)
- Marathi (मराठी)
- Punjabi (ਪੰਜਾਬੀ)

## 🚀 Features

- **AI Health Assistant** - Google Gemini powered medical guidance
- **Doctor Consultation** - Find and consult with certified doctors
- **Hospital Network** - Access to trusted hospitals and medical centers
- **Medicine Marketplace** - Search and purchase medications
- **GPS Location Services** - Real-time location detection
- **Multilingual Interface** - Complete healthcare accessibility in Indian languages

## 🛠️ Project Structure

```text
medic_all/
├── frontend/             # React + Vite + Tailwind + TypeScript
│   ├── src/              # Application source code
│   ├── public/           # Static assets and translations
│   └── package.json      # Frontend dependencies & scripts
├── backend/              # Supabase database & serverless backend
│   └── supabase/         # Migrations, Edge Functions, bootstrap.sql
└── package.json          # Root runner scripts (npm run dev / npm run build)
```

## 📋 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/asmit-inzanist/JanAikya.git
cd JanAikya
```

### 2. Install Dependencies
```bash
npm run install:all
# Or navigate to frontend:
# cd frontend && npm install
```

### 3. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual Supabase, ZegoCloud & Gemini values
```

### 4. Start Development Server
```bash
npm run dev
```

## 🔒 Security Notice

**IMPORTANT**: Never commit sensitive files to git:
- `.env` files contain API keys and secrets
- `supabase/config.toml` contains project credentials
- Always use the `.example` files as templates

## 🌐 Deployment

The project can be deployed easily on modern hosting platforms:
- **Vercel** (Recommended): Connect the GitHub repository, set your environment variables from `.env`, and click Deploy. Pre-configured `vercel.json` handles all SPA routing.
- **Netlify**: Connect the GitHub repository with base directory `frontend` and publish directory `dist`. Pre-configured `_redirects` handles SPA routes.
- **Render** / **Cloudflare Pages**

## 💻 Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Lucide Icons
- **Backend & Database**: Supabase (PostgreSQL, Realtime, Edge Functions)
- **AI Medical Assistant**: Google Gemini API
- **Video Consultation**: ZegoCloud UIKit
- **Localization**: i18next (8 Indian Languages: English, Hindi, Bengali, Tamil, Telugu, Gujarati, Marathi, Punjabi)

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
