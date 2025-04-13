<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;


Route::controller(AuthController::class)->group(function (): void {
    Route::post('/login', 'login');
    Route::post('/logout', 'logout')->middleware('auth:sanctum');
});

Route::controller(UserController::class)->group(function (): void {
    Route::get('/users', 'index')->middleware('auth:sanctum');
    Route::get('/users/{id}', 'show')->middleware('auth:sanctum');
    Route::post('/users', 'store')->middleware('auth:sanctum');
    Route::put('/users/{id}', 'update')->middleware('auth:sanctum');
    Route::delete('/users/{id}', 'destroy')->middleware('auth:sanctum');
});
