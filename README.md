# GeminiAutoPM

**Intelligent Project Management Framework for Gemini CLI**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![MCP](https://img.shields.io/badge/MCP-1.0-blue)](https://modelcontextprotocol.io)

GeminiAutoPM is a powerful Gemini CLI extension that provides AI-powered agent tools for code analysis, test execution, DevOps automation, and agile project management. Built on the Model Context Protocol (MCP), it brings intelligent automation to your development workflow.

## ✨ Features

### 🔍 Code Analyzer
- **Bug Detection**: Trace logic flows and identify potential bugs
- **Security Scanning**: Detect vulnerabilities and security anti-patterns
- **Performance Analysis**: Identify bottlenecks and optimization opportunities
- **Code Quality**: Assess maintainability and best practices adherence

### 🧪 Test Runner
- **Test Execution**: Run tests with any framework (Jest, Mocha, Pytest, etc.)
- **Failure Analysis**: Deep-dive into test failures with root cause analysis
- **Coverage Assessment**: Identify test coverage gaps
- **Regression Detection**: Compare results with baseline metrics

### 🤖 Agent Manager
- **Tool Creation**: Scaffold new MCP tools following best practices
- **Registry Management**: Maintain consistent tool catalog
- **Validation**: Ensure tools follow MCP standards
- **Documentation**: Generate comprehensive docs with examples

## 🚀 Quick Start

### Installation

```bash
# Install the extension
gemini extensions install rafeekpro/GeminiAutoPM

# Verify installation
gemini extensions list
```

### Basic Usage

Once installed, the tools are automatically available in Gemini CLI:

```bash
# Start Gemini CLI
gemini

# Use the tools in natural language
> Use the code_analyzer tool to review my authentication module for security issues

> Use the test_runner tool to execute all unit tests and analyze failures

> Use the agent_manager tool to create a new MCP tool for GraphQL development
```

## 📖 Documentation

### Agent Tools

#### code_analyzer

Performs deep code analysis for bugs, security vulnerabilities, and optimization opportunities.

**Parameters:**
- `task` (required): The code analysis task to perform
- `scope` (optional): Analysis focus (security, performance, bugs)
- `files` (optional): Specific files to analyze

**Example:**
```
Use code_analyzer to scan the src/auth directory for security vulnerabilities
```

**Context7 Queries:**
- `mcp://context7/security/code-analysis`
- `mcp://context7/security/vulnerability-scanning`
- `mcp://context7/code-quality/static-analysis`

#### test_runner

Executes tests and provides comprehensive failure analysis.

**Parameters:**
- `task` (required): The test execution task
- `scope` (optional): Test type (unit, integration, e2e)
- `testPattern` (optional): Test file pattern
- `framework` (optional): Test framework (jest, mocha, pytest)

**Example:**
```
Use test_runner to run all integration tests and analyze any failures
```

**Context7 Queries:**
- `mcp://context7/testing/test-frameworks`
- `mcp://context7/testing/jest`
- `mcp://context7/testing/test-analysis`

#### agent_manager

Creates and manages MCP tools and agent definitions.

**Parameters:**
- `task` (required): Management task (create, analyze, update)
- `scope` (optional): Management scope
- `agentType` (optional): Type of agent/tool
- `capabilities` (optional): Required capabilities

**Example:**
```
Use agent_manager to create a new tool for Docker containerization
```

**Context7 Queries:**
- `mcp://context7/mcp/model-context-protocol`
- `mcp://context7/mcp/tool-development`
- `mcp://context7/typescript/zod-validation`

## 🏗️ Architecture

### MCP Server Structure

```
GeminiAutoPM/
├── src/
│   ├── agents/              # Agent implementations
│   │   ├── code-analyzer.ts
│   │   ├── test-runner.ts
│   │   └── agent-manager.ts
│   ├── types/               # TypeScript types
│   │   └── agent.ts
│   └── agents-server.ts     # Main MCP server
├── gemini-extension.json    # Extension manifest
├── GEMINI.md               # Persistent context
└── package.json
```

### How It Works

1. **Extension Loading**: Gemini CLI loads the extension and reads `GEMINI.md`
2. **MCP Server Start**: The `agents-server.ts` starts via stdio transport
3. **Tool Registration**: Three tools are registered with the MCP server
4. **Tool Invocation**: Gemini model can invoke tools based on user requests
5. **Result Processing**: Tool results are returned as structured content

## 🔧 Development

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Gemini CLI installed

### Setup

```bash
# Clone the repository
git clone https://github.com/rafeekpro/GeminiAutoPM.git
cd GeminiAutoPM

# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
gemini extensions link .
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Project Commands

```bash
npm run build          # Compile TypeScript to JavaScript
npm run dev            # Watch mode for development
npm test              # Run Jest tests
npm run test:coverage # Generate coverage report
```

## 📝 Framework Principles

### 1. Context7 Integration (MANDATORY)

**Always query Context7 documentation before implementing:**
- Verify API signatures against live documentation
- Apply current best practices
- Follow industry standards

### 2. Test-Driven Development (TDD)

**All code follows TDD:**
1. Write tests FIRST
2. Implement functionality
3. Refactor while keeping tests green
4. Achieve comprehensive coverage

### 3. Security First

**Security is paramount:**
- Use `code_analyzer` with security scope before releases
- Follow OWASP and CWE standards
- Validate all inputs
- Handle errors gracefully

## 🛠️ Configuration

### Extension Manifest (gemini-extension.json)

```json
{
  "name": "gemini-autopm",
  "version": "0.1.0",
  "contextFileName": "GEMINI.md",
  "mcpServers": {
    "autopm-agents": {
      "command": "node",
      "args": ["${extensionPath}/dist/agents-server.js"],
      "cwd": "${extensionPath}"
    }
  }
}
```

### User Settings (~/.gemini/settings.json)

The extension is automatically configured. No manual settings required.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TDD - write tests first
4. Ensure all tests pass (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use Zod for input validation
- Include Context7 documentation queries
- Write comprehensive tests (80%+ coverage)
- Add usage examples to tool descriptions
- Update documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built on [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
- Powered by [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- Inspired by [ClaudeAutoPM](https://github.com/rafeekpro/ClaudeAutoPM)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/rafeekpro/GeminiAutoPM/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rafeekpro/GeminiAutoPM/discussions)
- **Documentation**: [Wiki](https://github.com/rafeekpro/GeminiAutoPM/wiki)

## 🗺️ Roadmap

### Phase 1: Core Foundation (Current)
- ✅ MCP server with 3 core agent tools
- ✅ Basic documentation and examples
- ✅ Initial test coverage

### Phase 2: Expanded Capabilities
- [ ] Add 10 more specialized agent tools
- [ ] Project management prompts (epic decomposition, task breakdown)
- [ ] DevOps automation tools
- [ ] Enhanced test analysis features

### Phase 3: Advanced Features
- [ ] Multi-server architecture
- [ ] Custom command definitions (TOML)
- [ ] Advanced Context7 integration
- [ ] Docker sandbox support
- [ ] CI/CD integration examples

### Phase 4: Enterprise Features
- [ ] Tool allowlisting and security controls
- [ ] Performance optimization
- [ ] Multi-project support
- [ ] Advanced analytics and reporting

## 🌟 Star History

If you find GeminiAutoPM useful, please consider giving it a star on GitHub!

---

**Made with ❤️ for the Gemini CLI community**
