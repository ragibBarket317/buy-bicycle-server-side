const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;


//midleware
app.use(cors())
app.use(express.json())

//DATABASE CONECTION
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.y5uft.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('buy_bycycle');
        const cycleCollection = database.collection('cycles');
        const purchaseCollection = database.collection('purchase');
        const usersCollection = database.collection('users');

        //Get Cycles
        app.get('/cycles', async (req, res) => {
            const cursor = cycleCollection.find({});
            const cycles = await cursor.toArray();
            res.send(cycles);
        });
        //Get Purchases
        app.get('/purchase', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = purchaseCollection.find(query);
            const purchase = await cursor.toArray();
            res.send(purchase);
        });
        // Find One id
        app.get('/cycles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await cycleCollection.findOne(query);
            res.send(user);
        });
        // POST Purchase API
        app.post('/purchase', async (req, res) => {
            const newUser = req.body;
            const result = await purchaseCollection.insertOne(newUser)
            console.log('hitting the server', newUser)
            res.json(result);
        });
        // POST User API
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser)
            console.log('hitting the server', newUser)
            res.json(result);
        });

    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})