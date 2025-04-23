export const api = "http://localhost:8000/api";
export const apiImagePost = "http://localhost:8000/storage/posts";
export const apiImageUser = "http://localhost:8000/storage/users";

export const requestConfig = (method, data, token = null, image = null) => {
  let config;

  if (image) {
    config = {
      method: method,
      body: data,
      headers: {
        Accept: "application/json",
      },
    };
  } else if (method === "DELETE" || data === null) {
    config = {
      method: method,
      headers: { Accept: "application/json" },
    };
  } else {
    config = {
      method: method,
      body: data,
      headers: { "Content-Type": "application/json" },
    };
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};
