const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose');
var bodyParser = require("body-parser");

const URI = "mongodb+srv://gnyrfta:iwrGTKOOI59bTtSH@cluster0.lsugprj.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });//process.env.MONGO_URI

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    log: [{
	description: String,
	duration: Number,
	date: String
    }]
});


const User = new mongoose.model("User", userSchema);

//User.deleteMany({});
app.use(cors())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users',function(req,res) {
    const user = new User({
	username: req.body.username
    });
    user.save();
    res.json({username:req.body.username,_id:user._id});
});
app.post('/api/users/:_id/exercises', async function(req,res) {
  
    let name = await User.find({_id:req.params._id},{username:1});
    let user = await User.find({_id:req.params._id});
    let theDate = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
//let theDate  = !req.body.date ? new Date().toDateString() : isValidDateInput(req.body.date) ? new Date(req.body.date).toDateString() : res.send(`Enter a valid input for 'date'`); //<- this is courtesy of juanrozo89.
//    console.log(theDate);
    let theDuration = parseInt(req.body.duration);
  
    let givenId = String(req.params._id);
  
  
    if (name.length>=1)
    {	
	let logEntry =  {
		description: req.body.description,
		duration: theDuration,
		date: theDate
	};
	await User.updateOne({_id:req.params._id},{$push: {log: logEntry}});
//	console.log({username:name[0].username,_id:givenId,description:req.body.description,duration:req.body.duration,date:theDate});
	res.send({username:name[0].username,duration:theDuration,description:req.body.description,date:theDate,_id:req.params._id});
    }
    else
    {
	res.json({Error: "no name"});
    }
});
app.get('/api/users/:_id/logs',async function(req,res) {
    let user= await User.find({_id:req.params._id});
/*    console.log(user);
    console.log(user[0].username);
    console.log(user[0].log);
    console.log({username:user[0].username,count:user[0].log.length,_id:req.params._id,log:user[0].log});*/
    console.log("######################################");
//    console.log(req.query.from);
    let from = req.query.from;
    let fromDate = new Date(from);
    let fromTimeStamp = fromDate.valueOf();
    console.log("fromTimeStamp: ");
    console.log(fromTimeStamp);
  //  console.log(req.query.to);
    let to = req.query.to;
    let toDate = new Date(to);
    let toTimeStamp = toDate.valueOf();
    console.log(toTimeStamp);
    let filteredLog=[];
    if(!(from == undefined)&&!(to == undefined))
    {
	console.log("Should filter for time.");
	console.log("This is the user log dates:");
	filteredLog = user[0].log.filter((item) => {
	    console.log(item.date);
	    let newDateString =   dateParser(item.date);
	    let newDate = new Date(newDateString);
	    let timestamp = newDate.valueOf();
	    console.log(newDate);
	    console.log(timestamp);
	    return (timestamp>=fromTimeStamp)&&(timestamp <= toTimeStamp) 
//	    let temp = Date.parse(item);
//	    console.log(temp);
/*	    let temp2 = temp.valueOf();
	    console.log(temp2);*/
	    //Convert to Date
	    //Use valueOf to get millis since epoch
	    //Compare
	    //Change to a filter instead of forEach.

	});
	console.log("This is log: ");
	console.log(filteredLog);
	
    }
    else
    {
	filteredLog = user[0].log;
	console.log("Don't have to filter for time");
    }
   // console.log(req.query.limit);
    let limit = req.query.limit;
    let indexToSlice = parseInt(limit);
    if(!(limit == undefined))
    {
	filteredLog = filteredLog.slice(0,indexToSlice);
	console.log("Limit amount of logs returned.");
	console.log("Limited log: ");
	console.log(filteredLog);
       }
    console.log("######################################");
    
    res.send({username:user[0].username,count:user[0].log.length,_id:req.params._id,log:filteredLog});
});
app.get('/api/users', async function(req,res) {
    let userList = await User.find({},{username:1});
    await User.deleteMany({ username: {$exists: false } });
   /* console.log("###");
    console.log(userList);
    console.log("###");*/
    res.send(userList);
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

//This is courtesy of juanrozo89
/*const isValidDateInput = function(date) {
  const dateRegex = /\d{4}-\d{2}-\d{2}/;
  return dateRegex.test(date) && new Date(date) != null;
};*/

let dateParser = function(dateString) {
    let length = dateString.length;
    let temp1 = dateString.substring(4,length);
    let monthString = temp1.substring(0,3);
    let dayString = temp1.substring(4,6);
    let yearString = temp1.substring(7,11);
    let month;
    switch(monthString) {
    case "Jan": month = "01";break;
    case "Feb": month = "02";break;
    case "Mar":month = "03";break;
    case "Apr":month = "04";break;
    case "May":month = "05";break;
    case "Jun":month = "06";break;
    case "Jul":month = "07";break;
    case "Aug":month = "08";break;
    case "Sep":month = "09";break;
    case "Oct":month = "10";break;
    case "Nov":month = "11";break;
    case "Dec":month = "12";break;
    }

    let temp2 = yearString+"-"+month+"-"+dayString;
    return temp2;
}
