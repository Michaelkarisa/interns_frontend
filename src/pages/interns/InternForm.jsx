// src/components/interns/InternForm.jsx
import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Building2, Calendar, Upload, GraduationCap, FileInputIcon } from 'lucide-react';
import DateInputWithIcon from '@/Layouts/DateInputWithIcon';

// ✅ Zustand store defined INSIDE the same file
const useInternFormStore = create((set) => ({
  formData: {
    name: '',
    email: '',
    phone: '',
    institution: '',
    position: '',
    course: '',
    from: '',
    to: null,
    graduated: false,
    recommended: false,
    performance: 0,
    department: '',
    skills: '',
  },
  cvFile: null,
  photoFile: null,

  // Actions
  setField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  setFiles: (cvFile, photoFile) =>
    set(() => ({ cvFile, photoFile })),

  reset: (initialData = null) =>
    set(() => {
      const skillsStr = initialData?.skills
        ? Array.isArray(initialData.skills)
          ? initialData.skills.join(', ')
          : initialData.skills
        : '';

      return {
        formData: initialData
          ? {
              ...initialData,
              skills: skillsStr,
            }
          : {
              name: '',
              email: '',
              phone: '',
              institution: '',
              position: '',
              course: '',
              from: '',
              to: null,
              graduated: false,
              recommended: false,
              performance: 0,
              department: '',
              skills: '',
            },
        cvFile: null,
        photoFile: null,
      };
    }),
}));

const InternForm = ({ onSubmit, initialData = null }) => {
  const { formData, cvFile, photoFile, setField, setFiles, reset } = useInternFormStore();

  // Reset form when initialData changes (e.g. switching to edit mode)
  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setField(name, type === 'checkbox' ? checked : value);
  };

  const handleFileChange = (type, file) => {
    if (type === 'cv') {
      setFiles(file, photoFile);
    } else {
      setFiles(cvFile, file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      skills: typeof formData.skills === 'string'
        ? formData.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : formData.skills,
    };
    onSubmit(finalData, cvFile, photoFile);
  };

  // Memoized FormSection to prevent unnecessary re-renders
  const FormSection = useMemo(
    () =>
      ({ icon: Icon, title, children }) => (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </div>
      ),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-2xl shadow-sm border"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          {initialData ? 'Edit Intern' : 'Add New Intern'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the information below to {initialData ? 'update' : 'add'} an intern
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <FormSection icon={User} title="Personal Information">
          <div>
            <Label>Full Name *</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <Label>Email Address *</Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </div>
          <div>
            <Label>Phone Number *</Label>
            <Input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254..."
              required
            />
          </div>
        </FormSection>

        {/* Academic Information */}
        <FormSection icon={GraduationCap} title="Academic Information">
          <div>
            <Label>Institution</Label>
            <Input
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="University/College name"
            />
          </div>
          <div>
            <Label>Course/Program</Label>
            <Input
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Skills (comma-separated)</Label>
            <Input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., Laravel, React, Python"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="graduated"
              checked={formData.graduated}
              onCheckedChange={(checked) => setField('graduated', !!checked)}
            />
            <Label htmlFor="graduated" className="cursor-pointer">
              Has Graduated
            </Label>
          </div>
        </FormSection>

        {/* Internship Details */}
        <FormSection icon={Building2} title="Internship Details">
          <div>
            <Label>Position/Role</Label>
            <Input
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g., Web Developer"
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., ICT"
            />
          </div>
        </FormSection>

        {/* Timeline */}
        <FormSection icon={Calendar} title="Timeline">
          <div>
            <Label>Start Date *</Label>
            <DateInputWithIcon
              name="from"
              type="date"
              value={formData.from}
              onChange={handleChange}
              required
            />
          </div>
        </FormSection>

        {/* File Uploads */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Upload className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Documents</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Upload CV</Label>
                         <FileInputWithPreview
  name="cv"
  onChange={(e) => handleFileChange('cv', e.target.value)} // use value, not files
  accept=".pdf,.doc,.docx"
  className="cursor-pointer"
/>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX format</p>
            </div>
            <div>
              <Label>Passport Photo</Label>
         <FileInputWithPreview
  name="photo"
  accept="image/png, image/jpeg, image/webp" // restrict to images
  onChange={(e) => handleFileChange('photo', e.target.value)} // send the actual File object
  className="cursor-pointer"
/>
              <p className="text-xs text-gray-500 mt-1">Maximum size: 2MB</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <Button type="submit" className="w-full md:w-auto px-8">
            {initialData ? 'Update Intern' : 'Add Intern'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default InternForm;