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
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

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

const PORT = process.env.PORT || 9000;

// AWS DynamoDB low-level client (for credentials/region)
const dynamoDbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Use the Document client wrapper for easier JS object handling
const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

// Initialize Cognito Client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'eu-north-1',
});

const COGNITO_CLIENT_ID =
  process.env.COGNITO_CLIENT_ID || '6b711i0jdq8o77ptl6a39ejee4';

// Shared JWT secret (use env var)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// 🎯 LOG 3: Middleware for request logging
app.use((req, res, next) => {
  console.log('📥 INCOMING REQUEST:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    body: req.body,
    headers: {
      authorization: req.headers['authorization'],
    },
  });
  next();
});

// Test endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    region: process.env.AWS_REGION || 'eu-north-1',
  });
});

// Send OTP endpoint
app.post('/sendOtp', async (req, res) => {
  console.log('🎯 /sendOtp ENDPOINT HIT!');
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required.' });
  if (!password)
    return res.status(400).json({ error: 'Password is required.' });

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
    console.error('❌ COGNITO SIGNUP ERROR:', error);
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
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  if (!otpCode) return res.status(400).json({ error: 'OTP code is required.' });

  const confirmParams = {
    ClientId: COGNITO_CLIENT_ID,
    Username: email.trim().toLowerCase(),
    ConfirmationCode: otpCode.toString(),
  };

  try {
    const command = new ConfirmSignUpCommand(confirmParams);
    await cognitoClient.send(command);
    res
      .status(200)
      .json({ message: 'Email verified successfully!', verified: true });
  } catch (error) {
    console.error('❌ VERIFICATION ERROR:', error);
    if (error.name === 'CodeMismatchException') {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }
    res
      .status(400)
      .json({ error: 'Verification failed', details: error.message });
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

    const token = jwt.sign(
      { userId: newUser.userId, email: newUser.email },
      JWT_SECRET,
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
    res
      .status(500)
      .json({ error: 'Internal server error', details: err.message });
  }
});

// Matches endpoint
app.get('/matches', async (req, res) => {
  const { userId } = req.query;
  console.log('Fetching matches for user:', userId);

  try {
    if (!userId) return res.status(400).json({ message: 'UserId is required' });

    const userParams = {
      TableName: 'usercollection',
      Key: { userId: userId },
    };

    const userResult = await docClient.send(new GetCommand(userParams));
    if (!userResult.Item)
      return res.status(404).json({ message: 'User not found' });

    const user = userResult.Item;

    const scanParams = {
      TableName: 'usercollection',
      FilterExpression: 'userId <> :currentUserId',
      ExpressionAttributeValues: {
        ':currentUserId': userId,
      },
    };

    const scanResult = await docClient.send(new ScanCommand(scanParams));

    const likedUserIds =
      user.likedProfiles?.map(profile =>
        typeof profile === 'string' ? profile : profile.likedUserId,
      ) || [];

    const excludeIds = [...(user.matches || []), ...likedUserIds, userId];

    const potentialMatches = (scanResult.Items || []).filter(
      item => !excludeIds.includes(item.userId),
    );

    let filteredMatches = potentialMatches;
    if (user.datingPreferences && user.datingPreferences.length > 0) {
      filteredMatches = potentialMatches.filter(
        item =>
          user.datingPreferences.includes(item.gender) &&
          item.datingPreferences?.includes(user.gender),
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
    res.status(200).json({ success: true, matches });
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

  if (!userId) return res.status(400).json({ message: 'User id is required' });

  try {
    const params = { TableName: 'usercollection', Key: { userId: userId } };
    const result = await docClient.send(new GetCommand(params));
    if (!result.Item)
      return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ success: true, user: result.Item });
  } catch (error) {
    console.log('Error fetching user details', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Auth middleware using the shared secret
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader)
    return res.status(401).json({ message: 'Token is required' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token is required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ JWT VERIFY ERROR:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

app.post('/like-profile', authenticateToken, async (req, res) => {
  const { userId, likedUserId, image, comment = null, type, prompt } = req.body;

  if (req.user.userId !== userId)
    return res.status(403).json({ message: 'Unauthorized action' });
  if (!userId || !likedUserId)
    return res.status(400).json({ message: 'Missing required parameters' });

  try {
    // Fetch current user using docClient
    const userData = await docClient.send(
      new GetCommand({ TableName: 'usercollection', Key: { userId } }),
    );
    if (!userData.Item)
      return res.status(404).json({ message: 'User not found' });

    const user = userData.Item;
    const likesRemaining = user.likes ?? 0;
    const likesLastUpdated = new Date(user.likesLastUpdated || 0);
    const now = new Date();
    const maxLikes = 2;
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - likesLastUpdated >= oneDay) {
      await docClient.send(
        new UpdateCommand({
          TableName: 'usercollection',
          Key: { userId },
          UpdateExpression: 'SET likes = :maxLikes, likesLastUpdated = :now',
          ExpressionAttributeValues: {
            ':maxLikes': maxLikes,
            ':now': now.toISOString(),
          },
        }),
      );
      user.likes = maxLikes;
    } else if (likesRemaining <= 0) {
      return res.status(403).json({
        message:
          'Daily like limit reached, please subscribe or try again tomorrow',
      });
    }

    const newLikes = user.likes - 1;
    await docClient.send(
      new UpdateCommand({
        TableName: 'usercollection',
        Key: { userId },
        UpdateExpression: 'SET likes = :newLikes',
        ExpressionAttributeValues: { ':newLikes': newLikes },
      }),
    );

    const newLike = { userId, type };
    if (type === 'image') {
      if (!image)
        return res.status(400).json({ message: 'Image URL is required' });
      newLike.image = image;
    } else if (type === 'prompt') {
      if (!prompt || !prompt.question || !prompt.answer) {
        return res.status(400).json({ message: 'Prompt data is required' });
      }
      newLike.prompt = prompt;
    }
    if (comment) newLike.comment = comment;

    // Append newLike to liked user's receivedLikes
    await docClient.send(
      new UpdateCommand({
        TableName: 'usercollection',
        Key: { userId: likedUserId },
        UpdateExpression:
          'SET receivedLikes = list_append(if_not_exists(receivedLikes, :empty_list), :newLike)',
        ExpressionAttributeValues: { ':newLike': [newLike], ':empty_list': [] },
      }),
    );

    // Append likedUserId to current user's likedProfiles
    await docClient.send(
      new UpdateCommand({
        TableName: 'usercollection',
        Key: { userId },
        UpdateExpression:
          'SET likedProfiles = list_append(if_not_exists(likedProfiles, :empty_list), :likedUserId)',
        ExpressionAttributeValues: {
          ':likedUserId': [likedUserId],
          ':empty_list': [],
        },
      }),
    );

    return res.status(200).json({ message: 'Profile liked successfully!' });
  } catch (error) {
    console.error('Error liking profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Received likes endpoint (requires auth)
app.get('/received-likes/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  console.log('🔍 Fetching received likes for user:', userId);

  try {
    const params = {
      TableName: 'usercollection',
      Key: { userId },
      ProjectionExpression: 'receivedLikes',
    };
    const data = await docClient.send(new GetCommand(params));
    console.log('📦 Raw user data:', JSON.stringify(data, null, 2));

    if (!data.Item) return res.status(404).json({ message: 'User not found' });

    const receivedLikes = data.Item?.receivedLikes || [];
    console.log(
      '💖 Raw receivedLikes:',
      JSON.stringify(receivedLikes, null, 2),
    );

    // Enrich likes with user info (if available)
    const enrichedLikes = await Promise.all(
      receivedLikes.map(async like => {
        try {
          const userParams = {
            TableName: 'usercollection',
            Key: { userId: like.userId },
            ProjectionExpression: 'userId, firstName, imageUrls, prompts',
          };

          const userData = await docClient.send(new GetCommand(userParams));
          const user = userData?.Item
            ? {
                userId: userData.Item.userId,
                firstName: userData.Item.firstName,
                imageUrls: userData.Item.imageUrls || null,
                prompts: userData.Item.prompts || [],
              }
            : {
                userId: like.userId,
                firstName: 'Unknown User',
                imageUrls: null,
                prompts: [],
              };

          return { ...like, user };
        } catch (error) {
          console.log('❌ Error fetching user for like:', error);
          return {
            ...like,
            user: {
              userId: like.userId,
              firstName: 'Unknown User',
              imageUrls: null,
              prompts: [],
            },
          };
        }
      }),
    );

    console.log('✨ Enriched likes:', JSON.stringify(enrichedLikes, null, 2));
    res.status(200).json({ receivedLikes: enrichedLikes });
  } catch (error) {
    console.log('❌ Error getting likes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Temporary test endpoint without authentication
app.get('/test-received-likes/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('🔍 TEST ENDPOINT - Fetching received likes for user:', userId);

  try {
    const params = {
      TableName: 'usercollection',
      Key: { userId },
      ProjectionExpression: 'receivedLikes',
    };
    const data = await docClient.send(new GetCommand(params));
    console.log('📦 Raw DynamoDB response:', JSON.stringify(data, null, 2));
    if (!data.Item) return res.status(404).json({ message: 'User not found' });

    const receivedLikes = data.Item?.receivedLikes || [];
    console.log(
      '💖 Received likes array:',
      JSON.stringify(receivedLikes, null, 2),
    );

    res.status(200).json({ success: true, receivedLikes, rawData: data.Item });
  } catch (error) {
    console.log('❌ Error in test endpoint:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
});

// Login endpoint (Cognito + local JWT)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Email', email);
  console.log('password', password ? '***' : null);

  const authParams = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  try {
    const authCommand = new InitiateAuthCommand(authParams);
    const authResult = await cognitoClient.send(authCommand);
    const { IdToken, AccessToken, RefreshToken } =
      authResult.AuthenticationResult || {};

    // Fetch user by email from DynamoDB (using docClient Query)
    const userQueryParams = {
      TableName: 'usercollection',
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :emailValue',
      ExpressionAttributeValues: {
        ':emailValue': email,
      },
    };

    const userResult = await docClient.send(new QueryCommand(userQueryParams));

    if (!userResult.Items || userResult.Items.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.Items[0];
    const userId = user?.userId;

    // sign a local JWT using the shared secret
    const token = jwt.sign({ userId: userId, email: email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ token, IdToken, AccessToken, RefreshToken });
  } catch (error) {
    console.log('Error in /login:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error', details: error.message });
  }
});

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
