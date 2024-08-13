https://cssnano.github.io/cssnano/docs/getting-started/

npm install cssnano postcss postcss-cli -g
without [ --save-dev]

save this:
module.exports = {
    plugins: [
        require('cssnano')({
            preset: 'default',
        }),
    ],
};

as a postcss.config.js file  in the root of npm
C:\Users\ashra\AppData\Roaming\npm\node_modules

minify with:
postcss input.css > output.css


