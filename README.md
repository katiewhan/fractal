## Online Fractal Generation for DIMENSION

### To build and test:
If you do not have the up-to-date dependencies, first run
```
npm install
```
Then,
```
npm run dev
```
This will start a local server. Go to `localhost:1234` on a browser to load the page. Afterwards, you can simply update the TypeScript / HTML files and save to see your changes.

### To build and deploy:
To clean out existing build files, first run
```
npm run clean
```
Then,
```
npm run build
npm run deploy
```
This will publish the build files to the `gh-pages` branch for GitHub Pages to host the site. The deployed site is currently available at [katiewhan.github.io/fractalWeb](https://katiewhan.github.io/fractalWeb/).

### To add an asset:
First, if you have not already, follow steps "To build and test" to get the site up locally. You should now see a folder called `dist` locally, next to `src`. Copy and paste the asset file inside `dist`, and refer to it by its name in code. For example, if you have a file `dist/foo.txt`, you can read it like so:
```
fs.readFileSync('foo.txt')
``` 
