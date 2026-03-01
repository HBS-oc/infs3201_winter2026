const express = require("express");
const bus = require("./business.js");

const app = express();
const PORT = 8000;

app.use(express.urlencoded());

/**
 * Main Menu (like the old CLI)
 * - Shows numbered employees (acts like "List employees")
 */
app.get("/", async (req, res) => {
  const employees = await bus.getAllEmployees();

  let html = "";
  html += "<h1>Main Menu</h1>";
  html += "<p>Select an option:</p>";

  // Option 1: list employees (this page itself)
  html += "<h2>1) Employees</h2>";
  html += "<ol>";
  for (let i = 0; i < employees.length; i++) {
    const e = employees[i];
    html += `<li><a href="/employee/${e.id}">${e.name}</a></li>`;
  }
  html += "</ol>";

  html += "<hr>";
  html += "<p><strong>Note:</strong> “Assign employee to shift” is removed in Assignment 3.</p>";

  res.send(html);
});

/**
 * Employee Details (like choosing an employee in CLI)
 * Includes "menu options" as links:
 * 1) Edit details
 * 2) Back to main menu
 */
app.get("/employee/:id", async (req, res) => {
  const id = req.params.id;

  const employee = await bus.getEmployeeById(id);
  if (!employee) return res.status(404).send("Employee not found");

  const shifts = await bus.getShiftsByEmployeeId(id);

  let html = "";
  html += `<h1>Employee: ${employee.name}</h1>`;
  html += `<p>Phone: ${employee.phone}</p>`;

  html += "<h2>Menu</h2>";
  html += "<ol>";
  html += `<li><a href="/employee/${id}/edit">Edit employee details</a></li>`;
  html += `<li><a href="/">Back to main menu</a></li>`;
  html += "</ol>";

  html += "<h2>Shifts</h2>";
  html += "<table border='1' cellpadding='6' cellspacing='0'>";
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

/**
 * Edit Employee (GET) - prefilled form
 */
app.get("/employee/:id/edit", async (req, res) => {
  const id = req.params.id;

  const employee = await bus.getEmployeeById(id);
  if (!employee) return res.status(404).send("Employee not found");

  let html = "";
  html += `<h1>Edit Employee</h1>`;
  html += `<p><a href="/employee/${id}">Back</a> | <a href="/">Main Menu</a></p>`;

  html += `
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
  `;

  res.send(html);
});

/**
 * Edit Employee (POST) - server-side validation + PRG redirect
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

  if (name.length === 0) {
    return res.send("Validation failed: Name must not be empty.");
  }

  await bus.updateEmployee(id, name, phone);

  res.redirect("/");
});

/**
 * Start server after DB init
 */
async function start() {
  await bus.connect();
  app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
}

start();