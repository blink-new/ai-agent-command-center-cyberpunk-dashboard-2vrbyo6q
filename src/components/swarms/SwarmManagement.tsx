import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, 
  Play, 
  Pause,
  Users, 
  Bot, 
  Zap,
  Settings,
  Trash2,
  ArrowRight,
  Network,
  Target,
  Clock
} from 'lucide-react'
import { AutomationService } from '../../services/automationService'
import type { Swarm, Agent } from '../../types/automation'

const COORDINATION_STRATEGIES = [
  {
    value: 'sequential',
    label: 'Sequential',
    description: 'Agents execute tasks one after another',
    icon: ArrowRight,
    color: 'text-blue-400'
  },
  {
    value: 'parallel',
    label: 'Parallel',
    description: 'All agents work simultaneously',
    icon: Zap,
    color: 'text-yellow-400'
  },
  {
    value: 'hierarchical',
    label: 'Hierarchical',
    description: 'Lead agent coordinates worker agents',
    icon: Network,
    color: 'text-purple-400'
  },
  {
    value: 'consensus',
    label: 'Consensus',
    description: 'Agents collaborate to reach agreement',
    icon: Target,
    color: 'text-green-400'
  }
]

export function SwarmManagement() {
  const [swarms, setSwarms] = useState<Swarm[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [newSwarm, setNewSwarm] = useState({
    name: '',
    description: '',
    coordination_strategy: 'sequential' as const
  })

  const loadData = async () => {
    try {
      const [swarmsData, agentsData] = await Promise.all([
        AutomationService.getSwarms(),
        AutomationService.getAgents()
      ])
      setSwarms(swarmsData)
      setAgents(agentsData)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load data:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateSwarm = async () => {
    if (!newSwarm.name || selectedAgents.length === 0) {
      alert('Please enter a swarm name and select at least one agent')
      return
    }

    try {
      const swarm = await AutomationService.createSwarm({
        name: newSwarm.name,
        description: newSwarm.description,
        agent_ids: selectedAgents,
        coordination_strategy: newSwarm.coordination_strategy,
        status: 'inactive'
      })

      setSwarms(prev => [swarm, ...prev])
      setIsCreateDialogOpen(false)
      setNewSwarm({
        name: '',
        description: '',
        coordination_strategy: 'sequential'
      })
      setSelectedAgents([])
    } catch (error) {
      console.error('Failed to create swarm:', error)
      alert('Failed to create swarm')
    }
  }

  const toggleSwarm = async (swarmId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'active') {
        await AutomationService.updateSwarmStatus(swarmId, 'inactive')
        setSwarms(prev => prev.map(s => 
          s.id === swarmId ? { ...s, status: 'inactive' } : s
        ))
      } else {
        await AutomationService.activateSwarm(swarmId)
        setSwarms(prev => prev.map(s => 
          s.id === swarmId ? { ...s, status: 'active' } : s
        ))
      }
    } catch (error) {
      console.error('Failed to toggle swarm:', error)
    }
  }

  const deleteSwarm = async (swarmId: string) => {
    if (!confirm('Are you sure you want to delete this swarm?')) return
    
    try {
      await AutomationService.deleteSwarm(swarmId)
      setSwarms(prev => prev.filter(s => s.id !== swarmId))
    } catch (error) {
      console.error('Failed to delete swarm:', error)
    }
  }

  const getSwarmAgents = (swarm: Swarm) => {
    return agents.filter(agent => swarm.agent_ids.includes(agent.id))
  }

  const getStrategyInfo = (strategy: string) => {
    return COORDINATION_STRATEGIES.find(s => s.value === strategy) || COORDINATION_STRATEGIES[0]
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="flex items-center space-x-2 text-cyber-accent">
          <Users className="w-6 h-6 animate-pulse" />
          <span className="font-mono">Loading Swarms...</span>
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
            Swarm Management
          </h1>
          <p className="text-cyber-muted mt-1">
            Coordinate multiple AI agents for complex tasks
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyber-primary hover:bg-cyber-primary/80 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Swarm
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-cyber-border/50 bg-cyber-surface/95 text-cyber-text max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-mono text-cyber-text">Create AI Swarm</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="swarm-name" className="text-cyber-text">Swarm Name</Label>
                  <Input
                    id="swarm-name"
                    value={newSwarm.name}
                    onChange={(e) => setNewSwarm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Content Creation Team"
                    className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text"
                  />
                </div>
                <div>
                  <Label htmlFor="strategy" className="text-cyber-text">Coordination Strategy</Label>
                  <Select 
                    value={newSwarm.coordination_strategy} 
                    onValueChange={(value: any) => setNewSwarm(prev => ({ ...prev, coordination_strategy: value }))}
                  >
                    <SelectTrigger className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-cyber-surface border-cyber-border/50">
                      {COORDINATION_STRATEGIES.map(strategy => {
                        const Icon = strategy.icon
                        return (
                          <SelectItem key={strategy.value} value={strategy.value} className="text-cyber-text">
                            <div className="flex items-center space-x-2">
                              <Icon className={`w-4 h-4 ${strategy.color}`} />
                              <span>{strategy.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="swarm-description" className="text-cyber-text">Description</Label>
                <Textarea
                  id="swarm-description"
                  value={newSwarm.description}
                  onChange={(e) => setNewSwarm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the swarm's purpose and goals..."
                  className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text h-24"
                />
              </div>

              <div>
                <Label className="text-cyber-text">Select Agents ({selectedAgents.length} selected)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-cyber-border/30 rounded-lg bg-cyber-background/30">
                  {agents.length === 0 ? (
                    <div className="col-span-2 text-center py-4 text-cyber-muted">
                      <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No agents available</p>
                      <p className="text-xs">Create agents first</p>
                    </div>
                  ) : (
                    agents.map(agent => (
                      <div key={agent.id} className="flex items-center space-x-2 p-2 rounded bg-cyber-surface/50">
                        <Checkbox
                          id={agent.id}
                          checked={selectedAgents.includes(agent.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAgents(prev => [...prev, agent.id])
                            } else {
                              setSelectedAgents(prev => prev.filter(id => id !== agent.id))
                            }
                          }}
                        />
                        <label htmlFor={agent.id} className="flex-1 cursor-pointer">
                          <div className="text-sm font-medium text-cyber-text">{agent.name}</div>
                          <div className="text-xs text-cyber-muted">{agent.model}</div>
                        </label>
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'running' ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 bg-cyber-background/30 rounded-lg border border-cyber-border/30">
                <div className="flex items-center space-x-2 mb-2">
                  {(() => {
                    const strategy = getStrategyInfo(newSwarm.coordination_strategy)
                    const Icon = strategy.icon
                    return (
                      <>
                        <Icon className={`w-4 h-4 ${strategy.color}`} />
                        <span className="text-sm font-medium text-cyber-text">{strategy.label} Strategy</span>
                      </>
                    )
                  })()}
                </div>
                <p className="text-xs text-cyber-muted">
                  {getStrategyInfo(newSwarm.coordination_strategy).description}
                </p>
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
                  onClick={handleCreateSwarm}
                  className="bg-cyber-primary hover:bg-cyber-primary/80 text-white"
                  disabled={selectedAgents.length === 0}
                >
                  Create Swarm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Coordination Strategies Overview */}
      <Card className="glass border-cyber-border/50">
        <CardHeader>
          <CardTitle className="text-cyber-text font-mono">Coordination Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COORDINATION_STRATEGIES.map(strategy => {
              const Icon = strategy.icon
              const swarmCount = swarms.filter(s => s.coordination_strategy === strategy.value).length
              
              return (
                <div key={strategy.value} className="p-4 bg-cyber-background/30 rounded-lg border border-cyber-border/30">
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon className={`w-6 h-6 ${strategy.color}`} />
                    <div>
                      <h3 className="font-medium text-cyber-text font-mono">{strategy.label}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {swarmCount} swarms
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-cyber-muted">
                    {strategy.description}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Swarms */}
      <div>
        <h2 className="text-xl font-semibold text-cyber-text font-mono mb-4">
          AI Swarms ({swarms.length})
        </h2>
        <div className="space-y-4">
          {swarms.length === 0 ? (
            <Card className="glass border-cyber-border/50">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-cyber-muted opacity-50" />
                <h3 className="text-lg font-semibold text-cyber-text mb-2">No Swarms Created</h3>
                <p className="text-cyber-muted mb-6">
                  Create your first AI swarm to coordinate multiple agents
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-cyber-primary hover:bg-cyber-primary/80 text-white"
                  disabled={agents.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Swarm
                </Button>
                {agents.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-4">
                    ⚠️ Create agents first before creating swarms
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            swarms.map((swarm) => {
              const swarmAgents = getSwarmAgents(swarm)
              const strategy = getStrategyInfo(swarm.coordination_strategy)
              const StrategyIcon = strategy.icon
              
              return (
                <Card key={swarm.id} className="glass border-cyber-border/50 hover:border-cyber-primary/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className={`w-4 h-4 rounded-full ${
                            swarm.status === 'active' ? 'bg-green-400 animate-pulse' :
                            swarm.status === 'error' ? 'bg-red-400 animate-pulse' :
                            'bg-gray-400'
                          }`} />
                          <div>
                            <h3 className="font-semibold text-cyber-text font-mono text-lg">
                              {swarm.name}
                            </h3>
                            <div className="flex items-center space-x-3 mt-1">
                              <Badge variant={
                                swarm.status === 'active' ? 'default' :
                                swarm.status === 'error' ? 'destructive' :
                                'secondary'
                              }>
                                {swarm.status.toUpperCase()}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <StrategyIcon className={`w-4 h-4 ${strategy.color}`} />
                                <span className="text-sm text-cyber-muted">{strategy.label}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-cyber-muted mb-4">
                          {swarm.description || 'No description provided'}
                        </p>
                        
                        <div className="flex items-center space-x-6 text-xs text-cyber-muted">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{swarmAgents.length} agents</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Created: {new Date(swarm.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {/* Agent List */}
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-2">
                            {swarmAgents.map(agent => (
                              <div key={agent.id} className="flex items-center space-x-2 px-3 py-1 bg-cyber-background/50 rounded-full border border-cyber-border/30">
                                <div className={`w-2 h-2 rounded-full ${
                                  agent.status === 'running' ? 'bg-green-400' : 'bg-gray-400'
                                }`} />
                                <span className="text-xs text-cyber-text font-mono">{agent.name}</span>
                                <span className="text-xs text-cyber-muted">{agent.model}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleSwarm(swarm.id, swarm.status)}
                          className="text-cyber-text hover:bg-cyber-background/50"
                        >
                          {swarm.status === 'active' ? (
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
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteSwarm(swarm.id)}
                          className="text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}