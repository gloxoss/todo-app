'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { Todo } from '@/lib/supabase';

interface CalendarProps {
  todos: Todo[];
  onSelectDate?: (date: Date) => void;
}

export default function Calendar({ todos, onSelectDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Group todos by date
  const todosByDate = useMemo(() => {
    return todos.reduce((acc, todo) => {
      if (todo.due_date) {
        const dateKey = format(parseISO(todo.due_date), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(todo);
      }
      return acc;
    }, {} as Record<string, Todo[]>);
  }, [todos]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button 
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500">{day}</div>
        ))}
        
        {calendarDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTodos = todosByDate[dateKey] || [];
          
          return (
            <div 
              key={day.toISOString()}
              className={`p-2 rounded-lg transition-colors cursor-pointer 
                ${!isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : ''}
                ${isToday(day) ? 'bg-indigo-50 border border-indigo-200' : ''}
                hover:bg-indigo-100`}
              onClick={() => onSelectDate && onSelectDate(day)}
            >
              <div className="flex flex-col items-center">
                <span className={`text-sm ${isToday(day) ? 'font-bold text-indigo-600' : ''}`}>
                  {format(day, 'd')}
                </span>
                {dayTodos.length > 0 && (
                  <div className="mt-1 flex space-x-1">
                    {dayTodos.slice(0, 3).map(todo => (
                      <span 
                        key={todo.id} 
                        className={`h-1.5 w-1.5 rounded-full ${
                          todo.status === 'completed' 
                            ? 'bg-green-500' 
                            : 'bg-indigo-500'
                        }`}
                      />
                    ))}
                    {dayTodos.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{dayTodos.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}