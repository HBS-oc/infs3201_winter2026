const { MongoClient } = require("mongodb");

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
async function getEmployeeById(id) {
    return await db.collection("employees").findOne({ id: id });
}

/**
 * Updates an employee's name and phone.
 * @param {string} id
 * @param {string} name
 * @param {string} phone
 * @returns {Promise<void>}
 */
async function updateEmployee(id, name, phone) {
    await db.collection("employees").updateOne(
        { id: id },
        { $set: { name: name, phone: phone } }
    );
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
    return await db.collection("shifts")
        .find({ employeeId: employeeId })
        .sort({ date: 1, startTime: 1 })
        .toArray();
}


/**
 * Retrieves all assignments.
 * @returns {Promise<Array>}
 */
async function getAllAssignments() {
    return await db.collection("assignments").find().toArray();
}

/**
 * Retrieves assignments for a specific employee.
 * @param {string} employeeId
 * @returns {Promise<Array>}
 */
async function getAssignmentsByEmployeeId(employeeId) {
    return await db.collection("assignments")
        .find({ employeeId: employeeId })
        .toArray();
}

module.exports = {
    connect,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    getAllShifts,
    getShiftsByEmployeeId,
    getAllAssignments,
    getAssignmentsByEmployeeId
};