// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  Upload,
  X,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Edit,
  Settings2Icon,
} from 'lucide-react';
import api from '@/api/apiClient';
import DeleteUserForm from './Profile/Partials/DeleteUserForm';
import UpdatePasswordForm from './Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformation from './Profile/Partials/UpdateProfileInformationForm';
// ===========================
// TOAST COMPONENT
// ===========================
const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border ${textColor} px-4 py-3 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-auto text-gray-500">&times;</button>
      </div>
    </div>
  );
};

const CompanyProfileForm = ({ company, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    email: company?.email || '',
    phone: company?.phone || '',
    website: company?.website || '',
    address: company?.address || '',
    tax_id: company?.tax_id || '',
    industry: company?.industry || '',
    system_name: company?.system_name || '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(company?.logo_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'error') => setToast({ message, type });
  const hideToast = () => setToast(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo must be less than 2MB', 'error');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value || '');
    });
    if (logoFile) payload.append('logo', logoFile);

    try {
      const response = await api.put('/settings/company', payload);
      const updatedCompanyData = response.data.data?.company || response.data.company || formData;
      showToast('Company profile updated!', 'success');
      onSave(updatedCompanyData);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        showToast('Please fix the errors below.', 'error');
      } else {
        showToast('Failed to update company profile.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div>
          <Label>Company Logo</Label>
          <div className="mt-2 flex items-center gap-4 flex-wrap">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Company logo"
                  className="h-16 w-16 object-contain rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreview(company?.logo_url || null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  aria-label="Remove logo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="h-16 w-16 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-[200px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700"
              />
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
          </div>
          <div>
            <Label htmlFor="system_name">System Name *</Label>
            <Input
              id="system_name"
              name="system_name"
              value={formData.system_name}
              onChange={handleChange}
              required
              className={errors.system_name ? 'border-red-500' : ''}
            />
            {errors.system_name && <p className="text-red-500 text-sm mt-1">{errors.system_name[0]}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-r-500 text-sm mt-1">{errors.phone[0]}</p>}
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className={errors.website ? 'border-red-500' : ''}
            />
            {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website[0]}</p>}
          </div>
          <div>
            <Label htmlFor="tax_id">Tax ID</Label>
            <Input
              id="tax_id"
              name="tax_id"
              value={formData.tax_id}
              onChange={handleChange}
              className={errors.tax_id ? 'border-red-500' : ''}
            />
            {errors.tax_id && <p className="text-red-500 text-sm mt-1">{errors.tax_id[0]}</p>}
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="e.g., Technology"
              className={errors.industry ? 'border-red-500' : ''}
            />
            {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry[0]}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={errors.address ? 'border-red-500' : ''}
            rows={3}
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address[0]}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

// Read-only Display
const CompanyProfileDisplay = ({ company, onEdit }) => (
  <div className="max-w-4xl">
    <div className="flex justify-between items-start mb-6">
      <h2 className="text-2xl font-bold">Company Profile</h2>
      <Button size="sm" onClick={onEdit} className="flex items-center gap-1">
        <Edit className="w-4 h-4" /> Edit
      </Button>
    </div>

    <div className="space-y-6">
      {company?.appIcon && (
        <img src={company.appIcon} alt="Logo" className="h-20 w-auto object-contain" />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoItem icon={Building} label="Company Name" value={company?.name} />
        <InfoItem icon={Settings2Icon} label="System Name" value={company?.system_name} />
        <InfoItem icon={Mail} label="Email" value={company?.email} />
        <InfoItem icon={Phone} label="Phone" value={company?.phone} />
        <InfoItem icon={Globe} label="Website" value={company?.website} isLink />
        <InfoItem icon={FileText} label="Tax ID" value={company?.tax_id} />
        <InfoItem icon={Building} label="Industry" value={company?.industry} />
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <MapPin className="w-4 h-4" />
          <span>Address</span>
        </div>
        <p className="whitespace-pre-line">{company?.address || '—'}</p>
      </div>
    </div>
  </div>
);

const InfoItem = ({ icon: Icon, label, value, isLink = false }) => (
  <div>
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    {isLink && value ? (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        {value}
      </a>
    ) : (
      <p>{value || '—'}</p>
    )}
  </div>
);

const CompanyProfileCard = ({ company, onProfileUpdated }) => {
  const [editMode, setEditMode] = useState(!company);

  const handleSave = (updatedCompany) => {
    setEditMode(false);
    onProfileUpdated(updatedCompany);
  };

  if (editMode) {
    return <CompanyProfileForm company={company} onSave={handleSave} onCancel={() => setEditMode(false)} />;
  }

  return <CompanyProfileDisplay company={company} onEdit={() => setEditMode(true)} />;
};

// ===========================
// MAIN SETTINGS PAGE
// ===========================
export default function Settings() {
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        const data = response.data.data;
        setSettingsData(data);
        console.log("settings data:", data);
      } catch (err) {
        setError('Failed to load settings');
        console.error('Settings fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleProfileUpdated = (updatedUser) => {
    setSettingsData(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  const handleCompanyUpdated = (updatedCompany) => {
    setSettingsData(prev => ({
      ...prev,
      company: updatedCompany
    }));
  };

  const handleUserDeleted = () => {
    window.location.href = '/login';
  };

  // ✅ FIXED: Moved conditional returns BEFORE the main JSX return
  if (loading) {
    return (
       <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                        <span className="ml-2">Loading Settings...</span>
                      </div>
      </div>
    );
  }

  if (error) {
    return (
       <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="p-6 text-red-600 flex items-center justify-center">
        {error}
      </div>
      </div>
    );
  }

  if (!settingsData) {
    return (
       <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="p-6 flex items-center justify-center">
        No settings data available
      </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 gap-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="delete">Delete</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <UpdateProfileInformation
                user={settingsData.user} 
              />
            </TabsContent>

            <TabsContent value="password" className="mt-6">
              <UpdatePasswordForm />
            </TabsContent>

            <TabsContent value="company" className="mt-6">
              <CompanyProfileCard 
                company={settingsData.company} 
                onProfileUpdated={handleCompanyUpdated} 
              />
            </TabsContent>

            <TabsContent value="delete" className="mt-6">
              <DeleteUserForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}