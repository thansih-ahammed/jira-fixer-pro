import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Target,
  Activity,
  Users,
  GitBranch
} from "lucide-react";

const AnalyticsDashboard = () => {
  const stats = {
    totalProjects: 12,
    totalBugs: 156,
    fixedBugs: 124,
    criticalBugs: 8,
    avgFixTime: "2.3 hours",
    fixRate: 79.5
  };

  const recentActivity = [
    { id: 1, action: "Bug fixed", project: "E-commerce Platform", time: "2 minutes ago", type: "success" },
    { id: 2, action: "New bug detected", project: "Mobile App Backend", time: "15 minutes ago", type: "warning" },
    { id: 3, action: "Fix rejected", project: "Analytics Dashboard", time: "1 hour ago", type: "error" },
    { id: 4, action: "Project synced", project: "Payment Service", time: "3 hours ago", type: "info" }
  ];

  const topProjects = [
    { name: "E-commerce Platform", bugs: 45, fixed: 38, rate: 84 },
    { name: "Mobile App Backend", bugs: 32, fixed: 28, rate: 88 },
    { name: "Analytics Dashboard", bugs: 28, fixed: 20, rate: 71 },
    { name: "Payment Service", bugs: 25, fixed: 22, rate: 88 }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fixed-bugs">Fixed Bugs</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
                <GitBranch className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalProjects}</div>
                <p className="text-xs text-accent">+2 from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Bugs</CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalBugs}</div>
                <p className="text-xs text-orange-500">32 active</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Fixed Bugs</CardTitle>
                <CheckCircle className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.fixedBugs}</div>
                <p className="text-xs text-accent">+18 this week</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Fix Rate</CardTitle>
                <Target className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.fixRate}%</div>
                <p className="text-xs text-accent">+5.2% improvement</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-accent" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Bug Detection Rate</span>
                    <span className="text-sm font-medium text-foreground">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Auto-Fix Success</span>
                    <span className="text-sm font-medium text-foreground">{stats.fixRate}%</span>
                  </div>
                  <Progress value={stats.fixRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">User Satisfaction</span>
                    <span className="text-sm font-medium text-foreground">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Fix Time</span>
                    <span className="text-sm font-bold text-accent">{stats.avgFixTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.project}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fixed-bugs" className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Recently Fixed Bugs</CardTitle>
              <CardDescription className="text-muted-foreground">
                Bugs that have been automatically fixed and deployed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "ECOM-123", title: "Checkout process fails on mobile", project: "E-commerce Platform", severity: "critical", fixedAt: "2 hours ago" },
                  { id: "MOB-101", title: "API rate limiting too aggressive", project: "Mobile App Backend", severity: "medium", fixedAt: "5 hours ago" },
                  { id: "ANA-201", title: "Chart rendering performance", project: "Analytics Dashboard", severity: "high", fixedAt: "1 day ago" },
                  { id: "PAY-045", title: "Payment timeout handling", project: "Payment Service", severity: "high", fixedAt: "2 days ago" }
                ].map((bug) => (
                  <div key={bug.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">{bug.id}</span>
                        <Badge variant={bug.severity === 'critical' ? 'destructive' : bug.severity === 'high' ? 'secondary' : 'outline'}>
                          {bug.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{bug.title}</p>
                      <p className="text-xs text-muted-foreground">{bug.project}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-accent">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Fixed</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{bug.fixedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Project Performance</CardTitle>
              <CardDescription className="text-muted-foreground">
                Bug fixing success rate by project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProjects.map((project, index) => (
                  <div key={project.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">{project.name}</span>
                        <Badge variant="outline">{project.bugs} bugs</Badge>
                      </div>
                      <span className="text-sm font-bold text-accent">{project.rate}%</span>
                    </div>
                    <Progress value={project.rate} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {project.fixed} of {project.bugs} bugs fixed
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;