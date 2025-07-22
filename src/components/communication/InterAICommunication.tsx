import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Users, Zap, Clock } from 'lucide-react'

export function InterAICommunication() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyber-text font-mono">
          Inter-AI Communication
        </h1>
        <p className="text-cyber-muted mt-1">
          Agent-to-agent interaction and collaboration hub
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-cyber-border/50">
          <CardHeader>
            <CardTitle className="text-cyber-text font-mono flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-cyber-accent" />
              Active Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-cyber-background/50 rounded-lg border border-cyber-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-cyber-text">GPT-4 ↔ Claude-3</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm text-cyber-muted">Collaborative content generation task</p>
                  <div className="flex items-center mt-2 text-xs text-cyber-muted">
                    <Clock className="w-3 h-3 mr-1" />
                    Started 15 minutes ago
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-cyber-border/50">
          <CardHeader>
            <CardTitle className="text-cyber-text font-mono flex items-center">
              <Users className="w-5 h-5 mr-2 text-cyber-accent" />
              Communication Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-cyber-background/50 rounded-lg">
                <Zap className="w-8 h-8 text-cyber-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-cyber-text font-mono">247</div>
                <div className="text-sm text-cyber-muted">Messages Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}