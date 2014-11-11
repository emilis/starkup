/// initializer ----------------------------------------------------------------

{

    var _ =             require( "lodash" );

    function str( val ){

        if ( val instanceof Array ){
            return _.flatten( val ).join( "" );
        } else if ( typeof( val ) === "string" ){
            return val;
        } else {
            return val && val.toString() || "";
        }
    }///
   
    function Node( type, children, options ){

        var node =          { type: type };
        
        if ( options ){
            for ( var k in options ){
                node[k] =   options[k];
            }
        }

        if ( !children ){
            node.children = [];
        } else if ( children instanceof Array ){
            node.children = children;
        } else {
            node.children = [ children ];
        }

        return node;
    }///

    function StringNode( type, children, options ){

        return Node( type, str( children ), options );
    }///
}

/// rules ----------------------------------------------------------------------

start
    =   ( blockPart / emptyLine )+ & EOF

blockPart
    =   ind:indent? val:( block endBlock )
    {
        return Node( "blockPart", val, { level: ind && ind.level || 0 });
    }

/// blocks ---------------------------------------------------------------------

block
    =val:(  jsBlock
        /   jsExpr  
        /   jsValue 
        /   blockquote
        /   h1 / h2 / h3 / h4 / h5 / h6
        /   ulItem / olItem
        /   codeBlock
        /   tag     
        /   hr
        /   inline )
    & endBlock
    {
        return val;
    }
    
h1 =        '#'         space+ val:inline   { return Node( "h1", val ); }
h2 =        '##'        space+ val:inline   { return Node( "h2", val ); }
h3 =        '###'       space+ val:inline   { return Node( "h3", val ); }
h4 =        '####'      space+ val:inline   { return Node( "h4", val ); }
h5 =        '#####'     space+ val:inline   { return Node( "h5", val ); }
h6 =        '######'    space+ val:inline   { return Node( "h6", val ); }

ulItem =    [-+*]       space+ val:inline   { return Node( "ulItem", val ); }

olItem =    digit+ '.' space+ val:inline    { return Node( "olItem", val ); }

blockquote= '>   '             val:inline   { return Node( "blockquote", val ); }

codeBlock
    = '```' type:cssWord* lineTerm val:codeLine* lineTerm '```'
    {
        return Node( "codeBlock", str( val ), { type: type });
    }

codeLine
    =   emptyLine
    /   oneLine lineTerm
    /   oneLine oneLine lineTerm
    /   [^`] oneLine* lineTerm
    /   '`' [^`] pOneLine lineTerm
    /   '``' [^`] oneLine* lineTerm

hr
    =   space* [*-] space* [*-] space* [*-] ( space / [*-] )*
    {
        return Node( "hr" );
    }

/// inline ---------------------------------------------------------------------

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
        return Node( "inline", val );
    }

strong
    =   [*_] val:emphasis [*_]
    {
        return Node( "strong", val && val.children || val );
    }

emphasis
    =   [*_] val:$[^*_]+ [*_] & notAWord
    {
        return Node( "emphasis", val );
    }

strikethrough
    =   '~' val:$[^~]+ '~' & notAWord
    {
        return Node( "strikethrough", val );
    }

inlineCode
    =   '`' val:$[^`]+ '`' &notAWord
    {
        return Node( "inlineCode", val );
    }

/// js blocks ------------------------------------------------------------------

jsBlock
    =   '{{:' val:jsCode '}}'
    {
        return StringNode( "jsBlock", val );
    }

jsExpr
    =   '{{=' val:jsCode '}}'
    {
        return StringNode( "jsExpr", val );
    }

jsValue
    =   '{{' val:jsCodeInline '}}'
    {
        return StringNode( "jsValue", val );
    }

jsBlockInline
    =   '{{:' val:jsCodeInline '}}'
    {
        return StringNode( "jsBlockInline", val );
    }

jsExprInline
    =   '{{=' val:jsCodeInline '}}'
    {
        return StringNode( "jsExprInline", val );
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
    =   '<' name:tagName id:tagId? classes:tagClass* attr:tagAttributes? cont:tagContent? '>'? {

            return Node( "tag", cont, {
                name:       name,
                id:         id,
                classes:    classes,
                attributes: attr,
            });
        }

inlineTag
    =   '<' name:tagName id:tagId? classes:tagClass* attr:tagAttributes? val:inlineTagContent* '>'
    {
        return Node( "tag", val, {
            name:       name,
            id:         id,
            classes:    classes,
            attributes: attr,
        });
    }

tagName
    =   first:[a-zA-Z] next:[-a-zA-Z0-9:]*
    {
        return str( [first].concat( next ));
    }

tagId
    =   '#' val:pCssWord {

            return str( val );
        }

tagClass
    =   '.' val:pCssWord {

            return str( val );
        }

tagAttributes
    =   '(' allSpace* tagAttribute* allSpace* ')'

tagAttribute
    =   ','? name:tagAttrValue allSpace+ value:tagAttrValue {
            return StringNode( name, value );
        }

tagAttrValue
    =   val:pNonSpace
        {   return str( val ); }
    /   '"' val:[^"]+ '"'
        {   return str( val ); }

tagContent
    =   space* val:inline
    {
        return val;
    }

inlineTagContent
    =   pSpace val:( jsExpr / jsValue / strong / emphasis / inlineTag / pSpace / $[^>]+ )+
    {
        return Node( "inline", val );
    }

/// special chars --------------------------------------------------------------

indent
    =   val:tab+
    {
        return Node( "indent", val, { level: val && val.length || 0 });
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
        return Node( "newLine", val );
    }

emptyLine
    =   val:( indent / space )* nl:newLine
    {
        return Node( "emptyLine", val.concat([ nl ]));
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
