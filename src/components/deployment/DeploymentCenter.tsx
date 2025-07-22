import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Rocket, GitBranch, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const deployments = [
  {
    id: 1,
    name: 'Content Pipeline v2.1',
    status: 'deployed',
    environment: 'Production',
    version: 'v2.1.0',
    deployedAt: '2 hours ago'
  },
  {
    id: 2,
    name: 'Data Analysis Workflow',
    status: 'deploying',
    environment: 'Staging',
    version: 'v1.3.2',
    deployedAt: 'In progress'
  },
  {
    id: 3,
    name: 'Code Review Agent',
    status: 'failed',
    environment: 'Development',
    version: 'v1.0.1',
    deployedAt: '1 day ago'
  }
]

export function DeploymentCenter() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyber-text font-mono">
            Deployment Center
          </h1>
          <p className="text-cyber-muted mt-1">
            Pipeline management and deployment tools
          </p>
        </div>
        <Button className="bg-cyber-primary hover:bg-cyber-primary/80 text-white">
          <Rocket className="w-4 h-4 mr-2" />
          Deploy
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass border-cyber-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-cyber-text font-mono flex items-center">
              <GitBranch className="w-5 h-5 mr-2 text-cyber-accent" />
              Recent Deployments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div key={deployment.id} className="flex items-center justify-between p-4 bg-cyber-background/50 rounded-lg border border-cyber-border/30">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      deployment.status === 'deployed' ? 'bg-green-400' :
                      deployment.status === 'deploying' ? 'bg-yellow-400 animate-pulse' :
                      'bg-red-400'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-cyber-text font-mono">
                        {deployment.name}
                      </h3>
                      <p className="text-sm text-cyber-muted">
                        {deployment.environment} • {deployment.version}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      deployment.status === 'deployed' ? 'default' :
                      deployment.status === 'deploying' ? 'secondary' :
                      'destructive'
                    }>
                      {deployment.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-cyber-muted mt-1">
                      {deployment.deployedAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-cyber-border/50">
          <CardHeader>
            <CardTitle className="text-cyber-text font-mono">Pipeline Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-cyber-background/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-cyber-text">Successful</span>
                </div>
                <span className="text-sm font-mono text-cyber-text">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cyber-background/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-cyber-text">In Progress</span>
                </div>
                <span className="text-sm font-mono text-cyber-text">2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cyber-background/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-cyber-text">Failed</span>
                </div>
                <span className="text-sm font-mono text-cyber-text">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}