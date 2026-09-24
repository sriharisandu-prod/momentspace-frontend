const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:9090/api";

async function request(
  endpoint,
  options = {}
) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }
  );


  if (!response.ok) {

    throw new Error(
      `API Error: ${response.status}`
    );

  }


  return response.json();
}


export const api = {

  get(endpoint) {

    return request(endpoint, {
      method: "GET",
    });

  },


  post(endpoint, data) {

    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });

  },


  put(endpoint, data) {

    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });

  },


  delete(endpoint) {

    return request(endpoint, {
      method: "DELETE",
    });

  },

};