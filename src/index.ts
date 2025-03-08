#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';

const API_TOKEN = process.env.API_TOKEN;

const server = new Server(
  {
    name: 'handwriting-ocr',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.onerror = (error) => console.error('[MCP Error]', error);
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'upload_document',
      description: 'Upload a document to Handwriting OCR API for transcription',
      inputSchema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            description: 'Path to the document (PDF, JPG, PNG, etc.)',
          },
          delete_after: {
            type: 'integer',
            description: 'Seconds until auto-deletion (optional)',
          },
          extractor_id: {
            type: 'string',
            description: 'Extractor ID (required if action is extractor, will be ignored)',
          },
          prompt_id: {
            type: 'string',
            description: 'Prompt ID (requires Enterprise subscription, will be ignored)',
          },
        },
        required: ['file'],
      },
    },
    {
      name: 'check_status',
      description: 'Check the status of a document',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Document ID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'get_text',
      description: 'Retrieve the transcribed text from a document',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Document ID',
          },
        },
        required: ['id'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!API_TOKEN) {
    throw new Error('API_TOKEN environment variable is required');
  }

  switch (request.params.name) {
    case 'upload_document': {
      interface FileObject {
        data: any;
        name: string;
      }

      const file = request.params.arguments?.file as string | FileObject;
      if (!file) {
        throw new Error('File is required');
      }

      let fileData: Buffer;
      let fileName: string;

      if (typeof file === 'string') {
        // File path provided
        const filePath = file;
        fileData = fs.readFileSync(filePath);
        fileName = filePath.split('/').pop() || 'document';
      } else {
        // File object (attachment data) provided
        fileData = Buffer.from(file.data);
        fileName = file.name;
      }

      const formData = new FormData();
      formData.append('file', fileData, fileName);
      formData.append('action', 'transcribe');

      const deleteAfter = request.params.arguments?.delete_after;
      if (deleteAfter) {
        formData.append('delete_after', String(deleteAfter));
      }

      try {
        const response = await axios.post(
          'https://www.handwritingocr.com/api/v3/documents',
          formData,
          {
            headers: {
              'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
              Authorization: `Bearer ${API_TOKEN}`,
              Accept: 'application/json',
            },
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: response.data.id,
                status: response.data.status,
              }),
            },
          ],
        };
      } catch (error: any) {
        console.error('[API Error]', error);
        throw new Error(`Handwriting OCR API error: ${error.message}`);
      }
    }
    case 'check_status': {
      const documentId = String(request.params.arguments?.id);
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      try {
        const response = await axios.get(
          `https://www.handwritingocr.com/api/v3/documents/${documentId}`,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              Accept: 'application/json',
            },
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: response.data.id,
                file_name: response.data.file_name,
                action: response.data.action,
                page_count: response.data.page_count,
                status: response.data.status,
                created_at: response.data.created_at,
                updated_at: response.data.updated_at,
              }),
            },
          ],
        };
      } catch (error: any) {
        console.error('[API Error]', error);
        throw new Error(`Handwriting OCR API error: ${error.message}`);
      }
    }
    case 'get_text': {
      const documentId = String(request.params.arguments?.id);
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      try {
        const response = await axios.get(
          `https://www.handwritingocr.com/api/v3/documents/${documentId}.txt`,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              Accept: 'text/plain',
            },
            responseType: 'text',
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: response.data,
            },
          ],
        };
      } catch (error: any) {
        console.error('[API Error]', error);
        throw new Error(`Handwriting OCR API error: ${error.message}`);
      }
    }
    default:
      throw new Error('Unknown tool');
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Handwriting OCR MCP server running on stdio');
}

main().catch(console.error);
