// Note: This file had a reference to @/lib/supabaseUtils which no longer exists
// The import should now reference the new refactored files

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Eye, FileEdit, Clock } from "lucide-react";
import { Project } from "@/lib/types";
import { fetchProjects } from "@/lib/supabase"; // Updated import path

interface ProjectTableProps {
  projects: Project[];
  onRefresh?: () => Promise<void>; // Added optional onRefresh prop
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'planning':
      return 'bg-blue-100 text-blue-800';
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-purple-100 text-purple-800';
    case 'on-hold':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: Project['status']) => {
  switch (status) {
    case 'planning':
      return 'Planning';
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'on-hold':
      return 'On Hold';
    default:
      return 'Unknown';
  }
};

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onRefresh }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    // Implement edit functionality here
    console.log(`Edit project ${projectId}`);
  };

  return (
    <div className="relative w-full overflow-auto">
      {isLoading ? (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-100 opacity-50 flex items-center justify-center">
          Loading projects...
        </div>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Completion</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{project.client}</TableCell>
              <TableCell>{project.location}</TableCell>
              <TableCell>{formatDate(project.startDate)}</TableCell>
              <TableCell>{formatDate(project.dueDate)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(project.status)} variant="outline">
                  {getStatusText(project.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Progress value={project.completion} className="h-2 w-[100px]" />
                  <span>{project.completion}%</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleViewProject(project.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditProject(project.id)}>
                    <FileEdit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectTable;
