const express = require("express");
const exphbs = require("express-handlebars");
const bus = require("./business.js");

const app = express();
const PORT = 8000;

app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs.engine({defaultLayout: false}));
app.set("view engine", "handlebars");

app.get("/", async (req, res) => {
  const employees = await bus.getAllEmployees();
  res.render("landing", { employees });
});


app.get("/login", async (req, res) => {
  res.render("login")
})

app.post("/login", async (req, res) => {
  const username = (req.body.username || "").trim()
  const password = (req.body.password || "").trim()

  const user = await bus.verifyLogin(username, password)

  if (!user){
    return res.render("login", {message: "Invalid login"})
  }

  res.send("Login works")
  
})

app.get("/employee/:employeeId", async (req, res) => {
  const employeeId = req.params.employeeId.trim();

  const employee = await bus.getEmployeeById(employeeId);
  if (!employee) return res.status(404).send("Employee not found");

  const shifts = await bus.getShiftsByEmployeeId(employeeId);

  for (let s of shifts) {
    s.isMorning = (s.startTime < "12:00");
  }

  res.render("employeeDetails", { employee, shifts });
});

app.get("/employee/:employeeId/edit", async (req, res) => {
  const employeeId = req.params.employeeId.trim();

  const employee = await bus.getEmployeeById(employeeId);
  if (!employee) return res.status(404).send("Employee not found");

  res.render("editEmployee", { employee });
});

app.post("/employee/:employeeId/edit", async (req, res) => {
  const employeeId = req.params.employeeId.trim();

  const name = (req.body.name || "").trim();
  const phone = (req.body.phone || "").trim();

  if (name.length === 0) return res.send("Name cannot be empty.");

  await bus.updateEmployee(employeeId, name, phone);
  res.redirect("/"); 
});

async function start() {
  await bus.connect();
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
}
start();