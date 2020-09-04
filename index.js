"use strict";

const app = require("express")();
const bodyParser = require("body-parser");
const request = require("request");
const cors = require("cors");
const Razorpay = require('razorpay');

const instance = new Razorpay({
    key_id: "rzp_test_38t5Sl6d0qAXHO",
    key_secret: "nzFyhm3xJzaGj6rQW2GguS3r"
});


var port = process.env.PORT || 8001;
app.use(cors());
app.use(bodyParser.json());

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
            secret: "6LfYzaQZAAAAAHrGQfs5S2orZ16XMvFNNFqObg4c",
            response: req.body.recaptchaToken
        }
    };

    request.post(verifyCaptchaOptions, function(err, response, body) {
        if (err) {
            return res.status(500).json({ message: "oops, something went wrong on our side" });
        }

        if (!body.success) {
            return res.status(500).json({ message: "Error in capcha" });
        }


    });

    //build order id
    var options = {
        amount: amt, // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11",
        payment_capture: '0'
    };

    try{

    }catch(err){
        console.log(err);
    }
    instance.orders.create(options, function(err, order) {

        if(err){
            console.log(err);
        }
        console.log(order);
        return res.status(200).json({ order });
    });





});

app.get('/', function(req, res) {
    res.send('server running');
})

app.listen(port);
