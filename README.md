i.js
====

What  is i.js? i.js is a browser-based tool that hopes to become IPython Notebook for JavaScript one day, when it grows up. i.js allows you to:

* Create and manage multiple scrapbooks where you can experiment with JavaScript code snippets
* Each code snippet in a scrapbook has it is own cell, you have the full control of what cells should be executed and in which order. At any given moment you can go to a previous cell, update the snippet and re-evaluate it.
* Each scrapbook is executed in it's very own node REPL, so they do not interfere. These node REPLs are separate from the actual node.js server, so no matter what happens in the REPL session the server will be up and running.
* JavaScript code has syntax highlight.

Why?
----

IPython Notebook is an amazing utility for interactive computing. As the name implies, IPython is heavily python-focused and I wanted to have a similar environment for JavaScript. The following are my reasons for developing this tool:

* I often need to run JS experiments. Although browser consoles and JS REPL are decent alternatives, I was spoiled by the IPython iterative evaluation and ability to run repetitive experiments while modifying the parts of code that require modifications.
* matplotlib. Like seriously, IPython, dude? I want to have d3.js. While this is possible to get D3 in IPython right now - it is, in my opinion, so convoluted that it kills the fun.
* IPython Notebook is a unique tool that represents an amazing new paradigm for research and experimentation. It should be made available to the widest audience possible. If you do not know what is IPython yet - you are missing out. Check it out for yourself: http://ipython.org

![i.js screenshot](http://i.imgur.com/jkadPJi.png?1 "i.js screenshot")

Installation
-------------

1. Install node from http://nodejs.org if you have not done it yet
2. _git clone https://github.com/mksenzov/i.js_
3. _cd i.js_
4. _npm install_
5. _node app.js_
6. Browser: http://localhost:3000

Usage
-----

* Shortcuts
  * Use Shift+Enter to evaluate the current cell
  * Use Ctrl+S (Meta+S) to save the current i.js scrapbook
* Special commands (see http://nodejs.org/api/repl.html for details)
  * .break force complete current expression
  * .clear clear the context
