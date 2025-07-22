import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Play, 
  Workflow,
  Save,
  Settings,
  History,
  FileText,
  Palette,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { AutomationService } from '../../services/automationService'
import { WorkflowCanvas } from './WorkflowCanvas'
import { WorkflowPalette } from './WorkflowPalette'
import { WorkflowTemplates } from './WorkflowTemplates'
import { blink } from '../../blink/client'
import type { Workflow, WorkflowNode, WorkflowEdge, WorkflowTemplate, Agent } from '../../types/automation'

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionData, setExecutionData] = useState<Record<string, any>>({})
  const [user, setUser] = useState(null)
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: ''
  })

  const loadData = useCallback(async () => {
    try {
      const [workflowsData, agentsData] = await Promise.all([
        AutomationService.getWorkflows(),
        AutomationService.getAgents()
      ])
      setWorkflows(workflowsData)
      setAgents(agentsData)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load data:', error)
      setIsLoading(false)
    }
  }, [])

  // Authentication state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user && !state.isLoading) {
        loadData()
      }
    })
    return unsubscribe
  }, [loadData])

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name) {
      alert('Please enter a workflow name')
      return
    }

    try {
      const workflow = await AutomationService.createWorkflow({
        name: newWorkflow.name,
        description: newWorkflow.description,
        status: 'draft',
        config: {
          nodes: [],
          edges: []
        }
      })

      setWorkflows(prev => [workflow, ...prev])
      setSelectedWorkflow(workflow)
      setIsCreateDialogOpen(false)
      setNewWorkflow({ name: '', description: '' })
    } catch (error) {
      console.error('Failed to create workflow:', error)
      alert('Failed to create workflow')
    }
  }

  const handleTemplateSelect = async (template: WorkflowTemplate) => {
    try {
      const workflow = await AutomationService.createWorkflow({
        name: template.name,
        description: template.description,
        status: 'draft',
        config: {
          nodes: template.nodes,
          edges: template.edges
        }
      })

      setWorkflows(prev => [workflow, ...prev])
      setSelectedWorkflow(workflow)
    } catch (error) {
      console.error('Failed to create workflow from template:', error)
      alert('Failed to create workflow from template')
    }
  }

  const handleExecuteWorkflow = async () => {
    if (!selectedWorkflow) return

    setIsExecuting(true)
    setExecutionData({})

    try {
      // Simulate workflow execution
      const nodes = selectedWorkflow.config.nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        setExecutionData(prev => ({ ...prev, [node.id]: { status: 'running', timestamp: Date.now() } }))
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
        
        setExecutionData(prev => ({ ...prev, [node.id]: { status: 'completed', timestamp: Date.now() } }))
      }

      alert('Workflow execution completed!')
    } catch (error) {
      console.error('Failed to execute workflow:', error)
      alert('Failed to execute workflow')
    } finally {
      setIsExecuting(false)
      setTimeout(() => setExecutionData({}), 3000) // Clear execution data after 3 seconds
    }
  }

  const handleSaveWorkflow = async () => {
    if (!selectedWorkflow) return

    try {
      await AutomationService.updateWorkflow(selectedWorkflow.id, {
        config: selectedWorkflow.config
      })
      alert('Workflow saved successfully!')
    } catch (error) {
      console.error('Failed to save workflow:', error)
      alert('Failed to save workflow')
    }
  }

  const handleNodesChange = (nodes: WorkflowNode[]) => {
    if (!selectedWorkflow) return
    
    setSelectedWorkflow(prev => prev ? {
      ...prev,
      config: {
        ...prev.config,
        nodes
      }
    } : null)
  }

  const handleEdgesChange = (edges: WorkflowEdge[]) => {
    if (!selectedWorkflow) return
    
    setSelectedWorkflow(prev => prev ? {
      ...prev,
      config: {
        ...prev.config,
        edges
      }
    } : null)
  }

  const handleNodeAdd = (node: WorkflowNode) => {
    if (!selectedWorkflow) return
    
    setSelectedWorkflow(prev => prev ? {
      ...prev,
      config: {
        ...prev.config,
        nodes: [...prev.config.nodes, node]
      }
    } : null)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="flex items-center space-x-2 text-cyber-accent">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-mono">Loading Workflow Builder...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-cyber-background">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-cyber-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyber-text font-mono">
              Workflow Builder
            </h1>
            <p className="text-cyber-muted mt-1">
              Visual drag-and-drop AI workflow orchestration
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyber-primary hover:bg-cyber-primary/80 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-cyber-border/50 bg-cyber-surface/95 text-cyber-text">
                <DialogHeader>
                  <DialogTitle className="font-mono text-cyber-text">Create New Workflow</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-name" className="text-cyber-text">Workflow Name</Label>
                    <Input
                      id="workflow-name"
                      value={newWorkflow.name}
                      onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Content Generation Pipeline"
                      className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-description" className="text-cyber-text">Description</Label>
                    <Textarea
                      id="workflow-description"
                      value={newWorkflow.description}
                      onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this workflow does..."
                      className="bg-cyber-background/50 border-cyber-border/50 text-cyber-text h-24"
                    />
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
                      onClick={handleCreateWorkflow}
                      className="bg-cyber-primary hover:bg-cyber-primary/80 text-white"
                    >
                      Create Workflow
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {selectedWorkflow && (
              <>
                <Button 
                  onClick={handleSaveWorkflow}
                  variant="outline"
                  className="border-cyber-border/50 text-cyber-text hover:bg-cyber-background/50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button 
                  onClick={handleExecuteWorkflow}
                  disabled={isExecuting || selectedWorkflow.config.nodes.length === 0}
                  className="bg-cyber-accent hover:bg-cyber-accent/80 text-black"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isExecuting ? 'Running...' : 'Execute'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-cyber-border/50 flex flex-col">
          <Tabs defaultValue="workflows" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-cyber-surface/50 border-b border-cyber-border/30">
              <TabsTrigger value="workflows" className="text-xs">
                <Workflow className="w-4 h-4 mr-1" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="palette" className="text-xs">
                <Palette className="w-4 h-4 mr-1" />
                Palette
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">
                <FileText className="w-4 h-4 mr-1" />
                Templates
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="workflows" className="flex-1 overflow-hidden">
              <div className="p-4 space-y-3 h-full overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-cyber-text">
                    My Workflows ({workflows.length})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={loadData}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                
                {workflows.length === 0 ? (
                  <div className="text-center py-8 text-cyber-muted">
                    <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No workflows created</p>
                    <p className="text-xs mt-1">Create your first workflow to get started</p>
                  </div>
                ) : (
                  workflows.map((workflow) => (
                    <div 
                      key={workflow.id} 
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedWorkflow?.id === workflow.id 
                          ? 'border-cyber-primary/50 bg-cyber-primary/10' 
                          : 'border-cyber-border/30 bg-cyber-background/50 hover:border-cyber-primary/30'
                      }`}
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-cyber-text font-mono text-sm">
                          {workflow.name}
                        </p>
                        <Badge variant={
                          workflow.status === 'active' ? 'default' :
                          workflow.status === 'draft' ? 'secondary' :
                          'outline'
                        } className="text-xs">
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-cyber-muted mb-2">
                        {workflow.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-cyber-muted">
                        <span>{workflow.config.nodes.length} nodes</span>
                        <span>{workflow.config.edges.length} connections</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="palette" className="flex-1 overflow-hidden">
              <WorkflowPalette />
            </TabsContent>
            
            <TabsContent value="templates" className="flex-1 overflow-hidden p-4">
              <div className="h-full overflow-y-auto">
                <WorkflowTemplates onTemplateSelect={handleTemplateSelect} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {selectedWorkflow ? (
            <>
              {/* Canvas Header */}
              <div className="flex-shrink-0 p-4 border-b border-cyber-border/30 bg-cyber-surface/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-mono text-cyber-text font-medium">
                      {selectedWorkflow.name}
                    </h2>
                    <p className="text-xs text-cyber-muted">
                      {selectedWorkflow.config.nodes.length} nodes • {selectedWorkflow.config.edges.length} connections
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedWorkflow.status}
                    </Badge>
                    {isExecuting && (
                      <div className="flex items-center space-x-2 text-cyber-accent">
                        <div className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse" />
                        <span className="text-xs font-mono">Executing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Canvas */}
              <div className="flex-1 p-4">
                <WorkflowCanvas
                  nodes={selectedWorkflow.config.nodes}
                  edges={selectedWorkflow.config.edges}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={handleEdgesChange}
                  onNodeAdd={handleNodeAdd}
                  onExecute={handleExecuteWorkflow}
                  onSave={handleSaveWorkflow}
                  isExecuting={isExecuting}
                  executionData={executionData}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Workflow className="w-16 h-16 text-cyber-muted mx-auto opacity-50" />
                <div className="space-y-2">
                  <h3 className="text-lg font-mono text-cyber-text">
                    No Workflow Selected
                  </h3>
                  <p className="text-cyber-muted text-sm max-w-md">
                    Select an existing workflow from the sidebar or create a new one to start building your AI automation pipeline.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-cyber-primary hover:bg-cyber-primary/80 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}