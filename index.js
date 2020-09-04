"use strict";

const app = require("express")();
const bodyParser = require("body-parser");
const request = require("request");
const cors = require("cors");
const Razorpay = require('razorpay');

const morgan = require('morgan')
const logger = require('./logger.js');
const dotenv = require('dotenv');
dotenv.config();

const instance = new Razorpay({
    key_id: process.env.RAZORPAYID,
    key_secret: process.env.RAZORPAYSECRET
});


let port = process.env.PORT || 8001;
app.use(cors());
app.use(bodyParser.json());

app.use(morgan(':date[iso] :method :url :body :status ', { stream: logger.stream }));
morgan.token('body', (req) => JSON.stringify(req.body));


app.post("/donate", function(req, res) {

    const amt = req.body.amount * 100;


    console.log(JSON.stringify(req.body));
    //check if capcha token exists
    if (!req.body.recaptchaToken) {
        return res.status(400).json({ message: "recaptchaToken is required" });
    }


    //if capcha token exists verifiy if it is valid
    const verifyCaptchaOptions = {
        uri: "https://www.google.com/recaptcha/api/siteverify",
        json: true,
        form: {
            secret: process.env.CAPTCHASECRET,
            response: req.body.recaptchaToken
        }
    };

    request.post(verifyCaptchaOptions, function(err, response, body) {
        if (err) {
            logger.err(err);
            return res.status(500).json({ message: "oops, something went wrong on our side" });
        }

        if (!body.success) {
            return res.status(500).json({ message: "Error in capcha" });
        }


    });

    //build order id
    let options = {
        amount: amt, // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11",
        payment_capture: '0'
    };


    instance.orders.create(options, function(err, order) {

        if (err) {
            logger.err(err)
        }
        logger.info(order)
        return res.status(200).json({ order });
    });





});

app.get('/', function(req, res) {
    res.send(`Server running at port ${port}`);
})

app.listen(port);
