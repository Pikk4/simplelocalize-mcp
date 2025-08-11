# @p1kka/simplelocalize

A Model Context Protocol (MCP) server for SimpleLocalize integration, enabling AI assistants to interact with translation and localization workflows.

## Features

- **Translation Management**: Access and manage translation keys and values
- **Language Support**: Work with multiple languages and locales
- **Project Integration**: Connect to SimpleLocalize projects via API
- **MCP Compliance**: Full Model Context Protocol implementation

## Installation

```bash
npm install @p1kka/simplelocalize
```

## Usage

### As a CLI tool

```bash
npx @p1kka/simplelocalize
```

### As an MCP server

This package can be used as an MCP server in AI assistant applications that support the Model Context Protocol.

## Configuration

The MCP server requires SimpleLocalize API credentials to function. Configure your environment with:

```bash
export SIMPLELOCALIZE_API_KEY="your-api-key"
export SIMPLELOCALIZE_PROJECT_ID="your-project-id"
```

## MCP Server Configuration

To use this package as an MCP server in your AI assistant application, you need to configure it in your MCP client settings.

### Basic Configuration

Add the following configuration to your MCP client's configuration file:

```json
{
  "mcpServers": {
    "simplelocalize": {
      "command": "npx",
      "args": ["@p1kka/simplelocalize"],
      "env": {
        "SIMPLELOCALIZE_API_KEY": "your-api-key-here",
        "SIMPLELOCALIZE_PROJECT_ID": "your-project-id-here"
      }
    }
  }
}
```

### Configuration Options

- **command**: The command to run the MCP server (typically `npx`)
- **args**: Array of arguments for the command (the package name)
- **env**: Environment variables required by the server
  - `SIMPLELOCALIZE_API_KEY`: Your SimpleLocalize API key
  - `SIMPLELOCALIZE_PROJECT_ID`: Your SimpleLocalize project ID


## API Reference

### Functions

- `getTranslationKeys()` - Retrieve all translation keys from the project
- `getTranslations(language)` - Get translations for a specific language
- `updateTranslation(key, language, value)` - Update a translation value
- `addTranslationKey(key, translations)` - Add a new translation key

## Development

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm package manager

### Setup

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run in development mode
pnpm dev
```

### Scripts

- `pnpm build` - Build the TypeScript project
- `pnpm dev` - Run in development mode with hot reload
- `pnpm start` - Run the built application
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## License

ISC

## Author

Jose Giovanni Vargas Rueda

## Repository

- GitHub: [p1kka/simplelocalize-mcp](https://github.com/p1kka/simplelocalize-mcp)
- Issues: [GitHub Issues](https://github.com/p1kka/simplelocalize-mcp/issues)
