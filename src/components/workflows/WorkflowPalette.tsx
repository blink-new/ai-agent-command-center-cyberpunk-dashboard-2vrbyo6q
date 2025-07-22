import { useState } from 'react'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Bot, 
  Database, 
  GitBranch, 
  Globe, 
  Zap, 
  Code,
  Clock,
  Webhook,
  Search,
  Filter,
  Sparkles
} from 'lucide-react'

const NODE_TYPES = [
  {
    type: 'input',
    label: 'Data Input',
    icon: Database,
    color: 'text-green-400',
    category: 'data',
    description: 'Receive input data for processing',
    tags: ['input', 'data', 'start']
  },
  {
    type: 'agent',
    label: 'AI Agent',
    icon: Bot,
    color: 'text-cyber-primary',
    category: 'ai',
    description: 'Execute AI tasks with selected agent',
    tags: ['ai', 'llm', 'processing']
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: GitBranch,
    color: 'text-yellow-400',
    category: 'logic',
    description: 'Branch workflow based on conditions',
    tags: ['logic', 'branch', 'condition']
  },
  {
    type: 'transform',
    label: 'Transform',
    icon: Code,
    color: 'text-orange-400',
    category: 'data',
    description: 'Transform data with custom scripts',
    tags: ['transform', 'script', 'data']
  },
  {
    type: 'api',
    label: 'API Call',
    icon: Globe,
    color: 'text-blue-400',
    category: 'integration',
    description: 'Make external API requests',
    tags: ['api', 'http', 'integration']
  },
  {
    type: 'webhook',
    label: 'Webhook',
    icon: Webhook,
    color: 'text-cyan-400',
    category: 'integration',
    description: 'Send data to webhook endpoints',
    tags: ['webhook', 'notification', 'integration']
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    color: 'text-pink-400',
    category: 'utility',
    description: 'Add time delays between steps',
    tags: ['delay', 'wait', 'timing']
  },
  {
    type: 'output',
    label: 'Output',
    icon: Zap,
    color: 'text-purple-400',
    category: 'data',
    description: 'Return final workflow results',
    tags: ['output', 'result', 'end']
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Sparkles },
  { id: 'ai', name: 'AI', icon: Bot },
  { id: 'data', name: 'Data', icon: Database },
  { id: 'logic', name: 'Logic', icon: GitBranch },
  { id: 'integration', name: 'Integration', icon: Globe },
  { id: 'utility', name: 'Utility', icon: Clock }
]

interface WorkflowPaletteProps {
  onNodeDragStart?: (nodeType: any) => void
}

export function WorkflowPalette({ onNodeDragStart }: WorkflowPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredNodes = NODE_TYPES.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleDragStart = (nodeType: any, e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(nodeType))
    onNodeDragStart?.(nodeType)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-cyber-border/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search components..."
            className="pl-10 bg-cyber-background/50 border-cyber-border/50 text-cyber-text"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-cyber-border/30">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`h-8 ${
                  isSelected 
                    ? 'bg-cyber-primary/20 text-cyber-accent border border-cyber-primary/30' 
                    : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-border/50'
                }`}
              >
                <Icon className="w-3 h-3 mr-1" />
                {category.name}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Components */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {filteredNodes.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="w-12 h-12 text-cyber-muted mx-auto mb-4 opacity-50" />
              <p className="text-cyber-muted text-sm">
                No components found
              </p>
              <p className="text-cyber-muted text-xs mt-1">
                Try adjusting your search or category filter
              </p>
            </div>
          ) : (
            filteredNodes.map((nodeType) => {
              const Icon = nodeType.icon
              return (
                <div 
                  key={nodeType.type}
                  className="group p-3 bg-cyber-surface/50 rounded-lg border border-cyber-border/30 cursor-grab hover:border-cyber-primary/50 hover:bg-cyber-surface/70 transition-all duration-200 active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => handleDragStart(nodeType, e)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className={`w-6 h-6 ${nodeType.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-cyber-text font-mono">
                          {nodeType.label}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className="text-xs opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                          {nodeType.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-cyber-muted leading-relaxed">
                        {nodeType.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {nodeType.tags.slice(0, 3).map(tag => (
                          <span 
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-cyber-background/50 text-cyber-muted rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Usage Hint */}
      <div className="p-4 border-t border-cyber-border/30">
        <div className="text-xs text-cyber-muted space-y-1">
          <p className="flex items-center">
            <span className="w-2 h-2 bg-cyber-accent rounded-full mr-2" />
            Drag components to canvas
          </p>
          <p className="flex items-center">
            <span className="w-2 h-2 bg-cyber-primary rounded-full mr-2" />
            Connect ports to create flow
          </p>
          <p className="flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2" />
            Configure node settings
          </p>
        </div>
      </div>
    </div>
  )
}