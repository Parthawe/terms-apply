import {build} from 'esbuild';
await build({entryPoints:['arena/client.mjs'],bundle:true,minify:true,format:'esm',outfile:'arena/client.bundle.js'});
