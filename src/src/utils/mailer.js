import nodemailer from "nodemailer"

export const mailer = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    auth: {
        user: "emailapikey",
        pass: "wSsVR60lqUP3DK4vnmCsJehty14EU1n1RBkr2QSkvXX/TKvFoMc+kkbLDQSgHqMZF25hQGYV8rJ4zh1SgToNidV4m1pTXiiF9mqRe1U4J3x17qnvhDzOWW5ekRKIJY0AxAprmmRnFMAq+g==",
    },
})
