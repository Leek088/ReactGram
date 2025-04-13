<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Faz o login do usuário na aplicação.
     * Cria um token de autenticação com validade de uma semana.
     * Retorna o token e os dados do usuário.
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        // Validação da requisição
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Verifica se o usuário existe e se a senha está correta
        $user = User::where('email', $request->email)->first();

        // Se o usuário não existir ou a senha estiver incorreta, retorna erro
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Se as credenciais estiverem corretas, cria o token com uma semana de validade
        $token = $user->createToken($user->email, $user->abilities, now()->addWeek())->plainTextToken;

        // Retorna o token e os dados do usuário
        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => new UserResource($user),
        ], 200);
    }

    /**
     * Faz o logout do usuário na aplicação.
     * Revoga o token de autenticação atual.
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoga o token do usuário
        $request->user()->currentAccessToken()->delete();

        // Retorna mensagem de sucesso
        return response()->json([
            'message' => 'Logout successful',
        ], 200);
    }
}
