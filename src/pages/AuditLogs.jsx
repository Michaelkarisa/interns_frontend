// src/pages/AuditLogs.jsx
import { useEffect } from 'react';
import { create } from 'zustand';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  AlertCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
} from 'lucide-react';
import { PaginationControls } from '@/Layouts/PaginationControls';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import DateInputWithIcon from '@/Layouts/DateInputWithIcon';
import api from '@/api/apiClient';

// ===========================
// ZUSTAND STORE
// ===========================
const useAuditLogStore = create((set, get) => ({
  logs: {  data:[], links: [], from: 0, to: 0, total: 0 },
  loading: false,
  loadingReport: false,
  toast: null,
  selectedLog: null,
  searchTerm: '',
  eventFilter: '',
  dateFrom: '',
  dateTo: '',
  sortKey: 'created_at',
  sortDirection: 'desc',

  setToast: (message, type = 'error') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 5000);
  },
  setLoading: (loading) => set({ loading }),
  setLoadingReport: (loading) => set({ loadingReport: loading }),
  setSelectedLog: (log) => set({ selectedLog: log }),

  setSearchTerm: (term) => set({ searchTerm: term }),
  setEventFilter: (filter) => set({ eventFilter: filter }),
  setDateFrom: (date) => set({ dateFrom: date }),
  setDateTo: (date) => set({ dateTo: date }),
  
  setSort: (key) => {
    const { sortKey, sortDirection } = get();
    let dir = 'asc';
    if (sortKey === key) {
      if (sortDirection === 'asc') dir = 'desc';
      else if (sortDirection === 'desc') {
        set({ sortKey: null, sortDirection: null });
        get().filterLogs({ page: 1 });
        return;
      }
    }
    set({ sortKey: key, sortDirection: dir });
    get().filterLogs({ page: 1 });
  },
  
  resetFilters: () => {
    set({
      searchTerm: '',
      eventFilter: '',
      dateFrom: '',
      dateTo: '',
      sortKey: 'created_at',
      sortDirection: 'desc',
    });
    get().filterLogs({ page: 1 });
  },

  buildParams: (page) => {
    const { searchTerm, eventFilter, dateFrom, dateTo, sortKey, sortDirection } = get();
    const params = { page };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (eventFilter) params.event = eventFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (sortKey) {
      params.sort_by = sortKey;
      params.sort_direction = sortDirection;
    }
    return params;
  },

  fetchLogs: async (params = {}) => {
    const finalParams = { ...get().buildParams(1), ...params };
    set({ loading: true });
    try {
      const res = await api.get('/auditlogs', { params: finalParams });
      set({ logs: res.data.data });
    } catch (err) {
      get().setToast('Failed to load audit logs.');
    } finally {
      set({ loading: false });
    }
  },

  filterLogs: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await api.get('/auditlogs/filter', { params });
      set({ logs: response.data.data });
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      get().setToast('Failed to load logs. Please try again.', 'error');
    } finally {
      set({ loading: false });
    }
  },

  handlePageChange: (url) => {
    if (!url) return;
    try {
      const page = new URL(url).searchParams.get('page') || '1';
      get().filterLogs({ page: parseInt(page, 10) });
    } catch (e) {
      get().setToast('Invalid page.');
    }
  },

  generateReport: async () => {
    const { logs } = get();
    if (logs.total === 0) return;
    set({ loadingReport: true });
    try {
      const res = await api.get('/auditlogs/report', {
        params: get().buildParams(1),
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      get().setToast('Report downloaded!', 'success');
    } catch (err) {
      get().setToast('Failed to generate report.');
    } finally {
      set({ loadingReport: false });
    }
  },
}));

// ===========================
// TOAST
// ===========================
const Toast = () => {
  const toast = useAuditLogStore((s) => s.toast);
  if (!toast) return null;
  const bg = toast.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const text = toast.type === 'error' ? 'text-red-800' : 'text-green-800';
  return (
    <div className={`fixed top-4 right-4 z-50 ${bg} border ${text} px-4 py-3 rounded-lg max-w-md`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5" />
        <p className="text-sm font-medium">{toast.message}</p>
        <button onClick={() => useAuditLogStore.setState({ toast: null })}>&times;</button>
      </div>
    </div>
  );
};

// ===========================
// SORTABLE HEADER (FIXED: key → sortKey)
// ===========================
const SortableHeader = ({ children, sortKey }) => {
  const { sortKey: currentSortKey, sortDirection, setSort } = useAuditLogStore();
  const isSorted = currentSortKey === sortKey;
  const Icon = isSorted 
    ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) 
    : ArrowUpDown;
  const color = isSorted ? 'text-blue-600' : 'text-gray-400';
  
  return (
    <TableHead>
      <button 
        onClick={() => setSort(sortKey)} 
        className="flex items-center gap-1 font-medium hover:text-gray-900"
      >
        {children}
        <Icon className={`w-4 h-4 ${color}`} />
      </button>
    </TableHead>
  );
};

// ===========================
// EVENT BADGE
// ===========================
const EventBadge = ({ event }) => {
  const style = event.includes('created') ? 'bg-green-100 text-green-800'
              : event.includes('updated') ? 'bg-blue-100 text-blue-800'
              : event.includes('deleted') ? 'bg-red-100 text-red-800'
              : event.includes('login') ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>{event}</span>;
};

// ===========================
// LOG ROW
// ===========================
const LogRow = ({ log }) => (
  <TableRow>
    <TableCell>{log.user?.name || 'System'}</TableCell>
    <TableCell><EventBadge event={log.event} /></TableCell>
    <TableCell>{log.entity_type || '-'}</TableCell>
    <TableCell>{log.entity_id || '-'}</TableCell>
    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
    <TableCell className="text-right">
      <Button size="sm" variant="outline" onClick={() => useAuditLogStore.getState().setSelectedLog(log)}>
        <Eye className="w-4 h-4" /> View
      </Button>
    </TableCell>
  </TableRow>
);

// ===========================
// FILTER SECTION
// ===========================
const FilterSection = () => {
  const { searchTerm, eventFilter, dateFrom, dateTo } = useAuditLogStore();
  const { setSearchTerm, setEventFilter, setDateFrom, setDateTo, resetFilters } = useAuditLogStore();

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search user or event..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Events</option>
          <option value="login">Login</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
        </select>
        <Button variant="outline" size="sm" onClick={resetFilters}>Reset</Button>
      </div>
      <div className="flex gap-2">
        <div className="flex items-center gap-1">
          <span className="text-sm">From:</span>
          <DateInputWithIcon value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">To:</span>
          <DateInputWithIcon value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>
    </div>
  );
};

// ===========================
// DETAILS MODAL
// ===========================
const DetailsModal = () => {
  const log = useAuditLogStore((s) => s.selectedLog);
  const close = () => useAuditLogStore.setState({ selectedLog: null });
  if (!log) return null;

  return (
    <Dialog open onOpenChange={close}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-gray-500">User:</span> {log.user?.name || 'System'}</div>
            <div><span className="text-gray-500">Event:</span> <EventBadge event={log.event} /></div>
            <div><span className="text-gray-500">Entity Type:</span> {log.entity_type || '-'}</div>
            <div><span className="text-gray-500">Entity ID:</span> {log.entity_id || '-'}</div>
            <div><span className="text-gray-500">Date:</span> {new Date(log.created_at).toLocaleString()}</div>
            <div><span className="text-gray-500">IP:</span> {log.ip || '-'}</div>
          </div>
          {log.user_agent && (
            <div>
              <span className="text-gray-500">User Agent:</span>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1">{log.user_agent}</pre>
            </div>
          )}
          {log.metadata && (
            <div>
              <span className="text-gray-500">Metadata:</span>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button onClick={close}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================
export default function AuditLogs() {
  const {
    logs,
    loading,
    loadingReport,
    fetchLogs,
    handlePageChange,
    generateReport,
  } = useAuditLogStore();

  useEffect(() => {
    fetchLogs({ page: 1 });
  }, [fetchLogs]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (useAuditLogStore.getState().searchTerm) {
        fetchLogs({ page: 1 });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [useAuditLogStore.getState().searchTerm]);

  return (
    <div className="p-4 lg:p-6">
      <Toast />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm">Total: {logs.total}</span>
          <Button
            variant="outline"
            onClick={generateReport}
            disabled={loadingReport || logs.total === 0}
          >
            {loadingReport ? 'Generating...' : <><Download className="w-4 h-4" /> Report</>}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <FilterSection />
          <div className="border rounded-lg overflow-x-auto bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader sortKey="user">User</SortableHeader>
                  <SortableHeader sortKey="event">Event</SortableHeader>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <SortableHeader sortKey="created_at">Date</SortableHeader>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // ✅ FIXED: TableCell wrapped in TableRow
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                        <span className="ml-2">Loading Logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs?.data?.length > 0 ? (
                  logs.data.map(log => <LogRow key={log.id} log={log} />)
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationControls
            links={logs.links}
            from={logs.from}
            to={logs.to}
            total={logs.total}
            onPageChange={handlePageChange}
            text="Audit Logs"
          />
        </CardContent>
      </Card>
      <DetailsModal />
    </div>
  );
}