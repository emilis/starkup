/// requirements ---------------------------------------------------------------

var assert =            require( "assert" );

var nodes =             require( "../nodes" );

/// constants ------------------------------------------------------------------

var SEP =               ","; /// Separator for generated tokens

/// variables ------------------------------------------------------------------

var stringify =         JSON.stringify;

/// exports --------------------------------------------------------------------

module.exports =        nodesToTemplate;

/// functions ------------------------------------------------------------------

function nodesToTemplate( rootNode ){

    assert.equal( rootNode.nodeType, nodes.Root, "You must pass Root node to " + module.id );

    var tplCode =       nodeToEjs( rootNode );
    /// console.log( "===\n" + tplCode + "\n===" );
    var tplFn =         Function( "_runBlock", "_quoteHtml", "args", tplCode );

    return tplFn.bind( this, runJsBlock, quoteHtml );
}///


function valueToEjs( value ){

    if( !value ){
        return "''";

    } else if ( typeof( value ) === "string" || value instanceof String ){
        return stringify( value );

    } else if ( value instanceof Array ){
        return value.map( valueToEjs ).join( SEP );
    
    } else {
        return nodeToEjs( value );
    }
}///


function nodeToEjs( node ){
    switch( node.nodeType ){

        case nodes.Root:

            return 'with( args ){ return [' + node.children.map( valueToEjs ).join( SEP ) + '].join( "" ); }';
            break;

        case nodes.Element:

            return stringify( getOpenTag( node )) + SEP + node.children.map( valueToEjs ).join( SEP ) + SEP + stringify( getCloseTag( node ));
            break;

        case nodes.JsValue:

            return "_quoteHtml(" + node.children[0] + ")";
            break;

        case nodes.JsExpr:

            var jsCode =        node.children[0];
            var childNodes =    node.children.slice( 1 );
            return "_runBlock(function(){ var children=[" + childNodes.map( nodeToJsChild ).join( SEP ) + "]; var firstChild=children[0]; return " + jsCode + ";})";
            break;

        case nodes.GroupNode:

            return node.children.map( valueToEjs ).join( SEP );
            break;

        default:
            throw Error( "Don't know how to convert node (" + node.nodeTypeName + ") to EJS code." );
    }
}///

/// js block functions ---------------------------------------------------------

function nodeToJsChild( node ){

    return "function( args ){ with( args ){ return [" + valueToEjs( node ) + "].join( '' );}}";
}///

function runJsBlock( fn ){

    var result =    fn();
    if ( result instanceof Array ){
        return result.join( "" );
    } else {
        return result;
    }
}///

/// tag generation -------------------------------------------------------------

function getOpenTag( node ){

    var result =        [ '<', node.tagName ];
    var attr =          node.attr;

    for ( var k in attr ){
        switch( k ){

            case "classList":
                if ( attr.classList && attr.classList.length ){
                    result.push( ' class="', quoteAttrValue( attr.classList.join( " " )), '"' );
                }
                break;

            default:
                if ( attr[k] !== undefined ){
                    result.push( ' ', quoteAttrName( k ), '="', quoteAttrValue( attr[k] ), '"' );
                }
        }
    }

    result.push( '>' );

    return result.join( "" );
}///

function getCloseTag( node ){

    return '</' + node.tagName + '>';
}///

/// escaping HTML --------------------------------------------------------------

function quoteAttrName( str ){

    return toString( str ).replace( /[^a-z0-9]/ig, "-" );
}///

function quoteAttrValue( str ){

    return toString( str )
        .replace( /&/g, "&amp;" )
        .replace( /</g, "&lt;" )
        .replace( />/g, "&gt;" )
        .replace( /"/g, "&quot;" );
}///

function quoteHtml( str ){

    return toString( str )
        .replace( /&/g, "&amp;" )
        .replace( /</g, "&lt;" )
        .replace( />/g, "&gt;" );
}///


function toString( value ){

    if( typeof( value ) === "string" || value instanceof String ){
        return value;
    } else {
        return value.toString();
    }
}///
