// src/pages/UsersManagement.jsx
import { useEffect } from 'react';
import { create } from 'zustand';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Layouts1/ui/table';
import { Card, CardContent } from '@/Layouts1/ui/card';
import { Button } from '@/Layouts1/ui/button';
import { Input } from '@/Layouts1/ui/input';
import {
  AlertCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Mail,
  Eye,
  EyeOff,
  Download,
} from 'lucide-react';
import { PaginationControls } from '@/Layouts/PaginationControls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/Layouts1/ui/dialog';
import { Label } from '@/Layouts1/ui/label';
import api from '@/api/apiClient';

// ===========================
// MAIN USERS STORE
// ===========================
const useUsersStore = create((set, get) => ({
  // Data (✅ VALID: data is an array inside object)
  users: {
     data:[],
    links: [],
    from: 0,
    to: 0,
    total: 0,
  },
  loading: false,
  loadingReport: false,
  loadingIds: [],

  // UI State
  toast: null,
  isRegisterModalOpen: false,

  // Filters
  searchTerm: '',
  roleFilter: '',
  statusFilter: '',
  sortKey: null,
  sortDirection: null,

  // UI Actions
  setToast: (message, type = 'error') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 5000);
  },
  setLoading: (loading) => set({ loading }),
  setLoadingReport: (loading) => set({ loadingReport: loading }),
  addLoadingId: (id) => set((state) => ({ loadingIds: [...state.loadingIds, id] })),
  removeLoadingId: (id) => set((state) => ({ loadingIds: state.loadingIds.filter(i => i !== id) })),
  openRegisterModal: () => set({ isRegisterModalOpen: true }),
  closeRegisterModal: () => set({ isRegisterModalOpen: false }),

  // Filter Actions
  setSearchTerm: (term) => set({ searchTerm: term }),
  setRoleFilter: (role) => set({ roleFilter: role }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  resetFilters: () => {
    set({
      searchTerm: '',
      roleFilter: '',
      statusFilter: '',
      sortKey: null,
      sortDirection: null,
    });
    get().filterUsers({ page: 1 });
  },

  // Sorting
  setSort: (key) => {
    const { sortKey, sortDirection } = get();
    let newDirection = 'asc';
    if (sortKey === key) {
      if (sortDirection === 'asc') newDirection = 'desc';
      else if (sortDirection === 'desc') {
        set({ sortKey: null, sortDirection: null });
        get().filterUsers({ page: 1 });
        return;
      }
    }
    set({ sortKey: key, sortDirection: newDirection });
    get().ffilterUsers({ page: 1 });
  },

  // Build Query Params
  buildParams: (page) => {
    const { searchTerm, roleFilter, statusFilter, sortKey, sortDirection } = get();
    const params = { page: page || 1 };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;
    if (sortKey) {
      params.sort_by = sortKey;
      params.sort_direction = sortDirection;
    }
    return params;
  },

  // Fetch Users
  fetchUsers: async (params = {}) => {
    const finalParams = get().buildParams(params.page);
    set({ loading: true });
    try {
      const response = await api.get('/users', { params: finalParams });
      set({ users: response.data.data });
    } catch (error) {
      console.error('Fetch users error:', error);
      get().setToast('Failed to load users. Please try again.');
    } finally {
      set({ loading: false });
    }
  },

    filterUsers: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await api.get('/users/filter', { params });
       set({ users: response.data });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      get().showToast('Failed to load projects. Please try again.', 'error');
    } finally {
      set({ loading: false });
    }
  },
  updateUserRole: async (userId, action) => {
  get().addLoadingId(userId);
  try {
    await axios.post(`/api/users/${userId}/${action}`);
    
    set((state) => ({
      users: {
        ...state.users, // keep pagination metadata (links, from, to, total)
        data: state.users.data.map((u) =>
          u.id === userId
            ? { ...u, role: action === 'promote' ? 'admin' : 'user' }
            : u
        ),
      },
    }));

    get().setToast(
      `User ${action === 'promote' ? 'promoted' : 'demoted'} successfully!`,
      'success'
    );
  } catch (error) {
    get().setToast('Action failed. Please try again.');
  } finally {
    get().removeLoadingId(userId);
  }
},

  // Pagination
  handlePageChange: (url) => {
    if (!url) return;
    try {
      const page = new URL(url).searchParams.get('page') || '1';
      get().filterUsers({ page: parseInt(page, 10) });
    } catch (error) {
      get().setToast('Failed to navigate to page.');
    }
  },

  // Generate PDF Report
  generateReport: async () => {
    const { users } = get();
    if (users.total === 0) return;

    set({ loadingReport: true });
    try {
      const response = await axios.get('/api/users/report', {
        params: get().buildParams(1),
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      get().setToast('Report downloaded successfully!', 'success');
    } catch (error) {
      get().setToast('Failed to generate report.');
    } finally {
      set({ loadingReport: false });
    }
  },
}));

// ===========================
// REGISTER MODAL STORE
// ===========================
const useRegisterStore = create((set, get) => ({
  // Form fields
  name: '',
  email: '',
  role: 'user',
  password: '',

  // UI state
  loading: false,
  showPassword: false,
  passwordStrength: 0,

  // ✅ ERRORS AS OBJECT (not array)
  errors: {},

  // Actions
  updateField: (field, value) => set((state) => ({ ...state, [field]: value })),
  setLoading: (loading) => set({ loading }),
  setShowPassword: (show) => set({ showPassword: show }),
  setErrors: (errors) => set({ errors }), // expects { email: "...", password: "..." }
  clearError: (field) => set((state) => ({ errors: { ...state.errors, [field]: '' } })),
  reset: () => set({
    name: '',
    email: '',
    role: 'user',
    password: '',
    loading: false,
    showPassword: false,
    passwordStrength: 0,
    errors: {}, // ✅ reset to empty object
  }),

  // Password strength
  calculateStrength: (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  },

  // Register API call
  submit: async (onSuccess) => {
    const { name, email, role, password, setLoading, setErrors } = get();
    
    // Client validation
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Valid email required';
    if (!password.trim() || password.length < 6) newErrors.password = 'At least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setLoading(true);
    try {
      const payload = { name, email, role, password };
      await axios.post('/api/users/register', payload);
      onSuccess();
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed';
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors); // Laravel-style: { email: [...] }
      } else {
        setErrors({ general: errMsg });
      }
      return false;
    } finally {
      setLoading(false);
    }
  },
}));

// ===========================
// TOAST COMPONENT
// ===========================
const Toast = () => {
  const toast = useUsersStore((state) => state.toast);
  const hideToast = () => useUsersStore.setState({ toast: null });

  if (!toast) return null;

  useEffect(() => {
    const timer = setTimeout(hideToast, 5000);
    return () => clearTimeout(timer);
  }, []);

  const bgColor = toast.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = toast.type === 'error' ? 'text-red-800' : 'text-green-800';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border ${textColor} px-4 py-3 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{toast.message}</p>
        <button onClick={hideToast} className="ml-auto text-gray-500">&times;</button>
      </div>
    </div>
  );
};

// ===========================
// SORTABLE TABLE HEADER
// ===========================
const SortableHeader = ({ children, columnKey }) => {
  const { sortKey, sortDirection, setSort } = useUsersStore();
  const isSorted = sortKey === columnKey;
  const Icon = isSorted
    ? sortDirection === 'asc' ? ArrowUp : ArrowDown
    : ArrowUpDown;
  const color = isSorted ? 'text-blue-600' : 'text-gray-400';

  if (!columnKey) return <TableHead>{children}</TableHead>;

  return (
    <TableHead>
      <button
        onClick={() => setSort(columnKey)}
        className="flex items-center gap-1 hover:text-gray-900 font-medium"
      >
        {children}
        <Icon className={`w-4 h-4 ${color}`} />
      </button>
    </TableHead>
  );
};

// ===========================
// ROLE BADGE
// ===========================
const RoleBadge = ({ role }) => {
  const styleMap = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    user: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styleMap[role] || styleMap.user}`}>
      {role.replace('_', ' ')}
    </span>
  );
};

// ===========================
// USER TABLE ROW
// ===========================
const UserRow = ({ user }) => {
  const { loadingIds, updateUserRole } = useUsersStore();
  const isLoading = loadingIds.includes(user.id);

  if (user.role === 'super_admin') {
    return (
      <TableRow>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell><RoleBadge role={user.role} /></TableCell>
        <TableCell className="text-right">
          <span className="px-2 py-1 rounded-md text-sm font-semibold bg-purple-600 text-white">You</span>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell><RoleBadge role={user.role} /></TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'demote' : 'promote')}
          disabled={isLoading}
          className="min-w-[80px]"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
          ) : user.role === 'admin' ? (
            'Demote'
          ) : (
            'Promote'
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};

// ===========================
// FILTER SECTION
// ===========================
const FilterSection = () => {
  const searchTerm = useUsersStore((s) => s.searchTerm);
  const roleFilter = useUsersStore((s) => s.roleFilter);
  const statusFilter = useUsersStore((s) => s.statusFilter);
  const setSearchTerm = useUsersStore((s) => s.setSearchTerm);
  const setRoleFilter = useUsersStore((s) => s.setRoleFilter);
  const setStatusFilter = useUsersStore((s) => s.setStatusFilter);
  const resetFilters = useUsersStore((s) => s.resetFilters);

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Reset
        </Button>
      </div>
    </div>
  );
};

// ===========================
// REGISTER MODAL
// ===========================
const RegisterUserModal = () => {
  const { isRegisterModalOpen, closeRegisterModal, setToast, fetchUsers } = useUsersStore();
  const {
    name,
    email,
    role,
    password,
    errors,
    loading,
    showPassword,
    passwordStrength,
    updateField,
    setShowPassword,
    setErrors,
    reset,
    calculateStrength,
    submit,
  } = useRegisterStore();

  // Reset form when modal closes
  useEffect(() => {
    if (!isRegisterModalOpen) reset();
  }, [isRegisterModalOpen, reset]);

  // Update password strength
  useEffect(() => {
    if (password) {
      const strength = calculateStrength(password);
      // Update strength in local store (not main store)
      // We'll just use it for UI
    }
  }, [password, calculateStrength]);

  const handleShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submit(() => {
      setToast('User registered! Verification email sent.', 'success');
      closeRegisterModal();
      fetchUsers({ page: 1 });
    });
    if (!success) return;
  };

  // Password strength UI
  const getStrengthColor = (strength) => {
    if (strength < 2) return 'bg-red-500';
    if (strength === 2) return 'bg-orange-500';
    if (strength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength) => {
    if (strength < 2) return 'Very Weak';
    if (strength === 2) return 'Weak';
    if (strength === 3) return 'Medium';
    return 'Strong';
  };

  return (
    <Dialog open={isRegisterModalOpen} onOpenChange={closeRegisterModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Register New User
          </DialogTitle>
          <DialogDescription>
            A verification email will be sent to the user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
              {errors.general}
            </div>
          )}

          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => updateField('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => updateField('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => updateField('role', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Temporary Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => updateField('password', e.target.value)}
                className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={handleShowPassword}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}

            {/* Password Strength */}
            {password && (
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Password Strength</span>
                  <span>{getStrengthText(calculateStrength(password))}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded mt-1">
                  <div
                    className={`h-full rounded ${getStrengthColor(calculateStrength(password))}`}
                    style={{ width: `${(calculateStrength(password) / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Email Verification Required</p>
              <p className="mt-1">The user must verify their email before logging in.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeRegisterModal} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register User
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================
export default function UsersManagement() {
  const {
    users,
    loading,
    loadingReport,
    toast,
    isRegisterModalOpen,
    fetchUsers,
    handlePageChange,
    generateReport,
    openRegisterModal,
    searchTerm,
    setSearchTerm,
  } = useUsersStore();

  // Initial fetch
  useEffect(() => {
    fetchUsers({ page: 1 });
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    if (searchTerm === '') {
      fetchUsers({ page: 1 });
      return;
    }
    const handler = setTimeout(() => {
      fetchUsers({ page: 1 });
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, fetchUsers]);

  return (
    <div className="p-4 lg:p-6">
      {toast && <Toast />}
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Total: {users.total}</span>
          <Button
            variant="outline"
            onClick={generateReport}
            disabled={loadingReport || users.total === 0}
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
          <Button onClick={openRegisterModal} className="flex items-center gap-1">
            <UserPlus className="w-4 h-4" />
            Register User
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
                  <SortableHeader columnKey="name">Name</SortableHeader>
                  <SortableHeader columnKey="email">Email</SortableHeader>
                  <SortableHeader columnKey="role">Role</SortableHeader>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                        <span className="ml-2">Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users?.data?.length > 0 ? (
                  users?.data.map((user) => <UserRow key={user.id} user={user} />)
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            links={users.links}
            from={users.from}
            to={users.to}
            total={users.total}
            onPageChange={handlePageChange}
            text="Users"
          />
        </CardContent>
      </Card>

      <RegisterUserModal />
    </div>
  );
}