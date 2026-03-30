# Attire Lounge - Project Documentation

## 👗 Overview
**Attire Lounge** is a modern e-commerce and service platform built with Laravel 12 and React. It features a rich product catalog, appointment scheduling, and a unique gift request system, all wrapped in a high-performance, smooth-scrolling user experience.

---

## 🛠 Tech Stack

### Backend
- **Framework:** [Laravel 12](https://laravel.com) (PHP 8.2+)
- **Concurrency & Performance:** [Laravel Octane](https://laravel.com/docs/octane)
- **Real-time:** [Laravel Reverb](https://reverb.laravel.com) (WebSocket server)
- **Security:** [Laravel Sanctum](https://laravel.com/docs/sanctum) (API tokens), [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission) (Roles/Permissions)
- **Image Processing:** [Intervention Image 3](https://image.intervention.io)
- **Storage:** AWS S3 (via League Flysystem)
- **Database Tools:** Doctrine DBAL (for schema manipulations)

### Frontend
- **Library:** [React 18](https://react.dev)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com) with Headless UI
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **State Management & Data Fetching:** [TanStack React Query v5](https://tanstack.com/query/latest)
- **Routing:** React Router 6
- **Build Tool:** [esbuild](https://esbuild.github.io) (Optimized for speed)
- **UX Enhancements:** 
  - [Lenis](https://lenis.darkroom.engineering/) (Smooth scrolling)
  - [Lucide React](https://lucide.dev) (Icons)
  - React Helmet Async (SEO management)

### Infrastructure & DevOps
- **Deployment:** Docker (Multistage build), Nixpacks, Caddy, Nginx
- **Real-time Notifications:** Telegram Bot (polling & notifications)
- **Queue/Cache:** Redis

---

## 🚀 Key Features

- **Product & Collection Management:** Full CRUD for products and themed collections with integrated SEO fields.
- **Appointment System:** Users can book appointments for services, with status tracking and Telegram notifications for admins.
- **Gift Request System:** A specialized workflow for users to request curated gift selections.
- **Customer Profiles:** Personalized profiles for tracking interactions and preferences.
- **Admin Dashboard:** A dedicated React-based admin interface (`admin.tsx`) for managing the entire platform.
- **Newsletter:** Phone-based newsletter subscription system.
- **Auditing:** `Auditable` trait for tracking model changes.
- **Real-time Updates:** Stock and product updates broadcasted via WebSockets.

---

## 📂 Directory Highlights

- `app/DTOs`: Data Transfer Objects for clean data handling (e.g., `ProductFilterDTO`).
- `app/Services`: Business logic encapsulated in service classes (e.g., `AppointmentService`).
- `app/Listeners`: Event listeners like `SendTelegramNotification`.
- `resources/js`: React application root.
  - `app.jsx`: Main customer-facing application.
  - `admin.tsx`: Admin dashboard application.
- `database/migrations`: Comprehensive schema history including SEO and stock management.

---

## 🛠 Development Commands

### Setup
Run the project setup script:
```bash
composer run setup
```

### Running the Development Environment
Start all services (Server, Queue, Telegram Bot, Reverb, and Assets):
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

---

## 🧪 Testing & Debugging
- **PHPUnit:** `php artisan test`
- **Utility Scripts:** See `scripts/` directory for manual schema checks and API tests.
