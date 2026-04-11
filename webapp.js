const express = require('express')
const handlebars = require('express-handlebars')
const cookieParser = require('cookie-parser')
const business = require('./business.js')

app = express()
app.set('view engine', 'hbs')
app.set('views', __dirname + "/template")
app.engine('hbs', handlebars.engine())
app.use('/public', express.static( __dirname+"/static"))
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

app.use(async (req, res, next) => {
    let sessionId = req.cookies.session
    await business.logEvent(sessionId, req.url, req.method)
    next()
})

app.post('/login', async (req, res) => {
    let username = req.body.username
    let password = req.body.password

    let sessionDetails = await business.startSession(username, password)
    if (!sessionDetails) {
        res.redirect('/login?msg=Invalid username/password')
        return
    }
    res.cookie('session', sessionDetails.sessionId, {maxAge: sessionDetails.duration*1000})
    res.redirect('/')
})

app.get('/login', (req, res) => {
    let message = req.query.msg
    if (!message) {
        message = ""
    }
    res.render('login', {
        message,
        layout: undefined
    })
})

app.get('/logout', (req, res) => {
    res.send('not completed yet')
})

app.use(async (req, res, next) => {
    let sessionId = req.cookies.session
    if (!sessionId) {
        res.redirect('/login?msg=You must be logged in')
        return
    }
    let valid = await business.validSession(sessionId)
    if (!valid) {
        res.redirect('/login?msg=Session not valid')
        return
    }
    let validTime = await business.extendSession(sessionId)
    res.cookie('session', sessionId, {maxAge: validTime*1000})
    next()
})

app.get('/', async (req, res) => {
    let empList = await business.getAllEmployees()
    res.render('landing', {empList, layout: undefined})
})

app.get('/employee/:eid', async (req, res) => {
    let employeeDetails = await business.getEmployee(req.params.eid)
    let shifts = await business.getEmployeeShifts(req.params.eid)
    for (let s of shifts) {
        s.startEarly = s.startTime < '12:00'
        s.endEarly = s.endTime < '12:00'
    }
    res.render('single_employee', {employeeDetails, shifts, layout: undefined})
})

app.get('/edit/:eid', async (req, res) => {
    let employeeDetails = await business.getEmployee(req.params.eid)
    res.render('edit_employee', {employeeDetails, layout: undefined})    
})

app.post('/update-employee', async (req, res) => {
    let employeeId = req.body.id.trim()
    let employeeName = req.body.name.trim()
    let employeePhone = req.body.phone.trim()
    if (employeeName == '' || employeePhone == '') {
        res.send("Form inputs invalid....")
        return
    }
    let result = await business.updateEmployee({
        employeeId, employeeName, employeePhone
    })
    if (result === "OK") {
        res.redirect("/")
    }
    else {
        res.send("Error updating employee record")
    }
})


app.listen(8000)