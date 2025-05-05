import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import Groq from "groq-sdk";

const ModelEnum = z.enum(["compound-beta", "compound-beta-mini"]);
const ModeEnum = z.enum(["minimal", "verbose"]);

// Define Tool Schemas
export const realtimeToolArgsSchema = z.object({
  question: z.string().describe("The question to ask the model, especially if it requires real-time information (e.g., current news, recent events)."),
  model: ModelEnum.optional()
    .default("compound-beta")
    .describe("The model to use (compound-beta or compound-beta-mini). Defaults to compound-beta. Use compound-beta-mini for quick answers."),
  mode: ModeEnum.optional().default("minimal").describe("Response mode ('minimal' or 'verbose'). Defaults to 'minimal'. 'verbose' includes executed tools in the response. This is very verbose and should only be used when the user asks for it or when the user query cannot be answered without it (always first try without it)."),
  include_domains: z.array(z.string()).optional().describe("List of domains to specifically include in the search."),
  exclude_domains: z.array(z.string()).optional().describe("List of domains to exclude from the search."),
});

export const replToolArgsSchema = z.object({
    question: z.string().describe("The question to ask the model, especially one that benefits from Python REPL interaction (e.g., for intermediate calculations or code execution)."),
    model: ModelEnum.optional()
      .default("compound-beta")
      .describe("The model to use (compound-beta or compound-beta-mini). Defaults to compound-beta. Use compound-beta-mini for quick answers."),
    mode: ModeEnum.optional().default("minimal").describe("Response mode ('minimal' or 'verbose'). Defaults to 'minimal'. 'verbose' includes executed tools in the response. This is very verbose and should only be used when the user asks for it or when the user query cannot be answered without it (always first try without it)."),
    include_domains: z.array(z.string()).optional().describe("List of domains to specifically include in the search."),
    exclude_domains: z.array(z.string()).optional().describe("List of domains to exclude from the search."),
  });

// Type alias for the arguments
type ToolArgs = z.infer<typeof realtimeToolArgsSchema> | z.infer<typeof replToolArgsSchema>;

// Helper function to execute Groq chat completion
async function executeGroqQuery(args: ToolArgs) {
  // Initialize Groq client lazily
  const groq = new Groq();
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: args.question,
        },
      ],
      model: args.model,
      // Add include_domains and exclude_domains if they exist in args
      ...(args.include_domains && { include_domains: args.include_domains }),
      ...(args.exclude_domains && { exclude_domains: args.exclude_domains }),
    });

    const choice = chatCompletion.choices[0]?.message;
    const responseTextContent = choice?.content || "No response from model.";
    let finalResponseText = responseTextContent;

    // Check if verbose flag is true
    if ('mode' in args && args.mode === 'verbose') {
      // Use the logic to get executed_tools
      const executedTools = (choice as any)?.executed_tools ?? null;
      const responsePayload = {
          answer: responseTextContent,
          executed_tools: executedTools
      };
      finalResponseText = JSON.stringify(responsePayload, null, 2); // Pretty print JSON
    }

    return {
      content: [
        {
          type: "text" as const,
          text: finalResponseText, // Use the potentially modified response text
        },
      ],
    };
  } catch (error) {
    console.error("Error executing Groq query:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to get response from Groq: ${errorMessage}`,
        },
      ],
    };
  }
}

// --- Exportable Tool Definitions ---
export const realtimeTool = {
  name: "ask_with_realtime_information",
  description: "Ask a question requiring real-time information (e.g., news, current events) using a Groq model.",
  schema: realtimeToolArgsSchema.shape,
  handler: executeGroqQuery,
};

export const replTool = {
  name: "ask_with_code_execution",
  description: "Ask questions that benefit from Python REPL interaction (e.g., for intermediate calculations or code execution).",
  schema: replToolArgsSchema.shape,
  handler: executeGroqQuery,
};
// ----------------------------------

// Create MCP server instance
export const server = new McpServer({
  name: "groq-interaction",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register tools using the exported definitions
server.tool(realtimeTool.name, realtimeTool.description, realtimeTool.schema, realtimeTool.handler);
server.tool(replTool.name, replTool.description, replTool.schema, replTool.handler);
