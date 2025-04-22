<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Log;

class FileController extends Controller
{
    /**
     * Recupera o arquivo passado por parâmetro.
     * Retorna o arquivo como uma resposta.
     * Se o arquivo não for encontrado, retorna um erro 404.
     * Se ocorrer um erro, registra o erro no log e retorna um erro 500.
     * @param string $filename
     * @return BinaryFileResponse|JsonResponse|mixed
     */
    public function getFile(string $filename): BinaryFileResponse|JsonResponse
    {
        try {
            // Cria o caminho completo do arquivo
            $path = storage_path("app/private/$filename");

            // Verifica se o arquivo existe
            if (!file_exists($path)) {
                // Retorna um erro 404 se o arquivo não for encontrado
                return response()->json([
                    'errors' => ['message' => 'File not found']
                ], 404);
            }

            // Retorna o arquivo como uma resposta
            return response()->file($path);
        } catch (\Exception $e) {
            // Registra o erro no log e retorna um JsonResponse com erro 500.
            return $this->registerError('Erro na rota GET/posts: ' . $e->getMessage());
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
            'errors' => [
                'message' => 'Internal server error.',
                'error' => 'Ocorreu um erro ao processar sua solicitação.'
            ]
        ], 500);
    }
}
