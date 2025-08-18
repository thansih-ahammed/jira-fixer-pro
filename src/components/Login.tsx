import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Bug, Code } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-primary p-3 rounded-lg shadow-glow">
              <Bug className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AutoFix</h1>
          <p className="text-muted-foreground">Automated Testing & Bug Resolution Platform</p>
        </div>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">Connect Your Workspace</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in with Bitbucket to access your repositories and Jira issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={onLogin}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              size="lg"
            >
              <GitBranch className="mr-2 h-5 w-5" />
              Sign in with Bitbucket
            </Button>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <GitBranch className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Repository Access</p>
              </div>
              <div className="text-center">
                <Bug className="h-6 w-6 text-accent mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Jira Integration</p>
              </div>
              <div className="text-center">
                <Code className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Auto Fixes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;