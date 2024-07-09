const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.port || 7001;
const stripe = require('stripe')('sk_test_51OewthSEnNI9ZVcEltlH1uT76OSrklRWhDimfyeaaiglmqAb31fh9j8evrWTmpaMH0PscgtqnZHB239mFXL5Oj9900lyASKXix');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/pay_now', async (req, res) => {
    try {
        const { amount } = req.body;
        let currency = "INR"
        let description = "Order Price"
        const product = await stripe.products.create({
            name: description,
            description: description,
            // images:["http://34.195.103.99:4005/productImage/937c3d94-8aae-4623-9dc1-db1283e1580f.jpg"]
        });
        console.log('product>>>>>>>>>>>>>>>>>>>>>>>>>>>', product);
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: amount * 100,
            currency: currency,
        });
        console.log('price*****************************', price);
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            success_url: 'http://192.168.29.100:7001/success',
            cancel_url: 'http://192.168.29.100:7001/cancle',
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
                // {
                //     price_data: {
                //         currency: currency,
                //         product_data: {
                //             name: 'admin comminassion',
                //         },
                //         unit_amount: 90,
                //     },
                //     quantity: 1,
                // },
            ],
            custom_fields: [
                // {
                //   key: 'engraving',
                //   label: {
                //     type: 'custom',
                //     custom: 'Personalized engraving',
                //   },
                //   type: 'text',
                // },
            ],
        });

        return res.json({
            success: true,
            message: "Succesfully fetched facilities",
            paymentLink: session.url,
            status: 200,
        });


    } catch (err) {
        console.log(err);
        if (err.type === 'StripeInvalidRequestError') {
            res.status(400).send({
                status: false,
                message: err.message,
                param: err.param,
                code: err.code,
                doc_url: err.doc_url,
                request_log_url: err.raw.request_log_url
            });
        } else {
            console.error('Error creating Stripe session:', err);
            res.status(500).send({
                status: false,
                message: 'Internal Server Error',
            });
        }
    }
});

app.get('/success', async (req, res) => {
    res.send('Success');
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
