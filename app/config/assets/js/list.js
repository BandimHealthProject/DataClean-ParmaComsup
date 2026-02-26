/**
 * Responsible for rendering children to look up
 */
'use strict';

var children, reg, tab, displayTab;
function display() {
    console.log("List loading");
    reg = util.getQueryParameter('region');
    tab = util.getQueryParameter('tabanca');
    displayTab = util.getQueryParameter('assistant');
    
    console.log("Preparing list whith region = " + reg + " and tabanca = " + displayTab);
    // Set the header to region choosen

    var regionName = {1: "Oio", 2: "Biombo", 5: "Gabu", 7: "Cacheu", 8: "Bafata", 11: "Quinara", 12: "Tombali", 13: "Bubaque", 14: "Bolama", 15: "Sao Domingos", 16: "MSF Bafata"};
    var head = $('#main');
    head.prepend("<h1>" + regionName[reg] + " </br> <h3>" + displayTab);
    // populate list
    loadChildren();
}

function loadChildren() {
    // SQL to get children
    var varNames = "_id, _savepoint_type, DNASC, LMP_CARD, MOR, MUL, NOC, NOME, NOMEMAE, REG, REGDIA, REGIDC, REGIDMAE, TAB, VIFICHA "
    var sql = "SELECT " + varNames +
        " FROM ParmaComsup" + 
        " WHERE REG = " + reg + " AND TAB = " + tab + 
        " ORDER BY REGIDC";
    children = [];
    console.log("Querying database for children...");
    console.log(sql);
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " children");
        for (var row = 0; row < result.getCount(); row++) {
            var rowId = result.getData(row,"_id"); // row ID 
            var savepoint = result.getData(row,"_savepoint_type")
            var LMP_CARD = result.getData(row,"LMP_CARD");
            var VIFICHA = result.getData(row,"VIFICHA");
            var DNASC = result.getData(row,"DNASC");
            var MOR = result.getData(row,"MOR");
            var MUL = result.getData(row,"MUL");
            var NOC = result.getData(row,"NOC");
            var NOME = titleCase(result.getData(row,"NOME"));
            var NOMEMAE = titleCase(result.getData(row,"NOMEMAE"));
            var REG = result.getData(row,"REG");
            var REGDIA = result.getData(row,"REGDIA");
            var REGIDC = result.getData(row,"REGIDC");
            var REGIDMAE = result.getData(row,"REGIDMAE");
            var TAB = result.getData(row,"TAB");
            
            var p = { type: 'child', rowId, savepoint,  DNASC, LMP_CARD, MOR, MUL, NOC, NOME, NOMEMAE,  REG, REGDIA, REGIDC, REGIDMAE, TAB, VIFICHA };
            children.push(p);
        }
        console.log("Children:", children)
        populateView();
        return;
    }
    var failureFn = function( errorMsg ) {
        console.error('Failed to get children from database: ' + errorMsg);
        console.error('Trying to execute the following SQL:');
        console.error(sql);
        alert("Program error Unable to look up persons.");
    }
    odkData.arbitraryQuery('ParmaComsup', sql, null, null, null, successFn, failureFn);
}

function populateView() {
    var ul = $('#li');

    // list
    $.each(children, function() {
        var that = this;      
        
        // Check if already looked up
        var check = '';
            if (VIFICHA == 1 & LMP_CARD != null & savepoint == "COMPLETE") {
                check = "checked";
            };
 
        // set text to display
        var displayText = setDisplayText(that);

        // list
        ul.append($("<li />").append($("<button />").attr('id',this.rowId).attr('class', check + ' btn ' + this.type).append(displayText)));

        // Buttons
        var btn = ul.find('#' + this.rowId);
        btn.on("click", function() {
            openForm(that);
        })        
    });
}

function setDisplayText(child) {
    var dob;
    if (child.DNASC == "D:NS,M:NS,Y:NS" | child.DNASC === null) {
        dob = "Não Sabe";
    } else {
        dob = formatDate(child.DNASC);
    }

    var regdate;
    if (child.REGDIA == "D:NS,M:NS,Y:NS" | child.REGDIA === null) {
        regdate = "Não Sabe";
    } else {
        regdate = formatDate(child.REGDIA);
    }

    var displayText = "Reg: " + child.REG + "; Tab: " + child.TAB + "; Mor: " + child.MOR + "; Mul: " + child.MUL + "; Noc: " + child.NOC + "<br />" + 
        "Regidc: " + child.REGIDC + "; Regdia: " + regdate + "<br />" +
        "Nacimento: " + dob + "<br />" + 
        "Nomemãe: " + child.NOMEMAE;
    return displayText
}

function formatDate(adate) {
    var d = adate.slice(2, adate.search("M")-1);
    var m = adate.slice(adate.search("M")+2, adate.search("Y")-1);
    var y = adate.slice(adate.search("Y")+2);
    var date = d + "/" + m + "/" + y;
    return date;
}

function openForm(child) {
    console.log("Preparing form for ", child);
    var rowId = child.rowId;
    var tableId = 'ParmaComsup';
    var formId = 'ParmaComsup';

    odkTables.editRowWithSurvey(
        null,
        tableId,
        rowId,
        formId,
        null,);
}

function titleCase(str) {
    if (!str) return str;
    return str.toLowerCase().split(' ').map(function(word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }