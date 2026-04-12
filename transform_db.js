const mongodb = require('mongodb')


async function getDatabase() {
    cachedClient = new mongodb.MongoClient('mongodb://HBS:1234@ac-a7xqvt3-shard-00-00.4c0yw4t.mongodb.net:27017,ac-a7xqvt3-shard-00-01.4c0yw4t.mongodb.net:27017,ac-a7xqvt3-shard-00-02.4c0yw4t.mongodb.net:27017/?ssl=true&replicaSet=atlas-xiq16c-shard-0&authSource=admin&appName=Cluster0')
    await cachedClient.connect()

    cachedDb = cachedClient.db('infs3201_winter2026')
    return cachedDb
}

async function closeDatabase() {
    cachedClient.close()
}

async function getEmployeeObjectId(empId) {
    let db = await getDatabase()
    let employeeCollection = db.collection('employees')
    let employee = await employeeCollection.findOne({employeeId: empId})
    return employee._id
}

async function getShiftObjectId(shiftId) {
    let db = await getDatabase()
    let shiftCollection = db.collection('shifts')
    let shift = await shiftCollection.findOne({shiftId: shiftId})
    return shift._id
}

async function loadEmployeesInShifts() {
    let db = await getDatabase()
    let assignmentsCollection = db.collection('assignments')
    let assignments = await assignmentsCollection.find().toArray()
    let shifts = db.collection('shifts')
    for (let asn of assignments) {
        console.log(asn)
        let employeeId = await getEmployeeObjectId(asn.employeeId)
        let shiftId = await getShiftObjectId(asn.shiftId)
        console.log(employeeId, shiftId)
        await shifts.updateOne(
            { _id: new mongodb.ObjectId(shiftId) },
            { $push: { employees: new mongodb.ObjectId(employeeId) } }
        )

    }
    await closeDatabase()
}

async function createEmptyListsInShifts() {
    let db = await getDatabase();
    let shifts = db.collection('shifts')
    await shifts.updateMany({}, {$set: { employees: []}})
    await closeDatabase()
}

//createEmptyListsInShifts()
//loadEmployeesInShifts()

cleanup()

async function cleanup() {
    let db = await getDatabase();
    let employees = db.collection('employees')
    let shifts = db.collection('shifts')
    let assignment = db.collection('assignments')
    await employees.updateMany({}, {$unset: {employeeId: ""}})
    await shifts.updateMany({}, {$unset: {shiftId: ""}})
    await assignment.drop()
    await closeDatabase()
}