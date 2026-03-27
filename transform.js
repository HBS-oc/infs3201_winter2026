const {MongoClient} = require("mongodb")
const CONNECTION_STRING = "mongodb://60302091:G3TeCNnCT7HoFoo2@cluster0-shard-00-00.wrr68.mongodb.net:27017,cluster0-shard-00-01.wrr68.mongodb.net:27017,cluster0-shard-00-02.wrr68.mongodb.net:27017/infs3201_winter2026?ssl=true&authSource=admin&replicaSet=atlas-2te6sv-shard-0&retryWrites=true&w=majority"
const DATABASE_NAME = "infs3201_winter2026";

let db;

async function addEmptyEmployeeArray() {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    db = client.db(DATABASE_NAME);

    const shifts = db.collection("shifts")
    await shifts.updateMany({}, {$set: {employees: []}})

    console.log("Added empty employee array")
}

async function addEmpToShiftArray() {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    db = client.db(DATABASE_NAME);

    const shifts = db.collection("shifts")
    const employees = await db.collection("employees").find().toArray()
    const assignments = await db.collection("assignments").find().toArray()

    for( let assign of assignments){
        let empObjId = null;

        for (let emp of employees){
            if (emp.employeeId === assign.employeeId){
                empObjId = emp._id
            }
        }

        if (empObjId){
            await shifts.updateOne(
                {shiftId: assign.shiftId},
                { $push: {employees: empObjId}}
            )
        }
    }

    console.log("Added employees")
}


async function cleanUpDB() {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    db = client.db(DATABASE_NAME);

    const shifts = db.collection("shifts")
    const employees = db.collection("employees")

    await employees.updateMany({}, {$unset: {employeeId: ""}})
    await shifts.updateMany({}, {$unset: {shiftId: ""}})
    await db.collection("assignments").drop()

    console.log("Cleanup process completed")
}



async function main(){
    await addEmptyEmployeeArray()
    await addEmpToShiftArray()
    await cleanUpDB()
}

main()