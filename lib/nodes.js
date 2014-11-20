/// exports --------------------------------------------------------------------

var types = "Root Block GroupNode EmptyLine TextNode JsBlock JsExpr JsValue Doctype Comment";

var api =   {
    Element:            Element,
    Indent:             Indent,
    Node:               Node,
};

module.exports =        types.split( " " ).reduce( addType, api );

/*
module.exports = {
    Element:            Element,
    Indent:             Indent,

    Root:               makeNodeType(),
    Block:              makeNodeType(),
    GroupNode:          makeNodeType(),
    EmptyLine:          makeNodeType(),
    TextNode:           makeNodeType(),
    JsBlock:            makeNodeType(),
    JsExpr:             makeNodeType(),
    JsValue:            makeNodeType(),
    Doctype:            makeNodeType(),
    Comment:            makeNodeType(),

    Node:               Node,
};
*/

/// functions ------------------------------------------------------------------

function Element( tagName, children, attr ){

    return new Node( "Element", Element, children, { tagName: tagName, attr: attr });
}///

function Indent( children, level ){

    return new Node( "Indent", Indent, children, { level: level });
}///


function Node( typeName, nodeType, children, props ){

    this.nodeType =     nodeType;
    this.nodeTypeName = typeName;

    if ( props ){
        for ( var k in props ){
            this[k] =   props[k];
        }
    }

    if ( !children ){
        this.children = [];
    } else if ( children instanceof Array ){
        this.children = children;
    } else {
        this.children = [ children ];
    }
}///

/// private functions ----------------------------------------------------------

function addType( api, typeName ){

    api[typeName] =     makeNodeType( typeName );
    return api;
}///

function makeNodeType( typeName ){

    var fn = function( children, props ){

        return new Node( typeName, fn, children, props );
    };//

    return fn;
}///


