/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

/**
 * Epic decomposition prompt builder
 * Breaks down epics into implementable user stories following INVEST criteria
 */
export function buildEpicDecomposePrompt(
  epicName: string,
  complexity?: string,
  context?: string,
  agileGuide?: string,
  userStoryGuide?: string
): string {
  return `
You are an expert Agile project manager with deep expertise in epic decomposition.

# Task
Decompose the epic "${epicName}" into implementable user stories.

${complexity ? `## Complexity Level: ${complexity}\n` : ''}
${context ? `## Additional Context\n${context}\n` : ''}

# Agile Best Practices (from Context7)
${agileGuide || 'Apply industry-standard epic decomposition techniques'}

# User Story Format (from Context7)
${userStoryGuide || 'Follow standard user story format: As a [user], I want [feature] so that [benefit]'}

# INVEST Criteria
Ensure each user story follows INVEST principles:
- **I**ndependent: Can be developed and deployed separately
- **N**egotiable: Details can be refined through discussion
- **V**aluable: Delivers clear value to end users
- **E**stimable: Team can estimate effort required
- **S**mall: Can fit within a single sprint (2 weeks)
- **T**estable: Has clear, verifiable acceptance criteria

# Output Format

For each user story, provide:

## User Story [Number]: [Title]

**As a** [user type]
**I want** [feature/capability]
**So that** [business value/benefit]

**Description:**
[Detailed explanation of the story]

**Acceptance Criteria:**
1. [Specific, testable criterion]
2. [Specific, testable criterion]
3. [Specific, testable criterion]

**Estimated Complexity:** [XS | S | M | L | XL]

**Dependencies:**
- [Other stories this depends on, or "None"]

**Priority:** [High | Medium | Low]

**Technical Notes:**
- [Any technical considerations]

---

# Sprint Allocation

Provide a recommended distribution of stories across 2-week sprints:

**Sprint 1 (Foundation):**
- Story 1, Story 2, etc.
- Total complexity: [sum of complexities]

**Sprint 2 (Core Features):**
- Story 3, Story 4, etc.
- Total complexity: [sum of complexities]

[Continue as needed...]

# Summary

- **Total User Stories:** [number]
- **Estimated Duration:** [number] sprints
- **Key Risks:** [Any identified risks]
- **Recommended Approach:** [High-level implementation strategy]

Begin the decomposition now.
`;
}
