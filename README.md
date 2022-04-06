# Tilepieces - node version
This is the node version of the [tilepieces](https://tilepieces.net) application.
To start, you must have [node.js](https://nodejs.org) installed and then write in your terminal console
```
npm install tilepieces -g
```
Then navigate to the directory where you want to install the application.
Here you type
```
tilepieces install
```
to install the application. Use this command every time you want to update the application.
A page will open to you in your favorite browser.
Server port and host are set in [settings.json](https://github.com/tilepieces/tilepieces-node/blob/main/settings.json).
For subsequent times, just type
```
tilepieces
```
to start the application.

Note that the whole process can also be performed locally installing tilepieces as a package dependency, by installing tilepieces without the
`g` command:
```
npm install tilepieces
```
and using `npx` in your commands, like this
```
npx tilepieces install
```
```
npx tilepieces
```
For more info about different tilepieces applications, please visit [releases](https://tilepieces.net/releases.html).

