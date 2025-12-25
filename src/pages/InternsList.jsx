// src/pages/InternsList.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { User, ArrowRight, AlertCircle, Download } from 'lucide-react';
import { PaginationControls } from '@/Layouts/PaginationControls';
import DateInputWithIcon from '@/Layouts/DateInputWithIcon';
import InternForm from '@/pages/Intern/InternForm';
import PerformanceBadge from '@/Layouts/PerformanceBadge';
import RecommendationBadge from '@/Layouts/RecommendationBadge';
import api from '@/api/apiClient';

// ===========================
// ZUSTAND STORE (Complete state & logic)
// ===========================
export const useInternsStore = create((set, get) => ({
  // State
  internsData: {  data:[], links: [], from: 0, to: 0, total: 0 },
  filters: {
    search: '',
    min_performance: '',
    active: false,
    completed: false,
    recommended: false,
    graduated: false,
    name: '',
    email: '',
    institution: '',
    position: '',
    date_a: null,
    date_b: null,
  },
  loading: false,
  loadingReport: false,
  showForm: false,
  toast: null,

  // UI Actions
  setShowForm: (showForm) => set({ showForm }),
  showToast: (message, type = 'error') => {
    set({ toast: { message, type } });
    setTimeout(() => get().hideToast(), 5000);
  },
  hideToast: () => set({ toast: null }),

  // Filter Actions
  setFilter: (field, value) => {
    // Handle mutual exclusion
    if (field === 'active' && value) {
      set((state) => ({ filters: { ...state.filters, active: true, completed: false } }));
    } else if (field === 'completed' && value) {
      set((state) => ({ filters: { ...state.filters, active: false, completed: true } }));
    } else {
      set((state) => ({ filters: { ...state.filters, [field]: value } }));
    }
    
    // Auto-apply filters for text inputs after debounce
    if (['search', 'min_performance', 'name', 'email', 'institution', 'position'].includes(field)) {
      clearTimeout(get().debounceTimer);
      const timer = setTimeout(() => {
        get().fetchInterns({ page: 1 });
      }, 300);
      set({ debounceTimer: timer });
    } else {
      // Apply immediately for other filters
      get().fetchInterns({ page: 1 });
    }
  },

  resetFilters: () => {
    set({
      filters: {
        search: '',
        min_performance: '',
        active: false,
        completed: false,
        recommended: false,
        graduated: false,
        name: '',
        email: '',
        institution: '',
        position: '',
        date_a: null,
        date_b: null,
      }
    });
    get().fetchInterns({ page: 1 });
  },

  // API Actions
  fetchInterns: async (params = {}) => {
    const { filters } = get();
    set({ loading: true });
    
    // Validate date range
    if (filters.date_a && filters.date_b && filters.date_a > filters.date_b) {
      get().showToast('Start date cannot be after end date', 'error');
      set({ loading: false });
      return;
    }

    try {
      const finalParams = { ...params, ...filters };
      const response = await api.get('/interns/filter', { params: finalParams });
      
      // Handle your API response structure
      const data = response.data || response.data;
      set({
        internsData: {
          data: data.data || [],
          links: data.links || [],
          from: data.from || 0,
          to: data.to || 0,
          total: data.total || 0,
        }
      });
    } catch (error) {
      console.error('Fetch error:', error);
      get().showToast('Failed to load interns. Please try again.', 'error');
    } finally {
      set({ loading: false });
    }
  },

  generateReport: async () => {
    const { filters, internsData } = get();
    if (internsData.total === 0) return;
    
    // Validate date range
    if (filters.date_a && filters.date_b && filters.date_a > filters.date_b) {
      get().showToast('Start date cannot be after end date', 'error');
      return;
    }

    set({ loadingReport: true });
    try {
      const response = await api.get('/interns/report', {
        params: filters,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interns-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      get().showToast('Report downloaded successfully!', 'success');
    } catch (error) {
      get().showToast('Failed to generate report.', 'error');
    } finally {
      set({ loadingReport: false });
    }
  },

  addIntern: async (data, cvFile, photoFile) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value == null || value === '') return;
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, item));
      } else {
        formData.append(key, value);
      }
    });
    if (cvFile) formData.append('cv', cvFile);
    if (photoFile) formData.append('photo', photoFile);

    try {
      await api.post('/interns', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      get().showToast('Intern added successfully!', 'success');
      set({ showForm: false });
      get().fetchInterns({ page: 1 });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add intern';
      get().showToast(msg, 'error');
    }
  },

  handlePageChange: (url) => {
    if (!url) return;
    try {
      const page = new URL(url).searchParams.get('page') || '1';
      get().fetchInterns({ page: parseInt(page, 10) });
    } catch (e) {
      get().showToast('Invalid page URL', 'error');
    }
  },
}));

// ===========================
// TOAST COMPONENT (Fixed Hook Ordering)
// ===========================
const Toast = () => {
  const { toast, hideToast } = useInternsStore();

  // ✅ useEffect always called - no early return before hooks
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(hideToast, 5000);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  const bgColor = toast.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = toast.type === 'error' ? 'text-red-800' : 'text-green-800';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border ${textColor} px-4 py-3 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        <p className="text-sm font-medium">{toast.message}</p>
        <button onClick={hideToast} className="ml-auto text-gray-500">&times;</button>
      </div>
    </div>
  );
};

// ===========================
// HELPERS
// ===========================
const getInternshipStatus = (toDate) => (!toDate ? 'In Progress' : 'Completed');

const StatusBadge = ({ status }) => {
  const styles = status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>{status}</span>;
};

// ===========================
// FILTER SECTION
// ===========================
const FilterSection = () => {
  const filters = useInternsStore((state) => state.filters);
  const setFilter = useInternsStore((state) => state.setFilter);
  const resetFilters = useInternsStore((state) => state.resetFilters);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
          <Input
            placeholder="Institution"
            value={filters.institution}
            onChange={(e) => setFilter('institution', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Input
            placeholder="Position"
            value={filters.position}
            onChange={(e) => setFilter('position', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Min Performance"
            value={filters.min_performance}
            onChange={(e) => setFilter('min_performance', e.target.value)}
            min="0"
            max="100"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">From:</label>
            <DateInputWithIcon
              value={filters.date_a || ''}
              onChange={(e) => setFilter('date_a', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">To:</label>
            <DateInputWithIcon
              value={filters.date_b || ''}
              min={filters.date_a || ''}
              onChange={(e) => setFilter('date_b', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        {['active', 'completed', 'recommended', 'graduated'].map((field) => (
          <label key={field} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters[field]}
              onChange={(e) => setFilter(field, e.target.checked)}
              className="cursor-pointer"
            />
            <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

// ===========================
// TABLE ROW
// ===========================
const InternTableRow = ({ intern, onViewProfile }) => (
  <motion.tr
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{ duration: 0.2 }}
  >
    <TableCell>
      <Avatar className="h-8 w-8">
        <AvatarImage src={intern.passport_photo || undefined} alt={`${intern.name}'s avatar`} />
        <AvatarFallback>{intern.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    </TableCell>
    <TableCell>{intern.name}</TableCell>
    <TableCell>{intern.institution || '—'}</TableCell>
    <TableCell>{intern.position || '—'}</TableCell>
    <TableCell><StatusBadge status={getInternshipStatus(intern.to)} /></TableCell>
    <TableCell><PerformanceBadge score={intern.performance} /></TableCell>
    <TableCell><RecommendationBadge isRecommended={intern.recommended} /></TableCell>
    <TableCell className="text-right">
      <Button variant="outline" size="sm" onClick={() => onViewProfile(intern.id)}>
        <User className="w-4 h-4" />
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </TableCell>
  </motion.tr>
);

// ===========================
// TABLE
// ===========================
const InternsTable = ({ data, loading, onViewProfile }) => (
  <Card className="rounded-2xl border bg-white shadow-sm overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Avatar</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Institution</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Performance</TableHead>
          <TableHead>Recommended</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <AnimatePresence>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                  <span className="ml-2">Loading interns...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data?.length > 0 ? (
            data.map((intern) => (
              <InternTableRow key={intern.id} intern={intern} onViewProfile={onViewProfile} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No interns match your filters.
              </TableCell>
            </TableRow>
          )}
        </AnimatePresence>
      </TableBody>
    </Table>
  </Card>
);

// ===========================
// MAIN COMPONENT
// ===========================
export default function InternsList() {
  const navigate = useNavigate();
  
  const {
    internsData,
    loading,
    loadingReport,
    showForm,
    toast,
    setShowForm,
    fetchInterns,
    generateReport,
    addIntern,
    handlePageChange,
  } = useInternsStore();

  // Initial fetch
  useEffect(() => {
    fetchInterns({ page: 1 });
  }, [fetchInterns]);

  const handleViewProfile = (id) => navigate(`/interns/profile/${id}`);
  const handleAddIntern = () => setShowForm(true);
  const handleFormCancel = () => setShowForm(false);

  if (showForm) {
    return (
      <div className="p-4 lg:p-6">
        <Button variant="ghost" size="sm" onClick={handleFormCancel} className="mb-4">
          ← Back to Interns
        </Button>
        <InternForm 
          onSubmit={addIntern} 
          initialData={null} 
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <Toast /> {/* ✅ Always render */}
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Interns</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={generateReport}
            disabled={loadingReport || internsData.total === 0}
            className="flex items-center gap-1"
          >
            {loadingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Report (PDF)
              </>
            )}
          </Button>
          <Button onClick={handleAddIntern}>+ Add Intern</Button>
        </div>
      </div>

      <FilterSection />
      <InternsTable
        data={internsData.data}
        loading={loading}
        onViewProfile={handleViewProfile}
      />

      <PaginationControls
        links={internsData.links}
        from={internsData.from}
        to={internsData.to}
        total={internsData.total}
        onPageChange={handlePageChange}
        text="Interns"
      />
    </div>
  );
}