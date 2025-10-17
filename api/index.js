import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';

import { configDotenv } from 'dotenv';
import { docClient, PutCommand } from './db';
const app = express();
app.use(cors());
configDotenv();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const PORT = 9000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const dynamoDbClient = new DynamoDBClient({ region: 'us-east-2' });

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'us-east-2',
});

const server = http.createServer(app);
app.post('/register', async (req, res) => {
  try {
    const userData = req.body;

    console.log('Data', userData);

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
      imageUrls: userData.imageUrls,
      prompts: userData.prompts,
      likes: 2,
      roses: 1,
      likedProfiles: [],
      receivedLikes: [],
      matches: [],
      blockedUsers: [],
    };
    const params = {
      TableName: 'usercollection',
      Item: newUser,
    };

    await docClient.send(new PutCommand(params));
    const secretKey = '';
    const token = jwt.sign({ userId: newUser.userId }, secretKey);

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
