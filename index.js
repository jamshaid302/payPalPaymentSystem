var express = require('express');
var path = require('path');
var app = express();
var paypal = require('paypal-rest-sdk');
app.set('view engine', 'ejs');


// configure paypal with the credentials you got when you created your paypal app
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ARDIthl6sA0x8CYoMZa8KOP8b9-zsntL02htM-WErYRIeWzJruuk2mQG868aeGDM4oHvbrECHNgSYJR8', // please provide your client id here
    'client_secret': 'EKzeWHAAkIQdmhxxUenqS703r-H8yRo5i_X9tHtBkQRJdWcWyOT7DF-efuQlqFeggMsNohu3riJRpJk2' // provide your client secret here
});


// set public directory to serve static html files
app.use('/', express.static(path.join(__dirname, 'views')));


// redirect to store when user hits http://localhost:3000
app.get('/' , (req , res) => {
    res.render('index');
})

// start payment process
app.get('/buy' , ( req , res ) => {
    // create payment object
    var payment = {
        "intent": "authorize",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://127.0.0.1:3000/success",
            "cancel_url": "http://127.0.0.1:3000/err"
        },
        "transactions": [{
            "amount": {
                "total": 39.00,
                "currency": "USD"
            },
            "description": " a book on mean stack "
        }]
    }


    // call the create Pay method
    createPay( payment )
        .then( ( transaction ) => {
            var id = transaction.id;
            var links = transaction.links;
            var counter = links.length;
            while( counter -- ) {
                if ( links[counter].method == 'REDIRECT') {
                    // redirect to paypal where user approves the transaction
                    return res.redirect( links[counter].href )
                }
            }
        })
        .catch( ( err ) => {
            console.log( err );
            res.redirect('/err');
        });
});


// success page
app.get('/success' , (req ,res ) => {
    console.log(req.query);
    res.render('success');
})

// error page
app.get('/err' , (req , res) => {
    console.log(req.query);
    res.render('err');
})

// app listens on 3000 port
app.listen( 3000 , () => {
    console.log(' app listening on 3000 ');
})



// helper functions
var createPay = ( payment ) => {
    return new Promise( ( resolve , reject ) => {
        paypal.payment.create( payment , function( err , payment ) {
            if ( err ) {
                reject(err);
            }
            else {
                resolve(payment);
            }
        });
    });
}