# Contributing to Who Am I?

Thank you for considering contributing! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for users
- Show empathy towards others

## Ways to Contribute

### Report Bugs

1. Check existing issues first
2. Use bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and OS details

### Suggest Features

1. Check existing feature requests
2. Open new issue with:
   - Problem you're solving
   - Proposed solution
   - Alternative approaches
   - User benefits

### Submit Pull Requests

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit PR

## Development Setup

See [SETUP.md](SETUP.md) for full instructions.

Quick start:
\`\`\`bash
git clone https://github.com/yourusername/who-am-i-game.git
cd who-am-i-game
pnpm install
pnpm dev
\`\`\`

## Code Style

### TypeScript

- Use TypeScript for all files
- Define proper interfaces
- Avoid `any` types
- Use descriptive names

\`\`\`typescript
// Good
interface Player {
  id: string
  displayName: string
  score: number
}

// Avoid
const data: any = {}
\`\`\`

### React Components

- Use functional components
- Use hooks for state
- Keep components focused
- Extract reusable logic

\`\`\`typescript
export function GameInterface({ lobbyId }: { lobbyId: string }) {
  const [players, setPlayers] = useState<Player[]>([])
  
  useEffect(() => {
    // Load players
  }, [lobbyId])
  
  return <div>...</div>
}
\`\`\`

### File Organization

- One component per file
- Use descriptive names
- Co-locate related files
- Keep structure flat

### Styling

- Use Tailwind utilities
- Mobile-first approach
- Use CSS variables
- Minimize custom CSS

\`\`\`tsx
// Good
<div className="flex items-center gap-4 p-4 md:p-6">

// Avoid
<div style={{ display: 'flex', padding: '16px' }}>
\`\`\`

## Database Changes

### Creating Migrations

1. Create file in `scripts/`
2. Use sequential numbering
3. Include:
   - Schema changes
   - RLS policies
   - Triggers
   - Rollback instructions

\`\`\`sql
-- 015_add_feature.sql
ALTER TABLE lobbies ADD COLUMN feature BOOLEAN DEFAULT false;

-- Rollback:
-- ALTER TABLE lobbies DROP COLUMN feature;
\`\`\`

4. Test on clean database
5. Update documentation

## Testing

### Manual Testing

- Test in multiple browsers
- Test responsive design
- Test with multiple windows
- Test error states
- Test guest and auth flows

## Git Workflow

### Branching

\`\`\`bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push to fork
git push origin feature/your-feature
\`\`\`

### Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

### Pull Request Process

1. Update documentation
2. Add tests if applicable
3. Ensure all checks pass
4. Request review
5. Address feedback
6. Merge when approved

## Documentation

### Code Comments

- Explain why, not what
- Document complex logic
- Add JSDoc for functions

\`\`\`typescript
/**
 * Calculates round winner with speed bonus
 * @param players - Array of players with scores
 * @returns Player with highest adjusted score
 */
function calculateWinner(players: Player[]): Player {
  // Implementation
}
\`\`\`

### README Updates

Update when:
- Adding features
- Changing setup
- Modifying architecture
- Adding dependencies

## Common Tasks

### Add New Component

1. Create file in `components/`
2. Define TypeScript types
3. Implement component
4. Style with Tailwind
5. Export and use

### Add New Page

1. Create file in `app/`
2. Define metadata
3. Implement page
4. Add to navigation
5. Test routing

### Add Database Table

1. Create migration script
2. Define schema
3. Add RLS policies
4. Enable realtime
5. Update types
6. Test CRUD

## Questions?

- Open GitHub discussion
- Check documentation
- Ask in PR comments

## License

By contributing, you agree your contributions will be licensed under MIT License.

---

Thank you for contributing to Who Am I! 🎭
