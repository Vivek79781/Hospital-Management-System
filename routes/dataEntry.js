const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');

router.get('/', async(req, res) => {
    const patients = await query('select * from Patient');
    const tests = await query(`select * from Test where testStatus='Pending'`);
    res.render('dataEntry/dashboard', { patients, tests });
});

router.get('/patient/:id/updateTest', async(req, res) => {
    const { id } = req.params;
    const tests = await query(`select * from Test where patientID=${id} AND testStatus='Pending'`);
    console.log(tests);
    res.render('dataEntry/updateTest', { id, tests });
});

router.put('/patient/:id/updateTest/:testID', async(req, res) => {
    const { id, testID } = req.params;
    const { testResult } = req.body;
    // Update test result and testStatus
    await query(`update Test set testResult='${testResult}', testStatus='completed' where testID=${testID}`);
    req.flash('success', 'Test result updated successfully');
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