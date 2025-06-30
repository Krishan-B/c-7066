# Task: Workspace Cleanup & Optimization

## CRITICAL INSTRUCTION

You are acting as an expert code auditor and workspace optimizer. Exercise EXTREME CAUTION
throughout this process. Every action must be thoroughly analyzed and cross-referenced before
execution.

## Phase 1: Project Understanding & Documentation Analysis

### 1.1 PRD Analysis (MANDATORY FIRST STEP)

- **BEFORE ANY OTHER ACTION**: Locate and thoroughly analyze the #PRD file
- Extract the official project structure, requirements, and architectural decisions
- Document the intended technology stack, frameworks, and dependencies
- Identify the project's scope, modules, and intended file organization
- Create a reference map of what SHOULD exist in this codebase based on PRD

### 1.2 Current State Assessment

- Generate a complete inventory of all files and directories in the workspace
- Categorize files by type, purpose, and framework/language
- Identify the actual project structure vs. intended structure from PRD
- Document any discrepancies between current state and PRD specifications

## Phase 2: Comprehensive Codebase Audit

### 2.1 Duplicate Detection & Analysis

- **BEFORE REMOVAL**: Scan for duplicate files across all directories
- Compare file contents, not just names (files with same content but different names)
- Identify legitimate duplicates vs. similar files with different purposes
- Cross-reference with PRD to determine which duplicates are intentional
- **SAFETY CHECK**: Verify no critical functionality depends on "duplicate" files

### 2.2 Unused/Dead Code Identification

- Analyze import/export statements and dependencies
- Identify unused functions, classes, modules, and variables
- Detect orphaned files not referenced anywhere in the project
- **CRITICAL**: Verify with PRD that identified "unused" code isn't planned for future use
- Check for dynamic imports or runtime dependencies that static analysis might miss

### 2.3 Corrupted & Problematic File Detection

- Identify files with encoding issues, syntax errors, or corruption
- Detect files with identical names but different cases (case sensitivity issues)
- Find files with special characters or invalid naming conventions
- Locate incomplete or truncated files
- **REPAIR STRATEGY**: Document repair approach for each identified issue

### 2.4 Framework/Language Mismatch Analysis

- Identify files from different frameworks/languages not specified in PRD
- Analyze if mismatched files are:
  - Legacy code that needs migration
  - Incorrectly placed configuration files
  - Third-party tools that should be elsewhere
  - Actually required but not documented in PRD
- **MIGRATION PLAN**: For legitimate mismatches, create safe migration strategy

## Phase 3: Safe Migration & Reorganization

### 3.1 Pre-Migration Safety Measures

- Create a complete backup strategy (document what should be backed up)
- Identify all dependencies and interconnections
- Test current functionality to establish baseline
- Document current working state for rollback reference

### 3.2 Secure Migration Process

- For each file requiring migration:
  - Analyze all dependencies and references
  - Create migration script with rollback capability
  - Test migration in isolation
  - Verify functionality after migration
  - Update all configuration files and references

### 3.3 Root Directory Optimization

- Reorganize root directory according to industry best practices
- Ensure PRD compliance in new structure
- Update all configuration files to reflect new structure
- Verify all build tools and scripts work with new organization

## Phase 4: Dependency & Configuration Audit

### 4.1 Dependency Conflict Resolution

- Analyze package.json, requirements.txt, pom.xml, etc.
- Identify version conflicts and incompatibilities
- Check for unused dependencies
- Verify all dependencies align with PRD specifications
- **SAFE UPDATE**: Update dependencies with compatibility verification

### 4.2 Configuration Harmonization

- Audit all config files (.env, .config, .json, .yaml, etc.)
- Identify conflicting or redundant configurations
- Standardize configuration approach across the project
- Ensure all configurations support the PRD requirements

## Phase 5: Final Verification & Cleanup

### 5.1 Pre-Deletion Verification Process

**MANDATORY CHECKLIST FOR EACH FILE BEFORE DELETION:**

- [ ] Confirmed as duplicate/unused through static analysis
- [ ] Verified against PRD that file is not required
- [ ] Checked for dynamic/runtime dependencies
- [ ] Tested that removal doesn't break functionality
- [ ] Documented in removal log with reasoning
- [ ] Confirmed backup exists if needed for rollback

### 5.2 Systematic Cleanup Execution

- Process files in order of safety (start with obvious waste)
- Verify each deletion doesn't break anything
- Test functionality after each significant removal
- Maintain detailed log of all actions taken

## Phase 6: Workspace Optimization

### 6.1 Environment Optimization

- Optimize development environment settings
- Configure proper IDE/editor settings
- Set up efficient build and test processes
- Implement proper logging and debugging setups

### 6.2 Performance Optimization

- Identify and resolve performance bottlenecks
- Optimize file organization for faster access
- Configure proper caching strategies
- Streamline development workflow

## Phase 7: Documentation & Guidelines Creation

### 7.1 Comprehensive Workspace Guidebook

Create a detailed guide covering:

#### Startup Procedures

- Step-by-step environment setup
- Required tools and their versions
- Environment variable configuration
- Initial build and test procedures

#### Development Workflow

- Coding standards and conventions
- Git workflow and branching strategy
- Code review process
- Testing requirements before commits

#### Project Structure Guide

- Directory organization explanation
- File naming conventions
- Module/component organization
- Configuration file management

#### Troubleshooting Guide

- Common issues and solutions
- Debugging procedures
- Performance troubleshooting
- Dependency conflict resolution

#### Maintenance Procedures

- Regular cleanup procedures
- Dependency update process
- Security audit procedures
- Performance monitoring

### 7.2 Quick Reference Materials

- Command cheat sheet for common tasks
- Project structure diagram
- Dependency tree visualization
- Workflow flowcharts

## SAFETY PROTOCOLS

### Before Every Action:

1. Cross-reference with PRD file
2. Verify no breaking changes will occur
3. Ensure backup/rollback capability
4. Test in isolated environment if possible
5. Document the reasoning for the action

### Emergency Procedures:

- Define rollback steps for each major change
- Maintain detailed action log
- Keep backup of original state
- Have testing procedures ready to verify functionality

## EXPECTED DELIVERABLES

1. **Cleaned and Optimized Codebase**: Organized according to PRD and best practices
2. **Comprehensive Documentation**: Complete workspace guidebook and quick references
3. **Action Log**: Detailed record of all changes made with reasoning
4. **Verification Report**: Confirmation that all functionality remains intact
5. **Optimization Report**: Performance and efficiency improvements achieved

## FINAL INSTRUCTION

**PROCEED WITH EXTREME CAUTION**. Always prioritize preserving working functionality over cleanup.
When in doubt, document the issue and ask for clarification rather than making assumptions. The goal
is a cleaner, more organized workspace that works better than before, not a broken project.
