<?php

use Illuminate\Support\Facades\Route;

// Admin routes
Route::get('/admin/{any?}', function () {
    return view('admin');
})->where('any', '.*');

// Frontend routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
