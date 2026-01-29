import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { useTheme } from '@/contexts/ThemeContext';

export default function AddQuizQuestionScreen() {
  const router = useRouter();
  const { isDarkMode, colors } = useTheme();
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

  useEffect(() => {
    fetchExistingQuizzes();
  }, []);

  const fetchExistingQuizzes = async () => {
    try {
      const response = await fetch('https://quizzer-paov.onrender.com/api/quizzes');
      const data = await response.json();
      setExistingQuizzes(data.quizzes || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  React.useEffect(() => {
    const newSocket = io('https://quizzer-paov.onrender.com', {
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
      Alert.alert('Success', `Quiz saved for room ${data.roomId}!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    });

    newSocket.on('connect_error', () => {
      Alert.alert('Connection Error', 'Failed to connect to server.');
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
    if (!quizTitle.trim()) {
      Alert.alert('Error', 'Please enter a quiz title');
      return;
    }

    if (!roomId.trim()) {
      Alert.alert('Error', 'Please enter a room ID');
      return;
    }

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

    if (socket && socket.connected) {
      socket.emit('saveQuiz', { roomId, quizData });
    } else {
      Alert.alert('Connection Error', 'Not connected to server.');
    }
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    safe: { flex: 1, backgroundColor: colors.background },
    back: { ...styles.back, color: isDarkMode ? '#cbd5f5' : colors.primaryText },
    headerTitle: { ...styles.headerTitle, color: colors.primaryText },
    sectionLabel: { ...styles.sectionLabel, color: colors.secondaryText },
    roomInput: { ...styles.roomInput, backgroundColor: colors.cardBg, color: colors.primaryText },
    questionBox: { ...styles.questionBox, backgroundColor: colors.cardBg },
    questionInput: { ...styles.questionInput, color: colors.primaryText },
    mediaBtn: { ...styles.mediaBtn, backgroundColor: isDarkMode ? '#2a243f' : '#e2e8f0' },
    mediaText: { ...styles.mediaText, color: isDarkMode ? '#cbd5f5' : colors.secondaryText },
    hint: { ...styles.hint, color: colors.secondaryText },
    answerCard: { ...styles.answerCard, backgroundColor: colors.cardBg },
    answerInput: { ...styles.answerInput, color: colors.primaryText },
    navBtn: { ...styles.navBtn, backgroundColor: colors.cardBg },
    navBtnText: { ...styles.navBtnText, color: isDarkMode ? '#cbd5f5' : colors.primaryText },
    questionIndicator: { ...styles.questionIndicator, color: colors.primaryText },
    timeBtn: { ...styles.timeBtn, backgroundColor: colors.cardBg },
    timeText: { ...styles.timeText, color: isDarkMode ? '#cbd5f5' : colors.secondaryText },
    pointsBox: { ...styles.pointsBox, backgroundColor: colors.cardBg },
    pointsText: { ...styles.pointsText, color: colors.primaryText },
    toggleIcon: { ...styles.toggleIcon, color: isDarkMode ? '#cbd5f5' : colors.secondaryText },
    quizItem: { ...styles.quizItem, backgroundColor: colors.cardBg },
    quizTitle: { ...styles.quizTitle, color: colors.primaryText },
    quizMeta: { ...styles.quizMeta, color: colors.secondaryText },
    noQuizzesText: { ...styles.noQuizzesText, color: colors.secondaryText },
  };

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={dynamicStyles.back}>←</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Create Quiz</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.save}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Quiz Title */}
        <Text style={dynamicStyles.sectionLabel}>QUIZ TITLE</Text>
        <TextInput
          style={dynamicStyles.roomInput}
          placeholder="Enter quiz title"
          placeholderTextColor={colors.secondaryText}
          value={quizTitle}
          onChangeText={setQuizTitle}
        />

        {/* Room ID */}
        <Text style={dynamicStyles.sectionLabel}>ROOM ID</Text>
        <TextInput
          style={dynamicStyles.roomInput}
          placeholder="Assign Room ID"
          placeholderTextColor={colors.secondaryText}
          value={roomId}
          onChangeText={setRoomId}
        />

        {/* Existing Quizzes */}
        <View style={styles.existingQuizzesSection}>
          <TouchableOpacity
            style={styles.existingQuizzesHeader}
            onPress={() => setShowExistingQuizzes(!showExistingQuizzes)}
          >
            <Text style={dynamicStyles.sectionLabel}>EXISTING QUIZZES ({existingQuizzes.length})</Text>
            <Text style={dynamicStyles.toggleIcon}>{showExistingQuizzes ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showExistingQuizzes && (
            <View style={styles.existingQuizzesList}>
              {existingQuizzes.map((quiz) => (
                <TouchableOpacity
                  key={quiz.id}
                  style={dynamicStyles.quizItem}
                  onPress={() => useExistingQuiz(quiz)}
                >
                  <View style={styles.quizInfo}>
                    <Text style={dynamicStyles.quizTitle}>{quiz.title}</Text>
                    <Text style={dynamicStyles.quizMeta}>
                      {quiz.category} • {quiz.difficulty} • {quiz.questions.length} questions
                    </Text>
                  </View>
                  <Text style={styles.useQuizBtn}>Use</Text>
                </TouchableOpacity>
              ))}
              {existingQuizzes.length === 0 && (
                <Text style={dynamicStyles.noQuizzesText}>No existing quizzes found</Text>
              )}
            </View>
          )}
        </View>

        {/* Question Navigation */}
        <View style={styles.questionNav}>
          <Text style={dynamicStyles.sectionLabel}>QUESTIONS ({questions.length})</Text>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={dynamicStyles.navBtn}
              onPress={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={dynamicStyles.navBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={dynamicStyles.questionIndicator}>Question {currentQuestionIndex + 1}</Text>
            <TouchableOpacity
              style={dynamicStyles.navBtn}
              onPress={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              <Text style={dynamicStyles.navBtnText}>→</Text>
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
        <Text style={dynamicStyles.sectionLabel}>QUESTION</Text>
        <View style={dynamicStyles.questionBox}>
          <TextInput
            style={dynamicStyles.questionInput}
            placeholder="Type your question here..."
            placeholderTextColor={colors.secondaryText}
            multiline
            value={currentQuestion.question}
            onChangeText={(text) => updateCurrentQuestion('question', text)}
          />
          <TouchableOpacity style={dynamicStyles.mediaBtn}>
            <Text style={dynamicStyles.mediaText}>🖼 Media</Text>
          </TouchableOpacity>
        </View>

        {/* Answers */}
        <View style={styles.answersHeader}>
          <Text style={dynamicStyles.sectionLabel}>ANSWERS</Text>
          <Text style={dynamicStyles.hint}>Select correct answer</Text>
        </View>

        {currentQuestion.answers.map((ans: string, i: number) => (
          <TouchableOpacity
            key={i}
            style={[
              dynamicStyles.answerCard,
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
                style={dynamicStyles.answerInput}
                value={ans}
                onChangeText={(text) => {
                  const newAnswers = [...currentQuestion.answers];
                  newAnswers[i] = text;
                  updateCurrentQuestion('answers', newAnswers);
                }}
                placeholder="Enter answer"
                placeholderTextColor={colors.secondaryText}
              />
            </View>
          </TouchableOpacity>
        ))}

        {/* Time Limit */}
        <Text style={dynamicStyles.sectionLabel}>TIME LIMIT</Text>
        <View style={styles.timeRow}>
          {[10, 20, 30, 60].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                dynamicStyles.timeBtn,
                currentQuestion.timeLimit === t && styles.timeSelected,
              ]}
              onPress={() => updateCurrentQuestion('timeLimit', t)}
            >
              <Text
                style={[
                  dynamicStyles.timeText,
                  currentQuestion.timeLimit === t && styles.timeTextActive,
                ]}
              >
                {t}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Points */}
        <Text style={dynamicStyles.sectionLabel}>POINTS</Text>
        <View style={dynamicStyles.pointsBox}>
          <Text style={dynamicStyles.pointsText}>Standard (1k)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  back: { fontSize: 18 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  save: { color: '#a855f7', fontWeight: '700' },

  sectionLabel: {
    fontSize: 12,
    marginBottom: 8,
    marginTop: 16,
  },

  roomInput: {
    borderRadius: 14,
    padding: 14,
  },

  questionBox: {
    borderRadius: 16,
    padding: 14,
  },
  questionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  mediaBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mediaText: { fontSize: 12 },

  answersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  hint: { fontSize: 12 },

  answerCard: {
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

  answerInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  timeRow: { flexDirection: 'row', gap: 10 },
  timeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  timeSelected: { backgroundColor: '#6d28d9' },
  timeText: {},
  timeTextActive: { color: '#fff', fontWeight: '700' },

  pointsBox: {
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  pointsText: { fontWeight: '600' },

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { fontSize: 16 },
  questionIndicator: {
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

  existingQuizzesSection: {
    marginBottom: 20,
  },
  existingQuizzesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 16,
  },
  existingQuizzesList: {
    marginTop: 10,
  },
  quizItem: {
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quizMeta: {
    fontSize: 12,
  },
  useQuizBtn: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  noQuizzesText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});
