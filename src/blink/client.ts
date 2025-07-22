import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'ai-agent-command-center-cyberpunk-dashboard-2vrbyo6q',
  authRequired: true
})

// Export types for better TypeScript support
export type BlinkClient = typeof blink