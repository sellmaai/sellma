# Sellma - AI-Powered Audience Simulation Platform

Sellma is a full-stack application that uses AI to generate realistic audience personas and simulate their reactions to marketing content. Built with Next.js, Convex, and the Vercel AI SDK.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Git for version control

### Initial Setup

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <repository-url>
   cd sellma
   ```

2. **Install dependencies**
   ```bash
npm install
   ```

3. **Start the development server**
   ```bash
npm run dev
```

   This command will:
   - Start the Next.js frontend (with Turbopack) on [http://localhost:3000](http://localhost:3000)
   - Start the Convex backend development server
   - Open the Convex dashboard in your browser

4. **Sign in to the application**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Click "Sign in"
   - Use **Google OAuth** with the email: `admin@sellma.ai`
   - Grant necessary permissions

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend**: Convex (database, server functions, real-time subscriptions)
- **Authentication**: Convex Auth with Google OAuth
- **AI**: Vercel AI SDK v5 with Google Gemini models
  - `gemini-2.5-flash` for persona generation, ads, and simulations
  - `gemini-2.5-pro` for audience segmentation
- **Validation**: Zod for schema validation and type safety
- **UI Components**: Radix UI primitives, Lucide icons

## 📁 Project Structure

```
sellma/
├── app/                          # Next.js app router pages
│   ├── (splash)/                 # Public landing pages
│   ├── product/                  # Protected product pages
│   │   └── simulation/           # Audience simulation features
│   │       └── audience-builder/ # Main persona generation UI
│   └── signin/                   # Authentication pages
├── components/                   # React components
│   ├── personas/                 # Persona display components
│   ├── ai-elements/              # AI visualization components
│   └── ui/                       # shadcn/ui components
├── convex/                       # Convex backend
│   ├── personas.ts               # Persona generation & persistence
│   ├── audienceGroups.ts         # Audience segmentation
│   ├── ads.ts                    # Ad variant generation
│   ├── simulation.ts             # Persona reaction simulation
│   ├── auth.ts                   # Authentication config
│   └── schema.ts                 # Database schema
├── lib/                          # Shared utilities
│   ├── personas/                 # Persona schemas & prompts
│   ├── ads/                      # Ad schemas & prompts
│   └── simulation/               # Simulation schemas & prompts
└── agents.md                     # AI agents architecture guide
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend in parallel
npm run dev:frontend     # Start Next.js only (with Turbopack)
npm run dev:backend      # Start Convex backend only

# Production
npm run build            # Build Next.js for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
```

## 🌍 Environments

### Development (Cloud)
- **Convex**: Development deployment (automatically selected when running `npm run dev`)
- **URL**: [http://localhost:3000](http://localhost:3000)
- **Dashboard**: Convex dashboard opens automatically
- **Database**: Isolated dev database
- All local development work uses this environment

### Production
- **Convex**: Production deployment
- **URL**: [https://sellma.vercel.app](https://sellma.vercel.app)
- **Deployment**: Automatic via Vercel on `git push` to main branch
- **Database**: Production database (separate from dev)

## 🚢 Deployment Workflow

1. **Develop locally**
   ```bash
   npm run dev
   ```
   Changes are automatically reflected in the Convex development environment.

2. **Commit your changes**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

3. **Push to GitHub**
   ```bash
   git push origin main
   ```

4. **Automatic deployment**
   - Vercel detects the push and triggers a deployment
   - Convex production environment is updated
   - Changes go live at [https://sellma.vercel.app](https://sellma.vercel.app)
   - Check the Vercel dashboard for deployment status

## 🔐 Environment Variables

The following environment variables are configured in Convex:

```bash
# Google AI API Key (for Gemini models)
GOOGLE_GENERATIVE_AI_API_KEY=<your-key>
```

To set environment variables in Convex:
```bash
npx convex env set GOOGLE_GENERATIVE_AI_API_KEY <your-key>
```

For development vs production:
```bash
# Development
npx convex env set GOOGLE_GENERATIVE_AI_API_KEY <key> --admin-key <dev-admin-key>

# Production
npx convex env set GOOGLE_GENERATIVE_AI_API_KEY <key> --admin-key <prod-admin-key> --prod
```

## 🤖 AI Features

Sellma includes several AI-powered agents:

1. **Audience Segmentation** - Breaks down audience descriptions into distinct subsegments
2. **Persona Generation** - Creates realistic personas with OCEAN personality traits
3. **Ad Variant Generation** - Generates variations of marketing copy
4. **Reaction Simulation** - Simulates persona reactions to ads with engagement scores

For detailed information about AI agents, prompts, and schemas, see [agents.md](./agents.md).

## 📊 Database Schema

Key tables in Convex:

- `personas` - Generated persona data with indexes on `audienceGroup`, `persona_id`, and `audienceId`
- `users` - User authentication and profile data
- `messages` - Chat/communication data (if applicable)

See [convex/schema.ts](./convex/schema.ts) for full schema definitions.

## 🔍 Key Features

### Persona Generation
- Generate realistic audience personas based on demographics and psychographics
- Batch generation across multiple audience segments
- OCEAN personality trait modeling
- Pre-ad context (scenario, activity, emotional state)

### Audience Builder
- Convert text descriptions into structured audience segments
- Visual progress tracking with chain-of-thought display
- Real-time persona generation with progressive rendering
- Session-based persona management with `audienceId` tagging

### Ad Simulation
- Generate ad variants from a source ad
- Simulate persona reactions with behavioral predictions
- Engagement scoring and justification
- Multiple reaction types (click, save, research, ignore, share)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Google Gemini API](https://ai.google.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 🆘 Troubleshooting

### Common Issues

**"Failed to connect to Convex"**
- Ensure `npm run dev` is running (starts both frontend and backend)
- Check that Convex dashboard opened successfully
- Verify you're authenticated with Convex CLI

**"Google OAuth not working"**
- Make sure you're using `admin@sellma.ai` email
- Check that Google OAuth is configured in Convex Auth
- Clear browser cookies and try again

**"AI generation failing"**
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set in Convex
- Check Convex logs in the dashboard for detailed error messages
- Ensure you're within API rate limits

**"Build errors after pulling latest"**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test locally with `npm run dev`
4. Commit with descriptive messages
5. Push and create a pull request
6. Wait for review and CI checks

## 📞 Support

- **Documentation**: See [agents.md](./agents.md) for AI architecture
- **Convex Community**: [Discord](https://convex.dev/community)
- **Issues**: Use GitHub Issues for bug reports and feature requests
