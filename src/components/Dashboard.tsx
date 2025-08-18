import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, Bug, Calendar, User, Folder } from "lucide-react";

interface Project {
  id: string;
  name: string;
  repository: string;
  activeBugs: number;
  lastUpdated: string;
  status: 'active' | 'resolved' | 'pending';
}

interface DashboardProps {
  onProjectSelect: (projectId: string) => void;
}

const Dashboard = ({ onProjectSelect }: DashboardProps) => {
  const projects: Project[] = [
    {
      id: '1',
      name: 'E-commerce Frontend',
      repository: 'ecommerce-web',
      activeBugs: 5,
      lastUpdated: '2 hours ago',
      status: 'active'
    },
    {
      id: '2',
      name: 'Payment Gateway API',
      repository: 'payment-service',
      activeBugs: 2,
      lastUpdated: '1 day ago',
      status: 'pending'
    },
    {
      id: '3',
      name: 'User Authentication',
      repository: 'auth-microservice',
      activeBugs: 0,
      lastUpdated: '3 days ago',
      status: 'resolved'
    },
    {
      id: '4',
      name: 'Mobile App Backend',
      repository: 'mobile-api',
      activeBugs: 8,
      lastUpdated: '5 hours ago',
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-destructive';
      case 'pending': return 'bg-primary';
      case 'resolved': return 'bg-accent';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero border-b border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Project Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage your automated bug fixes</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Active Bugs</p>
                <p className="text-2xl font-bold text-destructive">15</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold text-accent">{projects.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer"
              onClick={() => onProjectSelect(project.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Folder className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg text-foreground">{project.name}</CardTitle>
                  </div>
                  <Badge className={`${getStatusColor(project.status)} text-white`}>
                    {project.status}
                  </Badge>
                </div>
                <CardDescription className="text-muted-foreground flex items-center">
                  <GitBranch className="h-4 w-4 mr-1" />
                  {project.repository}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bug className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">Active Bugs</span>
                  </div>
                  <span className="text-lg font-semibold text-destructive">{project.activeBugs}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                  </div>
                  <span className="text-sm text-foreground">{project.lastUpdated}</span>
                </div>
                
                <Button 
                  variant="secondary" 
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProjectSelect(project.id);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;