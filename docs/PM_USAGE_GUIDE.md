# GeminiAutoPM - PM MCP Server Usage Guide

## Overview

GeminiAutoPM provides a comprehensive Project Management system through MCP (Model Context Protocol) tools. This guide shows you how to invoke and use these commands in Gemini CLI.

## Table of Contents

1. [MCP Server Setup](#mcp-server-setup)
2. [Available Tools](#available-tools)
3. [Complete Workflow](#complete-workflow)
4. [Tool Reference](#tool-reference)
5. [Common Use Cases](#common-use-cases)
6. [Troubleshooting](#troubleshooting)

---

## MCP Server Setup

### 1. Configure MCP Server

The PM MCP server is automatically registered when you start GeminiAutoPM. Verify configuration in your MCP settings:

```json
{
  "mcpServers": {
    "pm-server": {
      "command": "node",
      "args": ["/path/to/GeminiAutoPM/dist/servers/pm-server.js"],
      "env": {}
    }
  }
}
```

### 2. Start the Server

The PM server starts automatically when you invoke any PM tool. No manual startup required.

### 3. Verify Connection

In Gemini CLI, check available MCP tools:

```
> List available MCP tools
```

You should see all PM tools registered:
- `pm_init`
- `prd_new`
- `prd_parse`
- `epic_decompose`
- `epic_show`
- `epic_list`
- `epic_status`

---

## Available Tools

### Core Workflow Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **pm_init** | Initialize .claude directory structure | First step in any new project |
| **prd_new** | Create Product Requirements Document | Define new feature requirements |
| **prd_parse** | Convert PRD to technical Epic | Translate business requirements to technical specs |
| **epic_decompose** | Break Epic into executable tasks | Create detailed implementation plan |
| **epic_show** | Display Epic details with tasks | Review Epic progress and details |
| **epic_list** | List all Epics with filtering | Get project overview |
| **epic_status** | Quick status with next actions | Daily standup, planning sessions |

---

## Complete Workflow

### Step 1: Initialize Project Structure

**Command:**
```
Use pm_init tool
```

**What Gemini sees:**
```json
{
  "tool": "pm_init",
  "params": {
    "workingDir": "/current/project/path"
  }
}
```

**Result:**
```
✅ PM structure initialized successfully

Created directories:
  📁 .claude/
  📁 .claude/epics/
  📁 .claude/prds/
  📁 .claude/memory-bank/

Next steps:
1. Create your first PRD with prd_new
2. Define feature requirements
3. Use prd_parse to convert to Epic
```

**Files created:**
```
project/
├── .claude/
│   ├── epics/        # Epic definitions
│   ├── prds/         # Product Requirements Documents
│   └── memory-bank/  # Audit trail logs
│       └── memory-bank.jsonl
```

---

### Step 2: Create Product Requirements Document

**Command:**
```
Use prd_new tool to create a new feature:
- Feature name: user-authentication
- Executive summary: Implement secure user authentication system with JWT tokens
- Problem statement: Users need a secure way to authenticate and maintain sessions
- Success criteria: Users can register, login, logout, and maintain sessions for 24 hours
- User stories: As a user, I want to create an account so I can access personalized features
- Acceptance criteria: Registration validates email format, passwords are hashed with bcrypt, JWT tokens expire after 24 hours
```

**What Gemini sees:**
```json
{
  "tool": "prd_new",
  "params": {
    "featureName": "user-authentication",
    "executiveSummary": "Implement secure user authentication system with JWT tokens",
    "problemStatement": "Users need a secure way to authenticate and maintain sessions",
    "successCriteria": "Users can register, login, logout, and maintain sessions for 24 hours",
    "userStories": "As a user, I want to create an account so I can access personalized features",
    "acceptanceCriteria": "Registration validates email format, passwords are hashed with bcrypt, JWT tokens expire after 24 hours",
    "outOfScope": "OAuth integration, password reset, email verification",
    "technicalConsiderations": "Use JWT for stateless authentication, bcrypt for password hashing"
  }
}
```

**Result:**
```
✅ PRD created successfully

Feature: user-authentication
File: .claude/prds/user-authentication.md
Status: draft

PRD sections created:
  ✓ Executive Summary
  ✓ Problem Statement
  ✓ Success Criteria
  ✓ User Stories
  ✓ Acceptance Criteria
  ✓ Out of Scope
  ✓ Technical Considerations

Next steps:
1. Review PRD for completeness
2. Use prd_parse to convert to technical Epic
```

**File created:**
```markdown
---
feature: user-authentication
status: draft
created: 2025-01-15T10:30:00Z
updated: 2025-01-15T10:30:00Z
version: "1.0"
---

## Executive Summary

Implement secure user authentication system with JWT tokens

## Problem Statement

Users need a secure way to authenticate and maintain sessions

## Success Criteria

Users can register, login, logout, and maintain sessions for 24 hours

## User Stories

As a user, I want to create an account so I can access personalized features

## Acceptance Criteria

Registration validates email format, passwords are hashed with bcrypt, JWT tokens expire after 24 hours

## Out of Scope

OAuth integration, password reset, email verification

## Technical Considerations

Use JWT for stateless authentication, bcrypt for password hashing
```

---

### Step 3: Convert PRD to Technical Epic

**Command:**
```
Use prd_parse tool to convert user-authentication PRD:
- Technical approach: Implement JWT-based authentication with Express middleware, PostgreSQL user storage, and bcrypt password hashing
- Implementation phases: 1) Database schema and models 2) Registration endpoint 3) Login endpoint 4) JWT middleware 5) Logout endpoint 6) Protected routes
- Dependencies: Express, bcrypt, jsonwebtoken, PostgreSQL, Sequelize ORM
```

**What Gemini sees:**
```json
{
  "tool": "prd_parse",
  "params": {
    "featureName": "user-authentication",
    "technicalApproach": "Implement JWT-based authentication with Express middleware, PostgreSQL user storage, and bcrypt password hashing",
    "implementationPhases": "1) Database schema and models 2) Registration endpoint 3) Login endpoint 4) JWT middleware 5) Logout endpoint 6) Protected routes",
    "dependencies": "Express, bcrypt, jsonwebtoken, PostgreSQL, Sequelize ORM"
  }
}
```

**Result:**
```
✅ PRD converted to Epic successfully

Epic: user-authentication
File: .claude/epics/user-authentication/epic.md
Status: open
Progress: 0%

Epic structure created:
  📁 .claude/epics/user-authentication/
  📄 epic.md (technical specification)

Sections included:
  ✓ Overview (from PRD)
  ✓ Technical Approach
  ✓ Implementation Phases
  ✓ Dependencies
  ✓ Original Requirements (linked to PRD)

Next steps:
1. Use epic_decompose to break into tasks
2. Define technical implementation details
```

**File created:**
```markdown
---
name: user-authentication
status: open
created: 2025-01-15T10:35:00Z
updated: 2025-01-15T10:35:00Z
progress: 0
totalTasks: 0
completedTasks: 0
---

## Overview

[Content from PRD Executive Summary]

## Technical Approach

Implement JWT-based authentication with Express middleware, PostgreSQL user storage, and bcrypt password hashing

## Implementation Phases

1) Database schema and models
2) Registration endpoint
3) Login endpoint
4) JWT middleware
5) Logout endpoint
6) Protected routes

## Dependencies

Express, bcrypt, jsonwebtoken, PostgreSQL, Sequelize ORM

## Requirements

See PRD: `.claude/prds/user-authentication.md`
```

---

### Step 4: Decompose Epic into Tasks

**Command:**
```
Use epic_decompose tool to create tasks for user-authentication Epic:
- Create 6 tasks for each implementation phase
- Add dependencies (e.g., JWT middleware depends on registration endpoint)
- Estimate effort (small/medium/large)
```

**What Gemini sees:**
```json
{
  "tool": "epic_decompose",
  "params": {
    "epicName": "user-authentication",
    "tasks": [
      {
        "name": "Create database schema and User model",
        "description": "Design PostgreSQL schema for users table with email, password_hash, created_at. Create Sequelize User model with validation.",
        "acceptance_criteria": "User model validates email format, password_hash is stored securely, timestamps are automatic",
        "estimated_effort": "medium",
        "depends_on": []
      },
      {
        "name": "Implement registration endpoint",
        "description": "Create POST /auth/register endpoint that validates input, hashes password with bcrypt, stores user in database",
        "acceptance_criteria": "Endpoint returns 201 on success, validates email uniqueness, returns JWT token, hashes password with bcrypt (10 rounds)",
        "estimated_effort": "medium",
        "depends_on": ["001"]
      },
      {
        "name": "Implement login endpoint",
        "description": "Create POST /auth/login endpoint that validates credentials, compares password hash, returns JWT token",
        "acceptance_criteria": "Endpoint returns 200 with JWT on success, validates password with bcrypt.compare, returns 401 on invalid credentials",
        "estimated_effort": "medium",
        "depends_on": ["001"]
      },
      {
        "name": "Create JWT authentication middleware",
        "description": "Implement Express middleware that validates JWT tokens, extracts user ID, attaches user to request object",
        "acceptance_criteria": "Middleware validates JWT signature, checks token expiration, returns 401 on invalid token, attaches user to req.user",
        "estimated_effort": "small",
        "depends_on": ["002", "003"]
      },
      {
        "name": "Implement logout endpoint",
        "description": "Create POST /auth/logout endpoint (stateless - client discards token)",
        "acceptance_criteria": "Endpoint returns 200, client-side token cleanup instructions in response",
        "estimated_effort": "small",
        "depends_on": ["004"]
      },
      {
        "name": "Add authentication to protected routes",
        "description": "Apply JWT middleware to protected routes, add tests for unauthorized access",
        "acceptance_criteria": "Protected routes return 401 without valid JWT, routes accessible with valid JWT, tests cover all cases",
        "estimated_effort": "medium",
        "depends_on": ["004"]
      }
    ]
  }
}
```

**Result:**
```
✅ Epic decomposed into 6 tasks successfully

Epic: user-authentication
Tasks created: 6
Files: .claude/epics/user-authentication/001.md - 006.md

Task Breakdown:
  001 ✓ Create database schema and User model [medium] [no dependencies]
  002 ✓ Implement registration endpoint [medium] [depends: 001]
  003 ✓ Implement login endpoint [medium] [depends: 001]
  004 ✓ Create JWT authentication middleware [small] [depends: 002, 003]
  005 ✓ Implement logout endpoint [small] [depends: 004]
  006 ✓ Add authentication to protected routes [medium] [depends: 004]

Dependency Graph:
  001 (foundation)
   ├── 002 (registration)
   └── 003 (login)
       ├── 004 (middleware)
           ├── 005 (logout)
           └── 006 (protected routes)

Next actionable tasks (no dependencies):
  → 001: Create database schema and User model

Next steps:
1. Start with task 001 (no dependencies)
2. Use epic_status to track progress
3. Use epic_show to view full details
```

**Files created:**
```
.claude/epics/user-authentication/
├── epic.md
├── 001.md
├── 002.md
├── 003.md
├── 004.md
├── 005.md
└── 006.md
```

---

### Step 5: Track Progress

#### View Epic Details

**Command:**
```
Use epic_show tool for user-authentication
```

**Result:**
```
📊 Epic: user-authentication

Status: in-progress ⚙️
Progress: 33% (2/6 tasks completed)
Created: 2025-01-15T10:35:00Z
Updated: 2025-01-15T14:20:00Z

Tasks:
  ✅ 001: Create database schema and User model [completed]
  ✅ 002: Implement registration endpoint [completed]
  ⚙️  003: Implement login endpoint [in-progress]
  ⏳ 004: Create JWT authentication middleware [open]
  ⏳ 005: Implement logout endpoint [open]
  ⏳ 006: Add authentication to protected routes [open]

Statistics:
  Completed: 2 tasks (33%)
  In Progress: 1 task (17%)
  Open: 3 tasks (50%)
  Blocked: 0 tasks (0%)

Next Actions:
  → Complete task 003 (in-progress)
  → Start task 004 after completing 002 and 003
```

#### List All Epics

**Command:**
```
Use epic_list tool with filter: status=in-progress, sortBy=progress
```

**Result:**
```
📋 Epics Overview (3 total)

In Progress (2):
  ⚙️  user-authentication       33% ━━━━━━━━━━━━━━━━━━━━────────────────────────────  [2/6 tasks]
  ⚙️  payment-integration       67% ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  [4/6 tasks]

Open (1):
  ⏳ notification-system        0% ──────────────────────────────────────────────────  [0/5 tasks]

Summary:
  Total Epics: 3
  In Progress: 2 (67%)
  Open: 1 (33%)
  Overall Progress: 33% (6/17 tasks completed)
```

#### Quick Status Check

**Command:**
```
Use epic_status tool for user-authentication
```

**Result:**
```
⚡ Quick Status: user-authentication

Progress: 33% ━━━━━━━━━━━━━━━━━━━━────────────────────────────

Tasks:
  ✅ Completed: 2
  ⚙️  In Progress: 1
  ⏳ Open: 3
  🚫 Blocked: 0

Currently Working On:
  ⚙️  003: Implement login endpoint

Next Actionable Tasks:
  → 004: Create JWT authentication middleware
     (blocked by: 002 ✅, 003 ⚙️)
     Can start when 003 is completed

Blocked Tasks:
  None

Recommendations:
  ✓ Focus on completing task 003
  ✓ Task 004 will be unblocked after 003
  ✓ 2 more tasks depend on 004 completion
```

---

## Tool Reference

### pm_init

**Purpose:** Initialize .claude directory structure

**Input Schema:**
```typescript
{
  workingDir?: string  // Optional, defaults to current directory
}
```

**Usage:**
```
Use pm_init tool
```

**Output:**
```json
{
  "success": true,
  "message": "PM structure initialized successfully",
  "structure": {
    "claudeDir": ".claude",
    "epicsDir": ".claude/epics",
    "prdsDir": ".claude/prds",
    "memoryBankDir": ".claude/memory-bank"
  }
}
```

---

### prd_new

**Purpose:** Create Product Requirements Document

**Input Schema:**
```typescript
{
  featureName: string,           // Required: kebab-case feature name
  executiveSummary: string,      // Required: High-level overview
  problemStatement: string,      // Required: Problem being solved
  successCriteria: string,       // Required: Definition of success
  userStories: string,           // Required: User perspectives
  acceptanceCriteria: string,    // Required: Acceptance conditions
  outOfScope?: string,           // Optional: What's excluded
  technicalConsiderations?: string  // Optional: Technical notes
}
```

**Usage:**
```
Use prd_new tool with:
- featureName: "user-authentication"
- executiveSummary: "Implement secure authentication"
- problemStatement: "Users need secure login"
- successCriteria: "Users can register and login securely"
- userStories: "As a user, I want to create an account"
- acceptanceCriteria: "Passwords are hashed, JWT tokens are secure"
```

**Output:**
```json
{
  "success": true,
  "featureName": "user-authentication",
  "filePath": ".claude/prds/user-authentication.md",
  "message": "PRD created successfully"
}
```

---

### prd_parse

**Purpose:** Convert PRD to technical Epic

**Input Schema:**
```typescript
{
  featureName: string,            // Required: Existing PRD name
  technicalApproach: string,      // Required: Technical implementation plan
  implementationPhases: string,   // Required: Development phases
  dependencies?: string           // Optional: Technical dependencies
}
```

**Usage:**
```
Use prd_parse tool for user-authentication with:
- technicalApproach: "JWT-based auth with Express"
- implementationPhases: "1) Schema 2) Registration 3) Login"
- dependencies: "Express, bcrypt, jsonwebtoken"
```

**Output:**
```json
{
  "success": true,
  "epicName": "user-authentication",
  "epicFilePath": ".claude/epics/user-authentication/epic.md",
  "message": "PRD converted to Epic successfully"
}
```

---

### epic_decompose

**Purpose:** Break Epic into executable tasks

**Input Schema:**
```typescript
{
  epicName: string,               // Required: Existing Epic name
  tasks: Array<{
    name: string,                 // Required: Task name
    description: string,          // Required: Detailed description
    acceptance_criteria: string,  // Required: Acceptance criteria
    estimated_effort: "small" | "medium" | "large",  // Required
    depends_on?: string[]         // Optional: Task numbers this depends on
  }>
}
```

**Usage:**
```
Use epic_decompose tool for user-authentication with tasks:
[
  {
    name: "Create database schema",
    description: "Design PostgreSQL schema",
    acceptance_criteria: "User model validates email",
    estimated_effort: "medium",
    depends_on: []
  },
  {
    name: "Implement registration",
    description: "Create registration endpoint",
    acceptance_criteria: "Endpoint validates and hashes password",
    estimated_effort: "medium",
    depends_on: ["001"]
  }
]
```

**Output:**
```json
{
  "success": true,
  "epicName": "user-authentication",
  "tasksCreated": 6,
  "taskFiles": [
    ".claude/epics/user-authentication/001.md",
    ".claude/epics/user-authentication/002.md"
  ],
  "nextActionableTasks": ["001"]
}
```

---

### epic_show

**Purpose:** Display detailed Epic information

**Input Schema:**
```typescript
{
  epicName: string,     // Required: Epic name
  verbose?: boolean     // Optional: Show full task details
}
```

**Usage:**
```
Use epic_show tool for user-authentication
```

**Output:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "📊 Epic: user-authentication\n\nStatus: in-progress ⚙️\n..."
    }
  ],
  "structuredContent": {
    "epicName": "user-authentication",
    "status": "in-progress",
    "progress": 33,
    "totalTasks": 6,
    "completedTasks": 2,
    "tasks": [...]
  }
}
```

---

### epic_list

**Purpose:** List all Epics with filtering and sorting

**Input Schema:**
```typescript
{
  status?: "all" | "open" | "in-progress" | "completed" | "blocked",
  sortBy?: "name" | "progress" | "created" | "updated"
}
```

**Usage:**
```
Use epic_list tool with status=in-progress, sortBy=progress
```

**Output:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "📋 Epics Overview (3 total)\n\n..."
    }
  ],
  "structuredContent": {
    "totalEpics": 3,
    "filteredEpics": 2,
    "epics": [...]
  }
}
```

---

### epic_status

**Purpose:** Quick status overview with next actions

**Input Schema:**
```typescript
{
  epicName: string     // Required: Epic name
}
```

**Usage:**
```
Use epic_status tool for user-authentication
```

**Output:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "⚡ Quick Status: user-authentication\n\n..."
    }
  ],
  "structuredContent": {
    "epicName": "user-authentication",
    "status": "in-progress",
    "progress": 33,
    "taskCounts": {...},
    "currentTasks": [...],
    "nextActionable": [...],
    "blocked": []
  }
}
```

---

## Common Use Cases

### Use Case 1: Daily Standup

**Scenario:** Team standup meeting, need quick status of all active work

**Commands:**
```
1. Use epic_list tool with status=in-progress
2. For each Epic, use epic_status tool
3. Review next actionable tasks
```

**Example Output:**
```
📋 Active Epics:
  ⚙️  user-authentication (33%)
  ⚙️  payment-integration (67%)

⚡ user-authentication:
  Currently: Implementing login endpoint
  Next: JWT middleware (blocked by login)

⚡ payment-integration:
  Currently: Stripe webhook integration
  Next: Refund processing
```

---

### Use Case 2: Sprint Planning

**Scenario:** Planning next sprint, need to estimate Epic and identify tasks

**Commands:**
```
1. Use prd_new tool to create PRD for new feature
2. Use prd_parse tool to convert to Epic
3. Use epic_decompose tool to break into tasks with estimates
4. Use epic_show tool to review breakdown
5. Select tasks for sprint based on estimates and dependencies
```

**Example Output:**
```
📊 New Epic: notification-system
  Total Tasks: 8
  Estimated Effort: 3 small, 4 medium, 1 large

  Sprint Candidates (no dependencies):
    001: Design notification schema [medium]
    002: Create notification model [small]
    003: Email service setup [large]
```

---

### Use Case 3: Dependency Resolution

**Scenario:** Task is blocked, need to identify what must be completed first

**Commands:**
```
1. Use epic_status tool to see blocked tasks
2. Review dependencies
3. Prioritize blocking tasks
```

**Example Output:**
```
🚫 Blocked Tasks:
  004: Create JWT middleware
    Blocked by: 002 ✅, 003 ⚙️
    Action: Complete task 003 first

  006: Add authentication to routes
    Blocked by: 004 ⏳
    Action: Complete task 004 (currently blocked)
```

---

### Use Case 4: Progress Reporting

**Scenario:** Weekly progress report for stakeholders

**Commands:**
```
1. Use epic_list tool to get overview
2. For each Epic, use epic_show tool with verbose=true
3. Extract completion percentages and timelines
```

**Example Output:**
```
📈 Weekly Progress Report

Completed Epics: 2
  ✅ user-profile (100%) - Completed Jan 12
  ✅ search-functionality (100%) - Completed Jan 14

In Progress: 2
  ⚙️  user-authentication (33%) - On track, ETA Jan 18
  ⚙️  payment-integration (67%) - On track, ETA Jan 16

Upcoming: 1
  ⏳ notification-system (0%) - Starting Jan 17

Overall Progress: 58% (23/40 tasks completed)
```

---

### Use Case 5: Onboarding New Team Member

**Scenario:** New developer joining, need to assign first task

**Commands:**
```
1. Use epic_list tool to see all Epics
2. Use epic_status tool to find next actionable tasks
3. Select task with no dependencies and appropriate difficulty
```

**Example Output:**
```
🎯 Recommended First Tasks:

user-authentication:
  → 001: Create database schema [medium] [no dependencies]
    Good for: Backend developers familiar with SQL

notification-system:
  → 001: Design notification schema [medium] [no dependencies]
    Good for: Backend developers, no external dependencies

payment-integration:
  → 003: Create invoice template [small] [no dependencies]
    Good for: Frontend developers, HTML/CSS work
```

---

## Troubleshooting

### Issue: "PM structure not initialized"

**Error:**
```
❌ Error: PM structure not initialized
Run pm_init first to create .claude directory structure
```

**Solution:**
```
Use pm_init tool
```

---

### Issue: "PRD not found"

**Error:**
```
❌ Error: PRD not found: feature-name
File does not exist: .claude/prds/feature-name.md
```

**Solution:**
```
1. Check PRD name spelling
2. List existing PRDs: ls .claude/prds/
3. Create PRD if missing: Use prd_new tool
```

---

### Issue: "Epic not found"

**Error:**
```
❌ Error: Epic not found: epic-name
File does not exist: .claude/epics/epic-name/epic.md
```

**Solution:**
```
1. Check Epic name spelling
2. List existing Epics: Use epic_list tool
3. Create Epic from PRD: Use prd_parse tool
```

---

### Issue: "Invalid Epic name format"

**Error:**
```
❌ Error: Invalid Epic name format
Epic name must be lowercase alphanumeric with hyphens (e.g., user-authentication)
```

**Solution:**
```
Use kebab-case naming:
  ✅ user-authentication
  ✅ payment-integration
  ✅ notification-system

  ❌ User Authentication
  ❌ user_authentication
  ❌ UserAuthentication
```

---

### Issue: "Circular dependency detected"

**Error:**
```
❌ Error: Circular dependency detected
Task 003 depends on 004, which depends on 003
```

**Solution:**
```
1. Review task dependencies in epic_show
2. Identify circular reference
3. Remove or restructure dependency
4. Re-run epic_decompose with corrected dependencies
```

---

### Issue: "Task already exists"

**Error:**
```
⚠️  Warning: Task 001 already exists
Skipping creation to preserve existing work
```

**Solution:**
```
This is not an error - task already created
To modify task:
1. Edit .claude/epics/epic-name/001.md directly
2. Update frontmatter status/progress
3. Use epic_show to verify changes
```

---

## Best Practices

### 1. **Always Initialize First**

Before starting any PM workflow, initialize the structure:
```
Use pm_init tool
```

### 2. **Start with PRD**

Don't skip requirements documentation:
```
Use prd_new tool → Define clear requirements → Use prd_parse tool
```

### 3. **Break Down Epics Early**

Decompose Epics into tasks before starting work:
```
Use epic_decompose tool → Review with epic_show → Start implementation
```

### 4. **Track Progress Regularly**

Use status tools daily:
```
Morning: Use epic_list tool (overview)
During work: Use epic_status tool (next actions)
End of day: Update task status in files
```

### 5. **Respect Dependencies**

Check dependencies before starting tasks:
```
Use epic_status tool → Identify next actionable tasks → Start work
```

### 6. **Update Task Status**

Keep task status current:
```
Edit .claude/epics/epic-name/XXX.md
Update frontmatter: status, updated, progress
```

### 7. **Use Memory Bank for Auditing**

Check memory bank for audit trail:
```
cat .claude/memory-bank/memory-bank.jsonl
```

---

## Quick Reference

### Workflow Cheat Sheet

```
1. Initialize:       Use pm_init tool
2. Create PRD:       Use prd_new tool
3. Convert to Epic:  Use prd_parse tool
4. Break into tasks: Use epic_decompose tool
5. Track progress:   Use epic_status tool
6. Review details:   Use epic_show tool
7. List all:         Use epic_list tool
```

### Status Emoji Legend

```
⏳ open          - Task not started
⚙️  in-progress   - Task currently being worked on
✅ completed     - Task finished
🚫 blocked       - Task cannot proceed (dependency not met)
```

### File Structure Reference

```
project/
├── .claude/
│   ├── epics/
│   │   └── epic-name/
│   │       ├── epic.md        # Epic specification
│   │       ├── 001.md         # Task 1
│   │       └── 002.md         # Task 2
│   ├── prds/
│   │   └── feature-name.md    # Product Requirements
│   └── memory-bank/
│       └── memory-bank.jsonl  # Audit trail
```

---

## Additional Resources

- **Migration Status**: See `docs/MIGRATION_STATUS.md` for comparison with ClaudeAutoPM
- **Development Standards**: See `.claude/DEVELOPMENT-STANDARDS.md` for coding standards
- **API Documentation**: See `docs/API.md` for MCP server API details
- **Contributing**: See `CONTRIBUTING.md` for contribution guidelines

---

## Support

For issues, questions, or feature requests:
- **GitHub Issues**: https://github.com/rafeekpro/GeminiAutoPM/issues
- **Documentation**: https://github.com/rafeekpro/GeminiAutoPM/wiki
- **Discord**: [Coming Soon]

---

*Last Updated: 2025-01-15*
*Version: 1.0.0*
*GeminiAutoPM PM MCP Server*
