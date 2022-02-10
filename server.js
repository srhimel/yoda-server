const express = require('express')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pt0xz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async () => {
    try {
        await client.connect();
        const database = client.db("yodahotel");
        const foodCollection = database.collection('foods');
        const studentsCollection = database.collection('students');
        const distributionCollection = database.collection('distribution');
        app.get('/foods', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit || 0;
            const foods = await foodCollection.find().skip(skip).limit(limit).toArray();
            const count = await foodCollection.count();
            res.send({
                foods,
                count
            });
        })
        app.get('/all-foods', async (req, res) => {
            const foods = await foodCollection.find().toArray();
            res.send(foods);
        })
        app.post('/foods', async (req, res) => {
            const food = req.body;
            const result = await foodCollection.insertOne(food);
            res.json(result);
        })
        app.put('/foods/:id', async (req, res) => {
            const { id } = req.params;
            const food = req.body;
            const result = await foodCollection.updateOne({ _id: ObjectId(id) }, { $set: food });
            res.send(result);
        })
        app.delete('/foods/:id', async (req, res) => {
            const { id } = req.params;
            const result = await foodCollection.deleteOne({ _id: ObjectId(id) });
            res.send(result);
        })

        //students
        app.get('/students', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit || 0;
            const students = await studentsCollection.find().skip(skip).limit(limit).toArray();
            const count = await studentsCollection.count();
            res.send({
                students,
                count
            });
        })

        app.get('/all-students', async (req, res) => {
            const students = await studentsCollection.find().toArray();
            res.send(students);
        })

        app.post('/students', async (req, res) => {
            const student = req.body;
            const result = await studentsCollection.insertOne(student);
            res.json(result);
        })

        app.put('/students/:id', async (req, res) => {
            const { id } = req.params;
            const student = req.body;
            const result = await studentsCollection.updateOne({ _id: ObjectId(id) }, { $set: student });
            res.send(result);
        })

        // bulk update
        app.put('/students-bulk', async (req, res) => {
            const bulkSelect = req.body;
            for (b of bulkSelect) {
                const student = b;
                const result = await studentsCollection.updateOne({ _id: ObjectId(student._id) }, { $set: { status: 'active' } });
            }
            res.send('update success');

        })
        app.put('/students-bulk-inactive', async (req, res) => {
            const bulkSelect = req.body;
            for (b of bulkSelect) {
                const student = b;
                const result = await studentsCollection.updateOne({ _id: ObjectId(student._id) }, { $set: { status: 'inactive' } });
            }
            res.send('update success');
        })


        app.delete('/students/:id', async (req, res) => {
            const { id } = req.params;
            const result = await studentsCollection.deleteOne({ _id: ObjectId(id) });
            res.send(result);
        })

        //distribution
        app.get('/distribution', async (req, res) => {
            const distribution = await distributionCollection.find().toArray();
            res.send(distribution);
        })

        app.post('/distribution', async (req, res) => {
            const distribution = req.body;
            // check if the date and the roll already exist
            const check = await distributionCollection.findOne({ date: distribution.date, roll: distribution.roll });
            if (check) {
                res.send('already exist');
            } else {
                const result = await distributionCollection.insertOne(distribution);
                res.json(result);
            }

        })
        app.delete('/distribution/:id', async (req, res) => {
            const { id } = req.params;
            const result = await distributionCollection.deleteOne({ _id: ObjectId(id) });
            res.send(result);
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
    console.log(`Backend listening on port ${port}`)
})