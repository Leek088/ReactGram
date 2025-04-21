<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
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

        // Instancia um novo usuário.
        // Será usado para receber o usuário criado.
        $user = new User();

        try {
            // Cria a variável para armazenar o nome da imagem
            $imageName = null;

            // Verifica se o arquivo de imagem foi enviado
            if ($request->file('image')) {
                // Gera um nome único para a imagem
                $imageName = time() . '.' . $request->file('image')->getClientOriginalExtension();

                // Armazena a imagem e adiciona o nome do arquivo à requisição
                $validadeData['profile_picture'] = $this->uploadImage($request->file('image'), $imageName);
            }

            // Cria o usuário com os dados da requisição.
            $user = User::create($validadeData);

            // Cria o token de acesso com as habilidades especificadas. Duração de uma semana
            $token = $user->createToken($user->email, $validadeData['abilities'], now()->addWeek())->plainTextToken;

            // Retorna a resposta com o token e os dados do usuário
            return response()->json([
                'message' => 'User created successfully',
                'token' => $token,
                'data' => new UserResource($user),
            ], 201);
        } catch (Exception $e) {
            // Verifica se o nome da imagem foi criado
            if ($imageName) {
                // Previne que seja removida, caso aramzenada no disco privado.
                Storage::disk('users')->delete("users/$imageName");
            }

            // Remove o usuário do banco de dados, se existir
            if ($user) {
                $user->delete(); // Deleta o usuário
            }

            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota POST/users: ' . $e->getMessage());
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
                    'errors' => [
                        'message' => 'User not found',
                    ]
                ], 404);
            }

            // Retorna os dados do usuário
            return response()->json([
                'message' => 'User retrieved successfully',
                'data' => new UserResource($user),
            ], 200);
        } catch (Exception $e) {
            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota GET/users/{id}: ' . $e->getMessage());
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
            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota PUT/users: ' . $e->getMessage());
        }
    }

    /**
     * Recupera os posts de um usuário específico.
     * O usuário é identificado pelo ID passado como parâmetro.
     * Se o usuário não existir, uma resposta em json, cod. 404 é retornada.
     * Em caso de erro, uma mensagem de erro é registrada no log e uma resposta de erro é retornada.
     * @param string $id
     * @return JsonResponse
     */
    public function getUserPosts(string $id): JsonResponse
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

            // Recupera os posts do usuário
            $posts = $user->posts()->get();

            // Retorna os dados do usuário e os posts
            return response()->json([
                'message' => 'User posts retrieved successfully',
                'data' => [
                    'user' => new UserResource($user),
                    'posts' => PostResource::collection($posts),
                ],
            ], 200);
        } catch (Exception $e) {
            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota GET/users/{id}/posts: ' . $e->getMessage());
        }
    }

    /**
     * Faz upload de imagem no disco.
     * Caso não receba o nome do arquivo, é gerado com base no timestamp.
     * A imagem é armazenada na pasta privada, do disco 'users'.
     * O nome do arquivo é retornado.
     * @param ?string $imageName
     * @param ?\Illuminate\Http\UploadedFile $image
     * @return string
     */
    private function uploadImage(UploadedFile $image, ?string $imageName): string
    {
        // Verifica se o nome da imagem foi passado
        if (!$imageName) {
            // Se não, gera um nome único para a imagem
            $imageName = time() . '.' . $image->getClientOriginalExtension();
        }

        // Armazena a imagem no disco privado 'users'
        // Caso exista um arquivo com o mesmo nome, ele será sobrescrito
        $image->storeAs('users', $imageName, 'users');

        // Retorna o nome do arquivo
        return $imageName;
    }

    /**
     * Registra um erro no log/api_errors.log.
     * Retorna uma resposta de erro, cod. 500, em json.
     * @param string $message
     * @return JsonResponse
     */
    private function registerError(string $message): JsonResponse
    {
        // Registra o erro no log
        Log::channel('api_errors')->error($message);

        // Retorna uma resposta de erro em caso de falha
        return response()->json([
            'errors' => [
                'message' => 'Internal server error.',
                'error' => 'Ocorreu um erro ao processar sua solicitação.'
            ],
        ], 500);
    }
}
