const persistence = require('./persistence.js')
const email = require('./emailSystem.js')

/**
 * Return a list of all employees loaded from the storage.
 * @returns {Array<{ employeeId: string, name: string, phone: string }>} List of employees
 */
async function getAllEmployees() {
    return await persistence.getAllEmployees()
}

async function getEmployee(id) {
    return await persistence.findEmployee(id)
}

function generateOTP(){
    return Math.floor(100000 + Math.random()*900000).toString()
}

async function login2fa(user, password){
    let result = await persistence.checkCredentials(user, password)
    if (!result) { 
        return false;
    }

    const code = generateOTP()
    const expiry = new Date(Date.now() + 3*60*1000)

    await persistence.setTwoFactorCode(user, code, expiry)

    
}

/**
 * Attempt to do a login. If successful then the function will return a session ID and a time duration
 * in seconds for the validity of the session. If unsuccessful then the function returns null.
 * @param {String} username 
 * @param {String} password 
 */
async function startSession(username, password) {
    // check that the credentials are valid
    let result = await persistence.checkCredentials(username, password)
    if (result) {
        // credentials good... start a session.
        const sessionId = crypto.randomUUID()
        await persistence.createSession(sessionId, 5*60, {
            user: username
        })
        return {sessionId, duration: 5*60}
    }
    return null
}

/**
 * Determine if there is an active session.
 * @param {String} sessionId
 * @returns True is there is an active session associated with the id.
 */
async function validSession(session) {
    let result = await persistence.getSessionData(session)
    return result != null
}

/**
 * Extend a session.  The function returns the extension time in seconds.
 * @param {*} sessionId
 * @returns The number of seconds by which the session has been extended.
 */
async function extendSession(session) {
    let extension = 5*60
    await persistence.extendSession(session, extension)
    return extension
}

/**
 * Log an event to the security log.
 * 
 * @param {*} sessionId 
 * @param {*} url 
 * @param {*} method 
 */
async function logEvent(sessionId, url, method) {
    let sessionData = await persistence.getSessionData(sessionId)
    let username = ""
    if (sessionData) {
        username = sessionData.user
    }
    persistence.logEvent(username, url, method)
}


/**
 * Get a list of shiftIDs for an employee.
 * @param {string} empId 
 * @returns {Array<{string}>}
 */
async function getEmployeeShifts(empId) {
    return await persistence.getEmployeeShifts(empId)
}


/**
 * Add a new employee record to the system. The empId is automatically generated based
 * on the next available ID number from what is already in the file.
 * @param {{name:string, phone:string}} emp 
 */
async function addEmployeeRecord(emp) {
    return await persistence.addEmployeeRecord(emp)
}

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
    return await persistence.assignShift(empId, shiftId)
}


/**
 * This function attempts to assign a shift to an employee. This function checks to ensure
 * that the employee exists, the shift exists, and that the combination employee/shift has 
 * not already been recorded.
 * 
 * The function currently returns string messages indicating whether the operation was successful
 * or why it failed.  A serious improvement would be to use exceptions; this will be refactored
 * at a later time.
 * 
 * NOTE: The referential integrity check here is being done in the business layer because we want to
 * make sure that we don't assign non-existent employees to non-existing shifts.  We are also checking
 * that the same employee is not assigned to the same shift multiple times.  If this check were implemented
 * as well in the persistence it would be okay (i.e. FK and PK constraints).. it *should* still be done
 * here because it is really a business rule as well.
 * 
 * @param {string} empId 
 * @param {string} shiftId 
 * @returns {string} A message indicating the problem of the word "Ok"
 */
async function assignShift(empId, shiftId) {
    // check that empId exists
    let employee = await persistence.findEmployee(empId)
    if (!employee) {
        return "Employee does not exist"
    }
    // check that shiftId exists
    let shift = await persistence.findShift(shiftId)
    if (!shift) {
        return "Shift does not exist"
    }
    // check that empId,shiftId doesn't exist already
    let assignment = await persistence.findAssignment(empId, shiftId)
    if (assignment) {
        return "Employee already assigned to shift"
    }


    // make sure that the new assignment will not violate the rule on the
    // number of hours per day.. this should be a separate function.
    let maxHours = await persistence.getDailyMaxHours()
    let currentShifts = await persistence.getEmployeeShiftsOnDate(empId, shift.date)
    let newShiftLength = computeShiftDuration(shift.startTime, shift.endTime)
    let scheduledHours = 0
    for (let s of currentShifts) {
        scheduledHours += computeShiftDuration(s.startTime, s.endTime)
    }
    let newAllocation = newShiftLength + scheduledHours
    console.log(`employee has ${scheduledHours} hours already, with new shift this will be ${newAllocation}`)
    if (newAllocation > maxHours) {
        return "Hour Violation"
    }

    // add empId,shiftId into the bridge
    await persistence.addAssignment(empId, shiftId)
    
    return "Ok"
}

/**
 * Computes the duration of a shift in hours.  From ChatGPT!
 *
 * @param {string} startTime Time in HH:MM (24-hour format)
 * @param {string} endTime   Time in HH:MM (24-hour format)
 * @returns {number} Length of the shift in hours
 */
function computeShiftDuration(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  return (endTotalMinutes - startTotalMinutes) / 60;
}

async function disconnectDatabase() {
    await persistence.disconnectDatabase()
}

async function updateEmployee(emp) {
    return await persistence.updateEmployee(emp)
}


module.exports = {
    getAllEmployees, assignShift, addEmployeeRecord, getEmployeeShifts, disconnectDatabase,
    getEmployee, updateEmployee,
    startSession, validSession, extendSession, logEvent
}