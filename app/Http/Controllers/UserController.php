<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Cria um novo usuário no banco de dados.
     * O usuário é criado com as habilidades especificadas na requisição.
     * A senha é criptografada antes de ser armazenada.
     * Um token de acesso é gerado para o usuário com validade de uma semana.
     * Em caso de erro, uma mensagem de erro é registrada no log e uma resposta de erro é retornada.
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse|mixed
     */
    public function store(Request $request): JsonResponse
    {
        // Valida os dados da requisição
        $validadeData = $request->validate([
            'name' => 'required|string|min:3,max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'password_confirmation' => 'required|string|min:6',
            'abilities' => 'required|array',
        ]);

        // Criptografa a senha
        $validadeData['password'] = bcrypt($validadeData['password']);

        try {
            // Cria o usuário
            $user = User::create($validadeData);

            // Cria o token de acesso com as habilidades especificadas. Duração de uma semana
            $token = $user->createToken($user->email, $validadeData['abilities'], now()->addWeek())->plainTextToken;

            // Retorna a resposta com o token e os dados do usuário
            return response()->json([
                'message' => 'User created successfully',
                'token' => $token,
                'data' => $user,
            ], 201);
        } catch (Exception $e) {
            // Registra o erro no log
            Log::channel('api_errors')->error('Erro na rota Post /users: ' . $e->getMessage());

            // Retorna uma resposta de erro em caso de falha
            return response()->json([
                'message' => 'Internal server error.',
                'error' => 'Ocorreu um erro ao processar sua solicitação.'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
