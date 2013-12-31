i.js
====

What  is [i.js](https://github.com/mksenzov/i.js)? It is is a browser-based tool that brings the style of computation pioneered by [IPython Notebook](http://ipython.org/notebook.html) to those of us who want to use JavaScript. 

If you have never seen IPython Notebook before, then you will unlikely find this explanation satisfactory. It seems to me that the easiest way to show what I mean is to quote the original IPython Notebook's documentation:

> The [IPython] Notebook [...] is [..] providing a web-based application suitable for capturing the whole computation process: developing, documenting, and executing code, as well as communicating the results. The IPython notebook combines two components:

> **A web application**: a browser-based tool for interactive authoring of documents which combine explanatory text, mathematics, computations and their rich media output.

> **Notebook documents**: a representation of all content visible in the web application, including inputs and outputs of the computations, explanatory text, mathematics, images, and rich media representations of objects.

As of now i.js has the following features:

* **Syntax highlight** and **Code auto-completion**
* **Basic management** of i.js documents (from this point on I will call them 'scrapbooks'): create, delete, rename.
* **REPL/server decoupling.** Each scrapbook has it's own JavaScript REPL attached. That means that when you use different scrapbooks they do not interfere. It also means that scrapbook evaluation environment is separated from the actual node.js server, so no matter what happens in a REPL session the core i.js server should be up and running.
* **Full execution flow control.** A scrapbook is essentially a collections of small JavaScript code snippets ('cells') that can be evaluated and edited independently. You have the full control of which cells should be executed and in what order. You can also edit and re-evaluate cells as you see fit, that allows one to run iterative experiments with a super-short feedback cycle.

How about a screenshot?
-----------------------

![i.js screenshot](http://i.imgur.com/jkadPJi.png?1 "i.js screenshot")

Why?
----

The following are my reasons for developing i.js:

* **Language.** As the name implies, IPython Notebook is heavily python-focused. I often need to run JS experiments. Although browser consoles and JS REPL are decent alternatives, I was looking for the IPython Notebook style of iterative computation and ability to run repetitive experiments.
* **Great model.** IPython Notebook is a unique tool that suggests an amazing paradigm for research and experimentation. It should be made available to the widest audience possible.
* **Matplotlib.** I want to have d3.js. While it seems possible to get D3-based grphics in IPython right now - it is, in my opinion, so convoluted that it kills the fun.


How it was built?
-----------------

i.js is built on top of:

1. [node.js](http://nodejs.org) + [express](http://expressjs.com/api.html) + [jade](http://jade-lang.com)
2. [Bootstrap](http://getbootstrap.com) as you can immediately see from the screenshot above
3. [REPL](http://nodejs.org/api/repl.html) for evaluating scrapbooks and getting code auto-completion hints
4. [CodeMirror](http://codemirror.net) for code syntax-highlight and auto-completion UI
5. [JQuery](http://jquery.com) for browser scripting

Installation
-------------

1. Install node from http://nodejs.org if you have not done it yet
2. Clone i.js from git: _git clone https://github.com/mksenzov/i.js_
3. Go to the cloned repo: _cd i.js_
4. Install all i.js dependencies: _npm install_
5. Start i.js server: _node app.js_
6. Now you can open i.js in the browser: http://localhost:3000

Usage
-----

**Shortcuts**

* Use _Shift+Enter_ to evaluate the current cell
* Use _Ctrl+Space_ to auto-complete the code
* Use _Ctrl+S_ (_Meta+S_) to save the current i.js scrapbook

**Special commands**

Use any of the following within i.js cells:

* _.break_ force complete current expression
* _.clear_ clear the context
* more details on [REPL doc page](http://nodejs.org/api/repl.html#repl_repl_features)
