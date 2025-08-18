import { useState } from "react";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import ProjectDetail from "@/components/ProjectDetail";
import BugAnalysis from "@/components/BugAnalysis";

type View = 'login' | 'dashboard' | 'project' | 'bug';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedBug, setSelectedBug] = useState<string | null>(null);

  const handleLogin = () => {
    setCurrentView('dashboard');
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setCurrentView('project');
  };

  const handleBugSelect = (bugId: string) => {
    setSelectedBug(bugId);
    setCurrentView('bug');
  };

  const handleBack = () => {
    if (currentView === 'bug') {
      setCurrentView('project');
      setSelectedBug(null);
    } else if (currentView === 'project') {
      setCurrentView('dashboard');
      setSelectedProject(null);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard onProjectSelect={handleProjectSelect} />;
      case 'project':
        return (
          <ProjectDetail 
            projectId={selectedProject!} 
            onBack={handleBack}
            onBugSelect={handleBugSelect}
          />
        );
      case 'bug':
        return (
          <BugAnalysis 
            bugId={selectedBug!} 
            onBack={handleBack}
          />
        );
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return renderCurrentView();
};

export default Index;
