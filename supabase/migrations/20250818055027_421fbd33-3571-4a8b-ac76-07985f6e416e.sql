-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bitbucket_username TEXT,
  github_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  repository_url TEXT,
  branch TEXT DEFAULT 'main',
  description TEXT,
  bitbucket_project_key TEXT,
  jira_project_key TEXT,
  total_bugs INTEGER DEFAULT 0,
  fixed_bugs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Projects are viewable by everyone" 
ON public.projects 
FOR SELECT 
USING (true);

-- Create bugs table
CREATE TABLE public.bugs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  jira_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  file_path TEXT,
  line_number INTEGER,
  error_code TEXT,
  proposed_fix TEXT,
  is_fixed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for bugs
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;

-- Create policies for bugs
CREATE POLICY "Bugs are viewable by everyone" 
ON public.bugs 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bugs_updated_at
  BEFORE UPDATE ON public.bugs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.projects (name, repository_url, description, bitbucket_project_key, jira_project_key, total_bugs, fixed_bugs) VALUES
('E-commerce Platform', 'https://bitbucket.org/company/ecommerce', 'Main e-commerce application', 'ECOM', 'ECOM', 12, 8),
('Mobile App Backend', 'https://bitbucket.org/company/mobile-api', 'REST API for mobile applications', 'MOB', 'MOB', 8, 5),
('Analytics Dashboard', 'https://bitbucket.org/company/analytics', 'Real-time analytics platform', 'ANA', 'ANA', 15, 10);

INSERT INTO public.bugs (project_id, jira_id, title, description, severity, file_path, line_number, error_code) VALUES
((SELECT id FROM public.projects WHERE name = 'E-commerce Platform'), 'ECOM-123', 'Checkout process fails on mobile devices', 'Users cannot complete checkout on mobile browsers', 'critical', 'src/components/checkout/PaymentForm.tsx', 47, 'Payment validation error'),
((SELECT id FROM public.projects WHERE name = 'E-commerce Platform'), 'ECOM-124', 'Product images not loading', 'Product images fail to load on product detail page', 'high', 'src/components/ProductDetail.tsx', 23, 'Image source path error'),
((SELECT id FROM public.projects WHERE name = 'Mobile App Backend'), 'MOB-101', 'API rate limiting too aggressive', 'API returns 429 status too frequently', 'medium', 'src/middleware/rateLimiter.js', 15, 'Rate limit configuration'),
((SELECT id FROM public.projects WHERE name = 'Analytics Dashboard'), 'ANA-201', 'Chart rendering performance issue', 'Dashboard charts take too long to render', 'high', 'src/components/charts/LineChart.tsx', 67, 'Performance optimization needed');