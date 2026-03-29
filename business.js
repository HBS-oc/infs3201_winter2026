const persist = require("./persistance.js");
const crypto = require("crypto")

/**
 * Initializes the business layer (connects to MongoDB).
 * Call this once before using any other business functions.
 * @returns {Promise<void>}
 */
async function connect() {
    await persist.connect();
}

/**
 * 
 * @param {*} plain plain text password
 * @returns hashed password
 */
function hashPassword(plain){
    return crypto.createHash("sha256").update(plain).digest("hex")
}


async function verifyLogin(username, password){
    const hashedPass = hashPassword(password)
    return await persist.getUserByLogin(username, hashedPass)
}

/**
 * Return a list of all employees.
 * @returns {Promise<Array>}
 */
async function getAllEmployees() {
    return await persist.getAllEmployees();
}

async function startSession(username){
    const sessionId = crypto.randomUUID()
    const expiry = new Date(Date.now() + 5 * 60 * 1000)

    await persist.createSession(sessionId, username, expiry)

    return sessionId
}

async function validateSession(sId){
    const session = await persist.getSessionById(sId)

    if(!session){
        return null
    }

    if (session.expiry < Date.now()){
        await persist.terminateSession(sId)
        return null
    }

    const newExpiry = new Date(Date.now() + 5 * 60 * 1000)
    await persist.updateSessionExpiry(sId, newExpiry)

    return session
}

async function logout(sId){
    await persist.terminateSession(sId)
}

/**
 * Get one employee by id.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function getEmployeeById(id) {
    return await persist.getEmployeeById(id);
}

/**
 * Update employee details.
 * @param {string} id
 * @param {string} name
 * @param {string} phone
 * @returns {Promise<void>}
 */
async function updateEmployee(id, name, phone) {
    await persist.updateEmployee(id, name, phone);
}

/**
 * Get shifts for an employee (sorted by date/time in persistence).
 * @param {string} employeeId
 * @returns {Promise<Array>}
 */
async function getShiftsByEmployeeId(employeeId) {
    return await persist.getShiftsByEmployeeId(employeeId);
}


module.exports = {
    connect,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    getShiftsByEmployeeId,
    verifyLogin,
    startSession,
    validateSession,
    logout
};