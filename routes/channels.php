<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Only authenticated admin users can listen to admin notifications
Broadcast::channel('admin-notifications', function (User $user) {
    return $user->hasAnyRole(['admin', 'super-admin']);
});
