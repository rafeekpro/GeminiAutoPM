# PM Workflow Analysis: Natural User Journey

**Date:** 2025-10-15
**Purpose:** Analyze natural workflow from ClaudeAutoPM to determine correct implementation order

## 🔍 Problem Identified

Initial Phase 1 plan started with Epic management tools (show, list, status), but this is backwards! Users need to CREATE epics before they can manage them.

## ✅ Correct Natural Workflow

### Stage 1: Project Initialization
```
/pm:init
└─> Creates .claude/ structure
    ├── .claude/epics/
    ├── .claude/prds/
    └── .claude/memory_bank.md
```

### Stage 2: PRD Creation
```
/pm:prd-new <feature-name>
└─> Interactive brainstorming session
    ├── Product vision
    ├── Target users
    ├── Key features
    ├── Success metrics
    └── Saves to .claude/prds/<feature-name>.md
```

**PRD Structure:**
```markdown
# Feature Name - Product Requirements Document

## Executive Summary
## Problem Statement
## Success Criteria
## User Stories
## Acceptance Criteria
## Out of Scope
## Technical Considerations
```

### Stage 3: PRD → Epic Conversion
```
/pm:prd-parse <feature-name>
└─> Converts PRD to technical epic
    ├── Technical analysis
    ├── Architecture decisions
    ├── Implementation strategy
    ├── Task breakdown preview
    └── Creates .claude/epics/<feature-name>/epic.md
```

**Epic Structure:**
```markdown
---
name: Feature Name
status: open
created: 2025-10-15T10:00:00Z
updated: 2025-10-15T10:00:00Z
progress: 0
---

# Epic: Feature Name

## Technical Approach
## Implementation Phases
## Task Breakdown Preview (max 10 tasks)
## Dependencies
## Success Criteria
```

### Stage 4: Epic Decomposition
```
/pm:epic-decompose <feature-name>
└─> Breaks epic into detailed tasks
    ├── Reads epic.md
    ├── Applies INVEST criteria
    ├── Creates task files (001.md, 002.md, ...)
    └── Updates epic with task summary
```

**Task Structure:**
```markdown
---
name: Task Name
status: open
created: 2025-10-15T10:00:00Z
updated: 2025-10-15T10:00:00Z
depends_on: []
parallel: true
conflicts_with: []
---

# Task: Task Name

## Description
## TDD Requirements
## Acceptance Criteria
## Technical Details
## Dependencies
## Effort Estimate
## Definition of Done
```

### Stage 5: Epic Management
```
/pm:epic-show <feature-name>    # View epic details
/pm:epic-list                    # List all epics
/pm:epic-status <feature-name>  # Quick status
```

### Stage 6: Task Execution
```
/pm:issue-start <feature-name>/001  # Start task
/pm:issue-sync <feature-name>/001   # Sync to GitHub
/pm:issue-close <feature-name>/001  # Complete task
```

## 📊 Dependency Graph

```
init (Stage 1)
  │
  ├─> prd-new (Stage 2)
  │     │
  │     └─> prd-parse (Stage 3)
  │           │
  │           └─> epic-decompose (Stage 4)
  │                 │
  │                 ├─> epic-show (Stage 5)
  │                 ├─> epic-list (Stage 5)
  │                 ├─> epic-status (Stage 5)
  │                 │
  │                 └─> issue-start (Stage 6)
  │                       │
  │                       ├─> issue-sync (Stage 6)
  │                       └─> issue-close (Stage 6)
  │
  └─> Shared Utilities (All Stages)
        ├── file-ops.ts
        ├── frontmatter.ts
        └── memory-bank.ts
```

## 🔄 Revised Implementation Order

### **Phase 1 (Revised): Foundation & PRD Creation**

**Week 1 Tasks:**

1. **Day 1-2: Shared Utilities** ⭐ FOUNDATION
   ```typescript
   src/lib/
   ├── file-ops.ts         # Read/write files, create directories
   ├── frontmatter.ts      # Parse/update YAML frontmatter
   ├── memory-bank.ts      # Memory Bank logging
   └── validation.ts       # Common validation utilities
   ```

2. **Day 2-3: PM Init Tool**
   ```typescript
   Tool: pm_init
   - Create .claude/ directory structure
   - Initialize .claude/epics/
   - Initialize .claude/prds/
   - Create Memory_Bank.md
   - Setup configuration
   ```

3. **Day 3-4: PRD New Tool**
   ```typescript
   Tool: prd_new
   - Interactive brainstorming (using elicitInput)
   - PRD template population
   - Context7 queries for PRD best practices
   - Save to .claude/prds/{feature}.md
   ```

4. **Day 4-5: PRD Parse Tool**
   ```typescript
   Tool: prd_parse
   - Read PRD file
   - Technical analysis with Context7
   - Generate epic structure
   - Create .claude/epics/{feature}/epic.md
   ```

**Deliverables Phase 1:**
- ✅ Shared utilities (4 files)
- ✅ pm_init tool
- ✅ prd_new tool
- ✅ prd_parse tool
- ✅ Complete PRD → Epic workflow
- ✅ Tests (80%+ coverage)

### **Phase 2: Epic Management**

**Week 2 Tasks:**

1. **Epic Decompose Tool** (already 50% done)
   - Read epic.md
   - Apply INVEST criteria
   - Create task files
   - Update epic summary

2. **Epic Management Tools**
   - epic_show (update existing)
   - epic_list (update existing)
   - epic_status (update existing)

3. **Epic Lifecycle**
   - epic_start
   - epic_close
   - epic_edit

### **Phase 3-5: Issue Management & Workflow**
(Keep as originally planned)

## 💡 Key Insights

1. **User Journey First:** Tools must follow natural user workflow
2. **PRD is Entry Point:** All work starts from requirements
3. **Shared Utilities are Critical:** Must be implemented FIRST
4. **Context7 at Every Stage:** Each stage queries relevant best practices
5. **Memory Bank Throughout:** Log all operations for context

## 🎯 Immediate Next Steps

1. ✅ **Implement Shared Utilities** (file-ops, frontmatter, memory-bank)
2. ✅ **Implement pm_init** (project initialization)
3. ✅ **Implement prd_new** (PRD creation with interactive prompts)
4. ✅ **Implement prd_parse** (PRD → Epic conversion)
5. ✅ **Complete epic_decompose** (Epic → Tasks breakdown)
6. ✅ **Update epic management tools** (show, list, status)

## 📝 Migration Status

| Tool Category | Priority | Status | Week |
|---------------|----------|--------|------|
| Shared Utilities | CRITICAL | 🔄 In Progress | 1 |
| pm_init | HIGH | ⏳ Pending | 1 |
| PRD Tools (new, parse) | HIGH | ⏳ Pending | 1 |
| Epic Decompose | HIGH | 🟡 50% Done | 1 |
| Epic Management | MEDIUM | 🟡 Scaffold Done | 2 |
| Issue/Task | MEDIUM | ⏳ Pending | 3 |
| Workflow | LOW | ⏳ Pending | 5 |

---

**Conclusion:** We need to pivot and implement the PRD → Epic workflow FIRST before epic management tools make sense. The current epic_show/list/status tools should be placeholders until we have a way to create epics.
