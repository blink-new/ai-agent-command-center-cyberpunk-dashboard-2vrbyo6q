import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  MoreVertical,
  Cpu,
  Zap,
  Clock,
  DollarSign,
  Trash2,
  Edit,
  Bot
} from 'lucide-react'
import { AutomationService } from '../../services/automationService'
import { blink } from '../../blink/client'
import type { Agent, AgentConfig } from '../../types/automation'

const LLM_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '🤖',
    models: ['GPT-4 Turbo', 'GPT-4', 'GPT-3.5 Turbo'],
    color: 'text-green-400'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: '🧠',
    models: ['Claude-3 Opus', 'Claude-3 Sonnet', 'Claude-3 Haiku'],
    color: 'text-orange-400'
  },
  {
    id: 'google',
    name: 'Google',
    logo: '🔍',
    models: ['Gemini Pro', 'Gemini Pro Vision', 'PaLM 2'],
    color: 'text-blue-400'
  },
  {
    id: 'meta',
    name: 'Meta',
    logo: '🦙',
    models: ['Llama 3.1 405B', 'Llama 3.1 70B', 'Llama 3.1 8B'],
    color: 'text-purple-400'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: '🚀',
    models: ['DeepSeek V2', 'DeepSeek Coder'],
    color: 'text-cyan-400'
  }
]

export function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')
  const [user, setUser] = useState(null)
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    model: '',
    provider: '',
    system_prompt: '',
    config: {
      temperature: 0.7,
      max_tokens: 2000,
      auto_execute: false,
      retry_attempts: 3
    } as AgentConfig
  })

  const loadAgents = async () => {
    try {
      const agentsData = await AutomationService.getAgents()
      setAgents(agentsData)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load agents:', error)
      setIsLoading(false)
    }
  }

  // Wait for authentication before loading data
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user && !state.isLoading) {
        // User is authenticated and auth is complete
        loadAgents()
      } else if (!state.user && !state.isLoading) {
        // User is not authenticated
        setIsLoading(false)
      }
    })
    return unsubscribe
  }, [])

  const handleCreateAgent = async () => {
    if (!newAgent.name || !newAgent.provider || !newAgent.model) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const agent = await AutomationService.createAgent({
        name: newAgent.name,
        description: newAgent.description,
        model: newAgent.model,
        provider: newAgent.provider,
        status: 'idle',
        system_prompt: newAgent.system_prompt || 'You are a helpful AI assistant.',
        config: newAgent.config
      })

      setAgents(prev => [agent, ...prev])
      setIsCreateDialogOpen(false)
      setNewAgent({
        name: '',
        description: '',
        model: '',
        provider: '',
        system_prompt: '',
        config: {
          temperature: 0.7,
          max_tokens: 2000,
          auto_execute: false,
          retry_attempts: 3
        }
      })
      setSelectedProvider('')
    } catch (error) {
      console.error('Failed to create agent:', error)
      alert('Failed to create agent')
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

  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return
    
    try {
      await AutomationService.deleteAgent(agentId)
      setAgents(prev => prev.filter(a => a.id !== agentId))
    } catch (error) {
      console.error('Failed to delete agent:', error)
    }
  }

  const getProviderStats = () => {
    const stats = LLM_PROVIDERS.map(provider => {
      const providerAgents = agents.filter(a => a.provider === provider.name)
      const activeAgents = providerAgents.filter(a => a.status === 'running').length
      
      return {
        ...provider,
        totalAgents: providerAgents.length,
        activeAgents,
        apiCalls: Math.floor(Math.random() * 10000) + 1000,
        cost: Math.floor(Math.random() * 200) + 50,
        latency: Math.round((Math.random() * 2 + 0.5) * 10) / 10
      }
    })
    
    return stats
  }

  const providerStats = getProviderStats()

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="flex items-center space-x-2 text-cyber-accent">
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="font-mono">Loading Agents...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyber-text font-mono">
            Agent Management
          </h1>
          <p className="text-cyber-muted mt-1">
            Configure and monitor your AI agent fleet
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyber-primary hover:bg-cyber-primary/80 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Deploy Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-cyber-border/50 bg-cyber-surface/95 text-cyber-text max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-mono text-cyber-text">Deploy New Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-cyber-text">Agent Name</Label>
                  <Input
                    id="name"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Content Generator"
                    className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text"
                  />
                </div>
                <div>
                  <Label htmlFor="provider" className="text-cyber-text">Provider</Label>
                  <Select value={selectedProvider} onValueChange={(value) => {
                    setSelectedProvider(value)
                    const provider = LLM_PROVIDERS.find(p => p.id === value)
                    setNewAgent(prev => ({ 
                      ...prev, 
                      provider: provider?.name || '',
                      model: '' // Reset model when provider changes
                    }))
                  }}>
                    <SelectTrigger className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-cyber-surface border-cyber-border/50">
                      {LLM_PROVIDERS.map(provider => (
                        <SelectItem key={provider.id} value={provider.id} className="text-cyber-text">
                          {provider.logo} {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedProvider && (
                <div>
                  <Label htmlFor="model" className="text-cyber-text">Model</Label>
                  <Select value={newAgent.model} onValueChange={(value) => 
                    setNewAgent(prev => ({ ...prev, model: value }))
                  }>
                    <SelectTrigger className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="bg-cyber-surface border-cyber-border/50">
                      {LLM_PROVIDERS.find(p => p.id === selectedProvider)?.models.map(model => (
                        <SelectItem key={model} value={model} className="text-cyber-text">
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="description" className="text-cyber-text">Description</Label>
                <Input
                  id="description"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of agent's purpose"
                  className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text"
                />
              </div>

              <div>
                <Label htmlFor="system_prompt" className="text-cyber-text">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={newAgent.system_prompt}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, system_prompt: e.target.value }))}
                  placeholder="Define the agent's role and behavior..."
                  className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature" className="text-cyber-text">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={newAgent.config.temperature}
                    onChange={(e) => setNewAgent(prev => ({ 
                      ...prev, 
                      config: { ...prev.config, temperature: parseFloat(e.target.value) }
                    }))}
                    className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text"
                  />
                </div>
                <div>
                  <Label htmlFor="max_tokens" className="text-cyber-text">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    min="1"
                    max="8000"
                    value={newAgent.config.max_tokens}
                    onChange={(e) => setNewAgent(prev => ({ 
                      ...prev, 
                      config: { ...prev.config, max_tokens: parseInt(e.target.value) }
                    }))}
                    className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-cyber-border/50 text-cyber-text hover:bg-cyber-background/50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateAgent}
                  className="bg-cyber-primary hover:bg-cyber-primary/80 text-white"
                >
                  Deploy Agent
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Provider Stats */}
      <div>
        <h2 className="text-xl font-semibold text-cyber-text font-mono mb-4">
          LLM Provider Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providerStats.map((provider) => (
            <Card key={provider.id} className="glass border-cyber-border/50 hover:border-cyber-primary/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{provider.logo}</span>
                    <div>
                      <CardTitle className="text-cyber-text font-mono">
                        {provider.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {provider.totalAgents} agents
                        </Badge>
                        <Badge variant={provider.activeAgents > 0 ? 'default' : 'secondary'} className="text-xs">
                          {provider.activeAgents} active
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    provider.activeAgents > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                  }`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 rounded bg-cyber-background/50">
                    <Zap className="w-4 h-4 mx-auto mb-1 text-cyber-accent" />
                    <div className="text-cyber-text font-mono">{provider.apiCalls.toLocaleString()}</div>
                    <div className="text-cyber-muted">Calls</div>
                  </div>
                  <div className="text-center p-2 rounded bg-cyber-background/50">
                    <DollarSign className="w-4 h-4 mx-auto mb-1 text-green-400" />
                    <div className="text-cyber-text font-mono">${provider.cost}</div>
                    <div className="text-cyber-muted">Cost</div>
                  </div>
                  <div className="text-center p-2 rounded bg-cyber-background/50">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                    <div className="text-cyber-text font-mono">{provider.latency}s</div>
                    <div className="text-cyber-muted">Latency</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Agents */}
      <div>
        <h2 className="text-xl font-semibold text-cyber-text font-mono mb-4">
          Deployed Agents ({agents.length})
        </h2>
        <div className="space-y-4">
          {agents.length === 0 ? (
            <Card className="glass border-cyber-border/50">
              <CardContent className="p-12 text-center">
                <Bot className="w-16 h-16 mx-auto mb-4 text-cyber-muted opacity-50" />
                <h3 className="text-lg font-semibold text-cyber-text mb-2">No Agents Deployed</h3>
                <p className="text-cyber-muted mb-6">
                  Deploy your first AI agent to start automating tasks
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-cyber-primary hover:bg-cyber-primary/80 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Deploy Your First Agent
                </Button>
              </CardContent>
            </Card>
          ) : (
            agents.map((agent) => (
              <Card key={agent.id} className="glass border-cyber-border/50 hover:border-cyber-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        agent.status === 'running' ? 'bg-green-400 animate-pulse' :
                        agent.status === 'error' ? 'bg-red-400 animate-pulse' :
                        'bg-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-cyber-text font-mono text-lg">
                            {agent.name}
                          </h3>
                          <Badge variant={
                            agent.status === 'running' ? 'default' :
                            agent.status === 'error' ? 'destructive' :
                            'secondary'
                          }>
                            {agent.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-cyber-muted mt-1">
                          {agent.description || 'No description provided'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-cyber-muted">
                          <span>{agent.model} • {agent.provider}</span>
                          <span>Created: {new Date(agent.created_at).toLocaleDateString()}</span>
                          {agent.config && (
                            <span>Temp: {agent.config.temperature} • Tokens: {agent.config.max_tokens}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleAgent(agent.id, agent.status)}
                        className="text-cyber-text hover:bg-cyber-background/50"
                      >
                        {agent.status === 'running' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-cyber-text hover:bg-cyber-background/50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteAgent(agent.id)}
                        className="text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}