const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config();


//Middleware
app.use(express.json());
app.use(cors());

//Mongo Connection

const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb');
const { parse } = require('dotenv');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qtdggkh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //Db Connection
    const menuCollection = client.db("online-restaurant").collection("menus");
    const cartCollection = client.db("online-restaurant").collection("cartItems");

    //All menu 
    app.get('/menu', async (req, res) => {
        const result = await menuCollection.find().toArray();  
        res.send(result);   
    });


    //Add to cart
    //Post
    app.post('/cart', async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });

    // Get cart items
    app.get('/cart', async (req, res) => {
      try {
        const email = req.query.email;
        const filter = { email: email };
        const result = await cartCollection.find(filter).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch cart items' });
      }
    });

    // Get particular cart item
    app.get('/cart/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await cartCollection.findOne(filter);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch cart item' });
      }
    });

    // Delete cart item
    app.delete('/cart/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await cartCollection.deleteOne(filter);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to delete cart item' });
      }
    });

    //Update cart items
    app.put('/cart/:id', async (req, res) => {
        const id = req.params.id;
        const {quantity}=req.body;
        const filter = { _id: new ObjectId(id) };
        const options={upsert:true};

        const updateDoc = {
          $set: {
            quantity: parseInt(quantity,10),
          },
        };
        const result = await cartCollection.updateOne(filter, updateDoc, options);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})