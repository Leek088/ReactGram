import authService from "../services/authService";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const user = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: user ? user : null,
  error: false,
  success: false,
  loading: false,
};

export const register = createAsyncThunk(
  "auth/register",
  async (user, thunkAPI) => {
    const data = await authService.register(user);

    if (data.errors) {
      return thunkAPI.rejectWithValue(data.errors);
    }

    return data;
  }
);

export const login = createAsyncThunk("auth/login", async (user, thunkAPI) => {
  const data = await authService.login(user);

  if (data.errors) {
    return thunkAPI.rejectWithValue(data.errors);
  }

  return data;
});

export const logout = createAsyncThunk(
  "auth/logout",
  async (user, thunkAPI) => {
    const data = await authService.logout(user);

    if (data.errors) {
      return thunkAPI.rejectWithValue(data.errors);
    }

    return data;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = false;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = Object.values(action.payload);
        state.user = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = Object.values(action.payload);
        state.user = null;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = Object.values(action.payload);
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
