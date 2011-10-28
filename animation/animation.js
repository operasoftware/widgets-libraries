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
 
/* Version: 0.18 */

var o_animationTimer=new function()
{
  var time=15;
  var store=[];
  var run=false;
  var interval=0;
  var realClock=[];
  var realClockReady=false;
  var self=this;
  var onFrame=null;
  var getRealFrame=function()
  {
    var sum=0, i=1, length=0;
    if(realClock.length>30) realClock.shift();
    realClock[(length=realClock.length)]=new Date();
    onFrame(Math.round(1000/((realClock[length]-realClock[0])/(length-1))));
  }
  var goStep=function()
  {
    var i=0, noFn=true;
    //opera.postError(store.length);
    for(i=0; i<store.length; i++) 
    {
      if(store[i]) 
      {
        store[i]();
        noFn=false;
      }
    }
    if(onFrame) getRealFrame();
    if(noFn) stop();
  }
  var stop=function()
  {
    clearInterval(interval);
    run=false;
  }
  var start=function()
  {
    interval=setInterval(goStep, time);
    run=true;
  }
  this.set=function(fn)
  {
    var i=0;
    while(store[i]) i++;
    store[i]=fn;
    if(!run) start();
    return i;
  }
  this.clear=function(index)
  {
    store[index]=null;
  }
  this.setOnFrame=function(callback)
  {
    onFrame=callback;
  }
  this.clearOnFrame=function()
  {
    onFrame=null;
  }
}


/** 
 * To create a animation object.
 * A animation has a counter which will run from 0 to 100. 
 * All properties which are added with a start and a end value will
 * be adjusted relative to that counter. 
 * @constructor 
 */

function Animation(element, speed, onstart, onfinish, accelerationProfile, onstop)
{
  var self=this;
  /** @private */
  this.properties=[];
  /** @private */
  this.current=0;
  /** @private */
  this.interval=0;
  /** @private */
  this._isrunning=false;


  /** pointer to style object */
  this.style=element?element.style:{};
  /** pointer to element on which the animation is created */
  this.element=element;
  /** the default speed in 	percents */
  this.speed=speed||this.speed;
  /** a callback which will be called befor the animation starts */
  this.onstart=onstart||null;
  /** a callback which will be called when the animation finishes */
  this.onfinish=onfinish||null;
  /** a callback which will be called when the animation finishes */
  this.onstop=onfinish||null;
  /** a profile for the speed during the animation */
  this.accelerationProfile=accelerationProfile||this.constant;
  /* constructorcall */
  if(element) element.addEventListener
  (
    'DOMNodeRemoved', 
    function(event)
    {
      if(event.target==self.element) self.remove(false);
    }, 
    false
  );
};
Animation.prototype.nodeRemoveHandler=function()
{
  //opera.postError(this.element.parentNode);
  //if(this.element.ownerDocument) return;
  this.remove(true);
}
/** @private */
Animation.prototype.reTestHex=/^#/;
/** @private */
Animation.prototype.convertToRGB=function(string)
{
  if(this.reTestHex.test(string))
  {
    var r=0, g=0, b=0, rgb=[], i=0;
    string=string.slice(1);
    if(string.length==3)
    {
      r=string.slice(0,1);
      r+=r;
      g=string.slice(1,2);
      g+=g;
      b=string.slice(2,3);
      b+=b;
    }
    else
    {
      r=string.slice(0,2);
      g=string.slice(2,4);
      b=string.slice(4,6);
    }
    return [parseInt(r,16), parseInt(g,16), parseInt(b,16)];
  }
  else
  {
    rgb=string.slice(string.indexOf('(')+1,string.indexOf(')')).split(',');
    for( ; i<3; i++) rgb[i]=parseInt(rgb[i]);
    return rgb;
  }

}
/* default speed for a animation i persents */
Animation.prototype.speed=6;

/** @private */
Animation.prototype.reIsColor=/^#|^rgb/;
/** the default acceleration profile */
Animation.prototype.constant=function(x)
{
  return 1;
}
/** a acceleration profile which will start slow, accelerate and slow done to the end */  
Animation.prototype.sine=function(x)
{
  return (Math.sin((x)/314))+0.2;
}
/** a acceleration profile which will start slow and then accelerate */ 
Animation.prototype.accelerate=function(x)
{
  var start=.1;
  return start+x*x/10000;
}

/** a acceleration profile which will start slow and then accelerate */ 
Animation.prototype.decelerate=function(x)
{
  var start=.1;
  return start+(1-x*x/10000);
}

/** @private */
Animation.prototype.strategyInt=function(prop, current)
{
  return (prop.from+(Math.round(prop.delta*current/100)))+prop.unit;
}

/** @private */
Animation.prototype.strategyFloat=function(prop, current)
{
  return (prop.from+prop.delta*current/100);
}

/** @private */
Animation.prototype.strategyColor=function(prop, current)
{
  var i=0, temp=[];
  for( ; i<3; i++) temp[i]=prop.fromRGB[i]+(Math.round(prop.deltaRGB[i]*current/100));
  return 'rgb('+temp.join(',')+')';
}

Animation.prototype.strategyMoveWindow=function(prop, current, animation)
{
  window.moveTo
  (
    prop.from[0]+(Math.round((prop.to[0]-prop.from[0])*current/100)),
    prop.from[1]+(Math.round((prop.to[1]-prop.from[1])*current/100))
  );
}

Animation.prototype.strategyResizeWindow=function(prop, current, animation)
{
  window.resizeTo
  (
    prop.from[0]+(Math.round((prop.to[0]-prop.from[0])*current/100)),
    prop.from[1]+(Math.round((prop.to[1]-prop.from[1])*current/100))
  );
}



/** @private */
Animation.prototype.getProperty=function(property)
{
  var i=0, pointer=null;
  for( ; pointer=this.properties[i]; i++)
  {
    if(property==pointer.property) return pointer;
  }
  return null;
}

/** to check if the animation is running */
Animation.prototype.checkRun=function()
{
  return this._isrunning;
}

/** to start the animation */
Animation.prototype.run=function()
{
  var self=this;
  if(!this._isrunning)
  { 
    this._isrunning=true;
    this.releaseEvent('OAnimationStart');
    if(this.onstart) this.onstart();
    if(Animation.on)
    {
      this.interval=o_animationTimer.set(function(){self.onStep()}); 
    }
    else
    {
      this.current=100;
      this.onStep();
    }
  }
}

/** @private */
Animation.prototype.onStep=function()
{
  var last=false;
  var temp=null;
  //opera.postError(Animation.prototype.sine);
  if(((this.current+=this.speed*this.accelerationProfile(this.current))>=100))
  {
    this.current=100;
    o_animationTimer.clear(this.interval);
    last=true;
  };
  var i=0, prop=null;
  
  for ( ; prop=this.properties[i]; i++)
  {
    this.style[prop.property]=prop.strategy(prop, this.current, this);
  }
  
  if(last)
  {
    this.current=0;
    this._isrunning=false;
    this.releaseEvent('OAnimationFinish');
    if(this.onfinish) this.onfinish();
  }
  else this.releaseEvent('OAnimationFrame');
}

Animation.on=true;
/** 
  * to add a animation for a certain property.
  * @param property the property which shall be animated
  * @param from the start value as string
  * @param to the end value as string
  */
Animation.prototype.addAnimation=function(property, from, to, customStrategy)
{
  var strat=null, unit='', delta=0;
  var pointer_here=this.getProperty(property)||(this.properties[this.properties.length]={});
  if(this.reIsColor.test(from))
  {
    pointer_here.property=property;
    pointer_here.from=from;
    pointer_here.to=to;
    pointer_here.fromRGB=this.convertToRGB(from);
    pointer_here.toRGB=this.convertToRGB(to);
    pointer_here.deltaRGB=
    [
      (pointer_here.toRGB[0]-pointer_here.fromRGB[0]), 
      (pointer_here.toRGB[1]-pointer_here.fromRGB[1]), 
      (pointer_here.toRGB[2]-pointer_here.fromRGB[2])
    ];
    pointer_here.strategy=this.strategyColor;
  }
  else
  {
    if(property=='opacity')
    {
      strat=this.strategyFloat;
      from=parseFloat(from);
      to=parseFloat(to);
    }
    else if (property.indexOf('window')==0)
    {
      switch (property)
      {
      case 'windowMoveTo':
        strat=this.strategyMoveWindow;
        from=from.split(',');
        from[0]=parseInt(from[0]);
        from[1]=parseInt(from[1]);
        to=to.split(',');
        to[0]=parseInt(to[0]);
        to[1]=parseInt(to[1]);
        break;

      case 'windowMoveBy':
        strat=this.strategyMoveWindow;
        var by=from.split(',');
        by[0]=parseInt(by[0]);
        by[1]=parseInt(by[1]);
        from=[];
        to=[];
        from[0]=window.screenLeft;
        from[1]=window.screenTop;
        to[0]=from[0]+by[0];
        to[1]=from[1]+by[1];
        break;
  
      case 'windowResizeTo':
        strat=this.strategyResizeWindow;
        var to=from.split(',');
        to[0]=parseInt(to[0]);
        to[1]=parseInt(to[1]);
        from=[];
        from[0]=window.innerWidth;
        from[1]=window.innerHeight;
        break;

      case 'windowResizeBy':
        strat=this.strategyResizeWindow;
        var by=from.split(',');
        by[0]=parseInt(by[0]);
        by[1]=parseInt(by[1]);
        from=[];
        to=[];
        from=[];
        from[0]=window.innerWidth;
        from[1]=window.innerHeight;
        to[0]=from[0]+by[0];
        to[1]=from[1]+by[1];
        break;
      }
    }
    else if (strat=customStrategy)
    {
      unit=from.replace(/-?\d*/g,'');
      from=parseFloat(from);
      to=parseFloat(to);
    }
    else
    {
      strat=this.strategyInt;
      unit=from.replace(/-?\d*/g,'');
      from=parseInt(from);
      to=parseInt(to);
    }
    pointer_here.property=property;
    pointer_here.unit=unit;
    pointer_here.from=from;
    pointer_here.to=to;
    pointer_here.delta=to-from; // TODO clan this up
    pointer_here.strategy=strat;
  }
  return this;
}

Animation.prototype.removeAnimation=function(property)
{
  var i=0, pointer=null;
  for( ; pointer=this.properties[i]; i++)
  {
    if(property==pointer.property) 
    {
      this.properties.splice(i, 1);
      return true;
    }
  }
  return false;
}

Animation.prototype.stop=function()
{
  //opera.postError('s '+this._isrunning);
  if(this._isrunning)
  {
    //opera.postError('ss');
    o_animationTimer.clear(this.interval);
    this.current=0;
    this._isrunning=false;
    this.releaseEvent('OAnimationStop');
    if(this.onstop) this.onstop();
  }
}

Animation.prototype.pauseAnimation=function()
{
  if(this._isrunning)
  {
    o_animationTimer.clear(this.interval);
    this._isrunning=false;
  }
}

Animation.prototype.continueAnimation=function()
{
  var self=this;
  if(!this._isrunning && this.current)
  { 
    this._isrunning=true;
    this.interval=o_animationTimer.set(function(){self.onStep()}); 
  }
}

Animation.prototype.releaseEvent=function(name)
{
  if(this.element)
  {
  var event=document.createEvent('Events');
  event.initEvent(name, true, false);
  event.data=this;
  this.element.dispatchEvent(event);
  }
}

Animation.prototype.remove=function(bol)
{
  if(this._isrunning) o_animationTimer.clear(this.interval);
  if(bol && this.element && this.element.parentNode) this.element.parentNode.removeChild(this.element);
  delete this.element;
  delete this.style;
  delete this.onstart;
  delete this.onfinish;
  delete this.onstop;
  delete this.accelerationProfile;
}


/** 
  * to create a animation.
  * @param speed
  * @param onfinish
  * @param accelerationProfile
  * @returns a animation object
  * @see Animation
  */
Element.prototype.createAnimation=function(speed, onstart, onfinish, accelerationProfile)
{
  return new Animation(this, speed, onstart, onfinish, accelerationProfile); 
}