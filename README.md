# Medic-AL - Multilingual Healthcare Platform

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

## 🛠️ Technologies

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS  
- **Backend**: Supabase
- **AI**: Google Gemini
- **Internationalization**: react-i18next

## 📋 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/asmit-inzanist/medic_all.git
cd medic_all
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_publishable_key"
VITE_SUPABASE_URL="https://your_project_id.supabase.co"
```

### 4. Supabase Setup
```bash
# Copy the example config
cp supabase/config.example.toml supabase/config.toml

# Edit config.toml with your project ID
project_id = "your_supabase_project_id"
```

### 5. Start Development Server
```bash
npm run dev
```

## 🔒 Security Notice

**IMPORTANT**: Never commit sensitive files to git:
- `.env` files contain API keys and secrets
- `supabase/config.toml` contains project credentials
- Always use the `.example` files as templates

## 🌐 Deployment

The project can be deployed on any modern hosting platform:
- Vercel
- Netlify  
- Render
- Or use Lovable for instant deployment

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Project info

**URL**: https://lovable.dev/projects/8d7425c7-c581-4e53-92a1-9455e8dd7b11

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8d7425c7-c581-4e53-92a1-9455e8dd7b11) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8d7425c7-c581-4e53-92a1-9455e8dd7b11) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
