
import React from 'react';
import TaskManager from '@/components/TaskManager';

interface ProjectTasksViewProps {
  projectId: string;
}

const ProjectTasksView: React.FC<ProjectTasksViewProps> = ({ projectId }) => {
  return (
    <div className="bg-white rounded-md shadow">
      {projectId && (
        <TaskManager projectId={projectId} />
      )}
    </div>
  );
};

export default ProjectTasksView;
