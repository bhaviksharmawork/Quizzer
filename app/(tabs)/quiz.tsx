import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { io, Socket } from 'socket.io-client';

// Live Quiz Question Screen (Kahoot-style)

export default function LiveQuizQuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const questionStartTime = useRef<number>(Date.now());
  const roomId = (params.roomId as string) || (params.id as string) || '111111'; // Get room ID from params

  console.log('Quiz screen - Room ID from params:', params.roomId);
  console.log('Quiz screen - Using room ID:', roomId);

  // Load quiz from server
  useEffect(() => {
    console.log('Quiz screen: Attempting to connect to socket server...');
    const newSocket = io('http://10.0.2.2:3000', {
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Quiz screen: Connected to socket server');
      console.log('Quiz screen: Requesting quiz for room:', roomId);
      // Request quiz data for this room
      newSocket.emit('getQuiz', { roomId });
    });
    
    newSocket.on('quizData', (data) => {
      console.log('Quiz screen: Quiz data received:', data);
      console.log('Quiz screen: Room ID:', data.roomId);
      console.log('Quiz screen: Quiz data:', data.quiz);
      
      if (data.quiz) {
        console.log('Quiz screen: Processing quiz data...');
        // Convert server quiz format to our component format
        const formattedQuestions = data.quiz.questions.map((q: any, index: number) => {
          console.log(`Quiz screen: Processing question ${index + 1}:`, q);
          return {
            id: index + 1,
            question: q.question,
            options: q.answers.map((answer: string, i: number) => ({
              id: String.fromCharCode(65 + i), // A, B, C, D
              text: answer,
              color: i === 0 ? '#dbeafe' : i === 1 ? '#dcfce7' : i === 2 ? '#fef3c7' : '#fee2e2'
            })),
            correctAnswer: String.fromCharCode(65 + q.correctIndex),
            timeLimit: q.timeLimit
          };
        });
        
        console.log('Quiz screen: Formatted questions:', formattedQuestions);
        setQuestions(formattedQuestions);
        setTimeLeft(formattedQuestions[0]?.timeLimit || 3);
      } else {
        console.log('Quiz screen: No quiz found for room:', roomId);
        console.log('Quiz screen: Using fallback questions');
        // Fallback to hardcoded questions
        setQuestions([
          {
            id: 1,
            question: "Which country is known as the Land of the Rising Sun?",
            options: [
              { id: 'A', text: 'Japan', color: '#dbeafe' },
              { id: 'B', text: 'China', color: '#dcfce7' },
              { id: 'C', text: 'South Korea', color: '#fef3c7' },
              { id: 'D', text: 'Thailand', color: '#fee2e2' }
            ],
            correctAnswer: 'A',
            timeLimit: 3
          }
        ]);
      }
      setLoading(false);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Quiz screen: Socket connection error:', error);
      setLoading(false);
      // Set fallback questions on connection error
      setQuestions([
        {
          id: 1,
          question: "Which country is known as the Land of the Rising Sun?",
          options: [
            { id: 'A', text: 'Japan', color: '#dbeafe' },
            { id: 'B', text: 'China', color: '#dcfce7' },
            { id: 'C', text: 'South Korea', color: '#fef3c7' },
            { id: 'D', text: 'Thailand', color: '#fee2e2' }
          ],
          correctAnswer: 'A',
          timeLimit: 3
        }
      ]);
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const [selected, setSelected] = useState<string | null>(null);

  // Reset quiz state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setCurrentQuestionIndex(0);
      setTimeLeft(3);
      setSelected(null);
      setAnswers([]);
      questionStartTime.current = Date.now();
      return () => {};
    }, [])
  );

  // Reset timer for each question
  useEffect(() => {
    if (questions.length > 0) {
      setTimeLeft(questions[currentQuestionIndex]?.timeLimit || 3);
      questionStartTime.current = Date.now();
    }
  }, [currentQuestionIndex, questions]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft === 0 && currentQuestion) {
      // Calculate actual time taken
      const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
      const newAnswer = {
        questionId: currentQuestion.id,
        selectedAnswer: selected || 'no_answer',
        timeTaken: timeTaken
      };
      
      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      // Check if there are more questions
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setTimeLeft(questions[currentQuestionIndex + 1]?.timeLimit || 3);
          setSelected(null);
          questionStartTime.current = Date.now(); // Reset timer for next question
        }, 0);
      } else {
        // Quiz completed, log the answers JSON
        console.log('Quiz completed! Answers JSON:', JSON.stringify(updatedAnswers, null, 2));
        // Navigate to results screen
        setTimeout(() => {
          router.push('/result');
        }, 0);
      }
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, selected, currentQuestionIndex, currentQuestion, router, questions]);

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
              {currentQuestion.question}
            </Text>

            {/* Options */}
            <View style={styles.options}>
              {currentQuestion.options?.map((opt: { id: string; text: string; color: string }) => (
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
