/**
 * arquivo de configuração para requisições à API
 * api - URL da API
 * requestConfig - função que retorna a configuração da requisição
 */
import { api, requestConfig } from "../utils/config";

/**
 * Recupera os posts do usuário, na API, pelo ID
 * A requisição é feita com fetch - método GET, sem body e com o token de autenticação
 * @param {string} id - ID do usuário
 * @returns {object} - Objeto com os dados do usuário
 */
const getPostsByUserId = async (id) => {
  // Recupera o token do localStorage
  const token = JSON.parse(localStorage.getItem("access_token"));

  // Recupera a configuração da requisição
  const config = requestConfig("GET", null, token);

  try {
    // Faz a requisição à API
    const res = await fetch(api + "/users/" + id + "/posts", config)
      // Se a requisição for bem sucedida, retorna o objeto
      .then((res) => res.json())
      // Se a requisição falhar, retorna o erro
      .catch((err) => err);

    // retorna o resultado da requisição
    return res;
  } catch (error) {
    // Se ocorrer um erro, imprime o erro no console
    console.log(error);
  }
};

/**
 * Cria um novo post
 * A requisição é feita com fetch - método POST, com o body do post e o token de autenticação
 * @param {object} post - Objeto com os dados do post
 * @returns {object} - Objeto com os dados do post
 */
const createPost = async (post) => {
  const config = requestConfig("POST", post);

  try {
    const res = await fetch(api + "/posts", config)
      .then((res) => res.json())
      .catch((err) => err);

    return res;
  } catch (error) {
    console.log(error);
  }
};

//Constante com os métodos do serviço de post
const postService = {
  getPostsByUserId,
  createPost,
};

// Exporta os serviços de post
export default postService;
