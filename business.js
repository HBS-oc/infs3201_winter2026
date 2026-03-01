const persist = require("./persistance.js");

/**
 * Initializes the business layer (connects to MongoDB).
 * Call this once before using any other business functions.
 * @returns {Promise<void>}
 */
async function connect() {
    await persist.connect();
}

/**
 * Return a list of all employees.
 * @returns {Promise<Array>}
 */
async function getAllEmployees() {
    return await persist.getAllEmployees();
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

/**
 * Get assignments for an employee.
 * @param {string} employeeId
 * @returns {Promise<Array>}
 */
async function getAssignmentsByEmployeeId(employeeId) {
    return await persist.getAssignmentsByEmployeeId(employeeId);
}

module.exports = {
    connect,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    getShiftsByEmployeeId,
    getAssignmentsByEmployeeId
};