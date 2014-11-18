/// initializer ----------------------------------------------------------------

{
    /// requirements -----------------------------------------------------------

    var _ =             require( "lodash" );
    var n =             require( "./nodes" );
    var util =          require( "./util" );

    var str =           util.str;

    /// variables --------------------------------------------------------------

    var rootNode =      n.Root();

    var lastLevel =     0;
    var levels =        [];

    /// functions --------------------------------------------------------------

    function addAtLevel( node, level ){

        var parentNode =    findParentNode( level );
        parentNode.children.push( node );
        lastLevel =         level;
        levels =            levels.slice( 0, level );
        levels[level] =     node;
    }///

    function findParentNode( level ){

        if ( !rootNode.children.length || level === 0 ){
            return rootNode;
        } else if ( lastLevel < level ){
            return levels[ lastLevel ];
        } else {
            while ( --level > 0 && !levels[level] ){}
            return levels[level];
        }
    }///
}

/// rules ----------------------------------------------------------------------

start
    =   val:( blockPart / emptyLine )+ & EOF
    {
        return rootNode;
        /// return val;
    }

emptyLine
    =   val:( indent / space )* nl:newLine
    {
        return n.EmptyLine( str( val.concat([ nl ])));
    }

blockPart
    =   ind:indent? val:( block endBlock )
    {
        var node =      val[0];
        var level =     ind && ind.level || 0;

        if ( node.nodeType === n.Element ){
            addAtLevel( node, level );
        } else if ( node.nodeType === n.GroupNode ){
            addAtLevel( n.Element( "p", node.children ), level );
        } else {
            throw Error( "Don't know how to add node of type " + node.nodeType );
        }
        /// return n.Block( val, { level: ind && ind.level || 0 });
    }

block
    =val:(
        jsBlock
        / jsExpr  
        / blockquote
        / h1 / h2 / h3 / h4 / h5 / h6
        / ulItem / olItem
        / codeBlock
        / doctype
        / commentTag
        / tag     
        / hr
        / inline )
    & endBlock
    {
        return val;
    }
    
inline
    =val:(
        jsBlockInline
        / jsExprInline
        / jsValue
        / strong
        / emphasis
        / strikethrough
        / inlineCode
        / inlineTag
        / pSpace
        / pNonSpace
        )+
    {
        return n.GroupNode( val );
    }

/// blocks ---------------------------------------------------------------------

h1 =        '#'         space+ val:inline   { return n.Element( "h1", val ); }
h2 =        '##'        space+ val:inline   { return n.Element( "h2", val ); }
h3 =        '###'       space+ val:inline   { return n.Element( "h3", val ); }
h4 =        '####'      space+ val:inline   { return n.Element( "h4", val ); }
h5 =        '#####'     space+ val:inline   { return n.Element( "h5", val ); }
h6 =        '######'    space+ val:inline   { return n.Element( "h6", val ); }

ulItem =    [-+*]       space+ val:inline   { return n.Element( "ul", [n.Element( "li", val )]); }

olItem =    digit+ '.'  space+ val:inline   { return n.Element( "ol", [n.Element( "li", val )]); }

blockquote= '>   '             val:inline   { return n.Element( "blockquote", val ); }

hr
    =   space* [*-] space* [*-] space* [*-] ( space / [*-] )*
    {
        return n.Element( "hr" );
    }

codeBlock
    = '```' type:cssWord* lineTerm val:codeLine* lineTerm '```'
    {
        if( type ){
            return n.Element( "pre", str( val ), { className: type });
        } else {
            return n.Element( "pre", str( val ));
        }
    }

codeLine
    =   emptyLine
    /   oneLine lineTerm
    /   oneLine oneLine lineTerm
    /   [^`] oneLine* lineTerm
    /   '`' [^`] pOneLine lineTerm
    /   '``' [^`] oneLine* lineTerm

/// inline ---------------------------------------------------------------------

strong
    =   [*_] val:emphasis [*_]
    {
        return n.Element( "strong", val && val.children || val );
    }

emphasis
    =   [*_] val:$[^*_]+ [*_] & notAWord
    {
        return n.Element( "em", val );
    }

strikethrough
    =   '~' val:$[^~]+ '~' & notAWord
    {
        return n.Element( "strike", val );
    }

inlineCode
    =   '`' val:$[^`]+ '`' &notAWord
    {
        return n.Element( "code", val );
    }

/// js blocks ------------------------------------------------------------------

jsBlock
    =   '{{:' val:jsCode '}}'
    {
        return n.JsBlock( val );
    }

jsExpr
    =   '{{=' val:jsCode '}}'
    {
        return n.JsExpr( val );
    }

jsValue
    =   '{{' val:jsCodeInline '}}'
    {
        return n.JsValue( val );
    }

jsBlockInline
    =   '{{:' val:jsCodeInline '}}'
    {
        return n.JsBlock( val );
    }

jsExprInline
    =   '{{=' val:jsCodeInline '}}'
    {
        return n.JsExpr( val );
    }

jsCode
    =   val:( '}'? [^}]+ )*
    {
        return str( val );
    }

jsCodeInline
    =   val:( '}'? [^}\u000A\u000D\u2028\u2029]+ )*
    {
        return str( val );
    }


/// tags -----------------------------------------------------------------------

tag
    =   '<' name:tagName id:tagId? classes:tagClass* attr:tagAttributes? cont:tagContent? '>'?
    {
        return n.Element( name, [], _.extend( attr, { id: id, className: classes.join( " " )}));
    }

inlineTag
    =   '<' name:tagName id:tagId? classes:tagClass* attr:tagAttributes? val:inlineTagContent* '>'
    {
        return n.Element( name, [], _.extend( attr, { id: id, className: classes.join( " " )}));
    }

tagName
    =   first:[a-zA-Z] next:[-a-zA-Z0-9:]*
    {
        return str( [first].concat( next ));
    }

tagId
    =   '#' val:pCssWord
    {
        return str( val );
    }

tagClass
    =   '.' val:pCssWord
    {
        return str( val );
    }

tagAttributes
    =   '(' allSpace* attr:tagAttribute* allSpace* ')'
    {
        return ( attr && attr.length ) ? _.zipObject( attr ) : {};
    }

tagAttribute
    =   ','? name:tagAttrValue allSpace+ value:tagAttrValue
    {
        return [ name, value ];
    }

tagAttrValue
    =   val:pNonSpace
    {
        return str( val );
    }
    /   '"' val:[^"]+ '"'
    {
        return str( val );
    }

tagContent
    =   space* val:inline
    {
        return val;
    }

inlineTagContent
    =   pSpace val:( jsExpr / jsValue / strong / emphasis / inlineTag / pSpace / $[^>]+ )+
    {
        return n.GroupNode( val );
    }

/// special tags ---------------------------------------------------------------

doctype
    =   '<!DOCTYPE' val:$[^>]+ '>'
    {
        return n.Doctype( val );
    }

commentTag
    =   '<!--' val:oneLine*
    {
        return n.Comment( "commentTag", val );
    }

/// special chars --------------------------------------------------------------

indent
    =   val:tab+
    {
        return n.Indent( val, val && val.length || 0 );
    }

tab
    =   '    '
    /   [\t]

endBlock
    =   newLine
    /   & EOF

newLine
    =   val:( "\r\n" / "\n\r" / "\n" / "\r" )
    {
        return n.TextNode( val );
    }

EOF =               !.

space =             [\u0009\u000B\u000C\u0020\u00A0\uFEFF]
pSpace =            $space+

lineTerm =          [\u000A\u000D\u2028\u2029]
pLineTerm =         $lineTerm+

oneLine =           [^\u000A\u000D\u2028\u2029]
pOneLine =          $oneLine+

allSpace =          space / lineTerm
pAllSpace =         $allSpace+

nonSpace =          [^\u0009\u000B\u000C\u0020\u00A0\uFEFF\u000A\u000D\u2028\u2029]
pNonSpace =         $nonSpace+

aWord =             [a-zA-Z0-9_]
pAWord =            $aWord+

notAWord =          [^a-zA-Z0-9_]
pNotAWord =         $notAWord+

digit =             [0-9]
pDigit =            $digit+

notDigit =          [^0-9]
pNotDigit =         $notDigit+

cssWord =           [-a-zA-Z0-9_]
pCssWord =          $cssWord+
