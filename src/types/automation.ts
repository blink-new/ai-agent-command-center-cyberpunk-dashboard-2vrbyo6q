export interface Agent {
  id: string
  user_id: string
  name: string
  description?: string
  model: string
  provider: string
  status: 'idle' | 'running' | 'paused' | 'error'
  config?: AgentConfig
  system_prompt?: string
  created_at: string
  updated_at: string
}

export interface AgentConfig {
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  tools?: string[]
  auto_execute?: boolean
  retry_attempts?: number
  timeout?: number
}

export interface Workflow {
  id: string
  user_id: string
  name: string
  description?: string
  config: WorkflowConfig
  status: 'draft' | 'active' | 'paused' | 'completed' | 'error'
  created_at: string
  updated_at: string
}

export interface WorkflowConfig {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  triggers?: WorkflowTrigger[]
  schedule?: WorkflowSchedule
}

export interface WorkflowNode {
  id: string
  type: 'agent' | 'condition' | 'input' | 'output' | 'api' | 'transform'
  position: { x: number; y: number }
  data: {
    label: string
    agent_id?: string
    condition?: string
    api_endpoint?: string
    transform_script?: string
    [key: string]: any
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  condition?: string
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'event'
  config: any
}

export interface WorkflowSchedule {
  cron: string
  timezone: string
  enabled: boolean
}

export interface Task {
  id: string
  user_id: string
  agent_id?: string
  workflow_id?: string
  name: string
  description?: string
  input_data?: any
  output_data?: any
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  priority: number
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface Swarm {
  id: string
  user_id: string
  name: string
  description?: string
  agent_ids: string[]
  coordination_strategy: 'sequential' | 'parallel' | 'hierarchical' | 'consensus'
  status: 'inactive' | 'active' | 'paused' | 'error'
  created_at: string
  updated_at: string
}

export interface Execution {
  id: string
  user_id: string
  type: 'workflow' | 'task' | 'swarm'
  target_id: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  start_time: string
  end_time?: string
  logs?: ExecutionLog[]
  metrics?: ExecutionMetrics
}

export interface ExecutionLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: any
}

export interface ExecutionMetrics {
  duration_ms: number
  tokens_used: number
  api_calls: number
  cost: number
  success_rate: number
}

export interface AgentMessage {
  id: string
  agent_id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: string
  metadata?: any
}

export interface SwarmCommunication {
  id: string
  swarm_id: string
  from_agent_id: string
  to_agent_id?: string // undefined for broadcast
  message: string
  timestamp: string
  type: 'coordination' | 'data_sharing' | 'status_update'
}