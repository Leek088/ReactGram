// Arquivo de serviços de usuário
import postService from "../services/postService";
// Redux Toolkit
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Estado inicial do slice de usuário
const initialState = {
  posts: [],
  error: false,
  success: false,
  messageSuccess: false,
  loading: false,
};

/**
 * Cria o método para recuperar os posts do usuário via ID
 * Utiliza o serviço via get, getPostsByUserId, para fazer a requisição à API
 * Em caso de erro, retorna o erro
 * @param {string} id - ID do usuário
 * @returns {object} - Objeto com os dados do posts
 * @throws {object} - Objeto com os erros da requisição
 */
export const getPostsByUserId = createAsyncThunk(
  "post/getPostsByUserId",
  async (id, thunkAPI) => {
    // Faz a requisição ao serviço, para recuperar os posts do usuário
    const posts = await postService.getPostsByUserId(id);

    // Se a requisição falhar, retorna o erro
    if (posts.errors) {
      return thunkAPI.rejectWithValue(Object.values(posts.errors)); // Retorna o erro
    }

    // Se a requisição for bem sucedida, retorna o objeto com os dados do usuário
    return posts.data;
  }
);

/**
 * Cria o método para novos posts do usuário
 * Utiliza o serviço via post, createPost, para fazer a requisição à API
 * Em caso de erro, retorna o erro
 * @param {object} post - post do usuário
 * @returns {object} - Objeto com os dados do post criado
 * @throws {object} - Objeto com os erros da requisição
 */
export const createPost = createAsyncThunk(
  "post/createPost",
  async (post, thunkAPI) => {
    // Faz a requisição ao serviço, para recuperar os posts do usuário
    const res = await postService.createPost(post);

    // Se a requisição falhar, retorna o erro
    if (res.errors) {
      return thunkAPI.rejectWithValue(Object.values(res.errors)); // Retorna o erro
    }

    // Se a requisição for bem sucedida, retorna o objeto com os dados do usuário
    return res.data;
  }
);

/**
 * Cria o slice do post
 * O slice contém os dados e as ações relacionadas ao post e suas requisições
 */
export const postSlice = createSlice({
  name: "post", // Nome do slice
  initialState, // Estado inicial do slice
  reducers: {
    // Ação para resetar os estados do slice
    reset: (state) => {
      state.loading = false;
      state.error = false;
      state.success = false;
      state.messageSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // getPostsByUserId
      .addCase(getPostsByUserId.pending, (state) => {
        // No ato da requisição, reseta os estados.
        state.loading = true; // carregando
        state.success = false; // sem finalizar
        state.error = null; // Sem erro
      })
      .addCase(getPostsByUserId.fulfilled, (state, action) => {
        // Se a requisição for bem sucedida, atualiza os estados.
        state.loading = false; // Para o carregamento
        state.success = true; // Sucesso na requisição
        state.error = null; // Sem erro
        state.posts = action.payload; // Atualiza os posts com os dados retornados da API
      })
      .addCase(getPostsByUserId.rejected, (state, action) => {
        // Se a requisição falhar, atualiza os estados.
        state.loading = false; // Para o carregamento
        state.success = false; // Sem sucesso na requisição
        state.error = action.payload; // obtém os erros da requisição
        state.posts = []; // Limpa os posts
      })
      // createPost
      .addCase(createPost.pending, (state) => {
        // No ato da requisição, reseta os estados.
        state.loading = true; // carregando
        state.success = false; // sem finalizar
        state.error = null; // Sem erro
      })
      .addCase(createPost.fulfilled, (state, action) => {
        // Se a requisição for bem sucedida, atualiza os estados.
        state.loading = false; // Para o carregamento
        state.success = true; // Sucesso na requisição
        state.error = null; // Sem erro
        state.posts.unshift(action.payload); // Atualiza os posts com os dados retornados da API
        state.messageSuccess = true; // Atualiza a mensagem de sucesso com os dados retornados da API
      })
      .addCase(createPost.rejected, (state, action) => {
        // Se a requisição falhar, atualiza os estados.
        state.loading = false; // Para o carregamento
        state.success = false; // Sem sucesso na requisição
        state.error = action.payload; // obtém os erros da requisição
        state.messageSuccess = false; // Limpa a mensagem de sucesso
      });
  },
});

// Exporta as ações e o reducer do slice de usuário
export const { reset } = postSlice.actions;
export default postSlice.reducer;
