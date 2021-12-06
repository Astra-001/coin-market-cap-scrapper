"use Strict";

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();


// Getting Port value According to Enviroment
let port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log("Server running port "+port);
});

//initialization Of Range 
let first = 0;
let second = 10;

/**
 *  Single Page DomainName/
 */

app.get('/',  async function (req, res) {
    let data = await single_page_call(first, second);
	
	// Infinite url point
    if( Array.isArray(data) && data.length < 10 ){
        second = 0;
    }

    first = second;
    second +=10; 
    res.json(data);
});


/**
 *  Upcoming Page domain/upcoming
 */

app.get('/upcoming',  async function (req, res) {
    let data = await upcoming_calledback().then( (upcoming_single_data)=> {
        return upcoming_single_data;
    }).catch(error => {
        res.json(error);
    });
    res.json(data);
});

/**
 * Single Page callback Method
 **/
async function single_page_call(first,sec){
    let ico_list = [];
    try {

        let coin_slug_name = [];

        await axios.get('https://api.coinmarketcap.com/data-api/v3/ico/search?status=Ongoing&start=1&limit=100').then( (response)=> {
            response.data.data.icoList.map( (item)=>{
                coin_slug_name.push(item.crypto.slug);
            });
  
        }).catch(error =>{
                   return error;
        });

        await axios.get('https://api.coinmarketcap.com/data-api/v3/ico/search?status=Upcoming&start=1&limit=100').then( (response)=> {
            response.data.data.icoList.map( (item)=>{
                coin_slug_name.push(item.crypto.slug);
            });
  
        }).catch(error =>{
                   return error;
        });

        await axios.get('https://api.coinmarketcap.com/data-api/v3/ico/search?status=Upcoming&start=1&limit=100').then( (response)=> {
            response.data.data.icoList.map( (item)=>{
                coin_slug_name.push(item.crypto.slug);
            });
  
        }).catch(error =>{
                   return error;
        });

        await axios.get('https://api.coinmarketcap.com/data-api/v3/ico/search?status=Ended&start=1&limit=700').then( (response)=> {
            response.data.data.icoList.map( (item)=>{
                coin_slug_name.push(item.crypto.slug);
            });
  
        }).catch(error =>{
                   return error;
        });
        const unique = (value, index, self) => {
            return self.indexOf(value) === index
        }          

        const filtered_slug_name = coin_slug_name.filter(unique);
        let slug_range = filtered_slug_name.slice(first,sec);

         for await (const iterator of slug_range) {
            await axios.get('https://coinmarketcap.com/currencies/'+iterator+'/ico/').then( (response)=> {
            const $ = cheerio.load(response.data);
            let scrp = $('script[type=application/json]');
            let scrpedobj = JSON.parse(scrp[0].children[0].data);
               ico_list.push(scrpedobj.props.initialProps.pageProps);
            }).catch(error =>{
               return error;
            });
        }
        return ico_list; 
    } catch (error) {
        console.error(error);
    }
}

/**
 * Upcoming Page Call Back Method
 **/

async function upcoming_calledback(){
    let ico_list = [];

    try {
        let coin_slug_name = [];

        await axios.get('https://api.coinmarketcap.com/data-api/v3/ico/search?status=Upcoming&start=1&limit=100').then( (response)=> {
            response.data.data.icoList.map( (item)=>{
                coin_slug_name.push(item.crypto.slug);
            });
        }).catch(error =>{
            return error;
        });

        const unique = (value, index, self) => {
            return self.indexOf(value) === index
        }          

        const filtered_slug_name = coin_slug_name.filter(unique);

         for await (const iterator of filtered_slug_name) {
            await axios.get('https://coinmarketcap.com/currencies/'+iterator+'/ico/').then( (response)=> {
            const $ = cheerio.load(response.data);
            let scrp = $('script[type=application/json]');
            let scrpedobj = JSON.parse(scrp[0].children[0].data);
               ico_list.push(scrpedobj.props.initialProps.pageProps);
            }).catch(error =>{
               return error;
            });
        }
        return ico_list; 

    } catch (error) {
        console.error(error);
    }
    

}




