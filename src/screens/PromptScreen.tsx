import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ShowPrompts: {
    prompts: { question: string; answer: string }[];
    index: number;
    setPrompts: React.Dispatch<
      React.SetStateAction<{ question: string; answer: string }[]>
    >;
  };
  Prompts: {
    updatedPrompts?: { question: string; answer: string }[];
  };
  PreFinal: undefined; // ✅ Added PreFinal route
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Prompts'>;
type RouteProps = RouteProp<RootStackParamList, 'Prompts'>;

const PromptsScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();

  const [prompts, setPrompts] = useState<
    { question: string; answer: string }[]
  >([
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]);

  // Update prompts when returning from WritePrompt
  useEffect(() => {
    if (route?.params?.updatedPrompts) {
      setPrompts(route.params.updatedPrompts);
    }
  }, [route.params]);

  // ✅ Auto-navigate to PreFinal when all prompts are filled
  useEffect(() => {
    const allFilled = prompts.every(
      p => p.question.trim() !== '' && p.answer.trim() !== '',
    );

    if (allFilled) {
      setTimeout(() => {
        navigation.navigate('PreFinal');
      }, 600); // smooth delay for UI feedback
    }
  }, [prompts]);

  const handleNext = () => {
    navigation.navigate('ShowPrompts', { prompts, index: 0, setPrompts });
  };

  return (
    <SafeAreaView
      style={{
        paddingTop: Platform.OS === 'android' ? 35 : 0,
        flex: 1,
        backgroundColor: 'white',
      }}
    >
      <View style={{ marginTop: 80, marginHorizontal: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 2,
              borderColor: 'black',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="eye-outline" size={23} color="black" />
          </View>
          <Image
            style={{ width: 100, height: 40 }}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
            }}
          />
        </View>

        <Text
          style={{
            fontSize: 25,
            fontWeight: 'bold',
            fontFamily: 'GeezaPro-Bold',
            marginTop: 15,
          }}
        >
          Write your profile answers
        </Text>

        {/* Prompts List */}
        <View style={{ marginTop: 20, flexDirection: 'column', gap: 20 }}>
          {prompts.map((item, index) => {
            const filled = item?.question && item?.answer;
            return (
              <Pressable
                key={index}
                onPress={() =>
                  navigation.navigate('ShowPrompts', {
                    prompts,
                    index,
                    setPrompts,
                  })
                }
                style={[
                  styles.promptBox,
                  filled ? styles.promptBoxFilled : styles.promptBoxEmpty,
                ]}
              >
                {filled ? (
                  <>
                    <Text style={styles.promptQuestion}>{item.question}</Text>
                    <Text style={styles.promptAnswer}>{item.answer}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.promptPlaceholder}>
                      Select a Prompt
                    </Text>
                    <Text style={styles.promptPlaceholder}>
                      And Write your own answer
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Next Button */}
        {!prompts.every(p => p.question && p.answer) && (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.8}
            style={{ marginTop: 30, marginLeft: 'auto' }}
          >
            <Ionicons
              name="chevron-forward-circle-outline"
              size={45}
              color="#581845"
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PromptsScreen;

const styles = StyleSheet.create({
  promptBox: {
    borderRadius: 10,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  promptBoxEmpty: {
    borderColor: '#B0B0B0',
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
  },
  promptBoxFilled: {
    borderWidth: 0,
    backgroundColor: '#f4ecf7', // soft purple background like Hinge
    shadowColor: '#581845',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  promptQuestion: {
    color: '#581845',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  promptAnswer: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 5,
  },
  promptPlaceholder: {
    color: 'gray',
    fontWeight: '600',
    fontStyle: 'italic',
    fontSize: 15,
    textAlign: 'center',
  },
});
