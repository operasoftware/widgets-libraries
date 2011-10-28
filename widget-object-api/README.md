## Opera Widgets - Core DOM Reference

This document describes the widget object and extensions to the window object which are available to a widget through JavaScript. This API allows you to communicate with the underlying widget runtime. The runtime offers some service such as showing and hiding the widget, storing preferences for the widget and getting information about the running widget.

The methods and properties in this API, the widget object and the extensions to the standard window object are only available if the web page is running inside a web page, i.e. if it is inside a package or directory containing a config.xml and opened as a widget in the Opera browser. Unless otherwise stated, all objects are available in the JavaScript global scope.

###Widget identity and origin

When you install a widget, the browser will give it a unique id, which you can use to refer to it later. This is exposed in the {@link widget#identifier} property and can be used with among other things the widget URL protocol.

Furthermore, the URL of where the widget was downloaded from is exposed on {@link widget#originURL}. One use is for supplying a link to where the user can find more info or updates to the widget.


###The widget URL protocol

You can access resources within the widget, or potentially other widgets by using the widget URL protocol. Such URLs are on the form:

<pre><code>widget://[widget identifier]/[path]</code></pre>

Use <code>widget.identifier</code> to get the identifier part. One possibility is loading translation files in the widget:

<pre><code>xhr.open('GET', 'widget://' + widget.identifier + '/resources/i18n.xml', false)</code></pre>

###Use a different start file: The <code>widgetfile</code> element

By default, the widget runtime will try to load index.html inside the widget package. You can change this to another file by adding a <code>widgetfile</code> element to the config.xml of the widget:

<pre><code>&lt;widget>
  ...
  &lt;widgetfile>start.html&lt;/widgetfile>
  ...
&lt;/widget></code></pre>

###Working with preferences

Widgets may store preferences in a persistent manner. When stored, they will be available if you reload or close and reopen the widget.
They are deleted when the widget is deleted. See the {@link widget#setPreferenceForKey} and {@link widget#preferenceForKey} for details.

<pre><code>widget.setPreferenceForKey( 'gautamc', 'username' ); //Store the value 'gautamc' for the key 'username'
//... close and reopen the widget ...
var username = widget.preferenceForKey('username'); //Retrieve the value again
</code></pre>

If you store <code>null</code> for a given key, any previous value for that key will be unset.

<pre><code>widget.setPreferenceForKey( 'gautamc', 'username' ); //Store the value 'gautamc' for the key 'username'
//... do some work ...
if ( logout )
{
    widget.setPreferenceForKey( null, 'username' );
}
</code></pre>

###Working with widget modes

A widget can be displayed in different modes. The current modes are:

<dt>
<dt>widget</dt>
<dd>This is the default mode on desktop. The widget has no chrome and is transparent by default.</dd>
<dt>docked</dt>
<dd>The widget is displayed in a small mode, suitable in a widget dock or on the idle screen of a mobile.</dd>
<dt>application</dt>
<dd>This mode gives the widget a window chrome as decided by the platform. This chrome controls resizing and closing the widget like a normal platform window.</dd>
<dt>fullscreen</dt>
<dd>Like application mode, allthough maximized. The widget will cover all the available screen space.</dd>
</dt>

You can request a default mode by giving the <code>defaultmode</code> attribute of the <code>widget</code> element in your <code>config.xml</code> file a value equal to the name of the desired widget.

In order to inform the widget runtime that you support a docked mode, you must give the <code>dockable</code> attribute of the <code>widget</code> element in your <code>config.xml</code> file a value of <code>true</code>.

Which mode is used is decided by the widget runtime.

You can use the {@link widget#widgetMode} property to check the current mode of the widget.

When the mode changes, a <code>widgetmodechange</code> will be fired on the <code>widget</code> object. You can listen for it like this:

<pre><code>widget.addEventListener('widgetmodechange', handleModeChange, false);</code></pre>

The event has a <code>mode</code> property which contains the mode the widget is switching to:

<pre><code>function handleMode(e)
{
    switch (e.mode)
    {
        case 'widget':
            //Handle widget mode
        case 'docked':
            //Handle docked mode
        case 'application':
            //Handle application mode
        case 'fullscreen':
            //Handle fullscreen mode

    }
}</code></pre>

You can also use the media query extension <code>-o-widget-mode</code> to deal with mode changes right in your CSS. The -o-widget-mode feature can take a widget name as a value and apply a style only when the widget is in the given mode:

<pre><code>&#64;media all and (-o-widget-mode: application) {
  .fakeChrome {
    display: none;
  }
}</code></pre>

You can test if the platform supports widget modes at all by checking if the property itself is true:

<pre><code>&#64;media all and (-o-widget-mode) {
  div.friendlyMessage {
    content: "I will be displayed if I am a modern widget";
  }
}</code></pre>

Widget modes are currently not supported on Opera 9.5 for desktop.

###Handling changes in screen size

If the resolution of the screen changes, for example when a phone is switched from portrait to landscape mode, a <code>resolution</code> event will be fired on the <code>widget</code> object:

<pre><code>widget.addEventListener('resolution', handleResolutionChange, false);</code></pre>

You can now change the appearance of the widget.

###Displaying a status message

Widgets supports setting a status message which may be displayed in the widget panel or on some status bar:

<pre><code>var updateInterval = setInterval( function () { window.status = 'Feed last updated ' + new Date (); }, 120000 );</code></pre>

If you set the {@link window#status} property to null, it defaults back to the value of {@link window#defaultStatus}, which is also settable.


###Hiding, showing and closing widgets

Widgets may be hidden in such a way that they do not appear as a window or in the user's task bar. The widget will continue to run in the background. The methods
{@link widget#hide} and {@link widget#show} can be used to control this:

<pre><code>hideButton.addEventListener( 'click', function () { widget.hide(); }, false );
...
if ( newItems )
{
    widget.show();
}</code></pre>

You can use <code>window.close()</code> to close a widget too. As per the widget usability guidelines, a widget should have a close button. Any widget uploaded to widgets.opera.com will be rejected if it doesn't have a close button.

<pre><code>closeButton.addEventListener( 'click', function () { window.close(); }, false );</code></pre>

<p class="note">Hiding and closing widgets programatically is not possible on mobile.


###Getting the user's attention

You can use the {@link widget#getAttention} and {@link widget#showNotification} methods for notifying the user that something has happened in your widget.

On desktop, {@link widget#getAttention} will blink the widget icon in the taskbar or similar.

<pre><code>if ( requestReceived )
{
    widget.getAttention();
}</code></pre>

On desktop, {@link widget#showNotification} will pop up a notification dialog from the Opera icon in the system tray. The method takes a message to display and a callback to call if the user clicks the notification as arguments:

<pre><code>if ( itemsReceived )
{
    widget.showNotification( num + ' items received', clickCallkback );
}</code></pre>

This can be used to bring the widget out of hiding for example.

<p class="note">These functions currently do nothing on mobile.


###Moving and resizing widgets

Widgets can be moved around and resized beyond the size specified in their <code>config.xml</code>. Use {@link window#moveTo}, {@link window#moveBy}, {@link window#resizeTo} and {@link window#resizeBy}. This means you may for example put your widget into a compact mode and have the user expand it when necessary.

Calling <code>resizeTo</code> will simply change the widget to the given width and height. Calling moveTo will <code>moveTo</code> it to the given x and y coordinates. The following example will move the widget to the top left corner of the screen and make it as large as the screen space allows:

<pre><code>window.moveTo( 0, 0 );
window.resizeTo( screen.availWidth, screen.availHeight );
</code></pre>

<code>resizeBy</code> will expand or shrink the widget by the given width and height.

<pre><code>window.resizeBy(200,200); //Increase the size by 200 pixels in both directions</code></pre>

<code>moveBy</code> will move the widget the distance given as <code>delta_x</code> and <code>delta_y</code>.

<pre><code>window.moveBy(100,100); //Move the widget 100 pixels in both directions</code></pre>

<p class="note">Moving and resizing widgets is not possible on devices which only show one widget at a time.
  
### JSDoc
Documentation can be generated with JSDoc (either version [2](http://code.google.com/p/jsdoc-toolkit/) or [3](https://github.com/micmath/jsdoc)).