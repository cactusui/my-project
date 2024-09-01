'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/ui-components';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    type: '',
    rate: '',
    dates: [],
  });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(Array.isArray(parsedProjects) ? parsedProjects : []);
      } catch (error) {
        console.error('Error parsing saved projects:', error);
        setProjects([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value) => {
    setNewProject(prev => ({ ...prev, type: value, dates: [] }));
  };

  const addProject = () => {
    if (newProject.name && newProject.type && newProject.rate) {
      setProjects(prev => [...prev, { ...newProject, id: Date.now(), dates: [] }]);
      setNewProject({ name: '', type: '', rate: '', dates: [] });
      setIsAddingProject(false);
    }
  };

  const removeProject = (id) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const toggleProjectDate = (projectId, date) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const dateStr = date.toISOString().split('T')[0];
        let newDates = [...project.dates];
        const dateIndex = newDates.findIndex(d => d.date === dateStr);
        
        if (dateIndex === -1) {
          newDates.push({ date: dateStr, paid: false });
        } else if (!newDates[dateIndex].paid) {
          newDates[dateIndex].paid = true;
        } else {
          newDates = newDates.filter(d => d.date !== dateStr);
        }
        
        return { ...project, dates: newDates };
      }
      return project;
    }));
  };

  const CustomCalendar = ({ project }) => {
    if (!project) return null;

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getDayStatus = (day) => {
      const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
      const dateObj = project.dates.find(d => d.date === dateStr);
      if (dateObj) {
        return dateObj.paid ? 'paid' : 'booked';
      }
      return 'normal';
    };

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          <Button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold text-sm">{day}</div>
          ))}
          {Array(firstDayOfMonth).fill(null).map((_, index) => (
            <div key={`empty-${index}`}></div>
          ))}
          {days.map(day => {
            const status = getDayStatus(day);
            return (
              <Button
                key={day}
                onClick={() => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  toggleProjectDate(project.id, date);
                }}
                className={`h-10 w-full text-sm font-medium ${
                  status === 'paid' ? 'bg-green-500 hover:bg-green-600 text-white' :
                  status === 'booked' ? 'bg-red-500 hover:bg-red-600 text-white' :
                  'bg-white hover:bg-gray-100 text-black border border-gray-300'
                }`}
              >
                {day}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Summon</h1>
      </header>

      <Button onClick={() => setIsAddingProject(true)} className="w-full mb-4 py-6 text-lg">
        <Plus className="mr-2 h-6 w-6" /> Add New Project
      </Button>
      
      <Sheet open={isAddingProject} onOpenChange={setIsAddingProject}>
        <SheetContent side="bottom" className="h-[90vh] sm:h-[90vh] sm:max-w-none">
          <SheetHeader>
            <SheetTitle>Add New Project</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            <Input
              placeholder="Project Name"
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
              className="text-lg py-6"
            />
            <Select onValueChange={handleTypeChange} value={newProject.type}>
              <SelectTrigger className="text-lg py-6">
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_day">Per Day</SelectItem>
                <SelectItem value="per_week">Per Week</SelectItem>
                <SelectItem value="per_project">Per Project</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Rate"
              name="rate"
              type="number"
              value={newProject.rate}
              onChange={handleInputChange}
              className="text-lg py-6"
            />
            <Button onClick={addProject} className="w-full py-6 text-lg">Add Project</Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{project.name}</span>
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingProject(project.id)}>
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeProject(project.id)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Type:</strong> {project.type}</p>
              <p><strong>Rate:</strong> ${project.rate}</p>
              <p><strong>Total Days:</strong> {project.dates.length}</p>
              <p><strong>Paid Days:</strong> {project.dates.filter(d => d.paid).length}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={isEditingProject !== null} onOpenChange={() => setIsEditingProject(null)}>
        <SheetContent side="bottom" className="h-[90vh] sm:h-[90vh] sm:max-w-none">
          <SheetHeader>
            <SheetTitle>Edit Project</SheetTitle>
          </SheetHeader>
          {isEditingProject !== null && (
            <div className="mt-6">
              <CustomCalendar project={projects.find(p => p.id === isEditingProject)} />
              <div className="mt-4">
                <p>Click on a day to cycle through: Not booked → Booked → Paid → Not booked</p>
                <p>White: Not booked, Red: Booked but not paid, Green: Paid</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}