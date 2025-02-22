'use client';

import { useState } from 'react';
import { Todo } from '@/lib/supabase';

interface Project {
  id: string;
  name: string;
  color: string;
  todos: Todo[];
}

interface ProjectManagerProps {
  todos: Todo[];
  onCreateProject: (project: Omit<Project, 'id' | 'todos'>) => void;
  onAddTodoToProject: (todoId: string, projectId: string) => void;
}

export default function ProjectManager({ todos, onCreateProject, onAddTodoToProject }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const COLOR_OPTIONS = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 
    'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'
  ];

  const handleCreateProject = () => {
    if (!newProjectName.trim() || !selectedColor) return;

    const newProject: Omit<Project, 'id' | 'todos'> = {
      name: newProjectName,
      color: selectedColor
    };

    onCreateProject(newProject);
    setNewProjectName('');
    setSelectedColor('');
  };

  const handleDragStart = (e: React.DragEvent, todo: Todo) => {
    e.dataTransfer?.setData('text/plain', todo.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, projectId: string) => {
    e.preventDefault();
    const todoId = e.dataTransfer?.getData('text/plain');
    
    if (todoId) {
      onAddTodoToProject(todoId, projectId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Project</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project Name"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <div className="flex space-x-2">
            {COLOR_OPTIONS.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full ${color} ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleCreateProject}
            disabled={!newProjectName.trim() || !selectedColor}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div
              key={project.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, project.id)}
              className={`border-2 ${project.color.replace('bg', 'border')} border-opacity-50 rounded-lg p-4`}
            >
              <div className="flex items-center mb-4">
                <div className={`w-4 h-4 ${project.color} rounded-full mr-2`} />
                <h3 className="font-medium text-gray-800">{project.name}</h3>
              </div>
              
              <div className="space-y-2">
                {project.todos.map(todo => (
                  <div
                    key={todo.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, todo)}
                    className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-gray-700">{todo.title}</h4>
                    {todo.description && (
                      <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Unassigned Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todos.filter(todo => !projects.some(p => p.todos.some(t => t.id === todo.id))).map(todo => (
            <div
              key={todo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, todo)}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-gray-800">{todo.title}</h3>
              {todo.description && (
                <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}