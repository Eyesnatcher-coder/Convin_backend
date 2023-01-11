import express from "express";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import cors from "cors";

const port = process.env.PORT || 3001;

const app = express();
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

mongoose.connect(
    "mongodb+srv://Harsh:zsRYZ7qWn1GCjBIv@cluster0.3jb09.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("Buckets Database connected");
});

const bucketSchema = new mongoose.Schema({
    bucketname: String,
    no_of_videos: Number,
    videos: [{ nameofvideo: String, link: String }]
});


const Bucket = new mongoose.model("bucket_V", bucketSchema);


app.get("/yourbuckets", async (req, res) => {
    await Bucket.find({}).then((val, err) => {
        if (err) {
            console.log(err)
            res.send("error encounterred")
        }
        else {
            res.send(val);
        }
    })
})

app.post("/g/makebucket", async (req, res) => {
    const bucketname = req.body.bucketname;
    await Bucket.findOne({ bucketname: bucketname }).then((val, err) => {
        if (err) {
            console.log(err)
            res.send("error encounterred")
        }
        else {
            res.send(val);
        }
    })
})

app.post("/makebucket", (req, res) => {
    const { bucketname, no_of_videos } = req.body;
    Bucket.findOne({ bucketname: bucketname }, (err, found) => {
        if (found) {
            res.send({ message: "Bucket already present" });
        }
        else {
            const found = new Bucket({
                bucketname: bucketname,
                no_of_videos: no_of_videos,
                videos: [{ nameofvideo: null, link: null }]
            })
            found.save(err => {
                if (err) {
                    res.send("error encountered ", err)
                }
                else {
                    res.send({ message: "Successfully Added a bucket" })
                }
            })
        }
    })
})

app.put("/makebucket", async (req, res) => {
    const { bucketname, newname } = req.body;
    await Bucket.findOneAndUpdate({ bucketname: bucketname }, {'$set':{bucketname: newname} }, { new: true })
    await res.send({ message: "updated bucket name" });
})

app.put("/cardname/:uid", async (req, res) => {
    const myid = req.params.uid;
    const {nameofvideo,newname} = req.body;
    await Bucket.update({ "videos.nameofvideo": nameofvideo }, { "$set" :{ "videos.$.nameofvideo": newname} })
    await res.send({ message: "updated cardname name" }); 
})

app.delete("/makebucket", (req, res, next) => {
    const bucketname = req.body.namechange.bucketname;
    Bucket.findOneAndRemove({ bucketname: bucketname })
        .then(deletedBucket => res.json(deletedBucket))
        .catch(err => next(err));
    console.log(req.body.namechange.bucketname);
})



app.post("/customerlist/:uid", async (req, res) => {
    const _id = req.params.uid;
    var card = { nameofvideo: req.body.nameofvideo, link: req.body.link };
    var lengthofarray= await Bucket.findOne({_id:_id}).exec();
    console.log(lengthofarray);
    await Bucket.findOneAndUpdate({ _id: _id }, { $push: { videos: card } }, { new: true })
    await Bucket.findOneAndUpdate({ _id: _id }, { $set: { no_of_videos:lengthofarray.videos.length} })
    await res.send({ message: "updated array with card" });

})

app.post("/customerlist/d/:uid", async (req, res) => {
    const myid = req.params.uid;
    const arr = req.body;
     try {  
        for(var i=1;i<arr.length;i++){
        await Bucket.updateMany({},{$pull : {"videos" :{         
            "_id" : arr[i]._id,"nameofvideo": arr[i].nameofvideo,"link":arr[i].link}}})
            //  console.log(req.body);
         }
         var lengthofarray= await Bucket.findOne({_id:myid}).exec();
         const newlength = Math.ceil(lengthofarray.videos.length-(arr.length)/2);
         await Bucket.findOneAndUpdate({ _id: myid }, { $set: { no_of_videos:newlength} })
        }
    catch(err){
        console.log(err)
    } 
})


const yourClickHistory = [];


app.post("/history", async (req, res) => {
    // console.log(req.body);
    const { nameofvideo, link , time } = req.body;
    var historyBlock = {
        nameofvideo: nameofvideo,
        link: link,
        time: time
    }
    yourClickHistory.push(historyBlock);
    console.log(historyBlock);
    res.sendStatus(200);
})


app.get("/history", async (req, res) => {
    res.send(yourClickHistory);
})


app.listen(port, () => {
    console.log("server is running on port", port)
});