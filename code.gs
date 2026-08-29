/* =========================================================
   RENOCal STOCK TAKE
   GOOGLE APPS SCRIPT BACKEND
========================================================= */

const SPREADSHEET_ID = ''; 
// Jika Code.gs dibuat melalui Extensions > Apps Script
// dalam Google Sheet yang sama, biarkan kosong.
//
// Jika Apps Script standalone:
// masukkan Spreadsheet ID di sini.


const SHEETS = {
  USERS: 'Users',
  PRODUCTS: 'Products',
  MOVEMENTS: 'Daily Movement',
  STOCKTAKE: 'Monthly Stock Take'
};


/* =========================================================
   DATABASE
========================================================= */

function getSpreadsheet(){

  if(SPREADSHEET_ID){

    return SpreadsheetApp.openById(
      SPREADSHEET_ID
    );

  }

  return SpreadsheetApp.getActiveSpreadsheet();

}


/* =========================================================
   SETUP
========================================================= */

function setup(){

  const ss = getSpreadsheet();


  createSheet(
    ss,
    SHEETS.USERS,
    [
      'ID',
      'Email',
      'PasswordHash',
      'Created'
    ]
  );


  createSheet(
    ss,
    SHEETS.PRODUCTS,
    [
      'ID',
      'UserID',
      'SKU',
      'Product',
      'Category',
      'Unit',
      'OpeningStock',
      'Rack',
      'Created',
      'Updated'
    ]
  );


  createSheet(
    ss,
    SHEETS.MOVEMENTS,
    [
      'ID',
      'UserID',
      'Date',
      'ProductID',
      'StockIn',
      'StockOut',
      'Note',
      'Created'
    ]
  );


  createSheet(
    ss,
    SHEETS.STOCKTAKE,
    [
      'ID',
      'UserID',
      'Month',
      'ProductID',
      'SystemBalance',
      'PhysicalCount',
      'Variance',
      'Note',
      'Created'
    ]
  );


  return {
    ok:true,
    message:'RenoCal database setup complete.'
  };

}


function createSheet(
  ss,
  name,
  headers
){

  let sheet =
    ss.getSheetByName(name);


  if(!sheet){

    sheet =
      ss.insertSheet(name);

  }


  if(
    sheet.getLastRow() === 0
  ){

    sheet
      .getRange(
        1,
        1,
        1,
        headers.length
      )
      .setValues([headers]);

    sheet
      .getRange(
        1,
        1,
        1,
        headers.length
      )
      .setFontWeight('bold');

    sheet.setFrozenRows(1);

  }

}


/* =========================================================
   WEB APP
========================================================= */

function doGet(){

  return ContentService
    .createTextOutput(
      JSON.stringify({
        ok:true,
        app:'RenoCal Stock Take',
        status:'online'
      })
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

}


/* =========================================================
   POST ROUTER
========================================================= */

function doPost(e){

  try{

    const data =
      JSON.parse(
        e.postData.contents
      );


    const action =
      data.action || '';


    switch(action){

      case 'register':
        return json(
          registerUser(data)
        );


      case 'login':
        return json(
          loginUser(data)
        );


      case 'getData':
        return json(
          getData(data)
        );


      case 'saveProduct':
        return json(
          saveProduct(data)
        );


      case 'deleteProduct':
        return json(
          deleteProduct(data)
        );


      case 'saveMovement':
        return json(
          saveMovement(data)
        );


      case 'deleteMovement':
        return json(
          deleteMovement(data)
        );


      case 'saveStockTake':
        return json(
          saveStockTake(data)
        );


      case 'deleteStockTake':
        return json(
          deleteStockTake(data)
        );


      case 'sync':
        return json(
          syncData(data)
        );


      default:

        return json({
          ok:false,
          error:'Unknown action.'
        });

    }

  }

  catch(error){

    return json({

      ok:false,

      error:
        error.message ||
        String(error)

    });

  }

}


/* =========================================================
   JSON RESPONSE
========================================================= */

function json(data){

  return ContentService
    .createTextOutput(
      JSON.stringify(data)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

}


/* =========================================================
   ID
========================================================= */

function makeId(){

  return Utilities
    .getUuid();

}


/* =========================================================
   PASSWORD HASH
========================================================= */

function hashPassword(password){

  const bytes =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(password),
      Utilities.Charset.UTF_8
    );


  return bytes
    .map(
      b =>
        (
          b < 0
            ? b + 256
            : b
        )
        .toString(16)
        .padStart(2,'0')
    )
    .join('');

}


/* =========================================================
   REGISTER
========================================================= */

function registerUser(data){

  const email =
    String(
      data.email || ''
    )
    .trim()
    .toLowerCase();


  const password =
    String(
      data.password || ''
    );


  if(!email){

    return {
      ok:false,
      error:'Email diperlukan.'
    };

  }


  if(password.length < 6){

    return {
      ok:false,
      error:
        'Password minimum 6 aksara.'
    };

  }


  const sheet =
    getSpreadsheet()
      .getSheetByName(
        SHEETS.USERS
      );


  const values =
    sheet.getDataRange()
      .getValues();


  for(let i=1;i<values.length;i++){

    if(
      String(values[i][1])
        .toLowerCase()
        === email
    ){

      return {
        ok:false,
        error:
          'Email sudah berdaftar.'
      };

    }

  }


  const id =
    makeId();


  sheet.appendRow([
    id,
    email,
    hashPassword(password),
    new Date()
  ]);


  return {

    ok:true,

    user:{
      id,
      email
    }

  };

}


/* =========================================================
   LOGIN
========================================================= */

function loginUser(data){

  const email =
    String(
      data.email || ''
    )
    .trim()
    .toLowerCase();


  const password =
    String(
      data.password || ''
    );


  const sheet =
    getSpreadsheet()
      .getSheetByName(
        SHEETS.USERS
      );


  if(!sheet){

    return {
      ok:false,
      error:
        'Database belum setup.'
    };

  }


  const values =
    sheet.getDataRange()
      .getValues();


  const hash =
    hashPassword(password);


  for(let i=1;i<values.length;i++){

    if(
      String(values[i][1])
        .toLowerCase()
        === email
      &&
      String(values[i][2])
        === hash
    ){

      return {

        ok:true,

        user:{
          id:String(values[i][0]),
          email:String(values[i][1])
        }

      };

    }

  }


  return {

    ok:false,

    error:
      'Email atau password salah.'

  };

}


/* =========================================================
   GET DATA
========================================================= */

function getData(data){

  const userId =
    String(
      data.userId || ''
    );


  if(!userId){

    return {
      ok:false,
      error:'User ID diperlukan.'
    };

  }


  return {

    ok:true,

    products:
      getUserProducts(userId),

    movements:
      getUserMovements(userId),

    stocktakes:
      getUserStocktakes(userId)

  };

}


/* =========================================================
   PRODUCTS
========================================================= */

function getUserProducts(userId){

  const sheet =
    getSpreadsheet()
      .getSheetByName(
        SHEETS.PRODUCTS
      );


  if(!sheet ||
     sheet.getLastRow() < 2){

    return [];

  }


  const values =
    sheet.getDataRange()
      .getValues();


  return values
    .slice(1)
    .filter(
      r => String(r[1]) === userId
    )
    .map(r => ({

      id:String(r[0]),

      sku:String(r[2]),

      name:String(r[3]),

      category:String(r[4]),

      unit:String(r[5]),

      opening:Number(r[6] || 0),

      rack:String(r[7] || ''),

      created:String(r[8] || ''),

      updated:String(r[9] || '')

    }));

}


/* =========================================================
   SAVE PRODUCT
========================================================= */

function saveProduct(data){

  const userId =
    String(
      data.userId || ''
    );


  if(!userId){

    return {
      ok:false,
      error:'User ID diperlukan.'
    };

  }


  const product =
    data.product || {};


  const id =
    product.id ||
    makeId();


  const sheet =
    getSpreadsheet()
      .getSheetByName(
        SHEETS.PRODUCTS
      );


  const values =
    sheet.getDataRange()
      .getValues();


  for(let i=1;i<values.length;i++){

    if(
      String(values[i][1]) === userId
      &&
      String(values[i][2])
        .toLowerCase()
        ===
      String(product.sku || '')
        .trim()
        .toLowerCase()
      &&
      String(values[i][0]) !== id
    ){

      return {
        ok:false,
        error:'SKU sudah digunakan.'
      };

    }

  }


  let row = -1;


  for(let i=1;i<values.length;i++){

    if(
      String(values[i][0]) === id
      &&
      String(values[i][1]) === userId
    ){

      row = i + 1;

      break;

    }

  }


  const now =
    new Date();


  const record = [

    id,

    userId,

    String(product.sku || '').trim(),

    String(product.name || '').trim(),

    String(product.category || '').trim(),

    String(product.unit || 'pcs'),

    Number(product.opening || 0),

    String(product.rack || '').trim(),

    row > 0
      ? values[row - 1][8]
      : now,

    now

  ];


  if(row > 0){

    sheet
      .getRange(
        row,
        1,
        1,
        record.length
      )
      .setValues([record]);

  }

  else{

    sheet.appendRow(record);

  }


  return {
    ok:true,
    product:record
  };

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

function deleteProduct(data){

  const userId =
    String(
      data.userId || ''
    );


  const id =
    String(
      data.id || ''
    );


  const ss =
    getSpreadsheet();


  const movementSheet =
    ss.getSheetByName(
      SHEETS.MOVEMENTS
    );


  const movementValues =
    movementSheet
      ? movementSheet
          .getDataRange()
          .getValues()
      : [];


  for(let i=1;i<movementValues.length;i++){

    if(
      String(movementValues[i][1])
        === userId
      &&
      String(movementValues[i][3])
        === id
    ){

      return {
        ok:false,
        error:
          'Product sudah mempunyai movement.'
      };

    }

  }


  const stockSheet =
    ss.getSheetByName(
      SHEETS.STOCKTAKE
    );


  const stockValues =
    stockSheet
      ? stockSheet
          .getDataRange()
          .getValues()
      : [];


  for(let i=1;i<stockValues.length;i++){

    if(
      String(stockValues[i][1])
        === userId
      &&
      String(stockValues[i][3])
        === id
    ){

      return {
        ok:false,
        error:
          'Product sudah mempunyai stock take.'
      };

    }

  }


  const sheet =
    ss.getSheetByName(
      SHEETS.PRODUCTS
    );


  const values =
    sheet.getDataRange()
      .getValues();


  for(let i=1;i<values.length;i++){

    if(
      String(values[i][0]) === id
      &&
      String(values[i][1]) === userId
    ){

      sheet.deleteRow(i + 1);

      return {
        ok:true
      };

    }

  }


  return {
    ok:false,
    error:'Product tidak dijumpai.'
  };

}


/* =========================================================
   MOVEMENTS
========================================================= */

function getUserMovements(userId){

  const sheet =
    getSpreadsheet()
      .getSheetByName(
        SHEETS.MOVEMENTS
      );


  if(!sheet ||
     sheet.getLastRow() < 2){

    return [];

  }


  const values =
    sheet.getDataRange()
      .getValues();


  return values
    .slice(1)
    .filter(
      r => String(r[1]) === userId
    )
    .map(r => ({

      id:String(r[0]),

      date:formatDate(r[2]),

      productId:String(r[3]),

      in:Number(r[4] || 0),

      out:Number(r[5] || 0),

      note:String(r[6] || ''),

      created:String(r[7] || '')

    }));

}


/* =========================================================
   SAVE MOVEMENT
========================================================= */

function saveMovement(data){

  const userId =
    String(
      data.userId || ''
    );


  const movement =
    data.movement || {};


  const productId =
    String(
      movement.productId || ''
    );


  if(!userId || !productId){

    return {
      ok:false,
      error:'Data movement tidak lengkap.'
    };

  }


  const sheet =
    getSpreadsheet()
      .getSheetByName(
        SHEETS.MOVEMENTS
      );


  const record = [

    movement.id ||
      makeId(),

    userId,

    String(
      movement.date ||
      formatDate(new Date())
    ),

    productId,

    Number(movement.in || 0),

    Number(movement.out || 0),

    String(movement.note || ''),

    new Date()

  ];


  sheet.appendRow(record);


  return {
    ok:true,
    movement:record
  };

}


/* =========================================================
   DELETE MOVEMENT
========================================================= */

function deleteMovement(data){

  return deleteById(
    SHEETS.MOVEMENTS,
    data.userId,
    data.id
  );

}


/* =========================================================
   STOCK TAKE
========================================================= */

function getUserStocktakes(userId){

  const sheet =
    getSpreadsheet()
      .getSheetByName(
        SHEETS.STOCKTAKE
      );


  if(!sheet ||
     sheet.getLastRow() < 2){

    return [];

  }


  const values =
    sheet.getDataRange()
      .getValues();


  return values
    .slice(1)
    .filter(
      r => String(r[1]) === userId
    )
    .map(r => ({

      id:String(r[0]),

      month:String(r[2]),

      productId:String(r[3]),

      system:Number(r[4] || 0),

      physical:Number(r[5] || 0),

      variance:Number(r[6] || 0),

      note:String(r[7] || ''),

      created:String(r[8] || '')

    }));

}


/* =========================================================
   SAVE STOCK TAKE
========================================================= */

function saveStockTake(data){

  const userId =
    String(
      data.userId || ''
    );


  const s =
    data.stocktake || {};


  const id =
    s.id ||
    makeId();


  const sheet =
    getSpreadsheet()
      .getSheetByName(
        SHEETS.STOCKTAKE
      );


  const values =
    sheet.getDataRange()
      .getValues();


  let row = -1;


  for(let i=1;i<values.length;i++){

    if(

      String(values[i][1])
        === userId

      &&

      String(values[i][2])
        === String(s.month)

      &&

      String(values[i][3])
        === String(s.productId)

    ){

      row = i + 1;

      break;

    }

  }


  const system =
    Number(
      s.system || 0
    );


  const physical =
    Number(
      s.physical || 0
    );


  const variance =
    physical - system;


  const record = [

    id,

    userId,

    String(s.month || ''),

    String(s.productId || ''),

    system,

    physical,

    variance,

    String(s.note || ''),

    new Date()

  ];


  if(row > 0){

    sheet
      .getRange(
        row,
        1,
        1,
        record.length
      )
      .setValues([record]);

  }

  else{

    sheet.appendRow(record);

  }


  return {

    ok:true,

    stocktake:record

  };

}


/* =========================================================
   DELETE STOCK TAKE
========================================================= */

function deleteStockTake(data){

  return deleteById(
    SHEETS.STOCKTAKE,
    data.userId,
    data.id
  );

}


/* =========================================================
   GENERIC DELETE
========================================================= */

function deleteById(
  sheetName,
  userId,
  id
){

  const sheet =
    getSpreadsheet()
      .getSheetByName(
        sheetName
      );


  if(!sheet){

    return {
      ok:false,
      error:'Sheet tidak dijumpai.'
    };

  }


  const values =
    sheet.getDataRange()
      .getValues();


  for(let i=1;i<values.length;i++){

    if(

      String(values[i][0])
        === String(id)

      &&

      String(values[i][1])
        === String(userId)

    ){

      sheet.deleteRow(i + 1);

      return {
        ok:true
      };

    }

  }


  return {

    ok:false,

    error:
      'Record tidak dijumpai.'

  };

}


/* =========================================================
   SYNC
========================================================= */

function syncData(data){

  const userId =
    String(
      data.userId || ''
    );


  if(!userId){

    return {
      ok:false,
      error:'User ID diperlukan.'
    };

  }


  return {

    ok:true,

    products:
      getUserProducts(userId),

    movements:
      getUserMovements(userId),

    stocktakes:
      getUserStocktakes(userId),

    syncedAt:
      new Date().toISOString()

  };

}


/* =========================================================
   DATE
========================================================= */

function formatDate(value){

  if(!value){

    return '';

  }


  if(
    Object.prototype
      .toString
      .call(value)
      === '[object Date]'
  ){

    return Utilities
      .formatDate(
        value,
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
      );

  }


  return String(value);

}
