const persist = require("./persistance.js")

/**
 * This function attempts to assign a shift to an employee. This function checks to ensure
 * that the employee exists, the shift exists, and that the combination employee/shift has
 * not already been recorded.
 *
 * @param {string} empId
 * @param {string} shiftId
 * @returns {string} returns message of confirmation "OK" or the problem
 */
async function assignShift(empId, shiftId) {
    // check that empId exists
    let employee = await persist.findEmployee(empId)
    if (!employee) {
        return "Employee does not exist"
    }

    // check that shiftId exists
    let shift = await persist.findShift(shiftId)
    if (!shift) {
        return "Shift does not exist"
    }

    // check that empId,shiftId doesn't exist
    let assignment = await persist.findAssignment(empId, shiftId)
    if (assignment) {
        return "Employee already assigned to shift"
    }

    // add empId,shiftId into the bridge
    await persist.addAssignment(empId, shiftId)
    return "Ok"
}

/**
 * Return a list of all employees.
 * @returns {Array<{ employeeId: string, name: string, phone: string }>}
 */
async function getAllEmployees() {
    return await persist.getAllEmployees()
}

/**
 * Add a new employee record.
 * @param {{name:string, phone:string}} emp
 */
async function addEmployee(emp) {
    await persist.addEmployeeRecord(emp)
}

/**
 * Get a list of shifts for an employee.
 * @param {string} empId
 * @returns {Array<{shiftId:string, date:string, startTime:string, endTime:string}>}
 */
async function getEmployeeShifts(empId) {
    return await persist.getEmployeeShifts(empId)
}

module.exports = {
    assignShift,
    getAllEmployees,
    addEmployee,
    getEmployeeShifts
}
