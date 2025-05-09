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

Refer to the official [MCP Quickstart for Server Developers](https://modelcontextprotocol.io/quickstart/server) for instructions on setting up and connecting MCP servers.

When configuring your client, use the command `npx groq-compound-mcp-server` or `groq-compound-mcp-server` (if installed globally) to run this server.

Here's an example of how you might configure an MCP client (e.g., in a `settings.json` file) to launch this server:

```json
{
  "mcpServers": {
    "groq-compound": {
      "command": "npx",
      "args": [
        "-y",
        "groq-compound-mcp-server"
      ],
      "env": {
        "GROQ_API_KEY": "YOUR_GROQ_API_KEY_HERE"
      }
    }
  }
}
```

## Hosting on Vercel

This server can also be deployed to Vercel.

1.  **Prerequisites**:
    *   Ensure you have a Vercel account.
    *   Connect your Git repository to Vercel.

2.  **Environment Variables**:
    Set the following environment variables in your Vercel project settings:
    *   `GROQ_API_KEY`: Your Groq API key.
    *   `REDIS_URL`: (Recommended for SSE transport) The connection URL for a Redis instance (e.g., from Vercel KV or Upstash).

3.  **Build Configuration**:
    Vercel should automatically detect it as a Next.js application. The build command `npm run build:vercel` (or `yarn build:vercel`/`pnpm build:vercel`) and the output directory (`.next`) will be used.

4.  **Accessing the MCP Server**:
    Once deployed, your MCP server endpoints will be available at `https://your-deployment-url.vercel.app/api/mcp`.
    For example, the SSE endpoint would be `https://your-deployment-url.vercel.app/api/mcp/sse`.

## Development with Vercel CLI

To run the Vercel deployment locally:

1.  Install Vercel CLI: `npm install -g vercel`
2.  Set up environment variables locally (e.g., in a `.env.local` file at the project root):
    ```
    GROQ_API_KEY=your_groq_api_key
    REDIS_URL=your_redis_url
    ```
3.  Run the development server: `vercel dev` or `npm run dev:vercel`.

## License

[MIT](LICENSE) 
