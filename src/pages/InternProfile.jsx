// src/pages/InternProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/Components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Slider } from '@/Components/ui/slider';
import { Textarea } from '@/Components/ui/textarea';
import { Input } from '@/Components/ui/input';
import { 
  AlertCircle, 
  Edit, 
  X, 
  Download,
  ArrowLeft 
} from 'lucide-react';
import DateInputWithIcon from '@/Layouts/DateInputWithIcon';
import ProjectList from './projects/ProjectList';
import PerformanceBadge from '@/Layouts/PerformanceBadge';
import RecommendationBadge from '@/Layouts/RecommendationBadge';
import api from '@/api/apiClient';
import { create } from 'zustand';

// ===========================
// ZUSTAND STORE
// ===========================
const useInternProfileStore = create((set, get) => ({
  // State
  intern: null,
  performance: 0,
  recommended: false,
  notes: '',
  isEditingProfile: false,
  isSaving: false,
  toast: null,
  loadingReport: false,
  activeTab: 'profile',
  loading: true,
  error: null,

  // Actions
  setIntern: (intern) => set({ 
    intern, 
    performance: intern?.performance || 0,
    recommended: intern?.recommended === true || intern?.recommended === 1,
    notes: intern?.notes || '',
  }),
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setToast: (message, type = 'error') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
  
  setIsEditingProfile: (isEditing) => set({ isEditingProfile: isEditing }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setLoadingReport: (loading) => set({ loadingReport: loading }), // Fixed parameter name
  
  setPerformance: (value) => set({ performance: value }),
  setRecommended: (value) => set({ recommended: value }),
  setNotes: (value) => set({ notes: value }),
  
  updateInternField: (field, value) => set((state) => ({
    intern: { ...state.intern, [field]: value }
  })),

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    const { intern } = get();
    if (intern) {
      localStorage.setItem(`intern_profile_tab_${intern.id}`, tab);
    }
  },

  // API Actions
  fetchIntern: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/interns/${id}`);
      get().setIntern(res.data.data);
    } catch (err) {
      set({ error: 'Failed to load intern profile' });
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  generateReport: async () => {
    const { intern, setLoadingReport, setToast } = get();
    if (!intern?.id) return;
    
    setLoadingReport(true);
    try {
      const res = await api.get(`/interns/${intern.id}/report`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `intern-profile-${intern.name.replace(/\s+/g, '-')}-${intern.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToast('Report downloaded!', 'success');
    } catch (err) {
      setToast('Failed to generate report.');
    } finally {
      setLoadingReport(false);
    }
  },

  updateProfile: async (formData) => {
    const { intern, setIsSaving, setIntern, setToast, setIsEditingProfile } = get();
    setIsSaving(true);
    try {
      await api.post(`/interns/${intern.id}`, formData);
      setIntern({ ...intern, ...formData });
      setToast('Profile updated!', 'success');
      setIsEditingProfile(false);
    } catch (err) {
      setToast('Update failed.');
    } finally {
      setIsSaving(false);
    }
  },

  savePerformance: async () => {
    const { intern, performance, recommended, notes, setIsSaving, setIntern, setToast } = get();
    setIsSaving(true);
    try {
      await api.post(`/interns/${intern.id}`, { performance, recommended, notes });
      setIntern({ ...intern, performance, recommended, notes });
      setToast('Evaluation saved!', 'success');
    } catch (err) {
      setToast('Save failed.');
    } finally {
      setIsSaving(false);
    }
  },

  saveEndDate: async () => {
    const { intern, setIsSaving, setToast, updateInternField } = get();
    setIsSaving(true);
    try {
      await api.post(`/interns/${intern.id}`, { to: intern.to });
      setToast('End date updated!', 'success');
    } catch (err) {
      setToast('Update failed.');
    } finally {
      setIsSaving(false);
    }
  },
}));

// ===========================
// TOAST COMPONENT
// ===========================
// ✅ TOAST COMPONENT (HOOKS ALWAYS CALLED)
const Toast = () => {
  const { toast, hideToast } = useInternProfileStore();

  // ✅ useEffect is ALWAYS called (no early return before it)
  useEffect(() => {
    if (!toast) return; // 👈 Safe: hook already called
    
    const timer = setTimeout(hideToast, 5000);
    return () => clearTimeout(timer);
  }, [toast, hideToast]); // 👈 include `toast` in deps

  // Handle case where toast becomes null during render
  if (!toast) return null;

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
// EDITABLE PROFILE SECTION
// ===========================
const EditableProfileSection = () => {
  const { intern, isSaving, updateProfile, setIsEditingProfile } = useInternProfileStore();
  const [formData, setFormData] = useState({
    name: intern.name || '',
    email: intern.email || '',
    phone: intern.phone || '',
    institution: intern.institution || '',
    department: intern.department || '',
    position: intern.position || '',
    course: intern.course || '',
    from: intern.from || '',
    to: intern.to || '',
    graduated: intern.graduated || false,
    supervisor: intern.supervisor || '',
    skills: intern.skills || [],
  });
  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="institution">Institution</Label>
          <Input id="institution" name="institution" value={formData.institution} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input id="department" name="department" value={formData.department} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Input id="position" name="position" value={formData.position} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="course">Course</Label>
          <Input id="course" name="course" value={formData.course} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="from">Start Date *</Label>
          <DateInputWithIcon
            id="from"
            name="from"
            type="date"
            value={formData.from}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="to">End Date</Label>
          <DateInputWithIcon
            id="to"
            name="to"
            type="date"
            value={formData.to}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="graduated"
          checked={formData.graduated}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, graduated: checked }))}
        />
        <Label htmlFor="graduated">Graduated</Label>
      </div>

      <div>
        <Label>Skills</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            placeholder="Add a skill..."
          />
          <Button type="button" onClick={handleAddSkill} variant="outline">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1">
              {skill}
              <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-1 hover:text-purple-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
      </div>
    </form>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================
export default function InternProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ✅ FIXED: loadingReport is now properly destructured
  const {
    intern,
    performance,
    recommended,
    notes,
    isEditingProfile,
    isSaving,
    toast,
    loadingReport, // ← This was the missing piece!
    activeTab,
    loading,
    error,
    fetchIntern,
    generateReport,
    setIsEditingProfile,
    setPerformance,
    setRecommended,
    setNotes,
    updateInternField,
    savePerformance,
    saveEndDate,
    setActiveTab,
  } = useInternProfileStore();

  // Fetch intern data
  useEffect(() => {
    fetchIntern(id);
  }, [id, fetchIntern]);

  // Restore tab from localStorage
  useEffect(() => {
    if (intern) {
      const saved = localStorage.getItem(`intern_profile_tab_${intern.id}`);
      if (saved) setActiveTab(saved);
    }
  }, [intern, setActiveTab]);

  const getDuration = () => {
    if (!intern?.from) return 'N/A';
    const start = new Date(intern.from);
    const end = intern.to ? new Date(intern.to) : new Date();
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return( 
  <div className="p-4 lg:p-6">
      <Toast />
      
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Intern Profile</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={generateReport}
          disabled={loadingReport} // ✅ Now properly defined
          className="ml-auto flex items-center gap-1"
        >
          {loadingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Report
            </>
          )}
        </Button>
      </div>
        <div className="p-6">Loading intern profile...</div>
        </div>
        );
  if (error) return( 
  <div className="p-4 lg:p-6">
      <Toast />
      
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Intern Profile</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={generateReport}
          disabled={loadingReport} // ✅ Now properly defined
          className="ml-auto flex items-center gap-1"
        >
          {loadingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Report
            </>
          )}
        </Button>
      </div>
  <div className="p-6 text-red-600">{error}</div>
  </div>
  );
  if (!intern) return( 
  <div className="p-4 lg:p-6">
      <Toast />
      
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Intern Profile</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={generateReport}
          disabled={loadingReport} // ✅ Now properly defined
          className="ml-auto flex items-center gap-1"
        >
          {loadingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Report
            </>
          )}
        </Button>
      </div>
  <div className="p-6">Intern not found</div>
  </div>
  );

  return (
    <div className="p-4 lg:p-6">
      <Toast />
      
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Intern Profile</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={generateReport}
          disabled={loadingReport} // ✅ Now properly defined
          className="ml-auto flex items-center gap-1"
        >
          {loadingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Report
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="md:w-1/3">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={intern.passport_photo || undefined} />
                <AvatarFallback className="text-2xl">
                  {intern.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{intern.name}</h2>
              <p className="text-gray-600">{intern.position || 'Intern'}</p>
              <div className="mt-3 flex justify-center gap-2 flex-wrap">
                <RecommendationBadge isRecommended={recommended} />
                <PerformanceBadge score={performance} />
              </div>
              {intern.cv && (
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <a href={intern.cv} download>Download CV</a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Internship Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailItem label="Institution" value={intern.institution} />
              <DetailItem label="Department" value={intern.department} />
              <DetailItem label="Position" value={intern.position} />
              <DetailItem 
                label="Duration" 
                value={`${formatDate(intern.from)} – ${formatDate(intern.to)} (${getDuration()})`} 
              />
              <DetailItem label="Graduated" value={intern.graduated ? 'Yes' : 'No'} />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {!isEditingProfile && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditingProfile ? (
                    <EditableProfileSection />
                  ) : (
                    <div className="space-y-4">
                      <DetailItem label="Email" value={intern.email} />
                      <DetailItem label="Phone" value={intern.phone || 'N/A'} />
                      <DetailItem label="Course" value={intern.course || 'N/A'} />
                      
                      <div>
                        <Label className="font-bold block mb-1">Skills</Label>
                        {intern.skills?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {intern.skills.map((skill, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No skills listed</span>
                        )}
                      </div>

                      <div>
                        <Label className="font-bold block mb-1">End Date</Label>
                        {intern.to ? (
                          <p>{formatDate(intern.to)}</p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <DateInputWithIcon
                              type="date"
                              value={intern.to || ""}
                              onChange={(e) => updateInternField('to', e.target.value)}
                            />
                            <Button onClick={saveEndDate} size="sm" disabled={isSaving}>
                              {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="mt-4">
              <ProjectList projects={intern.activities || []} internId={intern.id} />
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Evaluation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Performance Score</Label>
                    <Slider
                      value={[performance]}
                      onValueChange={(v) => setPerformance(v[0])}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-sm text-gray-500 block mt-1">{performance}/100</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      id="recommended" 
                      checked={recommended} 
                      onCheckedChange={setRecommended} 
                    />
                    <Label htmlFor="recommended">Recommended for Hiring</Label>
                  </div>

                  <div>
                    <Label>Performance Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about the intern's performance..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={savePerformance} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Evaluation'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Helper component
const DetailItem = ({ label, value }) => (
  <div>
    <span className="text-gray-700 font-medium">{label}:</span>
    <span className="text-gray-600 ml-1">{value || 'N/A'}</span>
  </div>
);