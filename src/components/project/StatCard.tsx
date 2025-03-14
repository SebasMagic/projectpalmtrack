
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatCardProps {
  title: string;
  value: string;
  valueColor?: string;
  icon: React.ReactNode;
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, valueColor, icon, progress }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold" style={{ color: valueColor }}>{value}</div>
      {progress !== undefined && (
        <>
          <Progress value={progress} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
        </>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
