/*
 * Copyright (c) 2008, Opera Software ASA
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Opera Software ASA nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY OPERA SOFTWARE ASA ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL OPERA SOFTWARE ASA BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @fileoverview
 * Widget Chrome Library
 * 
 * Library to make resizable widget chrome. 
 * 
 * @version 0.2 
 *     The user does not need to do anything for the chrome to be visible. 
 *     Only include the script and the skin file and it should work.
 *     
 * @version 0.1 
 *     Initial implementation
 *
 * @author Vivek Jishtu
 */


/**
 * This class is used to make the widget chrome. In your project you need to 
 * use the object WidgetChrome.
 * 
 * @class
 * A class which paints the chrome and handles resizing.
 */

var WidgetChrome = new function()
 {
    /**
     * Array of chrome pieces ID's. These ID's are used in CSS 
     * while designing the skin.
     * 
     * @type Array
     */
    var _chromePiecesId = ["chrome_middle_content", "chrome_top_left", "chrome_top_middle",
    "chrome_top_right", "chrome_middle_left", "chrome_middle_right",
    "chrome_bottom_left", "chrome_bottom_middle", "chrome_bottom_right"];
    /**
     * Array of HTMLElements which makeup the widget chrome.
     * 
     * @type Array
     */
    var _chromePieces = {};

    /**
     * The rootElement on which the chrome is painted.
     * 
     * @type HTMLElement
     */
    var _rootElement = null;

    /**
     * The root node which holds the widget chrome.
     * It is the child of rootElement.
     * 
     * @type HTMLDivElement
     */
    var _chromeRoot;
    var _sizeControl;
    var _self = this;

    /**
     * The minimum width for the widget
     * 
     * @public 
     * @type Integer
     */
    this.minWidth = 50;

    /**
     * The minimum height for the widget
     * 
     * @public 
     * @type Integer
     */
    this.minHeight = 100;

    /**
     * Reference to the config button
     * 
     * @public
     * @type HTMLButtonElement
     */
    this.ButtonConfig = createButton("btnConfig");

    /**
     * Reference to the close button
     * 
     * @public
     * @type HTMLButtonElement
     */
    this.ButtonClose = createButton("btnClose");

    /**
     * Overload this function incase you want
     * to handle the close button click event.
     * 
     * @param {Event} event
     */
    this.ButtonClose.onclick = function(event)
    {
        window.close();
    }

    /**
     * This is just a stub you have to overload 
     * this function incase you want the config 
     * button to work.
     * 
     * @param {Event} event
     */
    this.ButtonConfig.onclick = function(event)
    {
        opera.postError("Config clicked");
    }

    /**
     * A light wrapper around the document.getElementById
     * 
     * @param {String} id
     * @returns {HTMLElement} The HTMLElement with that id.
     */
    function $(id)
    {
        return document.getElementById(id);
    }

    /**
     * Set if the scrollbars should be visible if content is more 
     * than visible area.
     * 
     * @param {Boolean} state Can be true to enable scrollbars and false to disable them.
     */
    this.showScrollBars = function(state)
    {
        var contentArea = $("chrome_middle_content");
        if (state == true) contentArea.style.overflow = "auto";
        else contentArea.style.overflow = "hidden";
    }

    /**
     * To set the skin used as the Chrome.
     * 
     * @param {String} skinName Name of the skin you want to add.
     */
    this.setSkin = function(skinName)
    {
        var head = document.getElementsByTagName('head').item(0);
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.id = skinName;
        link.title = skinName;
        link.media = "screen";
        link.href = skinName + "/skin.css";
        head.appendChild(link);
    }

    /**
     * Inits the basic Widget Chrome. Creates and adds the
     * <strong>HTMLElements</strong> to the rootElement.
     * 
     * @private
     */
    function init()
    {
        _rootElement = document.body;
        // Root node which holds the other divs
        _chromeRoot = createDiv("__widget_chrome_root__");
        _chromeRoot.setAttribute("data-not-chrome-content", "true");

        addChromePiecesToRoot();
        _rootElement.insertBefore(_chromeRoot, _rootElement.firstChild);
        // Create divs to resize the widget
        sizerControls();
        addWidgetControls();
        $("lblTitle").innerHTML = document.title;
        addBodyToContentArea();
        _self.redraw();

    }

    /**
     * Function used to move all the elements from the body 
     * to chrome_middle_content unless it has been tagged
     * as a rootElement. 
     * 
     * @private
     */
    function addBodyToContentArea()
    {
        var contentArea = $("chrome_middle_content");

        var currentNode = document.body.firstChild;
        var nextNode;

        while (currentNode)
        {
            nextNode = currentNode.nextSibling;

            if (currentNode.getAttribute && currentNode.getAttribute("data-not-chrome-content"))
            {
                // If its part of the rootElement do not move it
                }
            else
            {
                contentArea.appendChild(currentNode);
            }

            currentNode = nextNode;
        }

    }

    /**
     * Adds the widget control elements to the chrome. 
     * Titlebar caption, Config button and Close button.
     * 
     * @private
     */
    function addWidgetControls()
    {
        _chromeRoot.appendChild(createDiv("lblTitle"));
        _chromeRoot.appendChild(_self.ButtonConfig);
        _chromeRoot.appendChild(_self.ButtonClose);
    }

    /**
     * This function handles the creation and also control
     * or the sizer control which allows the widget to be 
     * resized.
     * 
     * @private
     */
    function sizerControls()
    {
        _sizeControl = createDiv("sizerControl");
        _sizeControl.setAttribute("data-not-chrome-content", "true");

        with(_sizeControl.style)
        {
            position = "absolute";
            top = "0px";
            left = "0px";
            border = "1px dotted black";
            display = "none";
        }

        document.body.appendChild(_sizeControl);

        var windowX = document.body.clientWidth;
        var windowY = document.body.clientHeight;

        function resizer_MouseDown(event)
        {
            var x = event.clientX;
            var y = event.clientY;

            var oldWindowX = document.body.clientWidth;
            var oldWindowY = document.body.clientHeight;


            $("sizerControl").style.display = "block";
            $("sizerControl").style.height = window.innerHeight - 5 + "px";
            $("sizerControl").style.width = window.innerWidth - 5 + "px";

            window.resizeTo(window.innerWidth + 5, window.innerHeight + 5);

            function window_MouseMove(event)
            {
                window.scrollTo(0, 0);

                windowX = oldWindowX + event.clientX - x;
                windowY = oldWindowY + event.clientY - y;

                if (windowX > window.innerWidth) window.resizeTo(windowX + 5, window.innerHeight);
                if (windowY > window.innerHeight) window.resizeTo(window.innerWidth, windowY + 5);

                if (_self.minWidth > windowX) return;
                if (_self.minHeight > windowY) return;

                document.body.style.height = document.body.clientHeight - 2 + "px";
                document.body.style.width = document.body.clientWidth - 2 + "px";

                $("sizerControl").style.height = windowY - 3 + "px";
                $("sizerControl").style.width = windowX - 3 + "px";

            }

            function window_MouseUp(event)
            {

                if (_self.minWidth > windowX) windowX = _self.minWidth;
                if (_self.minHeight > windowY) windowY = _self.minHeight;

                window.resizeTo(windowX, windowY);

                document.body.style.height = window.innerHeight + "px";
                document.body.style.width = window.innerWidth + "px";

                $("sizerControl").style.display = "none";
                _self.redraw();

                window.removeEventListener("mousemove", window_MouseMove, true);
                window.removeEventListener("mouseup", window_MouseUp, true);
            }

            window.addEventListener("mousemove", window_MouseMove, true);
            window.addEventListener("mouseup", window_MouseUp, true);
        }

        //The function used to resize the window in the SW Direction.
        $("chrome_bottom_right").onmousedown = resizer_MouseDown;
    }


    /**
     * Create the chrome pieces and append them
     * to the rootElement.
     * 
     * @private
     */
    function addChromePiecesToRoot()
    {
        for (var x in _chromePiecesId)
        {
            var id = _chromePiecesId[x];
            _chromePieces[id] = createDiv(id);
            _chromeRoot.appendChild(_chromePieces[id]);
        }
    }

    /**
     * Helper function to create a div 
     * 
     * @param {String} id
     * @private
     */
    function createDiv(id)
    {
        var div = document.createElement("div");
        div.id = id;
        return div;
    }


    /**
     * Helper function to create a button
     * 
     * @param {String} id
     * @private
     */
    function createButton(id)
    {
        var button = document.createElement("button");
        button.setAttribute("type", "button");
        button.id = id;
        return button;
    }

    /**
     * A public function to redraw the chrome.
     * 
     * @public
     */
    this.redraw = function()
    {
        window.scrollTo(0, 0);
        document.body.style.top = "0px";
        document.body.style.left = "0px";

        document.body.style.width = window.innerWidth + "px";
        document.body.style.height = window.innerHeight + "px";

        _chromeRoot.style.width = document.body.clientWidth + "px";
        _chromeRoot.style.height = document.body.clientHeight + "px";

        var _width = _chromeRoot.clientWidth;
        var _height = _chromeRoot.clientHeight;

        _chromePieces['chrome_top_middle'].style.width = _width - (_chromePieces['chrome_top_left'].clientWidth + _chromePieces['chrome_top_right'].clientWidth) + "px";
        _chromePieces['chrome_top_middle'].style.left = _chromePieces['chrome_top_left'].clientWidth + "px";

        _chromePieces['chrome_bottom_middle'].style.width = _width - (_chromePieces['chrome_bottom_left'].clientWidth + _chromePieces['chrome_bottom_right'].clientWidth) + "px";
        _chromePieces['chrome_bottom_middle'].style.left = _chromePieces['chrome_bottom_left'].clientWidth + "px";

        _chromePieces['chrome_middle_left'].style.height = _height - (_chromePieces['chrome_top_left'].clientHeight + _chromePieces['chrome_bottom_left'].clientHeight) + "px";
        _chromePieces['chrome_middle_right'].style.height = _height - (_chromePieces['chrome_top_right'].clientHeight + _chromePieces['chrome_bottom_right'].clientHeight) + "px";

        _content = _chromePieces['chrome_middle_content'];
        _content.style.top = _chromePieces['chrome_top_middle'].clientHeight + "px";
        _content.style.left = _chromePieces['chrome_middle_left'].clientWidth + "px";
        _content.style.height = _height - (_chromePieces['chrome_top_middle'].clientHeight + _chromePieces['chrome_bottom_middle'].clientHeight) + "px";
        _content.style.width = _width - (_chromePieces['chrome_middle_left'].clientWidth + _chromePieces['chrome_middle_right'].clientWidth) + "px";
    }

    /**
     * This functions allows you to automatically size a HTMLElement 
     * to the widget content area. 
     * 
     * @param {Object} element Can be a HTMLElement or id of an element
     * @public
     */
    this.autoResize = function(element)
    {
        if (typeof element == "string") element = document.getElementById(element);
        if (!element) throw "Cannot find the element to autoResize";

        with(element.style)
        {
            position = "absolute";
            top = "0px";
            left = "0px";
            height = "100%";
            width = "100%";
            overflow = "auto";
        }
    }

    /**
    * This functions allows you to add HTMLElements
    * to the widget chrome. Incase you want to add any extra
    * button you can use this function to do that. 
    * 
    * @param {Object} element Can be a HTMLElement or id of an element
    * @public
    */
    this.addElementToChrome = function(element)
    {
        if (typeof element == "string") element = document.getElementById(element);
        if (!element) throw "Cannot add the element to the Widget Chrome";

        _chromeRoot.appendChild(element);
    }


    /**
     * This function makes the widget fullscreen. This function 
     * is normally used on a small screen device to open a widget
     * fullscreen.
     * 
     * @public
     */
    this.setFullScreen = function()
    {
        window.moveTo(0, 0);
        window.resizeTo(screen.availWidth, screen.availHeight);
        _self.redraw();
    }

    /**
     * Function to enable a stylesheet at runtime. 
     * You can switch the skins used on your widget.
     * 
     * @param {String} title The title attribute of the stylesheet you want to enable
     * @public
     */
    this.enableStyleSheet = function(title)
    {
        var stylesheets = document.getElementsByTagName("link");
        var x,
        stylesheet;
        for (x = 0; x < stylesheets.length; x++)
        {
            stylesheet = stylesheets[x];
            if (stylesheet.getAttribute("rel").indexOf("stylesheet") != -1)
            {
                if (stylesheet.getAttribute("title") == title) stylesheet.disabled = false;
            }
        }
        _self.redraw();
    }

    /**
     * Function to disable a stylesheet at runtime.
     * You can switch the skins used on your widget.
     * 
     * @param {String} title The title attribute of the stylesheet you want to disable
     * @public
     */
    this.disableStyleSheet = function(title)
    {
        var stylesheets = document.getElementsByTagName("link");
        var x,
        stylesheet;
        for (x = 0; x < stylesheets.length; x++)
        {
            stylesheet = stylesheets[x];
            if (stylesheet.getAttribute("rel").indexOf("stylesheet") != -1)
            {
                if (stylesheet.getAttribute("title") == title) stylesheet.disabled = true;
            }
        }
        _self.redraw();
    }

    /**
     * Changes the title of the widget. 
     * 
     * @param {String} title The title that is displayed in the caption bar.    
     * @public
     */
    this.setTitle = function(title)
    {
        //Cleaup any HTML from the tile.
        document.title = title.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/g, "");
        $("lblTitle").innerHTML = title;
    }

    /*
     * Call the private init function.  
     * If the document has loaded call the init, if its not
     * call it when the DOMContentLoaded event is called.    
     */

    if (document.body) init();
    else window.addEventListener("DOMContentLoaded", init, false);
} ();;
