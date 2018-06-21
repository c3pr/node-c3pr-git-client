[![Build Status](https://travis-ci.org/c3pr/node-git-client.svg?branch=master)](https://travis-ci.org/c3pr/node-git-client)

# node-git-client

Node.js layer on top of shell git command line.

Have a look at [`src`](src) folder to understand what functions are available.

### Usage:

```bash
# Check https://github.com/c3pr/node-git-client/releases for the latest tag
npm i -S c3pr/node-git-client#<LATEST TAG>
```

Example at a JavaScript file:

```javascript
const cloneRepositoryLocally = require("node-git-client").cloneRepositoryLocally;

(async () => {

    const cloneFolder = await cloneRepositoryLocally({
        ... 
    });

    ...

})();
```