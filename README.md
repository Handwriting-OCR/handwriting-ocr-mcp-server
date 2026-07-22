# Handwriting OCR MCP Server
[![smithery badge](https://smithery.ai/badge/@Handwriting-OCR/handwriting-ocr-mcp-server)](https://smithery.ai/server/@Handwriting-OCR/handwriting-ocr-mcp-server)

A Model Context Protocol (MCP) Server for [Handwriting OCR](https://www.handwritingocr.com).

## ⭐ Recommended: use the hosted (remote) MCP server

You no longer need to run this local server. Handwriting OCR now offers a **hosted MCP server** you connect to directly — **no Node.js install, no build step, and no copying an API token.**

- **Endpoint:** `https://mcp.handwritingocr.com`
- **Auth:** OAuth — your MCP client opens a sign-in and consent page in your browser; there's no token to copy or store.
- **More capabilities than this local server:** submit documents, check status, retrieve results, **export to Word / Excel / JSON**, and use **extractors** for structured field extraction. It also ships a built-in usage guide so your assistant knows what the service does and how to get good results.

Add it to any client that supports remote MCP servers. For example, in Claude Desktop's config:

```json
{
    "mcpServers": {
        "handwriting-ocr": {
            "url": "https://mcp.handwritingocr.com"
        }
    }
}
```

> The exact way to add a remote server varies by client (some have a "Connectors" UI, some need `"type": "http"`, and stdio-only clients can bridge via the [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) proxy). See your client's remote-MCP documentation.

The local server documented below still works and can be useful for self-hosted or offline setups, but the hosted server is easier and preferred.

---

## Self-hosted (local) server

The rest of this document covers running the local Node.js server, which talks to the [Handwriting OCR API](https://www.handwritingocr.com/api/docs) using an API token.

## Overview

The Handwriting OCR MCP Server enables integration between MCP clients and the Handwriting OCR service. This document outlines the setup process and provides a basic example of using the client.

This server allows you to upload images and PDF documents, check their status, and retrieve the OCR result as Markdown.

## Tools

### Transcription

*   Upload Document
*   Check Status
*   Get Text

## Prerequisites

Before you begin, ensure you have the following:

*   Node.js installed on your system (recommended version 18.x or higher).
*   An active account on the [Handwriting OCR Platform](https://www.handwritingocr.com) and an active [API token](https://www.handwritingocr.com/settings/api).

## Installation

### Installing via Smithery

To install handwriting-ocr-mcp-server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@Handwriting-OCR/handwriting-ocr-mcp-server):

```bash
npx -y @smithery/cli install @Handwriting-OCR/handwriting-ocr-mcp-server --client claude
```

### Installing manually for Claude Desktop

To use the Handwriting OCR MCP Server in Claude Desktop application, use:

```json
{
    "mcpServers": {
        "handwriting-ocr": {
            "command": "node",
            "args": [
                "/Users/mateo/Local/Code/MCP/handwriting-ocr/build/index.js"
            ],
            "env": {
                "API_TOKEN": "your-api-token",
            },
            "disabled": false,
            "autoApprove": []
        }
    }
}
```

## Configuration

The Handwriting OCR MCP Server supports environment variables to be set for authentication and configuration:

*   `API_TOKEN`: Your API token.

You can find these values in the API settings dashboard on the [Handwriting OCR Platform](https://www.handwritingocr.com).

## Support

Please refer to the [Handwriting OCR API Documentation](https://www.handwritingocr.com/api/docs).

For support with the Handwriting OCR MCP Server, please submit a [GitHub Issue](https://github.com/modelcontextprotocol/servers/issues).

## About

Model Context Protocol (MCP) Server for Handwriting OCR Platform
