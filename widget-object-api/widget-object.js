/**
@fileoverview

<h1>Opera Widgets - Core DOM Reference</h1>

<p>This document describes the widget object and extensions to the window object which are available to a widget through JavaScript. This API allows you to communicate with the underlying widget runtime. The runtime offers some service such as showing and hiding the widget, storing preferences for the widget and getting information about the running widget.</p>

<p>The methods and properties in this API, the widget object and the extensions to the standard window object are only available if the web page is running inside a web page, i.e. if it is inside a package or directory containing a config.xml and opened as a widget in the Opera browser. Unless otherwise stated, all objects are available in the JavaScript global scope.</p>

<h2>Widget identity and origin</h2>

<p>When you install a widget, the browser will give it a unique id, which you can use to refer to it later. This is exposed in the {@link widget#identifier} property and can be used with among other things the widget URL protocol.</p>

<p>Furthermore, the URL of where the widget was downloaded from is exposed on {@link widget#originURL}. One use is for supplying a link to where the user can find more info or updates to the widget.</p>


<h2>The widget URL protocol</h2>

<p>You can access resources within the widget, or potentially other widgets by using the widget URL protocol. Such URLs are on the form:</p>

<pre><code>widget://[widget identifier]/[path]</code></pre>

<p>Use <code>widget.identifier</code> to get the identifier part. One possibility is loading translation files in the widget:</p>

<pre><code>xhr.open('GET', 'widget://' + widget.identifier + '/resources/i18n.xml', false)</code></pre>

<h2>Use a different start file: The <code>widgetfile</code> element</h2>

<p>By default, the widget runtime will try to load index.html inside the widget package. You can change this to another file by adding a <code>widgetfile</code> element to the config.xml of the widget:</p>

<pre><code>&lt;widget>
  ...
  &lt;widgetfile>start.html&lt;/widgetfile>
  ...
&lt;/widget></code></pre>

<h2>Working with preferences</h2>

<p>Widgets may store preferences in a persistent manner. When stored, they will be available if you reload or close and reopen the widget.
They are deleted when the widget is deleted. See the {@link widget#setPreferenceForKey} and {@link widget#preferenceForKey} for details.</p>

<pre><code>widget.setPreferenceForKey( 'gautamc', 'username' ); //Store the value 'gautamc' for the key 'username'
//... close and reopen the widget ...
var username = widget.preferenceForKey('username'); //Retrieve the value again
</code></pre>

<p>If you store <code>null</code> for a given key, any previous value for that key will be unset.</p>

<pre><code>widget.setPreferenceForKey( 'gautamc', 'username' ); //Store the value 'gautamc' for the key 'username'
//... do some work ...
if ( logout )
{
    widget.setPreferenceForKey( null, 'username' );
}
</code></pre>

<h2>Working with widget modes</h2>

<p>A widget can be displayed in different modes. The current modes are:</p>

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

<p>You can request a default mode by giving the <code>defaultmode</code> attribute of the <code>widget</code> element in your <code>config.xml</code> file a value equal to the name of the desired widget.</p>

<p>In order to inform the widget runtime that you support a docked mode, you must give the <code>dockable</code> attribute of the <code>widget</code> element in your <code>config.xml</code> file a value of <code>true</code>.</p>

<p>Which mode is used is decided by the widget runtime.</p>

<p>You can use the {@link widget#widgetMode} property to check the current mode of the widget.</p>

<p>When the mode changes, a <code>widgetmodechange</code> will be fired on the <code>widget</code> object. You can listen for it like this:</p>

<pre><code>widget.addEventListener('widgetmodechange', handleModeChange, false);</code></pre>

<p>The event has a <code>mode</code> property which contains the mode the widget is switching to:</p>

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

<p>You can also use the media query extension <code>-o-widget-mode</code> to deal with mode changes right in your CSS. The -o-widget-mode feature can take a widget name as a value and apply a style only when the widget is in the given mode:</p>

<pre><code>&#64;media all and (-o-widget-mode: application) {
  .fakeChrome {
    display: none;
  }
}</code></pre>

<p>You can test if the platform supports widget modes at all by checking if the property itself is true:</p>

<pre><code>&#64;media all and (-o-widget-mode) {
  div.friendlyMessage {
    content: "I will be displayed if I am a modern widget";
  }
}</code></pre>

<p>Widget modes are currently not supported on Opera 9.5 for desktop.</p>

<h2>Handling changes in screen size</h2>

<p>If the resolution of the screen changes, for example when a phone is switched from portrait to landscape mode, a <code>resolution</code> event will be fired on the <code>widget</code> object:</p>

<pre><code>widget.addEventListener('resolution', handleResolutionChange, false);</code></pre>

<p>You can now change the appearance of the widget.</p>

<h2>Displaying a status message</h2>

<p>Widgets supports setting a status message which may be displayed in the widget panel or on some status bar:</p>

<pre><code>var updateInterval = setInterval( function () { window.status = 'Feed last updated ' + new Date (); }, 120000 );</code></pre>

<p>If you set the {@link window#status} property to null, it defaults back to the value of {@link window#defaultStatus}, which is also settable.</p>


<h2>Hiding, showing and closing widgets</h2>

<p>Widgets may be hidden in such a way that they do not appear as a window or in the user's task bar. The widget will continue to run in the background. The methods
{@link widget#hide} and {@link widget#show} can be used to control this:</p>

<pre><code>hideButton.addEventListener( 'click', function () { widget.hide(); }, false );
...
if ( newItems )
{
    widget.show();
}</code></pre>

<p>You can use <code>window.close()</code> to close a widget too. As per the widget usability guidelines, a widget should have a close button. Any widget uploaded to widgets.opera.com will be rejected if it doesn't have a close button.</p>

<pre><code>closeButton.addEventListener( 'click', function () { window.close(); }, false );</code></pre>

<p class="note">Hiding and closing widgets programatically is not possible on mobile.</p>


<h2>Getting the user's attention</h2>

<p>You can use the {@link widget#getAttention} and {@link widget#showNotification} methods for notifying the user that something has happened in your widget.</p>

<p>On desktop, {@link widget#getAttention} will blink the widget icon in the taskbar or similar.</p>

<pre><code>if ( requestReceived )
{
    widget.getAttention();
}</code></pre>

<p>On desktop, {@link widget#showNotification} will pop up a notification dialog from the Opera icon in the system tray. The method takes a message to display and a callback to call if the user clicks the notification as arguments:</p>

<pre><code>if ( itemsReceived )
{
    widget.showNotification( num + ' items received', clickCallkback );
}</code></pre>

<p>This can be used to bring the widget out of hiding for example.</p>

<p class="note">These functions currently do nothing on mobile.</p>


<h2>Moving and resizing widgets</h2>

<p>Widgets can be moved around and resized beyond the size specified in their <code>config.xml</code>. Use {@link window#moveTo}, {@link window#moveBy}, {@link window#resizeTo} and {@link window#resizeBy}. This means you may for example put your widget into a compact mode and have the user expand it when necessary.</p>

<p>Calling <code>resizeTo</code> will simply change the widget to the given width and height. Calling moveTo will <code>moveTo</code> it to the given x and y coordinates. The following example will move the widget to the top left corner of the screen and make it as large as the screen space allows:</p>

<pre><code>window.moveTo( 0, 0 );
window.resizeTo( screen.availWidth, screen.availHeight );
</code></pre>

<p><code>resizeBy</code> will expand or shrink the widget by the given width and height.</p>

<pre><code>window.resizeBy(200,200); //Increase the size by 200 pixels in both directions</code></pre>

<p><code>moveBy</code> will move the widget the distance given as <code>delta_x</code> and <code>delta_y</code>.</p>

<pre><code>window.moveBy(100,100); //Move the widget 100 pixels in both directions</code></pre>

<p class="note">Moving and resizing widgets is not possible on devices which only show one widget at a time.</p>

*/

/** 
 * This class does not have a public constructor.
 * @constructor
 * @class
 * The widget object
 *
 * <p>The widget objects contains properties and method which can be used to manipulate the currently running widget.
 * The object is only available to documents which are packaged as widgets, i.e. which are loaded using a config.xml file.
 * It is available in the global scope.</p>
 *
 * <p>Example:</p>
 *
 * <pre><code>widget.setPreferenceForKey('gautamc', 'username');</code></pre>
 *
 * <p>Roughly, the widget object supplies functions and properties for the following features:</p>
 *
 * <ul>
 *   <li>The widget identity and origin.</li>
 *   <li>Saving and storing preferences.</li>
 *   <li>Hiding and showing the widget.</li>
 *   <li>Getting the user's attention</li>
 * </ul>
 *
 * <p>The following properties and methods were introduced in Opera 9.5. They are not available in 9.2x and below.
 *
 * <ul>
 *   <li>{@link widget#originURL}</li>
 *   <li>{@link widget#identifier}</li>
 *   <li>{@link widget#widgetMode}</li>
 *   <li>{@link widget#onShow}</li>
 *   <li>{@link widget#onHide}</li>
 *   <li>{@link widget#show}</li>
 *   <li>{@link widget#hide}</li>
 *   <li>{@link widget#getAttention}</li>
 *   <li>{@link widget#showNotification}</li>
 * </ul>
 *
 * <p>All other properties and methods have been available since 9.2x.</p>
 */
var widget = function () {

    /**
     * The URL this widget was downloaded from. Readonly.
     *
     * <p>The origin URL represents the unique and stable URL this widget was downloaded from. This property is used in
     * relation to security by allowing or disallowing download from certain URLs. The property can also be used
     * to provide other users with a link to where they can download the widget.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>a.textContent = 'Learn more about this widget';
     *a.href = widget.originURL;</code></pre>
     *
     * @type String
     */
    this.originURL = '';

    /**
     * The unique identifier of this widget. Readonly.
     *
     * <p>This identifier is a system generated and unique string identifying this widget. It is used as the first
     * part of URLs using the widget URL protocol.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>img.src = 'widget://' + widget.identifier + '/resources/logo.png';</code></pre>
     *
     * @type String
     */
    this.identifier = '';

    /**
     * The current display of this widget. Readonly.
     *
     * <p>The mode is one of 'widget', 'docked', 'application' or 'fullscreen', depending on what mode
     * the widget is currently in. A <code>widgetmodechange</code> event will be fired on the widget object if the mode changes.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>if (widgetMode == 'application')
     *{
     *    removeChrome();
     *}</code></pre>
     *
     * @type String
     */
    this.widgetMode = '';

    /**
     * Function to call when the widget is shown after being hidden.
     *
     * <p>You may set this function to do some kind of processing when the widget is being shown after having been
     * hidden. An example is starting to periodically poll some service for data. This function gets called after
     * the widget is shown with a call to {@link widget#show}.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>widget.onShow = function ()
     *{
     *    pollInterval = 12000;
     *}</code></pre>
     *
     * @type Function
     */
    this.onShow = null;

    /**
     * Function to call when the widget is hidden.
     *
     * <p>You may set this function to do some kind of processing when the widget is being hidden. An example is 
     * stopping the widget from periodically polling some service for data. This function gets called after 
     * the widget is hidden with a call to {@link widget#hide}.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>widget.onHide = function ()
     *{
     *    pollInterval = 24000;
     *}</code></pre>
     *
     * @type Function
     */
    this.onHide = null;

    /**
     * Save a widget preference.
     *
     * <p>This method will store the given value in the widget in the widget preference store for the given key.
     * The preference store is unique to this widget and any values stored in it are persisted if the widget
     * is reloaded or closed and started again. If a value for the given key already exists, it is silently
     * overwritten.</p>
     *
     * <p>Storing an empty string for the given key will create an entry for the given key with an empty string
     * as its value.</p>
     *
     * <p>Calling this method with <code>null</code> as the value will unset any value previously set.</>
     *
     * <p>Note that the order of the arguments. This and the name of the method is this way to promote
     * compatibility with Dashboard widgets.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>widget.setPreferenceForKey( 'gautamc', 'username' );</code></pre>
     *
     * @param {String} value The value of the preference
     * @param {String} key The string to save the preference under.
     */
    this.setPreferenceForKey = function( value, key ){};

    /**
     * Get a preference from the widget preference store.
     *
     * <p>Get the value stored for the given key in the widget preference store. If there is no value for the
     * given key, an empty string is returned.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>username = widget.preferenceForKey('username');</code></pre>
     *
     * @param {String} key The preference to get from the preference store
     * @returns {String} The value for the key as a String, or an empty String if a value for the key does not exist.
     */
    this.preferenceForKey = function(key){};

    /**
     * Open a URL in the web browser.
     *
     * <p>This method lets you programatically open a URL in the browser. The URL is opened in a new tab in the last active window. Only URLs which are
     * allowed by the security policy of the widget may be opened. If the widget's config.xml file or any system configuration disallows access to the
     * the given URL, the call will fail silently.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>button.addEventListener( 'click', function ()
     *{
     *    color = document.getElementById('colorSelect').value;
     *    widget.openURL('http://www.buzz.com?color=' + color);
     *}, false );</code></pre>
     *
     * @param {String} url The URL to open
     */
    this.openURL = function( url ){};

    /**
     * Hide the widget.
     *
     * <p>Calling this method will hide the widget from view. It will not appear as a window or in the task bar, but will
     * continue to run in the background. If the widget is already hidden, calling this method will do nothing.</p>
     *
     * <p>When the widget is hidden, the {@link widget#onHide} function is called.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>hideButton.addEventListener( 'click', function () { widget.hide(); }, false; )</code></pre>
     */
    this.hide = function(){}

    /**
     * Show the previously hidden widget.
     *
     * <p>Calling this method will bring the widget out of hiding, reopening the window and showing it in the task bar for 
     * the desktop browser. An example is opening the widget when interesting data or requests were received, by 
     * calling widget.show() in the callback to {@link widget#showNotification}. If the widget is already visible,
     * calling this method will do nothing.</p>
     *
     * <p>When the widget is shown, the {@link widget#onShow} function is called.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>if (dataReceived && showOnNewData )
     *{
     *    widget.show();
     *}</code></pre>
     */
    this.show = function() {}

    /**
     * Get the user's attention.
     *
     * <p>Calling this method will get the user's attention in some way. This will vary
     * with the device. On desktop, the task bar entry for the widget will blink.
     * Mobile phones which support this may for example flash the display, play a
     * sound or make the phone vibrate.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>if ( dataReceived )
     *{
     *    widget.getAttention();
     *}</code></pre>
     */
    this.getAttention = function(){}

    /**
     * Show a notification to the user.
     *
     * <p>Calling this method will show a notification with the given message to the user in some way.
     * This will vary with device. On desktop, a popup similar to messages about
     * new mails.</p>
     *
     * <p>If the user accepts the notification, for example by clicking on it, the given callback is
     * called. If the user ignores the notification, the callback is never called.</p>
     *
     * <p>This feature can be used to bring a widget out of hiding when something significant occurs,
     * for example that new weather data has been received.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>if ( messageReceived )
     *{
     *    widget.showNotification( 'A new message received from ' + message.from, updateView );
     *}</code></pre>
     *
     * @param {String} message Message to display.
     * @param {Function} callback Callback to call when the notification is acted on.
     */
    this.showNotification = function( message, callback ){}

}

/**
 * This class has no public constructor.
 * @constructor
 * @class
 * Extensions to the window object when running widgets
 *
 * <p>The window around a widget can be controlled in a more detailed way than normal browser windows. This object provides
 * methods for the following features:</p>
 *
 * <ul>
 *   <li>Moving and resizing the widget.</li>
 *   <li>Setting a status message.</li>
 * </ul>
 *
 * <p>Example:</p>
 *
 * <pre><code>window.resizeTo(300,300);</code></pre>
 *
 * <p>The following properties and methods were introduced in Opera 9.5. They are not available in 9.2x and below.</p>
 *
 * <ul>
 *   <li>{@link window#status}</li>
 *   <li>{@link window#defaultStatus}</li>
 * </ul>
 *
 * <p>All other properties and methods have been available since 9.2x.</p>
 */
var window = function () {

    /**
     * Status message of this widget.
     *
     * <p>This status message is displayed in the widget panel in the browser. After a period of inactivity,
     * this message may be cleared automatically. If this property is set to '' or null, it reverts back to the
     * content of {@link window#defaultStatus}.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>window.status = numUsers + ' users connected';</code></pre>
     *
     * @type String
     */
    this.status = '';

    /**
     * Default status message of this widget.
     *
     * <p>The default status message is shown in the widget panel in the Opera browser if the {@link window#status} is cleared.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>window.status = window.defaultStatus;</code></pre>
     *
     * @type String
     */
    this.defaultStatus = '';

    /**
     * Move the widget to the given coordinates.
     *
     * <p>Move the widget to position <code>x</code>,<code>y</code>.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>window.moveTo(0, 0);</code></pre>
     *
     * @param {int} x Horizontal coordinate to move to.
     * @param {int} y Vertical coordinate to move to.
     */
    this.moveTo = function( x, y ){}

    /**
     * Resize the widget to the given size.
     *
     * <p>Resize the widget to be <code>width</code> wide and <code>height</code> high.
     * The position of the widget does not change.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>window.moveTo(0, 0);
     *window.resizeTo(screen.availWidth, screen.availHeight);</code></pre>
     *
     * @param {int} width Width to resize to.
     * @param {int} height Height to resize to.
     */
    this.resizeTo = function( width, height ){}

    /**
     * Move the widget by the given delta.
     *
     * <p>Move the widget's left edge <code>delta_x</code> pixels horizontally and the top edge
     * <code>delta_y</code> pixels vertically.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>window.moveBy(200,200);</code></pre>
     *
     * @param {int} delta_x The number of pixels to move left or right.
     * @param {int} delta_y The number of pixels to move up or down.
     */
    this.moveBy = function( delta_x, delta_y ){}

    /**
     * Resize the widget by the given delta.
     *
     * <p>Expand or shrink the widget <code>delta_width</code> pixels from the right edge of the widget
     * and <code>delta_height</code> from the bottom edge of the widget. The position of the widget does
     * not change.</p>
     *
     * <p>Example:</p>
     *
     * <pre><code>window.resizeBy(250, 100);</code></pre>
     *
     * @param {int} delta_width The number of pixels to increase the width with.
     * @param {int} delta_height The number of pixels to increase the height with.
     */
    this.resizeBy = function( delta_width, delta_height ){}

}