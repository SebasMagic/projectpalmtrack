
import { Link } from 'react-router-dom';
import { Project } from '@/lib/types';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
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

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Link to={`/project/${project.id}`}>
      <Card className="h-full overflow-hidden hover-lift">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-2">
            <Badge 
              className={cn(
                "font-medium capitalize", 
                getStatusColor(project.status)
              )}
              variant="outline"
            >
              {project.status}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">
              {formatCurrency(project.budget)}
            </span>
          </div>
          <CardTitle className="line-clamp-1 text-lg">{project.name}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPinIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <CalendarIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span>
              {formatDate(project.startDate)} 
              {project.endDate && ` - ${formatDate(project.endDate)}`}
            </span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Completion</span>
              <span className="font-medium">{project.completion}%</span>
            </div>
            <Progress value={project.completion} className="h-1.5" />
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProjectCard;
