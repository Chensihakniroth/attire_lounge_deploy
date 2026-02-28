<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckUserRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:check-role {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check the roles of a user by email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if ($user) {
            $roles = $user->getRoleNames();
            if ($roles->isEmpty()) {
                $this->info("User '{$email}' has no roles.");
            } else {
                $this->info("User '{$email}' has roles: " . $roles->join(', '));
            }
        } else {
            $this->error("User with email '{$email}' not found.");
        }
    }
}
