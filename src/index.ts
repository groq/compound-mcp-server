#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";

// Main function to run the server
export async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Groq MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});