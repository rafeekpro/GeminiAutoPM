# GeminiAutoPM - Intelligent Project Management Framework

You are working with **GeminiAutoPM**, an intelligent project management framework built on the Model Context Protocol (MCP). This extension provides AI-powered agent tools for code analysis, testing, DevOps automation, and agile project management.

## Available Agent Tools

### 🔍 code_analyzer
**Deep-dive code analysis for bugs, security, and optimization**

Use this tool when you need to:
- Detect bugs and trace logic flows across multiple files
- Scan for security vulnerabilities and anti-patterns
- Identify performance bottlenecks
- Assess code quality and maintainability

**Example usage:**
```
Use the code_analyzer tool to review the authentication module for security vulnerabilities
```

**Context7 Documentation:**
- Query `mcp://context7/security/code-analysis` for security analysis best practices
- Query `mcp://context7/security/vulnerability-scanning` for vulnerability patterns
- Query `mcp://context7/code-quality/static-analysis` for quality assessment standards

### 🧪 test_runner
**Execute tests with comprehensive failure analysis**

Use this tool when you need to:
- Run test suites and analyze failures
- Assess test coverage and identify gaps
- Benchmark test performance
- Detect regressions and provide fix suggestions

**Example usage:**
```
Use the test_runner tool to execute all unit tests and analyze any failures
```

**Context7 Documentation:**
- Query `mcp://context7/testing/test-frameworks` for framework-specific patterns
- Query `mcp://context7/testing/jest` for Jest best practices
- Query `mcp://context7/testing/test-analysis` for failure analysis techniques

### 🤖 agent_manager
**Create and manage MCP tools and agent definitions**

Use this tool when you need to:
- Create new MCP tools following best practices
- Analyze and optimize existing tools
- Validate tool definitions and schemas
- Generate tool documentation

**Example usage:**
```
Use the agent_manager tool to create a new MCP tool for GraphQL API development
```

**Context7 Documentation:**
- Query `mcp://context7/mcp/model-context-protocol` for MCP standards
- Query `mcp://context7/mcp/tool-development` for tool development patterns
- Query `mcp://context7/typescript/zod-validation` for input validation

## Framework Principles

### 1. Context7 Integration (MANDATORY)
**ALWAYS query Context7 documentation before implementing solutions:**
- Never rely solely on training data for technical specifics
- Verify API signatures and patterns against live documentation
- Apply current best practices and industry standards

**How to use Context7:**
1. Identify required documentation from tool descriptions above
2. Query Context7 using the MCP syntax: `mcp://context7/<library>/<topic>`
3. Apply learned patterns to your implementation
4. Validate approach against documentation

### 2. Test-Driven Development (TDD)
**All implementations must follow TDD methodology:**
1. Write tests FIRST before implementing functionality
2. Use appropriate testing framework (Jest, Mocha, Pytest)
3. Achieve comprehensive test coverage
4. Run tests before committing changes

### 3. Security First
**Security is a top priority:**
- Run code_analyzer with security scope before releases
- Follow OWASP and CWE security standards
- Validate all inputs and handle errors gracefully
- Never expose sensitive data in logs or outputs

### 4. Agent Tool Usage Patterns

**When to use which tool:**

- **code_analyzer**: Code reviews, security audits, pre-release validation, bug investigation
- **test_runner**: CI/CD pipelines, regression testing, coverage analysis, performance benchmarking
- **agent_manager**: Creating new tools, maintaining tool catalog, documentation generation

**Tool Invocation Best Practices:**
1. Provide clear, specific task descriptions
2. Specify scope to focus analysis
3. Include relevant file paths or patterns
4. Request actionable recommendations
5. Ask for code examples when appropriate

## Output Expectations

When using agent tools, expect:

- **Concise Summaries**: Brief overviews highlighting key findings
- **Specific References**: File:line locations for all issues
- **Actionable Recommendations**: Concrete steps with code examples
- **Prioritization**: Issues ranked by severity/impact
- **Context7 Validation**: Verification against current best practices

## Development Workflow

### For Code Changes:
1. **Before implementation**: Query Context7 for relevant documentation
2. **Write tests**: Follow TDD - tests first, then implementation
3. **Implement**: Write code following best practices
4. **Analyze**: Use code_analyzer for quality and security checks
5. **Test**: Use test_runner to validate functionality
6. **Review**: Verify all tests pass and coverage is adequate

### For New Tools:
1. **Design**: Use agent_manager to design tool structure
2. **Query Context7**: Get latest MCP and framework documentation
3. **Implement**: Follow MCP SDK patterns with Zod validation
4. **Test**: Write comprehensive unit tests
5. **Document**: Include usage examples and Context7 queries
6. **Register**: Add to appropriate MCP server

## Best Practices

1. **Always use Context7** before implementing technical solutions
2. **Follow TDD** for all code changes
3. **Prioritize security** in code analysis and implementation
4. **Provide context** when invoking agent tools
5. **Request specifics** - ask for file:line references and code examples
6. **Validate results** against documentation and standards
7. **Test thoroughly** before considering work complete

## Error Handling

If an agent tool fails:
1. Check the error message for specific issues
2. Verify input parameters match expected schema
3. Ensure required files/paths exist
4. Check MCP server logs for detailed diagnostics
5. Consult tool documentation for usage examples

## Getting Help

- **Tool capabilities**: Review individual tool descriptions above
- **MCP documentation**: Query `mcp://context7/mcp/model-context-protocol`
- **Framework patterns**: Query Context7 for specific technologies
- **Best practices**: Each tool includes recommended Context7 queries

---

**Remember**: This extension is designed to make you more productive by providing expert AI assistance. Use the tools proactively, query Context7 frequently, and always follow TDD and security best practices.
