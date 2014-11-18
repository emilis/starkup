### tasks ----------------------------------------------------------------------

.PHONY:	build test all

build:\
	parser.js\
	dist/starkup-parser.js\


test:\

	node run-test.js tests/blocks/headings.mpc

all:\
	build\
	test\


### targets --------------------------------------------------------------------

parser.js:\
	starkup.pegjs\

	pegjs "$^" "$@"


dist/starkup-parser.js:\
	starkup.pegjs\

	pegjs --export-var "window.StarkupParser" "$^" "$@"
