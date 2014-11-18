### variables ------------------------------------------------------------------

D =	dist
L =	lib
T =	tests

### tasks ----------------------------------------------------------------------

.PHONY:	build test all

build:\
	$L/parser.js\
	$D/starkup-parser.js\


test:\

	find "$T" -type f -name \*.mpc -print0 | xargs -0 node run-test.js

all:\
	build\
	test\


### targets --------------------------------------------------------------------

$L/parser.js:\
	$L/starkup.pegjs\

	pegjs "$^" "$@"


$D/starkup-parser.js:\
	$L/starkup.pegjs\

	pegjs --export-var "window.StarkupParser" "$^" "$@"
