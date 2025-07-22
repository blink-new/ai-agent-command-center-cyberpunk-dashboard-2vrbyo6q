import { useState } from 'react'
import { 
  Command, 
  Cpu, 
  Workflow, 
  Users,
  FileText, 
  MessageSquare, 
  Rocket, 
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigation = [
  { id: 'dashboard', name: 'Command Center', icon: Command },
  { id: 'agents', name: 'Agent Management', icon: Cpu },
  { id: 'workflows', name: 'Workflow Builder', icon: Workflow },
  { id: 'swarms', name: 'Swarm Management', icon: Users },
  { id: 'prompts', name: 'Prompt Library', icon: FileText },
  { id: 'communication', name: 'Inter-AI Comm', icon: MessageSquare },
  { id: 'deployment', name: 'Deployment', icon: Rocket },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "h-screen bg-cyber-surface border-r border-cyber-border transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-cyber-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-cyber-accent animate-pulse-neon" />
              <span className="font-mono text-lg font-bold text-cyber-text">
                AI Command
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-cyber-border transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-cyber-muted" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-cyber-muted" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-cyber-border/50",
                  isActive && "bg-cyber-primary/20 text-cyber-accent border border-cyber-primary/30 neon-blue",
                  !isActive && "text-cyber-muted hover:text-cyber-text"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-cyber-accent",
                  collapsed ? "mx-auto" : "mr-3"
                )} />
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Status Indicator */}
      <div className="p-4 border-t border-cyber-border">
        <div className={cn(
          "flex items-center space-x-2",
          collapsed && "justify-center"
        )}>
          <div className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse" />
          {!collapsed && (
            <span className="text-xs text-cyber-muted font-mono">
              SYSTEM ONLINE
            </span>
          )}
        </div>
      </div>
    </div>
  )
}