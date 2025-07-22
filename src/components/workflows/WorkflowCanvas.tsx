import { useState, useRef, useCallback, useEffect } from 'react'
import { WorkflowNode, WorkflowEdge } from '../../types/workflow'
import { WorkflowNodeComponent } from './WorkflowNodeComponent'
import { WorkflowConnection } from './WorkflowConnection'
import { Button } from '../ui/button'
import { ZoomIn, ZoomOut, Maximize, Grid, Play, Save } from 'lucide-react'

interface WorkflowCanvasProps {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  onNodesChange: (nodes: WorkflowNode[]) => void
  onEdgesChange: (edges: WorkflowEdge[]) => void
  onNodeAdd: (node: WorkflowNode) => void
  onExecute?: () => void
  onSave?: () => void
  isExecuting?: boolean
  executionData?: Record<string, any>
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeAdd,
  onExecute,
  onSave,
  isExecuting = false,
  executionData = {}
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [connectionStart, setConnectionStart] = useState<{
    nodeId: string
    portId: string
    position: { x: number; y: number }
  } | null>(null)
  const [tempConnection, setTempConnection] = useState<{ x: number; y: number } | null>(null)

  // Handle canvas drag for panning
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
    
    // Update temp connection line
    if (connectionStart && tempConnection) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setTempConnection({
          x: (e.clientX - rect.left - pan.x) / zoom,
          y: (e.clientY - rect.top - pan.y) / zoom
        })
      }
    }
  }, [isDragging, dragStart, connectionStart, tempConnection, pan, zoom])

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false)
    setConnectionStart(null)
    setTempConnection(null)
  }, [])

  // Handle node drag
  const handleNodeDrag = useCallback((nodeId: string, newPosition: { x: number; y: number }) => {
    onNodesChange(nodes.map(node => 
      node.id === nodeId 
        ? { ...node, position: newPosition }
        : node
    ))
  }, [nodes, onNodesChange])

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      setSelectedNodes(prev => 
        prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId]
      )
    } else {
      setSelectedNodes([nodeId])
    }
  }, [])

  // Handle connection creation
  const handleConnectionStart = useCallback((nodeId: string, portId: string, position: { x: number; y: number }) => {
    setConnectionStart({ nodeId, portId, position })
    setTempConnection(position)
  }, [])

  const handleConnectionEnd = useCallback((targetNodeId: string, targetPortId: string) => {
    if (connectionStart && connectionStart.nodeId !== targetNodeId) {
      const newEdge: WorkflowEdge = {
        id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source: connectionStart.nodeId,
        target: targetNodeId,
        sourcePort: connectionStart.portId,
        targetPort: targetPortId,
        type: 'default'
      }
      onEdgesChange([...edges, newEdge])
    }
    setConnectionStart(null)
    setTempConnection(null)
  }, [connectionStart, edges, onEdgesChange])

  // Handle drop from palette
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const nodeData = e.dataTransfer.getData('application/json')
    if (!nodeData) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const nodeType = JSON.parse(nodeData)
    const position = {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    }

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType.type,
      position,
      data: {
        label: nodeType.label,
        ...getDefaultNodeData(nodeType.type)
      },
      inputs: getDefaultPorts(nodeType.type, 'input'),
      outputs: getDefaultPorts(nodeType.type, 'output')
    }

    onNodeAdd(newNode)
  }, [pan, zoom, onNodeAdd])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3))
  const handleZoomFit = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Delete selected nodes
  const handleDeleteSelected = useCallback(() => {
    if (selectedNodes.length > 0) {
      onNodesChange(nodes.filter(node => !selectedNodes.includes(node.id)))
      onEdgesChange(edges.filter(edge => 
        !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
      ))
      setSelectedNodes([])
    }
  }, [selectedNodes, nodes, edges, onNodesChange, onEdgesChange])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected()
      }
      if (e.key === 'Escape') {
        setSelectedNodes([])
        setConnectionStart(null)
        setTempConnection(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDeleteSelected])

  return (
    <div className="relative h-full bg-cyber-background/30 rounded-lg border border-cyber-border/50 overflow-hidden">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-cyber-surface/90 rounded-lg border border-cyber-border/50 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0 text-cyber-text hover:bg-cyber-border/50"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-cyber-text font-mono px-2 min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0 text-cyber-text hover:bg-cyber-border/50"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomFit}
            className="h-8 w-8 p-0 text-cyber-text hover:bg-cyber-border/50"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
        
        {onSave && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="bg-cyber-surface/90 border border-cyber-border/50 text-cyber-text hover:bg-cyber-border/50"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        )}
        
        {onExecute && (
          <Button
            onClick={onExecute}
            disabled={isExecuting || nodes.length === 0}
            className="bg-cyber-accent hover:bg-cyber-accent/80 text-black"
          >
            <Play className="w-4 h-4 mr-2" />
            {isExecuting ? 'Running...' : 'Execute'}
          </Button>
        )}
      </div>

      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      />

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        {/* Connections */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source)
            const targetNode = nodes.find(n => n.id === edge.target)
            if (!sourceNode || !targetNode) return null

            return (
              <WorkflowConnection
                key={edge.id}
                edge={edge}
                sourcePosition={sourceNode.position}
                targetPosition={targetNode.position}
                isAnimated={edge.animated || isExecuting}
                isActive={executionData[edge.source] && !executionData[edge.target]}
              />
            )
          })}
          
          {/* Temporary connection line */}
          {connectionStart && tempConnection && (
            <line
              x1={connectionStart.position.x}
              y1={connectionStart.position.y}
              x2={tempConnection.x}
              y2={tempConnection.y}
              stroke="rgba(0, 212, 255, 0.8)"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <WorkflowNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodes.includes(node.id)}
            isExecuting={isExecuting && executionData[node.id]}
            onDrag={handleNodeDrag}
            onSelect={handleNodeSelect}
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
            onDataChange={(data) => {
              onNodesChange(nodes.map(n => 
                n.id === node.id ? { ...n, data: { ...n.data, ...data } } : n
              ))
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4">
            <Grid className="w-16 h-16 text-cyber-muted mx-auto opacity-50" />
            <div className="space-y-2">
              <h3 className="text-lg font-mono text-cyber-text">
                Empty Canvas
              </h3>
              <p className="text-cyber-muted text-sm max-w-md">
                Drag components from the palette to start building your AI workflow.
                Connect nodes to create powerful automation pipelines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selection Info */}
      {selectedNodes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-cyber-surface/90 border border-cyber-border/50 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-cyber-text font-mono">
              {selectedNodes.length} node{selectedNodes.length > 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-red-400 hover:bg-red-400/10"
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
function getDefaultNodeData(type: string) {
  switch (type) {
    case 'agent':
      return { agent_id: '', config: {} }
    case 'condition':
      return { condition: '', config: {} }
    case 'api':
      return { 
        api_endpoint: '', 
        api_method: 'POST' as const,
        api_headers: {},
        api_body: ''
      }
    case 'transform':
      return { transform_script: '' }
    case 'delay':
      return { delay_seconds: 1 }
    case 'webhook':
      return { webhook_url: '' }
    default:
      return { config: {} }
  }
}

function getDefaultPorts(type: string, direction: 'input' | 'output') {
  const basePorts = direction === 'input' 
    ? [{ id: 'input', name: 'Input', type: 'data' as const, position: 'left' as const }]
    : [{ id: 'output', name: 'Output', type: 'data' as const, position: 'right' as const }]

  if (type === 'condition' && direction === 'output') {
    return [
      { id: 'true', name: 'True', type: 'data' as const, position: 'right' as const },
      { id: 'false', name: 'False', type: 'data' as const, position: 'right' as const }
    ]
  }

  if (type === 'input' && direction === 'input') {
    return []
  }

  if (type === 'output' && direction === 'output') {
    return []
  }

  return basePorts
}