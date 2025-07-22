import { WorkflowEdge } from '../../types/workflow'

interface WorkflowConnectionProps {
  edge: WorkflowEdge
  sourcePosition: { x: number; y: number }
  targetPosition: { x: number; y: number }
  isAnimated?: boolean
  isActive?: boolean
}

export function WorkflowConnection({
  edge,
  sourcePosition,
  targetPosition,
  isAnimated = false,
  isActive = false
}: WorkflowConnectionProps) {
  // Calculate connection points (right side of source, left side of target)
  const sourceX = sourcePosition.x + 192 // node width
  const sourceY = sourcePosition.y + 40  // node height / 2
  const targetX = targetPosition.x
  const targetY = targetPosition.y + 40

  // Create curved path
  const midX = sourceX + (targetX - sourceX) / 2
  const path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`

  const getStrokeColor = () => {
    if (isActive) return '#00D4FF'
    if (edge.type === 'error') return '#EF4444'
    if (edge.type === 'conditional') return '#F59E0B'
    return '#6B7280'
  }

  const getStrokeWidth = () => {
    return isActive ? 3 : 2
  }

  return (
    <g>
      {/* Connection Path */}
      <path
        d={path}
        stroke={getStrokeColor()}
        strokeWidth={getStrokeWidth()}
        fill="none"
        strokeLinecap="round"
        className={isAnimated ? 'animate-pulse' : ''}
        opacity={isActive ? 1 : 0.7}
      />
      
      {/* Arrow Head */}
      <defs>
        <marker
          id={`arrowhead-${edge.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={getStrokeColor()}
            opacity={isActive ? 1 : 0.7}
          />
        </marker>
      </defs>
      
      <path
        d={path}
        stroke={getStrokeColor()}
        strokeWidth={getStrokeWidth()}
        fill="none"
        markerEnd={`url(#arrowhead-${edge.id})`}
        opacity={isActive ? 1 : 0.7}
      />
      
      {/* Animated Flow Dots */}
      {isAnimated && (
        <>
          <circle r="3" fill={getStrokeColor()} opacity="0.8">
            <animateMotion dur="2s" repeatCount="indefinite" path={path} />
          </circle>
          <circle r="2" fill={getStrokeColor()} opacity="0.6">
            <animateMotion dur="2s" repeatCount="indefinite" path={path} begin="0.5s" />
          </circle>
        </>
      )}
      
      {/* Connection Label */}
      {edge.condition && (
        <text
          x={midX}
          y={sourceY + (targetY - sourceY) / 2 - 10}
          textAnchor="middle"
          className="text-xs font-mono fill-cyber-text"
          style={{ fontSize: '10px' }}
        >
          {edge.condition}
        </text>
      )}
    </g>
  )
}