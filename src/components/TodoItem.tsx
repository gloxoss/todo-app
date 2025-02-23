import { useState } from 'react';
import { Todo } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import AiTodoEditor from './AiTodoEditor';

interface TodoItemProps {
  todo: Todo;
  onToggleStatus: (id: string, status: 'pending' | 'completed') => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
}

export default function TodoItem({ todo, onToggleStatus, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description || '');
  const [editedDueDate, setEditedDueDate] = useState(todo.due_date || '');

  const handleSave = () => {
    if (editedTitle.trim()) {
      onUpdate(todo.id, {
        title: editedTitle.trim(),
        description: editedDescription.trim(),
        due_date: editedDueDate || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(todo.title);
    setEditedDescription(todo.description || '');
    setEditedDueDate(todo.due_date || '');
    setIsEditing(false);
  };

  return (
    <>
      <div className="group p-4 hover:bg-gray-50 transition-colors duration-200">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="pt-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={todo.status === 'completed'}
                onChange={() => onToggleStatus(todo.id, todo.status === 'completed' ? 'pending' : 'completed')}
                className="sr-only peer"
              />
              <div className="w-5 h-5 border-2 rounded-md border-gray-300 peer-checked:border-indigo-500 peer-checked:bg-indigo-500 transition-all duration-200 flex items-center justify-center">
                {todo.status === 'completed' && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </label>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 resize-none"
                    placeholder="Task description"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-lg font-medium ${
                    todo.status === 'completed' 
                      ? 'text-gray-400 line-through' 
                      : 'text-gray-900'
                  } transition-colors duration-200`}>
                    {todo.title}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    {todo.due_date && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        new Date(todo.due_date) < new Date() 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {formatDate(todo.due_date)}
                      </span>
                    )}
                    
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                      <button
                        onClick={() => setIsAiEditing(true)}
                        className="p-1 text-gray-400 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-all duration-200"
                        title="Edit with AI"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-all duration-200"
                        title="Edit task"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(todo.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all duration-200"
                        title="Delete task"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {todo.description && (
                  <p className={`text-sm ${
                    todo.status === 'completed' 
                      ? 'text-gray-400' 
                      : 'text-gray-600'
                  }`}>
                    {todo.description}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Edit Modal */}
      {isAiEditing && (
        <AiTodoEditor
          todo={todo}
          onUpdate={onUpdate}
          onClose={() => setIsAiEditing(false)}
        />
      )}
    </>
  );
}