import G6 from '@antv/g6';


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












function generateTreeNodesFromProperties(object) {
  let node = {id:"", children:[]}
  if (object == null ) {
    return;
  }

  // For string property, just render as tree node
  if (typeof object == 'string') {
    node.id = object;
    return node;
  }

  // For object with complex properties, get properties as childrens
  for (const key of Object.keys(object)) {
    if (object.hasOwnProperty(key)) {
      const propertyValue = object[key];
      if (Array.isArray(propertyValue)) {
        for (const iterator of propertyValue) {
          printPropertyRecusively(iterator);
        }
      } else {
        console.log(propertyValue);
        printPropertyRecusively(propertyValue);
      }
    }
  }
}
function printPropertyRecusively(object) {
  if (object == null) {
    return;
  }
  if (typeof object == 'string') {
    console.log(object);
    return;
  }
  for (const key of Object.keys(object)) {
    if (object.hasOwnProperty(key)) {
      const propertyValue = object[key];
      if (Array.isArray(propertyValue)) {
        for (const iterator of propertyValue) {
          printPropertyRecusively(iterator);
        }
      } else {
        console.log(propertyValue);
        printPropertyRecusively(propertyValue);
      }
    }
  }
}

function  translateJSONObject(object){
  console.log(JSON.stringify(object));
  //printPropertyRecusively(object);
  var ret = {
    id: "Regression",
    name: "Froda Bagins",
    children: [
      { id: "Multiple linear regression" },
      { id: "Partial least squares" },
      { id: "Multi-layer feedforward neural network" },
      { id: "General regression neural network" },
      { id: "Support vector regression" }
    ]
  }
    return ret;
}

function getGraphData(data) {
  const width = 800;
  const height = 800;

  const graph = new G6.TreeGraph({
    container: 'container',
    width,
    height,
    linkCenter: true,
    modes: {
      default: [
        {
          type: 'collapse-expand',
          onChange: function onChange(item, collapsed) {
            const data = item.get('model').data;
            data.collapsed = collapsed;
            return true;
          },
        },
        'drag-canvas',
        'zoom-canvas',
      ],
    },
    defaultNode: {
      size: 36,
      anchorPoints: [
        [0, 0.5],
        [1, 0.5],
      ],
      style: {
        fill: '#C6E5FF',
        stroke: '#5B8FF9',
      },
    },
    defaultEdge: {
      type: 'cubic-vertical',
      style: {
        stroke: '#A3B1BF',
      },
    },
    layout: {
      type: 'compactBox',
      direction: 'TB',
      getId: function getId(d) {
        return d.id;
      },
      getHeight: function getHeight() {
        return 16;
      },
      getWidth: function getWidth() {
        return 16;
      },
      getVGap: function getVGap() {
        return 80;
      },
      getHGap: function getHGap() {
        return 20;
      },
    },
  });

  graph.node(function (node) {
    let position = 'right';
    let rotate = 0;
    if (!node.children) {
      position = 'bottom';
      rotate = Math.PI / 2;
    }
    return {
      label: node.id,
      labelCfg: {
        position,
        offset: 5,
        style: {
          rotate,
          textAlign: 'start',
        },
      },
    };
  });

  return graph;
}

fetch('t.json').then(response => response.text())
  .then((ast_text) => {
    //console.log(ast_text);
    var json = getASTTag(ast_text);
    // console.log(json);
    var data = translateJSONObject(json);
    var graph = getGraphData(data);
    graph.data(data);
    graph.render();
    graph.fitView();

}).catch(error=>{
  console.error(error)
})


// fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/algorithm-category.json')
//   .then((res) => res.json())
//   .then((data) => {
//     const width = document.getElementById('container').scrollWidth;
//     const height = document.getElementById('container').scrollHeight || 1500;
//     var graph = getGraphData(data);
//     graph.data(data);
//     graph.render();
//     graph.fitView();
//   });
