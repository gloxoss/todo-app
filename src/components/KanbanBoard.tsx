'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Todo } from '@/lib/supabase';

interface KanbanBoardProps {
  todos: Todo[];
  onUpdateTodoStatus: (id: string, status: 'pending' | 'in-progress' | 'completed') => void;
}

const COLUMNS = [
  { id: 'pending', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' }
];

export default function KanbanBoard({ todos, onUpdateTodoStatus }: KanbanBoardProps) {
  const [boardTodos, setBoardTodos] = useState(todos);

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If no destination, do nothing
    if (!destination) return;

    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Find the todo being dragged
    const draggedTodo = boardTodos.find(todo => todo.id === draggableId);
    
    if (!draggedTodo) return;

    // Update the todo's status
    const newStatus = destination.droppableId as 'pending' | 'in-progress' | 'completed';
    onUpdateTodoStatus(draggedTodo.id, newStatus);

    // Optimistically update local state
    const newTodos = Array.from(boardTodos);
    const [reorderedTodo] = newTodos.splice(source.index, 1);
    reorderedTodo.status = newStatus;
    newTodos.splice(destination.index, 0, reorderedTodo);
    
    setBoardTodos(newTodos);
  }, [boardTodos, onUpdateTodoStatus]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Task Board</h2>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {COLUMNS.map(column => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`${column.color} rounded-lg p-4 min-h-[400px]`}
                >
                  <h3 className="text-lg font-medium mb-4 text-gray-700">
                    {column.title}
                  </h3>
                  
                  {boardTodos
                    .filter(todo => todo.status === column.id)
                    .map((todo, index) => (
                      <Draggable key={todo.id} draggableId={todo.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800">{todo.title}</h4>
                                {todo.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {todo.description}
                                  </p>
                                )}
                                {todo.due_date && (
                                  <span className="text-xs text-gray-500 mt-2 block">
                                    Due: {new Date(todo.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span 
                                  className={`h-2 w-2 rounded-full ${
                                    column.id === 'pending' 
                                      ? 'bg-gray-500' 
                                      : column.id === 'in-progress' 
                                        ? 'bg-blue-500' 
                                        : 'bg-green-500'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}