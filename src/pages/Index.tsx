import { useEffect, useState } from "react";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import ProjectDetail from "@/components/ProjectDetail";
import BugAnalysis from "@/components/BugAnalysis";
import { BASE_URL } from "@/integrations/supabase/client";

type View = 'login' | 'dashboard' | 'project' | 'bug';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedBug, setSelectedBug] = useState<string | null>(null);


    // const  [isLogged,setLogged]=useState(false)


const getStoredData = async () => {
  const data = await localStorage.getItem('user-data');
  if (data) {
    try {
      const parsedData = JSON.parse(data);
      const accessToken = parsedData.appToken;
      if(accessToken){
        // setLogged(true)
        setCurrentView('dashboard')
      }else{

        setCurrentView('login')
      }

      
      // Use it however you need
    } catch (error) {
      console.error('Failed to parse user data:', error);
    }
  } else {
    console.warn('No user data found in localStorage.');
  }
};

  useEffect(()=>{
getStoredData()
  },[])




  const handleLogin = () => {
       fetch(BASE_URL+'/bitbucket/connect',{
      // method:"POST"
    })
    .then((res)=>res.json())
    .then((response)=>{
    console.log('login',response);
    // window.open(response.authorization_url)
    // localStorage.setItem('user-data', JSON.stringify(response));
    setCurrentView('dashboard');

    })
    .catch((err)=>{
      console.log(err,'login failed');
      
    })


  };

  const handleLogout=()=>{
    localStorage.clear()
  }

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
    }else if(currentView ==='dashboard'){
      setCurrentView('login')
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard handleBack={handleBack}  onProjectSelect={handleProjectSelect}  handleLogout={handleLogout}/>;
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
