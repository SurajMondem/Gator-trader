var express = require('express');
var router = express.Router();

async function dbsearchs(search,filter,order){
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'password', database: 'Website'});
    let rows;
    let likesearch = ("%" + search + "%");
    console.log(order);
    let orders="DESC";
    if(order==="1")
        orders="ASC";

    if(!filter){console.log("here");
        rows = await connection.execute('SELECT * FROM `Item` WHERE `Description` LIKE ? AND Status = ? ORDER BY price '+orders ,[likesearch,1]);
    }
    else{
        rows = await connection.execute('SELECT * FROM `Item` WHERE `Categories` = ? and `Description` LIKE ? AND Status= ? ORDER BY price '+orders ,[filter,likesearch,1]);
    }
    
    await connection.end();
    return rows;
}

async function dbsearch(search,filter){
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'password', database: 'Website'});
    let rows;
    let likesearch = ("%" + search + "%");
    if(!filter){
        rows = await connection.execute('SELECT * FROM `Item` WHERE `Description` LIKE ? AND Status = ?' ,[likesearch,1]);
    }
    else{
        rows = await connection.execute('SELECT * FROM `Item` WHERE `Categories` = ? and `Description` LIKE ? AND Status= ?' ,[filter,likesearch,1]);
    }
    await connection.end();
    return rows;
}

async function dbPriceFilter(search,order){
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'password', database: 'Website'});
    let rows;
    let likesearch = ("%" + search + "%");
    if(order==0){
        rows = await connection.execute('SELECT * FROM `Item` WHERE `Description` LIKE ? AND Status = ? ORDER by price DESC' ,[likesearch,1]);
    }
    else{
        rows = await connection.execute('SELECT * FROM `Item` WHERE `Categories` = ? and `Description` LIKE ? AND Status= ?  ORDER by price ASC' ,[filter,likesearch,1]);
    }
    await connection.end();
    return rows;
}

router.post('/searches', async function(req,res,next){
    var user = req.session.user;
    var filterMap = new Map();
    let filterparam = await req.body.filter;
    filterMap.set('A', "All");
    filterMap.set('E',"ELECTRONICS");
    filterMap.set('B',"books");
    filterMap.set('F',"furniture");
    filterMap.set('O',"Others");
    let filter = filterMap.get(filterparam);
    var search = await req.body.search;
    if(filter === "All"){
        console.log("I'm in here");
        filter = '';
    }
    //Store these in the session for price filtering, we will need to match the search
    req.session.currentcategory = filter;
    req.session.search = search;
    // console.log("Search",search);
    // console.log("Filter",filter);
    let dbsearchresult = await dbsearch(search,filter);
    let numitems = dbsearchresult[0].length;
    //This is how to access returned objects
    //console.log("Result: ", dbsearchresult[0]);
    req.session.searchData=search;
    req.session.filterData=filter;
    res.render('searchresults', { search:search,filter:filter,results : dbsearchresult[0], user : user, itemcount : numitems});
});

router.get('/pricefilter/:search', async function(req,res,next) {
    let user = req.session.user;
    let dbsearchresult = await dbsearchs(req.session.searchData,req.session.filterData,req.params.search);
    console.log(dbsearchresult[0]);
    let numitems = dbsearchresult[0].length;
    res.render('searchresults', { results : dbsearchresult[0], user : user, itemcount : numitems});
});

router.get('/pricefilter', async function(req,res,next) {
    let dbsearchresult = await dbPriceFilter('',req.params.order);
    let numitems = dbsearchresult[0].length;
    //This is how to access returned objects
    //console.log("Result: ", dbsearchresult[0]);
    res.render('searchresults', { results : dbsearchresult[0], user : user, itemcount : numitems});
});

module.exports = router;
