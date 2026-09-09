/* Southern Stock Take -> Google Sheets mirror
 * Deploy as Web app: Execute as Me, access Anyone.
 * The frontend sends the Spreadsheet ID stored in its settings.
 */
function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents || '{}');
    if (p.action !== 'sync') throw new Error('Unknown action');
    if (!p.spreadsheetId) throw new Error('Missing spreadsheetId');
    var ss = SpreadsheetApp.openById(p.spreadsheetId);
    writeSheet_(ss, 'Products', p.products || []);
    writeSheet_(ss, 'Movements', p.movements || []);
    writeSheet_(ss, 'Stock Takes', p.stocktakes || []);
    writeSheet_(ss, 'Activity', p.activity || []);
    return json_({ok:true, syncedAt:new Date().toISOString()});
  } catch (err) { return json_({ok:false,error:String(err.message || err)}); }
}
function writeSheet_(ss, name, rows) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  if (!rows.length) { sh.getRange(1,1).setValue('No data'); return; }
  var keys = [];
  rows.forEach(function(r){ Object.keys(r).forEach(function(k){ if(keys.indexOf(k)<0) keys.push(k); }); });
  var values = [keys].concat(rows.map(function(r){return keys.map(function(k){return r[k] == null ? '' : r[k];});}));
  sh.getRange(1,1,values.length,keys.length).setValues(values);
  sh.getRange(1,1,1,keys.length).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1,keys.length);
}
function json_(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
