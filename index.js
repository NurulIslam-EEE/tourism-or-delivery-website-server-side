const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o0i8x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);


app.use(cors());
app.use(express.json());

async function run() {
    try {
        await client.connect();
        const database = client.db("RoyalTravelTourism");
        const packages = database.collection("TourPackages");
        const orders = database.collection("AllOrders");

        //GET API
        app.get('/tourPackages', async (req, res) => {
            const cursor = packages.find({});
            const tourPackages = await cursor.toArray();
            res.send(tourPackages);
        })

        // get single package
        app.get('/tourPackages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tourPackage = await packages.findOne(query)
            res.send(tourPackage)
        })


        //update 
        app.put('/manageAllOrder/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            console.log(updatedOrder)
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    status: updatedOrder.status
                }
            }

            const result = await orders.updateOne(filter, updateDoc, option)
            res.send(result)
        })

        //POST API

        app.post("/placeOrder", async (req, res) => {
            console.log(req.body);
            const result = await orders.insertOne(req.body);
            res.send(result);
        });

        //All order
        app.get('/manageAllOrder', async (req, res) => {
            const cursor = orders.find({});
            const allOrders = await cursor.toArray();
            console.log(allOrders);
            res.send(allOrders);
        })

        //Add tour
        app.post('/addTours', async (req, res) => {
            const result = await packages.insertOne(req.body)
            res.send(result)
        })

        //My Order
        app.get("/myOrder/:email", async (req, res) => {
            const result = await orders.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        //delete order
        app.delete("/myOrder/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orders.deleteOne(query);
            res.send(result);
        });

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running my server')
})

app.listen(port, () => {
    console.log('listening to port', port);
})