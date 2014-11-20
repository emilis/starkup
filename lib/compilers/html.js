/// requirements ---------------------------------------------------------------

var nodes =             require( "../nodes" );

/// exports --------------------------------------------------------------------

module.exports =        nodesToHtml;

/// functions ------------------------------------------------------------------

function nodesToHtml( node ){

    if( !node ){
        return "";
    } else if ( typeof( node ) === "string" || node instanceof String ){
        return node;
    } else if ( node instanceof Array ){
        return node.map( nodesToHtml ).join( "" );
    } else {
        return nodeToHtml( node );
    }
}///


function nodeToHtml( node ){

    switch( node.nodeType ){

        case nodes.Element:

            return getOpenTag( node ) + nodesToHtml( node.children ) + getCloseTag( node );
            break;

        case nodes.JsValue:

            return quoteHtml( eval( node.children[0] ));
            break;

        case nodes.JsExpr:

            return eval( node.children[0] );
            break;

        case nodes.GroupNode:
        default:

            return node.children.map( nodesToHtml ).join( "" );
    }
}///


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

function quoteAttrName( str ){

    return str.replace( /[^a-z0-9]/ig, "-" );
}///

function quoteAttrValue( str ){

    return str
        .replace( /&/g, "&amp;" )
        .replace( /</g, "&lt;" )
        .replace( />/g, "&gt;" )
        .replace( /"/g, "&quot;" );
}///

function quoteHtml( str ){

    return str
        .replace( /&/g, "&amp;" )
        .replace( /</g, "&lt;" )
        .replace( />/g, "&gt;" );
}///

