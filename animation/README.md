## Animation Library

The animation library and its extension is used to animate elements. It can be used to e.g. shrink and expand elements, slide them, and fade from one color to another.

<hr>

The goal of this tutorial is to take you through creating animations using the Opera Animation library. The tutorial requires a basic understanding of JavaScript and <code><span class="caps">CSS</span></code>.

###Including the Animation library

To enable animations in your widgets, copy the animation.js file to your widget's project folder, and include the script in your widget's main document.
The animation library can be downloaded here.

<pre>
&lt;script type="text/javascript" src="animation.js"&gt;&lt;/script&gt;
</pre>

####Creating an animation using <code>createAnimation()</code>

After the animation library is included, every element in the <span class="caps">DOM</span> will have a <code>createAnimation()</code> method available, that is used to create an animation on that element. When invoked, the <code>createAnimation()</code> method returns an <code>Animation</code> object that can later be referenced:

<pre>
// Get an element
var myElement = document.getElementById( 'myAnimatableElement' );
// Create an animation for 'myElement' and assign the animation to myAnimation
var myAnimation = myElement.createAnimation();
</pre>

We now have an <code>Animation</code> object available in the variable myAnimation that we can create our animation effects on.

###Using <code>addAnimation()</code>

<code>Animation</code> object have a method called <code>addAnimation()</code> used to add an actual animation to our animation object.  We can add as many animations as we wish to any object. Each animation consists of a <span class="caps">CSS</span> property we wish to change, and a source and destination value.  This makes the  function prototype for <code>addAnimation()</code> as follows:

<pre>
<code>@addAnimation( &lt;String&gt; CSS property, &lt;String&gt; from, &lt;String&gt; to)</code>
</pre>

Going back to our animation named myAnimation, we wish to add the following effects:

<ol>
<li>We wish to resize the "myAnimatableElement" element width from <samp>0</samp> to <samp>200</samp> pixels.</li>
<li>We wish to resize the "myAnimatableElement" element height from <samp>0</samp> to <samp>200</samp> pixels.</li>
<li>We wish to change it's opacity from <samp>0.0</samp> to <samp>1.0</samp>.</li>
</ol>

We will need to add three animations to myAnimation, one for each property we wish to change:

<pre>
<code>// Changing the width ...
myAnimation.addAnimation( 'width', '0px', '200px' );
// ... and the height ...
myAnimation.addAnimation( 'height', '0px', '200px' );
// ... and also the opacity ...
myAnimation.addAnimation( 'opacity', '0.0', '1.0' );</code>
</pre>

The properties we have added to myAnimation will, when they are run, be executed synchronously: Each of our new animation properties start at the same time, and end at the same time when the animation is run.

There is no limit to the number of animation effects we can add to any given animation, but keep in mind that adding too many effects may have an impact on animation performance.

###Running the animation using <code>run()</code>

When we have added all of the properties we want to our animation, we can run them using the <code>run()</code> method. This method takes no arguments, and simply executes the animation directly.

<a href="simpleAnimation.html">View the sample animation</a>.

###Adjusting animation speed

Adjusting the overall speed of the animation is done by changing the <code>Animation</code> object's <code>speed</code> property. Setting this to lower values makes the animation run slower

<pre>
<code>// Slow down animation by setting speed to 3;
myAnimation.speed = 3;</code>
</pre>

The default value of the <code>speed</code> property is <samp>6</samp>.

###Animation acceleration profiles

Our first, simple example showed a very simple animation, we shall now proceed with modifying how the animation speeds up and/or slows down during the period of animation.

By default, animations move at a constant interval, but this can be changed by assigning a function to the <code>accelerationProfile</code> attribute on an <code>Animation</code> object. An <code>Animation</code> object has four predefined such acceleration profiles that can be set for the animation.

####Sine acceleration profile

This profile gradually speeds the animation up at the start of the animation, and slows it down again when nearing the end. The name of the method is <code>sine</code>, and is set like this, on myAnimation:

<pre>
<code>myAnimation.accelerationProfile = myAnimation.sine;</code>
</pre>

####"accelerate" acceleration profile

Another pre-made acceleration profile, is to have the animation start slowly, to gradually increase speed as it nears the end of the animation:

<pre>
<code>myAnimation.accelerationProfile = myAnimation.accelerate;</code>
</pre>

####"decelerate" acceleration profile

This effect is the exact opposite of "accelerate" the animation will start by being quick, and then become gradually slower.

<pre>
<code>myAnimation.accelerationProfile = myAnimation.decelerate;</code>
</pre>

####Custom acceleration profiles

If the pre-provided acceleration profiles don't suit you, you can easily use your own, as the <code>accelerationProfile</code> is a function pointer you can assign your own function to.  In the following example, <code>myAnimation</code> will run through 1/4 of the animation, and then have it's speed set to a constant value.

<pre>
<code>myAnimation.accelerationProfile=function(x){
    var speed_constant = 1/25;
    if (x&lt;25){
      return speed_constant+x/25;
    } else {
      return speed_constant+1;
    }
  };</code>
</pre>

In <a href="customAcceleration.html">this example</a> we see this custom animation compared to the predefined profiles <code>sine</code> and <code>constant</code>.

###Callbacks

Animations using the <code>Animation</code> class has support for two types of callbacks: Callbacks that are executed before the animation runs, and callbacks that are executed after the animation has finished.

####onstart callback

The <code>onstart</code> callback is executed right before the animation is run, and can for instance be used to synchronise two animations. The callback is added as a function reference.

<pre>
<code>// Sync the start of 'mySecondAnimation' to the start of 'myAnimation'
myAnimation.onstart = function(){
  mySecondAnimation.run();
}</code>
</pre>

Note that because of variable scope, we cannot simply do the following, but instead use the syntax as described above:

<pre>
<code>myAnimation.onstart = mySecondAnimation.run;</code>
</pre>

####onfinish callback

The <code>onfinish</code> callback is executed when an animation has finished. An example use of this is to synchronise the start of another animation to the end of another.  The usage is similar to the <code>onstart</code> callback:

<pre>
<code>// Sync the start of 'mySecondAnimation' to the end of 'myAnimation'
myAnimation.onfinish = function(){
  mySecondAnimation.run();
}</code>
</pre>

###Animation Events 

When animations starts, finishes, or are interrupted (stopped), events will be raised that you, as a widget user can optionally choose to listen to.

####The <code>OAnimationStart</code> event

In the same way the <code>onstart</code> callback is executed when the <code>run()</code> method is invoked on an animation, the <code>OAnimationStart</code> event is raised when the <code>run()</code> method is invoked:

<pre>
<code>// execute some code when an animation is executed
myAnimation.addEventListener('OAnimationStart',function(ev){
  // run some code when the animation is started
},false);</code>
</pre>

####The <code>OAnimationFinish</code> event

In the same way the <code>onfinish</code> callback is executed when the animation has finished executing, the <code>OAnimationDone</code> event is raised when an animation is finished.

<pre>
<code>// execute some code when an animation is finished
myAnimation.addEventListener('OAnimationFinish',function(ev){
  // run some code when the animation has finished
},false);
</code></pre>

####The <code>OAnimationStop</code> event

If an animation is interrupted before it has completely finished, the event <code>OAnimationStop</code> event will be raised.

<pre>
<code>// execute some code if an animation is interrupted
myAnimation.addEventListener('OAnimationStop',function(ev){
  // run some code when the animation is interrupted
},false);</code>
</pre>

####The <code>OAnimationFrame</code> event

The <code>OAnimationFrame</code> event is raised whenever a single frame in an animation has finished rendering.

<pre>
<code>// execute some code for each frame in an animation
myAnimation.addEventListener('OAnimationFrame',function(ev){
  // run some code for the current frame
},false);</code>
</pre>

####Events example: Measuring <span class="caps">FPS</span>

<a href="fpsmeter.html">This example</a> demonstrates how we can use the <code>OAnimationStart</code> and <code>OAnimationFrame</code> events to build an <span class="caps">FPS</span> meter into one of our animations.

### JSDoc
Documentation can be generated with JSDoc (either version [2](http://code.google.com/p/jsdoc-toolkit/) or [3](https://github.com/micmath/jsdoc)).