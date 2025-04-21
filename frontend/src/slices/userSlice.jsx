// Arquivo de serviços de usuário
import userService from "../services/userService";
// Redux Toolkit
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Estado inicial do slice de usuário
const initialState = {
  user: null,
  error: false,
  success: false,
  loading: false,
};

/**
 * Cria o método para recuperar o usuário via ID
 * Utiliza o serviço do usuário, getUser, para fazer a requisição à API
 * Em caso de erro, retorna o erro
 * @param {string} id - ID do usuário
 * @returns {object} - Objeto com os dados do usuário
 * @throws {object} - Objeto com os erros da requisição
 */
export const getUser = createAsyncThunk(
  "user/getUser",
  async (id, thunkAPI) => {
    // Faz a requisição à API para recuperar os dados do usuário
    const user = await userService.getUser(id);

    // Se a requisição falhar, retorna o erro
    if (user.errors) {
      return thunkAPI.rejectWithValue(Object.values(user.errors)); // Retorna o erro
    }

    // Se a requisição for bem sucedida, retorna o objeto com os dados do usuário
    return user.data;
  }
);

/**
 * Cria o slice de usuário
 * O slice contém os dados e as ações relacionadas ao usuário e suas requisições
 */
export const userSlice = createSlice({
  name: "user", // Nome do slice
  initialState, // Estado inicial do slice
  reducers: {
    // Ação para resetar os estados do slice
    reset: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // getUser
      .addCase(getUser.pending, (state) => {
        // No ato da requisição, reseta os estados.
        state.loading = true; // carregando
        state.success = false; // sem finalizar
        state.error = null; // Sem erro
      })
      .addCase(getUser.fulfilled, (state, action) => {
        // Se a requisição for bem sucedida, atualiza os estados.
        state.loading = false; // Para o carregamento
        state.success = true; // Sucesso na requisição
        state.error = null; // Sem erro
        state.user = action.payload; // Atualiza o usuário com os dados retornados da API
      })
      .addCase(getUser.rejected, (state, action) => {
        // Se a requisição falhar, atualiza os estados.
        state.loading = false; // Para o carregamento
        state.success = false; // Sem sucesso na requisição
        state.error = action.payload; // obtém os erros da requisição
        state.user = null; // Limpa o usuário
      });
  },
});

// Exporta as ações e o reducer do slice de usuário
export const { reset } = userSlice.actions;
export default userSlice.reducer;
