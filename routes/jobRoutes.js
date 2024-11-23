const express = require('express');
const router = express.Router();
const fs = require('fs');

// Utility function to read jobs data from file
const getJobsData = () => {
  const rawData = fs.readFileSync('./data/jobs.json', 'utf8');
  return JSON.parse(rawData);
};

// Delete a job by ID
router.post('/delete', (req, res) => {
  const { id } = req.body;
  let jobs = getJobsData().jobs;
  jobs = jobs.filter(job => job.id !== id); // Filter out the job by ID

  fs.writeFile('./data/jobs.json', JSON.stringify({ jobs }, null, 2), err => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Add a new job
router.post('/add', (req, res) => {
  const { title, location, type, description, skills, qualifications, benefits } = req.body;
  const newJob = {
    id: (Date.now()).toString(),
    title,
    location,
    type,
    jobDescription: description,
    requiredSkills: skills.split(','),
    qualifications: qualifications.split(','),
    benefits: benefits.split(','),
    postingDate: new Date().toISOString().split('T')[0],
  };

  let jobs = getJobsData().jobs;
  jobs.push(newJob);

  fs.writeFile('./data/jobs.json', JSON.stringify({ jobs }, null, 2), err => {
    if (err) throw err;
    res.redirect('/');
  });
});

module.exports = router;
