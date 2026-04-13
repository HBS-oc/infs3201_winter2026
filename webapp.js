const express = require('express')
const handlebars = require('express-handlebars')
const cookieParser = require('cookie-parser')
const business = require('./business.js')
const fileUpload = require('express-fileupload')

app = express()
app.set('view engine', 'hbs')
app.set('views', __dirname + "/template")
app.engine('hbs', handlebars.engine())
app.use('/public', express.static( __dirname+"/static"))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(fileUpload())

app.use(async (req, res, next) => {
    let sessionId = req.cookies.session
    await business.logEvent(sessionId, req.url, req.method)
    next()
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

app.post('/reset-logins', async (req, res) => {
    await business.resetAllFailed()

    res.redirect('/login')
})

app.post('/login', async (req, res) => {
    let username = req.body.username
    let password = req.body.password

    let login = await business.login2fa(username, password)
    if (!login) {
        res.redirect('/login?msg=Invalid username/password')
        return
    }
    res.cookie('pending2fa', username)
    res.redirect('/2fa')
})

app.get('/2fa', (req, res) =>{
    let message = req.query.msg
    if (!message) {
        message = ""
    }
    res.render('2fa', {message: message, layout: undefined})
})

app.post('/2fa', async (req, res) => {
    let user = req.cookies.pending2fa
    let code = req.body.code
    let verify = await business.verify2fa(user, code)

    if (!code){
        return res.redirect('/2fa?msg=Invalid code')
    }
    if (!verify){
        return res.redirect('/2fa?msg=Invalid code')
    }

    let sessionDetails = await business.startSession(user)

    res.cookie('session', sessionDetails.sessionId, {maxAge: sessionDetails.duration * 1000})

    res.clearCookie('pending2faUser')

    res.redirect('/')
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

app.post('/uploadfile', async (req, res) =>{

    let eid = req.body.eid
    
    if(!req.files || !req.files.submission){
        return res.send("No File Uploaded")
    }

    let file = req.files.submission

    if (file.mimetype !== "application/pdf"){
        return res.send("Only PDF format allowed")
    }

    if (file.size > 2*1024*1024){
        return res.send("File too large")
    }

    let verify = await business.fileUpload(eid, file)
    
    if (!verify){
        res.send("Upload failed")
    }

    res.send("upload completed")
    
})

app.get('/documents/:id', async (req,res) => {
    let dId = req.params.id
    let document = await business.getSingleDocument(dId)

    console.log(document)

    res.sendFile(require('path').resolve("uploads/" + document.filename))
})

app.get('/', async (req, res) => {
    let empList = await business.getAllEmployees()
    res.render('landing', {empList, layout: undefined})
})

app.get('/employee/:eid', async (req, res) => {
    let employeeDetails = await business.getEmployee(req.params.eid)
    let shifts = await business.getEmployeeShifts(req.params.eid)
    let documents = await business.getDocuments(req.params.eid)
    for (let s of shifts) {
        s.startEarly = s.startTime < '12:00'
        s.endEarly = s.endTime < '12:00'
    }
    res.render('single_employee', {employeeDetails, shifts, documents, layout: undefined})
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