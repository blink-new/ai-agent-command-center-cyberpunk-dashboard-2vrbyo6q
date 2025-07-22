import { useState, useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { CommandCenter } from './components/dashboard/CommandCenter'
import { AgentManagement } from './components/agents/AgentManagement'
import { WorkflowBuilder } from './components/workflows/WorkflowBuilder'
import { SwarmManagement } from './components/swarms/SwarmManagement'
import { PromptLibrary } from './components/prompts/PromptLibrary'
import { InterAICommunication } from './components/communication/InterAICommunication'
import { DeploymentCenter } from './components/deployment/DeploymentCenter'
import { blink } from './blink/client'
import { RefreshCw, Shield } from 'lucide-react'
import { Button } from './components/ui/button'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Authentication state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setIsLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CommandCenter />
      case 'agents':
        return <AgentManagement />
      case 'workflows':
        return <WorkflowBuilder />
      case 'swarms':
        return <SwarmManagement />
      case 'prompts':
        return <PromptLibrary />
      case 'communication':
        return <InterAICommunication />
      case 'deployment':
        return <DeploymentCenter />
      default:
        return <CommandCenter />
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-cyber-background text-cyber-text items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="w-8 h-8 text-cyber-accent animate-spin" />
            <div className="text-2xl font-mono font-bold text-cyber-text">
              AI Command Center
            </div>
          </div>
          <p className="text-cyber-muted font-mono">
            Initializing secure connection...
          </p>
          <div className="flex items-center justify-center space-x-2 text-cyber-accent">
            <div className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse delay-75" />
            <div className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse delay-150" />
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="flex h-screen bg-cyber-background text-cyber-text items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Shield className="w-16 h-16 text-cyber-accent" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-mono font-bold text-cyber-text">
                AI Command Center
              </h1>
              <p className="text-cyber-muted">
                Professional AI agent orchestration platform
              </p>
            </div>
          </div>
          
          <div className="space-y-4 p-6 rounded-lg glass border border-cyber-border/50">
            <div className="space-y-2">
              <h2 className="text-xl font-mono font-semibold text-cyber-text">
                Secure Access Required
              </h2>
              <p className="text-sm text-cyber-muted">
                Please authenticate to access the AI command center and manage your agents.
              </p>
            </div>
            
            <Button 
              onClick={() => blink.auth.login()}
              className="w-full bg-cyber-primary hover:bg-cyber-primary/80 text-white font-mono"
            >
              <Shield className="w-4 h-4 mr-2" />
              Authenticate Access
            </Button>
          </div>
          
          <div className="text-xs text-cyber-muted font-mono">
            Powered by Blink AI • Enterprise-grade security
          </div>
        </div>
      </div>
    )
  }

  // Authenticated state - render main app
  return (
    <div className="flex h-screen bg-cyber-background text-cyber-text">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  )
}

export default App