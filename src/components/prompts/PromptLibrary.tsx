import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Copy, Edit, Star } from 'lucide-react'

const prompts = [
  {
    id: 1,
    title: 'Code Review Assistant',
    description: 'Comprehensive code review with security and performance analysis',
    category: 'Development',
    tags: ['code', 'review', 'security'],
    usage: 247,
    rating: 4.8
  },
  {
    id: 2,
    title: 'Content Generator',
    description: 'Generate engaging blog posts and marketing content',
    category: 'Marketing',
    tags: ['content', 'blog', 'marketing'],
    usage: 189,
    rating: 4.6
  },
  {
    id: 3,
    title: 'Data Analysis Expert',
    description: 'Analyze datasets and provide insights with visualizations',
    category: 'Analytics',
    tags: ['data', 'analysis', 'insights'],
    usage: 156,
    rating: 4.9
  }
]

export function PromptLibrary() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyber-text font-mono">
            Prompt Library
          </h1>
          <p className="text-cyber-muted mt-1">
            Centralized prompt management and templates
          </p>
        </div>
        <Button className="bg-cyber-primary hover:bg-cyber-primary/80 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Prompt
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <input
            type="text"
            placeholder="Search prompts..."
            className="w-full pl-10 pr-4 py-2 bg-cyber-surface border border-cyber-border rounded-lg text-cyber-text placeholder-cyber-muted focus:border-cyber-primary focus:outline-none"
          />
        </div>
        <div className="flex space-x-2">
          {['All', 'Development', 'Marketing', 'Analytics'].map((category) => (
            <Badge key={category} variant="outline" className="cursor-pointer hover:bg-cyber-primary/20">
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="glass border-cyber-border/50 hover:border-cyber-primary/50 transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-cyber-text font-mono text-lg">
                    {prompt.title}
                  </CardTitle>
                  <Badge variant="outline" className="mt-2">
                    {prompt.category}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-mono">{prompt.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-cyber-muted text-sm mb-4">
                {prompt.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-cyber-muted font-mono">
                  {prompt.usage} uses
                </span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}