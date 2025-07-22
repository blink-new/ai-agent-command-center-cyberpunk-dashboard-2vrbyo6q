import { blink } from '../blink/client'
import type { 
  Agent, 
  Workflow, 
  Task, 
  Swarm, 
  Execution, 
  AgentConfig,
  WorkflowConfig,
  ExecutionLog,
  ExecutionMetrics 
} from '../types/automation'

export class AutomationService {
  // Agent Management
  static async createAgent(data: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Agent> {
    const user = await blink.auth.me()
    const agent = await blink.db.agents.create({
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      ...data,
      config: JSON.stringify(data.config || {}),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    return {
      ...agent,
      config: agent.config ? JSON.parse(agent.config) : undefined
    }
  }

  static async getAgents(): Promise<Agent[]> {
    const user = await blink.auth.me()
    const agents = await blink.db.agents.list({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' }
    })
    
    return agents.map(agent => ({
      ...agent,
      config: agent.config ? JSON.parse(agent.config) : undefined
    }))
  }

  static async updateAgentStatus(agentId: string, status: Agent['status']): Promise<void> {
    await blink.db.agents.update(agentId, {
      status,
      updated_at: new Date().toISOString()
    })
  }

  static async deleteAgent(agentId: string): Promise<void> {
    await blink.db.agents.delete(agentId)
  }

  // Workflow Management
  static async createWorkflow(data: Omit<Workflow, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Workflow> {
    const user = await blink.auth.me()
    const workflow = await blink.db.workflows.create({
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      ...data,
      config: JSON.stringify(data.config),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    return {
      ...workflow,
      config: JSON.parse(workflow.config)
    }
  }

  static async getWorkflows(): Promise<Workflow[]> {
    const user = await blink.auth.me()
    const workflows = await blink.db.workflows.list({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' }
    })
    
    return workflows.map(workflow => ({
      ...workflow,
      config: JSON.parse(workflow.config)
    }))
  }

  static async executeWorkflow(workflowId: string): Promise<Execution> {
    const user = await blink.auth.me()
    const workflow = await blink.db.workflows.list({
      where: { id: workflowId, user_id: user.id }
    })
    
    if (!workflow.length) {
      throw new Error('Workflow not found')
    }

    const execution = await blink.db.executions.create({
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      type: 'workflow',
      target_id: workflowId,
      status: 'running',
      start_time: new Date().toISOString(),
      logs: JSON.stringify([]),
      metrics: JSON.stringify({})
    })

    // Start workflow execution in background
    this.runWorkflowExecution(execution.id, workflow[0])

    return {
      ...execution,
      logs: [],
      metrics: undefined
    }
  }

  // Task Management
  static async createTask(data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const user = await blink.auth.me()
    return await blink.db.tasks.create({
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      ...data,
      input_data: JSON.stringify(data.input_data || {}),
      output_data: JSON.stringify(data.output_data || {}),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }

  static async getTasks(): Promise<Task[]> {
    const user = await blink.auth.me()
    const tasks = await blink.db.tasks.list({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      limit: 100
    })
    
    return tasks.map(task => ({
      ...task,
      input_data: task.input_data ? JSON.parse(task.input_data) : undefined,
      output_data: task.output_data ? JSON.parse(task.output_data) : undefined
    }))
  }

  static async executeTask(taskId: string): Promise<void> {
    const user = await blink.auth.me()
    const tasks = await blink.db.tasks.list({
      where: { id: taskId, user_id: user.id }
    })
    
    if (!tasks.length) {
      throw new Error('Task not found')
    }

    const task = tasks[0]
    await blink.db.tasks.update(taskId, {
      status: 'running',
      updated_at: new Date().toISOString()
    })

    // Execute task with agent
    this.runTaskExecution(task)
  }

  // Swarm Management
  static async createSwarm(data: Omit<Swarm, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Swarm> {
    const user = await blink.auth.me()
    return await blink.db.swarms.create({
      id: `swarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      ...data,
      agent_ids: JSON.stringify(data.agent_ids),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }

  static async getSwarms(): Promise<Swarm[]> {
    const user = await blink.auth.me()
    const swarms = await blink.db.swarms.list({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' }
    })
    
    return swarms.map(swarm => ({
      ...swarm,
      agent_ids: JSON.parse(swarm.agent_ids)
    }))
  }

  static async activateSwarm(swarmId: string): Promise<void> {
    await blink.db.swarms.update(swarmId, {
      status: 'active',
      updated_at: new Date().toISOString()
    })

    // Start swarm coordination
    this.runSwarmCoordination(swarmId)
  }

  static async updateSwarmStatus(swarmId: string, status: Swarm['status']): Promise<void> {
    await blink.db.swarms.update(swarmId, {
      status,
      updated_at: new Date().toISOString()
    })
  }

  static async deleteSwarm(swarmId: string): Promise<void> {
    await blink.db.swarms.delete(swarmId)
  }

  // Execution Engine
  private static async runWorkflowExecution(executionId: string, workflow: any): Promise<void> {
    try {
      const logs: ExecutionLog[] = []
      const startTime = Date.now()

      logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Starting workflow execution: ${workflow.name}`
      })

      const config: WorkflowConfig = JSON.parse(workflow.config)
      
      // Execute workflow nodes in order
      for (const node of config.nodes) {
        if (node.type === 'agent' && node.data.agent_id) {
          await this.executeAgentNode(node, logs)
        }
      }

      const endTime = Date.now()
      const metrics: ExecutionMetrics = {
        duration_ms: endTime - startTime,
        tokens_used: 0, // Will be calculated during execution
        api_calls: config.nodes.filter(n => n.type === 'agent').length,
        cost: 0,
        success_rate: 100
      }

      await blink.db.executions.update(executionId, {
        status: 'completed',
        end_time: new Date().toISOString(),
        logs: JSON.stringify(logs),
        metrics: JSON.stringify(metrics)
      })

    } catch (error) {
      await blink.db.executions.update(executionId, {
        status: 'failed',
        end_time: new Date().toISOString(),
        logs: JSON.stringify([{
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Workflow execution failed: ${error.message}`
        }])
      })
    }
  }

  private static async executeAgentNode(node: any, logs: ExecutionLog[]): Promise<void> {
    const agents = await blink.db.agents.list({
      where: { id: node.data.agent_id }
    })

    if (!agents.length) {
      throw new Error(`Agent not found: ${node.data.agent_id}`)
    }

    const agent = agents[0]
    logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Executing agent: ${agent.name}`
    })

    // Execute AI task using Blink SDK
    const result = await blink.ai.generateText({
      prompt: node.data.prompt || 'Execute the assigned task',
      model: this.getModelForProvider(agent.provider, agent.model)
    })

    logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Agent ${agent.name} completed task`,
      data: { result: result.text }
    })
  }

  private static async runTaskExecution(task: any): Promise<void> {
    try {
      if (!task.agent_id) {
        throw new Error('No agent assigned to task')
      }

      const agents = await blink.db.agents.list({
        where: { id: task.agent_id }
      })

      if (!agents.length) {
        throw new Error('Agent not found')
      }

      const agent = agents[0]
      const inputData = task.input_data ? JSON.parse(task.input_data) : {}

      // Execute task with AI
      const result = await blink.ai.generateText({
        prompt: `Task: ${task.name}\nDescription: ${task.description}\nInput: ${JSON.stringify(inputData)}`,
        model: this.getModelForProvider(agent.provider, agent.model)
      })

      await blink.db.tasks.update(task.id, {
        status: 'completed',
        output_data: JSON.stringify({ result: result.text }),
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    } catch (error) {
      await blink.db.tasks.update(task.id, {
        status: 'failed',
        updated_at: new Date().toISOString()
      })
    }
  }

  private static async runSwarmCoordination(swarmId: string): Promise<void> {
    const swarms = await blink.db.swarms.list({
      where: { id: swarmId }
    })

    if (!swarms.length) return

    const swarm = swarms[0]
    const agentIds = JSON.parse(swarm.agent_ids)

    // Coordinate agents based on strategy
    switch (swarm.coordination_strategy) {
      case 'sequential':
        await this.runSequentialCoordination(agentIds)
        break
      case 'parallel':
        await this.runParallelCoordination(agentIds)
        break
      case 'hierarchical':
        await this.runHierarchicalCoordination(agentIds)
        break
      case 'consensus':
        await this.runConsensusCoordination(agentIds)
        break
    }
  }

  private static async runSequentialCoordination(agentIds: string[]): Promise<void> {
    // Execute agents one after another
    for (const agentId of agentIds) {
      await this.updateAgentStatus(agentId, 'running')
      // Simulate agent work
      await new Promise(resolve => setTimeout(resolve, 1000))
      await this.updateAgentStatus(agentId, 'idle')
    }
  }

  private static async runParallelCoordination(agentIds: string[]): Promise<void> {
    // Execute all agents simultaneously
    const promises = agentIds.map(async (agentId) => {
      await this.updateAgentStatus(agentId, 'running')
      await new Promise(resolve => setTimeout(resolve, 1000))
      await this.updateAgentStatus(agentId, 'idle')
    })
    
    await Promise.all(promises)
  }

  private static async runHierarchicalCoordination(agentIds: string[]): Promise<void> {
    // First agent is the coordinator
    const [coordinator, ...workers] = agentIds
    
    await this.updateAgentStatus(coordinator, 'running')
    
    // Coordinator delegates to workers
    for (const workerId of workers) {
      await this.updateAgentStatus(workerId, 'running')
      await new Promise(resolve => setTimeout(resolve, 500))
      await this.updateAgentStatus(workerId, 'idle')
    }
    
    await this.updateAgentStatus(coordinator, 'idle')
  }

  private static async runConsensusCoordination(agentIds: string[]): Promise<void> {
    // All agents work together to reach consensus
    const promises = agentIds.map(async (agentId) => {
      await this.updateAgentStatus(agentId, 'running')
      // Simulate consensus building
      await new Promise(resolve => setTimeout(resolve, 2000))
      await this.updateAgentStatus(agentId, 'idle')
    })
    
    await Promise.all(promises)
  }

  private static getModelForProvider(provider: string, model: string): string {
    // Map provider/model combinations to Blink SDK model names
    const modelMap: Record<string, string> = {
      'OpenAI/GPT-4 Turbo': 'gpt-4-turbo',
      'OpenAI/GPT-4': 'gpt-4',
      'OpenAI/GPT-3.5 Turbo': 'gpt-3.5-turbo',
      'Anthropic/Claude-3 Opus': 'claude-3-opus',
      'Anthropic/Claude-3 Sonnet': 'claude-3-sonnet',
      'Anthropic/Claude-3 Haiku': 'claude-3-haiku',
      'Google/Gemini Pro': 'gemini-pro',
      'Meta/Llama 3.1': 'llama-3.1',
      'DeepSeek/DeepSeek V2': 'deepseek-v2'
    }
    
    return modelMap[`${provider}/${model}`] || 'gpt-4o-mini'
  }

  // Real-time Communication
  static async subscribeToAgentUpdates(callback: (data: any) => void): Promise<() => void> {
    return await blink.realtime.subscribe('agent-updates', callback)
  }

  static async publishAgentUpdate(agentId: string, data: any): Promise<void> {
    await blink.realtime.publish('agent-updates', 'agent-status', {
      agentId,
      ...data,
      timestamp: new Date().toISOString()
    })
  }
}