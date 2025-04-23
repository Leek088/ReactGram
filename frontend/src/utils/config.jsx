export const api = "http://localhost:8000/api";
export const apiImagePost = "http://localhost:8000/storage/posts";
export const apiImageUser = "http://localhost:8000/storage/users";

export const requestConfig = (method, data, token = null, image = null) => {
  let config;
  const headers_default = {
    Accept: "application/json",
    "Content-Type": image ? "multipart/form-data" : "application/json",
  };

  if (image) {
    config = {
      method: method,
      body: data,
      headers: headers_default,
    };
  } else if (method === "DELETE" || data === null) {
    config = {
      method: method,
      headers: headers_default,
    };
  } else {
    config = {
      method: method,
      body: data,
      headers: headers_default,
    };
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};
