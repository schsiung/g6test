// This file is added into index.html and will wait for user's action.

// Each ast element has a unique number, each code element
// has a unique number which arranged by ast number, e.g.:
// code_1_20 means it point to ast_1 and ast_20.
// code_5 only point to one ast element ast_5.

var allLocation = new Array();
var codeFocus = "";
var astFocus = "";
var locNum = 0;
var regNumberOnly = /^\d+$/;

function traverseAST(ast, parentName) {
  var patternName = null;
  for (var key in ast) {
    if (typeof(ast[key]) == 'string') {
      if (key == "location") {
        var loc = ast[key].split(":");
        // location : "num1 : num2 : num3"
        if (loc.length == 3 && regNumberOnly.test(loc[0]) &&
            regNumberOnly.test(loc[1]) && regNumberOnly.test(loc[2])) {
          var astName = "ast_" + locNum.toString();
          allLocation.push( {rowStr :       loc[1],  columnStr :       loc[2],
                             row : parseInt(loc[1]), column : parseInt(loc[2]),
                             name : astName, astNum : locNum.toString(), parent : parentName} );
          // Unique location number. We increase it by 1 after find a new location.
          locNum++;
        }
      } else if (key == 'pattern') {
        patternName = ast[key];
        parentName = patternName;
        delete ast[key];
      }
    } else if (typeof(ast[key]) == 'object') {
      var pName = key;
      if (key == "record")
        pName = parentName;
      else if (regNumberOnly.test(key))
        pName = parentName + '[' + key + ']';
      var value = traverseAST(ast[key], pName);
      // if key is "record", we want to strip it.
      if (key == "record") {
        // pattern: xxx,
        // record: { ... }
        // So the "pattern" has an equal level with "record", specially handle it.
        // Here we rename the key "record" to the patternName:
        // "pattern: xxx" : { ... }
        if (patternName) {
          patternName = "pattern: " + patternName;
          ast[patternName] = value;
          delete ast[key];
          patternName = null;
        } else {
          // normal case:
          // xxx: {
          //   record: { ... }
          // }
          // after this assignment:
          // xxx: { ... }
          ast = value;
        }
      } else {
        ast[key] = value;
      }
    }
  }
  return ast;
}

// Remove all the '\n' and comments.
function decomment(source) {
  //                 /*  all-characters */ | \n
  // Here the \s after [\s\S] is to handle recursive c-style comment:
  // /* /*xxx*/ */
  // The last */ always follow a space.
  var re = new RegExp("^/\\*[\\s\\S]*?\\s\\*/|\\n", "gm");
  return source.replace(re, "")
}

function combineAllJsonIntoArray(source) {
  source = '[' + source + ']';
  // Add ',' for all top-level json object.
  var re = new RegExp("\}\{", "g");
  return source.replace(re, "},{");
}

// Parse AST from json.
function addASTTag(source) {
  if (source) {
    source = decomment(source);
    source = combineAllJsonIntoArray(source);

    var ast = JSON.parse(source);
    var ret = traverseAST(ast, ""/*parent*/);
    // Translate an original AST to render library format.
    // astToChart(ret);
  }
}

// Parse AST from json.
function getASTTag(source) {
  if (source) {
    source = decomment(source);
    source = combineAllJsonIntoArray(source);

    var ast = JSON.parse(source);
    var ret = traverseAST(ast, ""/*parent*/);
    return ret;
  }
}
