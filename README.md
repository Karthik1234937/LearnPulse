# LearnPulse
AI-powered knowledge assessment platform that generates personalized quizzes, analyzes skill gaps, and recommends tailored learning pathways using Gemini AI and Supabase.


# LearnPulse: AI-Powered Knowledge Assessment & Recommendation

AI-powered knowledge assessment platform that generates personalized quizzes, analyzes skill gaps, and recommends tailored learning pathways using Gemini AI and Supabase.

## 🌟 Features

### 🧠 AI-Powered Assessment
- **Dynamic Quiz Generation**: Creates contextualized questions based on any topic
- **Adaptive Difficulty**: Automatically adjusts question complexity (Beginner, Intermediate, Advanced)
- **Real-time Analysis**: Instant evaluation with detailed feedback and explanations
- **Mistake Analysis**: Deep dive into incorrect answers with learning recommendations

### 📊 Skill Visualization
- **Interactive Charts**: Visual representation of skill levels across different domains
- **Progress Tracking**: Historical performance analysis with trend indicators
- **Competency Mapping**: Heat maps showing strengths and improvement areas

### 🎯 Personalized Recommendations
- **Hybrid Algorithm**: Combines collaborative filtering, content-based filtering, and semantic analysis
- **Course Suggestions**: Tailored learning resources based on assessment results
- **Study Tips**: Science-backed learning strategies (Spaced Repetition, Active Recall, etc.)

### 💬 AI Learning Assistant
- **24/7 ChatBot**: Intelligent tutoring system for doubt resolution
- **Context-Aware Responses**: Understands your learning history and current progress
- **Study Guidance**: Personalized advice on learning strategies and time management

### 🔐 Authentication & Persistence
- **Secure Login**: Supabase-powered authentication system
- **Progress Saving**: All assessment history and achievements stored securely
- **Multi-device Sync**: Access your learning journey from any device

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Gemini API Key
- Supabase Account (optional, for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/learnpulse-knowledge-assessment.git
   cd learnpulse-knowledge-assessment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000 in your browser

## 🔧 Configuration

### Getting API Keys

**Gemini API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into your `.env` file

**Supabase Setup (Optional but Recommended):**
1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the Project URL and anon key to your `.env` file

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ChatBot.tsx     # AI chat assistant
│   ├── CourseCard.tsx  # Course recommendation cards
│   └── SkillVisualizer.tsx # Data visualization components
├── services/           # API integration services
│   ├── geminiService.ts # Gemini AI API integration
│   └── supabaseClient.ts # Supabase database client
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
└── index.tsx           # Application entry point
```

## 🎯 How It Works

1. **Assessment Phase**: Users select a topic and generate a personalized quiz
2. **Evaluation**: Real-time scoring with detailed feedback on each answer
3. **Analysis**: AI analyzes patterns in mistakes and identifies knowledge gaps
4. **Recommendation**: System suggests specific courses and learning strategies
5. **Tracking**: Progress is visualized and stored for future reference

## 🛠️ Technologies Used

- **Frontend**: React 19, TypeScript, TailwindCSS
- **AI/ML**: Google Gemini API for natural language processing
- **Database**: Supabase (PostgreSQL) for data persistence
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite for fast development and building
- **Icons**: Lucide React for modern UI icons

## 📱 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini API for powering the AI capabilities
- Supabase for providing the backend infrastructure
- The open-source community for the amazing tools and libraries

## 📞 Support

If you encounter any issues or have questions, please:
- Open an issue on GitHub
- Contact the development team
- Check the [FAQ](docs/FAQ.md) for common questions

---

**Made with ❤️ by the LearnPulse Team**
