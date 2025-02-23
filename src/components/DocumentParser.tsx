'use client';

import { useState } from 'react';
import { extractTasksFromDocument } from '@/lib/openrouter';
import { Todo } from '@/lib/supabase';

interface DocumentParserProps {
  onTasksExtracted: (tasks: Omit<Todo, 'id' | 'created_at' | 'user_id'>[]) => void;
}

export default function DocumentParser({ onTasksExtracted }: DocumentParserProps) {
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document.trim()) {
      setError('Please enter a document to parse');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tasks = await extractTasksFromDocument(document);

      if (tasks.length === 0) {
        setError('No tasks could be extracted from the document');
        return;
      }

      const formattedTasks = tasks.map((task: any) => ({
        title: task.title || 'Untitled Task',
        description: task.description || 'No description provided',
        status: 'pending' as const
      }));

      onTasksExtracted(formattedTasks);
      setDocument('');
    } catch (error) {
      console.error('Error parsing document:', error);
      setError('Failed to extract tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
      <div>
        <label htmlFor="document" className="block text-sm font-medium text-gray-700">
          Parse Tasks from Document
        </label>
        <textarea
          id="document"
          value={document}
          onChange={(e) => {
            setDocument(e.target.value);
            setError(null);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={6}
          placeholder="Paste your document content here..."
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Extracting Tasks...' : 'Extract Tasks'}
      </button>
    </form>
  );
}