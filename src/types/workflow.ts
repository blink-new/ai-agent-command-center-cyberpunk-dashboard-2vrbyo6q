export interface WorkflowNode {
  id: string
  type: 'agent' | 'input' | 'condition' | 'api' | 'output' | 'transform' | 'delay' | 'webhook'
  position: { x: number; y: number }
  data: {
    label: string
    agent_id?: string
    condition?: string
    api_endpoint?: string
    api_method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    api_headers?: Record<string, string>
    api_body?: string
    transform_script?: string
    delay_seconds?: number
    webhook_url?: string
    input_schema?: any
    output_schema?: any
    config?: Record<string, any>
  }
  inputs?: WorkflowPort[]
  outputs?: WorkflowPort[]
}

export interface WorkflowPort {
  id: string
  name: string
  type: 'data' | 'trigger' | 'success' | 'error'
  position: 'top' | 'bottom' | 'left' | 'right'
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourcePort?: string
  targetPort?: string
  type?: 'default' | 'conditional' | 'error'
  condition?: string
  animated?: boolean
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  started_at: string
  completed_at?: string
  current_node?: string
  execution_data: Record<string, any>
  logs: WorkflowLog[]
}

export interface WorkflowLog {
  id: string
  node_id: string
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
  data?: any
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: 'content' | 'data' | 'automation' | 'analysis' | 'integration'
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  thumbnail?: string
  tags: string[]
}

export interface WorkflowVariable {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  value: any
  description?: string
  required?: boolean
}

export interface WorkflowConfig {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  variables?: WorkflowVariable[]
  settings?: {
    timeout?: number
    retry_attempts?: number
    parallel_execution?: boolean
    error_handling?: 'stop' | 'continue' | 'retry'
  }
}

export interface Workflow {
  id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  config: WorkflowConfig
  created_at: string
  updated_at: string
  user_id: string
  version: number
  tags?: string[]
  category?: string
  execution_count?: number
  last_executed?: string
}