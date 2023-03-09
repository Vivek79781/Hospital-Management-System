-- DELETE ALL TABLES
DROP TABLE Stay;
DROP TABLE Room;
DROP TABLE Treatment;
DROP TABLE Test;
DROP TABLE Appointment;
DROP TABLE Doctor;
DROP TABLE Patient;
DROP TABLE User;



-- create user table
CREATE TABLE User (
    userID INT NOT NULL,
    email VARCHAR(50) NOT NULL,
    role ENUM('Admin', 'DataEntry', 'FrontDesk', 'Doctor'),
    pass VARCHAR(50) NOT NULL,
    PRIMARY KEY (userID)
);

-- create patient table
CREATE TABLE Patient(
    patientID INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL,
    DOB DateTime NOT NULL,
    Gender ENUM('Male', 'Female', 'Prefer Not To Say') NOT NULL,
    Address VARCHAR(250) NOT NULL,
    Phone VARCHAR(10)NOT NULL,
    email VARCHAR(50) NOT NULL,
    Registration_Date DateTime NOT NULL,
    PRIMARY KEY (PatientID)
);

CREATE TABLE Doctor(
    doctorID INT NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Department VARCHAR(50) NOT NULL,
    Date_of_joining DateTIme NOT NULL,
    Position VARCHAR(50) NOT NULL,
    Gender ENUM('Male', 'Female', 'Prefer Not To Say') NOT NULL,
    PRIMARY KEY (doctorID),
    FOREIGN KEY (doctorID) references User(userID)
);

CREATE TABLE Appointment(
    appointmentID INT NOT NULL AUTO_INCREMENT,
    patientID INT NOT NULL,
    doctorID INT NOT NULL,
    Date DateTIme NOT NULL,
    priority INT NOT NULL,
    Reason VARCHAR(250) NOT NULL,
    Status ENUM('Pending', 'Completed', 'Cancelled') NOT NULL,
    PRIMARY KEY (appointmentID),
    FOREIGN KEY (patientID) references Patient(patientID),
    FOREIGN KEY (doctorID) references Doctor(doctorID)
);

-- create table test
CREATE TABLE Test(
    testID INT NOT NULL AUTO_INCREMENT,
    patientID INT NOT NULL,
    testCenter VARCHAR(50) NOT NULL,
    testName VARCHAR(50) NOT NULL,
    testDate DateTIme NOT NULL,
    testStatus ENUM('Pending', 'Completed', 'Cancelled') NOT NULL,
    testResult VARCHAR(250),
    PRIMARY KEY (testID),
    FOREIGN KEY (patientID) references Patient(patientID)
);

-- create table Treatment
CREATE TABLE Treatment(
    treatmentID INT NOT NULL AUTO_INCREMENT,
    patientID INT NOT NULL,
    doctorID INT NOT NULL,
    treatmentDate DateTIme NOT NULL,
    treatmentStatus ENUM('Pending', 'Completed', 'On Going') NOT NULL,
    Description VARCHAR(250) NOT NULL,
    PRIMARY KEY (treatmentID),
    FOREIGN KEY (patientID) references Patient(patientID),
    FOREIGN KEY (doctorID) references Doctor(doctorID)
);

-- create table Room
CREATE TABLE Room(
    roomNumber INT NOT NULL,
    roomType ENUM('General', 'Ventilator', 'ICU') NOT NULL,
    maxCapacity INT NOT NULL,
    currentOccupancy INT NOT NULL,
    PRIMARY KEY (roomNumber)
);

-- create table Stay
CREATE TABLE Stay(
    stayID INT NOT NULL AUTO_INCREMENT,
    patientID INT NOT NULL,
    roomNumber INT NOT NULL,
    AdmitDate DateTIme NOT NULL,
    DischargeDate DateTIme,
    PRIMARY KEY (stayID),
    FOREIGN KEY (patientID) references Patient(patientID),
    FOREIGN KEY (roomNumber) references Room(roomNumber)
);




-- Doctor Dashboard
-- List of all patients treated by the doctor
SELECT Patient.Name, Treatment.*
FROM Patient, Treatment
WHERE Patient.PatientID = Treatment.PatientID AND Treatment.DoctorID = 1;

-- Details of patients with id 1
SELECT *
FROM Patient
WHERE PatientID = 1;

SELECT *
FROM Treatment
WHERE PatientID = 1;

SELECT *
FROM Test
WHERE PatientID = 1;

SELECT * FROM User;
SELECT * FROM Doctor;


INSERT INTO User (userID, email, role, pass)
VALUES (1, 'admin@gmail.com', 'Admin', 'admin');

INSERT INTO User (userID, email, role, pass)
VALUES (2, 'd2@gmail.com', 'Doctor', 'd2');

INSERT INTO User (userID, email, role, pass)
VALUES (3, 'd3@gmail.com', 'Doctor', 'd3');

INSERT INTO User (userID, email, role, pass)
VALUES (4, 'fd1@gmail.com', 'FrontDesk', 'fd1');

INSERT INTO User (userID, email, role, pass)
VALUES (5, 'a1@gmail.com','Admin','a1');

INSERT INTO Doctor (doctorID, Name, Department, Date_of_joining, Position, Gender)
VALUES (1, 'Dr. Smith', 'Cardiology', '2022-01-01 00:00:00', 'Head of Department', 'Male');

INSERT INTO Doctor (doctorID, Name, Department, Date_of_joining, Position, Gender)
VALUES (2, 'Dr. Lee', 'Pediatrics', '2021-07-15 10:30:00', 'Pediatrician', 'Female');

INSERT INTO Doctor (doctorID, Name, Department, Date_of_joining, Position, Gender)
VALUES (3, 'Dr. Kumar', 'Oncology', '2020-05-10 15:45:00', 'Oncologist', 'Male');

INSERT INTO Patient (Name, DOB, Gender, Address, Phone, email, Registration_Date)
VALUES
('Rahul Sharma', '1990-05-15', 'Male', '123, New Colony, Jaipur', '9876543210', 'rahul@gmail.com', '2022-10-15 14:30:00'),
('Pooja Gupta', '1985-09-28', 'Female', '456, Model Town, Delhi', '9876543211', 'pooja.gupta@gmail.com', '2022-10-16 09:45:00'),
('Rohit Singh', '1982-02-11', 'Male', '789, Civil Lines, Agra', '9876543212', 'rohit.singh@gmail.com', '2022-10-17 16:15:00'),
('Shalini Verma', '1995-12-03', 'Female', '23, South City, Lucknow', '9876543213', 'shalini.verma@gmail.com', '2022-10-18 11:00:00'),
('Amit Kumar', '1978-07-22', 'Male', '12, Jawahar Nagar, Kanpur', '9876543214', 'amit.kumar@gmail.com', '2022-10-19 13:20:00');



INSERT INTO Appointment (patientID, doctorID, Date, priority, Reason, Status)
VALUES
(1, 1, '2022-11-10 10:00:00', 1, 'Follow up', 'Pending'),
(2, 1, '2022-11-12 11:30:00', 2, 'General check-up', 'Pending'),
(3, 2, '2022-11-13 09:00:00', 1, 'Fever', 'Pending'),
(4, 2, '2022-11-15 16:00:00', 2, 'Eye check-up', 'Pending'),
(5, 3, '2022-11-17 12:00:00', 1, 'Dental pain', 'Pending');



INSERT INTO Treatment (patientID, doctorID, treatmentDate, treatmentStatus, Description)
VALUES (1, 3, '2022-02-15 11:00:00', 'Pending', 'Physical therapy for back pain');

INSERT INTO Treatment (patientID, doctorID, treatmentDate, treatmentStatus, Description)
VALUES (2, 2, '2022-03-01 09:30:00', 'On Going', 'Weekly counseling sessions for anxiety');

INSERT INTO Treatment (patientID, doctorID, treatmentDate, treatmentStatus, Description)
VALUES (3, 1, '2022-02-28 14:45:00', 'Completed', 'Prescription for antibiotics for sinus infection');


INSERT INTO Test (patientID, testCenter, testName, testDate, testStatus, testResult)
VALUES (1, 'Apollo Diagnostics', 'COVID-19 RT PCR', '2022-02-28 14:00:00', 'Completed', 'Negative');

INSERT INTO Test (patientID, testCenter, testName, testDate, testStatus, testResult)
VALUES (2, 'Dr. Lal PathLabs', 'Lipid Profile', '2022-02-15 10:30:00', 'Completed', 'Normal');

INSERT INTO Test (patientID, testCenter, testName, testDate, testStatus, testResult)
VALUES (3, 'Thyrocare Technologies', 'Vitamin D3', '2022-03-01 16:00:00', 'Pending', NULL);

INSERT INTO Test (patientID, testCenter, testName, testDate, testStatus, testResult)
VALUES (4, 'SRL Diagnostics', 'Blood Sugar (Fasting)', '2022-02-22 09:00:00', 'Completed', '80 mg/dL');

INSERT INTO Test (patientID, testCenter, testName, testDate, testStatus, testResult)
VALUES (5, 'Metropolis Healthcare', 'Hemoglobin A1c', '2022-03-02 13:00:00', 'Pending', NULL);



INSERT INTO Room (roomNumber, roomType, maxCapacity, currentOccupancy)
VALUES (101, 'General', 5, 0),
       (102, 'General', 7, 0),
       (103, 'Ventilator', 2, 0),
       (104, 'ICU', 3, 0),
       (105, 'General', 9, 0),
       (106, 'Ventilator', 2, 0);


INSERT INTO Stay (patientID, roomNumber, AdmitDate, DischargeDate) VALUES
(1, 101, '2022-02-01 10:00:00', '2022-02-05 12:00:00'),
(2, 102, '2022-02-03 08:00:00', '2022-02-09 14:00:00'),
(3, 103, '2022-02-05 11:00:00', '2022-02-07 18:00:00'),
(4, 104, '2022-02-08 13:00:00', NULL),
(5, 105, '2022-02-10 16:00:00', NULL);

INSERT INTO Treatment (patientID, doctorID, treatmentDate, treatmentStatus, Description)
VALUES (2, 1, '2022-02-15 11:00:00', 'Pending', 'Physical therapy for back pain');