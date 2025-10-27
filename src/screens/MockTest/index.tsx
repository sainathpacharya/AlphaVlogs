// @ts-nocheck
import React, {useState} from 'react';
import {Alert, ScrollView} from 'react-native';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Pressable,
  Input,
  InputField,
} from '@/components';
import {useThemeColors} from '@/utils/colors';
import {MockWrapperService} from '@/services/mock-wrapper';
import {mockApiService} from '@/services/mock-api';

const MockTestScreen = () => {
  const colors = useThemeColors();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('123456');

  const addResult = (result: string) => {
    setTestResults(prev => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testLogin = async () => {
    try {
      addResult('Testing login...');
      const response = await mockApiService.login({mobile, otp});
      if (response.success) {
        addResult(
          `✅ Login successful! User: ${(response as any).data?.user?.firstName || 'Unknown'}`,
        );
      } else {
        addResult(
          `❌ Login failed: ${(response as any).error || 'Unknown error'}`,
        );
      }
    } catch (error) {
      addResult(`❌ Login error: ${error}`);
    }
  };

  const testGetEvents = async () => {
    try {
      addResult('Testing get events...');
      const response = await mockApiService.getEvents();
      if (response.success) {
        addResult(
          `✅ Events loaded! Total: ${(response as any).data?.events?.length || 0}`,
        );
      } else {
        addResult(
          `❌ Events failed: ${(response as any).error || 'Unknown error'}`,
        );
      }
    } catch (error) {
      addResult(`❌ Events error: ${error}`);
    }
  };

  const testGetEventsWithInclude = async () => {
    try {
      addResult('Testing get events with include...');
      const response = await mockApiService.getEvents({
        include: ['categories', 'guidelines'],
      });
      if (response.success) {
        addResult(
          `✅ Events with include loaded! Categories: ${response.data.categories?.length || 0}`,
        );
      } else {
        addResult(
          `❌ Events with include failed: ${(response as any).error || 'Unknown error'}`,
        );
      }
    } catch (error) {
      addResult(`❌ Events with include error: ${error}`);
    }
  };

  const testGetEventById = async () => {
    try {
      addResult('Testing get event by ID...');
      const response = await mockApiService.getEventById('event_001', [
        'guidelines',
        'categories',
      ]);
      if (response.success) {
        addResult(`✅ Event loaded! Title: ${response.data.event.title}`);
        addResult(`   Guidelines: ${response.data.guidelines ? 'Yes' : 'No'}`);
        addResult(`   Categories: ${response.data.categories ? 'Yes' : 'No'}`);
      } else {
        addResult(`❌ Event failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Event error: ${error}`);
    }
  };

  const testSubscription = async () => {
    try {
      addResult('Testing subscription...');
      const response = await mockApiService.getSubscription('user_001', [
        'methods',
        'history',
      ]);
      if (response.success) {
        addResult(
          `✅ Subscription loaded! Plan: ${response.data.subscription?.plan}`,
        );
        addResult(
          `   Payment methods: ${response.data.paymentMethods?.length || 0}`,
        );
        addResult(`   History: ${response.data.history ? 'Yes' : 'No'}`);
      } else {
        addResult(`❌ Subscription failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Subscription error: ${error}`);
    }
  };

  const testCreateSubscription = async () => {
    try {
      addResult('Testing create subscription...');
      const response = await mockApiService.createSubscription({
        userId: 'user_002',
        plan: 'premium',
        amount: 100,
        paymentMethod: 'razorpay',
      });
      if (response.success) {
        addResult(`✅ Subscription created! ID: ${response.data.id}`);
      } else {
        addResult(`❌ Subscription creation failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Subscription creation error: ${error}`);
    }
  };

  const testPayment = async () => {
    try {
      addResult('Testing payment processing...');
      const response = await mockApiService.processPayment({
        subscriptionId: 'sub_001',
        paymentMethod: 'razorpay',
      });
      if (response.success) {
        addResult(
          `✅ Payment successful! Transaction ID: ${response.data.transactionId}`,
        );
      } else {
        addResult(`❌ Payment failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Payment error: ${error}`);
    }
  };

  const testVideoUpload = async () => {
    try {
      addResult('Testing video upload...');
      const response = await mockApiService.uploadVideo({
        userId: 'user_001',
        eventId: 'event_002',
        duration: 180,
      });
      if (response.success) {
        addResult(`✅ Video uploaded! ID: ${response.data.id}`);
        addResult(`   Status: ${response.data.status}`);
      } else {
        addResult(`❌ Video upload failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Video upload error: ${error}`);
    }
  };

  const testQuiz = async () => {
    try {
      addResult('Testing quiz...');
      const response = await mockApiService.getQuiz('quiz_001');
      if (response.success) {
        addResult(`✅ Quiz loaded! Title: ${response.data.title}`);
        addResult(`   Questions: ${response.data.questions.length}`);
      } else {
        addResult(`❌ Quiz failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Quiz error: ${error}`);
    }
  };

  const testQuizSubmit = async () => {
    try {
      addResult('Testing quiz submission...');
      const response = await mockApiService.submitQuiz(
        'quiz_001',
        [1, 1],
        'user_001',
      );
      if (response.success) {
        addResult(`✅ Quiz submitted! Score: ${response.data.score}%`);
        addResult(`   Passed: ${response.data.passed ? 'Yes' : 'No'}`);
      } else {
        addResult(`❌ Quiz submission failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Quiz submission error: ${error}`);
    }
  };

  const testSearch = async () => {
    try {
      addResult('Testing search...');
      const response = await mockApiService.search('singing');
      if (response.success) {
        addResult(`✅ Search completed! Total results: ${response.data.total}`);
        addResult(`   Events: ${response.data.results.events.length}`);
        addResult(`   Users: ${response.data.results.users.length}`);
      } else {
        addResult(`❌ Search failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Search error: ${error}`);
    }
  };

  const testAnalytics = async () => {
    try {
      addResult('Testing analytics...');
      const response = await mockApiService.getAnalytics('user_001', 'user');
      if (response.success) {
        addResult(`✅ Analytics loaded! User: ${response.data.user.name}`);
        addResult(`   Videos: ${response.data.user.totalVideos}`);
        addResult(`   Subscriptions: ${response.data.user.totalSubscriptions}`);
      } else {
        addResult(`❌ Analytics failed: ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Analytics error: ${error}`);
    }
  };

  const runAllTests = async () => {
    addResult('🚀 Starting all tests...');
    await testLogin();
    await testGetEvents();
    await testGetEventsWithInclude();
    await testGetEventById();
    await testSubscription();
    await testCreateSubscription();
    await testPayment();
    await testVideoUpload();
    await testQuiz();
    await testQuizSubmit();
    await testSearch();
    await testAnalytics();
    addResult('✅ All tests completed!');
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: colors.primaryBackground}}>
      <VStack p="$4" space="lg">
        {/* Header */}
        <VStack space="sm" alignItems="center">
          <Text
            style={{
              color: colors.primaryText,
              fontSize: 24,
              fontWeight: 'bold',
            }}>
            Mock API Test Suite
          </Text>
          <Text
            style={{
              color: colors.mutedText,
              fontSize: 16,
              textAlign: 'center',
            }}>
            Test all 25 optimized APIs with mock data
          </Text>
        </VStack>

        {/* Test Inputs */}
        <Box
          style={{
            backgroundColor: colors.cardBackground,
            padding: 16,
            borderRadius: 12,
          }}>
          <VStack space="md">
            <Text
              style={{
                color: colors.primaryText,
                fontSize: 18,
                fontWeight: 'bold',
              }}>
              Test Credentials
            </Text>
            <VStack space="sm">
              <Text style={{color: colors.mutedText}}>Mobile Number:</Text>
              <Input>
                <InputField
                  value={mobile}
                  onChangeText={setMobile}
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                />
              </Input>
            </VStack>
            <VStack space="sm">
              <Text style={{color: colors.mutedText}}>OTP:</Text>
              <Input>
                <InputField
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter OTP"
                  keyboardType="number-pad"
                />
              </Input>
            </VStack>
          </VStack>
        </Box>

        {/* Test Buttons */}
        <VStack space="md">
          <Text
            style={{
              color: colors.primaryText,
              fontSize: 18,
              fontWeight: 'bold',
            }}>
            Individual Tests
          </Text>

          <HStack space="sm" flexWrap="wrap">
            <Button onPress={testLogin} size="sm" bg={colors.accentAction}>
              <Text color={colors.white}>Login</Text>
            </Button>
            <Button onPress={testGetEvents} size="sm" bg={colors.accentAction}>
              <Text color={colors.white}>Events</Text>
            </Button>
            <Button
              onPress={testGetEventsWithInclude}
              size="sm"
              bg={colors.accentAction}>
              <Text color={colors.white}>Events+</Text>
            </Button>
            <Button
              onPress={testGetEventById}
              size="sm"
              bg={colors.accentAction}>
              <Text color={colors.white}>Event ID</Text>
            </Button>
          </HStack>

          <HStack space="sm" flexWrap="wrap">
            <Button
              onPress={testSubscription}
              size="sm"
              bg={colors.accentAction}>
              <Text color={colors.white}>Subscription</Text>
            </Button>
            <Button
              onPress={testCreateSubscription}
              size="sm"
              bg={colors.accentAction}>
              <Text color={colors.white}>Create Sub</Text>
            </Button>
            <Button onPress={testPayment} size="sm" bg={colors.accentAction}>
              <Text color={colors.white}>Payment</Text>
            </Button>
            <Button
              onPress={testVideoUpload}
              size="sm"
              bg={colors.accentAction}>
              <Text color={colors.white}>Video</Text>
            </Button>
          </HStack>

          <HStack space="sm" flexWrap="wrap">
            <Button onPress={testQuiz} size="sm" bg={colors.accentAction}>
              <Text color={colors.white}>Quiz</Text>
            </Button>
            <Button onPress={testQuizSubmit} size="sm" bg={colors.accentAction}>
              <Text color={colors.white}>Submit Quiz</Text>
            </Button>
            <Button onPress={testSearch} size="sm" bg={colors.accentAction}>
              <Text color={colors.white}>Search</Text>
            </Button>
            <Button onPress={testAnalytics} size="sm" bg={colors.accentAction}>
              <Text color={colors.white}>Analytics</Text>
            </Button>
          </HStack>

          {/* Run All Tests */}
          <Button onPress={runAllTests} size="lg" bg={colors.success}>
            <Text color={colors.white} fontWeight="$bold">
              🚀 Run All Tests
            </Text>
          </Button>

          {/* Clear Results */}
          <Button onPress={clearResults} size="sm" bg={colors.danger}>
            <Text color={colors.white}>Clear Results</Text>
          </Button>
        </VStack>

        {/* Test Results */}
        <VStack space="md">
          <Text
            style={{
              color: colors.primaryText,
              fontSize: 18,
              fontWeight: 'bold',
            }}>
            Test Results ({testResults.length})
          </Text>

          <Box
            style={{
              backgroundColor: colors.cardBackground,
              padding: 16,
              borderRadius: 12,
              maxHeight: 300,
            }}>
            <ScrollView>
              {testResults.length === 0 ? (
                <Text style={{color: colors.mutedText, textAlign: 'center'}}>
                  No test results yet. Run some tests to see results here.
                </Text>
              ) : (
                <VStack space="sm">
                  {testResults.map((result, index) => (
                    <Text
                      key={index}
                      style={{color: colors.primaryText, fontSize: 12}}>
                      {result}
                    </Text>
                  ))}
                </VStack>
              )}
            </ScrollView>
          </Box>
        </VStack>

        {/* Mock Mode Status */}
        <Box
          style={{
            backgroundColor: colors.cardBackground,
            padding: 16,
            borderRadius: 12,
          }}>
          <VStack space="sm" alignItems="center">
            <Text
              style={{
                color: colors.primaryText,
                fontSize: 16,
                fontWeight: 'bold',
              }}>
              Mock Mode Status
            </Text>
            <Text
              style={{
                color: MockWrapperService.isMockMode()
                  ? colors.success
                  : colors.danger,
              }}>
              {MockWrapperService.isMockMode()
                ? '✅ Mock Mode Enabled'
                : '❌ Real API Mode'}
            </Text>
            <Text
              style={{
                color: colors.mutedText,
                fontSize: 12,
                textAlign: 'center',
              }}>
              All API calls are using mock data with realistic delays and
              responses
            </Text>
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  );
};

export default MockTestScreen;
