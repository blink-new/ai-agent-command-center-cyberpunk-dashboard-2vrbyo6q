import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { WorkflowTemplate } from '../../types/workflow'
import { 
  Bot, 
  Database, 
  GitBranch, 
  Globe, 
  Zap,
  FileText,
  BarChart3,
  MessageSquare,
  Image,
  Mail,
  ArrowRight,
  Star,
  Clock,
  Users
} from 'lucide-react'

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'content-generation',
    name: 'Content Generation Pipeline',
    description: 'Generate blog posts, articles, and marketing content using AI agents with automated review and publishing workflow.',
    category: 'content',
    thumbnail: '/templates/content-gen.png',
    tags: ['content', 'writing', 'marketing', 'automation'],
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 50, y: 100 },
        data: { label: 'Content Brief', input_schema: { topic: 'string', keywords: 'array', tone: 'string' } }
      },
      {
        id: 'agent-1',
        type: 'agent',
        position: { x: 300, y: 100 },
        data: { label: 'Content Writer', agent_id: 'gpt-4', config: { temperature: 0.7, max_tokens: 2000 } }
      },
      {
        id: 'agent-2',
        type: 'agent',
        position: { x: 550, y: 100 },
        data: { label: 'Content Reviewer', agent_id: 'claude-3', config: { temperature: 0.3 } }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 800, y: 100 },
        data: { label: 'Quality Check', condition: 'review_score > 8' }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1050, y: 50 },
        data: { label: 'Published Content' }
      },
      {
        id: 'agent-3',
        type: 'agent',
        position: { x: 1050, y: 150 },
        data: { label: 'Content Improver', agent_id: 'gpt-4' }
      }
    ],
    edges: [
      { id: 'e1', source: 'input-1', target: 'agent-1', type: 'default' },
      { id: 'e2', source: 'agent-1', target: 'agent-2', type: 'default' },
      { id: 'e3', source: 'agent-2', target: 'condition-1', type: 'default' },
      { id: 'e4', source: 'condition-1', target: 'output-1', type: 'conditional', condition: 'approved' },
      { id: 'e5', source: 'condition-1', target: 'agent-3', type: 'conditional', condition: 'needs_improvement' },
      { id: 'e6', source: 'agent-3', target: 'agent-2', type: 'default' }
    ]
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis & Insights',
    description: 'Automated data processing, analysis, and report generation with multiple AI agents for comprehensive insights.',
    category: 'data',
    thumbnail: '/templates/data-analysis.png',
    tags: ['data', 'analysis', 'reporting', 'insights'],
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 50, y: 100 },
        data: { label: 'Raw Data', input_schema: { data_source: 'string', format: 'string' } }
      },
      {
        id: 'transform-1',
        type: 'transform',
        position: { x: 300, y: 100 },
        data: { label: 'Data Cleaner', transform_script: '// Clean and normalize data\nreturn data.filter(item => item.valid)' }
      },
      {
        id: 'agent-1',
        type: 'agent',
        position: { x: 550, y: 50 },
        data: { label: 'Statistical Analyzer', agent_id: 'gpt-4' }
      },
      {
        id: 'agent-2',
        type: 'agent',
        position: { x: 550, y: 150 },
        data: { label: 'Trend Detector', agent_id: 'claude-3' }
      },
      {
        id: 'agent-3',
        type: 'agent',
        position: { x: 800, y: 100 },
        data: { label: 'Report Generator', agent_id: 'gemini-pro' }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1050, y: 100 },
        data: { label: 'Analysis Report' }
      }
    ],
    edges: [
      { id: 'e1', source: 'input-1', target: 'transform-1', type: 'default' },
      { id: 'e2', source: 'transform-1', target: 'agent-1', type: 'default' },
      { id: 'e3', source: 'transform-1', target: 'agent-2', type: 'default' },
      { id: 'e4', source: 'agent-1', target: 'agent-3', type: 'default' },
      { id: 'e5', source: 'agent-2', target: 'agent-3', type: 'default' },
      { id: 'e6', source: 'agent-3', target: 'output-1', type: 'default' }
    ]
  },
  {
    id: 'customer-support',
    name: 'AI Customer Support',
    description: 'Multi-tier customer support system with AI agents for ticket classification, response generation, and escalation handling.',
    category: 'automation',
    thumbnail: '/templates/customer-support.png',
    tags: ['support', 'customer', 'automation', 'classification'],
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 50, y: 100 },
        data: { label: 'Support Ticket', input_schema: { message: 'string', priority: 'string', customer_id: 'string' } }
      },
      {
        id: 'agent-1',
        type: 'agent',
        position: { x: 300, y: 100 },
        data: { label: 'Ticket Classifier', agent_id: 'gpt-4' }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 550, y: 100 },
        data: { label: 'Priority Check', condition: 'priority === "high" || category === "billing"' }
      },
      {
        id: 'agent-2',
        type: 'agent',
        position: { x: 800, y: 50 },
        data: { label: 'Auto Responder', agent_id: 'claude-3' }
      },
      {
        id: 'webhook-1',
        type: 'webhook',
        position: { x: 800, y: 150 },
        data: { label: 'Human Escalation', webhook_url: '/api/escalate-ticket' }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1050, y: 100 },
        data: { label: 'Response Sent' }
      }
    ],
    edges: [
      { id: 'e1', source: 'input-1', target: 'agent-1', type: 'default' },
      { id: 'e2', source: 'agent-1', target: 'condition-1', type: 'default' },
      { id: 'e3', source: 'condition-1', target: 'agent-2', type: 'conditional', condition: 'auto_handle' },
      { id: 'e4', source: 'condition-1', target: 'webhook-1', type: 'conditional', condition: 'escalate' },
      { id: 'e5', source: 'agent-2', target: 'output-1', type: 'default' },
      { id: 'e6', source: 'webhook-1', target: 'output-1', type: 'default' }
    ]
  },
  {
    id: 'social-media',
    name: 'Social Media Automation',
    description: 'Automated social media content creation, scheduling, and engagement monitoring across multiple platforms.',
    category: 'content',
    thumbnail: '/templates/social-media.png',
    tags: ['social', 'content', 'automation', 'marketing'],
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 50, y: 100 },
        data: { label: 'Content Ideas', input_schema: { topics: 'array', platforms: 'array', schedule: 'string' } }
      },
      {
        id: 'agent-1',
        type: 'agent',
        position: { x: 300, y: 100 },
        data: { label: 'Content Creator', agent_id: 'gpt-4' }
      },
      {
        id: 'agent-2',
        type: 'agent',
        position: { x: 550, y: 50 },
        data: { label: 'Image Generator', agent_id: 'dall-e-3' }
      },
      {
        id: 'agent-3',
        type: 'agent',
        position: { x: 550, y: 150 },
        data: { label: 'Hashtag Optimizer', agent_id: 'claude-3' }
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 800, y: 100 },
        data: { label: 'Social Scheduler', api_endpoint: '/api/schedule-post', api_method: 'POST' }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1050, y: 100 },
        data: { label: 'Posts Scheduled' }
      }
    ],
    edges: [
      { id: 'e1', source: 'input-1', target: 'agent-1', type: 'default' },
      { id: 'e2', source: 'agent-1', target: 'agent-2', type: 'default' },
      { id: 'e3', source: 'agent-1', target: 'agent-3', type: 'default' },
      { id: 'e4', source: 'agent-2', target: 'api-1', type: 'default' },
      { id: 'e5', source: 'agent-3', target: 'api-1', type: 'default' },
      { id: 'e6', source: 'api-1', target: 'output-1', type: 'default' }
    ]
  }
]

const CATEGORY_ICONS = {
  content: FileText,
  data: BarChart3,
  automation: Bot,
  analysis: Database,
  integration: Globe
}

interface WorkflowTemplatesProps {
  onTemplateSelect: (template: WorkflowTemplate) => void
}

export function WorkflowTemplates({ onTemplateSelect }: WorkflowTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)

  const categories = ['all', ...Array.from(new Set(WORKFLOW_TEMPLATES.map(t => t.category)))]
  
  const filteredTemplates = selectedCategory === 'all' 
    ? WORKFLOW_TEMPLATES 
    : WORKFLOW_TEMPLATES.filter(t => t.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyber-text font-mono">
            Workflow Templates
          </h2>
          <p className="text-cyber-muted mt-1">
            Pre-built workflows to get you started quickly
          </p>
        </div>
        <Badge variant="outline" className="text-cyber-accent">
          {filteredTemplates.length} templates
        </Badge>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map(category => {
          const isSelected = selectedCategory === category
          const Icon = category === 'all' ? Star : CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Bot
          
          return (
            <Button
              key={category}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 ${
                isSelected 
                  ? 'bg-cyber-primary/20 text-cyber-accent border border-cyber-primary/30' 
                  : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-border/50'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          )
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const CategoryIcon = CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS] || Bot
          const isHovered = hoveredTemplate === template.id
          
          return (
            <Card 
              key={template.id}
              className={`glass border-cyber-border/50 cursor-pointer transition-all duration-300 hover:border-cyber-primary/50 hover:shadow-lg hover:shadow-cyber-accent/10 ${
                isHovered ? 'scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              onClick={() => onTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyber-primary/10 rounded-lg border border-cyber-primary/30">
                      <CategoryIcon className="w-5 h-5 text-cyber-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-mono text-cyber-text">
                        {template.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-cyber-muted leading-relaxed">
                  {template.description}
                </p>
                
                {/* Template Stats */}
                <div className="flex items-center justify-between text-xs text-cyber-muted">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Bot className="w-3 h-3 mr-1" />
                      {template.nodes.filter(n => n.type === 'agent').length} agents
                    </span>
                    <span className="flex items-center">
                      <GitBranch className="w-3 h-3 mr-1" />
                      {template.nodes.length} nodes
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    ~5 min setup
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag}
                      className="text-xs px-2 py-1 bg-cyber-background/50 text-cyber-muted rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-cyber-background/50 text-cyber-muted rounded-full">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>
                
                {/* Use Template Button */}
                <Button 
                  className="w-full bg-cyber-primary/10 hover:bg-cyber-primary/20 text-cyber-accent border border-cyber-primary/30 group"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTemplateSelect(template)
                  }}
                >
                  Use Template
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-cyber-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-mono text-cyber-text mb-2">
            No templates found
          </h3>
          <p className="text-cyber-muted">
            Try selecting a different category or check back later for new templates.
          </p>
        </div>
      )}
    </div>
  )
}