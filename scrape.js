const puppeteer = require("puppeteer");
const {insertProductsCarmella} = require('./carmellaModule.js')
// const db = require("knex")({
//     client: 'pg',
//     connection: {
//     port:'5432',
//       host: '127.0.0.1',
//       user: 'postgres',
//       password: 'Victorjobe10',
//       database: 'carmella',
//     },
//   });


  let URLs=['https://www.carmella.co.il/product-category/ירקות/']
  async function scrapeCarmella(){
    for( let i = 0 ; i < URLs.length ; i++){
        let browser = await puppeteer.launch({ headless: false });
        let page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);
        try{
            await page.goto(URLs[i]);
    
        }catch(err){
            console.log(err)
        }
        await page.setViewport({
            width: 1200,
            height: 800
        });
        await delay(3000)
        console.log('page is : '+URLs[i])
        await autoScroll(page);


        const data = await page.evaluate(()=>{
            const list=[]
            let products = document.querySelectorAll('.product_wrap.col-lg-2.col-md-3.col-sm-4.col-xs-6.product_item.product_item_data.product_wrap_big_2')
            for(let i = 0 ; i < products.length ; i++){
                let id;
                try{
                   id=products[i].getAttribute('data-product-id')
                }catch(err){
                    console.log(err)
                }
                let name;
                try{
                    if(products[i].querySelector('.pr_title_note') === null){
                        name = products[i].querySelector('.pr_title').innerText

                    }else{
                        let name1 = products[i].querySelector('.pr_title').innerText
                        let name2 = products[i].querySelector('.pr_title_note').innerText
                        name = `${name1} ${name2}`
                    }
                }
                catch(err){
                    console.log(err)
                }
                let price;
                try{
                    let targetPriceArr = products[i].querySelector('.pr_row_price').innerText.split('\n')
                    if(targetPriceArr.length === 2){
                        let noSlash = targetPriceArr[1].replaceAll('/' , '')
                        price = `${targetPriceArr[0]} ${noSlash}`
                    }
                    if(targetPriceArr.length === 3){
                        let noSlash = targetPriceArr[1].replaceAll('/' , '')
                        price = `${targetPriceArr[0]} ${noSlash}`
                    }

                }catch(err){
                    console.log(err)
                }

                let img;
                try{
                    img = products[i].querySelector('.product_img').children[0].getAttribute('src').replaceAll("'","")
                }catch(err){
                    console.log(err)
                }

                list.push({id:id , name:name , price : price , img:img})




            }
            return list 

        });
        console.log(data)
        await insertProductsCarmella(data)
        // await browser.close();

    }
    console.log('*******FINISHED********')
  }

  scrapeCarmella()





 //Function to scroll to bottom of the page and load all items in it
 async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}


function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }