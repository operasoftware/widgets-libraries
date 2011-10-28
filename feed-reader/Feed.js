/**
 * Copyright (c) 2006, Opera Software ASA
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Opera Software ASA nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY OPERA SOFTWARE ASA AND CONTRIBUTORS ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL OPERA SOFTWARE ASA AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Class representing one item in a news feed.
 * @constructor
 * @author Christian Krebbs
 */
function FeedItem( _guid, _title, _description, _link, _pubDate) {

	this.read = false;

	var title = _title || '';
	var description = _description || '';
	var link = _link || '';
	var pubDate = _pubDate || null;
    var guid = _guid || null; 
	
	this.getTitle = function() {
        return title.cloneNode ? title.cloneNode(true) : title;
    }
	this.getDesc = function() {
        return description.cloneNode ? description.cloneNode(true) : description;
    }
	this.getLink = function() {
        return link;
    }
	this.getDate = function() {
        return pubDate;
    }
	this.getGUID = function() { return guid; }
	
}

/**
 * Class for RSS feeds
 *
 * This class handles reading data from one single RSS feed.
 * Items are stored in a public list. The class handles peridic
 * updating and stores read/unread status.
 *
 * Feeds use the URL as a unique identifier.
 * XXX Clear links from state
 * XXX Expose sorting algorithm? (From Arve)
 *
 * @constructor
 * @author Hans S. Toemmerholt, Opera Software ASA
 */
function Feed ( url, title, descr, feedListenerFunc, updateInterval, dataHandlerFunc, reqMaxItems ) {

	/********* Instance variables ***********/
	var newItemsFunc = feedListenerFunc;		//Callback function for new items
	var dataFunc = dataHandlerFunc;		//Callback function for processing of RSS feeds
	var intervalTime = updateInterval;		//The update interval time in minutes
	var itemList = [];				//The list of current RSS elements
	var maxItems = reqMaxItems || 10;	  	//Maximium number of feed items
	
	/********* Internal vars ***********/
	var interval;			//Update interval timer
	var initRead = false;		//Whether or not read items have been loaded from prefs
	var newTime = false;		//Old update interval time
	
	var self = this;
	
	/* XHR object setup */
	var req = new XMLHttpRequest();
	req.onreadystatechange = function () {
		if (req.readyState != 4) return;
		if (req.status == 200 ) {
			processFeed(req.responseXML);
		} else {
			var err = 'Error retrieving feed: ' + req.status + ' (' + req.statusText + ')';
			opera.postError(err);
			if ( newItemsFunc ) { 
				newItemsFunc(true, err); 
			}
		}
	}

	
	/********* Public ***********/
	
	/** Title of this feed **/
	this.title = title || ''; 
	/** Description of this feed **/
	this.descr = descr || '';
	
	/********* Interface methods ***********/
	
	/** Get URL of this Feed */
	this.getURL = function () { return url; }
	
	/** Check for feed updates immediatly. */
	this.update = function(forced) {
		if (newTime) {
			clearInterval(interval);
			interval = null;
			newTime = false;
		}
		
		if (! interval) {
			interval = setInterval( self.update, intervalTime*60000 );
		}    
		
		getFeedData(forced);
	}
	
	this.forceUpdate = function() {
		self.update(true);
	}
	
	/**
	* Get feed item from current item list
	* @arg url  Url of this feed item.
	* @returns  Feed item with the specified url.
	*/
	this.getItem = function(guid) {
		return getItemInternal(guid);
	}
	
	//For use in non-object context
	function getItemInternal(guid) {
		for (var i = 0, item; item = itemList[i]; i++) {
			if ( item.getGUID() == guid ) { 
				return item;
			}
		}
		return null;
	}
	
	/**
	* Set the callback function for when new items are received
	* @arg newItemsCallback  Callback function to set
	*/
	this.addItemListener = function ( newItemsCallback ) { newItemsFunc = newItemsCallback; }
	
	/**
	* Set the handler function for processing data from feeds
	* @arg dataFunction  Data handliner function to set
	*/
	this.setDataHandler = function ( dataFunction ) { dataFunc = dataFunction; }
	
	/**
	* Get the data handler function
	*/
	this.getDataHandler = function () { return dataFunc; }
	
	/**
	* Get the current list of FeedItems.
	* @return Current list of FeedItems
	*/
	this.getItemList = function () { return itemList; }
	
	/**
	* Get the maximum number of feed items.
	* @return Maximum number of feed items
	*/
	this.getMaxItems = function () { return maxItems; }
	
	/**
	* Set the maximum number of allowed items in the item list.
	*/
	this.setMaxItems = function ( max ) { if (max > 0) { maxItems = max; } }
	
	/**
	* Set the interval for the updating of the feed
	* @arg time  Time to set in minutes.
	*/
	this.setUpdateInterval = function ( time ) {
		if (time > 0) {
			newTime = true;
			intervalTime = time;
		}
	}
	/**
	* Get the current update interval
	*/
	this.getUpdateInterval = function () { return intervalTime; }
	
	this.clearUpdateInterval = function () {
		clearInterval(interval);
	}
	
	
	
	/**
	* Set the speficied feed item as read.
	* @arg id  Id of the feed item to set as read.
	*/
	this.setItemRead = function ( guid ) {
		var item = this.getItem(guid);	
		if ( item && !item.read ) { 
			item.read = true;
			storeReadItems();
		}
	}
	
	/**
	* Get number of unread items
	*/
	this.getUnreadCount = function () {
		var unreadCount = 0;
		for ( var i = 0, item; item = itemList[i]; i++ ) {
			if ( !item.read ) { unreadCount++; }
		} 
		return unreadCount;
	}
	
	/******** Private methods ***************/
	
	/**
	* Get data from an RSS feed
	*/
	function getFeedData(forced) {
		if (req.readyState > 1) req.abort();
		
		var href = url;
		req.open( 'GET', href, true );
		
		if (forced) {
			// href += (href.indexOf('?') > 0 ? '&' : '?') + 'seed=' + Math.random();
			req.setRequestHeader('Cache-Control', 'no-cache')
		}
		
		req.send(null);
	}
	
	/**
	* Pase data from an RSS feed
	*/
	function processFeed(xml) {
		if (! xml.documentElement) {
			var err = 'Malformed XML received, giving up.';
			opera.postError(err);
			if ( newItemsFunc ) { 
				newItemsFunc(true, err); 
			}
		}

		var tempList = dataFunc(xml);
		var newItems = false;

		// Sort all received items
		tempList.sort(pubDateComparator);
		
		// Append #[maxItems] new items
		var len = Math.min( tempList.length, maxItems );
		for ( var i = 0; i < len; i++ ) {
			var item = tempList[i];
			if ( ! getItemInternal(item.getGUID()) ) {
				itemList.push(item);
				newItems = true;
			}
		}

		// No new items, return		
		if (! newItems) { 
			newItemsFunc(true);
			return;
		}
		
		// Sort list of old items + #[maxItems] new items
		itemList.sort(pubDateComparator);
		
		// Cut off excess items
		cutItems();
		
		// If first run, read in stored 'read item info'
		if (! initRead) {
			getReadItems();
			initRead = true;
		}

		// update read item storage
		storeReadItems();

		// Done sorting and updating, return	
		if ( newItemsFunc ) { 
			newItemsFunc(false); 
		}
	}
	
	/**
	* Order on RSS publication date, descending
	*/
	function pubDateComparator( itemA, itemB ) {
		return itemB.getDate().getTime() - itemA.getDate().getTime();
	}
	
	/**
	* Remove excessive items.
	*/
	function cutItems() {
		if (itemList.length <= maxItems) {
			return false;
		}
		else {
			itemList = itemList.slice(0, maxItems);
			return true;
		}
	}
	
	/**
	* Store read items in preferences
	*/
	function storeReadItems() {
		// Not run in widget context
		if (! window.widget) return;
		
		var store = [];
		for ( var i = 0, item; item = itemList[i]; i++ ) {
			if ( item.read ) {
				store[store.length] = encodeURIComponent( item.getGUID() );
			}
		}
		
		widget.setPreferenceForKey( store.join('||') , url );
	}
	
	/**
	* Get read items from preferences
	*/
	function getReadItems () {
		// Not run in widget context
		if (! window.widget) return;

		var store = widget.preferenceForKey(url);
		
		// No data stored
		if (! store) {
			return;
		}
		
		var guidlist = store.split('||');
		for ( var i = 0; i < guidlist.length; i++ ) {
			var item = getItemInternal( decodeURIComponent( guidlist[i] ) );
			if ( item ) { item.read = true; }
		}
		
	}
		
}