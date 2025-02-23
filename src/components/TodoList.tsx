'use client';

import { useState, useEffect } from 'react';
import { supabase, Todo } from '@/lib/supabase';
import TodoItem from './TodoItem';
import AddTodoForm from './AddTodoForm';
import DocumentParser from './DocumentParser';
import TodoFilters from './TodoFilters';
import LoadingSpinner from './LoadingSpinner';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalTodos, setTotalTodos] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTodos();
  }, [page, statusFilter, searchQuery, sortBy]);

  async function fetchTodos() {
    try {
      setLoading(true);

      // Build the query
      let query = supabase.from('todos').select('*', { count: 'exact' });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply search query
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      // Apply sorting
      switch (sortBy) {
        case 'created_asc':
          query = query.order('created_at', { ascending: true });
          break;
        case 'created_desc':
          query = query.order('created_at', { ascending: false });
          break;
        case 'due_date':
          query = query.order('due_date', { ascending: true });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
      }

      // Apply pagination
      query = query.range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      // Execute the query
      const { data, count, error } = await query;

      if (error) throw error;

      setTodos(data || []);
      setTotalTodos(count || 0);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(todo: Omit<Todo, 'id' | 'created_at' | 'user_id'>) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ ...todo, user_id: 'default-user' }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh todos to include the new task
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  }

  async function toggleTodoStatus(id: string, status: 'pending' | 'completed') {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Refresh todos to reflect the status change
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }

  async function deleteTodo(id: string) {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh todos after deletion
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }

  async function updateTodo(id: string, updates: Partial<Todo>) {
    try {
      const { error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh todos after update
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }

  // Calculate total pages
  const totalPages = Math.ceil(totalTodos / itemsPerPage);

  // Pagination handlers
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Task Manager
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-3 py-1 bg-indigo-50 rounded-full">
                Total: {totalTodos} tasks
              </span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-12 gap-8">
            {/* Left Sidebar - Add & Import */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Task</h2>
                <AddTodoForm onAdd={addTodo} />
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Import Tasks</h2>
                <DocumentParser onTasksExtracted={tasks => tasks.forEach(addTodo)} />
              </div>
            </div>

            {/* Right Content - Filters & Tasks */}
            <div className="md:col-span-8 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <TodoFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>

              {/* Tasks List */}
              <div className="bg-white rounded-xl">
                {todos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-500">Get started by adding your first task!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {todos.map(todo => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggleStatus={toggleTodoStatus}
                        onDelete={deleteTodo}
                        onUpdate={updateTodo}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {todos.length > 0 && (
                <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:hover:bg-indigo-50 transition-colors duration-200"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-sm bg-gray-100 rounded-md">
                      Page {page} of {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:hover:bg-indigo-50 transition-colors duration-200"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}