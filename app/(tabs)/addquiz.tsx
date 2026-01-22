import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';

// Add Quiz Question Screen (Host)

export default function AddQuizQuestionScreen() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [roomId, setRoomId] = useState('');
  const [existingQuizzes, setExistingQuizzes] = useState<any[]>([]);
  const [showExistingQuizzes, setShowExistingQuizzes] = useState(false);
  const [questions, setQuestions] = useState([
    {
      id: '1',
      question: '',
      answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
      correctIndex: 0,
      timeLimit: 20
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Load existing quizzes from server
  useEffect(() => {
    fetchExistingQuizzes();
  }, []);

  const fetchExistingQuizzes = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3000/api/quizzes');
      const data = await response.json();
      setExistingQuizzes(data.quizzes || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  // Connect to socket server
  React.useEffect(() => {
    console.log('Attempting to connect to socket server...');
    const newSocket = io('http://10.0.2.2:3000', {
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to socket server for quiz creation');
    });
    
    newSocket.on('quizSaved', (data) => {
      console.log('Quiz saved successfully:', data);
      Alert.alert('Success', `Quiz saved for room ${data.roomId}!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      Alert.alert('Connection Error', 'Failed to connect to server. Please make sure the server is running.');
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  const addNewQuestion = () => {
    const newQuestion = {
      id: (questions.length + 1).toString(),
      question: '',
      answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
      correctIndex: 0,
      timeLimit: 20
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const updateCurrentQuestion = (field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const deleteCurrentQuestion = () => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, index) => index !== currentQuestionIndex);
      setQuestions(updatedQuestions);
      setCurrentQuestionIndex(Math.min(currentQuestionIndex, updatedQuestions.length - 1));
    }
  };

  const useExistingQuiz = (quiz: any) => {
    setQuizTitle(quiz.title);
    setQuestions(quiz.questions.map((q: any, index: number) => ({
      id: String(index + 1),
      question: q.question,
      answers: q.options.map((opt: any) => opt.text),
      correctIndex: q.options.findIndex((opt: any) => opt.id === q.correctAnswer),
      timeLimit: q.timeLimit || 20
    })));
    setShowExistingQuizzes(false);
    Alert.alert('Quiz Loaded', `Loaded "${quiz.title}" with ${quiz.questions.length} questions`);
  };

  const handleSave = () => {
    console.log('Save button pressed');
    
    // Validate quiz data
    if (!quizTitle.trim()) {
      Alert.alert('Error', 'Please enter a quiz title');
      return;
    }
    
    if (!roomId.trim()) {
      Alert.alert('Error', 'Please enter a room ID');
      return;
    }
    
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        Alert.alert('Error', `Question ${i + 1} is empty`);
        return;
      }
      
      for (let j = 0; j < q.answers.length; j++) {
        if (!q.answers[j].trim()) {
          Alert.alert('Error', `Answer ${j + 1} in Question ${i + 1} is empty`);
          return;
        }
      }
    }
    
    const quizData = {
      title: quizTitle,
      roomId,
      questions: questions.map(q => ({
        question: q.question,
        answers: q.answers,
        correctIndex: q.correctIndex,
        timeLimit: q.timeLimit
      }))
    };
    
    console.log('Attempting to save quiz:', quizData);
    console.log('Socket connected:', socket?.connected);
    
    // Save quiz to server
    if (socket && socket.connected) {
      console.log('Emitting saveQuiz event...');
      socket.emit('saveQuiz', { roomId, quizData });
    } else {
      console.log('Socket not connected, showing error');
      Alert.alert('Connection Error', 'Not connected to server. Please check your connection and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Quiz</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.save}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Quiz Title */}
        <Text style={styles.sectionLabel}>QUIZ TITLE</Text>
        <TextInput
          style={styles.roomInput}
          placeholder="Enter quiz title"
          placeholderTextColor="#64748b"
          value={quizTitle}
          onChangeText={setQuizTitle}
        />

        {/* Room ID */}
        <Text style={styles.sectionLabel}>ROOM ID</Text>
        <TextInput
          style={styles.roomInput}
          placeholder="Assign Room ID"
          placeholderTextColor="#64748b"
          value={roomId}
          onChangeText={setRoomId}
        />

        {/* Existing Quizzes */}
        <View style={styles.existingQuizzesSection}>
          <TouchableOpacity 
            style={styles.existingQuizzesHeader}
            onPress={() => setShowExistingQuizzes(!showExistingQuizzes)}
          >
            <Text style={styles.sectionLabel}>EXISTING QUIZZES ({existingQuizzes.length})</Text>
            <Text style={styles.toggleIcon}>{showExistingQuizzes ? '▼' : '▶'}</Text>
          </TouchableOpacity>
          
          {showExistingQuizzes && (
            <View style={styles.existingQuizzesList}>
              {existingQuizzes.map((quiz, index) => (
                <TouchableOpacity
                  key={quiz.id}
                  style={styles.quizItem}
                  onPress={() => useExistingQuiz(quiz)}
                >
                  <View style={styles.quizInfo}>
                    <Text style={styles.quizTitle}>{quiz.title}</Text>
                    <Text style={styles.quizMeta}>
                      {quiz.category} • {quiz.difficulty} • {quiz.questions.length} questions
                    </Text>
                  </View>
                  <Text style={styles.useQuizBtn}>Use</Text>
                </TouchableOpacity>
              ))}
              {existingQuizzes.length === 0 && (
                <Text style={styles.noQuizzesText}>No existing quizzes found</Text>
              )}
            </View>
          )}
        </View>

        {/* Question Navigation */}
        <View style={styles.questionNav}>
          <Text style={styles.sectionLabel}>QUESTIONS ({questions.length})</Text>
          <View style={styles.navButtons}>
            <TouchableOpacity 
              style={styles.navBtn} 
              onPress={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={styles.navBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.questionIndicator}>Question {currentQuestionIndex + 1}</Text>
            <TouchableOpacity 
              style={styles.navBtn} 
              onPress={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              <Text style={styles.navBtnText}>→</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.addQuestionBtn} onPress={addNewQuestion}>
              <Text style={styles.addQuestionText}>+ Add Question</Text>
            </TouchableOpacity>
            {questions.length > 1 && (
              <TouchableOpacity style={styles.deleteQuestionBtn} onPress={deleteCurrentQuestion}>
                <Text style={styles.deleteQuestionText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Question */}
        <Text style={styles.sectionLabel}>QUESTION</Text>
        <View style={styles.questionBox}>
          <TextInput
            style={styles.questionInput}
            placeholder="Type your question here..."
            placeholderTextColor="#64748b"
            multiline
            value={currentQuestion.question}
            onChangeText={(text) => updateCurrentQuestion('question', text)}
          />
          <TouchableOpacity style={styles.mediaBtn}>
            <Text style={styles.mediaText}>🖼 Media</Text>
          </TouchableOpacity>
        </View>

        {/* Answers */}
        <View style={styles.answersHeader}>
          <Text style={styles.sectionLabel}>ANSWERS</Text>
          <Text style={styles.hint}>Select correct answer</Text>
        </View>

        {currentQuestion.answers.map((ans: string, i: number) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.answerCard,
              currentQuestion.correctIndex === i && styles.answerSelected,
            ]}
            onPress={() => updateCurrentQuestion('correctIndex', i)}
          >
            <View style={styles.answerLeft}>
              <View style={[
                styles.answerIcon, 
                i === 0 ? styles.icon0 : 
                i === 1 ? styles.icon1 : 
                i === 2 ? styles.icon2 : 
                styles.icon3
              ]} />
              <TextInput
                style={styles.answerInput}
                value={ans}
                onChangeText={(text) => {
                  const newAnswers = [...currentQuestion.answers];
                  newAnswers[i] = text;
                  updateCurrentQuestion('answers', newAnswers);
                }}
                placeholder="Enter answer"
                placeholderTextColor="#64748b"
              />
            </View>
          </TouchableOpacity>
        ))}

        {/* Time Limit */}
        <Text style={styles.sectionLabel}>TIME LIMIT</Text>
        <View style={styles.timeRow}>
          {[10, 20, 30, 60].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.timeBtn,
                currentQuestion.timeLimit === t && styles.timeSelected,
              ]}
              onPress={() => updateCurrentQuestion('timeLimit', t)}
            >
              <Text
                style={[
                  styles.timeText,
                  currentQuestion.timeLimit === t && styles.timeTextActive,
                ]}
              >
                {t}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Points */}
        <Text style={styles.sectionLabel}>POINTS</Text>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsText}>Standard (1k)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b0614' },
  container: { padding: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  back: { color: '#cbd5f5', fontSize: 18 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  save: { color: '#a855f7', fontWeight: '700' },

  sectionLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 16,
  },

  roomInput: {
    backgroundColor: '#1e1b2e',
    borderRadius: 14,
    padding: 14,
    color: '#fff',
  },

  questionBox: {
    backgroundColor: '#1e1b2e',
    borderRadius: 16,
    padding: 14,
  },
  questionInput: {
    color: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  mediaBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
    backgroundColor: '#2a243f',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mediaText: { color: '#cbd5f5', fontSize: 12 },

  answersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  hint: { color: '#64748b', fontSize: 12 },

  answerCard: {
    backgroundColor: '#1e1b2e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerSelected: {
    borderWidth: 1.5,
    borderColor: '#a855f7',
  },

  answerLeft: { flexDirection: 'row', alignItems: 'center' },
  answerIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 10,
  },
  icon0: { backgroundColor: '#ef4444' },
  icon1: { backgroundColor: '#3b82f6' },
  icon2: { backgroundColor: '#eab308' },
  icon3: { backgroundColor: '#22c55e' },

  answerText: { color: '#fff' },
  answerInput: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#475569',
  },
  radioActive: {
    borderColor: '#22c55e',
    backgroundColor: '#22c55e',
  },

  timeRow: { flexDirection: 'row', gap: 10 },
  timeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1e1b2e',
    alignItems: 'center',
  },
  timeSelected: { backgroundColor: '#6d28d9' },
  timeText: { color: '#cbd5f5' },
  timeTextActive: { color: '#fff', fontWeight: '700' },

  pointsBox: {
    backgroundColor: '#1e1b2e',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  pointsText: { color: '#fff', fontWeight: '600' },

  // Question navigation styles
  questionNav: {
    marginBottom: 20,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e1b2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { color: '#cbd5f5', fontSize: 16 },
  questionIndicator: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addQuestionBtn: {
    flex: 1,
    backgroundColor: '#2b6cb0',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  addQuestionText: { color: '#fff', fontWeight: '600' },
  deleteQuestionBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteQuestionText: { color: '#fff', fontWeight: '600' },

  // Existing quizzes styles
  existingQuizzesSection: {
    marginBottom: 20,
  },
  existingQuizzesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleIcon: {
    color: '#cbd5f5',
    fontSize: 16,
  },
  existingQuizzesList: {
    marginTop: 10,
  },
  quizItem: {
    backgroundColor: '#1e1b2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quizMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  useQuizBtn: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  noQuizzesText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});
