/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

/**
 * PRD Generator Utility
 *
 * Generates comprehensive Product Requirements Documents with:
 * - Structured sections (Executive Summary, Problem Statement, etc.)
 * - Feature categorization (Must Have, Should Have, Nice to Have)
 * - Success metrics and KPIs
 * - Technical requirements and architecture
 * - Implementation plan with phases
 * - Risks and mitigation strategies
 * - Open questions and appendix
 *
 * Migrated from ClaudeAutoPM prd-new.js script logic
 */

export interface PRDInput {
  featureName: string;
  executiveSummary: string;
  problemStatement: string;
  successCriteria: string;
  userStories: string;
  acceptanceCriteria: string;
  outOfScope?: string;
  technicalConsiderations?: string;
}

export interface EnrichedPRD {
  frontmatter: {
    name: string;
    status: string;
    priority: string;
    created: string;
    updated: string;
    timeline: string;
  };
  content: string;
}

/**
 * Generate comprehensive PRD content from basic input
 *
 * Expands user input into a full PRD structure following
 * industry best practices and ClaudeAutoPM patterns.
 */
export function generateComprehensivePRD(input: PRDInput): EnrichedPRD {
  const timestamp = new Date().toISOString();

  // Parse user stories to extract features
  const features = extractFeaturesFromUserStories(input.userStories);

  // Parse success criteria to extract metrics
  const metrics = extractMetricsFromCriteria(input.successCriteria);

  // Generate categorized features
  const categorizedFeatures = categorizeFeatures(features, input.acceptanceCriteria);

  // Build comprehensive content
  const content = buildPRDContent(input, categorizedFeatures, metrics);

  return {
    frontmatter: {
      name: input.featureName,
      status: 'draft',
      priority: inferPriority(input.executiveSummary, input.problemStatement),
      created: timestamp,
      updated: timestamp,
      timeline: inferTimeline(categorizedFeatures),
    },
    content,
  };
}

/**
 * Extract features from user stories text
 */
function extractFeaturesFromUserStories(userStoriesText: string): string[] {
  const features: string[] = [];

  // Split by lines and look for "As a... I want... so that..." patterns
  const lines = userStoriesText.split('\n').filter(line => line.trim().length > 0);

  for (const line of lines) {
    // Extract "I want X" part
    const wantMatch = line.match(/I want (?:to )?([^,\.]+)/i);
    if (wantMatch) {
      features.push(wantMatch[1].trim());
      continue;
    }

    // If no pattern, treat as feature description
    const cleaned = line.replace(/^[-*•]\s*/, '').trim();
    if (cleaned && !cleaned.toLowerCase().startsWith('as a')) {
      features.push(cleaned);
    }
  }

  return features.length > 0 ? features : ['Core functionality', 'User interface', 'Data management'];
}

/**
 * Extract metrics from success criteria
 */
function extractMetricsFromCriteria(criteriaText: string): Array<{name: string, value: string}> {
  const metrics: Array<{name: string, value: string}> = [];

  // Look for percentage patterns
  const percentMatches = criteriaText.matchAll(/([^:,\.]+):\s*([><=]+\s*\d+%)/gi);
  for (const match of percentMatches) {
    metrics.push({ name: match[1].trim(), value: match[2].trim() });
  }

  // Look for numeric targets
  const numericMatches = criteriaText.matchAll(/([^:,\.]+):\s*([><=]+\s*[\$€£]?\d+[km]?)/gi);
  for (const match of numericMatches) {
    metrics.push({ name: match[1].trim(), value: match[2].trim() });
  }

  // Look for time-based metrics
  const timeMatches = criteriaText.matchAll(/([^:,\.]+):\s*([<>]=?\s*\d+\s*(?:ms|seconds?|minutes?|hours?))/gi);
  for (const match of timeMatches) {
    metrics.push({ name: match[1].trim(), value: match[2].trim() });
  }

  return metrics;
}

/**
 * Categorize features by priority
 */
function categorizeFeatures(
  features: string[],
  acceptanceCriteria: string
): { mustHave: string[], shouldHave: string[], niceToHave: string[] } {
  const mustHave: string[] = [];
  const shouldHave: string[] = [];
  const niceToHave: string[] = [];

  // First 40% are must-have
  const mustHaveCount = Math.max(1, Math.ceil(features.length * 0.4));
  // Next 40% are should-have
  const shouldHaveCount = Math.max(1, Math.ceil(features.length * 0.4));

  for (let i = 0; i < features.length; i++) {
    if (i < mustHaveCount) {
      mustHave.push(features[i]);
    } else if (i < mustHaveCount + shouldHaveCount) {
      shouldHave.push(features[i]);
    } else {
      niceToHave.push(features[i]);
    }
  }

  return { mustHave, shouldHave, niceToHave };
}

/**
 * Infer priority from executive summary and problem statement
 */
function inferPriority(executiveSummary: string, problemStatement: string): string {
  const text = `${executiveSummary} ${problemStatement}`.toLowerCase();

  // P0 indicators
  if (text.match(/critical|urgent|blocking|revenue.*loss|security|compliance|outage/)) {
    return 'P0';
  }

  // P1 indicators
  if (text.match(/high.*priority|important|key.*feature|strategic|competitive/)) {
    return 'P1';
  }

  // P3 indicators
  if (text.match(/nice.*have|enhancement|polish|improve|optimize/)) {
    return 'P3';
  }

  // Default P2
  return 'P2';
}

/**
 * Infer timeline from feature complexity
 */
function inferTimeline(categorized: { mustHave: string[], shouldHave: string[], niceToHave: string[] }): string {
  const totalFeatures = categorized.mustHave.length + categorized.shouldHave.length + categorized.niceToHave.length;

  if (totalFeatures <= 3) {
    return '2-3 weeks';
  } else if (totalFeatures <= 6) {
    return '4-6 weeks';
  } else if (totalFeatures <= 10) {
    return '6-8 weeks';
  } else {
    return '8-12 weeks';
  }
}

/**
 * Build comprehensive PRD content
 */
function buildPRDContent(
  input: PRDInput,
  categorized: { mustHave: string[], shouldHave: string[], niceToHave: string[] },
  metrics: Array<{name: string, value: string}>
): string {
  return `## Executive Summary

${input.executiveSummary}

## Problem Statement

### Background

${input.problemStatement}

### Current State

- Current limitations and challenges affecting users
- Existing workarounds being employed
- Impact on user experience and business metrics
- Gap between current and desired functionality

### Desired State

- How this solution will address the identified problems
- Expected improvements in user experience
- Anticipated business impact and benefits
- Long-term vision for the feature

## Target Users

### Primary Users

${extractPrimaryUsers(input.userStories)}

### User Personas

**Power Users:**
- Technical proficiency: High
- Usage frequency: Daily
- Primary goals: Efficiency and advanced features

**Regular Users:**
- Technical proficiency: Medium
- Usage frequency: Weekly
- Primary goals: Ease of use and reliability

**Occasional Users:**
- Technical proficiency: Low to Medium
- Usage frequency: Monthly
- Primary goals: Simplicity and guidance

### User Stories

${formatUserStories(input.userStories)}

## Key Features

### Must Have (P0)

${categorized.mustHave.map(f => `- [ ] ${f}`).join('\n')}

**Rationale:** These features are essential for the MVP and core value proposition.

### Should Have (P1)

${categorized.shouldHave.map(f => `- [ ] ${f}`).join('\n')}

**Rationale:** These features significantly enhance value but are not blockers for initial launch.

### Nice to Have (P2)

${categorized.niceToHave.map(f => `- [ ] ${f}`).join('\n')}

**Rationale:** These features provide additional polish and can be delivered in future iterations.

## Success Metrics

### Overview

${input.successCriteria}

### Key Performance Indicators (KPIs)

${metrics.length > 0
  ? metrics.map(m => `- **${m.name}**: Target ${m.value}`).join('\n')
  : `- **Adoption Rate**: Target 60% of eligible users within 3 months
- **User Satisfaction**: Target NPS score of 8+ or CSAT of 4.5+/5
- **Performance**: 95th percentile response time < 500ms
- **Quality**: Bug rate < 2% per release, < 0.1% critical bugs`
}

### Measurement Plan

- **Data Collection**: Instrumentation points and analytics setup
- **Reporting Frequency**: Weekly dashboards, monthly reviews
- **Success Thresholds**: Minimum acceptable performance levels
- **Review Cadence**: Bi-weekly performance reviews with stakeholders

## Acceptance Criteria

### Functional Requirements

${formatAcceptanceCriteria(input.acceptanceCriteria)}

### Non-Functional Requirements

- **Performance**: Page load time < 2s, API response < 500ms
- **Scalability**: Support 10x current user load without degradation
- **Security**: All inputs validated, authentication required, encryption at rest
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Browser Support**: Latest 2 versions of Chrome, Firefox, Safari, Edge
- **Mobile Support**: Responsive design, touch-optimized interactions

## Technical Requirements

### Architecture Considerations

${input.technicalConsiderations || `- **Frontend**: Modern web framework (React/Vue/Angular)
- **Backend**: RESTful API or GraphQL
- **Database**: Relational (PostgreSQL/MySQL) or NoSQL based on data model
- **Caching**: Redis/Memcached for performance
- **CDN**: Static asset delivery and edge caching`}

### System Components

- **User Interface Layer**: Frontend components and user interactions
- **Application Logic**: Business rules and workflow orchestration
- **Data Access Layer**: Database interactions and data persistence
- **Integration Layer**: External API connections and webhooks
- **Infrastructure**: Hosting, monitoring, and deployment pipeline

### Dependencies

- **Internal Systems**: ${extractDependencies(input.technicalConsiderations, 'internal')}
- **External Services**: ${extractDependencies(input.technicalConsiderations, 'external')}
- **Third-Party Libraries**: To be determined during technical design

### Data Requirements

- **Data Models**: Entity relationships and schema design
- **Data Migration**: Migration strategy for existing data if applicable
- **Data Retention**: Retention policies and archival strategy
- **Data Privacy**: GDPR/CCPA compliance requirements

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)

- [ ] Technical design review and architecture approval
- [ ] Development environment setup and CI/CD pipeline
- [ ] Database schema design and migration scripts
- [ ] API contract definition and documentation
- [ ] Initial UI/UX mockups and user flow diagrams

### Phase 2: Core Features (Weeks 3-4)

- [ ] Implement must-have (P0) features
- [ ] Unit tests for all core functionality (>80% coverage)
- [ ] Integration tests for critical user flows
- [ ] Code review and security review
- [ ] Performance baseline measurement

### Phase 3: Enhancement & Polish (Weeks 5-6)

- [ ] Implement should-have (P1) features
- [ ] End-to-end testing across all browsers/devices
- [ ] Performance optimization and load testing
- [ ] Accessibility audit and fixes
- [ ] Documentation (user guides, API docs, runbooks)

### Phase 4: Launch & Monitoring (Weeks 7-8)

- [ ] Staging environment deployment and final QA
- [ ] Production deployment plan and rollback strategy
- [ ] Monitoring dashboards and alerts configuration
- [ ] User onboarding materials and help documentation
- [ ] Launch announcement and stakeholder communication

### Post-Launch (Ongoing)

- [ ] Monitor KPIs and user feedback
- [ ] Triage and fix priority bugs
- [ ] Implement nice-to-have (P2) features in future sprints
- [ ] Iterate based on user feedback and analytics

## Risks and Mitigation

### Technical Risks

- **Risk**: Performance degradation under high load
  - **Impact**: High - affects user experience and adoption
  - **Probability**: Medium
  - **Mitigation**: Load testing, caching strategy, horizontal scaling plan
  - **Contingency**: Auto-scaling, performance monitoring alerts

- **Risk**: Integration challenges with existing systems
  - **Impact**: Medium - delays timeline
  - **Probability**: Medium
  - **Mitigation**: Early integration testing, API versioning, fallback mechanisms
  - **Contingency**: Phased rollout, feature flags for quick rollback

- **Risk**: Data migration issues
  - **Impact**: High - potential data loss or corruption
  - **Probability**: Low
  - **Mitigation**: Comprehensive migration testing, backup strategy, validation scripts
  - **Contingency**: Rollback plan, data recovery procedures

### Business Risks

- **Risk**: Low user adoption
  - **Impact**: High - feature doesn't deliver expected value
  - **Probability**: Low to Medium
  - **Mitigation**: User research, beta testing, phased rollout
  - **Contingency**: Marketing campaign, user training, feature improvements

- **Risk**: Scope creep
  - **Impact**: Medium - timeline delays
  - **Probability**: High
  - **Mitigation**: Strict change control process, prioritization framework
  - **Contingency**: Cut nice-to-have features, extend timeline

### Compliance & Security Risks

- **Risk**: Security vulnerabilities
  - **Impact**: Critical - data breach, reputation damage
  - **Probability**: Low
  - **Mitigation**: Security review, penetration testing, secure coding practices
  - **Contingency**: Incident response plan, security patches

- **Risk**: Regulatory non-compliance
  - **Impact**: High - legal issues, fines
  - **Probability**: Low
  - **Mitigation**: Legal review, compliance audit, privacy by design
  - **Contingency**: Feature modifications, compliance remediation plan

## Out of Scope

${input.outOfScope || `The following items are explicitly out of scope for this phase:

- Advanced analytics and reporting features
- Mobile native applications (web-only for initial release)
- Integration with third-party platforms beyond specified requirements
- Internationalization and localization (English-only initially)
- Advanced customization and white-labeling capabilities

These items may be considered for future phases based on initial success and user feedback.`}

## Open Questions

- [ ] **Performance**: What are the expected peak load characteristics?
- [ ] **Integration**: Are there any undocumented system dependencies?
- [ ] **Timeline**: Are there any external deadlines or dependencies?
- [ ] **Resources**: What is the allocated team size and composition?
- [ ] **Budget**: What is the budget allocation for third-party services?
- [ ] **Launch**: What is the go-to-market strategy and launch plan?

## Appendix

### References

- Market research and competitive analysis
- User research findings and personas
- Technical architecture diagrams
- API documentation and specifications

### Glossary

- **MVP**: Minimum Viable Product
- **KPI**: Key Performance Indicator
- **SLA**: Service Level Agreement
- **P0/P1/P2/P3**: Priority levels (Critical/High/Medium/Low)
- **WCAG**: Web Content Accessibility Guidelines

### Changelog

- **${new Date().toISOString().split('T')[0]}**: Initial PRD created
- Future updates will be tracked here with dates and descriptions

---

*This PRD is a living document. Updates should be tracked in the changelog section above. Review and approval from stakeholders required before implementation begins.*

---

*Generated by GeminiAutoPM MCP Server*
*Migrated from ClaudeAutoPM framework*
`;
}

/**
 * Extract primary users from user stories
 */
function extractPrimaryUsers(userStories: string): string {
  const matches = userStories.matchAll(/As a ([^,]+)/gi);
  const users = new Set<string>();

  for (const match of matches) {
    users.add(match[1].trim());
  }

  if (users.size === 0) {
    return 'End users, administrators, and stakeholders';
  }

  return Array.from(users).join(', ');
}

/**
 * Format user stories with proper structure
 */
function formatUserStories(userStories: string): string {
  const lines = userStories.split('\n').filter(line => line.trim().length > 0);

  return lines.map(line => {
    // If already formatted with "As a...", keep as is
    if (line.toLowerCase().includes('as a')) {
      return `- ${line.trim().replace(/^[-*•]\s*/, '')}`;
    }

    // Otherwise, add basic formatting
    return `- As a user, I want ${line.trim().replace(/^[-*•]\s*/, '')}`;
  }).join('\n');
}

/**
 * Format acceptance criteria with Given/When/Then structure
 */
function formatAcceptanceCriteria(criteria: string): string {
  const lines = criteria.split('\n').filter(line => line.trim().length > 0);

  return lines.map(line => {
    const trimmed = line.trim().replace(/^[-*•]\s*/, '');

    // If already in Given/When/Then format, keep as is
    if (trimmed.match(/^(Given|When|Then|And):/i)) {
      return `- ${trimmed}`;
    }

    // Otherwise, format as requirement
    return `- **Requirement**: ${trimmed}`;
  }).join('\n');
}

/**
 * Extract dependencies from technical considerations
 */
function extractDependencies(technical: string | undefined, type: 'internal' | 'external'): string {
  if (!technical) {
    return type === 'internal'
      ? 'Authentication service, User database, Notification system'
      : 'Email service (SendGrid/Mailgun), Payment processor (Stripe/PayPal)';
  }

  // Look for dependency patterns
  const dependencyMatches = technical.matchAll(/(?:depends on|requires|uses)\s+([^,\.]+)/gi);
  const dependencies: string[] = [];

  for (const match of dependencyMatches) {
    dependencies.push(match[1].trim());
  }

  if (dependencies.length > 0) {
    return dependencies.join(', ');
  }

  return 'To be identified during technical design';
}
