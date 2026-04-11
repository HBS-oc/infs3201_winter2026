const persist = require("./persistence.js")
const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({host: '127.0.0.1', port: 25})


async function sendTwoFactorCode(email, code){
    console.log("Sending 2FA email")

    try{
    transport.sendMail({
        from:"no-reply@shifts.com",
        to: email,
        subject: "2FA code",
        text: `Your 2FA code is ${generateOTP()}`
    })
    } catch (err){
        console.log("Email sent has failed!", err.message)
    }
}

async function suspiciousActivity(email){
    try{
    transport.sendMail({
        from:"no-reply@shifts.com",
        to: email,
        subject: "Suspicious Activity Detected",
        text: `Invalid attempts has been detected on your account`
    })
    } catch (err){
        console.log("Email sent has failed!", err.message)
    }
}

module.exports={
    sendTwoFactorCode,
    suspiciousActivity
}