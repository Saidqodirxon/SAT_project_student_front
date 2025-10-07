// import { useEffect, useMemo, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle, Home, Flag
// } from 'lucide-react';
// import useStudentStore from '../store/useStudentStore';

// export default function TestPage() {
//   const { testId } = useParams();
//   const navigate = useNavigate();

//   const {
//     currentTest,
//     currentSection,
//     currentQuestions,
//     currentAnswers,
//     timeRemaining,
//     startTest,
//     startSection,
//     saveLocalAnswer,
//     completeSection,
//     completeTest,
//     updateTimer,
//     decrementTimer,
//   } = useStudentStore();

//   // local UI state (optimistic)
//   const [idx, setIdx] = useState(0);
//   const [localAnswers, setLocalAnswers] = useState({}); // { [questionId]: choiceId }
//   const [marked, setMarked] = useState({});             // { [questionId]: true }

//   const q = useMemo(() => currentQuestions?.[idx] || null, [currentQuestions, idx]);

//   const [showConfirm, setShowConfirm] = useState(false);
//   const [timerHydrated, setTimerHydrated] = useState(false);

//   // Reset hydration flag whenever the section changes
//   useEffect(() => {
//     setTimerHydrated(false);
//   }, [currentSection?.id]);

//   // Mark hydrated once we see a positive number
//   useEffect(() => {
//     if (typeof timeRemaining === 'number' && timeRemaining > 0) {
//       setTimerHydrated(true);
//     }
//   }, [timeRemaining]);

//   // Only auto-complete when hydrated AND now actually expired
//   useEffect(() => {
//     if (!currentSection) return;
//     if (typeof timeRemaining !== 'number') return; // ignore null/undefined
//     if (!timerHydrated) return;                    // ignore first 0 before load
//     if (timeRemaining <= 0) {
//       setShowConfirm(false);
//       handleCompleteSection();
//     }
//   }, [timeRemaining, currentSection?.id, timerHydrated]);

//   // INIT: start test -> start current/first section
//   useEffect(() => {
//     let on = true;
//     (async () => {
//       const res = await startTest(Number(testId));
//       if (!on) return;
//       const next = res.current_section || res.sections?.[0];
//       if (next) {
//         await startSection(Number(testId), next.id);
//         setIdx(0);
//         setLocalAnswers({});
//         setMarked({});
//       }
//     })().catch(console.error);
//     return () => { on = false; };
//   }, [testId, startTest, startSection]);

//   // When new questions arrive, seed localAnswers from store (so persisted choices show selected)
//   useEffect(() => {
//     if (!Array.isArray(currentQuestions)) return;
//     const seeded = { ...localAnswers };
//     currentQuestions.forEach((qq) => {
//       const cid = currentAnswers[qq.id] ?? qq.selected_choice_id ?? null;
//       if (cid != null) seeded[qq.id] = cid;
//     });
//     setLocalAnswers(seeded);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentQuestions, currentAnswers]);

  

//   const formatTime = (s = 0) => {
//     const m = Math.max(0, Math.floor(s / 60));
//     const r = Math.max(0, s % 60);
//     return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
//   };
//   const timerClass =
//     timeRemaining != null && timeRemaining <= 60
//       ? 'bg-red-600'
//       : timeRemaining != null && timeRemaining <= 300
//       ? 'bg-amber-500'
//       : 'bg-blue-600';

//   const selectedChoiceId = q ? (localAnswers[q.id] ?? null) : null;


//   useEffect(() => {
//     if (!currentSection) return;
//     const id = setInterval(() => {
//       decrementTimer();
//     }, 1000);
//     return () => clearInterval(id);
//   }, [currentSection?.id, decrementTimer]);


//   const handleSelect = (choiceId) => {
//     if (!q) return;
//     // Optimistic UI
//     setLocalAnswers((prev) => ({ ...prev, [q.id]: choiceId }));
//     // Persist in store
//     saveLocalAnswer(q.id, choiceId);
//   };

//   const toggleMark = () => {
//     if (!q) return;
//     setMarked((m) => ({ ...m, [q.id]: !m[q.id] }));
//   };

//   const goNext = () => {
//     if (!currentQuestions?.length) return;
//     setIdx((i) => Math.min(currentQuestions.length - 1, i + 1));
//   };
//   const goPrev = () => setIdx((i) => Math.max(0, i - 1));

//   const handleCompleteSection = async () => {
//   if (!currentSection || !currentTest) return;
//   try {
//     await completeSection(Number(testId), currentSection.id); // bulk inside store
//     const i = currentTest.sections.findIndex((s) => s.id === currentSection.id);
//     const hasNext = i !== -1 && i < currentTest.sections.length - 1;
//     if (hasNext) {
//       const next = currentTest.sections[i + 1];
//       await startSection(Number(testId), next.id); // will compute remaining from started_at
//       setIdx(0);
//       setLocalAnswers({});
//       setMarked({});
//     } else {
//       await completeTest(Number(testId));
//       navigate('/dashboard');
//     }
//   } catch (e) {
//     console.error(e);
//   }
// };

//   // LOADING
//   if (!currentTest || !currentSection) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
//           <p className="text-gray-600">Loading…</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Top bar */}
//       <div className="bg-white border-b">
//         <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//               <BookOpen className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h1 className="text-base font-bold text-gray-900">
//                 {currentSection.name}
//               </h1>
//               <p className="text-xs text-gray-500">Section</p>
//             </div>
//           </div>
//           <div className={`${timerClass} text-white px-4 py-1.5 rounded-lg flex items-center gap-2`}>
//             <Clock className="w-4 h-4" />
//             <span className="font-semibold">{formatTime(timeRemaining ?? 0)}</span>
//           </div>
//           <button
//             onClick={() => navigate('/dashboard')}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
//           >
//             <Home className="w-4 h-4" /> Dashboard
//           </button>
//         </div>
//       </div>

//       {/* Two-pane like Bluebook */}
//       <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-12 gap-6">
//         {/* Left: passage (if present) */}
//         <aside className="col-span-5">
//           <div className="bg-white border rounded-lg p-5 min-h-[60vh]">
//             {q?.passage_text ? (
//               <div className="prose max-w-none">
//                 <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
//                   {q.passage_text}
//                 </p>
//               </div>
//             ) : (
//               <div className="text-gray-400">No passage for this question.</div>
//             )}
//           </div>
//         </aside>

//         {/* Right: question + choices */}
//         <main className="col-span-7">
//           <div className="bg-white border rounded-lg p-5">
//             {/* header row: number + Mark for review */}
//             <div className="flex items-center justify-between mb-4">
//               <div className="text-sm text-gray-500">
//                 Question {idx + 1} of {currentQuestions.length}
//               </div>
//               <button
//                 onClick={toggleMark}
//                 className={`flex items-center gap-2 px-3 py-1.5 rounded border text-sm ${
//                   marked[q?.id]
//                     ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
//                     : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
//                 }`}
//                 title="Mark for review"
//               >
//                 <Flag className="w-4 h-4" />
//                 {marked[q?.id] ? 'Marked' : 'Mark for Review'}
//               </button>
//             </div>

//             {/* stem */}
//             <div className="text-[17px] font-medium text-gray-900 whitespace-pre-wrap mb-5">
//               {q?.question_text}
//             </div>

//             {/* choices */}
//             <div className="space-y-3 mb-8">
//               {q?.choices?.map((c) => {
//                 const isSelected = selectedChoiceId === c.id;
//                 return (
//                   <button
//                     key={c.id}
//                     onClick={() => handleSelect(c.id)}
//                     className={`w-full text-left p-4 rounded-lg border-2 transition-all focus:outline-none ${
//                       isSelected
//                         ? 'border-blue-600 bg-blue-50'
//                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                     }`}
//                   >
//                     <div className="flex items-start gap-3">
//                       <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm font-semibold">
//                         {c.choice_label}
//                       </span>
//                       <span className="text-gray-900">{c.choice_text}</span>
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>

//             {/* nav row */}
//             <div className="flex items-center justify-between">
//               <button
//                 onClick={goPrev}
//                 disabled={idx === 0}
//                 className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
//               >
//                 <ArrowLeft className="w-4 h-4" /> Previous
//               </button>

//               {idx === currentQuestions.length - 1 ? (
//                 <button
//                 onClick={() => setShowConfirm(true)}
//                 className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
//               >
//                 Complete Section <CheckCircle className="w-4 h-4" />
//               </button>
//               ) : (
//                 <button
//                   onClick={goNext}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
//                 >
//                   Next <ArrowRight className="w-4 h-4" />
//                 </button>
//               )}
//             </div>
//           </div>
//           {showConfirm && (
//             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg p-6 w-full max-w-md">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Finish this section?</h3>
//                 <p className="text-gray-600 mb-6">
//                   You won’t be able to change your answers after you finish this section.
//                 </p>
//                 <div className="flex justify-end gap-3">
//                   <button
//                     onClick={() => setShowConfirm(false)}
//                     className="px-4 py-2 text-gray-700 hover:text-gray-900"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={async () => { setShowConfirm(false); await handleCompleteSection(); }}
//                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//                   >
//                     Finish Section
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//           {/* bottom rail with question numbers (compact) */}
//           <div className="mt-4 bg-white border rounded-lg p-3">
//             <div className="grid grid-cols-12 gap-1">
//               {currentQuestions?.map((qq, i) => {
//                 const sel = localAnswers[qq.id] != null;
//                 const isActive = i === idx;
//                 const isMarked = marked[qq.id];
//                 return (
//                   <button
//                     key={qq.id}
//                     onClick={() => setIdx(i)}
//                     className={`h-9 rounded border text-sm font-medium ${
//                       isActive
//                         ? 'bg-blue-600 text-white border-blue-600'
//                         : sel
//                         ? 'bg-green-100 text-green-800 border-green-300'
//                         : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                     } relative`}
//                   >
//                     {i + 1}
//                     {isMarked && (
//                       <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-3 h-3 rounded-full bg-yellow-400" />
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle, Home, Flag, ChevronDown, 
  Eye, X, Undo, MessageSquare, Minus, Grid3x3, AlertCircle, StickyNote, Edit3, Calculator
} from 'lucide-react';
import useStudentStore from '../store/useStudentStore';

const TestPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const {
    currentTest,
    currentSection,
    currentQuestions,
    currentAnswers,
    timeRemaining,
    startTest,
    startSection,
    saveLocalAnswer,
    completeSection,
    completeTest,
    updateTimer,
    decrementTimer,
  } = useStudentStore();

  // local UI state (optimistic)
  const [idx, setIdx] = useState(0);
  const [localAnswers, setLocalAnswers] = useState({}); // { [questionId]: choiceId }
  const [marked, setMarked] = useState({});             // { [questionId]: true }
  const [showPreview, setShowPreview] = useState(false);
  const [hidePassage, setHidePassage] = useState(false);
  
  // Strikethrough for answer choices
  const [strikethroughs, setStrikethroughs] = useState({}); // { [questionId]: [choiceId] }
  
  // Notes system
  const [notes, setNotes] = useState({}); // { [questionId]: noteText }
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState('');

  // Desmos Calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const calculatorRef = useRef(null);
  const calculatorInstanceRef = useRef(null);

  const q = useMemo(() => currentQuestions?.[idx] || null, [currentQuestions, idx]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [timerHydrated, setTimerHydrated] = useState(false);

  // Reset hydration flag whenever the section changes
  useEffect(() => {
    setTimerHydrated(false);
  }, [currentSection?.id]);

  // Mark hydrated once we see a positive number
  useEffect(() => {
    if (typeof timeRemaining === 'number' && timeRemaining > 0) {
      setTimerHydrated(true);
    }
  }, [timeRemaining]);

  // Only auto-complete when hydrated AND now actually expired
  useEffect(() => {
    if (!currentSection) return;
    if (typeof timeRemaining !== 'number') return;
    if (!timerHydrated) return;
    if (timeRemaining <= 0) {
      setShowConfirm(false);
      handleCompleteSection();
    }
  }, [timeRemaining, currentSection?.id, timerHydrated]);

  // INIT: start test -> start current/first section
  useEffect(() => {
    let on = true;
    (async () => {
      const res = await startTest(Number(testId));
      if (!on) return;
      const next = res.current_section || res.sections?.[0];
      if (next) {
        await startSection(Number(testId), next.id);
        setIdx(0);
        setLocalAnswers({});
        setMarked({});
      }
    })().catch(console.error);
    return () => { on = false; };
  }, [testId, startTest, startSection]);

  // When new questions arrive, seed localAnswers from store
  useEffect(() => {
    if (!Array.isArray(currentQuestions)) return;
    const seeded = { ...localAnswers };
    currentQuestions.forEach((qq) => {
      const cid = currentAnswers[qq.id] ?? qq.selected_choice_id ?? null;
      if (cid != null) seeded[qq.id] = cid;
    });
    setLocalAnswers(seeded);
  }, [currentQuestions, currentAnswers]);

  const formatTime = (s = 0) => {
    const m = Math.max(0, Math.floor(s / 60));
    const r = Math.max(0, s % 60);
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  const timerClass =
    timeRemaining != null && timeRemaining <= 60
      ? 'bg-red-600'
      : timeRemaining != null && timeRemaining <= 300
      ? 'bg-amber-500'
      : 'bg-blue-600';

  const selectedChoiceId = q ? (localAnswers[q.id] ?? null) : null;

  // Initialize Desmos Calculator
  useEffect(() => {
    if (showCalculator && calculatorRef.current && !calculatorInstanceRef.current) {
      if (window.Desmos) {
        calculatorInstanceRef.current = window.Desmos.GraphingCalculator(calculatorRef.current, {
          keypad: true,
          expressions: true,
          settingsMenu: true,
          zoomButtons: true,
          expressionsTopbar: true,
          border: false,
        });
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (calculatorInstanceRef.current) {
        calculatorInstanceRef.current = null;
      }
    };
  }, [showCalculator]);

  useEffect(() => {
    if (!currentSection) return;
    const id = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => clearInterval(id);
  }, [currentSection?.id, decrementTimer]);

  const handleSelect = (choiceId) => {
    if (!q) return;
    setLocalAnswers((prev) => ({ ...prev, [q.id]: choiceId }));
    saveLocalAnswer(q.id, choiceId);
  };

  const toggleMark = () => {
    if (!q) return;
    setMarked((m) => ({ ...m, [q.id]: !m[q.id] }));
  };

  const toggleStrikethrough = (choiceId) => {
    if (!q) return;
    setStrikethroughs((prev) => {
      const current = prev[q.id] || [];
      const isStriked = current.includes(choiceId);
      return {
        ...prev,
        [q.id]: isStriked 
          ? current.filter(id => id !== choiceId)
          : [...current, choiceId]
      };
    });
  };

  const handleNoteOpen = () => {
    if (q) {
      setCurrentNote(notes[q.id] || '');
      setShowNoteModal(true);
    }
  };

  const handleNoteSave = () => {
    if (q) {
      setNotes((prev) => ({
        ...prev,
        [q.id]: currentNote.trim()
      }));
      setShowNoteModal(false);
    }
  };

  const handleNoteDelete = () => {
    if (q) {
      setNotes((prev) => {
        const updated = { ...prev };
        delete updated[q.id];
        return updated;
      });
      setCurrentNote('');
      setShowNoteModal(false);
    }
  };

  const goNext = () => {
    if (!currentQuestions?.length) return;
    setIdx((i) => Math.min(currentQuestions.length - 1, i + 1));
  };
  const goPrev = () => setIdx((i) => Math.max(0, i - 1));

  const handleCompleteSection = async () => {
    if (!currentSection || !currentTest) return;
    try {
      await completeSection(Number(testId), currentSection.id);
      const i = currentTest.sections.findIndex((s) => s.id === currentSection.id);
      const hasNext = i !== -1 && i < currentTest.sections.length - 1;
      if (hasNext) {
        const next = currentTest.sections[i + 1];
        await startSection(Number(testId), next.id);
        setIdx(0);
        setLocalAnswers({});
        setMarked({});
      } else {
        await completeTest(Number(testId));
        navigate('/dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Test Preview Modal - Modern Enhanced Design
  const TestPreview = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{currentSection.name}</h2>
            <p className="text-blue-100 text-sm mt-1">Question Navigator</p>
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-white p-4 border-b border-blue-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{currentQuestions?.length || 0}</div>
              <div className="text-xs text-gray-600 font-medium">Total Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{Object.keys(localAnswers).length}</div>
              <div className="text-xs text-gray-600 font-medium">Answered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{Object.values(marked).filter(Boolean).length}</div>
              <div className="text-xs text-gray-600 font-medium">Marked</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-sm"></div>
              <span className="text-gray-700">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg shadow-sm"></div>
              <span className="text-gray-700">Answered</span>
            </div>
            <div className="flex items-center gap-2 relative">
              <div className="w-8 h-8 bg-white border-2 border-red-500 rounded-lg shadow-sm">
                <Flag className="absolute -top-1 -right-1 w-4 h-4 text-red-600 fill-current" />
              </div>
              <span className="text-gray-700">For Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg shadow-sm"></div>
              <span className="text-gray-700">Unanswered</span>
            </div>
          </div>
        </div>

        {/* Question Grid */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-8 lg:grid-cols-10 gap-3">
            {currentQuestions?.map((qq, i) => {
              const answered = localAnswers[qq.id] != null;
              const isActive = i === idx;
              const isMarked = marked[qq.id];
              return (
                <button
                  key={qq.id}
                  onClick={() => {
                    setIdx(i);
                    setShowPreview(false);
                  }}
                  className={`h-12 rounded-lg border-2 text-sm font-bold relative transition-all hover:scale-105 ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                      : answered && !isMarked
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                      : isMarked
                      ? 'bg-white text-gray-900 border-red-500 shadow-md'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {i + 1}
                  {isMarked && !isActive && (
                    <Flag className="absolute -top-1.5 -right-1.5 w-4 h-4 text-red-600 fill-current drop-shadow-md" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 flex justify-end">
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // LOADING
  if (!currentTest || !currentSection) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Top Header Bar - Modern Bluebook style */}
      <div className="bg-white border-b-2 border-blue-100 shadow-md flex-shrink-0">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Module name */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h1 className="text-base lg:text-lg font-bold text-gray-900">
                  {currentSection.name || 'Reading & Writing'}
                </h1>
              </div>
            </div>

            {/* Center-Right: Timer and controls */}
            <div className="flex items-center gap-3">
              <div className={`${timerClass} text-white px-4 py-2 rounded-lg font-bold text-base lg:text-lg flex items-center gap-2 shadow-lg`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeRemaining ?? 0)}
              </div>
              <button 
                onClick={() => setShowCalculator(!showCalculator)}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                  showCalculator
                    ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-100'
                }`}
                title="Graphing Calculator"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden md:inline">Calculator</span>
              </button>
              <button 
                onClick={() => setHidePassage(!hidePassage)}
                className="hidden md:flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
              >
                <Eye className={`w-4 h-4 ${hidePassage ? 'text-gray-400' : 'text-blue-600'}`} />
                {hidePassage ? 'Show' : 'Hide'}
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="hidden lg:flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Exit
              </button>
            </div>
          </div>

          {/* Enhanced Progress Indicator */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Question {idx + 1} of {currentQuestions?.length || 0}</span>
              <span className="font-medium text-blue-600">{Object.keys(localAnswers).length} answered</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden relative shadow-inner">
              {/* Multi-color gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-purple-500 to-green-500 opacity-30"></div>
              {/* Active progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-700 ease-out shadow-md"
                style={{ width: `${((idx + 1) / (currentQuestions?.length || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Split View - Enhanced Design */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane - Passage */}
        {!hidePassage && (
          <div className="w-full md:w-1/2 bg-white border-r-2 border-blue-100 overflow-y-auto flex-shrink-0 shadow-lg">
            <div className="p-6 lg:p-8 max-w-4xl">
              {q?.passage_text ? (
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-serif text-base lg:text-lg selection:bg-yellow-200">
                    {q.passage_text}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <div className="text-center">
                    <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium">No passage for this question</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Pane - Question & Answers */}
        <div className={`${hidePassage ? 'w-full' : 'w-full md:w-1/2'} bg-gradient-to-br from-white to-blue-50 overflow-y-auto flex-shrink-0`}>
          <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            {/* Mobile passage accordion */}
            {q?.passage_text && (
              <div className="md:hidden mb-6">
                <details className="border-2 border-blue-200 rounded-xl overflow-hidden shadow-md">
                  <summary className="px-4 py-3 cursor-pointer bg-gradient-to-r from-blue-50 to-white font-semibold text-gray-800 flex items-center justify-between hover:bg-blue-100 transition-colors">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      View Passage
                    </span>
                    <ChevronDown className="w-5 h-5 text-blue-600" />
                  </summary>
                  <div className="p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-serif max-h-80 overflow-y-auto bg-white">
                    {q.passage_text}
                  </div>
                </details>
              </div>
            )}

            {/* Question Header with Enhanced Design */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl font-bold flex items-center justify-center text-xl shadow-lg">
                  {idx + 1}
                </div>
                <button
                  onClick={toggleMark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all shadow-md ${
                    marked[q?.id]
                      ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:text-red-600'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {marked[q?.id] ? 'Marked' : 'Mark for Review'}
                  </span>
                  <span className="sm:hidden">Mark</span>
                </button>
              </div>

              {/* Tools - Right Side */}
              <div className="flex items-center gap-2">
                {/* Note button */}
                <button
                  onClick={handleNoteOpen}
                  className={`p-2.5 rounded-lg border-2 transition-all shadow-sm ${
                    notes[q?.id]
                      ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                      : 'text-gray-600 hover:bg-amber-50 border-gray-300 hover:border-amber-300'
                  }`}
                  title="Add Note"
                >
                  <StickyNote className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowPreview(true)}
                  className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg border-2 border-blue-200 transition-colors shadow-sm"
                  title="Question Navigator"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Question Text with Enhanced Typography */}
            <div className="mb-8 p-6 bg-white rounded-xl shadow-md border-l-4 border-blue-500">
              <p className="text-lg lg:text-xl text-gray-900 leading-relaxed font-medium">
                {q?.question_text}
              </p>
            </div>

            {/* Answer Choices - Modern Design with Strikethrough */}
            <div className="space-y-4">
              {q?.choices?.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                const isStriked = strikethroughs[q?.id]?.includes(choice.id);
                
                return (
                  <div key={choice.id} className="relative group">
                    <button
                      onClick={() => handleSelect(choice.id)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg scale-[1.02]'
                          : isStriked
                          ? 'border-gray-300 bg-gray-50 opacity-60'
                          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                      }`}
                    >
                      {/* Selection indicator line */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 to-blue-400"></div>
                      )}
                      
                      <div className={`flex items-start gap-4 ${isStriked ? 'line-through' : ''}`}>
                        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-lg flex-shrink-0 transition-all ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-600 text-white shadow-lg' 
                            : isStriked
                            ? 'border-gray-400 bg-gray-200 text-gray-500'
                            : 'border-gray-400 text-gray-600 group-hover:border-blue-500 group-hover:text-blue-600'
                        }`}>
                          {choice.choice_label}
                        </div>
                        <div className="flex-1 pt-2">
                          <span className={`text-base lg:text-lg leading-relaxed ${
                            isStriked ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {choice.choice_text}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </button>
                    
                    {/* Strikethrough button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStrikethrough(choice.id);
                      }}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                        isStriked
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={isStriked ? 'Remove strikethrough' : 'Strike through'}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Notes display */}
            {notes[q?.id] && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <StickyNote className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800 mb-1">Your Note:</p>
                    <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                      {notes[q.id]}
                    </p>
                  </div>
                  <button
                    onClick={handleNoteOpen}
                    className="p-1 text-amber-600 hover:bg-amber-100 rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Enhanced Modern Design */}
      <div className="bg-gradient-to-r from-white to-blue-50 border-t-2 border-blue-200 px-4 py-4 flex-shrink-0 shadow-2xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Back to dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          {/* Center: Question selector with navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={idx === 0}
              className="p-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowPreview(true)}
              className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg"
            >
              <span className="text-sm lg:text-base">Question {idx + 1} of {currentQuestions?.length || 0}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              onClick={goNext}
              disabled={idx === currentQuestions?.length - 1}
              className="p-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Next/Finish button */}
          <div>
            {idx === currentQuestions?.length - 1 ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Finish Section
              </button>
            ) : (
              <button
                onClick={goNext}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <StickyNote className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Add Note</h3>
                  <p className="text-amber-100 text-sm">Question {idx + 1}</p>
                </div>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your note or reminder:
                </label>
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Write your thoughts, reminders, or strategies here..."
                  className="w-full h-48 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-base leading-relaxed"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  {currentNote.length} characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {notes[q?.id] && (
                  <button
                    onClick={handleNoteDelete}
                    className="px-6 py-3 text-red-600 hover:bg-red-50 border-2 border-red-300 rounded-xl font-semibold transition-all"
                  >
                    Delete Note
                  </button>
                )}
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 px-6 py-3 text-gray-700 hover:bg-gray-100 border-2 border-gray-300 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNoteSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white rounded-xl font-bold transition-all shadow-lg"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Modern Enhanced Design */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header with icon */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Submit Section?</h3>
                  <p className="text-green-100 text-sm mt-1">Review your answers before submitting</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Once you submit this section, you <strong>won't be able to return to it</strong>. 
                Please make sure you've answered all questions you want to complete.
              </p>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{currentQuestions?.length || 0}</div>
                  <div className="text-xs text-gray-600 font-medium mt-1">Total</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{Object.keys(localAnswers).length}</div>
                  <div className="text-xs text-gray-600 font-medium mt-1">Answered</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                  <div className="text-3xl font-bold text-red-600">
                    {(currentQuestions?.length || 0) - Object.keys(localAnswers).length}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">Unanswered</div>
                </div>
              </div>

              {/* Warning if unanswered */}
              {(currentQuestions?.length || 0) - Object.keys(localAnswers).length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Unanswered Questions</p>
                      <p className="text-xs text-amber-700 mt-1">
                        You have {(currentQuestions?.length || 0) - Object.keys(localAnswers).length} unanswered question(s). 
                        Would you like to review them first?
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-6 py-3 text-gray-700 hover:bg-gray-100 border-2 border-gray-300 rounded-xl font-semibold transition-all"
                >
                  Review Answers
                </button>
                <button
                  onClick={async () => {
                    setShowConfirm(false);
                    await handleCompleteSection();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Submit Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desmos Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Calculator className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Graphing Calculator</h3>
                  <p className="text-blue-100 text-xs">Powered by Desmos</p>
                </div>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Calculator Container */}
            <div className="flex-1 overflow-hidden">
              <div 
                ref={calculatorRef} 
                className="w-full h-full"
                style={{ minHeight: '500px' }}
              />
            </div>

            {/* Footer Info */}
            <div className="bg-gray-50 p-3 border-t border-gray-200 flex-shrink-0">
              <p className="text-xs text-gray-600 text-center">
                This calculator is provided for your convenience during the test. You can graph functions, calculate values, and more.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test preview modal */}
      {showPreview && <TestPreview />}
    </div>
  );
};

export default TestPage;