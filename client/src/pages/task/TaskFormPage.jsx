import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const TaskFormPage = () => {
  const { id } = useParams(); // Used to determine if we're editing
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode); // Load existing task only in edit mode
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Load task data for edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchTask = async () => {
      try {
        const res = await apiClient.get(`/tasks/${id}`);
        setTitle(res.data.title || '');
        setDescription(res.data.description || '');
      } catch (err) {
        setError('Failed to load task for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (isEditMode) {
        await apiClient.put(`/tasks/${id}`, { title, description });
        toast.success('Task updated!');
      } else {
        await apiClient.post('/tasks', { title, description });
        toast.success('Task created successfully!');
      }

      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Edit Task' : 'Create New Task'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEditMode
            ? 'Update the task details below.'
            : 'Fill in the details below to add a new task.'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Spinner />}
              {submitting
                ? isEditMode
                  ? 'Saving...'
                  : 'Creating...'
                : isEditMode
                ? 'Save Changes'
                : 'Create Task'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskFormPage;
