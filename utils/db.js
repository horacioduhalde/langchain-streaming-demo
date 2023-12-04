import mongoose from 'mongoose';

const username = encodeURIComponent(process.env.SECRET_MONGO_USERNAME_);
const password = encodeURIComponent(process.env.SECRET_MONGO_PASSWORD_);
const dbname = process.env.SECRET_MONGO_DBNAME_;
const uri = `mongodb+srv://test:${password}@cluster0.fgkycqp.mongodb.net/${dbname}?retryWrites=true&w=majority`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log("Connected to MongoDB Atlas successfully!");
});

async function connect() {
  await mongoose.connect(uri, options);
}

export { connect };
