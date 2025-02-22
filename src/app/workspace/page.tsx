import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Calendar from '@/components/Calendar';
import KanbanBoard from '@/components/KanbanBoard';
import ProjectManager from '@/components/ProjectManager';

export default async function WorkspacePage() {
  const supabase = createClient();

  // Fetch todos
  const { data: todos, error: todosError } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (todosError) {
    console.error('Error fetching todos:', todosError);
  }

  // Server action to update todo status
  async function updateTodoStatus(id: string, status: 'pending' | 'in-progress' | 'completed') {
    'use server';
    const supabase = createClient();
    
    const { error } = await supabase
      .from('todos')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating todo status:', error);
    }
  }

  // Server action to create a project
  async function createProject(project: { name: string; color: string }) {
    'use server';
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }

    return data;
  }

  // Server action to add todo to project
  async function addTodoToProject(todoId: string, projectId: string) {
    'use server';
    const supabase = createClient();
    
    const { error } = await supabase
      .from('project_todos')
      .insert({ todo_id: todoId, project_id: projectId });

    if (error) {
      console.error('Error adding todo to project:', error);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Workspace</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Suspense fallback={<div>Loading Calendar...</div>}>
          <Calendar todos={todos || []} />
        </Suspense>
        
        <Suspense fallback={<div>Loading Project Manager...</div>}>
          <ProjectManager 
            todos={todos || []} 
            onCreateProject={createProject} 
            onAddTodoToProject={addTodoToProject} 
          />
        </Suspense>
      </div>

      <Suspense fallback={<div>Loading Kanban Board...</div>}>
        <KanbanBoard 
          todos={todos || []} 
          onUpdateTodoStatus={updateTodoStatus} 
        />
      </Suspense>
    </div>
  );
}