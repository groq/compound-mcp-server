# groq-compound-mcp-server

Provides a Model Context Protocol (MCP) server for interacting with Groq models, including compound/meta models.

This server exposes the following tools:
*   `ask_with_realtime_information`
*   `ask_with_code_execution`

## Prerequisites

*   Node.js >= 18.0.0
*   A Groq API key set in the `GROQ_API_KEY` environment variable.

## Installation

```bash
npm install groq-compound-mcp-server
```

## Usage

This server follows the standard MCP server pattern using stdio for transport. It's designed to be run by an MCP client (like Claude Desktop or a custom client).

Refer to the official [MCP Quickstart for Server Developers](https://docs.modelcontext.dev/get-started/quickstart-server-developers) for instructions on setting up and connecting MCP servers.

When configuring your client, use the command `npx groq-compound-mcp-server` or `groq-compound-mcp-server` (if installed globally) to run this server.

## License

[MIT](LICENSE) 
