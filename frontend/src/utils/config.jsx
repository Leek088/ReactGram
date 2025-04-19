export const api = "http://localhost:8000/api";

export const requestConfig = (method, data, token = null, image = null) => {
  let config;
  const headers = {
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
    "Accept-encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Content-Type": image ? "multipart/form-data" : "application/json",
  };

  if (image) {
    config = {
      method: method,
      body: data,
      headers: headers,
    };
  } else if (method === "DELETE" || data === null) {
    config = {
      method: method,
      headers: {},
    };
  } else {
    config = {
      method: method,
      body: JSON.stringify(data),
      headers: headers,
    };
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};
