<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Run order matters — downstream seeders depend on upstream data.
     *
     * ┌─────────────────────────────────────────────────────┐
     * │  LAYER 1 — Foundation (no FK dependencies)         │
     * ├─────────────────────────────────────────────────────┤
     * │  Users, Permissions, Roles, Categories, Collections│
     * ├─────────────────────────────────────────────────────┤
     * │  LAYER 2 — Core entities                           │
     * ├─────────────────────────────────────────────────────┤
     * │  Products, POS Products, Customer Profiles,        │
     * │  Promocodes, Newsletter Subscribers                │
     * ├─────────────────────────────────────────────────────┤
     * │  LAYER 3 — Transactional / relational              │
     * ├─────────────────────────────────────────────────────┤
     * │  Appointments, Gift Requests, Alterings,           │
     * │  POS Invoices (items + payments), Activities       │
     * └─────────────────────────────────────────────────────┘
     */
    public function run(): void
    {
        // ── LAYER 1 — Foundation ──────────────────────────
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => bcrypt('password')]
        );

        $this->call(PermissionSeeder::class);
        $this->call(AdminSeeder::class);
        $this->call(CategorySeeder::class);
        $this->call(CollectionSeeder::class);

        // ── LAYER 2 — Core entities ───────────────────────
        $this->call(ProductsSeeder::class);
        $this->call(PosProductSeeder::class);
        $this->call(NileProductSeeder::class);
        $this->call(CustomerProfileSeeder::class);
        $this->call(PromocodeSeeder::class);
        $this->call(NewsletterSubscriptionSeeder::class);

        // ── LAYER 3 — Transactional / relational ──────────
        $this->call(AppointmentSeeder::class);
        $this->call(TestGiftRequestAndAppointmentSeeder::class);
        $this->call(AlteringSeeder::class);
        $this->call(PosInvoiceSeeder::class);
        $this->call(ActivitySeeder::class);
    }
}
