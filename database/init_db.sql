-- 1. NUCLEAR RESET
DROP DATABASE IF EXISTS taxi_system_db;
CREATE DATABASE taxi_system_db;
USE taxi_system_db;

-- ==========================================
-- A. CORE USERS & LOGINS
-- ==========================================

CREATE TABLE Users (
  userID INT NOT NULL AUTO_INCREMENT,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NULL,
  dob DATE NULL,
  dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
  isArchived TINYINT(1) DEFAULT '0',
  PRIMARY KEY (userID)
);

CREATE TABLE UserLogins (
  loginID INT NOT NULL AUTO_INCREMENT,
  userID INT NOT NULL,
  employeeID VARCHAR(50) NOT NULL,
  hashedPassword VARCHAR(255) NOT NULL,
  activeToken TEXT NULL,
  isActive TINYINT(1) DEFAULT '1',
  PRIMARY KEY (loginID),
  UNIQUE INDEX employeeID (employeeID),
  FOREIGN KEY (userID) REFERENCES Users (userID) ON DELETE CASCADE
);

CREATE TABLE UserActivityLog (
  logID INT NOT NULL AUTO_INCREMENT,
  userID INT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  actionType VARCHAR(50) NULL,
  details VARCHAR(255) NULL,
  PRIMARY KEY (logID),
  FOREIGN KEY (userID) REFERENCES Users (userID)
);

-- ==========================================
-- B. ASSETS & OPERATIONS
-- ==========================================

CREATE TABLE Vehicles (
  vehicleID INT NOT NULL AUTO_INCREMENT,
  plateNo VARCHAR(20) NOT NULL,
  type VARCHAR(50) NULL,
  status ENUM('Working', 'Maintenance') DEFAULT 'Working',
  dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
  isArchived TINYINT(1) DEFAULT '0',
  PRIMARY KEY (vehicleID),
  UNIQUE INDEX plateNo (plateNo)
);

-- ==========================================
-- C. NEW MODULES
-- ==========================================

CREATE TABLE GeospatialRoutes (
  routeID INT NOT NULL AUTO_INCREMENT,
  vehicleID INT NOT NULL,
  startLocation VARCHAR(255) NULL,
  endLocation VARCHAR(255) NULL,
  distanceKM DECIMAL(10,2) NULL,
  durationMins INT NULL,
  recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (routeID),
  FOREIGN KEY (vehicleID) REFERENCES Vehicles (vehicleID)
);

CREATE TABLE KPIDashboardMetrics (
  metricID INT NOT NULL AUTO_INCREMENT,
  vehicleID INT NOT NULL,
  metricName VARCHAR(100) NOT NULL,
  metricValue DECIMAL(10,2) NOT NULL,
  recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (metricID),
  FOREIGN KEY (vehicleID) REFERENCES Vehicles (vehicleID)
);

CREATE TABLE RNNForecasts (
  forecastID INT NOT NULL AUTO_INCREMENT,
  vehicleID INT NOT NULL,
  predictedFuelConsumption DECIMAL(10,2) NULL,
  confidenceScore DECIMAL(5,2) NULL,
  forecastDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (forecastID),
  FOREIGN KEY (vehicleID) REFERENCES Vehicles (vehicleID)
);

CREATE TABLE VehicleTelemetry (
  telemetryID INT NOT NULL AUTO_INCREMENT,
  vehicleID INT NOT NULL,
  speed DECIMAL(10,2) NULL,
  rpm INT NULL,
  fuelLevel DECIMAL(5,2) NULL,
  recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (telemetryID),
  FOREIGN KEY (vehicleID) REFERENCES Vehicles (vehicleID)
);

-- ==========================================
-- D. SEED DATA
-- ==========================================

-- 1. Users
INSERT INTO Users (userID, firstName, lastName, role) VALUES
(1, 'System', 'Admin', 'Admin');

-- 2. Logins
INSERT INTO UserLogins (userID, employeeID, hashedPassword, isActive) VALUES
(1, 'Admin', '$2b$10$ebU6j762YqtNM1OIIqrMKOuGvZdvE5jjIbgOK00ISD7vT1LPSk.Z6', 1);
