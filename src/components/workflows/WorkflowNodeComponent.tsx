import { useState, useRef, useCallback } from 'react'
import { WorkflowNode } from '../../types/workflow'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { 
  Bot, 
  Database, 
  GitBranch, 
  Globe, 
  Zap, 
  Settings, 
  Trash2,
  Clock,
  Webhook,
  Code,
  Play,
  Pause
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkflowNodeComponentProps {
  node: WorkflowNode
  isSelected: boolean
  isExecuting?: boolean
  onDrag: (nodeId: string, position: { x: number; y: number }) => void
  onSelect: (nodeId: string, isMultiSelect: boolean) => void
  onConnectionStart: (nodeId: string, portId: string, position: { x: number; y: number }) => void
  onConnectionEnd: (nodeId: string, portId: string) => void
  onDataChange: (data: any) => void
}

const NODE_ICONS = {
  agent: Bot,
  input: Database,
  condition: GitBranch,
  api: Globe,
  output: Zap,
  transform: Code,
  delay: Clock,
  webhook: Webhook
}

const NODE_COLORS = {
  agent: 'border-cyber-primary bg-cyber-primary/10',
  input: 'border-green-400 bg-green-400/10',
  condition: 'border-yellow-400 bg-yellow-400/10',
  api: 'border-blue-400 bg-blue-400/10',
  output: 'border-purple-400 bg-purple-400/10',
  transform: 'border-orange-400 bg-orange-400/10',
  delay: 'border-pink-400 bg-pink-400/10',
  webhook: 'border-cyan-400 bg-cyan-400/10'
}

export function WorkflowNodeComponent({
  node,
  isSelected,
  isExecuting = false,
  onDrag,
  onSelect,
  onConnectionStart,
  onConnectionEnd,
  onDataChange
}: WorkflowNodeComponentProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showConfig, setShowConfig] = useState(false)

  const Icon = NODE_ICONS[node.type] || Bot
  const colorClass = NODE_COLORS[node.type] || NODE_COLORS.agent

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== nodeRef.current && !nodeRef.current?.contains(e.target as Node)) return
    
    e.stopPropagation()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    })
    onSelect(node.id, e.ctrlKey || e.metaKey)
  }, [node.id, node.position, onSelect])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }
    onDrag(node.id, newPosition)
  }, [isDragging, dragStart, node.id, onDrag])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handlePortMouseDown = (portId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    onConnectionStart(node.id, portId, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    })
  }

  const handlePortMouseUp = (portId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onConnectionEnd(node.id, portId)
  }

  const renderNodeConfig = () => {
    switch (node.type) {
      case 'agent':
        return (
          <div className="space-y-2">
            <Select 
              value={node.data.agent_id || ''} 
              onValueChange={(value) => onDataChange({ agent_id: value })}
            >
              <SelectTrigger className="h-8 text-xs bg-cyber-background/50 border-cyber-border/30">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent className="bg-cyber-surface border-cyber-border/50">
                <SelectItem value="gpt-4" className="text-cyber-text text-xs">GPT-4</SelectItem>
                <SelectItem value="claude-3" className="text-cyber-text text-xs">Claude 3</SelectItem>
                <SelectItem value="gemini-pro" className="text-cyber-text text-xs">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      
      case 'condition':
        return (
          <Input
            value={node.data.condition || ''}
            onChange={(e) => onDataChange({ condition: e.target.value })}
            placeholder="if condition..."
            className="h-8 text-xs bg-cyber-background/50 border-cyber-border/30"
          />
        )
      
      case 'api':
        return (
          <div className="space-y-2">
            <Select 
              value={node.data.api_method || 'POST'} 
              onValueChange={(value) => onDataChange({ api_method: value })}
            >
              <SelectTrigger className="h-8 text-xs bg-cyber-background/50 border-cyber-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cyber-surface border-cyber-border/50">
                <SelectItem value="GET" className="text-cyber-text text-xs">GET</SelectItem>
                <SelectItem value="POST" className="text-cyber-text text-xs">POST</SelectItem>
                <SelectItem value="PUT" className="text-cyber-text text-xs">PUT</SelectItem>
                <SelectItem value="DELETE" className="text-cyber-text text-xs">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={node.data.api_endpoint || ''}
              onChange={(e) => onDataChange({ api_endpoint: e.target.value })}
              placeholder="API endpoint..."
              className="h-8 text-xs bg-cyber-background/50 border-cyber-border/30"
            />
          </div>
        )
      
      case 'transform':
        return (
          <Textarea
            value={node.data.transform_script || ''}
            onChange={(e) => onDataChange({ transform_script: e.target.value })}
            placeholder="// Transform script\nreturn data.map(item => ({ ...item, processed: true }))"
            className="h-20 text-xs bg-cyber-background/50 border-cyber-border/30 font-mono"
          />
        )
      
      case 'delay':
        return (
          <Input
            type="number"
            value={node.data.delay_seconds || 1}
            onChange={(e) => onDataChange({ delay_seconds: parseInt(e.target.value) || 1 })}
            placeholder="Seconds"
            className="h-8 text-xs bg-cyber-background/50 border-cyber-border/30"
            min="1"
          />
        )
      
      case 'webhook':
        return (
          <Input
            value={node.data.webhook_url || ''}
            onChange={(e) => onDataChange({ webhook_url: e.target.value })}
            placeholder="Webhook URL..."
            className="h-8 text-xs bg-cyber-background/50 border-cyber-border/30"
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute bg-cyber-surface/90 border-2 rounded-lg p-3 min-w-48 cursor-move transition-all duration-200 select-none",
        colorClass,
        isSelected && "ring-2 ring-cyber-accent ring-offset-2 ring-offset-cyber-background",
        isExecuting && "animate-pulse-neon",
        isDragging && "scale-105 shadow-lg shadow-cyber-accent/20"
      )}
      style={{ 
        left: node.position.x, 
        top: node.position.y,
        zIndex: isSelected ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Input Ports */}
      {node.inputs?.map(port => (
        <div
          key={port.id}
          className="absolute w-3 h-3 bg-cyber-accent rounded-full border-2 border-cyber-surface cursor-pointer hover:scale-125 transition-transform"
          style={{
            left: port.position === 'left' ? -6 : undefined,
            right: port.position === 'right' ? -6 : undefined,
            top: port.position === 'top' ? -6 : undefined,
            bottom: port.position === 'bottom' ? -6 : undefined,
            transform: port.position === 'left' || port.position === 'right' ? 'translateY(50%)' : 'translateX(50%)'
          }}
          onMouseDown={(e) => handlePortMouseDown(port.id, e)}
          onMouseUp={(e) => handlePortMouseUp(port.id, e)}
          title={port.name}
        />
      ))}

      {/* Output Ports */}
      {node.outputs?.map(port => (
        <div
          key={port.id}
          className="absolute w-3 h-3 bg-cyber-primary rounded-full border-2 border-cyber-surface cursor-pointer hover:scale-125 transition-transform"
          style={{
            left: port.position === 'left' ? -6 : undefined,
            right: port.position === 'right' ? -6 : undefined,
            top: port.position === 'top' ? -6 : undefined,
            bottom: port.position === 'bottom' ? -6 : undefined,
            transform: port.position === 'left' || port.position === 'right' ? 'translateY(50%)' : 'translateX(50%)'
          }}
          onMouseDown={(e) => handlePortMouseDown(port.id, e)}
          onMouseUp={(e) => handlePortMouseUp(port.id, e)}
          title={port.name}
        />
      ))}

      {/* Node Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-cyber-accent" />
          <span className="text-sm font-mono text-cyber-text font-medium">
            {node.data.label}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {isExecuting && (
            <div className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="h-6 w-6 p-0 text-cyber-muted hover:text-cyber-text"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Node Configuration */}
      {showConfig && (
        <div className="space-y-2 border-t border-cyber-border/30 pt-2">
          {renderNodeConfig()}
        </div>
      )}

      {/* Node Status */}
      {node.type !== 'input' && node.type !== 'output' && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-cyber-border/30">
          <Badge variant="outline" className="text-xs">
            {node.type}
          </Badge>
          {isExecuting ? (
            <div className="flex items-center space-x-1 text-cyber-accent">
              <Play className="w-3 h-3" />
              <span className="text-xs font-mono">Running</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-cyber-muted">
              <Pause className="w-3 h-3" />
              <span className="text-xs font-mono">Ready</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}