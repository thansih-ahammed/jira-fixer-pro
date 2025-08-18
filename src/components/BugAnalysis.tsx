import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Code, AlertTriangle, GitCommit } from "lucide-react";
import { useState } from "react";

interface BugAnalysisProps {
  bugId: string;
  onBack: () => void;
}

const BugAnalysis = ({ bugId, onBack }: BugAnalysisProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [decision, setDecision] = useState<'accept' | 'reject' | null>(null);

  const bugData = {
    title: 'Checkout process fails on mobile devices',
    jiraId: 'PROJ-123',
    severity: 'critical',
    file: 'src/components/checkout/PaymentForm.tsx',
    lineNumber: 47,
    errorCode: `const handleSubmit = async (formData) => {
  // Missing mobile viewport check
  if (window.innerWidth < 768) {
    throw new Error('Mobile checkout not supported');
  }
  
  try {
    const response = await processPayment(formData);
    return response;
  } catch (error) {
    console.error('Payment failed:', error);
  }
};`,
    fixedCode: `const handleSubmit = async (formData) => {
  // Enhanced mobile support with proper validation
  const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  try {
    // Mobile-optimized payment processing
    const paymentConfig = {
      ...formData,
      mobileOptimized: isMobile,
      touchFriendly: isMobile
    };
    
    const response = await processPayment(paymentConfig);
    
    // Mobile-specific success handling
    if (isMobile) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Prevent double-tap
    }
    
    return response;
  } catch (error) {
    console.error('Payment failed:', error);
    // Mobile-friendly error display
    if (isMobile) {
      showMobileErrorDialog(error.message);
    } else {
      showErrorToast(error.message);
    }
    throw error;
  }
};`,
    analysis: `The issue occurs because the current code explicitly throws an error for mobile devices (window.innerWidth < 768). The checkout process should support mobile devices rather than blocking them. The fix includes:

1. Proper mobile device detection using both viewport width and user agent
2. Mobile-optimized payment configuration
3. Touch-friendly interactions with delay to prevent double-tap issues
4. Mobile-specific error handling with appropriate UI feedback

This solution ensures mobile users can complete their purchases successfully.`
  };

  const handleDecision = async (action: 'accept' | 'reject') => {
    setIsProcessing(true);
    setDecision(action);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (action === 'accept') {
      // Simulate pushing fix to repository
      console.log('Pushing fix to repository...');
    }
    
    setIsProcessing(false);
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
                Back to Project
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Bug Analysis & Fix</h1>
                <p className="text-muted-foreground">{bugData.jiraId} - {bugData.title}</p>
              </div>
            </div>
            <Badge className="bg-destructive text-destructive-foreground">
              {bugData.severity}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Bug Details */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
              Issue Location
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {bugData.file} - Line {bugData.lineNumber}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Code Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Code */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                Current Code (Problematic)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-background rounded-lg p-4 border border-border">
                <pre className="text-sm text-foreground whitespace-pre-wrap overflow-x-auto">
                  <code>{bugData.errorCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Fixed Code */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-accent flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Proposed Fix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-background rounded-lg p-4 border border-border">
                <pre className="text-sm text-foreground whitespace-pre-wrap overflow-x-auto">
                  <code>{bugData.fixedCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Code className="h-5 w-5 mr-2 text-primary" />
              Analysis & Solution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {bugData.analysis}
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!decision && (
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Review & Decision</CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose whether to apply this fix to your repository
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleDecision('accept')}
                  disabled={isProcessing}
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Accept & Apply Fix'}
                </Button>
                <Button
                  onClick={() => handleDecision('reject')}
                  disabled={isProcessing}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Fix
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success/Rejection Message */}
        {decision && (
          <Card className={`border ${decision === 'accept' ? 'border-accent bg-accent/10' : 'border-destructive bg-destructive/10'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                {decision === 'accept' ? (
                  <>
                    <GitCommit className="h-6 w-6 text-accent" />
                    <div>
                      <h3 className="text-lg font-semibold text-accent">Fix Applied Successfully!</h3>
                      <p className="text-muted-foreground">The fix has been committed and pushed to the main branch.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-destructive" />
                    <div>
                      <h3 className="text-lg font-semibold text-destructive">Fix Rejected</h3>
                      <p className="text-muted-foreground">The proposed fix was not applied to the repository.</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BugAnalysis;