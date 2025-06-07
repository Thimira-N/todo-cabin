'use client';

import React, { useState, useEffect, useCallback  } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { memberStorage, registryStorage } from '@/lib/storage';
import { Member, RegistryEntry } from '@/types';
import { UserPlus, Clock, LogIn, LogOut, Trash2, Users, Calendar, Activity, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';


const Registry = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [registryEntries, setRegistryEntries] = useState<RegistryEntry[]>([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isAddingMember, setIsAddingMember] = useState(false);


    const loadMembers = useCallback(async (): Promise<void> => {
        if (user) {
            const userMembers = memberStorage.getAll(user.id);
            setMembers(userMembers);
        }
    }, [user]);

    const loadRegistryEntries = useCallback(async (): Promise<void> => {
        if (user) {
            const entries = registryStorage.getAll(user.id);
            setRegistryEntries(entries);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadMembers();
            loadRegistryEntries();
        }
    }, [user, loadMembers, loadRegistryEntries]);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMemberName.trim()) return;

        try {
            memberStorage.add(newMemberName.trim(), user.id);
            setNewMemberName('');
            setIsAddingMember(false);
            loadMembers();
        } catch (error) {
            console.error('Failed to add member:', error);
        }
    };

    const handleDeleteMember = (memberId: string) => {
        if (!user) return;
        memberStorage.delete(memberId);
        loadMembers();
        loadRegistryEntries();
    };

    const handleMarkIn = (memberId: string) => {
        if (!user) return;

        const existingEntry = registryStorage.getByDateAndMember(selectedDate, memberId, user.id);
        const currentTime = format(new Date(), 'HH:mm');

        if (existingEntry) {
            const updatedEntry = { ...existingEntry, markIn: currentTime };
            registryStorage.update(updatedEntry);
        } else {
            const newEntry: RegistryEntry = {
                id: Date.now().toString(),
                memberId,
                date: selectedDate,
                markIn: currentTime,
                userId: user.id,
            };
            registryStorage.update(newEntry);
        }

        loadRegistryEntries();
    };

    const handleMarkOut = (memberId: string) => {
        if (!user) return;

        const existingEntry = registryStorage.getByDateAndMember(selectedDate, memberId, user.id);
        const currentTime = format(new Date(), 'HH:mm');

        if (existingEntry) {
            const updatedEntry = { ...existingEntry, markOut: currentTime };
            registryStorage.update(updatedEntry);
        } else {
            const newEntry: RegistryEntry = {
                id: Date.now().toString(),
                memberId,
                date: selectedDate,
                markOut: currentTime,
                userId: user.id,
            };
            registryStorage.update(newEntry);
        }

        loadRegistryEntries();
    };

    const getEntryForMember = (memberId: string): RegistryEntry | undefined => {
        return registryEntries.find(entry =>
            entry.memberId === memberId && entry.date === selectedDate
        );
    };

    // const getMemberName = (memberId: string): string => {
    //     const member = members.find(m => m.id === memberId);
    //     return member ? member.name : 'Unknown';
    // };

    const getAttendanceStats = () => {
        const todayEntries = registryEntries.filter(entry => entry.date === selectedDate);
        const present = todayEntries.filter(entry => entry.markIn).length;
        const checkedOut = todayEntries.filter(entry => entry.markOut).length;

        return { present, checkedOut, total: members.length };
    };

    const stats = getAttendanceStats();

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-blue-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {/* Enhanced Header */}
                    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                        <div className="relative p-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                                            <Activity className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                                Team Registry
                                            </h1>
                                            <p className="text-gray-600 dark:text-gray-300 text-lg">
                                                Track and manage team attendance with ease
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-lg rounded-2xl">
                                            <UserPlus className="h-5 w-5 mr-2" />
                                            Add Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md rounded-3xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold">Add New Member</DialogTitle>
                                            <DialogDescription className="text-gray-600 dark:text-gray-300">
                                                Add a new team member to the registry system.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleAddMember} className="space-y-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="memberName" className="text-sm font-semibold">Member Name</Label>
                                                <Input
                                                    id="memberName"
                                                    value={newMemberName}
                                                    onChange={(e) => setNewMemberName(e.target.value)}
                                                    placeholder="Enter member name"
                                                    className="h-12 rounded-xl border-2 focus:border-blue-500 transition-colors"
                                                    required
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <Button type="submit" className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                                    Add Member
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-12 rounded-xl border-2"
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wide">Present Today</p>
                                        <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.present}</p>
                                    </div>
                                    <div className="p-3 bg-green-500/20 rounded-2xl">
                                        <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wide">Checked Out</p>
                                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.checkedOut}</p>
                                    </div>
                                    <div className="p-3 bg-blue-500/20 rounded-2xl">
                                        <LogOut className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wide">Total Members</p>
                                        <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats.total}</p>
                                    </div>
                                    <div className="p-3 bg-purple-500/20 rounded-2xl">
                                        <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Enhanced Date Selector */}
                    <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-gray-800">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                                Date Selection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-sm font-semibold">Select Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-fit h-12 rounded-xl border-2 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-4 py-3 rounded-2xl">
                                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-blue-700 dark:text-blue-300 font-semibold">
                    Viewing: {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                  </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Members List */}
                    <div className="space-y-6">
                        {members.length === 0 ? (
                            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-gray-800">
                                <CardContent className="flex flex-col items-center justify-center py-16 px-8">
                                    <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full mb-6">
                                        <Users className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        No Team Members Yet
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-center mb-8 text-lg leading-relaxed">
                                        Start building your team by adding members to track their attendance and manage their check-ins.
                                    </p>
                                    <Button
                                        onClick={() => setIsAddingMember(true)}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg rounded-2xl"
                                    >
                                        <UserPlus className="h-5 w-5 mr-3" />
                                        Add Your First Member
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {members.map((member, index) => {
                                    const entry = getEntryForMember(member.id);
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
                                        <Card key={member.id} className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden bg-white dark:bg-gray-800 hover:scale-[1.02]">
                                            <CardContent className="p-8">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-16 h-16 bg-gradient-to-r ${gradientClass} rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                              <span className="text-white font-bold text-2xl">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className="font-bold text-2xl text-gray-900 dark:text-white">
                                                                {member.name}
                                                            </h3>
                                                            <div className="flex items-center gap-4">
                                                                {entry?.markIn && (
                                                                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 px-3 py-1 rounded-xl border-0 font-semibold">
                                                                        <LogIn className="h-3 w-3 mr-1" />
                                                                        In: {entry.markIn}
                                                                    </Badge>
                                                                )}
                                                                {entry?.markOut && (
                                                                    <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300 px-3 py-1 rounded-xl border-0 font-semibold">
                                                                        <LogOut className="h-3 w-3 mr-1" />
                                                                        Out: {entry.markOut}
                                                                    </Badge>
                                                                )}
                                                                {!entry?.markIn && !entry?.markOut && (
                                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-xl border-0">
                                                                        Not checked in
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            onClick={() => handleMarkIn(member.id)}
                                                            size="lg"
                                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={!!entry?.markIn}
                                                        >
                                                            <LogIn className="h-4 w-4 mr-2" />
                                                            Mark In
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleMarkOut(member.id)}
                                                            size="lg"
                                                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={!!entry?.markOut}
                                                        >
                                                            <LogOut className="h-4 w-4 mr-2" />
                                                            Mark Out
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeleteMember(member.id)}
                                                            size="lg"
                                                            variant="outline"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-red-200 hover:border-red-300 rounded-2xl p-3 transition-all duration-300"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
