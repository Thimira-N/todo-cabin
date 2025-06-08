'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { todoStorage } from '@/lib/storage';
import { TodoItem } from '@/types';
import { Plus, Calendar, Filter, Check, Trash2, Edit3, CheckSquare } from 'lucide-react';
import { format, isAfter, isBefore, isToday, parseISO } from 'date-fns';

const ToDo = () => {
    const { user } = useAuth();
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [filteredTodos, setFilteredTodos] = useState<TodoItem[]>([]);
    const [isAddingTodo, setIsAddingTodo] = useState(false);
    const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
    const [filterPeriod, setFilterPeriod] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');

    const [newTodo, setNewTodo] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        dueDate: '',
    });

    useEffect(() => {
        if (user) {
            loadTodos();
        }
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [todos, filterPeriod, filterStatus, filterPriority]);

    const loadTodos = () => {
        if (user) {
            const userTodos = todoStorage.getAll(user.id);
            setTodos(userTodos);
        }
    };

    const applyFilters = () => {
        let filtered = [...todos];

        // Filter by status
        if (filterStatus === 'completed') {
            filtered = filtered.filter(todo => todo.completed);
        } else if (filterStatus === 'pending') {
            filtered = filtered.filter(todo => !todo.completed);
        }

        // Filter by priority
        if (filterPriority !== 'all') {
            filtered = filtered.filter(todo => todo.priority === filterPriority);
        }

        // Filter by time period
        if (filterPeriod !== 'all') {
            const today = new Date();

            filtered = filtered.filter(todo => {
                if (!todo.dueDate) return filterPeriod === 'no-date';

                const dueDate = parseISO(todo.dueDate);

                switch (filterPeriod) {
                    case 'today':
                        return isToday(dueDate);
                    case 'overdue':
                        return isBefore(dueDate, today) && !todo.completed;
                    case 'upcoming':
                        return isAfter(dueDate, today);
                    case 'no-date':
                        return false;
                    default:
                        return true;
                }
            });
        }

        setFilteredTodos(filtered);
    };

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newTodo.title.trim()) return;

        try {
            todoStorage.add({
                title: newTodo.title.trim(),
                description: newTodo.description.trim(),
                priority: newTodo.priority,
                dueDate: newTodo.dueDate || undefined,
                completed: false,
                userId: user.id,
            });

            setNewTodo({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: '',
            });
            setIsAddingTodo(false);
            loadTodos();
        } catch (error) {
            console.error('Failed to add todo:', error);
        }
    };

    const handleEditTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTodo) return;

        try {
            todoStorage.update(editingTodo);
            setEditingTodo(null);
            loadTodos();
        } catch (error) {
            console.error('Failed to update todo:', error);
        }
    };

    const handleToggleComplete = (todo: TodoItem) => {
        const updatedTodo = { ...todo, completed: !todo.completed };
        todoStorage.update(updatedTodo);
        loadTodos();
    };

    const handleDeleteTodo = (todoId: string) => {
        todoStorage.delete(todoId);
        loadTodos();
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getCompletedCount = () => todos.filter(todo => todo.completed).length;
    const getTotalCount = () => todos.length;

    return (
        <Layout className="bg-gradient-to-br from-transparent via-purple-100 to-transparent dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            To-Do List
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Manage your tasks and stay organized
                        </p>
                    </div>

                    <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Task</DialogTitle>
                                <DialogDescription>
                                    Create a new task with priority and due date.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddTodo} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Task Title</Label>
                                    <Input
                                        id="title"
                                        value={newTodo.title}
                                        onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                                        placeholder="Enter task title"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={newTodo.description}
                                        onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                                        placeholder="Enter task description"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select
                                            value={newTodo.priority}
                                            onValueChange={(value: 'low' | 'medium' | 'high') =>
                                                setNewTodo({ ...newTodo, priority: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dueDate">Due Date (Optional)</Label>
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            value={newTodo.dueDate}
                                            onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" className="flex-1">
                                        Add Task
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAddingTodo(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                    <CheckSquare className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Tasks</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {getTotalCount()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {getCompletedCount()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {getTotalCount() - getCompletedCount()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Time Period</Label>
                                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tasks</SelectItem>
                                        <SelectItem value="today">Due Today</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                        <SelectItem value="upcoming">Upcoming</SelectItem>
                                        <SelectItem value="no-date">No Due Date</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={filterPriority} onValueChange={setFilterPriority}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks List */}
                <div className="space-y-4">
                    {filteredTodos.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <CheckSquare className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No Tasks Found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                                    {todos.length === 0
                                        ? "Start by adding your first task to stay organized."
                                        : "Try adjusting your filters to see more tasks."
                                    }
                                </p>
                                {todos.length === 0 && (
                                    <Button
                                        onClick={() => setIsAddingTodo(true)}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Your First Task
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        filteredTodos.map((todo) => (
                            <Card key={todo.id} className={`hover:shadow-lg transition-shadow ${todo.completed ? 'opacity-75' : ''}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <Checkbox
                                            checked={todo.completed}
                                            onCheckedChange={() => handleToggleComplete(todo)}
                                            className="mt-1"
                                        />

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                                        {todo.title}
                                                    </h3>
                                                    {todo.description && (
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            {todo.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Badge className={getPriorityColor(todo.priority)}>
                                                            {todo.priority}
                                                        </Badge>
                                                        {todo.dueDate && (
                                                            <Badge variant="outline">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                {format(parseISO(todo.dueDate), 'MMM d, yyyy')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={() => setEditingTodo(todo)}
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeleteTodo(todo.id)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Edit Dialog */}
                <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                            <DialogDescription>
                                Update your task details.
                            </DialogDescription>
                        </DialogHeader>
                        {editingTodo && (
                            <form onSubmit={handleEditTodo} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="editTitle">Task Title</Label>
                                    <Input
                                        id="editTitle"
                                        value={editingTodo.title}
                                        onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                                        placeholder="Enter task title"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editDescription">Description</Label>
                                    <Textarea
                                        id="editDescription"
                                        value={editingTodo.description || ''}
                                        onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                                        placeholder="Enter task description"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editPriority">Priority</Label>
                                        <Select
                                            value={editingTodo.priority}
                                            onValueChange={(value: 'low' | 'medium' | 'high') =>
                                                setEditingTodo({ ...editingTodo, priority: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="editDueDate">Due Date</Label>
                                        <Input
                                            id="editDueDate"
                                            type="date"
                                            value={editingTodo.dueDate || ''}
                                            onChange={(e) => setEditingTodo({ ...editingTodo, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" className="flex-1">
                                        Update Task
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingTodo(null)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    )
}
export default ToDo
