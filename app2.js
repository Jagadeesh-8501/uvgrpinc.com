const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));
// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files like CSS
app.use(express.static(path.join(__dirname, 'public')));

// Utility function to read jobs data from file
const getJobsData = () => {
  const rawData = fs.readFileSync('./data/jobs.json', 'utf8');
  return JSON.parse(rawData);
};

// Function to save updated jobs data
const saveJobsData = (jobs) => {
  fs.writeFileSync('./data/jobs.json', JSON.stringify({ jobs }, null, 2));
};

// Serve the admin page with jobs and a job posting form
app.get('/admin', (req, res) => {
  const jobs = getJobsData().jobs; // Get jobs from the JSON file
  const applications = getApplicationsData(); // Get job applications from a file
  res.render('admin', { jobs, applications }); // Render admin.ejs with jobs and applications data
});

// Add a new job to the jobs list
app.post('/admin/jobs/add', (req, res) => {
  const { title, location, type, description, skills, qualifications, benefits } = req.body;

  // Validate that all necessary fields are present
  if (!title || !location || !type || !description || !skills || !qualifications || !benefits) {
    return res.status(400).send('Missing required fields');
  }

  // Create new job object with the current date
  const newJob = {
    id: (Date.now()).toString(), // Generate unique ID based on timestamp
    title,
    location,
    type,
    jobDescription: description,
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

// Approve a job application
app.post('/admin/approve/:id', (req, res) => {
  const { id } = req.params;
  let applications = getApplicationsData(); // Get current applications

  applications = applications.map(application => {
    if (application.id === id) {
      application.status = 'Approved';
    }
    return application;
  });

  saveApplicationsData(applications); // Save updated applications list
  res.redirect('/admin');
});

// Reject a job application
app.post('/admin/reject/:id', (req, res) => {
  const { id } = req.params;
  let applications = getApplicationsData(); // Get current applications

  applications = applications.map(application => {
    if (application.id === id) {
      application.status = 'Rejected';
    }
    return application;
  });

  saveApplicationsData(applications); // Save updated applications list
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
// Utility function to get job applications (for demo purposes, should come from DB in production)
const getApplicationsData = () => {
  const rawData = fs.readFileSync('./data/applications.json', 'utf8');
  return JSON.parse(rawData);
};

// Save updated applications data
const saveApplicationsData = (applications) => {
  fs.writeFileSync('./data/applications.json', JSON.stringify(applications, null, 2));
};


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
