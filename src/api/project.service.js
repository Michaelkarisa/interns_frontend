import api from "./apiClient";

export const createProject = async (projectData) => {
  return api.post("/api/projects", projectData);
};

export const getProjects = async () => {
  return api.get("/api/projects");
};
