<p align="center">
  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo">
</p>

# 👗 Attire Lounge

**Attire Lounge** is a high-performance, modern e-commerce and booking platform built with **Laravel 12** and **React 18**. It offers a seamless user experience with smooth scrolling, elegant animations, and real-time updates.

---

## ✨ Features

- 🛍 **Product Catalog:** Manage products and curated collections with integrated SEO.
- 📅 **Appointment Booking:** Seamless scheduling for fashion consultations and services.
- 🎁 **Gift Requests:** A unique system for users to request and manage gift curated selections.
- 💬 **Telegram Integration:** Real-time admin notifications for appointments and requests.
- ⚡ **Real-time Updates:** WebSocket-driven stock and product updates via **Laravel Reverb**.
- 🚀 **Smooth UX:** Integrated **Lenis** for smooth scrolling and **Framer Motion** for polished animations.

---

## 🛠 Tech Stack

- **Backend:** Laravel 12 (PHP 8.2+), Octane, Reverb, Sanctum, Tinker, Intervention Image, Spatie Permission.
- **Frontend:** React 18, Tailwind CSS, Framer Motion, Lucide React, React Query, Axios, Lenis, Headless UI.
- **Build Tool:** esbuild.
- **Infrastructure:** Docker, Caddy, Nixpacks, Redis.

---

## 📖 Documentation

For a detailed breakdown of the architecture, tech stack, and development workflows, please refer to the **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**.

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Node.js & NPM
- Composer
- Redis (Optional, recommended for production)

### Setup
```bash
# Install dependencies and setup environment
composer run setup
```

### Development
```bash
# Start all services (Server, Queue, Bot, Reverb, Assets)
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 🏗 Directory Structure Highlights

- `app/Services`: Business logic encapsulation.
- `resources/js/app.jsx`: Main React application.
- `resources/js/admin.tsx`: Admin dashboard interface.
- `scripts/`: Utility and debugging scripts.

---

## 🛡 License
The project is proprietary software. All rights reserved.
