<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    /**
     * Cria um novo post no banco de dados.
     * É feito a validação dos dados da requisição.
     * A imagem é armazenada no disco privado 'posts'.
     * Em caso de erro, desfaz toda operação, remove o post e imagem.
     * Em caso de erro, é registrado no log e retorna status 500 em json.
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Valida os dados da requisição
        $validadeData = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'user_id' => 'required|exists:users,id',
        ]);

        // Instancia um novo post.
        // Será usado para receber o post criado.
        $post = new Post();

        try {
            // Gera um nome único para a imagem
            $imageName = time() . '.' . $request->file('image')->getClientOriginalExtension();

            // Armazena a imagem no disco privado 'posts'
            $request->file('image')->storeAs('posts', $imageName, 'posts');

            // Adiciona o nome da imagem à requisição
            $validadeData['post_image'] = $imageName;

            // Cria o usuário com os dados da requisição.
            $post = Post::create($validadeData);

            // Retorna a resposta de sucesso na postagem
            return response()->json([
                'message' => 'Post created successfully',
                'data' => $post,
            ], 201);
        } catch (Exception $e) {
            // Previne que a imagem seja removida disco.
            Storage::disk('posts')->delete("posts/$imageName");

            // Remove o post do banco de dados, se existir
            if ($post) {
                $post->delete(); // Deleta o post
            }

            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota POST/posts: ' . $e->getMessage());
        }
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

        // Retorna a resposta de erro
        return response()->json([
            'message' => 'Internal server error.',
            'error' => 'Ocorreu um erro ao processar sua solicitação.'
        ], 500);
    }
}
