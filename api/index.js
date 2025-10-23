import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import http from 'http';
import { configDotenv } from 'dotenv';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

configDotenv();

const app = express();

// 🎯 LOG 1: Server starting
console.log('🚀 STARTING SERVER...');
console.log('📁 Current directory:', process.cwd());
console.log('🔑 Environment variables:', {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
});

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const PORT = 9000;

// 🎯 LOG 2: AWS Configuration
console.log('🔧 CONFIGURING AWS...');
console.log('📍 Region: eu-north-1');
console.log('🔑 Cognito Client ID: 6b711i0jdq8o77ptl6a39ejee4');

// Initialize DynamoDB Client
const dynamoDbClient = new DynamoDBClient({ region: 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

// Initialize Cognito Client
const cognitoClient = new CognitoIdentityProviderClient({
  region: 'eu-north-1',
});

const COGNITO_CLIENT_ID = '6b711i0jdq8o77ptl6a39ejee4';

// 🎯 LOG 3: Middleware for request logging
app.use((req, res, next) => {
  console.log('📥 INCOMING REQUEST:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    body: req.body,
    headers: req.headers,
  });
  next();
});

// Test endpoint
app.get('/health', (req, res) => {
  console.log('❤️ HEALTH CHECK REQUESTED');
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    region: 'eu-north-1',
    clientId: COGNITO_CLIENT_ID,
  });
});

// Send OTP endpoint - HEAVILY LOGGED VERSION
app.post('/sendOtp', async (req, res) => {
  console.log('🎯 /sendOtp ENDPOINT HIT!');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

  const { email, password } = req.body;

  if (!email) {
    console.log('❌ NO EMAIL PROVIDED');
    return res.status(400).json({ error: 'Email is required.' });
  }

  if (!password) {
    console.log('❌ NO PASSWORD PROVIDED');
    return res.status(400).json({ error: 'Password is required.' });
  }

  console.log('📧 Processing OTP for:', email);
  console.log('🔑 Password length:', password.length);

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log('❌ INVALID EMAIL FORMAT:', email);
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  // Validate password
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    console.log('❌ PASSWORD REQUIREMENTS NOT MET');
    return res.status(400).json({
      error:
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
    });
  }

  console.log('✅ INPUT VALIDATION PASSED');

  const signUpParams = {
    ClientId: COGNITO_CLIENT_ID,
    Username: email.trim().toLowerCase(),
    Password: password,
    UserAttributes: [
      {
        Name: 'email',
        Value: email.trim().toLowerCase(),
      },
    ],
  };

  console.log('🔄 CALLING COGNITO SIGNUP...');
  console.log('📤 SignUp Params:', JSON.stringify(signUpParams, null, 2));

  try {
    console.log('🎯 CREATING SIGNUP COMMAND...');
    const command = new SignUpCommand(signUpParams);

    console.log('🚀 SENDING TO COGNITO...');
    const response = await cognitoClient.send(command);

    console.log('✅ COGNITO SIGNUP SUCCESS!');
    console.log('📬 Full Cognito Response:', JSON.stringify(response, null, 2));
    console.log('📧 Code Delivery Details:', response.CodeDeliveryDetails);
    console.log('👤 User Sub:', response.UserSub);

    res.status(200).json({
      message: 'OTP sent to email!',
      userSub: response.UserSub,
      destination: response.CodeDeliveryDetails?.Destination,
      deliveryMedium: response.CodeDeliveryDetails?.DeliveryMedium,
      attributeName: response.CodeDeliveryDetails?.AttributeName,
    });
  } catch (error) {
    console.error('❌ COGNITO SIGNUP ERROR:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Stack:', error.stack);
    console.error('Full Error Object:', JSON.stringify(error, null, 2));

    // Handle specific errors
    if (error.name === 'UsernameExistsException') {
      console.log('🔄 USER EXISTS - ATTEMPTING RESEND...');
      try {
        const resendCommand = new ResendConfirmationCodeCommand({
          ClientId: COGNITO_CLIENT_ID,
          Username: email.trim().toLowerCase(),
        });

        console.log('🔄 SENDING RESEND COMMAND...');
        const resendResponse = await cognitoClient.send(resendCommand);
        console.log('✅ RESEND SUCCESS:', resendResponse.CodeDeliveryDetails);

        return res.status(200).json({
          message: 'New OTP sent to email!',
          destination: resendResponse.CodeDeliveryDetails?.Destination,
          deliveryMedium: resendResponse.CodeDeliveryDetails?.DeliveryMedium,
        });
      } catch (resendError) {
        console.error('❌ RESEND FAILED:', resendError);
        return res.status(400).json({
          error:
            'User already exists. Please check your email for verification code.',
        });
      }
    }

    if (error.name === 'InvalidPasswordException') {
      return res.status(400).json({
        error: 'Password requirements not met',
      });
    }

    if (error.name === 'CodeDeliveryFailureException') {
      return res.status(500).json({
        error: 'Email delivery failed. Please try again.',
      });
    }

    res.status(400).json({
      error: 'Failed to send OTP',
      details: error.message,
      errorType: error.name,
    });
  }
});

// Resend OTP endpoint
app.post('/resendOtp', async (req, res) => {
  console.log('🎯 /resendOtp ENDPOINT HIT!');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

  const { email } = req.body;

  if (!email) {
    console.log('❌ NO EMAIL PROVIDED FOR RESEND');
    return res.status(400).json({ error: 'Email is required.' });
  }

  console.log('🔄 Resending OTP to:', email);

  const resendParams = {
    ClientId: COGNITO_CLIENT_ID,
    Username: email.trim().toLowerCase(),
  };

  try {
    console.log('🔄 CREATING RESEND COMMAND...');
    const command = new ResendConfirmationCodeCommand(resendParams);
    console.log('🚀 SENDING RESEND REQUEST...');
    const response = await cognitoClient.send(command);

    console.log('✅ RESEND SUCCESS:');
    console.log('📬 Resend Response:', JSON.stringify(response, null, 2));

    res.status(200).json({
      message: 'New OTP sent to email',
      destination: response.CodeDeliveryDetails?.Destination,
      deliveryMedium: response.CodeDeliveryDetails?.DeliveryMedium,
    });
  } catch (error) {
    console.error('❌ RESEND ERROR:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);

    if (error.name === 'UserNotFoundException') {
      return res
        .status(404)
        .json({ error: 'User not found. Please sign up first.' });
    }

    res.status(400).json({
      error: 'Failed to resend OTP',
      details: error.message,
    });
  }
});

// Confirm signup endpoint
app.post('/confirmSignup', async (req, res) => {
  console.log('🎯 /confirmSignup ENDPOINT HIT!');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

  const { email, otpCode } = req.body;

  if (!email) {
    console.log('❌ NO EMAIL PROVIDED FOR CONFIRMATION');
    return res.status(400).json({ error: 'Email is required.' });
  }

  if (!otpCode) {
    console.log('❌ NO OTP CODE PROVIDED');
    return res.status(400).json({ error: 'OTP code is required.' });
  }

  console.log('✅ Verifying OTP for:', email, 'Code:', otpCode);

  const confirmParams = {
    ClientId: COGNITO_CLIENT_ID,
    Username: email.trim().toLowerCase(),
    ConfirmationCode: otpCode.toString(),
  };

  try {
    console.log('🔄 CREATING CONFIRM COMMAND...');
    const command = new ConfirmSignUpCommand(confirmParams);
    console.log('🚀 SENDING CONFIRMATION REQUEST...');
    await cognitoClient.send(command);

    console.log('✅ EMAIL VERIFIED SUCCESSFULLY FOR:', email);

    res.status(200).json({
      message: 'Email verified successfully!',
      verified: true,
    });
  } catch (error) {
    console.error('❌ VERIFICATION ERROR:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);

    if (error.name === 'CodeMismatchException') {
      return res.status(400).json({
        error: 'Invalid verification code.',
      });
    }

    res.status(400).json({
      error: 'Verification failed',
      details: error.message,
    });
  }
});

// Register user endpoint
app.post('/register', async (req, res) => {
  console.log('🎯 /register ENDPOINT HIT!');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

  try {
    const userData = req.body;
    console.log('📝 Registering user:', userData.email);

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userId = crypto.randomUUID();

    const newUser = {
      userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
      gender: userData.gender,
      dateOfBirth: userData.dateOfBirth,
      type: userData.type,
      location: userData.location,
      hometown: userData.hometown,
      workPlace: userData.workPlace,
      jobTitle: userData.jobTitle,
      datingPreferences: userData.datingPreferences || [],
      lookingFor: userData.lookingFor,
      imageUrls: userData.imageUrls || [],
      prompts: userData.prompts || [],
      likes: 2,
      roses: 1,
      likedProfiles: [],
      receivedLikes: [],
      matches: [],
      blockedUsers: [],
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: 'usercollection',
      Item: newUser,
    };

    console.log('💾 SAVING TO DYNAMODB...');
    await docClient.send(new PutCommand(params));

    const secretKey = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign(
      { userId: newUser.userId, email: newUser.email },
      secretKey,
    );

    console.log('✅ USER REGISTERED SUCCESSFULLY:', userData.email);

    res.status(200).json({
      token,
      userId: newUser.userId,
      message: 'Registration successful',
    });
  } catch (err) {
    console.error('❌ REGISTRATION ERROR:');
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message,
    });
  }
});
app.get('/matches', async (req, res) => {
  const { userId } = req.query;

  // console.log('user', userId);

  try {
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    const userParams = {
      TableName: 'usercollection',
      Key: { userId },
    };

    const userResult = await dynamoDbClient.send(new GetCommand(userParams));

    if (!userResult.Item) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = {
      userId: userResult.Item.userId,
      gender: userResult.Item.gender,
      datingPreferences:
        userResult.Item.datingPreferences?.map(pref => pref) || [],
      matches: userResult.Item.matches?.map(match => match) || [],
      likedProfiles:
        userResult?.Item.likedProfiles?.map(lp => lp.likedUserId) || [],
    };

    const genderFilter = user?.datingPreferences?.map(g => ({ S: g }));
    const excludeIds = [
      ...user.matches,
      ...user.likedProfiles,
      user.userId,
    ].map(id => ({ S: id }));

    const scanParams = {
      TableName: 'usercollection',
      FilterExpression:
        'userId <> :currentUserId AND (contains(:genderPref,gender)) AND NOT contains(:excludedIds,userId)',
      ExpressionAttributeValues: {
        ':currentUserId': { S: user.userId },
        ':genderPref': {
          L: genderFilter.length > 0 ? genderFilter : [{ S: 'None' }],
        },
        ':excludedIds': { L: excludeIds },
      },
    };

    const scanResult = await dynamoDbClient.send(new ScanCommand(scanParams));

    const matches = scanResult.Items.map(item => ({
      userId: item?.userId.S,
      email: item?.email.S,
      firstName: item?.firstName.S,
      gender: item?.gender.S,
      location: item?.location.S,
      lookingFor: item?.lookingFor.S,
      dateOfBirth: item.dateOfBirth.S,
      hometown: item.hometown.S,
      type: item.type.S,
      jobTitle: item.jobTitle.S,
      workPlace: item.workPlace.S,
      imageUrls: item.imageUrls?.L.map(url => url.S) || [],
      prompts:
        item?.prompts.L.map(prompt => ({
          question: prompt.M.question.S,
          answer: prompt.M.answer.S,
        })) || [],
    }));

    res.status(200).json({ matches });
  } catch (error) {
    console.log('Error fetching matches', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/user-info', async (req, res) => {
  const { userId } = req.query;

  console.log('User ID', userId);

  if (!userId) {
    return res.status(400).json({ message: 'User id is required' });
  }

  try {
    const params = {
      TableName: 'usercollection',
      Key: { userId },
    };
    const command = new GetCommand(params);
    const result = await dynamoDbClient.send(command);

    if (!result.Item) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('res', result);

    res.status(200).json({ user: result.Item });
  } catch (error) {
    console.log('Error fetching user details', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(404).json({ message: 'Token is required' });
  }

  const token = authHeader.split(' ')[1];
  console.log('recieived token', token);

  const secretKey =
    '582e6b12ec6da3125121e9be07d00f63495ace020ec9079c30abeebd329986c5c35548b068ddb4b187391a5490c880137c1528c76ce2feacc5ad781a742e2de0'; // Use a better key management

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 SERVER STARTED SUCCESSFULLY!');
  console.log('📍 Port:', PORT);
  console.log('🌍 Region: eu-north-1 (Stockholm)');
  console.log('🔑 Cognito Client ID:', COGNITO_CLIENT_ID);
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('='.repeat(50));
});

// Handle uncaught errors
process.on('uncaughtException', error => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

export default app;
