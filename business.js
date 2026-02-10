/**
 * This function attempts to assign a shift to an employee. This function checks to ensure
 * that the employee exists, the shift exists, and that the combination employee/shift has 
 * not already been recorded.
 * 
 * The function currently returns string messages indicating whether the operation was successful
 * or why it failed.  A serious improvement would be to use exceptions; this will be refactored
 * at a later time.
 * 
 * @param {string} empId 
 * @param {string} shiftId 
 * @returns {string} A message indicating the problem of the word "Ok"
 */
async function assignShift(empId, shiftId) {
    // check that empId exists
    let employee = await findEmployee(empId)
    if (!employee) {
        return "Employee does not exist"
    }
    // check that shiftId exists
    let shift = await findShift(shiftId)
    if (!shift) {
        return "Shift does not exist"
    }
    // check that empId,shiftId doesn't exist
    let assignment = await findAssignment(empId, shiftId)
    if (assignment) {
        return "Employee already assigned to shift"
    }
    // add empId,shiftId into the bridge
    await addAssignment(empId, shiftId)
    return "Ok"
}

/**
 * Get a list of shiftIDs for an employee.
 * @param {string} empId 
 * @returns {Array<{string}>}
 */
async function getEmployeeShifts(empId) {
    let rawData = await fs.readFile('assignments.json')
    assignmentList = JSON.parse(rawData)
    let shiftIds = []
    for (let asn of assignmentList) {
        if (asn.employeeId == empId) {
            shiftIds.push(asn.shiftId)
        }
    }

    rawData = await fs.readFile('shifts.json')
    shiftList = JSON.parse(rawData)
    let shiftDetails = []
    for (let sh of shiftList) {
        if (shiftIds.includes(sh.shiftId)) {
            shiftDetails.push(sh)
        }
    }

    return shiftDetails
}