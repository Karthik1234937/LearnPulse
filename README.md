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

## �️ Technologies Used

- **Frontend**: React 19, TypeScript, TailwindCSS
- **AI/ML**: Google Gemini API for natural language processing
- **Database**: Supabase (PostgreSQL) for data persistence
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite for fast development and building
- **Icons**: Lucide React for modern UI icons

## 🎯 How It Works

1. **Assessment Phase**: Users select a topic and generate a personalized quiz
2. **Evaluation**: Real-time scoring with detailed feedback on each answer
3. **Analysis**: AI analyzes patterns in mistakes and identifies knowledge gaps
4. **Recommendation**: System suggests specific courses and learning strategies
5. **Tracking**: Progress is visualized and stored for future reference

## 🤖 Recommendation Algorithms

### 📊 Collaborative Filtering (CF)
**How it works:**
- Analyzes patterns from multiple users with similar learning profiles
- Identifies what successful learners with similar skill gaps studied next
- Leverages collective wisdom to recommend proven learning paths

**In LearnPulse:**
```javascript
// Simplified workflow
1. User completes assessment → Skill profile created
2. System finds users with similar skill patterns
3. Analyzes what courses helped those users improve
4. Recommends courses that worked for similar learners
```

**Example:** If users who struggled with "React Hooks" found "Advanced React Patterns" helpful, the system recommends that course to new users with similar struggles.

### 🧠 Content-Based Filtering (CBF)
**How it works:**
- Analyzes the content and metadata of learning materials
- Matches course content with user's identified knowledge gaps
- Uses semantic analysis to find relevant topics

**In LearnPulse:**
```javascript
// Simplified workflow
1. AI identifies specific knowledge gaps from quiz mistakes
2. System analyzes course descriptions, syllabi, and content
3. Semantic matching finds courses covering weak areas
4. Recommends content that directly addresses skill gaps
```

**Example:** If a user fails questions about "async/await in JavaScript," the system recommends courses specifically covering JavaScript asynchronous programming.

### 🔄 Hybrid Recommendation System
**Combining CF + CBF:**
- **Primary filter**: Content-Based (direct skill gap matching)
- **Secondary filter**: Collaborative (proven effectiveness)
- **Weighting**: 60% CBF + 40% CF for optimal personalization

**Workflow:**
```javascript
1. User assessment → Detailed skill gap analysis
2. CBF finds courses matching weak areas (relevance score)
3. CF filters by proven effectiveness for similar users (success score)
4. Hybrid algorithm combines scores:
   Final Score = (CBF_Relevance × 0.6) + (CF_Success × 0.4)
5. Top-scoring courses recommended to user
```

## 🔄 Detailed Workflow

### 1. Assessment Workflow
```
User selects topic
    ↓
Gemini AI generates contextualized quiz
    ↓
User completes assessment
    ↓
Real-time scoring + mistake analysis
    ↓
Detailed skill profile created
```

### 2. Analysis Workflow
```
Quiz results collected
    ↓
Mistake patterns identified
    ↓
Knowledge gaps categorized by:
   - Topic area
   - Difficulty level
   - Question type
    ↓
Learning objectives generated
```

### 3. Recommendation Workflow
```
Skill profile input
    ↓
Parallel processing:
   ├─ CBF: Content matching
   └─ CF: User similarity analysis
    ↓
Hybrid scoring algorithm
    ↓
Ranked course list generated
    ↓
Personalized recommendations displayed
```

### 4. Learning Workflow
```
User selects recommended course
    ↓
Progress tracking starts
    ↓
Periodic assessments scheduled
    ↓
Skill improvement measured
    ↓
Recommendations updated based on progress
```

## 📈 Algorithm Effectiveness

### **Collaborative Filtering Strengths:**
- ✅ Leverages real-world success data
- ✅ Discoverability of unexpected effective courses
- ✅ Improves over time as more users participate

### **Content-Based Filtering Strengths:**
- ✅ Highly personalized to individual needs
- ✅ Immediate relevance to identified gaps
- ✅ Works well for new courses without user data

### **Hybrid Approach Benefits:**
- ✅ Balances personalization with proven effectiveness
- ✅ Reduces cold-start problem
- ✅ Provides diverse yet relevant recommendations

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

## 🚀 Quick Start

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

## 📱 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy automatically
<<<<<<< HEAD
=======


**Made with ❤️ by the LearnPulse Team**
>>>>>>> 57ab9aea552ecc8e6de703e21f60027e4ec0a074
