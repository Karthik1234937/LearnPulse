
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, BrainCircuit, ChevronRight, Trophy, ArrowLeft, Loader2,
  XCircle, History, TrendingUp, Target, Sparkles, Zap,
  LogOut, ArrowRight, Save, Briefcase, Compass, Layers,
  Clock, Play, Search, Bookmark, MessageSquare, Star, Send,
  Edit3, X, ExternalLink, LayoutGrid, Globe, Terminal as TerminalIcon, AlertTriangle,
  Lightbulb, Info, CheckCircle2, User as UserIcon, LayoutDashboard, Calendar, Trash2,
  MailOpen, Database, BarChart3, Github, Cloud, Cpu, Settings, ThumbsUp, ThumbsDown,
  Activity, Microscope, Map, ListChecks, Layout, Filter, Sparkle, Timer, Moon, Eye, Shuffle,
  Heart, MessageCircle, Cpu as CpuIcon, Command, Sun
} from 'lucide-react';
import { AppState, Question, AssessmentResult, Course, SkillScore, QuizHistory, User, MistakeAnalysis, FeedbackSubmission } from './types';
import { generateQuiz, getHybridRecommendations, analyzeMistake, searchCourses, processFeedback } from './services/geminiService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import CourseCard from './components/CourseCard';
import { SkillVisualizer, HistoryVisualizer } from './components/SkillVisualizer';
import ChatBot from './components/ChatBot';

const STUDY_TIPS_POOL = [
  [
    { title: "Spaced Repetition", text: "Review information at intervals of 1 day, 1 week, and 1 month to ensure maximum neural retention.", icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Active Recall", text: "Test yourself before you feel 'ready'. The effort of retrieval is what actually builds long-term memory.", icon: BrainCircuit, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Interleaving", text: "Switch between different topics in one session. It forces your brain to distinguish between complex concepts.", icon: Shuffle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Pomodoro Protocol", text: "Work for 25 minutes, followed by a 5-minute break. This reset prevents cognitive fatigue and burnout.", icon: Timer, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Sleep Consolidation", text: "Your brain stores what you've learned during REM sleep. Never sacrifice sleep for extra study hours.", icon: Moon, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Dual Coding", text: "Combine words with visuals like diagrams or mind maps to create two distinct neural pathways for memory.", icon: Eye, color: "text-blue-600", bg: "bg-blue-50" }
  ],
  [
    { title: "Feynman Technique", text: "Explain a concept to a child. If you can't explain it simply, you don't understand it well enough.", icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Mind Mapping", text: "Create visual connections between ideas. It mirrors how your brain naturally organizes information.", icon: Map, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "SQ3R Method", text: "Survey, Question, Read, Recite, Review. A systematic approach to deep reading comprehension.", icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Blurting", text: "Write down everything you remember about a topic on a blank sheet, then check what you missed.", icon: Edit3, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Loci Method", text: "The 'Memory Palace'. Associate information with specific physical locations in a familiar room.", icon: Compass, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Chunking", text: "Break down large amounts of information into smaller, manageable 'chunks' to reduce cognitive load.", icon: Layers, color: "text-purple-600", bg: "bg-purple-50" }
  ],
  [
    { title: "Retrieval Practice", text: "Practice testing is one of the most effective ways to strengthen neural connections.", icon: ListChecks, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Elaborative Rehearsal", text: "Connect new information to things you already know to create a stronger memory web.", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Concrete Examples", text: "Use real-world examples to illustrate abstract concepts and make them more memorable.", icon: Target, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Metacognition", text: "Think about your own thinking process. Identify where you are struggling and adjust your strategy.", icon: BrainCircuit, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Distributed Practice", text: "Spread your study sessions over time rather than cramming. It's much more effective for long-term retention.", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Peer Teaching", text: "Teaching someone else is the best way to master a subject yourself. It forces clarity and organization.", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" }
  ],
  [
    { title: "Pre-testing", text: "Trying to answer questions before you learn the material helps your brain focus on key information.", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Self-Explanation", text: "Explain the steps of a problem-solving process to yourself as you work through it.", icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Varied Practice", text: "Change the conditions of your practice to build more flexible and adaptable skills.", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Desirable Difficulty", text: "Challenge yourself with tasks that are just slightly beyond your current ability level.", icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Reflection", text: "Take a moment after studying to reflect on what you learned and how you can apply it.", icon: Heart, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Visualization", text: "Mentally rehearse a skill or process to improve your performance and confidence.", icon: Eye, color: "text-purple-600", bg: "bg-purple-50" }
  ]
];

const DOMAINS = [
  { id: "Cybersecurity", name: "Cybersecurity", icon: ShieldCheck },
  { id: "Data Science", name: "Data Science", icon: Database },
  { id: "Digital Marketing", name: "Digital Marketing", icon: Globe },
  { id: "Finance", name: "Finance", icon: Briefcase },
  { id: "UI/UX Design", name: "UI/UX Design", icon: LayoutGrid },
  { id: "Project Management", name: "Project Management", icon: Target },
  { id: "Product Strategy", name: "Product Strategy", icon: Compass },
  { id: "Cloud Architecture", name: "Cloud Architecture", icon: Layers }
];

const LANGUAGES = [
  { id: "Python", name: "Python", icon: TerminalIcon },
  { id: "JavaScript", name: "JavaScript", icon: TerminalIcon },
  { id: "TypeScript", name: "TypeScript", icon: TerminalIcon },
  { id: "Java", name: "Java", icon: TerminalIcon },
  { id: "Rust", name: "Rust", icon: TerminalIcon },
  { id: "Go", name: "Go", icon: TerminalIcon },
  { id: "C++", name: "C++", icon: TerminalIcon },
  { id: "SQL", name: "SQL", icon: Database }
];

const TOOLS = [
  { id: "PowerBI", name: "PowerBI", icon: BarChart3 },
  { id: "Tableau", name: "Tableau", icon: BarChart3 },
  { id: "Git", name: "Git & GitHub", icon: Github },
  { id: "Docker", name: "Docker", icon: Layers },
  { id: "Kubernetes", name: "Kubernetes", icon: Cpu },
  { id: "AWS", name: "AWS Cloud", icon: Cloud },
  { id: "Jira", name: "Jira", icon: Settings },
  { id: "Excel", name: "Advanced Excel", icon: LayoutGrid }
];

function ShieldCheck(props: any) { return <Globe {...props} /> }

const LOCAL_HISTORY_KEY = 'learnpulse_history_v12';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('LOGIN');
  const [authMode, setAuthMode] = useState<'SIGNIN' | 'SIGNUP'>('SIGNIN');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('learnpulse_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('learnpulse_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  
  const [quizTab, setQuizTab] = useState<'DOMAIN' | 'LANGUAGE' | 'TOOLS' | 'CUSTOM'>('DOMAIN');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [forcedDifficulty, setForcedDifficulty] = useState<'Mixed' | 'Beginner' | 'Intermediate' | 'Advanced'>('Mixed');
  const [questionCount, setQuestionCount] = useState<number>(10);
  
  const [loading, setLoading] = useState(false);
  const [isProcessingResults, setIsProcessingResults] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [viewedCourses, setViewedCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);

  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseSearchResults, setCourseSearchResults] = useState<Course[]>([]);
  const [isSearchingCourses, setIsSearchingCourses] = useState(false);
  const [courseViewMode, setCourseViewMode] = useState<'VAULT' | 'DISCOVERY'>('VAULT');

  const [mistakeAnalyses, setMistakeAnalyses] = useState<Record<string, MistakeAnalysis>>({});
  const [analysisLoadingId, setAnalysisLoadingId] = useState<string | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editOccupation, setEditOccupation] = useState('');
  const [editLearningGoal, setEditLearningGoal] = useState('');

  // Feedback & Engine States
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('General');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackAiResponse, setFeedbackAiResponse] = useState<string | null>(null);
  const [engineLogs, setEngineLogs] = useState<string[]>(["[SYS] LearnPulse Kernel Initialized.", "[SYS] Neural Recommendation Weights: DEFAULT"]);
  const [focusMode, setFocusMode] = useState(false);
  const [hasCognitiveBoost, setHasCognitiveBoost] = useState(false);
  const [activeTips, setActiveTips] = useState(STUDY_TIPS_POOL[0]);

  useEffect(() => {
    // Randomize tips on mount or when appState becomes DASHBOARD
    if (appState === 'DASHBOARD') {
      const randomIndex = Math.floor(Math.random() * STUDY_TIPS_POOL.length);
      setActiveTips(STUDY_TIPS_POOL[randomIndex]);
    }
  }, [appState]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const fetchHistory = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('assessment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        const cloudHistory = data.map((h: any) => ({
          id: h.id,
          date: h.created_at,
          score: h.overall_score,
          domain: h.domain,
          metadata: h.metadata
        }));
        setHistory(cloudHistory);
      }
    } catch (err) { console.error("History fetch error:", err); }
  }, []);

  const fetchUserProfile = useCallback(async (authUser: any) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) throw error;

      if (!data && authMode === 'SIGNUP') {
         await supabase.from('profiles').upsert({
            id: authUser.id,
            full_name: name || authUser.user_metadata?.full_name,
            email: authUser.email,
            occupation,
            learning_goal: learningGoal,
            enrolled_ids: []
         });
      }

      const userData: User = {
        name: data?.full_name || authUser.user_metadata?.full_name || 'Learner',
        email: data?.email || authUser.email || '',
        avatar: data?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
        joinedDate: new Date(data?.created_at || authUser.created_at || new Date()).toLocaleDateString(),
        occupation: data?.occupation || occupation || '',
        learningGoal: data?.learning_goal || learningGoal || '',
        preferredLevel: data?.preferred_level || 'Beginner',
        enrolledCourseIds: data?.enrolled_ids || []
      };
      
      setUser(userData);
      setViewedCourses(data?.saved_courses || []); 
      setEnrolledIds(data?.enrolled_ids || []);
      setEditName(userData.name);
      setEditOccupation(userData.occupation || '');
      setEditLearningGoal(userData.learningGoal || '');
      fetchHistory(authUser.id);
    } catch (err) { console.error("Profile fetch error:", err); }
  }, [fetchHistory, name, occupation, learningGoal, authMode]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        setIsVerifying(false);
        setAppState(prev => (prev === 'LOGIN' || prev === 'FORGOT_PASSWORD') ? 'DASHBOARD' : prev);
        fetchUserProfile(session.user);
      } else if (!isDemo && !['LOGIN', 'SIGNUP'].includes(appState)) {
        setUser(null);
        setAppState('LOGIN');
      }
    });
    return () => subscription.unsubscribe();
  }, [isDemo, fetchUserProfile, appState]);

  useEffect(() => {
    if (isProcessingResults) {
      const timer = setInterval(() => {
        setProcessingStep(prev => (prev + 1) % 4);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [isProcessingResults]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (authMode === 'SIGNUP') {
        if (signupStep === 1) {
          setSignupStep(2);
          setLoading(false);
          return;
        }
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
          email, password, options: { data: { full_name: name } }
        });
        if (signUpError) throw signUpError;
        if (signUpData.user) {
          if (signUpData.session) setAppState('DASHBOARD');
          else setIsVerifying(true);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const syncViewedCourses = async (newViewed: Course[]) => {
    setViewedCourses(newViewed);
    if (!isDemo && session && isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ saved_courses: newViewed }) 
          .eq('id', session.user.id);
      } catch (err) {
        console.error("Failed to sync viewed courses", err);
      }
    }
  };

  const handleCourseView = (course: Course) => {
    const alreadyViewed = viewedCourses.some(c => c.id === course.id);
    if (!alreadyViewed) {
      syncViewedCourses([...viewedCourses, course]);
    }
  };

  const toggleEnrollment = async (courseId: string) => {
    const isEnrolled = enrolledIds.includes(courseId);
    const newEnrolledIds = isEnrolled 
      ? enrolledIds.filter(id => id !== courseId)
      : [...enrolledIds, courseId];
    
    setEnrolledIds(newEnrolledIds);

    if (!isDemo && session && isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ enrolled_ids: newEnrolledIds })
          .eq('id', session.user.id);
      } catch (err) {
        console.error("Failed to update enrollment", err);
      }
    }
  };

  const submitFeedback = async () => {
    if (feedbackRating === 0) return;
    setIsSubmittingFeedback(true);
    try {
      const response = await processFeedback(feedbackRating, feedbackComment, feedbackCategory);
      setFeedbackAiResponse(response.acknowledgement);
      
      // Execute Engine Commands
      setEngineLogs(prev => [...prev, response.logEntry]);
      
      if (response.command === "ADJUST_LEVEL_BEGINNER") setForcedDifficulty("Beginner");
      if (response.command === "ADJUST_LEVEL_ADVANCED") setForcedDifficulty("Advanced");
      if (response.command === "ACTIVATE_FOCUS_MODE") setFocusMode(true);
      if (response.command === "GRANT_BADGE") setHasCognitiveBoost(true);

      if (!isDemo && session && isSupabaseConfigured) {
        const { error: supabaseError } = await supabase.from('user_feedback').insert([{
          user_id: session.user.id,
          rating: feedbackRating,
          category: feedbackCategory,
          comment: feedbackComment,
          ai_analysis: response.acknowledgement,
          engine_log: response.logEntry,
          assessment_domain: result?.domain || null,
          assessment_score: result?.overallScore || null
        }]);
        
        if (supabaseError) {
          console.error("Supabase feedback insert error:", supabaseError);
        }
      } else {
        if (isDemo) console.log("Feedback not saved to Supabase (Demo Mode)");
        else if (!session) console.warn("Feedback not saved: No active session found. Please log in.");
        else if (!isSupabaseConfigured) console.warn("Feedback not saved: Supabase is not configured.");
      }
    } catch (e) {
      console.error(e);
      setFeedbackAiResponse("Your feedback has been logged. Neural Engine recalibrated.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const startQuiz = async () => {
    let topic = quizTab === 'CUSTOM' ? customTopic : selectedTopic;
    if (!topic) { setError("Please select or enter a topic."); return; }
    setLoading(true);
    try {
      const questions = await generateQuiz(topic, questionCount, forcedDifficulty === 'Mixed' ? undefined : forcedDifficulty);
      setQuizQuestions(questions);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setMistakeAnalyses({});
      setAppState('TAKING_QUIZ');
    } catch (err) { setError("AI node synchronization error. Please retry."); } finally { setLoading(false); }
  };

  const handleCourseSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseSearchQuery.trim()) return;
    setIsSearchingCourses(true);
    setCourseViewMode('DISCOVERY');
    try {
      const results = await searchCourses(courseSearchQuery);
      setCourseSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingCourses(false);
    }
  };

  const fetchMistakeAnalysis = async (question: Question, answerIdx: number) => {
    if (mistakeAnalyses[question.id]) return;
    setAnalysisLoadingId(question.id);
    try {
      const analysis = await analyzeMistake(question, answerIdx);
      setMistakeAnalyses(prev => ({ ...prev, [question.id]: analysis }));
    } catch (e) {
      console.error(e);
    } finally {
      setAnalysisLoadingId(null);
    }
  };

  const finishQuiz = async () => {
    setIsProcessingResults(true);
    setAppState('RESULTS');
    try {
      const overallCorrect = quizQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
      const overallScore = Math.round((overallCorrect / quizQuestions.length) * 100);
      const topic = quizTab === 'CUSTOM' ? customTopic : selectedTopic;

      const topicStats: Record<string, { correct: number, total: number }> = {};
      quizQuestions.forEach(q => {
        const t = (q.topic && q.topic.trim()) || topic || "General Concepts";
        if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0 };
        topicStats[t].total++;
        if (answers[q.id] === q.correctAnswer) topicStats[t].correct++;
      });

      const strengths = Object.entries(topicStats)
        .filter(([_, stats]) => (stats.correct / stats.total) >= 0.7)
        .map(([t]) => t);
      
      const weakAreas = Object.entries(topicStats)
        .filter(([_, stats]) => (stats.correct / stats.total) < 0.7)
        .map(([t]) => t);

      const scores: SkillScore[] = Object.entries(topicStats).map(([t, stats]) => ({
        subject: t, score: Math.round((stats.correct / stats.total) * 100), fullMark: 100
      }));

      const { recommendations, persona } = await getHybridRecommendations(scores, weakAreas, strengths, topic);
      
      const newViewed = [...viewedCourses];
      recommendations.forEach(course => {
        if (!newViewed.some(c => c.id === course.id)) {
          newViewed.push(course);
        }
      });
      syncViewedCourses(newViewed);

      const metadata = { scores, persona, answers, questions: quizQuestions, recommendations, topic, strengths, weakAreas };
      
      if (session && !isDemo && isSupabaseConfigured) {
        const { error: histError } = await supabase.from('assessment_history').insert([{
          user_id: session.user.id, domain: topic, overall_score: overallScore, metadata
        }]);
        
        if (histError) {
          console.error("Supabase history insert error:", histError);
        }
        
        await fetchHistory(session.user.id);
      }

      setResult({ 
        id: crypto.randomUUID(), domain: topic, scores, weakAreas, strengths, recommendations, 
        date: new Date().toISOString(), overallScore, learningPersona: persona,
        userAnswers: answers, questions: quizQuestions
      });
    } catch (err: any) { 
      setError(err.message); 
      setAppState('TAKING_QUIZ');
    } finally { 
      setIsProcessingResults(false); 
    }
  };

  const stats = useMemo(() => {
    const quizzes = history.length;
    const courses = enrolledIds.length;
    const hours = Math.round((history.length * 0.5) * 10) / 10;
    return { quizzes, courses, hours };
  }, [history, enrolledIds]);

  const renderDashboard = () => (
    <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-2 ${focusMode ? 'grayscale-[0.5]' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Welcome back, {user?.name}!
            {hasCognitiveBoost && <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />}
          </h2>
          <p className={`font-medium text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Optimize your learning strategy with cognitive science-backed tips.</p>
        </div>
        {focusMode && (
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100">
             <Target className="w-4 h-4" /> Focus Mode Active
             <button onClick={() => setFocusMode(false)} className="ml-2 hover:bg-white/20 p-1 rounded-lg transition-all"><X className="w-3 h-3" /></button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all`}>
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"><Trophy className="w-8 h-8" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quizzes Completed</p><p className="text-3xl font-black text-slate-900 dark:text-white">{stats.quizzes}</p></div>
        </div>
        <div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:border-purple-100 dark:hover:border-purple-500/30 transition-all`}>
          <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-2xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"><BookOpen className="w-8 h-8" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Courses Enrolled</p><p className="text-3xl font-black text-slate-900 dark:text-white">{stats.courses}</p></div>
        </div>
        <div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:border-amber-100 dark:hover:border-amber-500/30 transition-all`}>
          <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform"><Clock className="w-8 h-8" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Effort (Hrs)</p><p className="text-3xl font-black text-slate-900 dark:text-white">{stats.hours}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className={`text-base font-black px-2 mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Quick Actions</h3>
          <button onClick={() => setAppState('QUIZ_CONFIG')} className={`w-full group p-5 rounded-2xl border flex items-center gap-4 transition-all text-left ${theme === 'dark' ? 'bg-indigo-500/5 hover:bg-indigo-600 border-indigo-500/20' : 'bg-indigo-50/50 hover:bg-indigo-600 border-indigo-100'}`}>
            <div className={`p-2.5 rounded-xl shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-800 group-hover:bg-indigo-600' : 'bg-white group-hover:bg-indigo-600'}`}><Trophy className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400 group-hover:text-white' : 'text-indigo-600 group-hover:text-white'}`} /></div>
            <div><p className={`font-black text-sm transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-white' : 'text-slate-900 group-hover:text-white'}`}>Take Assessment</p><p className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${theme === 'dark' ? 'text-slate-500 group-hover:text-white/80' : 'text-slate-500 group-hover:text-white/80'}`}>Test your knowledge</p></div>
          </button>
          <button onClick={() => setAppState('SAVED_COURSES')} className={`w-full group p-5 rounded-2xl border flex items-center gap-4 transition-all text-left ${theme === 'dark' ? 'bg-purple-500/5 hover:bg-purple-600 border-purple-500/20' : 'bg-purple-50/50 hover:bg-purple-600 border-purple-100'}`}>
            <div className={`p-2.5 rounded-xl shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-800 group-hover:bg-purple-600' : 'bg-white group-hover:bg-purple-600'}`}><Search className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400 group-hover:text-white' : 'text-purple-600 group-hover:text-white'}`} /></div>
            <div><p className={`font-black text-sm transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-white' : 'text-slate-900 group-hover:text-white'}`}>Browse Courses</p><p className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${theme === 'dark' ? 'text-slate-500 group-hover:text-white/80' : 'text-slate-500 group-hover:text-white/80'}`}>Find new skills</p></div>
          </button>
          <button onClick={() => setAppState('FEEDBACK')} className={`w-full group p-5 rounded-2xl border flex items-center gap-4 transition-all text-left ${theme === 'dark' ? 'bg-rose-500/5 hover:bg-rose-600 border-rose-500/20' : 'bg-rose-50/50 hover:bg-rose-600 border-rose-100'}`}>
            <div className={`p-2.5 rounded-xl shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-800 group-hover:bg-rose-600' : 'bg-white group-hover:bg-rose-600'}`}><MessageCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-rose-400 group-hover:text-white' : 'text-rose-600 group-hover:text-white'}`} /></div>
            <div><p className={`font-black text-sm transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-white' : 'text-slate-900 group-hover:text-white'}`}>System Feedback</p><p className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${theme === 'dark' ? 'text-slate-500 group-hover:text-white/80' : 'text-slate-500 group-hover:text-white/80'}`}>Improve the engine</p></div>
          </button>
        </div>

        <div className={`lg:col-span-2 rounded-[2rem] border shadow-sm p-8 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Cognitive Mastery Tips</h3>
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme === 'dark' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-indigo-600 bg-indigo-50 border-indigo-100'}`}>Study Smarter</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {activeTips.map((tip, idx) => (
               <div key={idx} className={`p-5 rounded-2xl border transition-all group ${theme === 'dark' ? 'border-slate-800 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5' : 'border-slate-100 hover:border-indigo-100 hover:shadow-md'}`}>
                 <div className="flex items-start gap-4">
                   <div className={`${tip.bg} ${tip.color} p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform ${theme === 'dark' ? 'opacity-80' : ''}`}>
                     <tip.icon className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className={`text-xs font-black mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{tip.title}</h4>
                     <p className={`text-[10px] font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{tip.text}</p>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom-2 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => setAppState('DASHBOARD')} className={`p-2 border rounded-xl shadow-sm transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h2 className="text-3xl font-black text-slate-900">Neural Feedback Loop</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Communication with LearnPulse Engineering</p>
        </div>
      </div>

      <div className={`rounded-[2.5rem] border shadow-xl overflow-hidden relative transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        {isSubmittingFeedback && (
          <div className={`absolute inset-0 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300 ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80'}`}>
             <div className="relative mb-6">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <CpuIcon className="w-6 h-6 text-indigo-600 animate-pulse" />
                </div>
             </div>
             <p className={`text-xs font-black uppercase tracking-[0.3em] animate-pulse ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recalibrating Neural Weights...</p>
          </div>
        )}

        {feedbackAiResponse ? (
          <div className="p-12 text-center animate-in zoom-in-95">
             <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border shadow-inner ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
               <CheckCircle2 className="w-10 h-10" />
             </div>
             <h3 className={`text-2xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Transmission Successful</h3>
             <div className={`p-6 rounded-2xl border mb-8 max-w-md mx-auto ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
               <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">AI Intelligence Acknowledgment</p>
               <p className={`text-sm font-medium leading-relaxed italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>"{feedbackAiResponse}"</p>
             </div>
             <button onClick={() => { setFeedbackAiResponse(null); setFeedbackRating(0); setFeedbackComment(''); setAppState('DASHBOARD'); }} className={`px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl ${theme === 'dark' ? 'bg-slate-100 text-slate-900 shadow-slate-900/40' : 'bg-slate-900 text-white shadow-slate-900/10'}`}>Return to Dashboard</button>
          </div>
        ) : (
          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Rate the Core Experience</p>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button 
                        key={num} 
                        onClick={() => setFeedbackRating(num)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          feedbackRating >= num ? 'bg-indigo-600 text-white shadow-lg scale-110' : (theme === 'dark' ? 'bg-slate-800 text-slate-600 hover:bg-slate-700' : 'bg-slate-50 text-slate-300 hover:bg-slate-100')
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${feedbackRating >= num ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Feedback Category</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['General', 'Course Quality', 'AI Accuracy', 'UI Design', 'Bug Report'].map((cat) => (
                      <button 
                        key={cat} 
                        onClick={() => setFeedbackCategory(cat)}
                        className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center border-2 ${
                          feedbackCategory === cat ? (theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-indigo-50 border-indigo-600 text-indigo-700') : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100')
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Input (Comments)</p>
                <textarea 
                  placeholder="Tell us exactly how we can make LearnPulse better for you..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-medium outline-none min-h-[220px] focus:ring-4 focus:ring-indigo-50 transition-all border-2 border-transparent focus:border-slate-200"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gemini Engine v3 Analysis Ready</p>
              </div>
              <button 
                onClick={submitFeedback}
                disabled={isSubmittingFeedback || feedbackRating === 0}
                className="bg-indigo-600 text-white px-12 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                {isSubmittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkle className="w-4 h-4" /> Finalize Submission</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className={`p-8 rounded-3xl border shadow-sm flex items-start gap-4 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}><Compass className="w-6 h-6" /></div>
            <div>
              <h4 className={`text-xs font-black mb-1 uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Roadmap Impact</h4>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">Your feedback directly influences the weights of our neural recommendation models.</p>
            </div>
         </div>
         <div className={`p-8 rounded-3xl border shadow-sm flex items-start gap-4 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><Zap className="w-6 h-6" /></div>
            <div>
              <h4 className={`text-xs font-black mb-1 uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Rapid Iteration</h4>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">Our AI Architect executes system adjustments based on categorized insights.</p>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-700 ${theme === 'dark' ? 'dark bg-slate-950 text-slate-200' : 'bg-[#f8fafc] text-slate-900'} ${focusMode ? (theme === 'dark' ? 'bg-slate-900' : 'bg-[#f1f5f9]') : ''}`}>
      <nav className={`border-b px-8 py-4 flex justify-between items-center sticky top-0 z-40 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-md border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAppState('DASHBOARD')}>
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg"><Zap className="w-5 h-5 text-white" /></div>
            <span className={`font-black text-xl tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>LearnPulse</span>
          </div>
          
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: 'Dashboard', icon: LayoutDashboard, state: 'DASHBOARD' },
                { label: 'Take Quiz', icon: Trophy, state: 'QUIZ_CONFIG' },
                { label: 'Courses', icon: BookOpen, state: 'SAVED_COURSES' },
                { label: 'Results', icon: History, state: 'HISTORY_LIST' },
                { label: 'Profile', icon: UserIcon, state: 'PROFILE' }
              ].map(item => (
                <button 
                  key={item.label}
                  onClick={() => setAppState(item.state as AppState)}
                  className={`px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                    appState === item.state 
                      ? (theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600') 
                      : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50')
                  }`}
                >
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user && (
            <div className="flex items-center gap-6">
               <div className={`flex items-center gap-3 pr-6 border-r transition-colors ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                 <div className="text-right">
                   <p className={`text-xs font-black leading-none mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
                   <button onClick={() => { if(!isDemo && isSupabaseConfigured) supabase.auth.signOut(); setAppState('LOGIN'); }} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 flex items-center gap-1 ml-auto group">
                     <LogOut className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" /> Logout
                   </button>
                 </div>
                 <img src={user.avatar} className={`w-10 h-10 rounded-2xl border-2 shadow-sm cursor-pointer transition-all ${hasCognitiveBoost ? 'border-amber-400 shadow-amber-100' : (theme === 'dark' ? 'border-slate-700 hover:border-indigo-500' : 'border-slate-50 hover:border-indigo-200')}`} onClick={() => setAppState('PROFILE')} alt="User" />
               </div>
            </div>
          )}
        </div>
      </nav>

      <main className={`max-w-7xl mx-auto px-8 py-10 transition-all duration-700 ${focusMode ? 'opacity-90 blur-[0.2px]' : ''}`}>
        {loading && !['TAKING_QUIZ', 'RESULTS', 'PROFILE', 'FEEDBACK'].includes(appState) ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
            <p className="text-slate-400 font-black tracking-widest uppercase text-[10px]">Processing Mastery Data...</p>
          </div>
        ) : appState === 'LOGIN' ? (
          <div className={`max-w-md mx-auto rounded-[2.5rem] p-10 shadow-2xl border mt-8 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
             <div className="text-center mb-10">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}><BrainCircuit className="w-8 h-8" /></div>
                <h1 className={`text-3xl font-black mb-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Access Hub</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Mastery Engine</p>
             </div>
             {error && <div className={`p-4 rounded-xl text-[10px] font-black uppercase mb-6 animate-shake ${theme === 'dark' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-rose-50 border border-rose-100 text-rose-600'}`}>{error}</div>}
             <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'SIGNUP' ? (
                  signupStep === 1 ? (
                    <>
                      <input type="text" placeholder="Full Name" className={`w-full border rounded-xl p-4 font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-100'}`} value={name} onChange={e => setName(e.target.value)} required />
                      <input type="email" placeholder="Email" className={`w-full border rounded-xl p-4 font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-100'}`} value={email} onChange={e => setEmail(e.target.value)} required />
                      <input type="password" placeholder="Password (Min 6 characters)" className={`w-full border rounded-xl p-4 font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-100'}`} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                      <button type="submit" className={`w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 group text-sm active:scale-95 transition-all shadow-xl ${theme === 'dark' ? 'bg-slate-100 text-slate-900 shadow-slate-900/40' : 'bg-slate-900 text-white shadow-slate-900/10'}`}>Next <ArrowRight className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <div className="animate-in slide-in-from-right-4">
                      <input type="text" placeholder="Current Occupation" className={`w-full border rounded-xl p-4 font-bold text-sm outline-none mb-3 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-100'}`} value={occupation} onChange={e => setOccupation(e.target.value)} required />
                      <textarea placeholder="Primary Learning Goal" className={`w-full border rounded-xl p-4 font-bold text-sm outline-none min-h-[120px] mb-4 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-100'}`} value={learningGoal} onChange={e => setLearningGoal(e.target.value)} required />
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setSignupStep(1)} className={`flex-1 font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500'}`}>Back</button>
                        <button type="submit" className={`flex-[2] bg-indigo-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all ${theme === 'dark' ? 'shadow-indigo-500/20' : 'shadow-indigo-100'}`}>Start Journey</button>
                      </div>
                    </div>
                  )
                ) : (
                  <>
                    <input type="email" placeholder="Email Address" className={`w-full border rounded-xl p-4 font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-100'}`} value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className={`w-full border rounded-xl p-4 font-bold text-sm outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-100'}`} value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" className={`w-full bg-indigo-600 text-white font-black py-4 rounded-xl text-sm active:scale-95 transition-all shadow-xl ${theme === 'dark' ? 'shadow-indigo-500/20' : 'shadow-indigo-100'}`}>Authorize Identity</button>
                  </>
                )}
             </form>
             <div className="mt-8 flex flex-col gap-4">
                <button onClick={() => { setAuthMode(authMode === 'SIGNIN' ? 'SIGNUP' : 'SIGNIN'); setSignupStep(1); setError(null); }} className={`text-[10px] font-black uppercase tracking-widest text-center transition-all ${theme === 'dark' ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}>{authMode === 'SIGNIN' ? "Initialize New Profile" : "Existing Identity? Access Hub"}</button>
                <div className={`h-px my-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`} />
                <button onClick={() => { setIsDemo(true); setAppState('DASHBOARD'); setUser({ name: 'Explorer', email: 'demo@learnpulse.ai', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo', joinedDate: 'Today' }); }} className={`w-full border-2 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'}`}>Bypass with Preview Session</button>
             </div>
          </div>
        ) : appState === 'DASHBOARD' ? renderDashboard() 
          : appState === 'FEEDBACK' ? renderFeedback()
          : appState === 'QUIZ_CONFIG' ? (
            <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <button onClick={() => setAppState('DASHBOARD')} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-indigo-600 transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Diagnostic Configuration</h2>
              </div>
              <div className={`rounded-[2rem] border shadow-xl overflow-hidden transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className={`flex border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                  <button onClick={() => setQuizTab('DOMAIN')} className={`flex-1 py-6 font-black text-[11px] uppercase tracking-widest transition-all ${quizTab === 'DOMAIN' ? (theme === 'dark' ? 'bg-slate-800 text-indigo-400 border-b-4 border-indigo-500' : 'bg-white text-indigo-600 border-b-4 border-indigo-600') : (theme === 'dark' ? 'bg-slate-900/50 text-slate-500 hover:bg-slate-800' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')}`}>Domains</button>
                  <button onClick={() => setQuizTab('LANGUAGE')} className={`flex-1 py-6 font-black text-[11px] uppercase tracking-widest transition-all ${quizTab === 'LANGUAGE' ? (theme === 'dark' ? 'bg-slate-800 text-indigo-400 border-b-4 border-indigo-500' : 'bg-white text-indigo-600 border-b-4 border-indigo-600') : (theme === 'dark' ? 'bg-slate-900/50 text-slate-500 hover:bg-slate-800' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')}`}>Languages</button>
                  <button onClick={() => setQuizTab('TOOLS')} className={`flex-1 py-6 font-black text-[11px] uppercase tracking-widest transition-all ${quizTab === 'TOOLS' ? (theme === 'dark' ? 'bg-slate-800 text-indigo-400 border-b-4 border-indigo-500' : 'bg-white text-indigo-600 border-b-4 border-indigo-600') : (theme === 'dark' ? 'bg-slate-900/50 text-slate-500 hover:bg-slate-800' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')}`}>Tools</button>
                  <button onClick={() => setQuizTab('CUSTOM')} className={`flex-1 py-6 font-black text-[11px] uppercase tracking-widest transition-all ${quizTab === 'CUSTOM' ? (theme === 'dark' ? 'bg-slate-800 text-indigo-400 border-b-4 border-indigo-500' : 'bg-white text-indigo-600 border-b-4 border-indigo-600') : (theme === 'dark' ? 'bg-slate-900/50 text-slate-500 hover:bg-slate-800' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')}`}>Custom</button>
                </div>
                <div className="p-10">
                  {quizTab === 'DOMAIN' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-300">
                      {DOMAINS.map(d => (
                        <button key={d.id} onClick={() => setSelectedTopic(d.name)} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${selectedTopic === d.name ? (theme === 'dark' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-inner') : (theme === 'dark' ? 'border-slate-800 bg-slate-800/50 hover:border-slate-700 text-slate-400' : 'border-slate-50 bg-white hover:border-slate-200 text-slate-300')}`}>
                          <d.icon className={`w-6 h-6 ${selectedTopic === d.name ? (theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600') : 'text-slate-300'}`} />
                          <span className="text-[9px] font-black uppercase text-center">{d.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {quizTab === 'LANGUAGE' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-300">
                      {LANGUAGES.map(l => (
                        <button key={l.id} onClick={() => setSelectedTopic(l.name)} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${selectedTopic === l.name ? (theme === 'dark' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-inner') : (theme === 'dark' ? 'border-slate-800 bg-slate-800/50 hover:border-slate-700 text-slate-400' : 'border-slate-50 bg-white hover:border-slate-200 text-slate-300')}`}>
                          <l.icon className={`w-6 h-6 ${selectedTopic === l.name ? (theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600') : 'text-slate-300'}`} />
                          <span className="text-[9px] font-black uppercase text-center">{l.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {quizTab === 'TOOLS' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-300">
                      {TOOLS.map(t => (
                        <button key={t.id} onClick={() => setSelectedTopic(t.name)} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${selectedTopic === t.name ? (theme === 'dark' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-inner') : (theme === 'dark' ? 'border-slate-800 bg-slate-800/50 hover:border-slate-700 text-slate-400' : 'border-slate-50 bg-white hover:border-slate-200 text-slate-300')}`}>
                          <t.icon className={`w-6 h-6 ${selectedTopic === t.name ? (theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600') : 'text-slate-300'}`} />
                          <span className="text-[9px] font-black uppercase text-center">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {quizTab === 'CUSTOM' && (
                    <div className="animate-in fade-in duration-300">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Input Targeted Topic</p>
                      <input type="text" placeholder="e.g. Advanced Quantum Computing" className={`w-full border rounded-xl p-5 font-bold outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-100'}`} value={customTopic} onChange={e => setCustomTopic(e.target.value)} />
                    </div>
                  )}
                  <div className={`mt-10 pt-10 border-t flex flex-wrap gap-6 items-end ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex-1 min-w-[200px]">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assessment Length</p>
                       <div className={`flex items-center gap-4 p-2 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                         <button onClick={() => setQuestionCount(Math.max(5, questionCount - 5))} className={`w-10 h-10 rounded-lg shadow-sm font-black active:scale-90 transition-transform ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'}`}>-</button>
                         <span className={`flex-grow text-center font-black text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{questionCount} Items</span>
                         <button onClick={() => setQuestionCount(Math.min(25, questionCount + 5))} className={`w-10 h-10 rounded-lg shadow-sm font-black active:scale-90 transition-transform ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'}`}>+</button>
                       </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Diagnostic Level</p>
                       <div className="flex gap-2">
                         {['Mixed', 'Beginner', 'Intermediate', 'Advanced'].map(l => (
                           <button key={l} onClick={() => setForcedDifficulty(l as any)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${forcedDifficulty === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : (theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')}`}>{l.slice(0,3)}</button>
                         ))}
                       </div>
                    </div>
                  </div>
                  <button onClick={startQuiz} disabled={loading} className="w-full bg-indigo-600 text-white font-black py-6 rounded-2xl shadow-2xl flex items-center justify-center gap-3 text-lg active:scale-[0.98] transition-all hover:bg-indigo-700 mt-10">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Synthesize Diagnostic</>}
                  </button>
                </div>
              </div>
            </div>
          ) : appState === 'TAKING_QUIZ' ? (
            <div className="max-w-3xl mx-auto animate-in zoom-in-95">
              {quizQuestions[currentQuestionIndex] && (
                <div className={`rounded-[2rem] border shadow-2xl p-10 relative transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className={`absolute top-0 left-0 w-full h-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}><div className="h-full bg-indigo-600 transition-all duration-500" style={{width: `${((currentQuestionIndex+1)/quizQuestions.length)*100}%`}} /></div>
                  <h3 className={`text-2xl font-black mb-10 leading-snug mt-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{quizQuestions[currentQuestionIndex].question}</h3>
                  <div className="space-y-4">
                    {quizQuestions[currentQuestionIndex].options.map((opt, i) => (
                      <button key={i} onClick={() => setAnswers(prev => ({...prev, [quizQuestions[currentQuestionIndex].id]: i}))} className={`w-full p-5 rounded-2xl border-2 text-left font-bold transition-all flex items-center gap-4 ${answers[quizQuestions[currentQuestionIndex].id] === i ? (theme === 'dark' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-inner') : (theme === 'dark' ? 'border-slate-800 bg-slate-800/50 hover:border-slate-700 text-slate-400' : 'border-slate-50 bg-white hover:border-slate-200 text-slate-600')}`}><div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${answers[quizQuestions[currentQuestionIndex].id] === i ? 'bg-indigo-600 text-white' : (theme === 'dark' ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>{String.fromCharCode(65 + i)}</div><span className="text-sm">{opt}</span></button>
                    ))}
                  </div>
                  <div className={`flex justify-between mt-12 pt-8 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(p => p - 1)} className="font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">Back</button>
                    {currentQuestionIndex === quizQuestions.length - 1 ? (
                      <button onClick={finishQuiz} disabled={loading || answers[quizQuestions[currentQuestionIndex].id] === undefined} className="bg-indigo-600 text-white px-12 py-4 rounded-xl font-black shadow-xl active:scale-95">Finish Assessment</button>
                    ) : (
                      <button onClick={() => setCurrentQuestionIndex(p => p + 1)} disabled={answers[quizQuestions[currentQuestionIndex].id] === undefined} className={`px-12 py-4 rounded-xl font-black shadow-xl active:scale-95 ${theme === 'dark' ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white'}`}>Next</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : appState === 'RESULTS' ? (
            isProcessingResults ? (
               <div className="max-w-xl mx-auto py-24 text-center animate-in zoom-in-95 duration-700">
                  <div className="relative w-32 h-32 mx-auto mb-10">
                    <div className={`absolute inset-0 rounded-[2.5rem] animate-pulse ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-100'}`}></div>
                    <BrainCircuit className="absolute inset-0 m-auto w-16 h-16 text-indigo-600 animate-bounce" />
                    <div className="absolute -inset-4 border-4 border-indigo-500/20 rounded-[3rem] animate-[spin_8s_linear_infinite]"></div>
                  </div>
                  <h2 className={`text-3xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Synthesizing Results</h2>
                  <div className="flex flex-col gap-3">
                     {[
                       { icon: Microscope, text: "Scanning conceptual nodes..." },
                       { icon: Activity, text: "Benchmarking cognitive performance..." },
                       { icon: Map, text: "Designing personalized trajectory..." },
                       { icon: ListChecks, text: "Grounding real-world web resources..." }
                     ].map((step, idx) => (
                       <div key={idx} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-1000 ${processingStep >= idx ? (theme === 'dark' ? 'bg-slate-900 shadow-sm border border-slate-800 opacity-100 scale-100' : 'bg-white shadow-sm border border-slate-100 opacity-100 scale-100') : 'opacity-0 scale-95 translate-y-4'}`}>
                         <step.icon className={`w-4 h-4 ${processingStep === idx ? 'text-indigo-600 animate-spin' : 'text-emerald-500'}`} />
                         <span className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{step.text}</span>
                         {processingStep > idx && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                       </div>
                     ))}
                  </div>
               </div>
            ) : (
              <div className="space-y-10 animate-in fade-in pb-20">
                <div className="flex items-center justify-between"><button onClick={() => setAppState('DASHBOARD')} className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}><LayoutDashboard className="w-4 h-4" /> Dashboard</button></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <div className={`p-8 rounded-[2rem] border shadow-xl text-center transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <div className={`w-24 h-24 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border shadow-inner ${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}><p className="text-4xl font-black text-indigo-600">{result?.overallScore}%</p></div>
                      <h3 className={`text-xl font-black leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{result?.learningPersona}</h3>
                      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-2">Mastery Quotient</p>
                    </div>
                    <div className={`p-8 rounded-[2rem] border shadow-lg transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Conceptual Analysis</h4>
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3"><ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /><span className="text-[10px] font-black uppercase text-emerald-600">Core Strengths</span></div>
                          <div className="flex flex-wrap gap-2">
                            {result?.strengths && result.strengths.length > 0 ? (
                              result.strengths.map(s => <span key={s} className={`px-3 py-1.5 rounded-lg text-[9px] font-black border ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{s}</span>)
                            ) : (
                              <span className="text-[9px] font-bold text-slate-300 italic">No specific strengths identified in this session</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-3"><ThumbsDown className="w-3.5 h-3.5 text-amber-500" /><span className="text-[10px] font-black uppercase text-amber-600">Growth Gaps</span></div>
                          <div className="flex flex-wrap gap-2">
                            {result?.weakAreas && result.weakAreas.length > 0 ? (
                              result.weakAreas.map(w => <span key={w} className={`px-3 py-1.5 rounded-lg text-[9px] font-black border ${theme === 'dark' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{w}</span>)
                            ) : (
                              <span className="text-[9px] font-bold text-slate-300 italic">No significant gaps detected in this session</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2 space-y-12">
                    <section>
                      <div className="flex items-center justify-between mb-6">
                          <h3 className={`text-2xl font-black flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}><BookOpen className="w-6 h-6 text-indigo-600" /> Personalized Path</h3>
                          <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg border flex items-center gap-1.5 ${theme === 'dark' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-indigo-600 bg-indigo-50 border-indigo-100'}`}><Sparkles className="w-3 h-3" /> Web Grounded Links</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{result?.recommendations.map(course => (<CourseCard key={course.id} course={course} theme={theme} isViewed={viewedCourses.some(c => c.id === course.id)} isEnrolled={enrolledIds.includes(course.id)} onView={handleCourseView} onToggleEnroll={toggleEnrollment} />))}</div>
                    </section>

                    <section>
                      <h3 className={`text-2xl font-black mb-6 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}><AlertTriangle className="w-6 h-6 text-rose-500" /> Review Session</h3>
                      <div className="space-y-6">
                          {result?.questions?.map((q, idx) => {
                            const userAns = result.userAnswers?.[q.id];
                            const isCorrect = userAns === q.correctAnswer;
                            if (isCorrect) return null;
                            const analysis = mistakeAnalyses[q.id];

                            return (
                              <div key={q.id} className={`p-8 rounded-3xl border shadow-sm animate-in slide-in-from-bottom-4 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 p-2 rounded-xl mt-1"><XCircle className="w-5 h-5" /></div>
                                    <div className="flex-1"><h4 className={`text-base font-black mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{q.question}</h4><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>{q.topic}</span></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50/50 border-rose-100'}`}><p className="text-[9px] font-black text-rose-600 uppercase mb-2">Your selection</p><p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{q.options[userAns ?? -1] || 'No selection'}</p></div>
                                    <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-100'}`}><p className="text-[9px] font-black text-emerald-600 uppercase mb-2">Correct Logic</p><p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{q.options[q.correctAnswer]}</p></div>
                                </div>
                                <div className={`p-5 rounded-2xl border mb-4 ${theme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'}`}><div className="flex items-center gap-2 mb-2"><Info className="w-3.5 h-3.5 text-indigo-600" /><p className="text-[9px] font-black text-indigo-600 uppercase">Conceptual Context</p></div><p className={`text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{q.explanation}</p></div>
                                
                                <button onClick={() => fetchMistakeAnalysis(q, userAns ?? -1)} disabled={analysisLoadingId === q.id} className={`w-full py-3 border-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'}`}>
                                    {analysisLoadingId === q.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5" /> AI Analysis of Misconception</>}
                                </button>

                                {analysis && (
                                  <div className={`mt-4 p-5 rounded-2xl animate-in zoom-in-95 ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`}>
                                      <p className="text-[9px] font-black uppercase text-indigo-400 mb-3">Neural Reasoning</p>
                                      <p className="text-xs font-medium leading-relaxed mb-4">{analysis.explanation}</p>
                                      <div className="h-px bg-white/10 mb-4" />
                                      <p className="text-[9px] font-black uppercase text-indigo-400 mb-2">Next Steps</p>
                                      <p className="text-xs italic text-slate-300">"{analysis.contrastReasoning}"</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )
          ) : appState === 'PROFILE' ? (
            <div className="space-y-10 animate-in fade-in pb-20">
              <div className={`rounded-[2rem] border shadow-sm overflow-hidden transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="p-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="relative">
                    <img src={user?.avatar} className={`w-32 h-32 rounded-[2.5rem] border-4 shadow-xl transition-all ${hasCognitiveBoost ? 'border-amber-400 animate-pulse' : (theme === 'dark' ? 'border-slate-800' : 'border-white')}`} alt="Avatar" />
                    <button onClick={() => setIsEditingProfile(true)} className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-all"><Edit3 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className={`text-4xl font-black leading-tight mb-2 flex items-center gap-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {user?.name}
                      {hasCognitiveBoost && <span className={`text-[10px] px-3 py-1 rounded-full border ${theme === 'dark' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>Neural Pioneer</span>}
                    </h2>
                    <p className={`font-bold text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                       <Calendar className="w-3.5 h-3.5" /> Member since {user?.joinedDate || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <section className={`p-8 rounded-[2rem] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <h3 className={`text-base font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Learning Statistics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`p-6 rounded-2xl text-center border transition-colors ${theme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100/50'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}><Trophy className="w-5 h-5" /></div>
                        <p className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stats.quizzes}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quizzes Taken</p>
                      </div>
                      <div className={`p-6 rounded-2xl text-center border transition-colors ${theme === 'dark' ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50/50 border-purple-100/50'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-600 shadow-sm ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}><BookOpen className="w-5 h-5" /></div>
                        <p className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stats.courses}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Courses Enrolled</p>
                      </div>
                      <div className={`p-6 rounded-2xl text-center border transition-colors ${theme === 'dark' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50/50 border-amber-100/50'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-sm ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}><Clock className="w-5 h-5" /></div>
                        <p className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stats.hours}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Hours</p>
                      </div>
                    </div>
                  </section>

                  <section className={`p-8 rounded-[2rem] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <h3 className={`text-base font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recent Quiz Results</h3>
                    {history.length > 0 ? (
                      <div className="space-y-4">
                        {history.slice(0, 3).map(h => (
                           <div key={h.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                             <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>{h.score}%</div>
                               <div><p className={`font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{h.domain}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(h.date).toLocaleDateString()}</p></div>
                             </div>
                             <ChevronRight className="w-5 h-5 text-slate-300" />
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No results to analyze</div>
                    )}
                  </section>
                </div>

                <div className="lg:col-span-1 space-y-8">
                  <section className={`p-8 rounded-[2rem] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <h3 className={`text-base font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recommended Courses</h3>
                    {viewedCourses.length > 0 ? (
                      <div className="space-y-3">
                        {viewedCourses.slice(0, 4).map(c => (
                          <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all border border-transparent cursor-pointer ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 hover:border-slate-600' : 'bg-slate-50 hover:bg-white hover:shadow-sm hover:border-slate-100'}`}>
                            <img src={`https://picsum.photos/seed/${c.id}/80/80`} className="w-10 h-10 rounded-lg object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                               <p className={`text-xs font-black truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{c.title}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase">{c.provider}</p>
                               {enrolledIds.includes(c.id) && <span className={`text-[7px] px-1 rounded font-black ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>ACTIVE</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                         <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">No courses enrolled yet</p>
                      </div>
                    )}
                  </section>

                  <section className={`p-8 rounded-[2rem] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <h3 className={`text-base font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Learning Goals</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-800'}`}>Complete 10 Assessments</p>
                          <p className="text-[10px] font-black text-indigo-600">{stats.quizzes}/10</p>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${Math.min(100, (stats.quizzes / 10) * 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-800'}`}>Enroll in 3 Courses</p>
                          <p className="text-[10px] font-black text-purple-600">{stats.courses}/3</p>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div className="h-full bg-purple-600 transition-all" style={{ width: `${Math.min(100, (stats.courses / 3) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : appState === 'SAVED_COURSES' ? (
            <div className="space-y-10 animate-in fade-in pb-20">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => setAppState('DASHBOARD')} className={`p-2 border rounded-xl shadow-sm transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}><ArrowLeft className="w-5 h-5" /></button>
                  <div>
                    <h2 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Course Hub</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Discover & Secure Your Mastery Path</p>
                  </div>
                </div>
                
                <form onSubmit={handleCourseSearch} className="w-full md:w-auto flex-1 max-w-lg relative">
                   <input 
                     type="text" 
                     placeholder="Search skills (e.g. Data Science, Figma)..." 
                     className={`w-full border rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none shadow-sm transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white focus:ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-50'}`}
                     value={courseSearchQuery}
                     onChange={e => setCourseSearchQuery(e.target.value)}
                   />
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <button type="submit" disabled={isSearchingCourses} className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                      {isSearchingCourses ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkle className="w-4 h-4" />}
                   </button>
                </form>
              </div>

              <div className={`flex gap-2 p-1 w-fit rounded-2xl border shadow-inner transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                 <button onClick={() => setCourseViewMode('VAULT')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${courseViewMode === 'VAULT' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400 hover:text-slate-600'}`}>Recommended Courses</button>
                 <button onClick={() => setCourseViewMode('DISCOVERY')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${courseViewMode === 'DISCOVERY' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400 hover:text-slate-600'}`}>Global Discovery</button>
              </div>

              {courseViewMode === 'VAULT' ? (
                <>
                  <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-indigo-100 overflow-hidden relative animate-in fade-in duration-500">
                    <div className="relative z-10">
                      <h3 className="text-xl font-black mb-2">Recommended Courses History</h3>
                      <p className="text-indigo-100 text-xs font-medium leading-relaxed max-w-xl">
                        This collection automatically stores courses suggested by assessments or interacted with via Discovery. It represents the boundaries of your explored learning curriculum.
                      </p>
                    </div>
                    <History className="absolute -right-10 -bottom-10 w-48 h-48 text-white/10" />
                  </div>
                  {viewedCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                      {viewedCourses.map(course => (
                        <CourseCard key={course.id} course={course} theme={theme} isViewed={true} isEnrolled={enrolledIds.includes(course.id)} onView={handleCourseView} onToggleEnroll={toggleEnrollment} />
                      ))}
                    </div>
                  ) : (
                    <div className={`rounded-[2rem] p-20 text-center border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <h4 className={`text-xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>No History Yet</h4>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium mb-6">Suggestions from quizzes and clicked discovery links will appear here.</p>
                      <button onClick={() => setAppState('QUIZ_CONFIG')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100">Start Assessment</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                   {isSearchingCourses ? (
                     <div className="py-32 text-center">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-6" />
                        <p className="text-slate-400 font-black tracking-widest uppercase text-[10px]">Scanning Educational Global Nodes...</p>
                     </div>
                   ) : courseSearchResults.length > 0 ? (
                     <>
                        <div className="flex items-center justify-between">
                           <h3 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Results for "{courseSearchQuery}"</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{courseSearchResults.length} Verified Sources Found</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {courseSearchResults.map(course => (
                             <CourseCard key={course.id} course={course} theme={theme} isViewed={viewedCourses.some(c => c.id === course.id)} isEnrolled={enrolledIds.includes(course.id)} onView={handleCourseView} onToggleEnroll={toggleEnrollment} />
                           ))}
                        </div>
                     </>
                   ) : (
                     <div className={`rounded-[2rem] p-20 text-center border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h4 className={`text-xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Explore Global Courses</h4>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Use the search bar above to discover real-world courses grounded in current web data.</p>
                     </div>
                   )}
                </div>
              )}
            </div>
          ) : appState === 'HISTORY_LIST' ? (
            <div className="space-y-10 animate-in fade-in pb-20">
              <div className="flex items-center justify-between"><button onClick={() => setAppState('DASHBOARD')} className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}><ArrowLeft className="w-4 h-4" /> Dashboard</button><h2 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Archive</h2></div>
              <div className="grid grid-cols-1 gap-4">
                {history.map((h, i) => (
                  <div key={h.id || i} className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between transition-all group cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-100 hover:border-indigo-200'}`} onClick={() => { if(h.metadata) { setResult({ id: h.id, domain: h.domain, scores: h.metadata.scores || [], weakAreas: h.metadata.weakAreas || [], strengths: h.metadata.strengths || [], recommendations: h.metadata.recommendations || [], date: h.date, overallScore: h.score, learningPersona: h.metadata.persona || 'Learner', userAnswers: h.metadata.answers, questions: h.metadata.questions }); setAppState('RESULTS'); } }}>
                    <div className="flex items-center gap-4"><div className={`p-3 rounded-xl font-black text-sm ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>{h.score}%</div><div><h4 className={`font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{h.domain}</h4><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(h.date).toLocaleDateString()}</p></div></div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                ))}
                {history.length === 0 && <div className={`rounded-[2rem] p-20 text-center border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}><History className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">History Empty</p></div>}
              </div>
            </div>
          ) : null}
      </main>
      <ChatBot user={user} theme={theme} activeResult={result} viewedCourses={viewedCourses} history={history} />
    </div>
  );
};

export default App;
