// src/components/projects/ProjectList.jsx
import { useEffect } from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import ProjectForm from './ProjectForm';
import axios from 'axios';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// ✅ Zustand Store
const useProjectListStore = create((set, get) => ({
  // State
  projects: [],
  isFormOpen: false,
  editingId: null,
  internId: null,

  // Actions
  setProjects: (projects) => set({ projects }),
  setIsFormOpen: (isOpen) => set({ isFormOpen: isOpen }),
  setEditingId: (id) => set({ editingId: id }),
  setInternId: (id) => set({ internId: id }),

  handleSave: async (projectData) => {
    const { editingId, projects, internId } = get();
    try {
      let response;
      console.log('Submitting data:', projectData);
      console.log("internId: ", internId);
      
      if (editingId) {
        // Update existing project
        response = await axios.post(`/projects/update/${editingId}`, projectData);
      } else {
        // Add new project
        response = await axios.post('/projects/add', projectData);
      }

      // Log full server response for debugging
      console.log('Server response:', response);

      // Update local state with returned activity
      const activity = response.data.activity;
      if (editingId) {
        set({ 
          projects: projects.map(p => (p.id === editingId ? activity : p)),
          isFormOpen: false,
          editingId: null
        });
      } else {
        set({ 
          projects: [...projects, activity],
          isFormOpen: false,
          editingId: null
        });
      }

    } catch (error) {
      // Log full error response if available
      if (error.response) {
        console.error('Server returned an error:', error.response);
      } else {
        console.error('Failed to save project:', error);
      }
    }
  },

  handleDelete: async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    const { projects, internId } = get();
    try {
      // Call backend to delete the activity
      await axios.delete(`/projects`, {  
        data: {
          activity_id: id,
          intern_id: internId
        }
      });

      // Remove from local state after successful deletion
      set({ projects: projects.filter(p => p.id !== id) });

    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  },

  handleEdit: (id) => {
    set({ editingId: id, isFormOpen: true });
  },

  handleAddNew: () => {
    set({ editingId: null, isFormOpen: true });
  },

  handleCloseModal: () => {
    set({ isFormOpen: false, editingId: null });
  },

  initializeData: (projects, internId) => {
    set({ projects, internId });
  }
}));

// ✅ Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-xl font-bold">
              {children.props.initialData ? 'Edit Project' : 'Add New Project'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ✅ Main Content Component
const ProjectListContent = ({ allProjects, internId }) => {
  const projects = useProjectListStore(state => state.projects);
  const isFormOpen = useProjectListStore(state => state.isFormOpen);
  const editingId = useProjectListStore(state => state.editingId);
  
  const handleSave = useProjectListStore(state => state.handleSave);
  const handleDelete = useProjectListStore(state => state.handleDelete);
  const handleEdit = useProjectListStore(state => state.handleEdit);
  const handleAddNew = useProjectListStore(state => state.handleAddNew);
  const handleCloseModal = useProjectListStore(state => state.handleCloseModal);
  const initializeData = useProjectListStore(state => state.initializeData);

  useEffect(() => {
    initializeData(allProjects, internId);
  }, [allProjects, internId, initializeData]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '—';
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Projects & Activities</h3>
        <Button size="sm" onClick={handleAddNew}>
          + Add Project
        </Button>
      </div>

      {/* Modal for Project Form */}
      <Modal isOpen={isFormOpen} onClose={handleCloseModal}>
        <ProjectForm
          initialData={editingId ? projects.find(p => p.id === editingId) : null}
          onSave={handleSave}
          onCancel={handleCloseModal}
          currentInternId={internId}
        />
      </Modal>

      {/* Projects List */}
      <div className="space-y-3">
        <AnimatePresence>
          {projects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md">{project.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(project.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(project.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong className="text-gray-700">Impact:</strong>{' '}
                      <span className="text-gray-600">{project.impact}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {dayjs(project.created_at).fromNow()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {projects.length === 0 && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="py-12">
              <p className="text-gray-500 text-center">
                No projects yet. Click "Add Project" to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// ✅ Wrapper Component
const ProjectList = ({ isSidebarCollapsed = false, projects = [], internId }) => {
  return (
    <ProjectListContent allProjects={projects} internId={internId} />
  );
};

export default ProjectList;