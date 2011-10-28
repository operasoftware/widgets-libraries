## Widget Chrome Library

Once you go through this developer guide you should be able to make widgets using the WCL (Widget Chrome Library). By using the library the widgets will be resizable and work on multiple platforms giving the user the best possible user experience on any device.

<h2 class="title" style="border-top:1px dotted #999;margin-top:1em;padding-top:1em;">WCL developer guide</h2><div class="article">###Contents

<ol class="toc">
    <li><a href="#Introduction">Introduction</a></li>
    <li><a href="#BasicConcepts">Creating a widget with WCL</a></li>
    <li><a href="#SwitchingSkins">Switching skins</a></li>       
    <li><a href="#ApiMethods">WCL API methods and events</a></li>
    <li><a href="#AddingContent">Adding more content</a></li>
    <li><a href="#WorkChrome">Working with chrome</a></li>       
    <li><a href="#WCLEvents">Managing WCL button events</a></li>        
    <li><a href="#WCLResize">Resizing the widget using WCL</a></li>
</ol>

<a name="Introduction" id="Introduction"></a>
###Introduction            

Opera provides a library for the simple creation of chrome for widgets. This library makes it relatively painless to reuse code for widgets of different resolutions, defining different styles for each. The example widgets work identically on both portrait and landscape modes on a mobile device and on a desktop computer. The only difference is the style sheet that is applied. The library also manages resizing of widgets, so authors do not have to implement this themselves in every widget. On mobile devices it’s best to <ah ref="http://dev.opera.com/articles/view/cross-device-development-techniques-for/#layoutfullscreen">enable full-screen 
    mode</a> to take full advantage of the available screen.


<a name="BasicConcepts" id="BasicConcepts"></a>
###Creating a widget with the WCL

A bare bones widget that uses WCL could look like this:

<pre class="examplecode"><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Hello World&lt;/title&gt;
    &lt;script type="text/javascript" src="scripts/chrome.js"&gt;&lt;/script&gt;
    &lt;link href="basic.skin/skin.css" rel="stylesheet" type="text/css" media="screen" /&gt;
&lt;/head&gt;
&lt;body&gt;
    This is the content body
&lt;/body&gt;
&lt;/html&gt;</code></pre>


The basic skin and the chrome.js files are provided by Opera. Developers are free to modify them as needed and to add more skins.

When the widget starts, the chrome.js file creates the extra markup
    needed for the chrome. The chrome consists of a top bar, bottom bar, event handlers
    for resizing and buttons for config and close. The above code would
    produce this screenshot with the default skin:

<img src="http://devfiles.myopera.com/articles/448/hello_world.png" alt="Screenshot of Hello World example" />


<a name="SwitchingSkins" id="SwitchingSkins"></a>
###Switching skins

You can have as many skins as you like for any WCL widget by  adding  elements for external style sheets
    with the type “alternate stylesheet” and a title. Alternate style sheets
    are not automatically applied when the page loads. A simple example
    could look like this:


<pre class="examplecode"><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Hello World&lt;/title&gt;
    &lt;script type="text/javascript" src="scripts/chrome.js"&gt;&lt;/script&gt;
    &lt;link title="basicskin" href="basic.skin/skin.css" rel="stylesheet" type="text/css" media="screen" /&gt;
    &lt;link title="fancyskin" href="fancy.skin/skin.css" rel="alternate stylesheet" type="text/css" media="screen" /&gt;
    &lt;script&gt;
        window.onload = function() {
            // check the size of the viewport and switch skin if
            // it is big enough
            if (window.innerWidth&gt;340) {
                // disable current stylesheet
                WidgetChrome.disableStylesheet("basicskin");

                // enable the fancy skin
                WidgetChrome.enableStyleSheet("fancyskin");
            }
        }
    &lt;/script&gt;

&lt;/head&gt;
&lt;body&gt;
    This is the content body
&lt;/body&gt;
&lt;/html&gt;</code></pre>
    We disable the <em>basicskin</em> so that all styles specified in that skin are removed and then we apply the <em>fancyskin</em>. 

<a name="ApiMethods" id="ApiMethods"></a>
###WCL API methods and events

The WCL API is available at <a href="/libraries/chrome/docs/WidgetChrome.dml">http://dev.opera.com/libraries/chrome/docs/WidgetChrome.dml/</a>.

<a name="AddingContent" id="AddingContent"></a>
###Adding more content
When you add WCL to your widget, it takes all the content from the body and places it inside the chrome. When you want to add or remove content from the
elements, there are no special rules that you need to follow. As long as you are using IDs to get the elements, you can add and remove elements as you would 
normally do without using WCL. For example, if there is a <strong>DIV</strong> with id <em>test</em> you can still use <code>document.getElementById("test")</code> 
 as  normal.
There are times when you want an element to use all the available area inside the widget. You can use the helper 
function <code>WidgetChrome.autoResize</code> to help you resize the element to occupy the complete section in the middle and to resize automatically as the widget 
is resized. 

<strong>Example</strong>: There is a <strong>DIV</strong> with the id <em>pnlConfig</em>. To make sure that it resizes and takes up all the available area
and resizes automatically, we use the helper function <code>WidgetChrome.autoResize(<strong>"pnlConfig"</strong>);</code> in the onload event.

<a name="WorkChrome" id="WorkChrome"></a>
###Working with chrome
There are times when you want to customize elements in the chrome. 
Lets start with elements that you don’t want to add. Add the attribute <code>data-not-chrome-content="true"</code> to those elements. The elements with 
this attribute will not be added inside the widget chrome.

<h4>Example</h4>
<pre><code>&lt;div data-not-chrome-content="true"&gt; &lt;/div&gt; </code></pre>
To add extra elements to the chrome, such as  another button, use the 
API <code>WidgetChrome.addElementToChrome</code>. 

<h4>HTML example</h4>
<code>&lt;button id="btnMinimise" data-not-chrome-content="true"&gt;Minimise&lt;/button&gt;</code>
<h4>JavaScript example</h4>
<code>WidgetChrome.addElementToChrome("btnMinimise");</code>

We make sure that the element is not added inside the chrome by setting <code>data-not-chrome-content="true"</code>. On the onload event, we call the function to add the button to the
chrome. Once you put the button into the chrome, you must still  position it with CSS.


<a name="WCLEvents" id="WCLEvents"></a>
###Managing WCL button events
 There is only one event <code>WidgetChrome.ButtonConfig.onclick</code> that you need to handle if you use WidgetChrome. If you want to handle the 
event when a user clicks the close button, you need to load the function <code>WidgetChrome.ButtonClose.onclick</code>.
    
<pre>WidgetChrome.ButtonConfig.onclick = function(event)
{
    //Do something when the config button clicked.
}

WidgetChrome.ButtonClose.onclick = function(event)
{
    //Do something when the close button is clicked.
}</pre>

You can also use <strong>addEventListener</strong>. You can get the reference to the button elements and use addEventListener on them.     
<strong>WidgetChrome.ButtonConfig</strong> will give the reference to the config button, and <strong>WidgetChrome.ButtonClose</strong> 
will give the reference to the close button. 

<pre>WidgetChrome.ButtonClose.addEventListener("click", function() {
    window.close();    
}, false);</pre>

If you don't need the config button, you can use the following methods to hide the button:

<dl>
  <dt>Using <em>CSS</em></dt>
  <dd><code>#btnConfig { display: none; } </code></dd>
  <dt>Using <em>JavaScript</em></dt>
  <dd><code>WidgetChrome.ButtonConfig.style.display = "none";</code></dd>
</dl>
 
<a name="WCLResize" id="WCLResize"></a>
###Resizing the widget using WCL
 To resize a widget, call <strong>window.resizeTo</strong>— then, call <strong>WidgetChrome.redraw()</strong> so that 
the chrome is repainted.
If you want to make a widget fullscreen, you can use the helper function <strong>WidgetChrome.setFullScreen()</strong>.    

You can set the minimum height and width of the widget using <strong>WidgetChrome.minHeight</strong> and <strong>WidgetChrome.minWidth</strong>. 
By default, the minimum width is 50px and height is set to 100px, so that a user doesn't  resize it and make the widget unusable.


### JSDoc
Documentation can be generated with JSDoc (either version [2](http://code.google.com/p/jsdoc-toolkit/) or [3](https://github.com/micmath/jsdoc)).