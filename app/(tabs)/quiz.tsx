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
import { useTheme } from '@/contexts/ThemeContext';

export default function LiveQuizQuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode, colors } = useTheme();
  const [latestRoomId, setLatestRoomId] = useState<string>('111111');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousRoomId, setPreviousRoomId] = useState<string>('');
  const questionStartTime = useRef<number>(Date.now());
  const quizLoadedRef = useRef<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      const newRoomId = (params.roomId as string) || (params.id as string) || '111111';
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setSelected(null);
      setAnswers([]);
      setTimeLeft(0);
      setLoading(true);
      setQuizCompleted(false);
      setLatestRoomId(newRoomId);
      quizLoadedRef.current = false;
    }, [params.roomId, params.id])
  );

  const roomId = latestRoomId || '111111';

  useEffect(() => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelected(null);
    setAnswers([]);
    setLoading(true);
    setPreviousRoomId(roomId);
    quizLoadedRef.current = false;
  }, [roomId]);

  useEffect(() => {
    if (!loading || quizLoadedRef.current) return;

    if (socket) {
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
      newSocket.emit('getQuiz', { roomId });
      setTimeout(() => {
        if (!quizLoadedRef.current) {
          newSocket.emit('getQuiz', { roomId });
        }
      }, 3000);
    });

    newSocket.on('quizData', (data) => {
      if (quizLoadedRef.current) return;

      if (data.quiz && data.quiz.questions && data.quiz.questions.length > 0) {
        const formattedQuestions = data.quiz.questions.map((q: any, index: number) => {
          const answers = q.answers || q.options || [];
          const timeLimit = q.timeLimit || 20;
          return {
            id: index + 1,
            question: q.question,
            options: answers.map((answer: any, i: number) => ({
              id: answer.id || String.fromCharCode(65 + i),
              text: answer.text || answer,
              color: i === 0 ? '#dbeafe' : i === 1 ? '#dcfce7' : i === 2 ? '#fef3c7' : '#fee2e2'
            })),
            correctAnswer: q.correctAnswer || String.fromCharCode(65 + q.correctIndex),
            timeLimit: timeLimit
          };
        });

        setQuestions(formattedQuestions);
        setTimeLeftWithDebug(formattedQuestions[0]?.timeLimit || 30);
        setCurrentQuestionIndex(0);
        setLoading(false);
        quizLoadedRef.current = true;
      } else {
        setLoading(false);
      }
    });

    newSocket.on('connect_error', () => {
      setLoading(false);
    });

    return () => {
      newSocket.off('quizData');
      newSocket.off('connect');
      newSocket.off('connect_error');
      newSocket.disconnect();
    };
  }, [roomId, loading]);

  const setTimeLeftWithDebug = (value: number) => {
    setTimeLeft(value);
  };

  const [selected, setSelected] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        const timeLimit = currentQuestion?.timeLimit || 30;
        setTimeLeftWithDebug(timeLimit);
        questionStartTime.current = Date.now();
      }
    }
  }, [currentQuestionIndex, questions]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (loading || questions.length === 0 || !currentQuestion) return;

    if (timeLeft === 0 && currentQuestion) {
      const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
      const newAnswer = {
        questionId: currentQuestion.id,
        selectedAnswer: selected || 'no_answer',
        timeTaken: timeTaken
      };

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          const nextTimeLimit = questions[currentQuestionIndex + 1]?.timeLimit || 3;
          setTimeLeft(nextTimeLimit);
          setSelected(null);
          questionStartTime.current = Date.now();
        }, 0);
      } else {
        setQuizCompleted(true);
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

  // Dynamic styles based on theme
  const dynamicStyles = {
    safe: { flex: 1, backgroundColor: colors.background },
    close: { ...styles.close, color: colors.secondaryText },
    progress: { ...styles.progress, color: isDarkMode ? '#cbd5f5' : colors.primaryText },
    menu: { ...styles.menu, color: colors.secondaryText },
    progressBarBg: { ...styles.progressBarBg, backgroundColor: colors.cardBg },
    timerValue: { ...styles.timerValue, color: colors.primaryText },
    timerLabel: { ...styles.timerLabel, color: colors.secondaryText },
    question: { ...styles.question, color: colors.primaryText },
    loadingText: { ...styles.loadingText, color: colors.primaryText },
  };

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={dynamicStyles.loadingText}>Loading quiz...</Text>
          </View>
        ) : questions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={dynamicStyles.loadingText}>No quiz found for this room</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : !currentQuestion ? (
          <View style={styles.loadingContainer}>
            <Text style={dynamicStyles.loadingText}>Error loading question</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={dynamicStyles.close}>✕</Text>
              </TouchableOpacity>
              <Text style={dynamicStyles.progress}>QUESTION {currentQuestionIndex + 1} / {questions.length}</Text>
              <Text style={dynamicStyles.menu}>⋯</Text>
            </View>

            {/* Progress Bar */}
            <View style={dynamicStyles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }]} />
            </View>

            {/* Timer */}
            <View style={styles.timerWrapper}>
              <View style={styles.timerCircle}>
                <Text style={dynamicStyles.timerValue}>{timeLeft}</Text>
                <Text style={dynamicStyles.timerLabel}>SEC</Text>
              </View>
            </View>

            {/* Question */}
            <Text style={dynamicStyles.question}>
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
                  onPress={() => setSelected(opt.id)}
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
  container: { flex: 1, padding: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  close: { fontSize: 18 },
  progress: { fontSize: 12, fontWeight: '600' },
  menu: { fontSize: 20 },

  progressBarBg: {
    height: 4,
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
  timerValue: { fontSize: 22, fontWeight: '800' },
  timerLabel: { fontSize: 10 },

  question: {
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
