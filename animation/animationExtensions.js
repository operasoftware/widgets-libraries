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
 * To scroll the height from a elemnt from one value to an other. 
 * Without parameters the function will first check if the element has a height. 
 * If so, it will scroll the elemnent to 0px height, otherwise from 0px to the scrollHeight.
 * @param from optional
 * @param to optional
 */
HTMLElement.prototype.animateHeight=function(from, to)
{
  if(!window['Animation']) return;
  if(!this._animation_height)
  {
    this._animation_height=this.createAnimation();
    this.style.height=from||'0px';
    this._animation_height.accelerationProfile=this._animation_height.sine;
  };
  
  if(from)
  {
    this._animation_height.addAnimation('height', from, (to?to:this.scrollHeight+'px')).run();
  }
  else
  {
    if(this.style.height=='0px')
    {
      this._animation_height.addAnimation('height', '0px', (to?to:this.scrollHeight+'px')).run();
    }
    else
    {
      this._animation_height.addAnimation('height', this.style.height, '0px').run();
    }
  }
}
/**
 * To scroll the width from a elemnt from one value to an other. 
 * Without parameters the function will first check if the element has a width. 
 * If so, it will scroll the elemnent to 0px width, otherwise from 0px to the scrollWidth.
 * @param from optional
 * @param to optional
 */
HTMLElement.prototype.animateWidth=function(from, to)
{
  if(!window['Animation']) return;
  if(!this._animation_width)
  {
    this._animation_width=this.createAnimation();
    this.style.width=from||'0px';
    this._animation_width.accelerationProfile=this._animation_width.sine;
  };
  
  if(from)
  {
    this._animation_width.addAnimation('width', from, (to?to:this.scrollWidth+'px')).run();
  }
  else
  {
    if(this.style.width=='0px')
    {
      this._animation_width.addAnimation('width', '0px', (to?to:this.scrollWidth+'px')).run();
    }
    else
    {
      this._animation_width.addAnimation('width', this.style.width, '0px').run();
    }
  }
}
/**
  * To scroll the height and the width from a elemnt from one value to an other. 
  * Without parameters the function will first check if the element has a height. 
  * If so, it will scroll the elemnent to 0px height, otherwise from 0px to the scrollHeight.
  * The same goes for width.
  * @param heigtFrom optional
  * @param heigtTo optional
  * @param widthFrom optional
  * @param widthTo optional
 */
HTMLElement.prototype.animateHeightAndWidth=function(heightFrom, heightTo, widthFrom, widthTo)
{
  if(!window['Animation']) return;
  if(!this._animation_height_width)
  {
    this._animation_height_width=this.createAnimation();
    this.style.height=heightFrom||'0px';
    this.style.width=widthFrom||'0px';
    this._animation_height_width.accelerationProfile=this._animation_height_width.sine;
  };
  if(heightFrom || widthFrom)
  {
    this._animation_height_width.
      addAnimation('height', heightFrom?heightFrom:this.style.height, (heightTo?heightTo:this.scrollHeight+'px')).
      addAnimation('width', widthFrom?widthFrom:this.style.width, (widthTo?widthTo:this.scrollWidth+'px')).
      run();
  }
  else
  {
    if(this.style.height=='0px')
    {
    this._animation_height_width.
      addAnimation('height', '0px', (heightTo?heightTo:this.scrollHeight+'px')).
      addAnimation('width', '0px', (widthTo?widthTo:this.scrollWidth+'px')).
      run();
    }
    else
    {
    this._animation_height_width.
      addAnimation('height', this.style.height, '0px').
      addAnimation('width', this.style.width, '0px').
      run();
    }
  }
}
/**
 * To fade a element from one value to an other.
 * @param from optional
 * @param to optional
 */
HTMLElement.prototype.fade=function(from, to, speed)
{
  if(!window['Animation']) return;
  if(!this._animation_fade)
  {
    this._animation_fade=this.createAnimation();
    this._animation_fade.speed=speed||20;
    this.style.opacity=from||0;
    this._animation_fade.accelerationProfile=this._animation_fade.accelerate;
  }
  
  this._animation_fade.addAnimation('opacity', (typeof(from) == "number")?from:this.style.opacity, (typeof(to)=="number")?to:1).run();
}

/**
 * To fade the text color from a element from one value to an other.
 * @param from optional
 * @param to optional
 */
HTMLElement.prototype.fadeColor=function(from, to, speed)
{
  if(!window['Animation']) return;
  if(!this._animation_fade_color)
  {
    this._animation_fade_color=this.createAnimation();
    this._animation_fade_color.speed=speed||20;
    this.style.color=from||'#000';
    this._animation_fade_color.accelerationProfile=this._animation_fade_color.accelerate;
  }
  this._animation_fade_color.addAnimation('color', from?from:this.style.backgroundColor, to?to:'#fff').run();
}

/**
 * To fade the background color from a element from one value to an other.
 * @param from optional
 * @param to optional
 */
HTMLElement.prototype.fadeBackgroundColor=function(from, to, speed)
{
  if(!window['Animation']) return;
  if(!this._animation_fade_background_color)
  {
    this._animation_fade_background_color=this.createAnimation();
    this._animation_fade_background_color.speed=speed||20;
    this.style.backgroundColor=from||'#000';
    this._animation_fade_background_color.accelerationProfile=this._animation_fade_background_color.accelerate;
  }
  this._animation_fade_background_color.addAnimation('backgroundColor', from?from:this.style.backgroundColor, to?to:'#fff').run();
}