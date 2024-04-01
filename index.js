const express = require('express')
const app = express()
const cors = require('cors')

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect('mongodb+srv://rubenchoortegon:sa@cluster0.gkr7q3j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

  const userSchema = mongoose.Schema(
    {
    username: {
      type: String,
      unique: true,
    },
  },
    {versionKey: false}
  );

const User = mongoose.model("User", userSchema);

const exerciseSchema = mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
  userId: String
}, {versionKey: false})

const Exercise = mongoose.model("Exercise", exerciseSchema)

app.use(cors())
app.use(express.urlencoded({ extended: true}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
})

app.post("/api/users", async (req, res) => {
  const username = req.body.username;
  const foundUser = await User.findOne({username});
  if (foundUser) {
    res.json(foundUser);
  }
  const user = await User.create({
    username, 
  });
  res.json(user)
})

app.get("/api/users/:_id/logs", async (req, res) => {
  let {from, to, limit} = req.query;
  const userId = req.params._id;
  const foundUser = await User.findById(userId);
  if (!foundUser) {
    res.json({message: 'No user exists for that id ' });
  }

  let filter = { userId };
  let dateFilter = {}
  if (from) {
    dateFilter['$gte'] = new Date(from)
  }
  if (to) {
    dateFilter['$lte'] = new Date(to);
  }
  if (from || to) {
    filter.date = dataFilter;
  }
  if (!limit) {
    limit = 100;
  }
  let exercises = await Exercise.find(filter).limit(limit);
  exercises = exercises.map((exercise) => {return {
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
  }});
  res.send({
    username: foundUser.username,
    count: exercises.length,
    _id: userId,
    log: exercises,
  });
})

app.post("/api/users/:_id/exercises", async (req, res) => {
  let { description, duration, date } = req.body;
  const userId = req.params._id;
  const foundUser = await User.findById(userId);

  if (!foundUser) {
    res.json({message: 'No user exists for that id '});
  }

  if (!date || typeof date !== 'string' || !date.trim()) {
    date = new Date();
  } else {
    date = new Date(date);
  }
  if (isNaN(date.getTime())) {
    return res.status(400).json({ error: 'Fecha inválida' });
  }

  await Exercise.create({
    username: foundUser.username,
    description,
    duration,
    date,
    userId,
  })

  res.json({
    username: foundUser.username,
    description,
    duration,
    date: date.toDateString(),
    _id: userId,
  });
});

const listener = app.listen(process.env.PORT || 3005, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

