const { MongoClient, ObjectId } = require("mongodb");

const CONNECTION_STRING = "mongodb://60302091:G3TeCNnCT7HoFoo2@cluster0-shard-00-00.wrr68.mongodb.net:27017,cluster0-shard-00-01.wrr68.mongodb.net:27017,cluster0-shard-00-02.wrr68.mongodb.net:27017/infs3201_winter2026?ssl=true&authSource=admin&replicaSet=atlas-2te6sv-shard-0&retryWrites=true&w=majority";
const DATABASE_NAME = "infs3201_winter2026";

let db;

/**
 * Connects to MongoDB and initializes the database reference.
 * Must be called before using any other persistence functions.
 * @returns {Promise<void>}
 */
async function connect() {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    db = client.db(DATABASE_NAME);
}

/**
 * Verifies login of the user by querying the database.
 * @param {*} username username of the user
 * @param {*} hashedPassword hashed password of the user
 * @returns 
 */
async function getUserByLogin(username, hashedPassword){
    return await db.collection("users").findOne({ username: username, password: hashedPassword})
}


/**
 * Retrieves all employees.
 * @returns {Promise<Array>} list of employees
 */
async function getAllEmployees() {
    return await db.collection("employees").find().toArray();
}

/**
 * Retrieves a single employee by ID.
 * @param {string} id
 * @returns {Promise<Object|null>} employee
 */
async function getEmployeeById(employeeId) {
    return await db.collection("employees").findOne({ _id: new ObjectId(employeeId)});
}

/**
 * Updates an employee's name and phone.
 * @param {string} id
 * @param {string} name
 * @param {string} phone
 * @returns {Promise<void>}
 */
async function updateEmployee(employeeId, name, phone) {
    await db.collection("employees").updateOne(
        { _id: new ObjectId(employeeId) },
        { $set: { name: name, phone: phone } }
    );
}

/**
 * Creates session in the database
 * @param {*} sId 
 * @param {*} username 
 * @param {*} expiry 
 */
async function createSession(sId, username, expiry){
    await db.collection("sessions").insertOne({sessionId: sId, username: username, expiry: expiry})
}

/**
 * Gets session by querying ID
 * @param {*} sId 
 * @returns 
 */
async function getSessionById(sId){
    return await db.collection("sessions").findOne({sessionId: sId})
}

async function securityLog(username, url, method){
    await db.collection("logs").insertOne({
        timestamp: new Date(Date.now()),
        username: username,
        url: url,
        method: method
    })
}

/**
 * Update session expiry
 * @param {*} sId 
 * @param {*} expiry 
 */
async function updateSessionExpiry(sId, expiry){
    await db.collection("sessions").updateOne(
        {sessionId: sId},
        {$set: {expiry: expiry}}
    )
}

/**
 * Terminates the session from the DB
 * @param {*} sId 
 */
async function terminateSession(sId){
    await db.collection("sessions").deleteOne({
        sessionId: sId
    })
}


/**
 * Retrieves all shifts.
 * @returns {Promise<Array>}
 */
async function getAllShifts() {
    return await db.collection("shifts").find().toArray();
}

/**
 * Retrieves shifts for a specific employee.
 * Uses MongoDB query instead of loading entire collection.
 * @param {string} employeeId
 * @returns {Promise<Array>}
 */
async function getShiftsByEmployeeId(employeeId) {
    return await db.collection("shifts").find({employees: new ObjectId(employeeId)}).toArray();
}

module.exports = {
    connect,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    getAllShifts,
    getShiftsByEmployeeId,
    getUserByLogin,
    createSession,
    updateSessionExpiry,
    terminateSession,
    getSessionById,
    securityLog
};