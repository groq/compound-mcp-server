import { createMcpHandler } from '@vercel/mcp-adapter';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { realtimeTool, replTool } from '@/server';

const handler = createMcpHandler((adapterServer: McpServer) => {
    // Register tools from your existing server.ts on the server instance provided by the adapter
    adapterServer.tool(realtimeTool.name, realtimeTool.description, realtimeTool.schema, realtimeTool.handler);
    adapterServer.tool(replTool.name, replTool.description, replTool.schema, replTool.handler);
  }, undefined, {
    // AdapterConfig
    redisUrl: process.env.REDIS_URL,
    basePath: '/api/mcp', // This means your MCP endpoints will be /api/mcp/sse, /api/mcp/mcp, etc.
    verboseLogs: process.env.NODE_ENV === 'development', // Enable verbose logs in development
    maxDuration: 180, // Vercel Pro/Enterprise can go up to 300-900s for functions with Fluid enabled
  }
);

export { handler as GET, handler as POST, handler as OPTIONS }; // Add OPTIONS for CORS preflight if needed by clients