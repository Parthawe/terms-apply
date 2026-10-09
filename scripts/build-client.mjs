import {build} from 'esbuild';
await build({entryPoints:['arena/client.mjs'],bundle:true,minify:true,format:'esm',outfile:'arena/client.bundle.js'});

await build({entryPoints:['arena/private-client.mjs'],bundle:true,minify:true,format:'esm',outfile:'arena/private-client.bundle.js'});
