// Declare dependencies
const express = require('express');
const app = express();
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');

app.use(express.json());
app.use(cors());
dotenv.config();

// connect to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Check if db connection works
db.connect(err => {
    // if unsuccessful
    if(err){
        return console.log('Error connecting to the Mysql database: ', err)
    }
    // if successful
    console.log('Connected to mysql successfully as id: ', db.threadId)
})

// Set the view engine and views directory
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views')

// Retrieve all patients info
app.get('/patients', (req, res) => {
    // GET patients
    const getpatients = 'SELECT * FROM patients';
    db.query(getpatients, (err, results) => {
        if(err){
            console.error(err)
            return res.status(500).send('Failed to get patients')
        }
        res.status(200).render('patients', {results})
    });
});

// Retrieve all providers info
app.get('/providers', (req, res)=> {
    const getProviders = 'SELECT first_name, last_name, provider_specialty FROM providers';
    db.query(getProviders, (err, data) => {
        if (err) {
            return res.status(400).send('Failed to get providers details')
        }
        res.status(200).render('providers', { data });
    });
});

// Retrieve patient by their first name
// app.get('', (req, res) => {
//     const getPatientFirstName = 'SELECT * FROM patients WHERE first_name = ?'
// })

// filtering patients by first name that ends with y
app.get('/patients/first-name', (req, res) => {
    const { firstName } = req.query; // Get the first name from query parameters
    const query = "SELECT * FROM patients WHERE first_name = ?";
    
    db.query(query, [firstName], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to retrieve patients by first name');
        }
        res.status(200).render('patients', { results });
    });
});

// Define the endpoint to get providers by their specialty
app.get('/providers/specialty/:specialty', (req, res) => {
    // Extract the specialty from the request parameters
    const specialty = req.params.specialty;
    
    // SQL query to retrieve providers by specialty
    const query = 'SELECT * FROM providers WHERE provider_specialty = ?';

    // Execute the query, passing the specialty as a parameter
    db.query(query, [specialty], (err, data) => {
        if (err) {
            // Handle errors, such as database connection issues
            console.error(err);
            return res.status(500).send('Failed to retrieve providers by specialty');
        }

        // Send back the results
        if (data.length > 0) {
            res.status(200).render('providers', { data });  // Return the list of providers
        } else {
            res.status(404).send('No providers found with the specified specialty');
        }
    });
});



// listen to the server
app.listen(process.env.PORT, () =>{
    console.log(`server is runnig on http://localhost:${process.env.PORT}`);
});