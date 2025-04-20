import { api, requestConfig } from "../utils/config";

// Registra um usuário
const register = async (user) => {
  const config = requestConfig("POST", user);

  try {
    const res = await fetch(api + "/users", config)
      .then((res) => res.json())
      .catch((err) => err);

    if (res) {
      localStorage.setItem("user", JSON.stringify(res));
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};

// Desloga o usuário
const logout = async (user) => {
  const config = requestConfig("POST", user.data, user.token);

  try {
    const res = await fetch(api + "/logout", config)
      .then((res) => res.json())
      .catch((err) => err);

    if (res) {
      localStorage.removeItem("user");
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};

const authService = { register, logout };

export default authService;
