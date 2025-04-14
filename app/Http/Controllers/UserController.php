<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Exception;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


class UserController extends Controller
{
    /**
     * Cria um novo usuário no banco de dados.
     * O usuário é criado com as habilidades especificadas na requisição.
     * A senha é criptografada antes de ser armazenada.
     * Um token de acesso é gerado para o usuário com validade de uma semana.
     * Em caso de erro, uma mensagem de erro é registrada no log e uma resposta de erro é retornada.
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse
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
            'image' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Criptografa a senha
        $validadeData['password'] = bcrypt($validadeData['password']);

        // Inicializa a variável $user
        $user = new User();

        try {
            // Verifica se o arquivo de imagem foi enviado
            if ($request->file('image')) {
                // Gera um nome único para a imagem
                $imageName = time() . '.' . $request->file('image')->getClientOriginalExtension();

                // Armazena a imagem e adiciona o nome do arquivo à requisição
                $validadeData['profile_picture'] = $this->uploadImage($request->file('image'), $imageName);
            }

            // Cria o usuário e recupera seu valor.
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
            // Se existir, remove o user e a imagem do disco privado
            return $this->registerError($e->getMessage(), $user, $validadeData);
        }
    }

    /**
     * Exibe os dados de um usuário específico.
     * O usuário é identificado pelo ID passado como parâmetro.
     * Se o usuário não existir, uma resposta em json, cod. 404 é retornada.
     * Em caso de erro, uma mensagem de erro é registrada no log e uma resposta de erro é retornada.
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            // Verifica se o usuário existe
            $user = User::find($id);

            // Se o usuário não existir, retorna uma resposta de erro
            if (!$user) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);
            }

            // Retorna os dados do usuário
            return response()->json([
                'message' => 'User retrieved successfully',
                'data' => new UserResource($user),
            ], 200);
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
     * Atualiza os dados de um usuário específico.
     * O usuário é identificado pelo ID passado como parâmetro.
     * Os dados são validados antes de serem atualizados.
     * A senha é criptografada antes de ser armazenada.
     * Um novo token de acesso é gerado para o usuário com validade de uma semana.
     * Em caso de erro, uma mensagem de erro é registrada no log e uma resposta de erro é retornada.
     * @param \Illuminate\Http\Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        // Valida os dados da requisição
        $validadeData = $request->validate([
            'name' => 'required|string|min:3,max:255',
            'email' => "required|string|email|max:255|unique:users,email,$id",
            'password' => 'required|string|min:6|confirmed',
            'password_confirmation' => 'required|string|min:6',
            'abilities' => 'required|array',
            'image' => 'image|mimes:jpeg,png,jpg,gif',
        ]);

        // Inicializa a variável $user
        $user = new User();

        try {
            // Verifica se o usuário existe e recupera-o
            $user = User::find($id);

            // Se o usuário não existir, retorna uma resposta de erro
            if (!$user) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);
            }

            // Verifica se o arquivo de imagem foi recebido
            if ($request->file('image')) {
                //Recupera o nome da imagem
                $imageName = $user->profile_picture ?: null;
                // Atualiza a imagem do usuario da requisição
                $this->uploadImage($request->file('image'), $imageName);
            }

            // Criptografa a senha da requisição
            $validadeData['password'] = bcrypt($validadeData['password']);

            // Atualiza os dados do usuário
            $user->update($validadeData);

            // Cria um novo token de acesso com as habilidades especificadas. Duração de uma semana
            $token = $user->createToken($user->email, $validadeData['abilities'], now()->addWeek())->plainTextToken;

            // Retorna a resposta com o token e os dados do usuário atualizado
            return response()->json([
                'message' => 'User updated successfully',
                'token' => $token,
                'data' => new UserResource($user),
            ], 200);
        } catch (Exception $e) {
            // Registra o erro no log
            // Se existir, remove o user e a imagem do disco privado
            return $this->registerError($e->getMessage(), $user, $validadeData);
        }
    }

    /**
     * Faz upload de imagem, recebido da requisições POST.
     * O nome do arquivo é gerado com base no timestamp atual e na extensão original do arquivo.
     * A imagem é armazenada na pasta privada 'photo' dentro do disco 'photo'.
     * O nome do arquivo é retornado.
     * @param ?string $imageName
     * @param \Illuminate\Http\UploadedFile $image
     * @return string
     */
    private function uploadImage(UploadedFile $image, ?string $imageName): string
    {
        // Verifica se o nome da imagem foi passado
        if (!$imageName) {
            // Se não, gera um nome único para a imagem
            $imageName = time() . '.' . $image->getClientOriginalExtension();
        }

        // Armazena a imagem no disco privado 'photo'
        // Caso exista um arquivo com o mesmo nome, ele será sobrescrito
        $image->storeAs('photo', $imageName, 'photo');

        // Retorna o nome do arquivo
        return $imageName;
    }

    /**
     * Remove a imagem do disco privado -> 'photo'.
     * O nome do arquivo é passado como parâmetro.
     * @param string $imageName
     * @return bool
     */
    private function deleteImage(string $imageName): bool
    {
        return Storage::disk('photo')->delete("photo/$imageName");
    }

    /**
     * Registra um erro no log e remove o usuário do banco de dados.
     * Se existir, remove a imagem do disco privado.
     * @param string $message
     * @param \App\Models\User $user
     * @param array $validadeData
     * @return JsonResponse|mixed
     */
    private function registerError(string $message, ?User $user, array $validadeData): JsonResponse
    {
        // Registra o erro no log
        Log::channel('api_errors')->error("Erro na rota Post /users: $message");

        // Remove o usuário do banco de dados, se existir
        if (isset($user)) {
            $user->delete();
        }

        // Remove a imagem do disco privado, se existir
        if (isset($validadeData['profile_picture'])) {
            $this->deleteImage($validadeData['profile_picture']);
        }

        // Retorna uma resposta de erro em caso de falha
        return response()->json([
            'message' => 'Internal server error.',
            'error' => 'Ocorreu um erro ao processar sua solicitação.'
        ], 500);
    }
}
