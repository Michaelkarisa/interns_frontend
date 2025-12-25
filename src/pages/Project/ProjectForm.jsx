// src/components/projects/ProjectForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Search, UserPlus } from 'lucide-react';

const ProjectForm = ({ initialData, onSave, onCancel, currentInternId }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    impact: initialData?.impact || '',
    url: initialData?.url || '',
    is_team: initialData?.is_team || false,
    team_members: initialData?.team_members || [],
    intern_id:initialData?.intern_id||''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamToggle = (checked) => {
    setFormData((prev) => ({ 
      ...prev, 
      is_team: checked,
      team_members: checked ? prev.team_members : []
    }));
  };

  // ✅ Search for interns
  const searchInterns = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get('/filterInterns', {
        params: { search: query.trim() }
      });
      
      // Extract data array from paginated response
      const interns = response.data.data || [];
      
      // Filter out current intern and already added team members
      const filtered = interns.filter(intern => 
        intern.id !== currentInternId && 
        !formData.team_members.some(member => member.id === intern.id)
      );
      
      setSearchResults(filtered);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ✅ Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery && formData.is_team) {
        searchInterns(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, formData.is_team]);

  // ✅ Add team member
  const addTeamMember = (intern) => {
    setFormData((prev) => ({
      ...prev,
      team_members: [...prev.team_members, intern]
    }));
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // ✅ Remove team member
  const removeTeamMember = (internId) => {
    setFormData((prev) => ({
      ...prev,
      team_members: prev.team_members.filter(member => member.id !== internId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    
    // Validate title length (max 255)
    if (formData.title.length > 255) {
      alert('Title must not exceed 255 characters');
      return;
    }
    
    // Validate description length (max 2000)
    if (formData.description && formData.description.length > 2000) {
      alert('Description must not exceed 2000 characters');
      return;
    }
    
    // Validate impact length (max 2000)
    if (formData.impact && formData.impact.length > 2000) {
      alert('Impact must not exceed 2000 characters');
      return;
    }
    
    // Validate URL format if provided
    if (formData.url && formData.url.trim()) {
      try {
        new URL(formData.url);
        if (formData.url.length > 255) {
          alert('URL must not exceed 255 characters');
          return;
        }
      } catch {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
    }
    
    // Prepare data for submission matching backend validation rules
    const submitData = {
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      impact: formData.impact?.trim() || null,
      url: formData.url?.trim() || null,
      intern_id: currentInternId,
      team_members: formData.is_team 
        ? formData.team_members.map(member => member.id) 
        : []
    };
    
    onSave(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter project title..."
          required
          maxLength={255}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.title.length}/255 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the project..."
          rows={4}
          maxLength={2000}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.description?.length || 0}/2000 characters
        </p>
      </div>

      {/* Impact */}
      <div>
        <Label htmlFor="impact">Impact</Label>
        <Textarea
          id="impact"
          name="impact"
          value={formData.impact}
          onChange={handleChange}
          placeholder="What was the impact or outcome?"
          rows={3}
          maxLength={2000}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.impact?.length || 0}/2000 characters
        </p>
      </div>

      {/* URL */}
      <div>
        <Label htmlFor="url">Project URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="https://example.com"
          maxLength={255}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional link to project repository or demo
        </p>
      </div>

      {/* Team Project Toggle */}
      <div className="flex items-center space-x-2 py-2">
        <Switch
          id="is_team"
          checked={formData.is_team}
          onCheckedChange={handleTeamToggle}
        />
        <Label htmlFor="is_team" className="cursor-pointer">
          This is a team project
        </Label>
      </div>

      {/* Team Members Section */}
      {formData.is_team && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <Label className="mb-2 block">Team Members</Label>
          
          {/* Search Input */}
          <div className="relative mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                placeholder="Search interns by name or email..."
                className="pl-10"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                ) : (
                  searchResults.map((intern) => (
                    <button
                      key={intern.id}
                      type="button"
                      onClick={() => addTeamMember(intern)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-medium text-sm">{intern.name}</p>
                        <p className="text-xs text-gray-500">{intern.email}</p>
                      </div>
                      <UserPlus className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    </button>
                  ))
                )}
              </div>
            )}

            {showSearchResults && searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-3">
                <p className="text-sm text-gray-500 text-center">No interns found</p>
              </div>
            )}
          </div>

          {/* Selected Team Members */}
          <div className="space-y-2">
            {formData.team_members.length > 0 ? (
              formData.team_members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between bg-white border rounded-lg px-3 py-2"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(member.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    aria-label={`Remove ${member.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-3">
                No team members added yet. Search above to add collaborators.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Project
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;