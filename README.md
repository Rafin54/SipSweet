# 🌸 SipSweet Lamia - Hydration Tracker

A beautiful, flower-themed Progressive Web App (PWA) for gentle hydration reminders, designed specifically for Princess Lamia.

![SipSweet Lamia](https://img.shields.io/badge/PWA-Ready-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue) ![Supabase](https://img.shields.io/badge/Supabase-Powered-green)

## ✨ Features

- 🌺 **Flower-themed Design**: Beautiful, calming interface with customizable flower themes
- 💧 **Smart Hydration Tracking**: Log water intake with personalized goals
- 🔔 **Push Notifications**: Gentle reminders that respect your schedule
- 🌙 **Do-Not-Disturb**: Automatic silence during sleep hours (2:00 AM - 11:00 AM)
- 📱 **Progressive Web App**: Install on any device, works offline
- 🎯 **Personalized Experience**: Custom nickname and flower preferences
- 📊 **Progress Tracking**: Visual progress with flower-petal indicators
- ☁️ **Cloud Sync**: Data synchronized across devices via Supabase

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for cloud features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Rafin54/SipSweet.git
cd SipSweet
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials and VAPID keys.

4. **Run the development server**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Push Notifications (Generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# App URL (for production)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 📱 PWA Features

- **Installable**: Add to home screen on mobile and desktop
- **Offline Support**: Works without internet connection
- **Push Notifications**: Background reminders with custom actions
- **Service Worker**: Automatic updates and caching

## 🎨 Customization

- **Flower Themes**: Rose, Lily, Sunflower, Cherry Blossom, Lavender
- **Personalization**: Custom nickname and greeting messages
- **Goals**: Adjustable daily hydration targets
- **Intervals**: Customizable reminder frequency
- **DND Settings**: Flexible do-not-disturb windows

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
```bash
npx vercel
```

2. **Add environment variables** in Vercel Dashboard

3. **Deploy**
```bash
npx vercel --prod
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom flower theme
- **Database**: Supabase (PostgreSQL)
- **Push Notifications**: Web Push API with VAPID
- **PWA**: Service Worker with offline support
- **Deployment**: Vercel with automatic cron jobs

## 💝 Made with Love

Created with 🌸 for Princess Lamia's hydration journey.

---

**Stay hydrated, stay beautiful! 💧🌺**
