i.js
====

Hello
-----

I have always admired IPython Notebook as the unique tool for interactive computing, however I was craving to be able to use a similar environment for JavaScript. There are a few reasons for that:

* First of all I often need to run JS experiments. While browser's console and JS REPL are the reasonable approximations of this, I was spoiled by the IPython iterative evaluation and ability to run repetitive experiments while modifying the parts that require such modifications.
* Second: matplotlib. Like seriously, IPython? I want to have d3.js. While this is possible to get D3 in IPython right now - it is, in my opinion, so convoluted that it kills the fun.
* Third, IPython Notebook is a unique tool that represents an amazing new paradigm for doing research and running experiments and it should be made available to the widest audience possible. If you do not know what is IPython yet - you are missing out, go see it yourself: http://ipython.org

Installation
-------------

1. Install node from http://nodejs.org if you have not done it yet
2. 'git clone https://github.com/mksenzov/i.js'
3. 'cd i.js'
4. 'npm install'
5. 'node app.js'
6. Browser, http://localhost:3000

Usage
-----

* Use Shift + Enter to evaluate the current cell
* Use Ctrl+S (Meta+S) to save the current i.js scrapbook
