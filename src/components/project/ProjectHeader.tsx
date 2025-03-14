
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Project } from '@/lib/types';

interface ProjectHeaderProps {
  project: Project;
}

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

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground">
          {project.client} • {project.location}
        </p>
      </div>
      <Badge 
        className={`mt-2 md:mt-0 self-start md:self-auto ${getStatusColor(project.status)}`} 
        variant="outline"
      >
        {getStatusText(project.status)}
      </Badge>
    </div>
  );
};

export default ProjectHeader;
