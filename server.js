


//Loads in all our environment variables and sets them inside process.env
if(process.env.NODE_ENV !== 'production')
{
    require('dotenv').config()
}

//imports
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const Override = require('method-override');
const port = "3000";
const mc = require("mongodb").MongoClient; //to access data base
var db; //where the data base will exist

const initPassport = require('./passport-config');
//find function

initPassport(
    passport, 
    email => users.find(user => user.email === email),
    id=> users.find(user => user.id === id)
);
//Mock users just for testing purposes

//const stocks = require("./stocks.json");
const users = [
    {
        id: '1603403940409',
        name: 'user0',
        email: 'test@test.com',
        //This is the encrypted password, the non-encrypted password is the letter 'b'
        password: '$2b$10$04DL9b7bi9b4o0yZgaarlO14.gz53gTwY62gZCyWDHacGXlzZRpRm',
        myStocks: [],
        orders: [],
        watchList: [],
        eventSubs: [],
        History: [],
        money: 60000
    }
];

var History = [];
//SOME OF THE BUSINESS LOGIC IS HERE
//Validates the existance of a user
function isUser(userObj)
{
    if(!userObj || !userObj.name)
    {
      return false;
    }
    return true;
}




//link folders
app.use(express.static('2406-Project'))
app.use('/NotMain',express.static(__dirname + '2406-Project/NotMain'));
app.use('/NotMain/user',express.static(__dirname + '2406-Project/NotMain/user'));
app.use('/NotMain/images',express.static(__dirname + '2406-Project/NotMain/images'));

//set views 
app.set('views', './2406-Project');
app.set('view engine', 'ejs');

//Allows use of register/login form
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: process.env.session_secret,
    resave: false, 
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(Override('_logout'));


//link + display pages
// main page
app.get('/', (req, res) => {
    res.render('StockBrokerGUI');
});

//navigate between pages


app.get('/NotMain/Login', (req, res) => {
    res.render('NotMain/Login', {users});
});

app.post('/register', checkAuthdUser, async (req, res) => {
    try
    {
        const securePass = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password:securePass,
            myStocks: [],
            orders: [],
            watchList: [],
            eventSubs: [],
            History: [],
            money: 0
        })
        res.redirect('/NotMain/Login');
    }
    catch
    {
        res.redirect('/NotMain/Login');
    }
    console.log(users)//For testing purposes
});
app.post('/login' , checkAuthdUser, passport.authenticate('local', 
{
    successRedirect: '/NotMain/userHome',
    failureRedirect: '/NotMain/Login',
    failureFlash: true
}));

app.delete('/Logout', (req, res) =>{
    req.logOut();
    res.redirect('NotMain/Login');
})

app.get('/NotMain/userHome', (req, res) => {
    if(isUser(req.user))
    {
        res.render('NotMain/userHome', {name: req.user.name, email:req.user.email, money:req.user.money, time:getDate()});
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
});

//Area for declaring stocks

function stock (key,name,price,low,high,trades){
    this.symbol= key;
    this.name= name;
    this.curPrice = price;
    this.low = low;
    this.high = high;
    this.dailyTrades = trades;
}
const e = require('express');


/*app.get('/NotMain/user/stock', (req, res) => {
    res.render('NotMain/user/stock',{name: req.user.name, email:req.user.email, orders:req.user.orders});
});*/

app.get('../StockBrokerGUI#intro', (req, res) => {
    res.render('StockBrokerGui');
});

//REST API STUFF
app.get('/stocks', (req,res) => {
    db.collection("stocks").find({}).toArray(function(err,stocks){
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        //res.render('restAPI',{stocks:stocks,l:stocks.length}); //LOAD THIS TO SEE A NICE FORMAT OF THE JSON
        res.json({stocks:stocks});

    });
});
//RESET TO ORIGINAL STOCK PRICES
app.get('/reset/stock', (req,res) => {
    databaseInitializer();//populate database
    res.redirect('/');
})
app.get('/stocks/:id', (req,res) => {
    let id = req.params.id;
    db.collection("stocks").find({}).toArray(function(err,stocks){
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        if(Object.keys(req.query)==0){
            if (err) 
            {
                res.status(500).send("ERROR READING DATA BASE");
                return;
            }
            for (let i = 0; i < Object.keys(stocks).length; i++){
                if (stocks[i].symbol.toLowerCase() == id.toLowerCase()) {
                    //res.render('restAPI',{stocks:stocks[i],l:1});//LOAD THIS TO SEE A NICE FORMAT OF THE JSON
                    
                }
            }
        //     res.render('restAPI',{stocks:stocks, l:stocks.length});



        let name;
        for (let i = 0; i < Object.keys(stocks).length; i++){
            if (stocks[i].symbol.toLowerCase() == id.toLowerCase()) {
                name = stocks[i].name;
            }
        }
        let thisStockHistory = [];
        for (let i = 0; i < History.length; i++) {
            if (History[i].includes(name)){
                thisStockHistory.push(History[i]);
            }
        }
        res.json({thisStockHistory});
    }else{
        let start = 0;
        let finish = 0;        
    
        req.query.hasOwnProperty('startday') ? start =parseInt(req.query['startday']) :0;
        req.query.hasOwnProperty('endday') ? finish = parseInt(req.query['endday']) :0;
        let name;
        let s; 
        for (let i = 0; i < Object.keys(stocks).length; i++){
            if (stocks[i].symbol.toLowerCase() == id.toLowerCase()) {
                name = stocks[i].name;
                s = stocks[i]
            }
        }

        let thisStockHistory = [];
        let add = false;
        for (let i = 0; i < History.length; i++) {
            if (History[i].includes("Day: "+finish)){
                break; //displays excluding the endday
            }
            if (History[i].includes("Day: "+start) && History[i].includes(name)){
                add = true;
            }
            if (add == true && History[i].includes(name)){
                thisStockHistory.push(History[i]);
            }
        }

        //res.render('restAPI',{thisStockHistory:thisStockHistory, l:0}); load this for nice output
        res.json({thisStockHistory});
    }
    });
});
app.get('/stocks/:id/history', (req,res) => {
    let id = req.params.id;
    db.collection("stocks").find({}).toArray(function(err,stocks){
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        if(Object.keys(req.query)==0){
        
        let name;
        for (let i = 0; i < Object.keys(stocks).length; i++){
            if (stocks[i].symbol.toLowerCase() == id.toLowerCase()) {
                name = stocks[i].name;
            }
        }
        let thisStockHistory = [];
        for (let i = 0; i < stockHistory.length; i++) {
            console.log(stockHistory[i])
            if (stockHistory[i].includes(name)){
                thisStockHistory.push(stockHistory[i]);
            }
        }
        //res.render('restAPI',{thisStockHistory:thisStockHistory, l:0}); load this for nice output
        res.json({thisStockHistory});
   //     res.render('restAPI',{stocks:stocks, l:stocks.length});
    }else{
        let start = 0;
        let finish = 0;        
    
        req.query.hasOwnProperty('startday') ? start =parseInt(req.query['startday']) :0;
        req.query.hasOwnProperty('endday') ? finish = parseInt(req.query['endday']) :0;
        let name;
        let s; 
        for (let i = 0; i < Object.keys(stocks).length; i++){
            if (stocks[i].symbol.toLowerCase() == id.toLowerCase()) {
                name = stocks[i].name;
                s = stocks[i]
            }
        }

        let thisStockHistory = [];
        let add = false;
        for (let i = 0; i < stockHistory.length; i++) {
            if (stockHistory[i].includes("Day: "+finish)){
                break;
            }
            if (stockHistory[i].includes("Day: "+start) && stockHistory[i].includes(name)){
                console.log("YESSSSSSSS")
                add = true;
            }
            if (add == true && stockHistory[i].includes(name)){
                thisStockHistory.push(stockHistory[i]);
                console.log("YESSSSSSSS")
            }
        }

        //res.render('restAPI',{thisStockHistory:thisStockHistory, l:0}); load this for nice output
        res.json({thisStockHistory});
    }
    });
});
/*
app.get('/stocks/:id/history/:start/:finish', (req,res) => {
    let start = req.params.start;
    let finish = req.params.finish;
    
    let id = req.params.id;

    let name;
    let s;    
    db.collection("stocks").find({}).toArray(function(err,stocks){
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        for (let i = 0; i < Object.keys(stocks).length; i++){
            if (stocks[i].symbol.toLowerCase() == id.toLowerCase()) {
                name = stocks[i].name;
                s = stocks[i]
            }
        }

        let thisStockHistory = [];
        let add = false;
        for (let i = 0; i < stockHistory.length; i++) {
            if (stockHistory[i].includes("Day: "+start) && stockHistory[i].includes(name)){
                console.log("YESSSSSSSS")
                add = true;
            }
            if (add == true && stockHistory[i].includes(name)){
                thisStockHistory.push(stockHistory[i]);
                console.log("YESSSSSSSS")
            }
            if (stockHistory[i].includes("Day: "+finish)){
                break;
            }
        }

        res.render('restAPI',{thisStockHistory:thisStockHistory, l:0});
   //     res.render('restAPI',{stocks:stocks, l:stocks.length});
    });
});
*/
/*
app.get('/stocks/:id/:start/:finish', (req,res) => {
    let start = req.params.start;
    let finish = req.params.finish;
    
    let id = req.params.id;
    db.collection("stocks").find({}).toArray(function(err,stocks){
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        let name;
        let s;
        for (let i = 0; i < Object.keys(stocks).length; i++){
            if (stocks[i].symbol.toLowerCase() == id.toLowerCase()) {
                name = stocks[i].name;
                s = stocks[i]
            }
        }

        let thisStockHistory = [];
        let add = false;
        for (let i = 0; i < stockHistory.length; i++) {
            
            if (stockHistory[i].includes("Day: "+start) && stockHistory[i].includes(name)){
                add = true;
            }
            if (add == true && stockHistory[i].includes(name)){
                thisStockHistory.push(stockHistory[i]);
            }
            if (stockHistory[i].includes("Day: "+finish)){
                break;
            }
        }

        res.render('restAPI',{stocks:s,l:1,stockHistory:thisStockHistory});
   //     res.render('restAPI',{stocks:stocks, l:stocks.length});
    });
});*/
//this function will show how many stocks each person has instead of showing the stocks multiple times
function checkAmount (req, res) {
    /*
    db.collection("stocks").find({}).toArray(function(err,stocks){
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        let s = [];
        for (let i = 0; i < Object.keys(stocks).length; i++){
            for (let j = 0; j < req.user.myStocks.length;j++){
                if (req.user.myStocks[j].name == stocks[i].name){
                    if (s == undefined){
                        //console.log("YESSSSSSS");
                        //console.log(req.user.myStocks[j])
                        s.push(JSON.parse(JSON.stringify(req.user.myStocks[j])));
                        //console.log("ANOTHER ONE");
                        //console.log(s)
                        s[s.length-1].count = 1;
                    }
                    }else{
                        let check = false;
                        for (let k = 0; k < s.length;k++){
                            if (s[k].name == req.user.myStocks[j].name){
                                s[k].count++;
                                check = true;
                            }
                        }
                        if (check == false) {
                            s.push(JSON.parse(JSON.stringify(req.user.myStocks[j])));
                            s[s.length-1].count = 1;
                        }
                    }
                }
            }

        req.user.myStocks=s;
    });
    */

}

app.get('/NotMain/user/userMyStocks', (req, res) => {
    if(isUser(req.user))
    {
        db.collection("stocks").find({}).toArray(function(err,stocks){
            if (err) 
            {
                res.status(500).send("ERROR READING DATA BASE");
                return;
            }
            //checkAmount(req,res);
            //req.user.myStocks = checkAmount(req,res); //this assured stocks will not get displayed more then once. instead it will have amount of stock owned
            let totalValue = 0;
            for (let i = 0; i < Object.keys(stocks).length; i++) {
                for (let j = 0; j < req.user.myStocks.length;j++){
                    if (req.user.myStocks[j].name == stocks[i].name){
                        req.user.myStocks[j].curPrice = stocks[i].curPrice;
                        req.user.myStocks[j].low = stocks[i].low;
                        req.user.myStocks[j].high = stocks[i].high;
                        totalValue += req.user.myStocks[j].curPrice;
                    }
                }
            }
            
            res.render('NotMain/user/userMyStocks', {name: req.user.name, email:req.user.email, myStocks:req.user.myStocks,totalValue});
        });   
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
    /*if(isUser(req.user))
    {
        res.render('NotMain/user/userMyStocks', {name: req.user.name, email:req.user.email, myStocks:req.user.myStocks, stocks});
    }
    else
    {
        res.redirect('/NotMain/Login');
    }*/
});
app.get('/NotMain/user/stockHistory', (req, res) => {
    if(isUser(req.user))
    {
        res.render('NotMain/user/stockHistory', {name: req.user.name, email:req.user.email, History:stockHistory})
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
});
app.get('/NotMain/user/stockHistory/:start/:finish', (req, res) => {
    if(isUser(req.user))
    {
        let start = req.params.start;
        let finish = req.params.finish;

        db.collection("stocks").find({}).toArray(function(err,stocks){
            if (err) 
            {
                res.status(500).send("ERROR READING DATA BASE");
                return;
            }
            let thisStockHistory = [];
            let add = false;
            for (let i = 0; i < stockHistory.length; i++) {
                
                if (stockHistory[i].includes("Day: "+start)){
                    add = true;
                }
                if (add == true){
                    thisStockHistory.push(stockHistory[i]);
                }
                if (stockHistory[i].includes("Day: "+finish)){
                    break;
                }
            }
            res.render('NotMain/user/stockHistory', {name: req.user.name, email:req.user.email, History:thisStockHistory})
        });
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
});

app.get('/NotMain/user/userMyOrder', (req, res) => {
    if(isUser(req.user))
    {
        db.collection("stocks").find({}).toArray(function(err,stocks){
            if (err) 
            {
                res.status(500).send("ERROR READING DATA BASE");
                return;
            }
            console.log("Result: display stocks");
            console.log(stocks);
            for (let i = 0; i < Object.keys(stocks).length; i++) {
                for (let j = 0; j < req.user.orders.length;j++){
                    if (req.user.orders[j].name == stocks[i].name){
                        req.user.orders[j].curPrice = stocks[i].curPrice;
                        req.user.orders[j].low = stocks[i].low;
                        req.user.orders[j].high = stocks[i].high;
                    }
                }
            }
            res.render('NotMain/user/userMyOrder', {name: req.user.name, email:req.user.email, orders:req.user.orders});
        });
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
});

app.get('/NotMain/user/userMyWatchlist', (req, res) => {
    if(isUser(req.user))
    {
        db.collection("stocks").find({}).toArray(function(err,stocks){
            if (err) 
            {
                res.status(500).send("ERROR READING DATA BASE");
                return;
            }
            for (let i = 0; i < Object.keys(stocks).length; i++) {
                for (let j = 0; j < req.user.watchList.length;j++){
                    if (req.user.watchList[j].name == stocks[i].name){
                        req.user.watchList[j].curPrice = stocks[i].curPrice;
                        req.user.watchList[j].low = stocks[i].low;
                        req.user.watchList[j].high = stocks[i].high;
                    }
                }
            }
            res.render('NotMain/user/userMyWatchlist',  {name: req.user.name, email:req.user.email, watchList:req.user.watchList});
        });
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
});

app.get('/NotMain/user/userMyResearch', (req, res) => {
    if(isUser(req.user))
    {
        db.collection("stocks").find({}).toArray(function(err,stocks){
            if (err) 
            {
                res.status(500).send("ERROR READING DATA BASE");
                return;
            }
            
            res.render('NotMain/user/userMyResearch',  {name: req.user.name, email:req.user.email, stocks});
        });   
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
    /*if(isUser(req.user))
    {
        res.render('NotMain/user/userMyResearch',  {name: req.user.name, email:req.user.email, stocks});
    }
    else
    {
        res.redirect('/NotMain/Login');
    }*/
});

app.get('/NotMain/user/userMyTrades', (req, res) => {
    if(isUser(req.user))
    {
        res.render('NotMain/user/userMyTrades',  {name: req.user.name, email:req.user.email});
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
});

app.get('/NotMain/user/userMyHistory', (req, res) => {
    if(isUser(req.user))
    {
        res.render('NotMain/user/userMyHistory',  {name: req.user.name, email:req.user.email, History:req.user.History});
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
});
//this will go from a number to a number
app.get('/NotMain/user/userMyHistory/:start/:finish', (req, res) => {
    if(isUser(req.user))
    {
        let start = req.params.start;
        let finish = req.params.finish;

        db.collection("stocks").find({}).toArray(function(err,stocks){
            if (err) 
            {
                res.status(500).send("ERROR READING DATA BASE");
                return;
            }
            let thisStockHistory = [];
            let add = false;
            for (let i = 0; i < req.user.History.length; i++) {
                
                if (req.user.History[i].includes("Day: "+start)){
                    add = true;
                }
                if (add == true){
                    thisStockHistory.push(req.user.History[i]);
                }
                if (req.user.History[i].includes("Day: "+finish)){
                    break;
                }
            }
            res.render('NotMain/user/userMyHistory', {name: req.user.name, email:req.user.email, History:thisStockHistory})
        });
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
    
});
//this history is organized by name or sold, our bought
app.get('/NotMain/user/userMyHistory/:id', (req, res) => {
    if(isUser(req.user))
    {
        let id = req.params.id;
        db.collection("stocks").find({}).toArray(function(err,stocks){
            if (err) 
            {
                res.status(500).send("ERROR READING DATA BASE");
                return;
            }
            let name;
            for (let i = 0; i < Object.keys(stocks).length; i++){
                if (stocks[i].symbol.toLowerCase() == id.toLowerCase()) {
                    name = stocks[i].name;
                }
            }
            if (id == "sell") {
                name = "sold"
            }
            if (id == "buy"){
                name = "purchase";
            }
            let thisStockHistory = [];
            for (let i = 0; i < req.user.History.length; i++) {
                if (req.user.History[i].includes(name)){
                    thisStockHistory.push(req.user.History[i]);
                }
            }
            res.render('NotMain/user/userMyHistory', {name: req.user.name, email:req.user.email, History:thisStockHistory})
        });
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
});

app.get('/NotMain/user/userMySubs', (req, res) => {
    if(isUser(req.user))
    {
        db.collection("stocks").find({}).toArray(function(err,stocks){
            if (err) 
            {
                res.status(500).send("ERROR READING DATA BASE");
                return;
            }

            for (let i = 0; i < Object.keys(stocks).length; i++) {
                for (let j = 0; j < req.user.eventSubs.length;j++){
                    if (req.user.eventSubs[j].name == stocks[i].name){
                        req.user.eventSubs[j].curPrice = stocks[i].curPrice;
                        req.user.eventSubs[j].low = stocks[i].low;
                        req.user.eventSubs[j].high = stocks[i].high;
                    }
                }
            }
            
            res.render('NotMain/user/userMySubs',  {name: req.user.name, email:req.user.email, eventSubs:req.user.eventSubs});
        });   
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
    /*if(isUser(req.user))
    {
        res.render('NotMain/user/userMySubs',  {name: req.user.name, email:req.user.email, eventSubs:req.user.eventSubs, stocks});
    }
    else
    {
        res.redirect('/NotMain/Login');
    }*/
});

app.get('/NotMain/user/userMyMoney', (req, res) => {
    if(isUser(req.user))
    {
        db.collection("stocks").find({}).toArray(function(err,stocks){
            if (err) 
            {
                res.status(500).send("ERROR READING DATA BASE");
                return;
            }
            
            res.render('NotMain/user/userMyMoney',  {name: req.user.name, email:req.user.email, money:req.user.money});
        });   
    }
    else
    {
        res.redirect('/NotMain/Login');
    }
    /*if(isUser(req.user))
    {
        res.render('NotMain/user/userMyMoney',  {name: req.user.name, email:req.user.email, money:req.user.money, stocks});
    }
    else
    {
        res.redirect('/NotMain/Login');
    }*/
});


app.get('/NotMain/allStocks', (req, res) => {
    db.collection("stocks").find({}).toArray(function(err,stocks){
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        
        res.render('NotMain/allStocks', {stocks});
    });
    /*res.render('NotMain/allStocks', {
        stocks
    });*/
});

//CHECKS WHICH BUTTON THEY PRESSED 
app.post('/NotMain/user/userMyTrades/redirect', function(req, res, next){
    //redirects depending on the button pressed
    
    //For Testing purposes
    /*console.log("watch" + req.body.watch);
    console.log("sub" + req.body.sub);
    console.log("sell" + req.body.sell);
    console.log("remW" + req.body.remW);
    console.log("remES" + req.body.remES);
    console.log("buy" + req.body.buy);*/
    if (req.body.buy!=undefined) {
        buy(req,res,next);
    }else if (req.body.sell != undefined) {
        sell(req,res,next);
    }else if (req.body.sub != undefined) {
        sub(req,res,next);
    }else if (req.body.remES != undefined) {
        remES(req,res,next);
    }else if (req.body.remW != undefined) {
        remW(req,res,next);
    }else if (req.body.remOrder != undefined){
        remOrder(req,res,next);   
    }else if (req.body.remSOrder != undefined){
        remSorder(req,res,next);
    }else{
        watch(req, res, next);
    }
    return;
});

app.post('/NotMain/user/userMyMoney/redirect', function(req, res, next)
{
    if (req.body.remMoney == undefined) {
        money(req, res, next);
    }
    else if (req.body.money == undefined) {
        remMoney(req,res,next);
    }
    return;
});

function getDate() 
{
    //stock market is open from 9 30 to 4 so we adjusted for that here
    let min;
    let hour = Math.floor((halfHour/2)+9.5);
    if (hour >= 24) {
        hour = hour % 24;
        hour = Math.floor(hour);
    }
    if (halfHour%2){
        min = 0;
    }else {
        min = 30;
    }
    if (hour < 9){
        return " Day: "+ (Number(day)+Number(1)) + " Hour: "+hour+":"+min; 
    }
    return " Day: "+ day + " Hour: "+hour+":"+min; 
}

function money(req,res,next)
{
    //check user is valid
    if(!isUser(req.user))
    {
        res.redirect('/NotMain/Login');
        console.log("SOMETHING WENT WRONG, USER NOT FOUND");
    }
    
    if(req.body.price>0)
    {
        req.user.money+=parseInt(req.body.price);
        var timestamp = " Money added at " + getDate();
        req.user.History.push(timestamp);
    }
    else{
        req.user.money=req.user.money;
        var timestamp = "Money not added because of invalid entered parameters at " + getDate();
        req.user.History.push(timestamp);
    }
    console.log(req.user.name + " now has " + req.user.money);
    res.redirect('/NotMain/user/userMyMoney');
}

function remMoney(req,res,next)
{
    //check user is valid
    if(!isUser(req.user))
    {
        res.redirect('/NotMain/Login');
        console.log("SOMETHING WENT WRONG, USER NOT FOUND");
    }
    
    if(req.body.price>0 && req.body.price<=req.user.money)
    {
        req.user.money-=parseInt(req.body.price);
        var timestamp = "Money removed at " + getDate();
        req.user.History.push(timestamp);
    }
    else{
        req.user.money=req.user.money;
        var timestamp = "Money not removed because of invalid entered parameters at " + getDate();
        req.user.History.push(timestamp);
    }
    console.log(req.user.name + " now has " + req.user.money);
    res.redirect('/NotMain/user/userMyMoney');
}

//ADDS TO WATCH LIST
function watch(req, res, next){
    let stock = JSON.parse(JSON.stringify(req.body.id));
    //check user is valid
    
    if(!isUser(req.user))
    {
        res.redirect('/NotMain/Login');
        console.log("SOMETHING WENT WRONG, NOT USER FOUND");
    }


    db.collection("stocks").find({}).toArray(function(err,stocks)
    {
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        for (let i = 0; i < req.user.watchList.length;i++){
            //checks if user already watching
            if ((stock.toLowerCase() == req.user.watchList[i].name.toLowerCase() || stock.toLowerCase() == req.user.watchList[i].symbol.toLowerCase()))
            {
                return;
            }
        }
        //loops to find stock name within stocks
        let s = null;
        for (let i = 0; i < Object.keys(stocks).length; i++)
        {
            //if finds the name adds to user stocks
            if((stock.toLowerCase() == stocks[i].name.toLowerCase() || stock.toLowerCase() == stocks[i].symbol.toLowerCase()) && req.user.watchList.includes(stocks[i]) == false)
            {  
                s = stock;
                req.user.watchList.push(stocks[i]);
                var timestamp = stocks[i].name + " added to Watchlist at " + getDate();
                req.user.History.push(timestamp);
            }
        }
        if (s == null) {
            console.log("stock was not found!");
            var timestamp = "Stock not added to Watchlist due to invalid entered parameters at " + getDate();
            req.user.History.push(timestamp);
            return;
        }
        console.log("added " +  stock + " to " + req.user.name + " watch list");
        res.redirect('/NotMain/user/userMyWatchlist')
        
    }); 
}

//Removes from WATCH LIST
function remW(req, res, next)
{
    //console.log("Test");
    let stock = JSON.parse(JSON.stringify(req.body.id));
    //check user is valid
    if(!isUser(req.user))
    {
        res.redirect('/NotMain/Login');
        console.log("SOMETHING WENT WRONG, NOT USER FOUND");
    }
    
    let s = null;
    for (let i = 0; i < req.user.watchList.length; i++)
    {
        //console.log("Made it");
        if(req.user.watchList[i].name.toLowerCase() == stock.toLowerCase() || req.user.watchList[i].symbol.toLowerCase() == stock.toLowerCase())
        {  
            //console.log("Made here");
            s = stock;
            //delete(req.user.watchList[i])
            var timestamp = req.user.watchList[i].name + " removed from Watchlist at " + getDate();
            req.user.History.push(timestamp);
            req.user.watchList.splice(i,1);
            
        }
    }
    if (s == null) {
        console.log("stock was not found!");
        var timestamp =  "Stock not removed from Watchlist due to invalid entered parameters at " + getDate();
        req.user.History.push(timestamp);
        return;
    }
    console.log("Removed " +  stock + " from " + req.user.name + " watch list");
    res.redirect('/NotMain/user/userMyWatchlist')
}

function remOrder(req,res,next) 
{
    let stock = JSON.parse(JSON.stringify(req.body.id));
    //let price = parseInt(stocks[i].curPrice);
    let quantity = parseInt(req.body.amount);
    
    //check user is valid
    if(!isUser(req.user))
    {
        console.log("SOMETHING WENT WRONG, USER NOT FOUND");
        return null;
    }
    
    if (halfHour > 13 && halfHour < 48) { //you can only remove from order if the order did not process yet (when the market it closed)
        if(/*price<0 ||*/ !(quantity >0))
        {
            console.log("You are removing too little stocks from your orders");
            return null;
        }
        let counter = 0
        for(let k=0; k < req.user.orders.length; k++)
        {
            if(req.user.orders[k].name.toLowerCase() == stock.toLowerCase() && req.user.orders[k].type =='Buy' || req.user.orders[k].symbol.toLowerCase() == stock.toLowerCase()&& req.user.orders[k].type =='Buy')
            {  
                counter++;
                req.user.orders.splice(k--,1)
                if (counter == quantity) {
                    break;
                }
            }
        }
        if (counter < quantity){
            console.log("Could only remove "+ counter +  " " + stock + " stocks intead of "+ quantity + " from buying user orders")
        }else{
            console.log("Removed "+ counter + " " + stock + " from buying users orders: ");
        }
    }else {
        console.log("market is open just therefore your orders have been processed");
    }
}

function remSorder(req, res,next) 
{
    let stock = JSON.parse(JSON.stringify(req.body.id));
    //let price = parseInt(stocks[i].curPrice);
    let quantity = parseInt(req.body.amount);
    
    //check user is valid
    if(!isUser(req.user))
    {
        console.log("SOMETHING WENT WRONG, USER NOT FOUND");
        return null;
    }
    
    if (halfHour > 13 && halfHour < 48) { //you can only remove from order if the order did not process yet (when the market it closed)
        if(/*price<0 ||*/ !(quantity >0))
        {
            console.log("You are removing too little stocks from your orders");
            return null;
        }
        let counter = 0
        for(let k=0; k < req.user.orders.length; k++)
        {
            if(req.user.orders[k].name.toLowerCase() == stock.toLowerCase() && req.user.orders[k].type =='Sell' || req.user.orders[k].symbol.toLowerCase() == stock.toLowerCase()&& req.user.orders[k].type =='Sell')
            {  
                counter++;
                req.user.orders.splice(k--,1)
                if (counter == quantity) {
                    break;
                }
            }
        }
        if (counter < quantity){
            console.log("Could only remove "+ counter +  " " + stock + " stocks intead of "+ quantity + " from selling user order")
        }else{
            console.log("Removed "+ counter + " " + stock + " from selling users orders");
        }
    }else {
        console.log("market is open just therefore your orders have been processed");
    }
}

//BUYS STOCK
function buy(req, res, next){
    let stock = JSON.parse(JSON.stringify(req.body.id));
    //let price = parseInt(stocks[i].curPrice);
    let quantity = parseInt(req.body.amount);
    
    //check user is valid
    if(!isUser(req.user))
    {
        res.redirect('/NotMain/Login');
        console.log("SOMETHING WENT WRONG, NOT USER FOUND");
    }

    db.collection("stocks").find({}).toArray(function(err,stocks)
    {
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        
        if (halfHour <= 13) { //only lets you buy when market is open else adds it to orders and will buy in the morning
            //if this is less then 0 they have no money left
            if(/*price<0 ||*/ !(quantity >0))
            {
                console.log("Either the stock was worth more than you can afford or you tried to purchase too large or too small a quantity");
                return null;
            }
            let moneyLeft=0;
            let s = null; //this will check if it found a stock with the name the user put it
            //loops to find stock name within stocks
            for (let i = 0; i < Object.keys(stocks).length; i++)
            {
                let price = parseInt(stocks[i].curPrice);
                if(stocks[i].name.toLowerCase() == stock.toLowerCase() || stocks[i].symbol.toLowerCase() == stock.toLowerCase())
                {  
                    s = JSON.parse(JSON.stringify(stocks[i]));
                    s.priceBought = stocks[i].curPrice;
                    moneyLeft = req.user.money-(quantity*stocks[i].curPrice);
                    //console.log(stocks[i]);
                    //if finds the stock checks to see how much they are willing to pay for it
                    if (stocks[i].curPrice <= price && moneyLeft>=0){
                        //if they want it in the price avaliable then adds the amount wanted
    
                        stocks[i].dailyTrades+=quantity;
                        for (let j = 0; j < quantity; j++) {
                            req.user.myStocks.push(s);
                            //db
                            var timestamp = stocks[i].name + " purchased at " + getDate();
                            req.user.History.push(timestamp);
                            History.push(timestamp);
                            //console.log(stocks[i]);
                        }
                    }
                    else{
                        //THEY WANTED A PRICE LOWER THEN THE STOCK PRICE
                        console.log("wanted price too low or not enough money")
                        let timestamp = " Stock not purchased due to not having enough money at " + getDate();
                        req.user.History.push(timestamp);
                        return null;
                    }
                    break;
                }
            }
            if (s == null) {
                console.log("stock was not found");
                let timestamp = " Stock not purchased due to invalid entered parameters at " + getDate();
                req.user.History.push(timestamp);
                return;
            }
            
            req.user.money=moneyLeft;
            console.log("before:"+req.user.myStocks);
            console.log("Added "+quantity+" " +  stock + " stock to " + req.user.name + " stocks");
            console.log("Money left: " + req.user.money);
        }
        else 
        {
            var timestamp = " Markets were closed when buying , adding to orders and try again in the morning" + getDate();
            req.user.History.push(timestamp);
            for (let i = 0; i < Object.keys(stocks).length; i++){
                if(stocks[i].name.toLowerCase() == stock.toLowerCase() || stocks[i].symbol.toLowerCase() == stock.toLowerCase()){  
                    for (let j = 0; j < quantity; j++){
                        let s = JSON.parse(JSON.stringify(stocks[i]))
                        s.type = "Buy";
                        console.log(s);
                        req.user.orders.push(s);
                        console.log()
                    }
                    
                    break;
                }
            }
            //req.user.orders[0].type= "Buy";
            console.log("Added " + quantity + " " + stock+ " to users orders(Buy)");
            let sAmount = 0; //stock amount used to calculate how much to buy
            function checkFlag() {
                if(halfHour > 13) {
                   setTimeout(checkFlag, 1000); //checks if market is open
                }else {
                    //for loop checking how much of each stock there is and call function with that amount
                    for (let i = 0; i < req.user.orders.length; i++) {
                        if(req.user.orders[i].name.toLowerCase() == stock.toLowerCase() && req.user.orders[i].type == 'Buy' || req.user.orders[i].symbol.toLowerCase() == stock.toLowerCase() && req.user.orders[i].type == 'Buy'){ 
                            sAmount++;
                            req.user.orders.splice(i--,1)
                        }
                    }
                    req.body.amount = sAmount;
                    if (sAmount > 0) {
                        buy(req, res, next)
                    }
                }
            }
            checkFlag();
        }
    }); 
}


//Sells Stock
function sell(req, res, next)
{
    let stock = JSON.parse(JSON.stringify(req.body.id));
    //let price = parseInt(stocks[i].curPrice);
    let quantity = parseInt(req.body.amount);
    
    //check user is valid
    if(!isUser(req.user))
    {
        res.redirect('/NotMain/Login');
        console.log("SOMETHING WENT WRONG, NOT USER FOUND");
    }

    db.collection("stocks").find({}).toArray(function(err,stocks)
    {
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        
        if (halfHour <= 13) { //only lets you buy when market is open else adds it to orders and will buy in the morning
            //if this is less then 0 they have no money left
            if(/*price<0 ||*/ !(quantity >0))
            {
                console.log("Either the stock was worth more than you can afford or you tried to purchase too large or too small a quantity");
                return null;
            }
            
            let moneyLeft=0;
            let s = null; //this will check if it found a stock with the name the user put it
            let counter=0;
            //loops to find stock name within stocks
            for(let k=0; k < req.user.myStocks.length; k++)
            {
                if(stock.toLowerCase()==req.user.myStocks[k].name.toLowerCase() || stock.toLowerCase()==req.user.myStocks[k].symbol.toLowerCase())
                {
                    counter++;
                }
            }
            for (let i = 0; i < req.user.myStocks.length; i++)
            {
                if(req.user.myStocks[i].name.toLowerCase() == stock.toLowerCase() || req.user.myStocks[i].symbol.toLowerCase() == stock.toLowerCase())
                {  
                    
                    s = req.user.myStocks[i];
    
                    if(counter>=quantity && quantity>0)
                    {
                        //console.log(stocks[i]);
                        for(let h=0; h<stocks.length; h++)
                        {
                            if(stocks[h].name.toLowerCase() == stock.toLowerCase())
                            {
                                stocks[h].dailyTrades++;
                            }
                        }
                        //console.log(stocks[i]);

                        for(var j=0; j<quantity; j++)
                        {
                            moneyLeft = req.user.money+(quantity*req.user.myStocks[i].curPrice);
                            var timestamp = req.user.myStocks[i].name + " sold at " + getDate();
                            req.user.History.push(timestamp);
                            req.user.myStocks.splice(i,1); 
                        }  
                        console.log("Removed "+quantity+" " +  stock + " stock(s) from " + req.user.name + " stocks"); 
                        break;
                    }     
                    else
                    {
                        console.log("Removed 0" +  stock + " stock(s) from " + req.user.name + " stocks, because an invalid quantity was entered");
                        console.log(quantity);
                        console.log(counter);
                        moneyLeft = req.user.money;
                        var timestamp = " Stock not sold due to invalid entered quantity at " + getDate();
                        req.user.History.push(timestamp);
                    }
                }
            }
            if (s == null) {
                console.log("stock was not found");
                var timestamp = " Stock not purchased due to invalid entered parameters at " + getDate();
                req.user.History.push(timestamp);
                return;
            }else {
                var timestamp = s.name + " sold at " + getDate();
                History.push(timestamp);
            }
            
            req.user.money=moneyLeft;
            console.log("after:"+req.user.myStocks);
            console.log("Money left: " + req.user.money);
        }else {
            var timestamp = " Markets were closed when selling , adding to orders and try again in the morning" + getDate();
            req.user.History.push(timestamp);
            for (let i = 0; i < Object.keys(stocks).length; i++){
                if(stocks[i].name.toLowerCase() == stock.toLowerCase() || stocks[i].symbol.toLowerCase() == stock.toLowerCase()){  
                    for (let j = 0; j < quantity; j++){
                        let s = JSON.parse(JSON.stringify(stocks[i]));
                        s.type = "Sell";
                        console.log(s);
                        req.user.orders.push(s);
                        /*let arr = []
                        arr[3.4] = 'Oranges'
                        console.log(arr.length)
                        console.log(arr.hasOwnProperty(3.4))*/
                    }
                    break;
                }
            }
            //req.user.orders[0].type= "Sell" //line needs work
            console.log("Added " + quantity + " " + stock+ " to users orders(Sell)");
            let sAmount = 0; //stock amount used to calculate how much to buy
            function checkFlag() {
                if(halfHour > 13) {
                setTimeout(checkFlag, 1000); //checks if market is open
                }else {
                    //for loop checking how much of each stock there is and call function with that amount
                    for (let i = 0; i < req.user.orders.length; i++) {
                        if(req.user.orders[i].name.toLowerCase() == stock.toLowerCase() && req.user.orders[i].type == 'Sell' || req.user.orders[i].symbol.toLowerCase() == stock.toLowerCase() && req.user.orders[i].type == 'Sell'){ 
                            sAmount++;
                            req.user.orders.splice(i--,1)
                        }
                    }
                    req.body.amount = sAmount;
                    if (sAmount > 0) {
                        sell(req, res, next)
                    }
                }
            }
            checkFlag();
        }
    });    
}



//ADDING TO EVENT SUB
function sub(req, res, next){
    let stock = JSON.parse(JSON.stringify(req.body.id));
    let wantedPrice = parseInt(req.body.price);
    let quantity = parseInt(req.body.amount);
    //check user is valid
    if(!isUser(req.user))
    {
        res.redirect('/NotMain/Login');
        console.log("SOMETHING WENT WRONG, NOT USER FOUND");
    }
    //HERE WILL CHECK IF USER INPUT IS NULL AND IF IT IS EXIT
    if (stock == null) {
        console.log("You did not enter a stock")
        return;
    }
    if (wantedPrice < 1 || isNaN(wantedPrice)) {
        console.log("You did not enter a valid wanted price")
        return;
    }
    if (quantity < 1 || isNaN(quantity)) {
        console.log("You did not enter a valid quantity")
        return;
    }

    db.collection("stocks").find({}).toArray(function(err,stocks)
    {
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
    
        let st;
    //loops to find stock name within stocks
    for (let i = 0; i < Object.keys(stocks).length; i++){
        //if finds the name adds to user stocks
        if(stocks[i].name.toLowerCase() == stock.toLowerCase() || stocks[i].symbol.toLowerCase() == stock.toLowerCase())
        {  
            st= stocks[i];
            if (wantedPrice > stocks[i].curPrice) {
                console.log("Adding to event sub, will sell once it reaches " + wantedPrice)
                let timestamp = " Added to event sub (sell) at $"+wantedPrice+" " + getDate();
                req.user.History.push(timestamp);
                //adding to eventSub array
                for (let j = 0; j < quantity; j++){
                    let s = JSON.parse(JSON.stringify(stocks[i]));
                    s.type = "Sell";
                    s.wantedPrice = wantedPrice;
                    req.user.eventSubs.push(s);
                }
                for (let j = 0; j < req.user.eventSubs.length; j++){
                    if (req.user.eventSubs[j].type == "Sell" && req.user.eventSubs[j].name == stocks[i].name) {
                        req.user.eventSubs[j].wantedPrice = wantedPrice;
                    }
                }

                let sAmount = 0; //stock amount used to calculate how much to buy
                function checkFlag() {
                    db.collection("stocks").find({}).toArray(function(err,stocks)
                    {
                    if(halfHour > 13 || wantedPrice > stocks[i].curPrice) {
                    setTimeout(checkFlag, 1000); //checks if market is open
                    //console.log("YYESSSSSS#######")
                    }else {
                    //for loop checking how much of each stock there is and call function with that amount
                    for (let i = 0; i < req.user.eventSubs.length; i++) {
                        if(req.user.eventSubs[i].name.toLowerCase() == stock.toLowerCase() && req.user.eventSubs[i].type == 'Sell' || req.user.eventSubs[i].symbol.toLowerCase() == stock.toLowerCase() && req.user.eventSubs[i].type == 'Sell'){ 
                            console.log("YESSSSSS11111111")
                            sAmount++;
                            req.user.eventSubs.splice(i--,1)
                        }
                    }
                    req.body.amount = sAmount;
                    if (sAmount > 0) {
                        //console.log("YESSSSSSSSS2")
                        sell(req, res, next)
                    }
                }
            });
        }
        checkFlag();
            }
            else
            {
                console.log("Adding to event sub, will buy once it reaches " + wantedPrice)
                let timestamp = " Added to event sub (buy) at $"+wantedPrice+" " + getDate();
                req.user.History.push(timestamp);
                //adding to eventSub array
                for (let j = 0; j < quantity; j++){
                    let s = JSON.parse(JSON.stringify(stocks[i]));
                    s.type = "Buy";
                    s.wantedPrice = wantedPrice;
                    req.user.eventSubs.push(s);
                }
                s = stock[i];
                timestamp = stocks[i].name + " event subbed to at " + getDate();
                req.user.History.push(timestamp);
                
                for (let j = 0; j < req.user.eventSubs.length; j++){
                    if (req.user.eventSubs[j].type == "Buy"&& req.user.eventSubs[j].name == stocks[i].name) {
                        req.user.eventSubs[j].wantedPrice = wantedPrice;
                    }
                }
                let sAmount = 0; //stock amount used to calculate how much to buy
                function checkFlag() {
                db.collection("stocks").find({}).toArray(function(err,stocks)
                {
                if(halfHour > 13 || wantedPrice < stocks[i].curPrice) {
                setTimeout(checkFlag, 1000); //checks if market is open
                }else {
                //for loop checking how much of each stock there is and call function with that amount
                for (let i = 0; i < req.user.eventSubs.length; i++) {
                    if(req.user.eventSubs[i].name.toLowerCase() == stock.toLowerCase() && req.user.eventSubs[i].type == 'Buy' || req.user.eventSubs[i].symbol.toLowerCase() == stock.toLowerCase() && req.user.eventSubs[i].type == 'Buy'){ 
                        sAmount++;
                        req.user.eventSubs.splice(i--,1)
                    }
                }
                req.body.amount = sAmount;
                if (sAmount > 0) {
                    buy(req, res, next)
                }
            }
        });
        }
        checkFlag();
            }
        }
    }
    if (st == null) {
        console.log("stock was not found!")
        var timestamp = " Stock not event subbed to due to invalid entered parameters at " + getDate();
        req.user.History.push(timestamp);
        return;
    }
    console.log("added " +  stock + " to " + req.user.name + " eventSubs");
    res.redirect('/NotMain/user/userMySubs')
    });
}



//Removes from Event Subscription
function remES(req, res, next){
    let stock = JSON.parse(JSON.stringify(req.body.id));
    let wantedPrice = parseInt(req.body.price);
    let quantity = parseInt(req.body.amount);
    //check user is valid
    if(!isUser(req.user))
    {
        console.log("SOMETHING WENT WRONG, NOT USER FOUND");
        return null;
    }
    
    let s = null;
    let counter = 0;
    for (let i = 0; i < req.user.eventSubs.length; i++)
    {
        //console.log("Made it");
        if(req.user.eventSubs[i].name.toLowerCase() == stock.toLowerCase() && req.user.eventSubs[i].wantedPrice == wantedPrice || req.user.eventSubs[i].symbol.toLowerCase() == stock.toLowerCase()&&req.user.eventSubs[i].wantedPrice == wantedPrice)
        {  
            //console.log("Made here");
            s = stock;
            //delete(req.user.watchList[i])
            var timestamp = req.user.eventSubs[i].name + " removed from event sub at " + getDate();
            req.user.eventSubs.splice(i--,1);
            req.user.History.push(timestamp);
            counter++;
            if (counter == quantity){
                break;
            }
        }
    }
    if (counter < quantity){
        console.log("Could only remove "+ counter + " intead of "+ quantity + " from event sub")
    }
    if (s == null) {
        console.log("stock was not found or wrong wanted price");
        var timestamp = " Stock not removed from event subbed due to invalid entered parameters at " + getDate();
        req.user.History.push(timestamp);
        return;
    }
    console.log("Removed " +counter+" "+  stock + " from " + req.user.name + " Event Subscriptions");
    res.redirect('/NotMain/user/userMySubs')
}

//this function will go to the next day
//will choose randomly if the stock will go up or down, with a higher likelyhood of going up
//because the stock market on average goes up 8% a year. 
//just type //NotMain/nextday
app.get('/NotMain/user/nextday', function(req, res, next){
    //function for next day 
    if (req.user.email == "test@test.com") 
    {
        nextday();
    }
    else 
    {
        console.log("you do not have premitions for that!");
    }
    //adjusting the price of the users stocks
    /*for (let i = 0; i < users.myStocks.length; i++){

    }*/

    res.redirect('/NotMain/user/userMyResearch');
});
var stockHistory = [];

function nextday()
{   
    day++;
    console.log("New Day began!");
    db.collection("stocks").find({}).toArray(function(err,stocks)
    {
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        
        halfHour=0;
        
        for (let i = 0; i < Object.keys(stocks).length; i++)
        { 
            upOrDown = Math.random() * 100;
            if (upOrDown >= 50.3) {
                stocks[i].curPrice = Math.floor(stocks[i].curPrice*(1+(Math.random() * 1.16)/100));
            }else {
                stocks[i].curPrice = Math.floor(stocks[i].curPrice*((99.4+(Math.random() * 0.44))/100));
            }
            stockHistory.push("The openning price of " + stocks[i].name + " is $" + stocks[i].curPrice+" "+getDate())

            //changing everything for the start of day
            stocks[i].dailyTrades=0;
            stocks[i].high = stocks[i].curPrice;
            stocks[i].low = stocks[i].curPrice;
            console.log(stocks[i].name+" new current price is "+stocks[i].curPrice);
            db.collection("stocks").replaceOne({name: stocks[i].name}, {symbol: stocks[i].symbol, name: stocks[i].name, curPrice: stocks[i].curPrice, low: stocks[i].low, high:stocks[i].high, dailyTrades: 0})
        }
        
    });
}

//Here there is a timer and it changes the stocks price with a higher likelyhood of going up
//after FEW MINUTES IT WILL CALL nextday
let day = 0; //each min is 30 min market is open between 0 to 13 and closed from 13 to 48
var halfHour = 0;
let timer = 30000; //change this var to fast forward the time
var myfunc = setInterval(function(req, res, next) 
{
    db.collection("stocks").find({}).toArray(function(err,stocks){
        if (err) 
        {
            res.status(500).send("ERROR READING DATA BASE");
            return;
        }
        if (halfHour === 48) 
        {
            nextday();
            //halfHour = 0;
            
        }
        console.log(halfHour);//each one is one real life hour
        
        if (halfHour <= 13) 
        {
            for (let i = 0; i < Object.keys(stocks).length; i++){ 
                stocks[i].curPrice += Math.floor(1+(Math.random() * 10)-5)
                if (stocks[i].curPrice < stocks[i].low) {
                    stocks[i].low = stocks[i].curPrice
                }
                if (stocks[i].curPrice > stocks[i].high) {
                    stocks[i].high = stocks[i].curPrice
                }
                db.collection("stocks").replaceOne({name: stocks[i].name}, {symbol: stocks[i].symbol, name: stocks[i].name, curPrice: stocks[i].curPrice, low: stocks[i].low, high:stocks[i].high, dailyTrades: 0})
            }
        }
        if (halfHour==13){
            for (let i = 0; i < Object.keys(stocks).length; i++){ 
                stockHistory.push("The closing price of " + stocks[i].name + " is $" + stocks[i].curPrice +" "+getDate());
            }
        }
        halfHour++
        
    });

}, timer);//right now timer is set to have half hour real time = 30 sec in program

function checkAuthdUser(req, res, followUp)
{
    if(req.isAuthenticated())
    {
        return res.redirect('NotMain/userHome');
    }
    followUp();
}

//how to add tables to data base (and populate it)

function databaseInitializer() 
{
    /*let stocks = [{"symbol": "TSLA", "name": "Tesla", "curPrice": 500, "low": 500, "high": 500, "dailyTrades": 0}, 
    {"symbol": "AMZ", "name": "Amazon", "curPrice": 2500, "low": 2500, "high": 2500, "dailyTrades": 0},
    {"symbol": "SEB", "name": "Seaboard", "curPrice": 3000, "low": 3000, "high": 3000, "dailyTrades": 0},
    {"symbol": "CABO", "name": "CableOne", "curPrice": 1800, "low": 1800, "high": 1800, "dailyTrades": 0},
    {"symbol": "NIO", "name": "Nio", "curPrice": 620, "low": 620, "high": 620, "dailyTrades": 0},
    {"symbol": "GRWG", "name": "Growgeneration", "curPrice": 440, "low": 440, "high": 440, "dailyTrades": 0},
    {"symbol": "BEEMW", "name": "Beam Global", "curPrice": 383, "low": 383, "high": 383, "dailyTrades": 0}];*/
    
    db.collection("stocks").drop();
    db.collection("stocks").insertMany(stocks, function(err, result){
        if (err) throw err;
        console.log(result); //the table
    })
    
}

mc.connect("mongodb://localhost:27017", function(err, client){
    if (err){
        console.log("error connecting to mongodb");
        console.log(err);
        return;
    }
    
    db = client.db("data"); //creates data base or connects to existing
    //databaseInitializer();//populate database 
    
    //gets server listening (stating) // only runs if it connects to data base
    app.listen(port, () => {console.info('The server is up');
    nextday();
    });
    
}); //connect the mongodb

 //gets server listening (stating) // only runs if it connects to data base
 //app.listen(port, () => console.info('The server is up'));
