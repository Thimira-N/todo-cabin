'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MinuteTrackerEntry, Member } from '@/types';
import { Plus, Calendar, Trash2, Clock, Users, Save, Download, Search, CheckCircle, AlertCircle, BarChart3, CalendarDays, Target, Timer, Copy, TrendingUp } from 'lucide-react';
import { format, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import * as XLSX from 'xlsx';
import { memberService } from '@/lib/firestore/members';
import { minuteTrackerService } from '@/lib/firestore/minuteTracker';
import {LoadingScreen} from "@/components/loadingScreen";

type FilterPeriod = 'all' | 'today' | 'week' | 'month' | 'custom';
type ViewMode = 'list' | 'grid' | 'summary';

const MinuteTracker = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [trackerEntries, setTrackerEntries] = useState<MinuteTrackerEntry[]>([]);
    const [isCreatingEntry, setIsCreatingEntry] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
    const [showCompletedOnly, setShowCompletedOnly] = useState(false);
    const [autoSave, setAutoSave] = useState(true);
    const [loading, setLoading] = useState(true);

    const [newEntry, setNewEntry] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        selectedMembers: [] as string[],
        template: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        estimatedMinutes: 480, // 8 hours default
    });

    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            await loadMembers();
            await loadTrackerEntries();
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async () => {
        if (!user?.id) return;
        try {
            const userMembers = await memberService.getAll(user.id);
            setMembers(userMembers);
        } catch (error) {
            console.error('Failed to load members:', error);
        }
    };

    const loadTrackerEntries = async () => {
        if (!user?.id) return;
        try {
            const entries = await minuteTrackerService.getAll(user.id);
            setTrackerEntries(entries);
        } catch (error) {
            console.error('Failed to load tracker entries:', error);
        }
    };

    const getMemberName = (memberId: string): string => {
        const member = members.find(m => m.id === memberId);
        return member ? member.name : 'Unknown Member';
    };

    //filtering logic
    const filteredEntries = useMemo(() => {
        let filtered = trackerEntries;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(entry => {
                const memberNames = entry.members.map(id => getMemberName(id)).join(' ').toLowerCase();
                const tasks = Object.values(entry.tasks).flat().join(' ').toLowerCase();
                const dateStr = format(new Date(entry.date), 'MMMM d, yyyy').toLowerCase();
                return memberNames.includes(searchQuery.toLowerCase()) ||
                    tasks.includes(searchQuery.toLowerCase()) ||
                    dateStr.includes(searchQuery.toLowerCase());
            });
        }

        // Date filter
        if (filterPeriod !== 'all') {
            const now = new Date();
            let startDate: Date, endDate: Date;

            switch (filterPeriod) {
                case 'today':
                    startDate = endDate = now;
                    break;
                case 'week':
                    startDate = startOfWeek(now);
                    endDate = endOfWeek(now);
                    break;
                case 'month':
                    startDate = startOfMonth(now);
                    endDate = endOfMonth(now);
                    break;
                case 'custom':
                    if (customDateRange.start && customDateRange.end) {
                        startDate = new Date(customDateRange.start);
                        endDate = new Date(customDateRange.end);
                    } else {
                        return filtered;
                    }
                    break;
                default:
                    return filtered;
            }

            filtered = filtered.filter(entry => {
                const entryDate = new Date(entry.date);
                return isWithinInterval(entryDate, { start: startDate, end: endDate });
            });
        }

        // Member filter
        if (selectedMemberFilter !== 'all') {
            filtered = filtered.filter(entry => entry.members.includes(selectedMemberFilter));
        }

        // Completed tasks filter
        if (showCompletedOnly) {
            filtered = filtered.filter(entry =>
                Object.values(entry.tasks).some(tasks =>
                    tasks.some(task => task.trim().length > 0)
                )
            );
        }

        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [trackerEntries, searchQuery, filterPeriod, customDateRange, selectedMemberFilter, showCompletedOnly]);

    // Statistics
    const stats = useMemo(() => {
        const totalEntries = filteredEntries.length;
        const totalMembers = new Set(filteredEntries.flatMap(e => e.members)).size;
        const totalTasks = filteredEntries.reduce((sum, entry) =>
            sum + Object.values(entry.tasks).flat().filter(task => task.trim().length > 0).length, 0
        );
        const completionRate = totalEntries > 0 ?
            Math.round((filteredEntries.filter(entry =>
                Object.values(entry.tasks).some(tasks =>
                    tasks.some(task => task.trim().length > 0)
                )
            ).length / totalEntries) * 100) : 0;

        return { totalEntries, totalMembers, totalTasks, completionRate };
    }, [filteredEntries]);

    const handleCreateEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || newEntry.selectedMembers.length === 0) return;

        try {
            const tasks: { [memberId: string]: string[] } = {};
            newEntry.selectedMembers.forEach(memberId => {
                const initialTasks = newEntry.template ? [newEntry.template] : [''];
                tasks[memberId] = initialTasks;
            });

            // Create the new entry object with all required fields
            const entryToAdd = {
                date: newEntry.date,
                members: newEntry.selectedMembers,
                tasks,
                priority: newEntry.priority,
                estimatedMinutes: newEntry.estimatedMinutes,  // Fixed typo here (was estimatedM)
                userId: user.id,
                createdAt: new Date(),  // Add createdAt field
                id: Date.now().toString()  // Add id field
            };

            // Actually add the entry to the database
            await minuteTrackerService.add(entryToAdd);

            // Reset the form
            setNewEntry({
                date: format(new Date(), 'yyyy-MM-dd'),
                selectedMembers: [],
                template: '',
                priority: 'medium',
                estimatedMinutes: 480,
            });
            setIsCreatingEntry(false);
            await loadTrackerEntries();
        } catch (error) {
            console.error('Failed to create tracker entry:', error);
        }
    };

    const handleMemberToggle = (memberId: string) => {
        setNewEntry(prev => ({
            ...prev,
            selectedMembers: prev.selectedMembers.includes(memberId)
                ? prev.selectedMembers.filter(id => id !== memberId)
                : [...prev.selectedMembers, memberId]
        }));
    };

    const handleDeleteEntry = async (entryId: string) => {
        if (confirm('Are you sure you want to delete this tracker entry?')) {
            try {
                await minuteTrackerService.delete(entryId);
                await loadTrackerEntries();
            } catch (error) {
                console.error('Failed to delete entry:', error);
            }
        }
    };

    const handleDuplicateEntry = async (entry: MinuteTrackerEntry) => {
        if (!user?.id) return;

        try {
            const duplicatedEntry = {
                ...entry,
                id: Date.now().toString(),
                date: format(new Date(), 'yyyy-MM-dd'),
                tasks: Object.fromEntries(
                    Object.entries(entry.tasks).map(([memberId]) => [memberId, ['']]
                    ),)
            };

            await minuteTrackerService.add(duplicatedEntry);
            await loadTrackerEntries();
        } catch (error) {
            console.error('Failed to duplicate entry:', error);
        }
    };

    const handleExportData = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Prepare the data for export
        const excelData = filteredEntries.flatMap(entry => {
            const baseData = {
                'Date': format(new Date(entry.date), 'yyyy-MM-dd'),
                'Priority': entry.priority,
                'Estimated Minutes': entry.estimatedMinutes
            };

            // Flatten tasks for each member
            return Object.entries(entry.tasks).map(([memberId, tasks]) => {
                const memberName = getMemberName(memberId);
                return tasks
                    .filter(task => task.trim())
                    .map((task, index) => ({
                        ...baseData,
                        'Member': memberName,
                        'Task Number': index + 1,
                        'Task Description': task
                    }));
            }).flat();
        });

        // Convert data to worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Minute Tracker');

        // Generate Excel file and download
        XLSX.writeFile(workbook, `minute-tracker-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    // const handleExportIndividualEntry = (entry: MinuteTrackerEntry) => {
    //     // Create a new workbook
    //     const workbook = XLSX.utils.book_new();
    //
    //     // Prepare the data for export
    //     const excelData = Object.entries(entry.tasks).map(([memberId, tasks]) => {
    //         const memberName = getMemberName(memberId);
    //         return tasks
    //             .filter(task => task.trim())
    //             .map((task, index) => ({
    //                 'Date': format(new Date(entry.date), 'yyyy-MM-dd'),
    //                 'Member': memberName,
    //                 'Priority': entry.priority,
    //                 'Estimated Minutes': entry.estimatedMinutes,
    //                 'Task Number': index + 1,
    //                 'Task Description': task
    //             }));
    //     }).flat();
    //
    //     // Convert data to worksheet
    //     const worksheet = XLSX.utils.json_to_sheet(excelData);
    //
    //     // Add worksheet to workbook
    //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Minute Tracker');
    //
    //     // Generate Excel file and download
    //     XLSX.writeFile(workbook, `minute-tracker-${format(new Date(entry.date), 'yyyy-MM-dd')}.xlsx`);
    // };


    interface ExcelExportRow {
        'Time Tracker Details'?: string;
        'Detailed Tasks'?: string;
        'Task Description'?: string;
        'Member'?: string | number;
        'Minutes'?: number;
        'Status'?: string;
        'Notes'?: string;
        ''?: string | number; // For empty cells
    }

    const handleExportIndividualEntry = (entry: MinuteTrackerEntry) => {
        const workbook = XLSX.utils.book_new();
        const exportData: ExcelExportRow[] = []; 

        // === SECTION 1: TRACKER DETAILS (TOP) ===
        exportData.push(
            { 'Time Tracker Details': 'DATE', '': format(new Date(entry.date), 'MM/dd/yyyy') },
            { 'Time Tracker Details': 'TOTAL MINUTES', '': entry.estimatedMinutes },
            { 'Time Tracker Details': 'PRIORITY', '': entry.priority.toLowerCase() },
            { 'Time Tracker Details': 'CREATED AT', '': format(new Date(entry.createdAt || entry.date), 'MM/dd/yyyy hh:mm a') },
            { 'Time Tracker Details': 'STATUS', '': 'Completed' },
            {}, // Spacer
        );

        // === SECTION 2: TASK BREAKDOWN (GROUPED BY MEMBER) ===
        exportData.push(
            { 'Detailed Tasks': '========== Tasks Description =========', '': '', '': '' }, // Bold section header
        );

        // Add tasks grouped by member
        Object.entries(entry.tasks).forEach(([memberId, tasks]) => {
            const memberName = getMemberName(memberId);
            const memberTasks = tasks.filter(task => task.trim());

            if (memberTasks.length > 0) {
                // Bold member header
                exportData.push(
                    {},
                    { 'Member': memberName, '': 'Member Name: ' },
                    { 'Task Description': 'Task(s) Done: ', '': '' }, // Sub-header
                );

                // Member tasks
                memberTasks.forEach((task) => {
                    exportData.push({
                        'Task Description': task,
                    });
                });
                exportData.push({}); // Spacer
            }
        });

        // === SECTION 3: NOTES (BOTTOM) ===
        exportData.push(
            { 'Notes': 'Additional notes or comments...' },
        );

        // Convert to worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData, { skipHeader: true });

        // Set column widths and styling
        worksheet['!cols'] = [
            { wch: 15 }, // Task Description
            { wch: 12 }, // Minutes
            { wch: 12 }, // Status
        ];

        // Add bold styling and font size to headers
        const boldStyle = { font: { bold: true, sz: 14 } };
        const headerRows = [0, 7, 8, exportData.length - 1]; // Rows with ***TEXT***
        headerRows.forEach(row => {
            if (worksheet[`A${row + 1}`]) worksheet[`A${row + 1}`].s = boldStyle;
        });

        // Generate and download Excel
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Time Tracker');
        XLSX.writeFile(workbook, `TimeTracker_${format(new Date(entry.date), 'yyyy-MM-dd')}.xlsx`);
    };

    const handleUpdateTask = async (entryId: string, memberId: string, taskIndex: number, value: string) => {
        // Update local state immediately for responsive UI
        setTrackerEntries(prevEntries =>
            prevEntries.map(entry => {
                if (entry.id === entryId) {
                    const updatedTasks = { ...entry.tasks };
                    if (!updatedTasks[memberId]) {
                        updatedTasks[memberId] = [];
                    }
                    updatedTasks[memberId][taskIndex] = value;
                    return { ...entry, tasks: updatedTasks };
                }
                return entry;
            })
        );

        // Then update the database (only if autoSave is enabled)
        if (autoSave) {
            try {
                const entry = trackerEntries.find(e => e.id === entryId);
                if (!entry) return;

                const updatedTasks = { ...entry.tasks };
                if (!updatedTasks[memberId]) {
                    updatedTasks[memberId] = [];
                }
                updatedTasks[memberId][taskIndex] = value;

                const updatedEntry = { ...entry, tasks: updatedTasks };
                await minuteTrackerService.update(updatedEntry);
            } catch (error) {
                console.error('Failed to update task:', error);
                // Optionally revert the local state if the update fails
            }
        }
    };

    const handleAddTask = async (entryId: string, memberId: string) => {
        const entry = trackerEntries.find(e => e.id === entryId);
        if (!entry) return;

        try {
            const updatedTasks = { ...entry.tasks };
            if (!updatedTasks[memberId]) {
                updatedTasks[memberId] = [];
            }
            updatedTasks[memberId].push('');

            const updatedEntry = { ...entry, tasks: updatedTasks };
            await minuteTrackerService.update(updatedEntry);
            await loadTrackerEntries();
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    const handleRemoveTask = async (entryId: string, memberId: string, taskIndex: number) => {
        const entry = trackerEntries.find(e => e.id === entryId);
        if (!entry) return;

        try {
            const updatedTasks = { ...entry.tasks };
            if (updatedTasks[memberId] && updatedTasks[memberId].length > 1) {
                updatedTasks[memberId].splice(taskIndex, 1);
            }

            const updatedEntry = { ...entry, tasks: updatedTasks };
            await minuteTrackerService.update(updatedEntry);
            await loadTrackerEntries();
        } catch (error) {
            console.error('Failed to remove task:', error);
        }
    };

    const getTaskCount = (entry: MinuteTrackerEntry): number => {
        return Object.values(entry.tasks).flat().filter(task => task.trim().length > 0).length;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
        }
    };

    if (loading) {
        return (
            <Layout>
                {/*<div className="flex justify-center items-center min-h-screen">*/}
                {/*    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>*/}
                {/*</div>*/}

                <LoadingScreen />
            </Layout>
        );
    }

    return (
        <Layout className="bg-gradient-to-br from-transparent via-green-50 to-transparent dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Enhanced Header with Stats */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Minute Tracker
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                Track daily work minutes and tasks for team members
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleExportData}
                                variant="outline"
                                className="hidden sm:flex"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>

                            <Dialog open={isCreatingEntry} onOpenChange={setIsCreatingEntry}>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Tracker
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Create New Tracker</DialogTitle>
                                        <DialogDescription>
                                            Set up a new tracking session for your team members.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateEntry} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="date">Date</Label>
                                                <Input
                                                    id="date"
                                                    type="date"
                                                    value={newEntry.date}
                                                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="priority">Priority</Label>
                                                <Select value={newEntry.priority} onValueChange={(value: 'low' | 'medium' | 'high') =>
                                                    setNewEntry({ ...newEntry, priority: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low Priority</SelectItem>
                                                        <SelectItem value="medium">Medium Priority</SelectItem>
                                                        <SelectItem value="high">High Priority</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="estimatedMinutes">Estimated Minutes</Label>
                                            <Input
                                                id="estimatedMinutes"
                                                type="number"
                                                min="1"
                                                value={newEntry.estimatedMinutes}
                                                onChange={(e) => setNewEntry({ ...newEntry, estimatedMinutes: Number(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="template">Task Template (Optional)</Label>
                                            <Textarea
                                                id="template"
                                                placeholder="Enter a default task that will be added for all selected members..."
                                                value={newEntry.template}
                                                onChange={(e) => setNewEntry({ ...newEntry, template: e.target.value })}
                                                rows={2}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <Label>Select Members ({newEntry.selectedMembers.length} selected)</Label>
                                            {members.length === 0 ? (
                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        No members found. Add members in the Registry section first.
                                                    </AlertDescription>
                                                </Alert>
                                            ) : (
                                                <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-4">
                                                    {members.map((member) => (
                                                        <div key={member.id} className="flex items-center space-x-3">
                                                            <Checkbox
                                                                id={member.id}
                                                                checked={newEntry.selectedMembers.includes(member.id)}
                                                                onCheckedChange={() => handleMemberToggle(member.id)}
                                                            />
                                                            <Label
                                                                htmlFor={member.id}
                                                                className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                {member.name}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                className="flex-1"
                                                disabled={newEntry.selectedMembers.length === 0}
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                Create Tracker
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsCreatingEntry(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Entries</p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalEntries}</p>
                                    </div>
                                    <Calendar className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Members</p>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalMembers}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Tasks</p>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalTasks}</p>
                                    </div>
                                    <Target className="h-8 w-8 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Completion Rate</p>
                                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.completionRate}%</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Enhanced Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Filters & Search</h3>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="auto-save" className="text-sm">Auto-save</Label>
                                    <Checkbox
                                        id="auto-save"
                                        checked={autoSave}
                                        onCheckedChange={(checked) => setAutoSave(checked as boolean)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="search"
                                            placeholder="Search entries, members, tasks..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Time Period</Label>
                                    <Select value={filterPeriod} onValueChange={(value: FilterPeriod) => setFilterPeriod(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="week">This Week</SelectItem>
                                            <SelectItem value="month">This Month</SelectItem>
                                            <SelectItem value="custom">Custom Range</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Member</Label>
                                    <Select value={selectedMemberFilter} onValueChange={setSelectedMemberFilter}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Members</SelectItem>
                                            {members.map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>View Mode</Label>
                                    <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="list">List View</SelectItem>
                                            <SelectItem value="grid">Grid View</SelectItem>
                                            <SelectItem value="summary">Summary View</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {filterPeriod === 'custom' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start-date">Start Date</Label>
                                        <Input
                                            id="start-date"
                                            type="date"
                                            value={customDateRange.start}
                                            onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end-date">End Date</Label>
                                        <Input
                                            id="end-date"
                                            type="date"
                                            value={customDateRange.end}
                                            onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="completed-only"
                                    checked={showCompletedOnly}
                                    onCheckedChange={(checked) => setShowCompletedOnly(checked as boolean)}
                                />
                                <Label htmlFor="completed-only" className="text-sm">
                                    Show only entries with completed tasks
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/*Tracker Entries */}
                <div className="space-y-6">
                    {filteredEntries.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {trackerEntries.length === 0 ? 'No Trackers Created' : 'No Matching Entries'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                                    {trackerEntries.length === 0
                                        ? 'Create your first minute tracker to start recording daily tasks.'
                                        : 'Try adjusting your filters to see more entries.'
                                    }
                                </p>
                                {trackerEntries.length === 0 && (
                                    <Button
                                        onClick={() => setIsCreatingEntry(true)}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Tracker
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : viewMode === 'summary' ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Summary View
                                </CardTitle>
                                <CardDescription>
                                    Overview of tracked activities and productivity metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Member Performance Summary */}
                                    <div>
                                        <h4 className="font-semibold mb-3">Member Performance</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {members.filter(member =>
                                                filteredEntries.some(entry => entry.members.includes(member.id))
                                            ).map((member) => {
                                                const memberEntries = filteredEntries.filter(entry => entry.members.includes(member.id));
                                                const totalTasks = memberEntries.reduce((sum, entry) =>
                                                    sum + (entry.tasks[member.id] || []).filter(task => task.trim()).length, 0
                                                );
                                                return (
                                                    <Card key={member.id} className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                                                <span className="text-white font-semibold text-sm">
                                                                  {member.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{member.name}</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                    {memberEntries.length} entries, {totalTasks} tasks
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div>
                                        <h4 className="font-semibold mb-3">Recent Activity</h4>
                                        <div className="space-y-3">
                                            {filteredEntries.slice(0, 5).map((entry) => (
                                                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <CalendarDays className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium">{format(new Date(entry.date), 'MMM d, yyyy')}</span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {entry.members.length} members
                                                        </Badge>
                                                        <Badge className={`text-xs ${getPriorityColor(entry.priority || 'medium')}`}>
                                                            {entry.priority || 'medium'}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        {getTaskCount(entry)} tasks completed
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEntries.map((entry) => (
                                <Card key={entry.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(entry.date), 'MMM d')}
                                                </CardTitle>
                                                <CardDescription className="text-xs mt-1">
                                                    {entry.members.length} member{entry.members.length !== 1 ? 's' : ''}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Badge className={`text-xs ${getPriorityColor(entry.priority || 'medium')}`}>
                                                    {entry.priority || 'medium'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            {entry.members.slice(0, 3).map((memberId) => (
                                                <div key={memberId} className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-semibold text-xs">
                                                          {getMemberName(memberId).charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {getMemberName(memberId)}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-300">
                                                            {(entry.tasks[memberId] || []).filter(task => task.trim()).length} tasks
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            {entry.members.length > 3 && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                                    +{entry.members.length - 3} more members
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                  {getTaskCount(entry)} tasks
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    onClick={() => handleExportIndividualEntry(entry)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDuplicateEntry(entry)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        // List View (Enhanced)
                        filteredEntries.map((entry) => (
                            <Card key={entry.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                {format(new Date(entry.date), 'MMMM d, yyyy')}
                                                {entry.priority && (
                                                    <Badge className={`text-xs ml-2 ${getPriorityColor(entry.priority)}`}>
                                                        {entry.priority}
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="mt-1 flex items-center gap-4">
                                                <span>Tracking {entry.members.length} member{entry.members.length !== 1 ? 's' : ''}</span>
                                                {entry.estimatedMinutes && (
                                                    <span className="flex items-center gap-1">
                                                        <Timer className="h-3 w-3" />
                                                        {Math.floor(entry.estimatedMinutes / 60)}h {entry.estimatedMinutes % 60}m estimated
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Target className="h-3 w-3" />
                                                    {getTaskCount(entry)} tasks completed
                                                </span>
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {entry.members.length}
                                            </Badge>
                                            <Button
                                                onClick={() => handleExportIndividualEntry(entry)}
                                                size="sm"
                                                variant="outline"
                                                className="text-green-600 hover:text-green-700"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Export
                                            </Button>
                                            <Button
                                                onClick={() => handleDuplicateEntry(entry)}
                                                size="sm"
                                                variant="outline"
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteEntry(entry.id)}
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Member
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Completed Tasks
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Progress
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                            {entry.members.map((memberId) => {
                                                const memberTasks = entry.tasks[memberId] || [];
                                                const completedTasks = memberTasks.filter(task => task.trim().length > 0);
                                                const completionRate = memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0;

                                                return (
                                                    <tr key={memberId} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                                                    <span className="text-white font-semibold text-sm">
                                                                      {getMemberName(memberId).charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {getMemberName(memberId)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {completedTasks.length}/{memberTasks.length} tasks
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="space-y-3">
                                                                {memberTasks.map((task, index) => (
                                                                    <div key={index} className="flex items-start gap-2">
                                                                        <div className="flex-1">
                                                                            <Textarea
                                                                                value={task}
                                                                                onChange={(e) => {
                                                                                    // Update local state immediately
                                                                                    const updatedEntries = [...trackerEntries];
                                                                                    const entryIndex = updatedEntries.findIndex(e => e.id === entry.id);
                                                                                    if (entryIndex !== -1) {
                                                                                        const updatedTasks = { ...updatedEntries[entryIndex].tasks };
                                                                                        updatedTasks[memberId] = [...(updatedTasks[memberId] || [])];
                                                                                        updatedTasks[memberId][index] = e.target.value;
                                                                                        updatedEntries[entryIndex] = {
                                                                                            ...updatedEntries[entryIndex],
                                                                                            tasks: updatedTasks
                                                                                        };
                                                                                        setTrackerEntries(updatedEntries);
                                                                                    }

                                                                                    // Call the handler for potential auto-save
                                                                                    handleUpdateTask(entry.id, memberId, index, e.target.value);
                                                                                }}
                                                                                placeholder="Enter completed task..."
                                                                                className="min-h-[60px] resize-none text-sm"
                                                                                rows={2}
                                                                            />
                                                                        </div>
                                                                        <Button
                                                                            onClick={() => handleRemoveTask(entry.id, memberId, index)}
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="text-red-600 hover:text-red-700 mt-1"
                                                                            disabled={memberTasks.length <= 1}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => handleUpdateTask(entry.id, memberId, index, task)}
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="ml-2"
                                                                        >
                                                                            <Save className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                                {memberTasks.length === 0 && (
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                        No tasks added yet
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                    <div
                                                                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                                                                        style={{ width: `${completionRate}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs text-gray-600 dark:text-gray-300 min-w-[3rem]">
                                                                    {completionRate}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <Button
                                                                onClick={() => handleAddTask(entry.id, memberId)}
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-blue-600 hover:text-blue-700"
                                                            >
                                                                <Plus className="h-4 w-4 mr-1" />
                                                                Add Task
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>

                                {/* Entry Footer with Metadata */}
                                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-4">
                                            {entry.createdAt && (
                                                <span>Created: {format(new Date(entry.createdAt), 'MMM d, yyyy HH:mm')}</span>
                                            )}
                                            {autoSave && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span>Auto-saved</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                ID: {entry.id.slice(-6)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Quick Actions Footer */}
                {filteredEntries.length > 0 && (
                    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    Showing {filteredEntries.length} of {trackerEntries.length} entries
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterPeriod('all');
                                            setSelectedMemberFilter('all');
                                            setShowCompletedOnly(false);
                                        }}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Clear Filters
                                    </Button>
                                    <Button
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Back to Top
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    )
}
export default MinuteTracker
