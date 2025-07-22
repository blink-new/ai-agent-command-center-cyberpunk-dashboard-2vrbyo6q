import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Cpu, 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Plus
} from 'lucide-react'
import { AutomationService } from '../../services/automationService'
import { blink } from '../../blink/client'
import type { Agent, Task, Execution } from '../../types/automation'

export function CommandCenter() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [executions, setExecutions] = useState<Execution[]>([])
  const [stats, setStats] = useState({
    activeAgents: 0,
    runningWorkflows: 0,
    apiCallsPerMin: 0,
    successRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [realtimeActivity, setRealtimeActivity] = useState<any[]>([])
  const [user, setUser] = useState(null)

  const loadData = async () => {
    try {
      const [agentsData, tasksData] = await Promise.all([
        AutomationService.getAgents(),
        AutomationService.getTasks()
      ])

      setAgents(agentsData)
      setTasks(tasksData)

      // Calculate stats
      const activeAgents = agentsData.filter(a => a.status === 'running').length
      const runningTasks = tasksData.filter(t => t.status === 'running').length
      const completedTasks = tasksData.filter(t => t.status === 'completed').length
      const totalTasks = tasksData.length
      const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

      setStats({
        activeAgents,
        runningWorkflows: runningTasks,
        apiCallsPerMin: Math.floor(Math.random() * 2000) + 500, // Simulated
        successRate: Math.round(successRate * 10) / 10
      })

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load data:', error)
      setIsLoading(false)
    }
  }

  const setupRealtimeUpdates = async () => {
    try {
      await AutomationService.subscribeToAgentUpdates((message) => {
        setRealtimeActivity(prev => [{
          id: Date.now(),
          type: 'info',
          message: `Agent ${message.data.agentId} status: ${message.data.status}`,
          time: 'Just now',
          icon: CheckCircle
        }, ...prev.slice(0, 9)])
      })
    } catch (error) {
      console.error('Failed to setup realtime updates:', error)
    }
  }

  // Wait for authentication before loading data
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user && !state.isLoading) {
        // User is authenticated and auth is complete
        loadData()
        setupRealtimeUpdates()
      } else if (!state.user && !state.isLoading) {
        // User is not authenticated
        setIsLoading(false)
      }
    })
    return unsubscribe
  }, [])

  const createQuickAgent = async () => {
    try {
      const agent = await AutomationService.createAgent({
        name: `Quick Agent ${Date.now()}`,
        description: 'Auto-generated agent for quick tasks',
        model: 'GPT-4 Turbo',
        provider: 'OpenAI',
        status: 'idle',
        system_prompt: 'You are a helpful AI assistant that can perform various tasks efficiently.'
      })

      setAgents(prev => [agent, ...prev])
      
      setRealtimeActivity(prev => [{
        id: Date.now(),
        type: 'success',
        message: `Created new agent: ${agent.name}`,
        time: 'Just now',
        icon: CheckCircle
      }, ...prev.slice(0, 9)])
    } catch (error) {
      console.error('Failed to create agent:', error)
    }
  }

  const createQuickTask = async () => {
    if (agents.length === 0) {
      alert('Please create an agent first')
      return
    }

    try {
      const task = await AutomationService.createTask({
        name: `Quick Task ${Date.now()}`,
        description: 'Auto-generated task for testing',
        agent_id: agents[0].id,
        status: 'pending',
        priority: 1,
        input_data: { prompt: 'Generate a creative story about AI automation' }
      })

      setTasks(prev => [task, ...prev])
      
      // Execute the task immediately
      await AutomationService.executeTask(task.id)
      
      setRealtimeActivity(prev => [{
        id: Date.now(),
        type: 'success',
        message: `Created and executed task: ${task.name}`,
        time: 'Just now',
        icon: Play
      }, ...prev.slice(0, 9)])
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const toggleAgent = async (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'idle' : 'running'
    try {
      await AutomationService.updateAgentStatus(agentId, newStatus)
      setAgents(prev => prev.map(a => 
        a.id === agentId ? { ...a, status: newStatus } : a
      ))
      
      await AutomationService.publishAgentUpdate(agentId, { status: newStatus })
    } catch (error) {
      console.error('Failed to toggle agent:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="flex items-center space-x-2 text-cyber-accent">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-mono">Loading Command Center...</span>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      title: 'Active Agents',
      value: stats.activeAgents.toString(),
      change: '+' + Math.floor(Math.random() * 5),
      icon: Cpu,
      color: 'text-cyber-accent'
    },
    {
      title: 'Running Tasks',
      value: stats.runningWorkflows.toString(),
      change: '+' + Math.floor(Math.random() * 3),
      icon: Activity,
      color: 'text-green-400'
    },
    {
      title: 'API Calls/min',
      value: stats.apiCallsPerMin.toLocaleString(),
      change: '+15%',
      icon: Zap,
      color: 'text-yellow-400'
    },
    {
      title: 'Success Rate',
      value: stats.successRate.toFixed(1) + '%',
      change: '+0.3%',
      icon: TrendingUp,
      color: 'text-cyber-primary'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyber-text font-mono">
            AI Command Center
          </h1>
          <p className="text-cyber-muted mt-1">
            Real-time AI agent orchestration and automation
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={createQuickAgent}
            className="bg-cyber-primary hover:bg-cyber-primary/80 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Agent
          </Button>
          <Button 
            onClick={createQuickTask}
            className="bg-cyber-accent hover:bg-cyber-accent/80 text-black"
          >
            <Zap className="w-4 h-4 mr-2" />
            Quick Task
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyber-accent rounded-full animate-pulse" />
            <span className="text-sm text-cyber-muted font-mono">LIVE</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="glass border-cyber-border/50 hover:border-cyber-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyber-muted">{stat.title}</p>
                    <p className="text-2xl font-bold text-cyber-text font-mono">
                      {stat.value}
                    </p>
                    <p className={`text-sm ${stat.color}`}>
                      {stat.change}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Agents */}
        <Card className="glass border-cyber-border/50">
          <CardHeader>
            <CardTitle className="text-cyber-text font-mono flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-cyber-accent" />
              Active Agents ({agents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {agents.length === 0 ? (
                <div className="text-center py-8 text-cyber-muted">
                  <Cpu className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No agents created yet</p>
                  <Button 
                    onClick={createQuickAgent}
                    className="mt-4 bg-cyber-primary hover:bg-cyber-primary/80 text-white"
                  >
                    Create Your First Agent
                  </Button>
                </div>
              ) : (
                agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-cyber-background/50 border border-cyber-border/30">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        agent.status === 'running' ? 'bg-green-400 animate-pulse' :
                        agent.status === 'error' ? 'bg-red-400 animate-pulse' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium text-cyber-text font-mono">
                          {agent.name}
                        </p>
                        <p className="text-sm text-cyber-muted">
                          {agent.model} • {agent.provider}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        agent.status === 'running' ? 'default' :
                        agent.status === 'error' ? 'destructive' :
                        'secondary'
                      }>
                        {agent.status.toUpperCase()}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleAgent(agent.id, agent.status)}
                      >
                        {agent.status === 'running' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="glass border-cyber-border/50">
          <CardHeader>
            <CardTitle className="text-cyber-text font-mono flex items-center">
              <Activity className="w-5 h-5 mr-2 text-cyber-accent" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {realtimeActivity.length === 0 ? (
                <div className="text-center py-8 text-cyber-muted">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Create agents and tasks to see live updates</p>
                </div>
              ) : (
                realtimeActivity.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-cyber-background/50 border border-cyber-border/30">
                      <Icon className={`w-5 h-5 mt-0.5 ${
                        activity.type === 'success' ? 'text-green-400' :
                        activity.type === 'warning' ? 'text-yellow-400' :
                        activity.type === 'error' ? 'text-red-400' :
                        'text-cyber-accent'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-cyber-text">
                          {activity.message}
                        </p>
                        <p className="text-xs text-cyber-muted flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card className="glass border-cyber-border/50">
        <CardHeader>
          <CardTitle className="text-cyber-text font-mono flex items-center">
            <Zap className="w-5 h-5 mr-2 text-cyber-accent" />
            Recent Tasks ({tasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-cyber-muted">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tasks created yet</p>
                <Button 
                  onClick={createQuickTask}
                  className="mt-4 bg-cyber-accent hover:bg-cyber-accent/80 text-black"
                  disabled={agents.length === 0}
                >
                  Create Your First Task
                </Button>
              </div>
            ) : (
              tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-cyber-background/50 border border-cyber-border/30">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.status === 'completed' ? 'bg-green-400' :
                      task.status === 'running' ? 'bg-cyber-accent animate-pulse' :
                      task.status === 'failed' ? 'bg-red-400' :
                      'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-cyber-text font-mono">
                        {task.name}
                      </p>
                      <p className="text-sm text-cyber-muted">
                        Priority: {task.priority} • Created: {new Date(task.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    task.status === 'completed' ? 'default' :
                    task.status === 'running' ? 'secondary' :
                    task.status === 'failed' ? 'destructive' :
                    'outline'
                  }>
                    {task.status.toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}