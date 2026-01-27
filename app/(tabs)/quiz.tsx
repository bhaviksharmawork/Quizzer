import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { io, Socket } from 'socket.io-client';

// Live Quiz Question Screen (Kahoot-style)

export default function LiveQuizQuestionScreen() {
  console.log('🚀 QUIZ SCREEN COMPONENT LOADED/RE-RENDERED');
  const router = useRouter();

  const params = useLocalSearchParams();
  const [latestRoomId, setLatestRoomId] = useState<string>('111111');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // Start at 0, will be set when quiz loads
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousRoomId, setPreviousRoomId] = useState<string>('');
  const questionStartTime = useRef<number>(Date.now());

  // Use useFocusEffect to capture params when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('📱 QUIZ SCREEN GAINED FOCUS');
      console.log('Quiz screen - All params received:', params);
      console.log('Quiz screen - params.roomId:', params.roomId);
      console.log('Quiz screen - params.id:', params.id);

      // Always reset state when screen gains focus (new quiz session)
      const newRoomId = (params.roomId as string) || (params.id as string) || '111111';
      console.log('Quiz screen - New room ID from params:', newRoomId);

      // Reset all quiz state for fresh start
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setSelected(null);
      setAnswers([]);
      setTimeLeft(0);
      setLoading(true);
      setQuizCompleted(false);
      setLatestRoomId(newRoomId);

      console.log('📱 QUIZ SCREEN - State reset complete for room:', newRoomId);
    }, [params.roomId, params.id])
  );

  // Use the latest room ID captured from params
  const roomId = latestRoomId || '111111';

  console.log('Quiz screen - Using room ID:', roomId);

  // Reset quiz state when room changes
  useEffect(() => {
    console.log('🔄 ROOM CHANGE DETECTED: Old room:', previousRoomId, 'New room:', roomId);

    // Reset ALL quiz state when room changes (except timeLeft)
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelected(null);
    setAnswers([]);
    // Don't reset timeLeft here - let quiz data set it properly
    setLoading(true);
    setPreviousRoomId(roomId);

    console.log('🔄 QUIZ STATE RESET COMPLETE');
  }, [roomId]);

  // Load quiz from server
  useEffect(() => {
    console.log('🔌 SOCKET EFFECT RUNNING for roomId:', roomId);

    // ALWAYS create a new socket connection for each room to prevent caching issues
    if (socket) {
      console.log('🔌 Disconnecting old socket for room change');
      socket.disconnect();
    }

    const newSocket = io('https://quizzer-paov.onrender.com', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected');
      console.log('🔌 Emitting getQuiz for room:', roomId);
      console.log('🔌 Room ID type:', typeof roomId);
      console.log('🔌 Room ID value:', roomId);

      // Request quiz data for this room immediately
      newSocket.emit('getQuiz', { roomId });

      // Add a fallback timeout in case quiz data doesn't come through
      setTimeout(() => {
        if (loading) {
          console.log('🔌 Quiz request timeout, retrying...');
          newSocket.emit('getQuiz', { roomId });
        }
      }, 3000); // 3 seconds
    });

    newSocket.on('quizData', (data) => {
      console.log('🔍 QUIZ DATA RECEIVED EVENT');
      console.log('🔍 Raw data:', JSON.stringify(data, null, 2));
      console.log('🔍 Room ID:', data.roomId);
      console.log('🔍 Quiz object:', data.quiz);
      console.log('🔍 Questions array:', data.quiz?.questions);
      console.log('🔍 Number of questions:', data.quiz?.questions?.length);

      if (data.quiz && data.quiz.questions && data.quiz.questions.length > 0) {
        console.log('✅ Quiz has valid questions, processing...');
        console.log('Quiz screen: Processing quiz data...');
        const quizTimeLimit = data.quiz.timeLimit || 30; // Get quiz-level timeLimit
        console.log('🔍 Quiz-level timeLimit:', quizTimeLimit);

        // Convert server quiz format to our component format
        const formattedQuestions = data.quiz.questions.map((q: any, index: number) => {
          console.log(`📝 Processing question ${index + 1}:`, q);
          // Handle both formats: answers (from addquiz) and options (from JSON)
          const answers = q.answers || q.options || [];
          const timeLimit = q.timeLimit || 20;
          console.log(`📝 Question ${index + 1} timeLimit:`, timeLimit);
          return {
            id: index + 1,
            question: q.question,
            options: answers.map((answer: any, i: number) => ({
              id: answer.id || String.fromCharCode(65 + i), // Handle both string id and index
              text: answer.text || answer,
              color: i === 0 ? '#dbeafe' : i === 1 ? '#dcfce7' : i === 2 ? '#fef3c7' : '#fee2e2'
            })),
            correctAnswer: q.correctAnswer || String.fromCharCode(65 + q.correctIndex),
            timeLimit: timeLimit
          };
        });

        console.log('✅ FORMATTED QUESTIONS COMPLETE');
        console.log('🔍 Total formatted questions:', formattedQuestions.length);
        console.log('🔍 First question:', formattedQuestions[0]);
        console.log('🔍 Last question:', formattedQuestions[formattedQuestions.length - 1]);

        setQuestions(formattedQuestions);
        const firstQuestionTime = formattedQuestions[0]?.timeLimit || 30;
        console.log('⏰ Setting initial timer to:', firstQuestionTime);
        setTimeLeftWithDebug(firstQuestionTime);
        setCurrentQuestionIndex(0);
        setLoading(false);
        console.log('✅ Quiz loading complete, all states updated');
      } else {
        console.log('Quiz screen: No quiz found for room:', roomId);
        console.log('Quiz screen: No quiz data available');
        // Don't set fallback questions - just keep loading state or show empty state
        setLoading(false);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      console.error('🔌 Server may not be running at https://quizzer-paov.onrender.com');
      setLoading(false);
      // Don't set fallback questions on connection error - just show loading state
    });

    return () => {
      // Remove all listeners before disconnecting
      newSocket.off('quizData');
      newSocket.off('connect');
      newSocket.off('connect_error');
      newSocket.disconnect();
    };
  }, [roomId]);

  // Add a custom setter to track timeLeft changes
  const setTimeLeftWithDebug = (value: number) => {
    console.log('⏰ SET_TIME_LEFT CALLED with value:', value);
    setTimeLeft(value);
  };

  const [selected, setSelected] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Reset timer for each question (but not on initial quiz load or when option is selected)
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        const timeLimit = currentQuestion?.timeLimit || 30;
        console.log('⏰ TIMER EFFECT: Question', currentQuestionIndex + 1, 'timeLimit:', timeLimit);
        console.log('⏰ TIMER EFFECT: Current timeLeft before setting:', timeLeft);
        console.log('⏰ TIMER EFFECT: Selected option:', selected);
        console.log('⏰ TIMER EFFECT: Setting timeLeft to:', timeLimit);

        // Only set timeLeft if it's not already set correctly AND no option is selected
        if (timeLeft !== timeLimit && !selected) {
          setTimeLeftWithDebug(timeLimit);
        } else if (selected) {
          console.log('⏰ TIMER EFFECT: Option selected, not resetting timer');
        }
        questionStartTime.current = Date.now();
      }
    }
  }, [currentQuestionIndex, questions, selected]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    // Don't run timer during loading or when no questions
    if (loading || questions.length === 0 || !currentQuestion) {
      return;
    }

    if (timeLeft === 0 && currentQuestion) {
      console.log('⏰ Timer reached zero, processing answer for question:', currentQuestion.question);
      console.log('⏰ Time left before processing:', timeLeft);
      console.log('⏰ Current question index:', currentQuestionIndex);
      console.log('⏰ Total questions:', questions.length);
      console.log('⏰ Questions array:', questions);

      // Calculate actual time taken
      const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
      const newAnswer = {
        questionId: currentQuestion.id,
        selectedAnswer: selected || 'no_answer',
        timeTaken: timeTaken
      };

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);
      console.log('📝 Answer recorded:', newAnswer);
      console.log('📝 Updated answers array:', updatedAnswers);

      // Check if there are more questions
      if (currentQuestionIndex < questions.length - 1) {
        console.log('➡️ Moving to next question, current:', currentQuestionIndex, 'next:', currentQuestionIndex + 1);
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          const nextTimeLimit = questions[currentQuestionIndex + 1]?.timeLimit || 3;
          setTimeLeft(nextTimeLimit);
          setSelected(null);
          questionStartTime.current = Date.now(); // Reset timer for next question
          console.log('⏰ Timer reset for next question, timeLeft:', nextTimeLimit);
        }, 0);
      } else {
        console.log('🏁 Quiz completed, navigating to results');
        setQuizCompleted(true);
        // Quiz completed, navigate to results screen with data
        setTimeout(() => {
          router.push({
            pathname: '/result',
            params: {
              answers: JSON.stringify(updatedAnswers),
              questions: JSON.stringify(questions),
              totalQuestions: questions.length.toString()
            }
          });
        }, 0);
      }
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, selected, currentQuestionIndex, currentQuestion, router, questions, loading]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading quiz...</Text>
          </View>
        ) : questions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No quiz found for this room</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : !currentQuestion ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Error loading question</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {console.log('🎯 RENDERING QUESTION:', {
              currentIndex: currentQuestionIndex,
              totalQuestions: questions.length,
              question: currentQuestion?.question,
              timeLeft: timeLeft,
              timeLimit: currentQuestion?.timeLimit
            })}
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.progress}>QUESTION {currentQuestionIndex + 1} / {questions.length}</Text>
              <Text style={styles.menu}>⋯</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }]} />
            </View>

            {/* Timer */}
            <View style={styles.timerWrapper}>
              <View style={styles.timerCircle}>
                <Text style={styles.timerValue}>{timeLeft}</Text>
                <Text style={styles.timerLabel}>SEC</Text>
              </View>
            </View>

            {/* Question */}
            <Text style={styles.question}>
              {currentQuestion?.question}
            </Text>

            {/* Options */}
            <View style={styles.options}>
              {currentQuestion?.options?.map((opt: { id: string; text: string; color: string }) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.option,
                    { backgroundColor: opt.color },
                    selected === opt.id && styles.optionSelected,
                  ]}
                  onPress={() => {
                    console.log('🖱️ OPTION CLICKED:', opt.id);
                    console.log('🖱️ Current questions length:', questions.length);
                    console.log('🖱️ Current question:', currentQuestion);
                    console.log('🖱️ About to call setSelected');
                    setSelected(opt.id);
                    console.log('🖱️ setSelected called with:', opt.id);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.optionKey}>{opt.id}</Text>
                  <Text style={styles.optionText}>{opt.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071025' },
  container: { flex: 1, padding: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  close: { color: '#94a3b8', fontSize: 18 },
  progress: { color: '#cbd5f5', fontSize: 12, fontWeight: '600' },
  menu: { color: '#94a3b8', fontSize: 20 },

  progressBarBg: {
    height: 4,
    backgroundColor: '#0b1220',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },

  timerWrapper: { alignItems: 'center', marginBottom: 24 },
  timerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  timerLabel: { color: '#94a3b8', fontSize: 10 },

  question: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
  },

  options: { gap: 14 },

  option: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: '#2563eb',
  },

  optionKey: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#020617',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '700',
    marginRight: 14,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020617',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
