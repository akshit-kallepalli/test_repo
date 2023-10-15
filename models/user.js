const Sequelize = require('sequelize');
const sequelize = require('../db');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');


const User = sequelize.define('UserTable', {
    id: {
      type: Sequelize.STRING,
    primaryKey: true,
    defaultValue: () => uuidv4(), 
    },
    first_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    last_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
      type: Sequelize.STRING, 
      allowNull: false,
    },
    account_created: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    account_updated: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    timestamps: false, 
  });


sequelize.sync()
  .then(() => {
    console.log('Users Table synced successfully.');
  })
  .catch((error) => {
    console.error('Error syncing Users Table:', error);
  });

// Function to load data from CSV file and create user accounts
async function loadUsersFromCSV() {
    const csvFilePath = './opt/users.csv'; 
  
    try {
      const readStream = fs.createReadStream(csvFilePath);
      readStream.pipe(csv())
        .on('data', async (row) => {
          
          const existingUser = await User.findOne({
            where: {
              email: row.email,
            },
          });
  
          if (!existingUser || existingUser === null || existingUser === undefined) {

            
            const hashedPassword = await bcrypt.hash(row.password, 10);
  
            // Creating a new user
            await User.create({
              first_name: row.first_name,
              last_name: row.last_name,
              email: row.email,
              password: hashedPassword,
            });
          }
        })
        .on('end', () => {
          console.log('Users loaded successfully.');
        });
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }
  
  // Synchronizing the database and loading data
  sequelize.sync({ force: false })
    .then(() => {
      console.log('Database synced successfully.');
      loadUsersFromCSV();
    })
    .catch((error) => {
      console.error('Error syncing database:', error);
    });


module.exports = User;
