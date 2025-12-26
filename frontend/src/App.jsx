// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// import { useUserProfile } from "./UserProfileContext";
// import ReactMarkdown from 'react-markdown'; 

// dayjs.extend(relativeTime);

// const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

// const CATEGORIES = [
//   { id: "education", name: "Education", icon: "🏫" },
//   { id: "national", name: "National", icon: "🏛️" },
//   { id: "international", name: "International", icon: "🌍" },
//   { id: "regional", name: "Regional", icon: "📍" },
//   { id: "finance", name: "Finance", icon: "💰" },
//   { id: "politics", name: "Politics", icon: "⚖️" },
//   { id: "cinema", name: "Cinema", icon: "🎬" },
//   { id: "sports", name: "Sports", icon: "⚽" },
// ];

// function useNews(category, page, perPage, refreshKey) {
//   const [state, setState] = useState({
//     loading: true,
//     items: [],
//     total: 0,
//     error: null,
//   });

//   useEffect(() => {
//     let cancelled = false;

//     async function fetchData() {
//       setState((s) => ({ ...s, loading: true, error: null }));
//       try {
//         const res = await axios.get(`${API_BASE}/news/${category}`, {
//           params: { page, per_page: perPage },
//         });
//         if (!cancelled) {
//           setState({
//             loading: false,
//             items: res.data.items || [],
//             total: res.data.total || 0,
//             error: null,
//           });
//         }
//       } catch (err) {
//         if (!cancelled) {
//           setState({
//             loading: false,
//             items: [],
//             total: 0,
//             error: err.message || "Failed to fetch",
//           });
//         }
//       }
//     }

//     fetchData();
//     return () => {
//       cancelled = true;
//     };
//   }, [category, page, perPage, refreshKey]);

//   return state;
// }

// function NewsCard({ item }) {
//   const timeAgo = item.published ? dayjs(item.published).fromNow() : "Unknown";
//   // Strip HTML tags for summary preview
//   const summary = (item.summary && item.summary.replace(/<[^>]+>/g, "")) || "";

//   return (
//     <a
//       href={item.link}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-400 flex flex-col h-full"
//     >
//       <div className="relative h-48 bg-gray-100 overflow-hidden">
//         {item.thumbnail ? (
//           <img
//             src={item.thumbnail}
//             alt={item.title || "news image"}
//             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//             onError={(e) => {
//               e.currentTarget.style.display = "none";
//             }}
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-gray-300">
//             <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>
//           </div>
//         )}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//       </div>

//       <div className="p-5 flex flex-col flex-1">
//         <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
//           {item.title || "Untitled"}
//         </h3>

//         <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
//           {summary}
//         </p>

//         <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
//           <span className="text-xs text-gray-500 flex items-center">
//             🕒 {timeAgo}
//           </span>
//           <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
//             {item.source || "News"}
//           </span>
//         </div>
//       </div>
//     </a>
//   );
// }

// function LoadingSkeleton() {
//   return (
//     <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse h-96">
//       <div className="h-48 bg-gray-200" />
//       <div className="p-5 space-y-3">
//         <div className="h-6 bg-gray-200 rounded w-3/4" />
//         <div className="h-4 bg-gray-200 rounded" />
//         <div className="h-4 bg-gray-200 rounded w-5/6" />
//       </div>
//     </div>
//   );
// }

// function Pagination({ page, totalPages, onChange }) {
//   if (totalPages <= 1) return null;
//   const canPrev = page > 1;
//   const canNext = page < totalPages;

//   return (
//     <div className="flex items-center justify-center gap-4 mt-8">
//       <button
//         disabled={!canPrev}
//         onClick={() => canPrev && onChange(page - 1)}
//         className={`px-4 py-2 rounded-lg border font-medium ${
//           canPrev
//             ? "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
//             : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
//         }`}
//       >
//         Previous
//       </button>
//       <span className="text-gray-600 font-medium">Page {page} of {totalPages}</span>
//       <button
//         disabled={!canNext}
//         onClick={() => canNext && onChange(page + 1)}
//         className={`px-4 py-2 rounded-lg border font-medium ${
//           canNext
//             ? "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
//             : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
//         }`}
//       >
//         Next
//       </button>
//     </div>
//   );
// }

// // --- MAIN APP COMPONENT ---

// function AppInner() {
//   const { profile } = useUserProfile();
//   const [selectedCategory, setSelectedCategory] = useState("national");
//   const [page, setPage] = useState(1);
//   const perPage = 12;
//   const [refreshKey, setRefreshKey] = useState(0);

//   // Analysis States
//   const [analysisData, setAnalysisData] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);

//   const { loading, items, total, error } = useNews(
//     selectedCategory,
//     page,
//     perPage,
//     refreshKey
//   );

//   const totalPages = Math.ceil((total || 0) / perPage);

//   // Scroll to top on page change
//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }, [selectedCategory, page]);

//   // Handler for AI Analysis
//   const handleAnalyzeImpact = async () => {
//     if (!profile) return;
//     setIsAnalyzing(true);
//     setAnalysisData(null);
//     try {
//         // Send currently visible items + user profile
//         const response = await axios.post(`${API_BASE}/news/analyze`, {
//             user_profile: profile,
//             news_items: items
//         });
//         setAnalysisData(response.data.analysis);
//     } catch (err) {
//         console.error("Analysis failed", err);
//         alert("AI Agent is currently busy or failed to connect. Please try again.");
//     } finally {
//         setIsAnalyzing(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <span className="text-3xl">📰</span>
//             <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
//               News<span className="text-blue-600">Hub</span> AI
//             </h1>
//           </div>
          
//           <div className="flex items-center gap-3">
//              <div className="text-xs text-right hidden sm:block mr-2">
//                  <div className="font-bold text-gray-700">{profile?.city || "Guest"}</div>
//                  <div className="text-gray-500">{profile?.profession}</div>
//              </div>
//              <button
//                 onClick={() => setRefreshKey((k) => k + 1)}
//                 className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
//                 title="Refresh News"
//              >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.058M20 20v-5h-.058M15 10a5 5 0 1 1-10 0 5 5 0 0 1 10 0zm0 0l3 3"/></svg>
//              </button>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
//         {/* IMPACT ANALYSIS SECTION */}
//         <section className="mb-10">
//             <button
//                 onClick={handleAnalyzeImpact}
//                 disabled={isAnalyzing || loading || items.length === 0}
//                 className={`w-full relative group overflow-hidden rounded-2xl p-1 transition-all duration-300 ${
//                     isAnalyzing ? "cursor-wait opacity-80" : "hover:scale-[1.01] cursor-pointer"
//                 }`}
//             >
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient-xy"></div>
//                 <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 flex items-center justify-center gap-4">
//                     {isAnalyzing ? (
//                          <>
//                             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//                             <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-lg">
//                                 AI Agents are curating your strategy...
//                             </span>
//                          </>
//                     ) : (
//                         <>
//                             <span className="text-2xl">✨</span>
//                             <div className="text-left">
//                                 <h3 className="font-bold text-gray-800 dark:text-white text-lg">
//                                     Generate Personal Impact Briefing
//                                 </h3>
//                                 <p className="text-gray-500 text-sm">
//                                     Use Gemini Agents to analyze how this news affects your life in {profile?.city}.
//                                 </p>
//                             </div>
//                         </>
//                     )}
//                 </div>
//             </button>

//             {/* Analysis Result Display */}
//             {analysisData && (
//                 <div className="mt-6 bg-white border border-indigo-100 rounded-2xl p-8 shadow-xl animate-fade-in relative overflow-hidden">
//                     <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-purple-600"></div>
//                     <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//                         🤖 Agent Report for {profile?.profession}
//                     </h3>
//                     <div className="prose prose-blue max-w-none text-gray-700">
//                         <ReactMarkdown>{analysisData}</ReactMarkdown>
//                     </div>
//                 </div>
//             )}
//         </section>

//         {/* Categories */}
//         <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
//           <div className="flex space-x-2">
//             {CATEGORIES.map((cat) => (
//               <button
//                 key={cat.id}
//                 onClick={() => { setSelectedCategory(cat.id); setPage(1); setAnalysisData(null); }}
//                 className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
//                   selectedCategory === cat.id
//                     ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
//                     : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-blue-300"
//                 }`}
//               >
//                 <span className="mr-2">{cat.icon}</span>
//                 {cat.name}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Error State */}
//         {error && (
//           <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-8 flex items-center gap-3">
//              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"/></svg>
//              <div>
//                 <span className="font-bold">Error:</span> {error}
//              </div>
//           </div>
//         )}

//         {/* News Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {loading
//             ? Array.from({ length: perPage }).map((_, idx) => <LoadingSkeleton key={idx} />)
//             : items.map((item, idx) => (
//                 <NewsCard key={`${item.id}-${idx}`} item={item} />
//               ))}
//         </div>

//         {/* Empty State */}
//         {!loading && items.length === 0 && !error && (
//           <div className="text-center py-20">
//             <div className="text-6xl mb-4">📭</div>
//             <h3 className="text-xl font-bold text-gray-900">No updates here</h3>
//             <p className="text-gray-500">Check back later or try a different category.</p>
//           </div>
//         )}

//         {/* Pagination */}
//         {!loading && !error && items.length > 0 && (
//           <Pagination page={page} totalPages={totalPages} onChange={setPage} />
//         )}

//       </main>

//       <footer className="bg-white border-t border-gray-200 py-8 mt-12">
//         <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
//           <p>© 2024 NewsHub AI. Powered by CrewAI & Gemini.</p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default function App() {
//   return <AppInner />;
// }










import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUserProfile } from "./UserProfileContext";

dayjs.extend(relativeTime);

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const CATEGORIES = [
  { id: "education", name: "Education", icon: "🏫" },
  { id: "national", name: "National", icon: "🏛️" },
  { id: "international", name: "International", icon: "🌍" },
  { id: "regional", name: "Regional", icon: "📍" },
  { id: "finance", name: "Finance", icon: "💰" },
  { id: "politics", name: "Politics", icon: "⚖️" },
  { id: "cinema", name: "Cinema", icon: "🎬" },
  { id: "sports", name: "Sports", icon: "⚽" },
];

// --- COMPONENTS ---

// 1. Executive Summary Card (Now using Blue Theme)
const ExecutiveSummary = ({ text, score }) => (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 mb-8 shadow-xl flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
            <h3 className="text-blue-100 font-bold tracking-wider text-xs uppercase mb-2">Executive Briefing</h3>
            <p className="text-xl md:text-2xl font-light leading-relaxed">"{text}"</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[120px] backdrop-blur-sm border border-white/10">
            <span className="text-4xl font-bold text-white">{score}</span>
            <span className="text-xs text-blue-100 mt-1">Impact Score</span>
        </div>
    </div>
);

// 2. Risk Card
const AlertCard = ({ title, description, severity }) => {
    const colors = {
        high: "bg-red-50 border-red-200 text-red-900",
        medium: "bg-orange-50 border-orange-200 text-orange-900",
        low: "bg-yellow-50 border-yellow-200 text-yellow-900"
    };
    const badges = {
        high: "bg-red-100 text-red-700",
        medium: "bg-orange-100 text-orange-700",
        low: "bg-yellow-100 text-yellow-700"
    };

    return (
        <div className={`p-5 rounded-2xl border ${colors[severity]} flex flex-col gap-2 shadow-sm`}>
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg">{title}</h4>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${badges[severity]}`}>{severity} Risk</span>
            </div>
            <p className="text-sm opacity-90">{description}</p>
        </div>
    );
}

// 3. Action List
const ActionPlan = ({ steps }) => (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-6">
            <h3 className="text-white font-bold text-xl flex items-center gap-2">
                🚀 Strategic Action Plan
            </h3>
        </div>
        <div className="divide-y divide-gray-100">
            {steps.map((step, idx) => (
                <div key={idx} className="p-6 hover:bg-gray-50 transition-colors flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <h5 className="font-bold text-gray-800">{step.step}</h5>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">{step.urgency}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{step.action}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

function useNews(category, page, perPage, refreshKey) {
  const [state, setState] = useState({ loading: true, items: [], total: 0, error: null });

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await axios.get(`${API_BASE}/news/${category}`, { params: { page, per_page: perPage } });
        if (!cancelled) setState({ loading: false, items: res.data.items || [], total: res.data.total || 0, error: null });
      } catch (err) {
        if (!cancelled) setState({ loading: false, items: [], total: 0, error: err.message });
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [category, page, perPage, refreshKey]);

  return state;
}

function NewsCard({ item }) {
    return (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden h-full">
            <div className="h-40 bg-gray-100 overflow-hidden relative">
                {item.thumbnail ? (
                    <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600">{item.title}</h3>
                <div className="mt-auto flex justify-between text-xs text-gray-500 pt-2">
                    <span>{item.source}</span>
                    <span>{dayjs(item.published).fromNow()}</span>
                </div>
            </div>
        </a>
    )
}

function AppInner() {
  const { profile, clearProfile } = useUserProfile();
  const [selectedCategory, setSelectedCategory] = useState("national");
  const [page, setPage] = useState(1);
  const perPage = 9;
  const [refreshKey, setRefreshKey] = useState(0);

  // Analysis State
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { loading, items, total } = useNews(selectedCategory, page, perPage, refreshKey);

  const handleAnalyze = async () => {
    if (!profile) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
        const res = await axios.post(`${API_BASE}/news/analyze`, {
            user_profile: profile,
            news_items: items
        });
        setAnalysis(res.data);
    } catch (err) {
        alert("Analysis failed. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="font-black text-xl tracking-tight flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span>News<span className="text-blue-600">OS</span></span>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                    <div className="text-sm font-bold text-gray-800">{profile?.name || "Guest"}</div>
                    <div className="text-xs text-gray-500">{profile?.profession}</div>
                </div>
                <button onClick={clearProfile} className="text-xs text-gray-400 hover:text-red-500 font-medium">Reset Profile</button>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* HERO SECTION: Analysis Trigger */}
        <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Good Evening, {profile?.name}</h1>
            <p className="text-gray-500 mb-6">Here is your daily intelligence briefing.</p>

            {!analysis ? (
                <button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                    {isAnalyzing ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>Analyzing {items.length} stories against your goals...</span>
                        </>
                    ) : (
                        <>
                           <span className="text-2xl">✨</span>
                           <span className="font-bold text-lg">Generate My Personal Impact Report</span>
                        </>
                    )}
                </button>
            ) : (
                <div className="animate-fade-in-up">
                    <ExecutiveSummary text={analysis.executive_summary} score={analysis.impact_score} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Col: Risks & Opportunities */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-500 uppercase text-xs mb-3 tracking-wide">Critical Alerts</h3>
                                <div className="space-y-3">
                                    {analysis.critical_alerts.map((alert, i) => (
                                        <AlertCard key={i} {...alert} />
                                    ))}
                                    {analysis.critical_alerts.length === 0 && <p className="text-sm text-gray-400 italic">No critical risks detected.</p>}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-500 uppercase text-xs mb-3 tracking-wide">Opportunities</h3>
                                <div className="space-y-3">
                                    {analysis.opportunities.map((opp, i) => (
                                        <div key={i} className="p-5 rounded-2xl border border-green-200 bg-green-50 shadow-sm">
                                            <h4 className="font-bold text-green-900">{opp.title}</h4>
                                            <p className="text-sm text-green-800 mt-1 opacity-90">{opp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Action Plan */}
                        <div className="lg:col-span-2">
                             <ActionPlan steps={analysis.action_plan} />
                             <button 
                                onClick={() => setAnalysis(null)} 
                                className="mt-4 text-sm text-gray-500 underline hover:text-blue-600"
                            >
                                Close Report
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* NEWS FEED */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {CATEGORIES.map(c => (
                <button 
                    key={c.id} 
                    onClick={() => {setSelectedCategory(c.id); setPage(1);}}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedCategory === c.id ? "bg-gray-900 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                    {c.icon} {c.name}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
                <div className="col-span-3 text-center py-20 text-gray-400">Loading latest intel...</div>
            ) : (
                items.map((item, idx) => <NewsCard key={idx} item={item} />)
            )}
        </div>

      </main>
    </div>
  );
}

export default function App() {
  return <AppInner />;
}
