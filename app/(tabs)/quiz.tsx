import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

// Live Quiz Question Screen (Kahoot-style)

const questions = [
  {
    id: 1,
    question: "Which country is known as the Land of the Rising Sun?",
    options: [
      { id: 'A', text: 'Japan', color: '#dbeafe' },
      { id: 'B', text: 'China', color: '#dcfce7' },
      { id: 'C', text: 'South Korea', color: '#fef9c3' },
      { id: 'D', text: 'Thailand', color: '#fee2e2' },
    ],
    correctAnswer: 'A'
  },
  {
    id: 2,
    question: "What is the capital of France?",
    options: [
      { id: 'A', text: 'London', color: '#dbeafe' },
      { id: 'B', text: 'Berlin', color: '#dcfce7' },
      { id: 'C', text: 'Paris', color: '#fef9c3' },
      { id: 'D', text: 'Madrid', color: '#fee2e2' },
    ],
    correctAnswer: 'C'
  },
  {
    id: 3,
    question: "Which planet is known as the Red Planet?",
    options: [
      { id: 'A', text: 'Venus', color: '#dbeafe' },
      { id: 'B', text: 'Mars', color: '#dcfce7' },
      { id: 'C', text: 'Jupiter', color: '#fef9c3' },
      { id: 'D', text: 'Saturn', color: '#fee2e2' },
    ],
    correctAnswer: 'B'
  }
];

export default function LiveQuizQuestionScreen() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{questionId: number, selectedAnswer: string, timeTaken: number}[]>([]);
  const questionStartTime = useRef(Date.now());

  // Reset quiz state when component mounts
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setTimeLeft(3);
    setSelected(null);
    setAnswers([]);
    questionStartTime.current = Date.now();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft === 0) {
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
          setTimeLeft(3);
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
  }, [timeLeft, selected, currentQuestionIndex, currentQuestion, router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
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
          {currentQuestion.options.map((opt: { id: string; text: string; color: string }) => (
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
});
