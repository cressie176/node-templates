# Claude Code Instructions for {{SERVICE_NAME}}

The service must be developed pragmatically, using test-driven development, clean code, clean architecture and using the preferred libraries. These are available from the following skills:

### TypeScript Development

- **typescript-clean-code-cookbook** - Clean code principles for TypeScript
  - Use when: Writing, reviewing, or refactoring TypeScript code
  - Invoke automatically when generating functions, classes, or modules
  - Ensures code is clear, consistent, and maintainable

- **typescript-tdd-cookbook** - Test-driven development patterns
  - Use when: Writing tests or implementing new features with TDD
  - Reference proven patterns for test structure and implementation

- **typescript-service-cookbook** - Service design patterns
  - Use when: Creating or refactoring service classes
  - Reference patterns for well-factored, maintainable service architectures

- **typescript-pragmatic-programmer** - Pragmatic programming principles
  - Use when: Making architectural decisions or solving complex problems
  - Follow pragmatic practices for robust, maintainable software

### JavaScript/TypeScript Libraries

- **javascript-preferred-libraries** - Library selection guidance
  - Use when: Suggesting libraries, adding dependencies, or making architectural decisions
  - Provides guidance on preferred libraries, acceptable alternatives, and packages to avoid

### PostgreSQL (when using PostgreSQL)

- **postgresql-cookbook** - PostgreSQL patterns and best practices
  - Use when: Working with database design, queries, migrations, or operations
  - Reference proven patterns for schema design and query optimization

## Code Quality Standards

This project follows strict TypeScript configuration and uses Biome for linting/formatting. All code should:

1. Pass TypeScript strict checks
2. Follow clean code principles (clear naming, single responsibility, etc.)

## Project Maintenance

- **Remove .gitkeep files** when they are no longer needed
  - .gitkeep files are placeholders to preserve empty directories in git
  - When you add actual files to a directory containing a .gitkeep, remove the .gitkeep file
  - Example: After adding a file to an empty directory, delete the .gitkeep in that directory

## Attitude

- Taking great care to follow the instructions carefuly and without deviation
- If you get stuck, be tenatious. Fix problems, dont push them to one side.
