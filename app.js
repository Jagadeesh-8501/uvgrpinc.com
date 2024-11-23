
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');  // Add this line to require the 'fs' module
const crypto = require('crypto'); // Correct way to import crypto module

const users = [
    { id: 1, username: 'admin', password: 'ukgbfgkuj48', role: 'admin' }
];
// Middleware for static files
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Define the path to your JSON file
const filePath = path.join(__dirname, 'data/service.json');
const filePath1 = path.join(__dirname, 'data/jobs.json');

// Routes
app.get('/', (req, res) => {
    res.render('index'); // renders index.ejs
});

app.get('/about', (req, res) => {
    res.render('about'); // renders about.ejs
});
app.get('/apply', (req, res) => {
    res.render('apply'); // renders about.ejs
});



app.get('/contact', (req, res) => {
    res.render('contact'); // renders contact.ejs
});

// Define the loadServices function with 'res' as a parameter
function loadServices(res) {
    fs.promises.readFile(filePath, 'utf8')
        .then(data => {
            const services = JSON.parse(data);  // Parse JSON data
            res.render('services', { services });  // Render 'services.ejs' and pass the services data
        })
        .catch(err => {
            console.error('Error loading services:', err);
            res.status(500).send('Error loading services');
        });
}

// Services route
app.get('/services', (req, res) => {
    loadServices(res); // Call loadServices and pass the 'res' object
});



// Route for the Careers page
app.get('/careers', (req, res) => {

    // Load jobs data from JSON file inside the route
    try {
        const jsonData = fs.readFileSync(path.join(__dirname, 'data/jobs.json'), 'utf8');

        const jobsData = JSON.parse(jsonData); // Parse the JSON content

        if (jobsData && jobsData.jobs) {

            // Pass the jobs data to the EJS view
            res.render('careers', { jobs: jobsData.jobs });
        } else {
            console.log('No "jobs" array found in jobsData.');
            res.status(500).send('Error: Jobs data not found.');
        }
    } catch (error) {
        console.error('Error reading or parsing jobs.json:', error);
        res.status(500).send('Error loading job listings.');
    }
});

app.get('/jobdetails', (req, res) => {
    const jobId = req.query.job;  // Get job ID from query parameter

    if (!jobId) {
        return res.status(400).send('Job ID is missing');
    }

    // Load jobs data from JSON file
    try {
        const jsonData = fs.readFileSync(path.join(__dirname, 'data/jobs.json'), 'utf8');
        const jobsData = JSON.parse(jsonData);

        // Find the job that matches the ID
        const job = jobsData.jobs.find(job => job.id === jobId);

        if (job) {
            // Render the job details page and pass the job data
            res.render('jobdetails', { job });
        } else {
            res.status(404).send('Job not found');
        }
    } catch (error) {
        console.error('Error loading job data:', error);
        res.status(500).send('Error loading job data');
    }
});
// Add other routes similarly for careers, contact, services, etc.

const session = require('express-session');
require('dotenv').config();

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


const applicationsFilePath = path.join(__dirname, 'data/applications.json');
app.use(session({
    secret: 'yourSecretKey', // Change this to a secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 10 * 60 * 1000 // Session expiration time (10 minutes in milliseconds)
    }
}));
// Helper function to read applications
app.use(express.urlencoded({ extended: true }));



// Helper function to write applications back to the file
const writeApplications = (applications) => {
    fs.writeFileSync(applicationsFilePath, JSON.stringify(applications, null, 2));
};

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Login Route (GET request renders the login page)

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Validate username and password (simple example)
    if (username === 'admin' && password === 'admin123') {
        req.session.isLoggedIn = true; // Store login state in session
        req.session.username = username; // Store the username in the session

        res.redirect('/admin'); // Redirect to admin page
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Admin page route (access controlled)
app.get('/admin', (req, res) => {
    // Check if the user is logged in
    if (!req.session.isLoggedIn) {
        return res.redirect('/login'); // Redirect to login page if not logged in
    }

    // Fetch applications data
    const applications = getApplications();
    const jobs = getJobsData().jobs; // Get jobs from the JSON file

    // Render the admin page and pass applications data
    res.render('admin', { applications: applications,jobs });
});
function readApplications() {
    const applicationsFilePath = path.join(__dirname, 'data/applications.json');
    const rawData = fs.readFileSync(applicationsFilePath);
    return JSON.parse(rawData);
}
// Fetch applications data from JSON

// Logout route (optional)
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/login'); // Redirect to login page after logging out
    });
});
app.use(express.urlencoded({ extended: true }));

// Serve static files like CSS
app.use(express.static(path.join(__dirname, 'public')));

// Utility function to read jobs data from file
const getJobsData = () => {
  const rawData = fs.readFileSync('./data/jobs.json', 'utf8');
  return JSON.parse(rawData);
};
const getApplicationsData = () => {
    const filePath = path.join(__dirname, 'data/applications.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const applications = JSON.parse(rawData); // Parse and return applications array
    console.log('Applications Data:', applications); // Log the data to verify
    return applications;
};


  // Utility function to save applications data to JSON
  const saveApplicationsData = (data) => {
    const filePath = path.join(__dirname, 'data/applications.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};
const getApplications = () => {
    const filePath = path.join(__dirname, 'data/applications.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData); // Parse and return applications array
  };
  
  // Utility function to save applications data to JSON
  const saveApplications = (data) => {
    const filePath = path.join(__dirname, 'data/applications.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  };
// Function to save updated jobs data
const saveJobsData = (jobs) => {
  fs.writeFileSync('./data/jobs.json', JSON.stringify({ jobs }, null, 2));
};



app.post('/admin/jobs/add', (req, res) => {
    const { title, location, type, description, skills,responsibiliti, qualifications, benefits } = req.body;
  
    // Validate that all necessary fields are present
    if (!title || !location || !type || !description ||!responsibiliti || !skills || !qualifications || !benefits) {
      return res.status(400).send('Missing required fields');
    }
  
    // Create new job object with the current date
    const newJob = {
      id: (Date.now()).toString(), // Generate unique ID based on timestamp
      title,
      location,
      type,
      jobDescription: description,
      keyResponsibilities:responsibiliti.split(','),
      requiredSkills: skills.split(','),
      qualifications: qualifications.split(','),
      benefits: benefits.split(','),
      postingDate: new Date().toISOString().split('T')[0], // Format posting date (YYYY-MM-DD)
    };
  
    let jobs = getJobsData().jobs; // Get current jobs
    jobs.push(newJob); // Add new job to the list
  
    saveJobsData(jobs); // Save updated jobs list to file
  
    res.redirect('/admin'); // Redirect back to the admin page
  });
// Approve and Reject Routes
app.post('/admin/approve/:id',  (req, res) => {
    const { id } = req.params;
    const applications = readApplications();
    const application = applications.find(app => app.id == id);

    if (application) {
        // Send email to applicant (will trigger mail client)
        const email = application.email;
        const mailtoLink = `mailto:${email}?subject=Job Application Status&body=Dear ${application.first_name},%0D%0A%0D%0AWe are pleased to inform you that your application has been approved.%0D%0A%0D%0AThank you for applying.%0D%0A%0D%0ABest regards,%0D%0AYour Company`;
        res.redirect(mailtoLink);
    } else {
        res.status(404).send('Application not found');
    }
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html')); // Path to login page HTML
});

app.post('/admin/reject/:id', (req, res) => {
    const applicantId = req.params.id; // Get the applicant ID from the URL parameters
    let applications = getApplicationsData(); // Get current applications data

    // Check if the applicant exists in the applications data

    // Ensure both the applicant ID and application.id are the same type (string)
    const applicationExists = applications.some(applicant => String(applicant.id) === String(applicantId));
    
    if (!applicationExists) {
        return res.status(404).send('Application not found'); // If not found, send an error
    }
    

    // Filter out the rejected application
    const updatedApplications = applications.filter(applicant => String(applicant.id) !== String(applicantId));

    // Save the updated list of applications
    saveApplicationsData(updatedApplications);

    // Log the updated applications list for debugging
    console.log('Updated Applications:', updatedApplications);

    // Redirect back to the admin page
    res.redirect('/admin');
});

app.post('/admin/jobs/delete', (req, res) => {
    const { id } = req.body;
  
    if (!id) {
      return res.status(400).send('Job ID is required');
    }
  
    let jobs = getJobsData().jobs; // Get current jobs
  
    // Filter out the job to be deleted
    jobs = jobs.filter(job => job.id !== id);
  
    saveJobsData(jobs); // Save updated jobs list to file
  
    res.redirect('/admin'); // Redirect back to the admin page
  });
// Logout Route (Logs out the user)
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
