'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Member, RegistryEntry } from '@/types';
import { UserPlus, Clock, LogIn, LogOut, Trash2, Users, Calendar, Activity, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { memberService } from '@/lib/firestore/members';
import { registryService } from '@/lib/firestore/registry';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {cn} from "@/lib/utils";
import {LoadingScreen} from "@/components/loadingScreen";

const Registry = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [registryEntries, setRegistryEntries] = useState<RegistryEntry[]>([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

    const loadMembers = useCallback(async (): Promise<void> => {
        if (user) {
            try {
                const userMembers = await memberService.getAll(user.id);
                setMembers(userMembers);
            } catch (error) {
                console.error('Failed to load members:', error);
            }
        }
    }, [user]);

    const loadRegistryEntries = useCallback(async (): Promise<void> => {
        if (user) {
            try {
                const entries = await registryService.getEntriesForDate(selectedDate, user.id);
                setRegistryEntries(entries);
            } catch (error) {
                console.error('Failed to load registry entries:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [user, selectedDate]);

    useEffect(() => {
        if (user) {
            loadMembers();
            loadRegistryEntries();
        }
    }, [user, loadMembers, loadRegistryEntries]);

    // Added effect to reload entries when date changes
    useEffect(() => {
        if (user) {
            loadRegistryEntries();
        }
    }, [selectedDate, user, loadRegistryEntries]);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMemberName.trim()) return;

        try {
            await memberService.add(newMemberName.trim(), user.id);
            setNewMemberName('');
            setIsAddingMember(false);
            await loadMembers();
        } catch (error) {
            console.error('Failed to add member:', error);
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        if (!user) return;
        try {
            // First delete all registry entries for this member
            await registryService.deleteAllForMember(memberId, user.id);

            // Then delete the member itself
            await memberService.delete(memberId);

            //refresh both lists
            await loadMembers();
            await loadRegistryEntries();
        } catch (error) {
            console.error('Failed to delete member:', error);
        }
    };

    const handleMarkIn = async (memberId: string) => {
        if (!user) return;

        try {
            const member = members.find(m => m.id === memberId);
            if (!member) return;

            await registryService.markIn(
                selectedDate,
                memberId,
                user.id,
                member.name
            );
            // Reload entries to get the updated data
            await loadRegistryEntries();
        } catch (error) {
            console.error('Failed to mark in:', error);
        }
    };

    const handleMarkOut = async (memberId: string) => {
        if (!user) return;

        try {
            const member = members.find(m => m.id === memberId);
            if (!member) return;

            await registryService.markOut(
                selectedDate,
                memberId,
                user.id,
                member.name
            );
            // Reload entries to get the updated data
            await loadRegistryEntries();
        } catch (error) {
            console.error('Failed to mark out:', error);
        }
    };

    const getEntryForMember = (memberId: string): RegistryEntry | undefined => {
        return registryEntries.find(entry =>
            entry.memberId === memberId
        );
    };

    // Helper function to get button states
    const getButtonStates = (entry: RegistryEntry | undefined) => {
        if (!entry) {
            // No entry exists - both buttons enabled
            return {
                canMarkIn: true,
                canMarkOut: false,
                markInDisabled: false,
                markOutDisabled: true
            };
        }

        if (entry.markIn && !entry.markOut) {
            // Marked in but not out - disable mark in, enable mark out
            return {
                canMarkIn: false,
                canMarkOut: true,
                markInDisabled: true,
                markOutDisabled: false
            };
        }

        if (entry.markIn && entry.markOut) {
            // Both marked in and out - disable both buttons
            return {
                canMarkIn: false,
                canMarkOut: false,
                markInDisabled: true,
                markOutDisabled: true
            };
        }

        // Default case (shouldn't happen but safe fallback)
        return {
            canMarkIn: true,
            canMarkOut: false,
            markInDisabled: false,
            markOutDisabled: true
        };
    };

    const getAttendanceStats = () => {
        if (!registryEntries.length) {
            return { present: 0, checkedOut: 0, total: members.length };
        }

        // Convert selectedDate to Date object for comparison
        const selectedDateObj = new Date(selectedDate);

        const todayEntries = registryEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return (
                entryDate.getFullYear() === selectedDateObj.getFullYear() &&
                entryDate.getMonth() === selectedDateObj.getMonth() &&
                entryDate.getDate() === selectedDateObj.getDate()
            );
        });
        const present = todayEntries.filter(entry => entry.markIn).length;
        const checkedOut = todayEntries.filter(entry => entry.markOut).length;

        return { present, checkedOut, total: members.length };
    };

    const stats = getAttendanceStats();

    const isToday = (dateString: string): boolean => {
        const today = new Date();
        const selectedDate = new Date(dateString);

        return (
            selectedDate.getDate() === today.getDate() &&
            selectedDate.getMonth() === today.getMonth() &&
            selectedDate.getFullYear() === today.getFullYear()
        );
    };

    if (loading) {
        return (
            <Layout>
                {/*<div className="flex items-center justify-center min-h-screen">*/}
                {/*    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>*/}
                {/*</div>*/}

                <LoadingScreen />
            </Layout>
        );
    }

    return (
        <Layout className="bg-gradient-to-br from-transparent via-blue-100 to-transparent dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
                    {/*header*/}
                    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                        <div className="relative p-4 sm:p-6 lg:p-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
                                            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
                                                Team Registry
                                            </h1>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg mt-1">
                                                Track and manage team attendance with ease
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl">
                                            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                            <span className="hidden xs:inline">Add Member</span>
                                            <span className="xs:hidden">Add</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl sm:rounded-3xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl sm:text-2xl font-bold">Add New Member</DialogTitle>
                                            <DialogDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                                                Add a new team member to the registry system.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleAddMember} className="space-y-4 sm:space-y-6">
                                            <div className="space-y-2 sm:space-y-3">
                                                <Label htmlFor="memberName" className="text-sm font-semibold">Member Name</Label>
                                                <Input
                                                    id="memberName"
                                                    value={newMemberName}
                                                    onChange={(e) => setNewMemberName(e.target.value)}
                                                    placeholder="Enter member name"
                                                    className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                                    required
                                                />
                                            </div>
                                            <div className="flex gap-2 sm:gap-3">
                                                <Button type="submit" className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base">
                                                    Add Member
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 px-3 sm:px-4 text-sm sm:text-base"
                                                    onClick={() => setIsAddingMember(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                        <Card className="border-0 shadow-lg sm:shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl sm:rounded-2xl overflow-hidden">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm uppercase tracking-wide truncate">Present Today</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-300 mt-1">{stats.present}</p>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-green-500/20 rounded-xl sm:rounded-2xl ml-2">
                                        <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg sm:shadow-xl bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl sm:rounded-2xl overflow-hidden">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm uppercase tracking-wide truncate">Checked Out</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{stats.checkedOut}</p>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl sm:rounded-2xl ml-2">
                                        <LogOut className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg sm:shadow-xl bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl sm:rounded-2xl overflow-hidden sm:col-span-2 lg:col-span-1">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-purple-600 dark:text-purple-400 font-semibold text-xs sm:text-sm uppercase tracking-wide truncate">Total Members</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-300 mt-1">{stats.total}</p>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-purple-500/20 rounded-xl sm:rounded-2xl ml-2">
                                        <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/*Date Selector */}
                    <Card className="border-0 shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-gray-800">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600 p-4 sm:p-6">
                            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl">
                                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                                </div>
                                Date Selection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                <div className="space-y-2 w-full sm:w-auto">
                                    <Label htmlFor="date" className="text-sm font-semibold">Select Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full sm:w-fit h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                    />
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl w-full sm:w-auto">
                                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm sm:text-base truncate">
                                        <span className="hidden sm:inline">Viewing: </span>
                                        {format(new Date(selectedDate), 'EEE, MMM d, yyyy')}
                                        {!isToday(selectedDate) && (
                                            <Badge variant="secondary" className="ml-2">
                                                {new Date(selectedDate) > new Date() ? 'Future Date' : 'Past Date'}
                                            </Badge>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/*Members List */}
                    <div className="space-y-4 sm:space-y-6">
                        {members.length === 0 ? (
                            <Card className="border-0 shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-gray-800">
                                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-8">
                                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full mb-4 sm:mb-6">
                                        <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 text-center">
                                        No Team Members Yet
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-center mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md">
                                        Start building your team by adding members to track their attendance and manage their check-ins.
                                    </p>
                                    <Button
                                        onClick={() => setIsAddingMember(true)}
                                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl"
                                    >
                                        <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                                        Add Your First Member
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-3 sm:gap-4 lg:gap-6">
                                {members.map((member, index) => {
                                    const entry = getEntryForMember(member.id);
                                    const buttonStates = getButtonStates(entry);
                                    const gradients = [
                                        'from-blue-500 to-cyan-500',
                                        'from-purple-500 to-pink-500',
                                        'from-green-500 to-teal-500',
                                        'from-orange-500 to-red-500',
                                        'from-indigo-500 to-purple-500',
                                        'from-pink-500 to-rose-500'
                                    ];
                                    const gradientClass = gradients[index % gradients.length];

                                    return (
                                        <Card key={member.id} className="group border-0 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-gray-800 hover:scale-[1.01] sm:hover:scale-[1.02]">
                                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                                                    {/* Member info section (left side) */}
                                                    <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 min-w-0 flex-1">
                                                        <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r ${gradientClass} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                                            <span className="text-white font-bold text-lg sm:text-xl lg:text-2xl">
                                                                {member.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                                                            <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-white truncate">
                                                                {member.name}
                                                            </h3>
                                                            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-3 lg:gap-4">
                                                                {entry?.markIn && (
                                                                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl border-0 font-semibold text-xs sm:text-sm">
                                                                        <LogIn className="h-3 w-3 mr-1" />
                                                                        In: {entry.markIn}
                                                                    </Badge>
                                                                )}
                                                                {entry?.markOut && (
                                                                    <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl border-0 font-semibold text-xs sm:text-sm">
                                                                        <LogOut className="h-3 w-3 mr-1" />
                                                                        Out: {entry.markOut}
                                                                    </Badge>
                                                                )}
                                                                {!entry?.markIn && (
                                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl border-0 text-xs sm:text-sm">
                                                                        Not checked in
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Buttons section (right-aligned) */}
                                                    <div className="flex flex-row items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto ml-auto">
                                                        <Button
                                                            onClick={() => handleMarkIn(member.id)}
                                                            size="sm"
                                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg sm:rounded-2xl px-3 sm:px-4 lg:px-6 h-9 sm:h-10 lg:h-11 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm lg:text-base"
                                                            disabled={buttonStates.markInDisabled || !isToday(selectedDate)}
                                                        >
                                                            <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                            <span className="hidden xs:inline">Mark In</span>
                                                            <span className="xs:hidden">In</span>
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleMarkOut(member.id)}
                                                            size="sm"
                                                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg sm:rounded-2xl px-3 sm:px-4 lg:px-6 h-9 sm:h-10 lg:h-11 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm lg:text-base"
                                                            disabled={buttonStates.markOutDisabled || !isToday(selectedDate)}
                                                        >
                                                            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                            <span className="hidden xs:inline">Mark Out</span>
                                                            <span className="xs:hidden">Out</span>
                                                        </Button>
                                                        <>
                                                            <Button
                                                                onClick={() => {
                                                                    setMemberToDelete(member.id);
                                                                    setDeleteConfirmOpen(true);
                                                                }}
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-red-200 hover:border-red-300 rounded-lg sm:rounded-2xl p-2 sm:p-2.5 lg:p-3 transition-all duration-300 h-9 sm:h-10 lg:h-11"
                                                            >
                                                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            </Button>

                                                            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                                                                <AlertDialogContent className={cn(
                                                                    "z-50 transition-all duration-300 ease-in-out",
                                                                    "border border-border/40 backdrop-blur-lg supports-[backdrop-filter]:bg-background/20",
                                                                    // "bg-gradient-to-r from-blue-200/80 to-purple-200/80",
                                                                )}>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="font-extrabold text-xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent dark:text-white/70">
                                                                            Delete Member?
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription className="font-semibold text-gray-300 dark:text-gray-400 sm:text-base">
                                                                            This will permanently delete{' '}
                                                                            <span className="font-extrabold text-gray-200 dark:text-white">
                                                                                {members.find(m => m.id === memberToDelete)?.name}
                                                                            </span>{' '}
                                                                            and all their attendance records. This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter className="mt-4 sm:mt-6">
                                                                        <AlertDialogCancel className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 px-3 sm:px-4 text-sm sm:text-base">
                                                                            Cancel
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-sm sm:text-base"
                                                                            onClick={() => {
                                                                                if (memberToDelete) {
                                                                                    handleDeleteMember(memberToDelete);
                                                                                }
                                                                                setDeleteConfirmOpen(false);
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}
export default Registry