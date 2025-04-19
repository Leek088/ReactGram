import { api, requestConfig } from "../utils/config";

// Registra um usuário
const register = async (data) => {
  const config = requestConfig("POST", data);

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
const logout = async (data) => {
  const config = requestConfig("POST", data, data.token);

  try {
    const res = await fetch(api + "/logout", config)
      .then((res) => res.json())
      .catch((err) => err);

    if (res && res.success) {
      localStorage.removeItem("user");
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};

const authService = { register, logout };

export default authService;
