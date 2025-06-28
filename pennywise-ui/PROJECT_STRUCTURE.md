# Pennywise UI - Project Structure

## 📁 Directory Structure

```
pennywise-ui/
├── public/                 # Static assets
│   ├── manifest.json      # PWA manifest
│   ├── favicon.ico        # App icon
│   └── icons/             # PWA icons
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   ├── globals.css    # Global styles
│   │   └── (routes)/      # Route groups
│   ├── components/        # Reusable components
│   │   ├── ui/           # Base UI components
│   │   ├── forms/        # Form components
│   │   ├── layout/       # Layout components
│   │   └── features/     # Feature-specific components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── store/            # Redux store configuration
│   │   ├── index.ts      # Store setup
│   │   └── slices/       # Redux slices
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── package.json          # Dependencies and scripts
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.mjs     # ESLint configuration
└── TECH_STACK.md         # Technology stack documentation
```

## 🎯 Key Directories Explained

### `/src/app/`
Next.js 13+ App Router directory containing:
- **layout.tsx**: Root layout with providers and global styles
- **page.tsx**: Home page component
- **globals.css**: Global CSS styles
- **/(auth)/**: Authentication-related routes
- **/(dashboard)/**: Main application routes
- **/(settings)/**: Settings and profile routes

### `/src/components/`
Reusable React components organized by purpose:
- **ui/**: Base UI components (buttons, inputs, modals)
- **forms/**: Form-specific components
- **layout/**: Layout components (header, sidebar, footer)
- **features/**: Feature-specific components (expense cards, charts)

### `/src/store/`
Redux Toolkit store configuration:
- **index.ts**: Store setup and configuration
- **slices/**: Redux slices for different features
  - `authSlice.ts`: Authentication state
  - `userSlice.ts`: User profile state
  - `groupSlice.ts`: Group management state
  - `transactionSlice.ts`: Expense tracking state

### `/src/hooks/`
Custom React hooks for reusable logic:
- `useAuth.ts`: Authentication hook
- `useApi.ts`: API call hooks
- `useLocalStorage.ts`: Local storage hook
- `useDebounce.ts`: Debounce utility hook

### `/src/lib/`
Third-party library configurations:
- `api.ts`: API client setup
- `auth.ts`: Authentication utilities
- `utils.ts`: General utilities
- `constants.ts`: Application constants

## 🔧 Configuration Files

### `next.config.ts`
Next.js configuration with:
- PWA plugin configuration
- Image optimization settings
- Experimental features
- Build optimizations

### `tsconfig.json`
TypeScript configuration with:
- Strict type checking
- Path mapping
- Module resolution
- Compiler options

### `package.json`
Project dependencies and scripts:
- **Dependencies**: Core libraries and frameworks
- **DevDependencies**: Development tools
- **Scripts**: Build, dev, and test commands

## 🎨 Styling Architecture

### Global Styles (`globals.css`)
- CSS reset and base styles
- CSS custom properties (variables)
- Typography system
- Color palette

### Component Styling
- Material UI components with custom themes
- Emotion styled-components for custom styling
- Responsive design utilities
- Dark/light theme support

## 📱 PWA Configuration

### `public/manifest.json`
Progressive Web App manifest with:
- App metadata and branding
- Icon definitions
- Display preferences
- Theme colors

### Service Worker
- Offline caching strategies
- Background sync
- Push notifications (future)
- App updates

## 🔄 State Management

### Redux Store Structure
```typescript
{
  auth: {
    user: User | null
    isAuthenticated: boolean
    loading: boolean
  },
  user: {
    profile: UserProfile | null
    preferences: UserPreferences
  },
  groups: {
    list: Group[]
    currentGroup: Group | null
    members: GroupMember[]
  },
  transactions: {
    list: Transaction[]
    filters: TransactionFilters
    summary: TransactionSummary
  }
}
```

## 🧪 Testing Structure

### Test Organization
- **Unit tests**: Component and utility tests
- **Integration tests**: API integration tests
- **E2E tests**: End-to-end user flows
- **Visual tests**: UI component snapshots

## 📦 Build and Deployment

### Development
- Hot reload with Next.js dev server
- TypeScript compilation
- ESLint and Prettier formatting
- Development-specific configurations

### Production
- Static optimization
- Code splitting
- Bundle analysis
- Performance monitoring

## 🔒 Security Considerations

### Authentication
- JWT token management
- Secure cookie handling
- CSRF protection
- XSS prevention

### Data Protection
- Input sanitization
- Output encoding
- Secure API communication
- Privacy compliance 