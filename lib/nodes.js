/// exports --------------------------------------------------------------------

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

/// functions ------------------------------------------------------------------

function Element( tagName, children, attr ){

    return new Node( Element, children, { tagName: tagName, attr: attr });
}///

function Indent( children, level ){

    return new Node( Indent, children, { level: level });
}///


function Node( nodeType, children, props ){

    this.nodeType =     nodeType;

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

function makeNodeType(){

    var fn = function( children, props ){

        return new Node( fn, children, props );
    };//

    return fn;
}///


