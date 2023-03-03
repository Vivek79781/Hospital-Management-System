const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');

router.get('/', (req, res) => {
    res.render('dataEntry/dashboard');
});

router.get('/patient/:id/updateTest', async(req, res) => {
    const { id } = req.params;
    const tests = await query(`select * from Test where patientID='${id} AND status='pending'`);
    res.render('dataEntry/updateTest', { id, tests });
});

router.post('/patient/:id/updateTest/:testID', async(req, res) => {
    const { id, testID } = req.params;
    const { testResult } = req.body;
    // Update test result and status
    await query(`update Test set testResult='${testResult}', status='completed' where testID='${testID}'`);
    res.redirect(`/dataEntry/patient/${id}/updateTest`);
});

router.get('/patient/:id/uploadImages', async(req, res) => {
    const { id } = req.params;
    res.render('dataEntry/uploadImages', { id });
});

router.post('/patient/:id/uploadImages', async(req, res) => {
    const { id } = req.params;
    res.redirect(`/dataEntry/patient/${id}/uploadImages`);
});

module.exports = router;