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
 * JS functions for feed parsing.
 * Requires function FeedItem( id, title, content, link, date )
 *
 * @see Feed.js
 * @author Magnus Kristiansen, Opera Software ASA
 */

var parsers = {
	'generic' : PatternHandler,
	'rss' : rssPatternHandler,
	'atom' : atomPatternHandler
};

function PatternHandler(xml) {
	if (xml.documentElement.nodeName == 'feed') {
		return atomPatternHandler(xml);
	}
	if (xml.documentElement.getElementsByTagName('channel').length > 0) {
		return rssPatternHandler(xml);
	}
	opera.postError('Unable to recognize feed format, giving up.');
	return [];
}

function rssPatternHandler(xml) {
	var isHTML = false;
	var rss = xml.getElementsByTagName('rss');
	if (! rss.length) {
		// RSS 0.90 or 1.0
		isHTML = true;
	} else {
		// Any other version
		switch ( rss[0].getAttribute('version') ) {
			case '0.91' :
				// Could be two kinds
				isHTML = false;
				break;
			case '0.92' :
				isHTML = true;
				break;
			case '0.93' :
				isHTML = true;
				break;
			case '0.94' :
				// Should check content type, but lazy
				isHTML = true;
				break;
			case '2.0' :
				// Could be three kinds
				isHTML = true;
				break;
			default :
				// What the hell is this thing
				isHTML = false;
				break;
		}
	}

	var c = xml.documentElement.getElementsByTagName('item');
	var ret = [];
	for (var i = 0; i < c.length; i++) {
		ret[ret.length] = rssPattern( c[i], isHTML );
	}
	return ret;
}

function rssPattern(item, isHTML) {

	var title = item.getNodeValueByTagName('title');
	var link = item.getNodeValueByTagName('link');
	var guid = item.getNodeValueByTagName('guid');
	if (! guid) {
		guid = link + "?feedtitle=" + title;
	}

	var pubDate = item.getNodeValueByTagName('date');
	if (! pubDate) pubDate = item.getNodeValueByTagName('pubDate');
	pubDate = pubDate ? (parseRfcDate( pubDate ) || new Date( pubDate ) ) : null;

	var content = item.getNodeValueByTagName('description');
	if (content) {
		if (isHTML) {
			var rnode = document.createElement('div');
			rnode.innerHTML = content;
			content = document.createDocumentFragment();
			while (rnode.firstChild) content.appendChild( rnode.firstChild );
		} else {
			content = document.createTextNode( content );
		}
	}
	
	return new FeedItem( guid, title, content, link, pubDate );
}

function atomPatternHandler(xml) {
	var legacy = ( xml.documentElement.getAttribute('version') == '0.3' );
	
	var c = xml.documentElement.childNodes;
	var ret = [];
	for (var i = 0; i < c.length; i++) {
		if (c[i].nodeName == 'entry') ret[ret.length] = atomPattern( c[i], legacy );
	}
	return ret;
}
function atomPattern(item, legacy) {
	// Mandatory element
	var id = item.getNodeValueByTagName('id');
	// Mandatory element
	var title = (legacy ? processAtomLegacyContent : processAtomContent)( item.getElementsByTagName('title')[0] );
	// Mandatory element
	var date = parseRfcDate( item.getNodeValueByTagName( legacy ? 'modified' : 'updated' ) );
	// Not mandatory, but highly common
	var cons = item.getElementsByTagName('summary');
	if (cons.length) {
        content = (legacy ? processAtomLegacyContent : processAtomContent)( cons[0] );
    } else {
    	cons = item.getElementsByTagName('content');
    	if (cons.length) {
            content = (legacy ? processAtomLegacyContent : processAtomContent)( cons[0], true );
        } else {
            content = null;
        }
    }
	
	// Not mandatory in 1.0 [unless content is missing], but highly common
	var links = item.getElementsByTagName('link');
	var link = null;
	for (var i = 0; i < links.length; i++) {
		var rel = links[i].getAttribute('rel');
		if (!rel || rel == 'alternate') { 
			link = links[i].getAttribute('href'); 
			break;
		}
	}
	
	return new FeedItem ( id, title, content, link, date );
}

function processAtomContent(el, contag) {

	var content = null;

    if (contag) {
    	var src = el.getAttribute('src');
        if (src) {
            return 'Linked content: <a href="' + src + '">' + src + '</a>'
                + ' (' + (el.getAttribute('type') || 'unknown') + ')';
        }
    }

    var att = el.getAttribute('type');

	switch ( att ) {
		case 'xhtml' :
			var rnode = document.importNode( el.getElementsByTagName('div')[0], true );
			content = document.createDocumentFragment();
			while (rnode.firstChild) content.appendChild( rnode.firstChild );
			if (! content.hasChildNodes()) content = null;
            break;
		case 'html' :
			var rnode = document.createElement('div');
			rnode.innerHTML = el.getNodeValue()
			content = document.createDocumentFragment();
			while (rnode.firstChild) content.appendChild( rnode.firstChild );
			if (! content.hasChildNodes()) content = null;
            break;
		case 'text' :
		case null :
			var tnode = el.getNodeValue();
            content = tnode ? document.createTextNode( tnode ) : null;
            break;
		default :
            if (! contag) {
                content = document.createTextNode( 'Invalid content, unable to display' );
                break;
            }
            if ( att.slice(0,5) == 'text/' ) {
                // Text content
                content = document.createTextNode( el.getNodeValue() );
                break;
            }
            if ( att.slice(-4) != '/xml' && att.slice(-4) != '+xml' ) {
                // Base 64 content
                content = document.createTextNode( 'Base64 content, unable to display' );
                break;
            }
        case 'text/xml' :
        case 'application/xml' :
        case 'text/xml-external-parsed-entity' :
        case 'application/xml-external-parsed-entity' :
        case 'application/xml-dtd' :
            // XML content
			var rnode = document.importNode( el.firstChild, true );
			content = document.createDocumentFragment();
			while (rnode.firstChild) content.appendChild( rnode.firstChild );
			if (! content.hasChildNodes()) content = null;
            break;
	}
	
	return content;
}

function processAtomLegacyContent(el) {

	var content = null;
	var subcontent = null;

	if (el.getAttribute('type') == 'multipart/alternative') {
		var types = {};
		for (var i = 0; i < el.childNodes.length; i++) {
			types[ el.childNodes[i].getAttribute('type') ] = i+1;
		}
		var wanted = [ 'application/xhtml+xml', 'text/html', 'text/plain' ];
		for (var i = 0; i < wanted.length; i++) {
			var val = types[ wanted[i] ];
			if (val) return processAtomLegacyContent( el.childNodes[val - 1] );
		}
		return null;
	}

	switch ( el.getAttribute('mode') ) {
		case 'escaped' :
			subcontent = el.getNodeValue();
			if (! subcontent) return null;
		break;
		case 'base64' :
			return document.createTextNode( 'Base64 content, unable to display' );
		break;
		case 'xml' :
		default :
			var rnode = document.importNode(el, true);
			subcontent = document.createDocumentFragment();
			while (rnode.firstChild) subcontent.appendChild( rnode.firstChild );
			if (! subcontent.hasChildNodes()) return null;
		break;
	}

	switch ( el.getAttribute('type') ) {
		case 'application/xhtml+xml' :
		case 'text/html' :
		case 'text/xml' :
			if ( typeof subcontent == 'string' ) {
				var rnode = document.createElement('div');
				rnode.innerHTML = subcontent;
				content = document.createDocumentFragment();
				while (rnode.firstChild) content.appendChild( rnode.firstChild );
				if (! content.hasChildNodes()) return null;
			} else {
				content = subcontent;
			}
		break;
		case 'text/plain' :
		default :
			if ( typeof content == 'string' ) {
				content = document.createTextNode( subcontent );
			} else {
				content = document.createTextNode( subcontent.getNodeValue() );
			}
		break;
	}
	
	return content;
}

function parseRfcDate( str ) {
    var rfc3339 = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})/i;
    var res, hoff, moff; 
    if (res = rfc3339.exec(str)) {
        if (res[8] == 'Z') {
            hoff = 0;
            moff = 0;
        } else {
            var s = res[8].split(':');
            hoff = + s[0];
            moff = + s[1];
        }
        var ms = res[7] ? res[7] * Math.pow( 10, -res[7].length ) : 0;
        return new Date( res[1], res[2] - 1, res[3], res[4] - hoff, res[5] - moff, res[6], ms );
    } else {
        return null;    
    }
}
Node.prototype.getNodeValue = function() {
	var str = [];
	for (var i = 0; i < this.childNodes.length; i++) {
		str[str.length] = this.childNodes[i].nodeValue;
	}
	return str.join('');
}
Node.prototype.getNodeValueByTagName = function(tag) {
	if (tag) tag = this.getElementsByTagName(tag);
	return tag && tag.length ? tag[0].getNodeValue() : '';
}