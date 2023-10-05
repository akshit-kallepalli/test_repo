const express = require('express');
const sequelize = require('./db');
const User = require('./models/user');
const {Assignment, Assignment_links} = require('./models/assignment');
const basicAuth = require('./auth');

const dotenv = require('dotenv');

dotenv.config();


const app = express();
app.use(express.json());

// Health Check endpoint
app.get('/healthz', async (req, res) => {
  try {
    if (req.query && Object.keys(req.query).length > 0) {
      // If there are query parameters, return HTTP 400 Bad Request
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.status(400).send();
    } else if (req.body && Object.keys(req.body).length > 0) {
      // If there is a body, return HTTP 400 Bad Request
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.status(400).send();
    } else {
      await sequelize.authenticate();

      // If the check passes and there is no body or query parameters, return HTTP 200 OK
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.status(200).send();
    }
  } catch (error) {
    console.error(error);
    // If the check fails, return HTTP 503 Service Unavailable
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.status(503).send();
  }
});

// Route to retrieve all assignments with Basic Authentication 
app.get('/v1/assignments', basicAuth, async (req, res) => {
  try {
    
    const assignments = await Assignment.findAll();

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Unable to retrieve assignments' });
  }
});


// Route to create a new assignment 
app.post('/v1/assignments', basicAuth, async (req, res) => {
  try {

    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, points, num_of_attempts, deadline } = req.body;

    const newAssignment = await Assignment.create({
      name,
      points,
      num_of_attempts,
      deadline,
    });

    const concatenatedId = `${user.id}_${newAssignment.id}`;

    const assignmentLink = await Assignment_links.create({
      id: concatenatedId,
    });

      const responsePayload = {
        concatenatedId,
        newAssignment,
        assignmentLink, 
      };
    res.status(201).json(responsePayload);
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Unable to create assignment' });
  }
});


// Route to get assignment details by ID
app.get('/v1/assignments/:id',basicAuth, async (req, res) => {
  try {

    const { id } = req.params;

    const assignment = await Assignment.findOne({ where: { id } });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Unable to retrieve assignment details' });
  }
});

// Route to update an assignment by ID
app.put('/v1/assignments/:id', basicAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    // Us Sequelize to find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Using Sequelize to find the assignment by its ID
    const assignment = await Assignment.findOne({ where: { id } });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const concatenatedId = `${user.id}_${assignment.id}`;
    console.log(concatenatedId);

    const assignmentLink = await Assignment_links.findOne({ where: { id: concatenatedId } });

    if (!assignmentLink) {
      return res.status(403).json({ error: 'You are not authorized to update this assignment' });
    }

    const { name, points, num_of_attempts, deadline } = req.body;

    // Updating the assignment with the new data
    await assignment.update({
      name,
      points,
      num_of_attempts,
      deadline,
    });

    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Unable to update assignment' });
  }
});

// Route to delete an assignment by ID
app.delete('/v1/assignments/:id', basicAuth, async (req, res) => {
  try {
   
    const { id } = req.params;

    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const assignment = await Assignment.findOne({ where: { id } });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const concatenatedId = `${user.id}_${assignment.id}`;

    const assignmentLink = await Assignment_links.findOne({ where: { id: concatenatedId } });

    if (!assignmentLink) {
      return res.status(403).json({ error: 'You are not authorized to delete this assignment' });
    }

    // Deleting the assignment from the database
    await assignment.destroy();

    await assignmentLink.destroy();

    res.status(200).json({ message: 'Assignment and Assignment_links record deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Unable to delete assignment' });
  }
});

app.patch('/v1/assignments/:id', basicAuth, async (req, res) => {
  try {
    res.status(405).json({ error: 'Method Not Allowed: Use PUT method to update assignments' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  module.exports = app;