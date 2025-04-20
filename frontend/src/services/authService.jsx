import { api, requestConfig } from "../utils/config";

// Registra um usuário
const register = async (user) => {
  const config = requestConfig("POST", user);

  try {
    const res = await fetch(api + "/users", config)
      .then((res) => res.json())
      .catch((err) => err);

    if (res.token) {
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("access_token", JSON.stringify(res.token));
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};

// Login do usuário
const login = async (user) => {
  const config = requestConfig("POST", user);

  try {
    const res = await fetch(api + "/login", config)
      .then((res) => res.json())
      .catch((err) => err);

    if (res.token) {
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("access_token", JSON.stringify(res.token));
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};

// Desloga o usuário
const logout = async (user) => {
  const token = JSON.parse(localStorage.getItem("access_token"));

  const config = requestConfig("POST", user, token);

  try {
    const res = await fetch(api + "/logout", config)
      .then((res) => res.json())
      .catch((err) => err);

    if (res) {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};

const authService = { register, logout, login };

export default authService;
