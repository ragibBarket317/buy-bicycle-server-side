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
        const reviewCollection = database.collection('review');

        //Get Cycles
        app.get('/cycles', async (req, res) => {
            const cursor = cycleCollection.find({});
            const cycles = await cursor.toArray();
            res.send(cycles);
        });
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });

        app.get('/purchase', async (req, res) => {
            let query = {};
            const email = req.query.email;
            console.log(email)
            if (email) {
                query = { email: email }
            }
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
        // Cheack Admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
        // POST Purchase API
        app.post('/purchase', async (req, res) => {
            const newUser = req.body;
            const result = await purchaseCollection.insertOne(newUser)
            console.log('hitting the server', newUser)
            res.json(result);
        });
        // POST Cycle API
        app.post('/cycles', async (req, res) => {
            const newUser = req.body;
            const result = await cycleCollection.insertOne(newUser)
            console.log('hitting the server', newUser)
            res.json(result);
        });
        // POST User API
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser)
            res.json(result);
        });
        app.post('/review', async (req, res) => {
            const newUser = req.body;
            const result = await reviewCollection.insertOne(newUser)
            res.json(result);
        });
        // DELETE API
        app.delete('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            console.log('deleting user id', id);
            res.json(result);
        })
        // DELETE API
        app.delete('/cycles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cycleCollection.deleteOne(query);
            console.log('deleting user id', id);
            res.json(result);
        })
        //Put User Api
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        //Admin api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

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