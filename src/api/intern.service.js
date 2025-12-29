import api from "../assets/apiClient";

export const createIntern = async (internData) => {
  return api.post("/api/interns", internData);
};

export const getInterns = async () => {
  return api.get("/api/interns");
};
