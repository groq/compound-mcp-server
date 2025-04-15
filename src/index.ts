import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Groq from "groq-sdk";
import { fileURLToPath } from 'url';

// Do not initialize Groq client here immediately
// const groq = new Groq();

const ModelEnum = z.enum(["compound-beta", "compound-beta-mini"]);

// Define Tool Schemas
export const realtimeToolArgsSchema = z.object({
  question: z.string().describe("The question to ask the model, especially if it requires real-time information (e.g., current news, recent events)."),
  model: ModelEnum.optional()
    .default("compound-beta")
    .describe("The model to use (compound-beta or compound-beta-mini). Defaults to compound-beta. Use compound-beta-mini for quick answers."),
  verbose: z.boolean().optional().default(false).describe("If true, includes executed tools in the response. This is very verbose and should only be used when the user asks for it or when the user query cannot be answered without it (always first try without it)."),
});

export const replToolArgsSchema = z.object({
    question: z.string().describe("The question to ask the model, especially one that benefits from Python REPL interaction (e.g., for intermediate calculations or code execution)."),
    model: ModelEnum.optional()
      .default("compound-beta")
      .describe("The model to use (compound-beta or compound-beta-mini). Defaults to compound-beta. Use compound-beta-mini for quick answers."),
    verbose: z.boolean().optional().default(false).describe("If true, includes executed tools in the response. This is very verbose and should only be used when the user asks for it or when the user query cannot be answered without it (always first try without it)."),
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
      model: args.model
    });

    const choice = chatCompletion.choices[0]?.message;
    const responseTextContent = choice?.content || "No response from model.";
    let finalResponseText = responseTextContent;

    // Check if verbose flag is true
    if ('verbose' in args && args.verbose) {
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

// Main function to run the server
export async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Groq MCP Server running on stdio");
}

// Only run main if the script is executed directly
if (import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
} 