import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  WritePrompt: {
    question: string;
    index: number;
    prompts: any[];
    setPrompts: (prompts: any[]) => void;
  };
  Prompts: {
    updatedPrompts: any[];
  };
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const WritePrompt = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'WritePrompt'>>();
  const navigation = useNavigation<NavigationProps>();

  const { question, index, prompts, setPrompts } = route.params;
  const [answer, setAnswer] = useState('');

  const handleDone = () => {
    const updatedPrompts = [...prompts];
    updatedPrompts[index] = { question, answer };
    navigation.replace('Prompts', { updatedPrompts });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={25} color="black" />
          </Pressable>
          <Text style={styles.headerTitle}>Write Answer</Text>
        </View>

        <Pressable onPress={handleDone}>
          <Text style={styles.doneButton}>Done</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Question box */}
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>{question}</Text>
          </View>

          {/* Answer input box */}
          <View style={styles.inputBox}>
            <TextInput
              multiline
              placeholder="Enter your answer..."
              placeholderTextColor="#999"
              value={answer}
              onChangeText={setAnswer}
              style={styles.inputText}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WritePrompt;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  doneButton: {
    fontSize: 15,
    color: '#5a0763',
    fontWeight: '600',
  },
  content: {
    padding: 15,
  },
  questionBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  inputBox: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    minHeight: 120,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputText: {
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'top', // aligns text from top
  },
});
