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
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

configDotenv();

const app = express();

// 🎯 LOG 1: Server starting
console.log('🚀 STARTING SERVER...');

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

// Initialize DynamoDB Client
const dynamoDbClient = new DynamoDBClient({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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
  });
  next();
});

// Test endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    region: 'eu-north-1',
  });
});

// Send OTP endpoint
app.post('/sendOtp', async (req, res) => {
  console.log('🎯 /sendOtp ENDPOINT HIT!');

  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

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

  try {
    const command = new SignUpCommand(signUpParams);
    const response = await cognitoClient.send(command);

    res.status(200).json({
      message: 'OTP sent to email!',
      userSub: response.UserSub,
      destination: response.CodeDeliveryDetails?.Destination,
    });
  } catch (error) {
    console.error('❌ COGNITO SIGNUP ERROR:', error.message);

    if (error.name === 'UsernameExistsException') {
      try {
        const resendCommand = new ResendConfirmationCodeCommand({
          ClientId: COGNITO_CLIENT_ID,
          Username: email.trim().toLowerCase(),
        });

        const resendResponse = await cognitoClient.send(resendCommand);
        return res.status(200).json({
          message: 'New OTP sent to email!',
          destination: resendResponse.CodeDeliveryDetails?.Destination,
        });
      } catch (resendError) {
        return res.status(400).json({
          error:
            'User already exists. Please check your email for verification code.',
        });
      }
    }

    res.status(400).json({
      error: 'Failed to send OTP',
      details: error.message,
    });
  }
});

// Confirm signup endpoint
app.post('/confirmSignup', async (req, res) => {
  const { email, otpCode } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  if (!otpCode) {
    return res.status(400).json({ error: 'OTP code is required.' });
  }

  const confirmParams = {
    ClientId: COGNITO_CLIENT_ID,
    Username: email.trim().toLowerCase(),
    ConfirmationCode: otpCode.toString(),
  };

  try {
    const command = new ConfirmSignUpCommand(confirmParams);
    await cognitoClient.send(command);

    res.status(200).json({
      message: 'Email verified successfully!',
      verified: true,
    });
  } catch (error) {
    console.error('❌ VERIFICATION ERROR:', error.message);

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

  try {
    const userData = req.body;
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

    await docClient.send(new PutCommand(params));

    const secretKey = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign(
      { userId: newUser.userId, email: newUser.email },
      secretKey,
      { expiresIn: '7d' },
    );

    console.log('✅ USER REGISTERED SUCCESSFULLY:', userData.email);

    res.status(200).json({
      token,
      userId: newUser.userId,
      message: 'Registration successful',
    });
  } catch (err) {
    console.error('❌ REGISTRATION ERROR:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message,
    });
  }
});

// FIXED Matches endpoint
app.get('/matches', async (req, res) => {
  const { userId } = req.query;

  console.log('Fetching matches for user:', userId);

  try {
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    // Get current user
    const userParams = {
      TableName: 'usercollection',
      Key: { userId: userId },
    };

    const userResult = await docClient.send(new GetCommand(userParams));

    if (!userResult.Item) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.Item;
    console.log('Found user:', user.firstName);

    // Get all potential matches (excluding current user)
    const scanParams = {
      TableName: 'usercollection',
      FilterExpression: 'userId <> :currentUserId',
      ExpressionAttributeValues: {
        ':currentUserId': userId,
      },
    };

    const scanResult = await docClient.send(new ScanCommand(scanParams));

    // Filter out already liked/matched profiles
    const likedUserIds =
      user.likedProfiles?.map(profile =>
        typeof profile === 'string' ? profile : profile.likedUserId,
      ) || [];

    const excludeIds = [...(user.matches || []), ...likedUserIds, userId];

    const potentialMatches = scanResult.Items.filter(
      item => !excludeIds.includes(item.userId),
    );

    // Apply gender preference filter
    let filteredMatches = potentialMatches;
    if (user.datingPreferences && user.datingPreferences.length > 0) {
      filteredMatches = potentialMatches.filter(item =>
        user.datingPreferences.includes(item.gender),
      );
    }

    const matches = filteredMatches.map(item => ({
      userId: item.userId,
      email: item.email,
      firstName: item.firstName,
      gender: item.gender,
      location: item.location,
      lookingFor: item.lookingFor,
      dateOfBirth: item.dateOfBirth,
      hometown: item.hometown,
      type: item.type,
      jobTitle: item.jobTitle,
      workPlace: item.workPlace,
      imageUrls: item.imageUrls || [],
      prompts: item.prompts || [],
    }));

    console.log(`✅ Found ${matches.length} potential matches`);

    res.status(200).json({
      success: true,
      matches: matches,
    });
  } catch (error) {
    console.log('❌ Error fetching matches:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// User info endpoint
app.get('/user-info', async (req, res) => {
  const { userId } = req.query;

  console.log('Fetching user info for:', userId);

  if (!userId) {
    return res.status(400).json({ message: 'User id is required' });
  }

  try {
    const params = {
      TableName: 'usercollection',
      Key: { userId: userId },
    };

    const result = await docClient.send(new GetCommand(params));

    if (!result.Item) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: result.Item,
    });
  } catch (error) {
    console.log('Error fetching user details', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});
app.post('/create-test-females', async (req, res) => {
  try {
    const femaleUsers = [
      {
        userId: 'female-user-1',
        firstName: 'Emma',
        gender: 'Women',
        email: 'emma.smith@test.com',
        datingPreferences: ['Men'],
        location: 'Schmalkalden',
        lookingFor: 'Relationship',
        jobTitle: 'Graphic Designer',
        hometown: 'Berlin',
        dateOfBirth: '15/05/1998',
        type: 'Straight',
        likes: 5,
        roses: 2,
        createdAt: new Date().toISOString(),
        imageUrls: [
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        ],
        prompts: [
          {
            question: "I'm looking for",
            answer: 'Someone who makes me laugh',
          },
        ],
        password:
          '$2b$10$3oF73GRXAvuwzzVcXfZKt.ggm39CpSdVSEJpTB9vj.rEl91VDMGTu',
        blockedUsers: [],
        likedProfiles: [],
        matches: [],
        receivedLikes: [],
      },
      {
        userId: 'female-user-2',
        firstName: 'Sophia',
        gender: 'Women',
        email: 'sophia.johnson@test.com',
        datingPreferences: ['Men'],
        location: 'Schmalkalden',
        lookingFor: 'Life Partner',
        jobTitle: 'Marketing Manager',
        hometown: 'Munich',
        dateOfBirth: '22/09/1995',
        type: 'Straight',
        likes: 8,
        roses: 3,
        createdAt: new Date().toISOString(),
        imageUrls: [
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        ],
        prompts: [
          {
            question: 'A random fact I love is',
            answer: 'Dolphins have names for each other',
          },
        ],
        password:
          '$2b$10$3oF73GRXAvuwzzVcXfZKt.ggm39CpSdVSEJpTB9vj.rEl91VDMGTu',
        blockedUsers: [],
        likedProfiles: [],
        matches: [],
        receivedLikes: [],
      },
      {
        userId: 'female-user-3',
        firstName: 'Olivia',
        gender: 'Women',
        email: 'olivia.brown@test.com',
        datingPreferences: ['Men'],
        location: 'Schmalkalden',
        lookingFor: 'Something Casual',
        jobTitle: 'Student',
        hometown: 'Hamburg',
        dateOfBirth: '10/12/1999',
        type: 'Straight',
        likes: 3,
        roses: 1,
        createdAt: new Date().toISOString(),
        imageUrls: [
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        ],
        prompts: [
          {
            question: 'My greatest strength',
            answer: 'Always seeing the positive side',
          },
        ],
        password:
          '$2b$10$3oF73GRXAvuwzzVcXfZKt.ggm39CpSdVSEJpTB9vj.rEl91VDMGTu',
        blockedUsers: [],
        likedProfiles: [],
        matches: [],
        receivedLikes: [],
      },
      {
        userId: 'female-user-4',
        firstName: 'Isabella',
        gender: 'Women',
        email: 'isabella.davis@test.com',
        datingPreferences: ['Men'],
        location: 'Schmalkalden',
        lookingFor: 'Relationship',
        jobTitle: 'Software Engineer',
        hometown: 'Frankfurt',
        dateOfBirth: '30/03/1996',
        type: 'Straight',
        likes: 7,
        roses: 2,
        createdAt: new Date().toISOString(),
        imageUrls: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        ],
        prompts: [
          {
            question: 'Together, we could',
            answer: 'Travel the world and try new foods',
          },
        ],
        password:
          '$2b$10$3oF73GRXAvuwzzVcXfZKt.ggm39CpSdVSEJpTB9vj.rEl91VDMGTu',
        blockedUsers: [],
        likedProfiles: [],
        matches: [],
        receivedLikes: [],
      },
      {
        userId: 'female-user-5',
        firstName: 'Mia',
        gender: 'Women',
        email: 'mia.wilson@test.com',
        datingPreferences: ['Men'],
        location: 'Schmalkalden',
        lookingFor: 'Life Partner',
        jobTitle: 'Teacher',
        hometown: 'Cologne',
        dateOfBirth: '18/07/1994',
        type: 'Straight',
        likes: 6,
        roses: 4,
        createdAt: new Date().toISOString(),
        imageUrls: [
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        ],
        prompts: [
          {
            question: "I'm weirdly attracted to",
            answer: 'People who can cook amazing pasta',
          },
        ],
        password:
          '$2b$10$3oF73GRXAvuwzzVcXfZKt.ggm39CpSdVSEJpTB9vj.rEl91VDMGTu',
        blockedUsers: [],
        likedProfiles: [],
        matches: [],
        receivedLikes: [],
      },
    ];

    for (const user of femaleUsers) {
      const params = {
        TableName: 'usercollection',
        Item: user,
      };
      await docClient.send(new PutCommand(params));
      console.log(`✅ Created: ${user.firstName}`);
    }

    res.status(200).json({
      success: true,
      message: `${femaleUsers.length} female users created successfully`,
      users: femaleUsers.map(u => u.firstName),
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token is required' });
  }

  const token = authHeader.split(' ')[1];
  const secretKey = process.env.JWT_SECRET || 'fallback-secret-key';

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('🚀 SERVER STARTED SUCCESSFULLY!');
  console.log('📍 Port:', PORT);
  console.log('🌍 Host: 0.0.0.0 (accessible from network)');
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
