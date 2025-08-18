import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GitBranch, Bug, AlertCircle, Clock, User } from "lucide-react";

interface Bug {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved';
  reporter: string;
  createdAt: string;
  jiraId: string;
}

interface Repository {
  name: string;
  branch: string;
  lastCommit: string;
}

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onBugSelect: (bugId: string) => void;
}

const ProjectDetail = ({ projectId, onBack, onBugSelect }: ProjectDetailProps) => {
  const repository: Repository = {
    name: 'ecommerce-web',
    branch: 'main',
    lastCommit: '2 hours ago'
  };

  const bugs: Bug[] = [
    {
      id: '1',
      title: 'Checkout process fails on mobile devices',
      description: 'Users unable to complete purchase on mobile Safari',
      severity: 'critical',
      status: 'open',
      reporter: 'John Doe',
      createdAt: '2 hours ago',
      jiraId: 'PROJ-123'
    },
    {
      id: '2',
      title: 'Product images not loading in cart',
      description: 'Images show broken link icon instead of product photos',
      severity: 'high',
      status: 'open',
      reporter: 'Jane Smith',
      createdAt: '4 hours ago',
      jiraId: 'PROJ-124'
    },
    {
      id: '3',
      title: 'Search functionality returns incorrect results',
      description: 'Product search not filtering by category properly',
      severity: 'medium',
      status: 'in-progress',
      reporter: 'Mike Johnson',
      createdAt: '1 day ago',
      jiraId: 'PROJ-125'
    },
    {
      id: '4',
      title: 'Footer links broken on contact page',
      description: 'Social media links redirect to 404 page',
      severity: 'low',
      status: 'open',
      reporter: 'Sarah Wilson',
      createdAt: '2 days ago',
      jiraId: 'PROJ-126'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-destructive text-destructive-foreground';
      case 'in-progress': return 'bg-primary text-primary-foreground';
      case 'resolved': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="secondary" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">E-commerce Frontend</h1>
                <p className="text-muted-foreground">Project Details & Bug Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Repository Section */}
        <Card className="bg-gradient-card border-border shadow-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <GitBranch className="h-5 w-5 mr-2 text-primary" />
              Repository Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Repository</p>
                <p className="text-lg font-semibold text-foreground">{repository.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Branch</p>
                <p className="text-lg font-semibold text-accent">{repository.branch}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Commit</p>
                <p className="text-lg font-semibold text-foreground">{repository.lastCommit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bugs Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center">
              <Bug className="h-5 w-5 mr-2 text-destructive" />
              Active Bugs ({bugs.length})
            </h2>
          </div>

          <div className="space-y-4">
            {bugs.map((bug) => (
              <Card 
                key={bug.id}
                className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer"
                onClick={() => onBugSelect(bug.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{bug.title}</h3>
                        <Badge className={getSeverityColor(bug.severity)}>
                          {bug.severity}
                        </Badge>
                        <Badge className={getStatusColor(bug.status)}>
                          {bug.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{bug.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {bug.jiraId}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {bug.reporter}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {bug.createdAt}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBugSelect(bug.id);
                      }}
                    >
                      Analyze & Fix
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;