# Consoly Platform

A safe, anonymous mental health support platform with AI-powered emotional companion.

## 🌟 Features

- 🤖 **ConsolyBot**: AI-powered emotional support chatbot with refined conversational flow
- 👥 **Anonymous Posting**: Share feelings with numeric ID system
- 💬 **Community Support**: Comment and react to posts
- 🔐 **Privacy First**: Email authentication with anonymous identity
- 🎯 **Crisis Detection**: AI-powered crisis intervention
- 📱 **Responsive Design**: Works on all devices
- 🧠 **Advanced AI**: Dynamic response generation with conversation variety tracking

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **AI**: Google Gemini AI for emotional analysis
- **Authentication**: Custom anonymous system with bcrypt encryption
- **Deployment**: Vercel, Netlify, Railway compatible

## 📋 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Google AI API key (for ConsolyBot)

### Installation

1. **Clone the repository:**
\`\`\`bash
git clone https://github.com/yourusername/consoly-platform.git
cd consoly-platform
\`\`\`

2. **Install dependencies:**
\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

3. **Set up environment variables:**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` and add your API keys:
\`\`\`bash
# Required: Google AI API Key (SERVER-SIDE ONLY)
GOOGLE_AI_API_KEY=your_actual_google_ai_api_key_here

# Required: Encryption key for user data security
ENCRYPTION_KEY=your-32-character-secret-encryption-key-here
\`\`\`

4. **Run the development server:**
\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`bash
# Required: Google AI API Key (SERVER-SIDE ONLY - Never use NEXT_PUBLIC_ prefix)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Required: Encryption key for user data security (32+ characters)
ENCRYPTION_KEY=your-32-character-secret-encryption-key-here
\`\`\`

### Getting a Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

⚠️ **IMPORTANT**: Never use `NEXT_PUBLIC_GOOGLE_AI_API_KEY` as this exposes your API key to the client-side, which is a security risk.

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in the Vercel dashboard:
   - `GOOGLE_AI_API_KEY`: Your Google AI API key (server-side only)
   - `ENCRYPTION_KEY`: Your 32+ character encryption key
4. Deploy

### Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and connect your repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables in Netlify dashboard:
   - `GOOGLE_AI_API_KEY`: Your Google AI API key
   - `ENCRYPTION_KEY`: Your encryption key
5. Deploy

### Railway

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables:
   - `GOOGLE_AI_API_KEY`: Your Google AI API key
   - `ENCRYPTION_KEY`: Your encryption key
4. Deploy automatically

## 🛡️ Security Features

- **Server-Side API Keys**: All sensitive keys are server-side only, never exposed to client
- **bcrypt Password Hashing**: Industry-standard password security with 12 salt rounds
- **AES-256 Email Encryption**: User emails are encrypted at rest
- **Crisis Detection**: AI-powered detection of crisis situations with immediate intervention
- **Content Moderation**: Automated content filtering for inappropriate language
- **Anonymous Authentication**: Email-based auth with anonymous numeric IDs
- **Privacy First**: No personal data stored, complete anonymity maintained

## 🤖 ConsolyBot Features

- **Advanced AI Analysis**: Emotional sentiment analysis with 10+ emotions
- **Conversation Variety**: Dynamic response generation to avoid repetitive patterns
- **Crisis Intervention**: Immediate detection and response to crisis situations
- **Personalized Support**: Contextual responses based on conversation history
- **Multiple Support Types**: Breathing exercises, grounding techniques, affirmations
- **Real-time Insights**: Conversation quality metrics and emotional progress tracking

## 📁 Project Structure

\`\`\`
consoly-platform/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── consoly-bot.tsx   # AI chatbot component
│   ├── header.tsx        # Navigation header
│   └── ...               # Other components
├── lib/                  # Utility functions and actions
│   ├── actions.ts        # Server actions
│   ├── types.ts          # TypeScript types
│   ├── bot-ai.ts         # AI bot logic (server-side)
│   └── enhanced-ai-engine.ts # Advanced AI features (server-side)
├── __tests__/            # Test files
├── .env.example          # Environment variables template
├── .env.local           # Local environment variables (not committed)
├── .gitignore           # Git ignore rules
├── README.md            # This file
├── package.json         # Dependencies and scripts
└── ...                  # Config files
\`\`\`

## 🧪 Testing

Run the test suite:

\`\`\`bash
npm run test
# or
yarn test
# or
pnpm test
\`\`\`

Run tests in watch mode:

\`\`\`bash
npm run test:watch
# or
yarn test:watch
# or
pnpm test:watch
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help or have questions:

- 📧 Open an issue on GitHub
- 📖 Check the documentation
- 💬 Contact the maintainers

## ⚠️ Important Notes

- **Not a Substitute**: This platform is for peer support and is not a substitute for professional mental health care
- **Crisis Situations**: In case of emergency, always contact local emergency services or crisis hotlines
- **Privacy**: While the platform maintains anonymity, always be cautious about sharing sensitive information online
- **API Security**: Never expose API keys to the client-side - always use server-side environment variables only

## 🔐 Security Best Practices

- **API Keys**: Only use `GOOGLE_AI_API_KEY` (server-side), never `NEXT_PUBLIC_GOOGLE_AI_API_KEY`
- **Encryption**: All sensitive user data is encrypted with AES-256
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Environment Variables**: All secrets stored in environment variables, never in code
- **HTTPS**: Always use HTTPS in production
- **Regular Updates**: Keep dependencies updated for security patches

## 🙏 Acknowledgments

- Google AI for providing the Gemini API
- The mental health community for inspiration and guidance
- Open source contributors and maintainers
- Everyone who believes in the importance of mental health support

---

**Remember: You are not alone. Help is always available.**

**Crisis Resources:**
- 🇺🇸 988 Suicide & Crisis Lifeline: Call or text 988
- 🌍 International: [findahelpline.com](https://findahelpline.com)
