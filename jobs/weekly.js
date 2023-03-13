const nodemailer = require('nodemailer');
const ejs = require('ejs');
const { workerData, parentPort } = require('worker_threads');
const { query } = require('../utils/db');

async function sendWeeklyEmail() {
    console.log('Sending email...');
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'vivekdbz248@gmail.com',
            // pass: 'zltasmuetrabsatu'
            pass: 'qpieytqwtdhpecuu'
            // pass: 'htqeryxbcgfstpaa'
        }
    });

    const doctors = await query('SELECT * FROM doctor, user WHERE doctor.doctorID = user.userID');
    doctors.forEach(async doctor => {
        console.log(doctor);
        // const patients = await query(`SELECT * FROM patient, user, treatment, test WHERE patient.doctorID = ${doctor.doctorID} AND patient.patientID = treatment.patientID AND patient.patientID = test.patientID AND patient.patientID = treatment.patientID AND patient.patientID = test.patientID`);
        const patients = await query(`SELECT * FROM patient WHERE patient.patientID in (SELECT patientID FROM treatment WHERE treatment.doctorID = ${doctor.doctorID})`);
        console.log(patients);
        const treatments = await query(`SELECT * FROM treatment`);
        const tests = await query(`SELECT * FROM test`);
        console.log(treatments);
        ejs.renderFile('./views/weekly.ejs', { patients, treatments, tests }, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const mailOptions = {
                    from: 'vivekdbz248@gmail.com',
                    to: doctor.email,
                    // to: 'vivekdbz248@gmail.com',
                    subject: 'Weekly Report',
                    html: data
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
        });
    });
}

sendWeeklyEmail();