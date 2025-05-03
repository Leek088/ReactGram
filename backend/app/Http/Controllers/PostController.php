<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;
use Str;

class PostController extends Controller
{
    /**
     * Retorna todos os posts do banco de dados.
     * Em caso de erro, é registrado no log e retorna status 500 em json.
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            // Busca todos os posts no banco de dados
            $posts = Post::all();

            // Verifica se existem posts
            if ($posts->isEmpty()) {
                return response()->json([
                    'message' => 'No posts found',
                ], 404);
            }

            // Retorna a resposta com os posts
            return response()->json([
                'message' => 'Posts retrieved successfully',
                'data' => PostResource::collection($posts),
            ], 200);
        } catch (Exception $e) {
            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota GET/posts: ' . $e->getMessage());
        }
    }

    /**
     * Retorna um post específico do banco de dados, relacionado ao ID.
     * Em caso de erro, é registrado no log e retorna status 500 em json.
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            // Busca o post pelo id
            $post = Post::find($id);

            // Verifica se o post existe
            if (!$post) {
                return response()->json([
                    'errors' => ['message' => 'Post not found',]
                ], 404);
            }

            // Recupera o usuario do post
            $user = User::find($post->user_id);

            $post['user_name'] = $user->name;

            // Retorna a resposta com o post
            return response()->json([
                'message' => 'Post retrieved successfully',
                'data' => new PostResource($post),
            ], 200);
        } catch (Exception $e) {
            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota GET/posts/{id}: ' . $e->getMessage());
        }
    }

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
            'bio' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp',
            'user_id' => 'required|exists:users,id',
        ]);

        // Instancia um novo post.
        // Será usado para receber o post criado.
        $post = new Post();

        try {
            // Verifica se o arquivo de imagem foi enviado
            if ($request->file('image')) {
                // Gera um nome único para a imagem
                $imageName = time() . '.' . $request->file('image')->getClientOriginalExtension();

                // Armazena a imagem e adiciona o nome do arquivo à requisição
                $validadeData['post_image'] = $this->uploadImage($request->file('image'), $imageName);
            }

            // Cria o usuário com os dados da requisição.
            $post = Post::create($validadeData);

            // Retorna a resposta de sucesso na postagem
            return response()->json([
                'message' => 'Post created successfully',
                'data' => new PostResource($post),
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
     * Atualiza um post específico do banco de dados.
     * A imagem é armazenada no disco privado 'posts'.
     * Em caso de erro, é registrado no log e retorna status 500 em json.
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        // Valida os dados da requisição
        $validadeData = $request->validate([
            'title' => 'required|string|max:255',
            'bio' => 'required|string|max:255',
            // 'image' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'
        ]);

        try {
            // Busca o post pelo id
            $post = Post::find($id);

            // Verifica se o post existe
            if (!$post) {
                return response()->json([
                    'errors' => [
                        'message' => 'Post not found',
                    ]
                ], 404);
            }

            /**
             * Código retirado.
             * Regra de negócio: Não atualiza-se mais a imagem do post
             */
            // Verifica se o arquivo de imagem foi recebido
            // if ($request->file('image')) {
            //     //Recupera o nome da imagem
            //     $imageName = $post->post_image ?: null;
            //     // Atualiza a imagem do usuario da requisição
            //     $this->uploadImage($request->file('image'), $imageName);
            // }

            // Atualiza os dados do post
            $post->update($validadeData);

            // Retorna a resposta com o post
            return response()->json([
                'message' => 'Post retrieved successfully',
                'data' => new PostResource($post),
            ], 200);
        } catch (Exception $e) {
            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota PUT/posts/{id}: ' . $e->getMessage());
        }
    }

    /**
     * Remove um post específico do banco de dados.
     * Remove a imagem do disco privado 'posts'.
     * Em caso de erro, é registrado no log e retorna status 500 em json.
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            // Busca o post pelo id
            $post = Post::find($id);

            // Verifica se o post existe
            if (!$post) {
                return response()->json([
                    'errors' => [
                        'message' => 'Post not found',
                    ],
                ], 404);
            }

            // Remove a imagem do disco privado 'posts'
            Storage::disk('posts')->delete("posts/{$post->post_image}");

            // Remove o post do banco de dados
            $post->delete();

            // Retorna a resposta de sucesso na remoção do post
            return response()->json([
                'message' => 'Post deleted successfully',
            ], 200);
        } catch (Exception $e) {
            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota DELETE/posts/{id}: ' . $e->getMessage());
        }
    }

    /**
     * Adiciona like ao post específico.
     * A lógica de like é implementada sendo Curtir e Descurtir.
     * Em caso de erro, é registrado no log e retorna status 500 em json.
     * @param string $id
     * @return JsonResponse
     */
    public function likePost(string $id): JsonResponse
    {
        try {
            // Busca o post pelo id
            $post = Post::find($id);

            // Verifica se o post existe
            if (!$post) {
                return response()->json([
                    'message' => 'Post not found',
                ], 404);
            }

            // Recupera o array dos likes do post
            $likes = $post->likes ?? []; // Caso não exista likes, é inicializado como vazio

            // Recupeara o id do usuário que está logado
            $userId = auth()->user()->id;

            // Implementa a lógica de like: Curtir/Descurtir
            if (in_array($userId, $likes)) {
                // Se já deu like, então remove
                $likes = array_diff($likes, [$userId]);
            } else {
                // Se não deu like, então adiciona
                $likes[] = $userId;
            }

            // Atualiza o post com os likes atuais
            $post->likes = $likes;

            // Salva as mudanças no banco
            $post->save();

            // Retorna a resposta de sucesso na adição do like
            return response()->json([
                'message' => 'Post liked successfully',
                'data' => new PostResource($post),
            ], 200);
        } catch (Exception $e) {
            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota PUT/posts/{id}/like: ' . $e->getMessage());
        }
    }

    /**
     * Adiciona um comentário ao post específico.
     * O comentário é criado com os dados do usuário logado.
     * Em caso de erro, é registrado no log e retorna status 500 em json.
     * @param \Illuminate\Http\Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function commentPost(Request $request, string $id): JsonResponse
    {
        // Valida os dados da requisição
        $validateData = $request->validate([
            'comment' => 'required|string',
        ]);

        try {
            // Busca o post pelo id
            $post = Post::find($id);

            // Verifica se o post existe
            if (!$post) {
                return response()->json([
                    'errors' => [
                        'message' => 'Post not found',
                    ]
                ], 404);
            }

            // Cria um array de comentários
            $comments = $post->comments ?? []; // Caso não exista, é inicializado como vazio

            // Cria o novo comentário, com os dados do usuário logado
            $comment = [
                'id' => Str::random(10),
                'user_id' => auth()->user()->id,
                'user_name' => auth()->user()->name,
                'user_image' => auth()->user()->profile_picture,
                'comment' => $validateData['comment'],
            ];

            // Adiciona o novo comentário ao array de comentários
            $comments[] = $comment;

            // Adiciona os comentários ao post
            $post->comments = $comments;

            // Salva as mudanças no banco
            $post->save();

            // Retorna a resposta de sucesso na adição do comentário
            return response()->json([
                'message' => 'Comment added successfully',
                'data' => new PostResource($post),
            ], 200);
        } catch (Exception $e) {
            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota PUT/posts/{id}/comment: ' . $e->getMessage());
        }
    }

    /**
     * Busca posts pelo título.
     * Retorna os posts que contêm a string de busca no título.
     * Em caso de erro, é registrado no log e retorna status 500 em json.
     * @param string $query
     * @return JsonResponse
     */
    public function searchPost(string $query): JsonResponse
    {
        try {
            // Busca os posts que contêm a string de busca no título
            $posts = Post::where('title', 'like', "%$query%")->get();

            // Verifica se existem posts
            if ($posts->isEmpty()) {
                return response()->json([
                    'message' => 'No posts found',
                ], 404);
            }

            // Retorna a resposta com os posts
            return response()->json([
                'message' => 'Posts retrieved successfully',
                'data' => PostResource::collection($posts),
            ], 200);
        } catch (Exception $e) {
            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota GET/posts/search/{query}: ' . $e->getMessage());
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
            'errors' =>
                [
                    'message' => 'Internal server error.',
                    'error' => 'Ocorreu um erro ao processar sua solicitação.'
                ]
        ], 500);
    }

    /**
     * Faz upload de imagem no disco.
     * Caso não receba o nome do arquivo, é gerado com base no timestamp.
     * A imagem é armazenada na pasta privada, do disco 'posts'.
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

        // Armazena a imagem no disco privado 'posts'
        // Caso exista um arquivo com o mesmo nome, ele será sobrescrito
        $image->storeAs('posts', $imageName, 'posts');

        // Retorna o nome do arquivo
        return $imageName;
    }
}
