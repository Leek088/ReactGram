/**
 * arquivo de configuração para requisições à API
 * api - URL da API
 * requestConfig - função que retorna a configuração da requisição
 */
import { api, requestConfig } from "../utils/config";

/**
 * Recupera os dados do usuário, na API, pelo ID
 * A requisição é feita com fetch - método GET, sem body e com o token de autenticação
 * @param {string} id - ID do usuário
 * @returns {object} - Objeto com os dados do usuário
 */
const getUser = async (id) => {
  // Recupera o token do localStorage
  const token = JSON.parse(localStorage.getItem("access_token"));

  // Recupera a configuração da requisição
  const config = requestConfig("GET", null, token);

  try {
    // Faz a requisição à API
    const res = await fetch(api + "/users/" + id, config)
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

const updateUser = async (id, data) => {
  // Recupera o token do localStorage
  const token = JSON.parse(localStorage.getItem("access_token"));

  // Recupera a configuração da requisição
  const config = requestConfig("POST", data, token, true);

  try {
    // Faz a requisição à API
    const res = await fetch(api + "/users/" + id, config)
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

//Constante com os métodos do serviço de usuário
const userService = {
  getUser,
  updateUser,
};

// Exporta os serviços de usuário
export default userService;
