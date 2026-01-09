// Agent Card types and Muse agent definition

export interface AgentCard {
  protocolVersion?: string
  name: string
  description: string
  version: string
  provider?: AgentProvider
  supportedInterfaces?: AgentInterface[]
  capabilities?: AgentCapabilities
  securitySchemes?: Record<string, SecurityScheme>
  defaultInputModes?: string[]
  defaultOutputModes?: string[]
  skills?: AgentSkill[]
  supportsExtendedAgentCard?: boolean
}

export interface AgentProvider {
  organization: string
  url?: string
}

export interface AgentInterface {
  protocol: string
  url: string
}

export interface AgentCapabilities {
  streaming?: boolean
  pushNotifications?: boolean
  extensions?: string[]
}

export interface SecurityScheme {
  type: string
  description?: string
}

export interface AgentSkill {
  id: string
  name: string
  description: string
  inputSchema?: JsonSchema
  outputSchema?: JsonSchema
  tags?: string[]
}

export interface JsonSchema {
  type: string
  properties?: Record<string, JsonSchema>
  required?: string[]
  items?: JsonSchema
  description?: string
}

// Muse Site Generator agent card
export function createMuseAgentCard(baseUrl: string): AgentCard {
  return {
    protocolVersion: "0.3",
    name: "Muse Site Generator",
    description: "Generate landing pages and multi-page websites from text prompts",
    version: "1.0.0",
    provider: {
      organization: "Muse",
    },
    supportedInterfaces: [
      {
        protocol: "https",
        url: `${baseUrl}/a2a`,
      },
    ],
    capabilities: {
      streaming: true,
      pushNotifications: false,
    },
    defaultInputModes: ["text/plain", "application/json"],
    defaultOutputModes: ["application/json"],
    skills: [
      {
        id: "generate_landing",
        name: "Generate Landing Page",
        description: "Create a single-page website from a text prompt",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "Description of the landing page to generate",
            },
          },
          required: ["prompt"],
        },
        tags: ["generation", "landing-page"],
      },
      {
        id: "generate_site",
        name: "Generate Multi-Page Site",
        description: "Create a full website with multiple pages and navigation",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "Description of the website to generate",
            },
          },
          required: ["prompt"],
        },
        tags: ["generation", "multi-page"],
      },
      {
        id: "refine",
        name: "Refine Site",
        description: "Edit, add, remove, or reorder sections on an existing site",
        inputSchema: {
          type: "object",
          properties: {
            instruction: {
              type: "string",
              description: "What changes to make to the site",
            },
            siteContext: {
              type: "object",
              description: "Current state of the site being refined",
            },
          },
          required: ["instruction", "siteContext"],
        },
        tags: ["refinement", "editing"],
      },
    ],
  };
}
