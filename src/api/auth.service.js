import api from "./apiClient";
// LOGIN - returns user + token
export const login = async (data) => {
  const res = await api.post("/login", data);
  const { user, token } = res.data;

  // Save token locally
  localStorage.setItem("authToken", token);

  return user;
};

// REGISTER - optional, same as login
export const register = async (data) => {
  const res = await api.post("/register", data);
  const { user, token } = res.data;

  localStorage.setItem("authToken", token);

  return user;
};

// LOGOUT - revoke token
export const logout = async () => {
  try {
    await api.post("/logout"); // token included via axios interceptor
  } catch (err) {
    console.error(err);
  }
  localStorage.removeItem("authToken");
};

// GET CURRENT USER
export const getUser = async () => {
  try {
    const res = await api.get("/me"); // returns authenticated user
    return res.data;
  } catch (err) {
    localStorage.removeItem("authToken");
    throw err;
  }
};
