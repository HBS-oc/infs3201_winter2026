const persist = require("./persistence.js")
const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({host: '127.0.0.1', port: 25})


async function sendTwoFactorCode(email, code){
    console.log("Sending 2FA email")

    let message = {
        to: email,
        subject: "2FA code",
        text: `Your 2FA code is ${code}`
    }

    console.log("to: " + message.to)
    console.log("subject: " + message.subject)
    console.log("body: " + message.text)
    
    try{
        await transport.sendMail({from:"no-reply@shifts.com",
            ...message})
    } catch (err){
        console.log("Email sent has failed!", err.message)
    }
}

async function suspiciousActivity(email){
    try{
        message = {
            to: email,
            subject: "Suspicious Activity Detected",
            text: `Invalid attempts has been detected on your account`
        }
        console.log("to: " + message.to)
        console.log("subject: " + message.subject)
        console.log("body: " + message.text)
        
        transport.sendMail({
            from:"no-reply@shifts.com",
            ...message
        })
    } catch (err){
        console.log("Email sent has failed!", err.message)
    }
}

module.exports={
    sendTwoFactorCode,
    suspiciousActivity
}