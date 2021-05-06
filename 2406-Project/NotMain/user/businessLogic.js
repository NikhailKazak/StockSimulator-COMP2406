//Goals
//i) Make user object(s) //Done
//ii) require stocks //Done
//iii) Make user make a watchlist, an event subscription and a buy/sell order


//Basic idea for business logic for users
//let users = require("./users.json");
//let stocks = require("./stocks.json");
//const { request } = require("express");



document.getElementById("watchlist").addEventListener("click", myFunction);
document.getElementById("sub").addEventListener("click", myFunction);
document.getElementById("buy").addEventListener("click", myFunction);
function myFunction() {
  alert("yess");
}


//Validates the existance of a user
function isUser(userObj)
{
    if(!userObj || !userObj.username)
    {
      return false;
    }
    return true;
}

//Creates a user
function makeNewUser(newUser)
{
    //When creating a user they have to meet certain criteria
    if(!newUser.email||!newUser.username || !newUser.password)
    {
        return null;
    }
    
    //If a user by the same username/email already exists
    if(users.hasOwnProperty(newUser.username)||users.hasOwnProperty(newUser.email))
    {
        console.log("");
        return null;
    }

    newUser.money = 10000;
    newUser.stocksBought = [];
    newUser.stocksWatched = [];
    newUser.eventSubs = [];
    users[newUser.username]=newUser;

    return users[newUser.user];
}

// function addToWatchlist(reqUser, stock)
// {
//     if(!isUser(reqUser))
//     {
//         return null;
//     }
//     if (reqUser.stocksWatched.includes(stock) == true) {
//         console.log("This stock is already in your watchlist");
//         return 0;
//     }
//     for (let i = 0; i < Object.keys(stocks).length; i++){
//         if(stocks[i].name == stock.name )
//         {  
//             reqUser.stocksWatched.push(stock);
//         }
//     }
    
//     return(1);
// }

//this function will remove from the watchlist
function removeFromWatchlist(reqUser, stock)
{
    if(!isUser(reqUser))
    {
        return null;
    }
    if (reqUser.stocksWatched.includes(stock) == false) {
        console.log("This stock is not in your watchlist");
        return 0;
    }

    for (let i = 0; i < reqUser.stocksWatched.length; i++){
        if(reqUser.stocksWatched[i].name == stock.name )
        {  
            reqUser.stocksWatched.splice(i);
        }
    }

}
//once it meets a sertain price buy it
//gonna be used later when using the server
function eventSubStock(reqUser, searchedStock)
{
    let eventSub=[];
    
    if(!isUser(reqUser))
    {
        return eventSub;
    }
    
    for(name in stocks)
    {
        let stock = stocks[name];
        let val = stocks[curPrice];
        //If the stock matches the entered name and the value is what the user desires
        if(stock.name.toLowerCase().indexOf(searchedStock.toLowerCase()) >= 0 && stock.curPrice <= val)
        {  
            eventSub.push(stock);
        }
    }
    return(eventSub);
}

//Sells an order
function sellStock(reqUser, stock, quantity)
{
    if(!isUser(reqUser))
    {
        return false;
    }
    
    let money=reqUser.money;
    let moneyLeft = money+(quantity*stock.curPrice);
    let quantityOfStockToSell = quantity;

    if(reqUser.stocksBought.length <=0 || quantityOfStockToSell <=0)
    {
        console.log("You can't sell these stocks");
        return false;
    }

    let counter = 0;
    for (let i = 0; i < reqUser.stocksBought.length; i++) {
        if (reqUser.stocksBought[i] == stock){
            reqUser.money = (moneyLeft);
            //takes i one back so it does not skip a stock (because we splice it out)
            reqUser.stocksBought.splice(i--,1);
            if (++counter == quantity) {
                break;
            }
        }
    }
    
    return true;    
}


//Creates an order

//will add function that checks if bought end of day and keep it until not wanted
// function buyStock(reqUser, stock, quantity)
// {
//     if(!isUser(reqUser))
//     {
//         return false;
//     }
    
//     let moneyLeft = reqUser.money-(quantity*stock.curPrice);
//     let quantityOfStockToPurchase = quantity;

//     if(moneyLeft<0 || quantityOfStockToPurchase <=0)
//     {
//         console.log("Either the stock was worth more than you can afford or you tried to purchase too large or too small a quantity");
//         return false;
//     }

//     reqUser.money=(moneyLeft);
//     for (let i = 0; i < quantity; i++) {
//         reqUser.stocksBought.push(stock);
//     }
//     stock.dailyTrades+=1;
//     return true;    
// }

//adds money to account
function addMoney (reqUser, amount) 
{
    //check user is valid
    if(!isUser(reqUser))
    {
        return null;
    }
    reqUser.money += amount;
    console.log(reqUser.username + " now has " + reqUser.money);
}

//makes some users using the json file
console.log("Make some users");
let JSusers = [users[0], users[1]];
//one user using simple js to show content of user
JSusers.push ({username:"user0", password: "b", email: "test@test.com" ,money: 0, stocksBought:[], stocksWatched:[], eventSubs: []})
//making stocks using json file;
//could also make this an array of stock, for the example for now it is just regular vars
let amazon = stocks[1]
let tesla = stocks[0]

//Print out the users to ensure state looks correct
console.log("Newly created users + stocks:");
console.log(JSusers[0]);
console.log(JSusers[1]);
console.log(JSusers[2]);
console.log(tesla);
console.log(amazon);

//adding money
console.log("Adding $1000 to " + JSusers[0].username);
addMoney(JSusers[0], 1000);
console.log("Adding $2000 to " + JSusers[0].username);
addMoney(JSusers[1], 2000);
console.log("Adding $5000 to " + JSusers[0].username);
addMoney(JSusers[2], 5000);
console.log("\ndisplay users with money:")
console.log(JSusers[0]);
console.log(JSusers[1]);
console.log(JSusers[2]);

//buying many stocks
console.log(JSusers[0].username+" Buying 1 stock in Tesla");
buyStock(JSusers[0], tesla, 1);
console.log(JSusers[0].username+" Buying 1 stock in Amazon");
buyStock(JSusers[0], amazon, 1);
console.log(JSusers[1].username+" Buying 2 stock in Tesla");
buyStock(JSusers[1], tesla, 2);
console.log(JSusers[2].username+" Buying stock in Tesla and 1 stock in amazon");
buyStock(JSusers[2], tesla, 1);
buyStock(JSusers[2], amazon, 1);
console.log(JSusers[2].username+" Buying stock in Tesla and 1 stock in amazon");
buyStock(JSusers[2], amazon, 1);
console.log("\nDisplaying users with newly bought stocks:");
console.log(JSusers[0]);
console.log(JSusers[1]);
console.log(JSusers[2]);

//selling stocks
console.log(JSusers[0].username+" Selling 1 stock in Tesla");
sellStock(JSusers[0], tesla, 1);
console.log(JSusers[0].username+" Selling 1 stock in Tesla");
sellStock(JSusers[0], tesla, 1);
console.log(JSusers[1].username+" Selling 2 stock in Tesla");
sellStock(JSusers[1], tesla, 2);
console.log(JSusers[2].username+" Selling 1 stock in Tesla");
sellStock(JSusers[2], tesla, 1);
console.log(JSusers[2].username+" Selling 1 stock in Amazon");
sellStock(JSusers[2], amazon, 1);
console.log("\nPrinting users after selling stocks")
console.log(JSusers[0]);
console.log(JSusers[1]);
console.log(JSusers[2]);

//adding to watch list
console.log(JSusers[0].username+" adding tesla stock to watch list");
addToWatchlist(JSusers[0], tesla);
addToWatchlist(JSusers[0], tesla);
//adding to watch list
console.log(JSusers[1].username+" adding tesla stock to watch list");
addToWatchlist(JSusers[1], tesla);
addToWatchlist(JSusers[1], amazon);
console.log("Printing users with watch list")
console.log(JSusers[0]);
console.log(JSusers[1]);

//removing watched stocks
console.log(JSusers[0].username+" removing tesla stock from watch list");
removeFromWatchlist(JSusers[0], tesla);
console.log(JSusers[0].username+" removing tesla stock from watch list");
removeFromWatchlist(JSusers[0], tesla);
console.log(JSusers[1].username+" removing tesla stock from watch list");
removeFromWatchlist(JSusers[1], tesla);
console.log(JSusers[1].username+" removing amazon stock from watch list");
removeFromWatchlist(JSusers[1], amazon);
console.log(JSusers[0]);
console.log(JSusers[1]);