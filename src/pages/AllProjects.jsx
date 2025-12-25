// src/pages/AllProjects.jsx
import { useEffect } from 'react';
import { create } from 'zustand';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
} from 'lucide-react';
import { PaginationControls } from '@/Layouts/PaginationControls';
import DateInputWithIcon from '@/Layouts/DateInputWithIcon';
import { Input } from '@/components/ui/input';
import api from '@/api/apiClient'; // ✅ Your configured axios instance

// ===========================
// ZUSTAND STORE (self-contained)
// ===========================
const useProjectsStore = create((set, get) => ({
  // State
  projectsData: { data: [], links: [], from: 0, to: 0, total: 0 },
  loading: false,
  loadingReport: false,
  toast: null,
  searchTerm: '',
  internName: '',
  dateFrom: '',
  dateTo: '',
  sortConfig: { key: null, direction: null },

  // Actions
  resetStore: () => set({
    projectsData: { data: [], links: [], from: 0, to: 0, total: 0 },
    searchTerm: '',
    internName: '',
    dateFrom: '',
    dateTo: '',
    sortConfig: { key: null, direction: null },
  }),

  setLoading: (loading) => set({ loading }),
  setLoadingReport: (loadingReport) => set({ loadingReport }),
  showToast: (message, type = 'error') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),

  setSearchTerm: (term) => set({ searchTerm: term }),
  setInternName: (name) => set({ internName: name }),
  setDateFrom: (date) => set({ dateFrom: date }),
  setDateTo: (date) => set({ dateTo: date }),
  setSortConfig: (config) => set({ sortConfig: config }),

  fetchProjects: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await api.get('/projects', { params });
        console.log("Projects data: ", response.data.data);
      set({ projectsData: response.data.data });
    } catch (error) {
      console.error('Fetch error:', error);
      get().showToast('Failed to load projects.', 'error');
    } finally {
      set({ loading: false });
    }
  },

  applyFilters: () => {
    const { dateFrom, dateTo } = get();
    if (dateFrom && dateTo && dateFrom > dateTo) {
      get().showToast('Start date cannot be after end date', 'error');
      return;
    }
    get().filterProjects(get().buildParams(1));
  },
 filterProjects: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await api.get('/projects/filter', { params });
      set({ projectsData: response.data});
      console.log("filter Projects: ", response.data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      get().showToast('Failed to load projects. Please try again.', 'error');
    } finally {
      set({ loading: false });
    }
  },
  buildParams: (page) => {
    const { searchTerm, internName, dateFrom, dateTo, sortConfig } = get();
    const params = { page };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (internName.trim()) params.intern_name = internName.trim();
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (sortConfig.key) {
      params.sort_by = sortConfig.key;
      params.sort_direction = sortConfig.direction;
    }
    return params;
  },

  handleSort: (key) => {
    const { sortConfig } = get();
    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') {
        set({ sortConfig: { key: null, direction: null } });
        get().filterProjects(get().buildParams(1));
        return;
      }
    }
    set({ sortConfig: { key, direction } });
    get().filterProjects(get().buildParams(1));
  },

  handlePageChange: (url) => {
    if (!url) return;
    try {
      const page = new URL(url).searchParams.get('page') || '1';
      get().filterProjects(get().buildParams(parseInt(page, 10)));
    } catch (e) {
      get().showToast('Invalid page URL', 'error');
    }
  },

  handleGenerateReport: async () => {
    const { dateFrom, dateTo } = get();
    if (dateFrom && dateTo && dateFrom > dateTo) {
      get().showToast('Start date cannot be after end date', 'error');
      return;
    }
    set({ loadingReport: true });
    try {
      // ✅ Use 'api' instead of 'axios' for consistency
      const response = await api.get('/projects/report', {
        params: get().buildParams(1),
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `projects-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      get().showToast('Report downloaded!', 'success');
    } catch (error) {
      get().showToast('Failed to generate report.', 'error');
    } finally {
      set({ loadingReport: false });
    }
  },

  handleReset: () => {
    get().resetStore();
    get().filterProjects({ page: 1 });
  },
}));

// ===========================
// TOAST
// ===========================
const Toast = () => {
  const { toast, hideToast } = useProjectsStore();
  if (!toast) return null;

  useEffect(() => {
    const id = setTimeout(hideToast, 5000);
    return () => clearTimeout(id);
  }, [hideToast]);

  const isErr = toast.type === 'error';
  const bg = isErr ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const text = isErr ? 'text-red-800' : 'text-green-800';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bg} border ${text} px-4 py-3 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{toast.message}</p>
        <button onClick={hideToast} className="ml-auto text-gray-500">&times;</button>
      </div>
    </div>
  );
};

// ===========================
// SORTABLE HEADER
// ===========================
const SortableTableHead = ({ children, sortKey }) => {
  const { sortConfig, handleSort } = useProjectsStore();
  const isSorted = sortConfig.key === sortKey;
  const direction = isSorted ? sortConfig.direction : null;

  if (!sortKey) return <TableHead>{children}</TableHead>;

  return (
    <TableHead>
      <button
        onClick={() => handleSort(sortKey)}
        className="flex items-center gap-1 hover:text-gray-900 font-medium"
      >
        {children}
        {isSorted ? (
          direction === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />
        ) : (
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </TableHead>
  );
};

// ===========================
// FILTER SECTION
// ===========================
const FilterSection = () => {
  const searchTerm = useProjectsStore((s) => s.searchTerm);
  const internName = useProjectsStore((s) => s.internName);
  const dateFrom = useProjectsStore((s) => s.dateFrom);
  const dateTo = useProjectsStore((s) => s.dateTo);
  const setSearchTerm = useProjectsStore((s) => s.setSearchTerm);
  const setInternName = useProjectsStore((s) => s.setInternName);
  const setDateFrom = useProjectsStore((s) => s.setDateFrom);
  const setDateTo = useProjectsStore((s) => s.setDateTo);
  const applyFilters = useProjectsStore((s) => s.applyFilters);
  const handleReset = useProjectsStore((s) => s.handleReset);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
        <Input
          placeholder="Intern name"
          value={internName}
          onChange={(e) => setInternName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
        <DateInputWithIcon
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="From"
        />
        <DateInputWithIcon
          value={dateTo}
          min={dateFrom || ''}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="To"
        />
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset
        </Button>
        <Button size="sm" onClick={applyFilters}>
          Apply
        </Button>
      </div>
    </>
  );
};

// ===========================
// TABLE ROW
// ===========================
const ProjectTableRow = ({ project }) => {
  const getInternNames = () => {
    const names = [];
    if (project.intern?.name) names.push(project.intern.name);
    if (project.team?.length) names.push(...project.team.map(t => t.name));
    return names.join(', ') || '—';
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '—';

  return (
    <TableRow>
      <TableCell className="font-medium">{project.title || '—'}</TableCell>
      <TableCell className="max-w-xs truncate" title={project.description}>
        {project.description || '—'}
      </TableCell>
      <TableCell>{project.impact || '—'}</TableCell>
      <TableCell>{getInternNames()}</TableCell>
      <TableCell>{formatDate(project.created_at)}</TableCell>
      <TableCell className="text-right">
        {project.url ? (
          <Button variant="outline" size="sm" asChild>
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              View <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        ) : (
          <span className="text-xs text-gray-400">No URL</span>
        )}
      </TableCell>
    </TableRow>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================
export default function AllProjects() {
  const { projectsData, loading, loadingReport, toast, fetchProjects } = useProjectsStore();

  useEffect(() => {
    fetchProjects({ page: 1 });
  }, [fetchProjects]);

  const handlePageChange = useProjectsStore((s) => s.handlePageChange);
  const handleGenerateReport = useProjectsStore((s) => s.handleGenerateReport);
  const hideToast = useProjectsStore((s) => s.hideToast);

  return (
    <div className="p-4 lg:p-6">
      {toast && <Toast />}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Intern Projects</h1>
        <Button
          variant="outline"
          onClick={handleGenerateReport}
          disabled={loadingReport || projectsData.total === 0}
          className="flex items-center gap-2"
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
      </div>

      <Card>
        <CardContent className="pt-4">
          <FilterSection />

          <div className="border rounded-lg overflow-x-auto bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead sortKey="title">Project</SortableTableHead>
                  <TableHead>Description</TableHead>
                  <SortableTableHead sortKey="impact">Impact</SortableTableHead>
                  <SortableTableHead sortKey="intern_name">Intern(s)</SortableTableHead>
                  <SortableTableHead sortKey="created_at">Date</SortableTableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                      <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                        <span className="ml-2">Loading Projects...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : projectsData?.data?.length > 0 ? (
                  projectsData?.data.map((p) => <ProjectTableRow key={p.id} project={p} />)
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No projects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            links={projectsData.links}
            from={projectsData.from}
            to={projectsData.to}
            total={projectsData.total}
            onPageChange={handlePageChange}
            text="Projects"
          />
        </CardContent>
      </Card>
    </div>
  );
}