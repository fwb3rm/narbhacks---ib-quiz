# InvestIQ - AI-Powered Investment Banking Preparation Platform

<div align="center">

![InvestIQ Logo](https://img.shields.io/badge/InvestIQ-AI%20Powered%20IB%20Prep-blue?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Convex](https://img.shields.io/badge/Convex-Database-orange?style=for-the-badge)

*Revolutionize your investment banking interview preparation with AI-powered learning*

[🚀 Live Demo](#) • [📖 Documentation](#) • [🐛 Report Bug](#) • [💡 Request Feature](#)

</div>

---

## 🎯 Overview

InvestIQ is a cutting-edge web application designed to revolutionize investment banking interview preparation through AI-powered learning. The platform combines advanced artificial intelligence with proven educational methodologies to deliver personalized, adaptive learning experiences for aspiring investment bankers.

### ✨ Key Features

- **🧠 AI-Generated Questions** - Dynamic questions that adapt to your skill level
- **⏱️ Real Interview Pressure** - 2-minute timer mimics actual IB interviews
- **📊 Advanced Analytics** - Comprehensive performance tracking and insights
- **🎓 Personalized Lessons** - AI-generated content based on your mistakes
- **🏆 Gamified Learning** - Point system and achievement tracking
- **📱 Modern UI/UX** - Beautiful, responsive design with smooth animations

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.8.0
- **pnpm** (recommended package manager)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fwb3rm/narbhacks---ib-quiz.git
   cd narbhacks---ib-quiz
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in `apps/web/` with:
   ```env
   OPENROUTER_API_KEY="your-openrouter-api-key"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   NEXT_PUBLIC_CONVEX_URL="your-convex-url"
   CONVEX_DEPLOYMENT="your-convex-deployment"
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🏗️ Architecture

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 19** | UI library with latest features |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **Convex** | Real-time database and backend |
| **Clerk** | Authentication and user management |
| **OpenAI/OpenRouter** | AI-powered question generation |
| **pnpm** | Fast, disk space efficient package manager |
| **Turbo** | Monorepo build system |

### Project Structure

```
narbhacks-main/
├── apps/
│   └── web/                    # Main Next.js application
│       ├── convex/             # Convex backend functions
│       │   ├── lessons.ts      # Lesson generation logic
│       │   ├── quiz.ts         # Quiz management
│       │   ├── performance.ts  # Analytics functions
│       │   └── schema.ts       # Database schema
│       ├── src/
│       │   ├── app/            # Next.js app router pages
│       │   │   ├── page.tsx    # Homepage
│       │   │   ├── quiz/       # Quiz interface
│       │   │   ├── lessons/    # AI lesson generation
│       │   │   ├── progress/   # Progress tracking
│       │   │   └── performance-insights/ # Analytics dashboard
│       │   ├── components/     # React components
│       │   │   ├── Quiz.tsx    # Main quiz component
│       │   │   ├── InteractiveQuestion.tsx
│       │   │   └── ui/         # UI components
│       │   └── lib/            # Utility functions
│       └── public/             # Static assets
├── packages/
│   └── quiz-api/              # Quiz API service
└── pnpm-workspace.yaml        # Workspace configuration
```

## 🎮 How to Use

### 1. Take Your First Quiz

- Click **"Start Quiz"** on the homepage
- Answer questions within the **2-minute time limit**
- Use keyboard shortcuts: **1-4** for answers, **Enter** for next
- Review explanations for incorrect answers
- Track your score and accuracy in real-time

### 2. Explore Performance Insights

- Visit the **"Insights"** page for detailed analytics
- Identify your strongest and weakest areas
- Get personalized improvement recommendations
- View time analysis and progress trends

### 3. Generate Personalized Lessons

- Go to the **"Lessons"** page
- Choose from recommended topics or browse all categories
- Generate AI-powered lessons tailored to your needs
- Practice with embedded questions and examples

### 4. Track Your Progress

- Monitor your improvement over time
- View detailed analytics by category and subcategory
- Set goals and track achievements
- Review recent questions and explanations

## 📚 Topic Coverage

### Core Investment Banking Topics

| Category | Subtopics |
|----------|-----------|
| **Accounting** | Income statements, balance sheets, cash flow, 3-statement linkages, accrual vs cash accounting |
| **Valuation** | DCF analysis, comparable companies, precedent transactions, WACC, terminal value |
| **M&A** | Deal structures, merger models, accretion/dilution analysis, purchase price allocation |
| **LBOs** | Capital structure, sources & uses, IRR calculations, exit strategies |
| **Capital Markets** | IPOs, debt offerings, underwriting, regulatory filings |
| **Corporate Finance** | Capital budgeting, working capital, dividend policy, cost of capital |
| **Technical Modeling** | Excel best practices, circular references, debt schedules |

## 🎯 Features in Detail

### Quiz System
- **Adaptive Difficulty**: Questions adjust based on performance
- **Timer Pressure**: 2-minute limit per question
- **Keyboard Shortcuts**: Use 1-4 keys for answers, Enter for next
- **Real-time Feedback**: Immediate scoring and explanations
- **Progress Tracking**: Visual progress bars and score tracking

### Analytics Dashboard
- **Overview**: High-level performance metrics
- **Detailed Analysis**: Category and subcategory breakdowns
- **Improvement Areas**: AI-identified weak spots
- **Recent Questions**: Review past performance
- **Time Analysis**: Speed and efficiency metrics

### Lesson Generation
- **AI-Powered Content**: Personalized based on quiz mistakes
- **Interactive Elements**: Embedded practice questions
- **Multiple Formats**: Beginner and expert difficulty levels
- **Comprehensive Coverage**: All major IB topics included

## 🛠️ Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm clean        # Clean all node_modules
pnpm lint         # Run linting with Biome
pnpm format       # Format code with Biome
```

### Environment Variables

Create a `.env.local` file in `apps/web/`:

```env
# AI Services
OPENROUTER_API_KEY="your-openrouter-api-key"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

# Database
NEXT_PUBLIC_CONVEX_URL="your-convex-url"
CONVEX_DEPLOYMENT="your-convex-deployment"
```

### Key Components

- **Quiz Component**: Main quiz interface with timer and scoring
- **Analytics Dashboard**: Performance visualization
- **Lesson Generator**: AI-powered lesson creation
- **Progress Tracking**: Real-time performance monitoring

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Engaging user experience
- **Dark Theme**: Easy on the eyes for extended study sessions
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on every push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify**
- **Railway**
- **Heroku**
- **AWS Amplify**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for AI capabilities
- **Convex** for real-time database
- **Clerk** for authentication
- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues](https://github.com/fwb3rm/narbhacks---ib-quiz/issues)
- **Discussions**: [GitHub Discussions](https://github.com/fwb3rm/narbhacks---ib-quiz/discussions)

## 🎯 Roadmap

- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Study Groups**: Collaborative learning features
- [ ] **Video Lessons**: AI-generated video content
- [ ] **Interview Simulator**: Full mock interview experience
- [ ] **Integration**: Connect with job boards and career services
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **Multi-language Support**: International expansion

---

<div align="center">

**Made with ❤️ for aspiring investment bankers**

[⭐ Star this repo](https://github.com/fwb3rm/narbhacks---ib-quiz) • [🐛 Report a bug](https://github.com/fwb3rm/narbhacks---ib-quiz/issues) • [💡 Request a feature](https://github.com/fwb3rm/narbhacks---ib-quiz/issues)

</div> 