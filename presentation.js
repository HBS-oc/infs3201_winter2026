const bus = require("./business.js")
const express = require("express")
const app  = express()
const PORT = 8000


app.use(express.urlencoded())
 

/**
 * main page - list employees
 */
app.get("/", async (req, res) => {
    const employees = await bus.getAllEmployees();

     let html = "<h1>Employees</h1><ul>";

    for (let e of employees) {
        html += `<li><a href="/employee/${e.id}">${e.name}</a></li>`;
    }

    html += "</ul>";

    res.send(html);
})
/**
 * Employee details page
 */
app.get("/employee/:id", async (req, res) => {
    const id = req.params.id;

    const employee = await bus.getEmployeeById(id);
    if (!employee) {
        return res.status(404).send("Employee not found");
    }

    const shifts = await bus.getShiftsByEmployeeId(id);

    let html = `<h1>${employee.name}</h1>`;
    html += `<p>Phone: ${employee.phone}</p>`;
    html += `<p><a href="/employee/${id}/edit">Edit</a></p>`;
    html += `<p><a href="/">Back</a></p>`;

    html += "<h2>Shifts</h2>";
    html += "<table border='1' cellpadding='6'>";
    html += "<tr><th>Date</th><th>Start</th><th>End</th></tr>";

    for (let s of shifts) {
        let highlight = "";
        if (typeof s.startTime === "string" && s.startTime < "12:00") {
            highlight = " style='background-color:yellow;'";
        }

        html += `<tr>
                    <td>${s.date}</td>
                    <td${highlight}>${s.startTime}</td>
                    <td>${s.endTime}</td>
                 </tr>`;
    }

    html += "</table>";

    res.send(html);
});
async function start() {
    await bus.connect()
    app.listen(8000, () => {console.log("Server has started")})
}
/**
 * Edit employee form
 */
app.get("/employee/:id/edit", async (req, res) => {
    const id = req.params.id;

    const employee = await bus.getEmployeeById(id);
    if (!employee) {
        return res.status(404).send("Employee not found");
    }

    let html = `
        <h1>Edit Employee</h1>
        <form method="POST" action="/employee/${id}/edit">
            <div>
                <label>Name:</label>
                <input type="text" name="name" value="${employee.name}" />
            </div>
            <div>
                <label>Phone:</label>
                <input type="text" name="phone" value="${employee.phone}" />
            </div>
            <button type="submit">Save</button>
        </form>
        <p><a href="/employee/${id}">Cancel</a></p>
    `;

    res.send(html);
});

/**
 * Edit employee submit (server-side validation)
 */
app.post("/employee/:id/edit", async (req, res) => {
    const id = req.params.id;

    let name = "";
    let phone = "";

    if (typeof req.body.name === "string") {
        name = req.body.name.trim();
    }

    if (typeof req.body.phone === "string") {
        phone = req.body.phone.trim();
    }

    // Validation
    if (name.length === 0) {
        return res.send("Validation failed: Name must not be empty.");
    }

    const phoneRegex = /^[0-9]{4}-[0-9]{4}$/;
    if (!phoneRegex.test(phone)) {
        return res.send("Validation failed: Phone must be in format 1234-5678.");
    }

    await bus.updateEmployee(id, name, phone);

    // PRG pattern (required)
    res.redirect("/");
});

start();