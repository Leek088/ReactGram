<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;


Route::controller(AuthController::class)->group(function (): void {
    Route::post('/login', 'login');
    Route::post('/logout', 'logout')->middleware('auth:sanctum');
});

Route::controller(UserController::class)->group(function (): void {
    Route::get('/users/{id}', 'show')->middleware('auth:sanctum'); // Recupera um usuário
    Route::post('/users', 'store'); // Cria um novo usuário
    Route::put('/users/{id}', 'update')->middleware('auth:sanctum'); // Atualiza um usuário
    Route::get('/users/{id}/posts', 'getUserPosts')->middleware('auth:sanctum'); // Recupera os posts de um usuário
});

Route::controller(PostController::class)->group(function (): void {
    Route::get('/posts', 'index')->middleware('auth:sanctum'); // Recupera todos os posts
    Route::get('/posts/{id}', 'show')->middleware('auth:sanctum'); // Recupera um post específico
    Route::post('/posts', 'store')->middleware('auth:sanctum'); // Cria um novo post
    Route::put('/posts/{id}', 'update')->middleware('auth:sanctum'); // Atualiza um post
    Route::delete('/posts/{id}', 'destroy')->middleware('auth:sanctum'); // Deleta um post
    Route::put('/posts/{id}/like', 'likePost')->middleware('auth:sanctum'); // Adiciona um like a um post
    Route::put('/posts/{id}/comment', 'commentPost')->middleware('auth:sanctum'); // Adiciona um comentário a um post
    Route::get('/posts/search/{query}', 'searchPost')->middleware('auth:sanctum'); // Busca posts por título
});
