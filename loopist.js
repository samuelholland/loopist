$(function() {
    var bpm = 117;
    var baseDirectory = 'loops/space-loops-mp3/';
    
    /**
     *  Todo:
     *   - quantize music playback
     *      - when loops are stopped check if any loops are running, clearInterval if intervalId is truthy
     *      - fix first loop playback gap bug
     *      - make quantize length selectable
     *   - think about design / additional features
     *   - node server to automate group creation
     *     - setup an openshift node server
     *     - maybe introduce the jungle loops with a different loop set
     *   - when ready, put on github pages, then ISMSS, then the world!
     *   - UI design
     * 
     *  ToDONE:
     *   - hook up volume slider
     *   - template the button groups' html using partial templates
     *   - when no loops are playing: play first loop
     *          - they are quantized 16.410 seconds.
     *          - quantize to 4.1025
     *      - when loops are playing: enqueue loop
     */
    
    var groups = [
        {
            name: "drums",
            loops: ['Drums 1|Drumset 1.mp3', 'Drums 2|Drumset 2.mp3', 'Drums 3|Drumset 2.mp3']
        },
        {
            name: "bass",
            loops: ['Bass 1.mp3', 'Bass 2.mp3', 'Bass 3.mp3']
        },
        {
            name: "fm percussion",
            loops: ['Perc 1|FM Percussion 1.mp3', 'Perc 2|FM Percussion 2.mp3', 'Perc 2|FM Percussion 3.mp3']
        },
        {
            name: "jazzy",
            loops: ['Jazzy 1|Jazzy Chords 1.mp3', 'Jazzy 2|Jazzy Chords 2.mp3', 'Jazzy 3|Jazzy Chords 3.mp3']
        },
        {
            name: "metal pad",
            loops: ['Metal 1|Metal Pad 1.mp3', 'Metal 2|Metal Pad 2.mp3', 'Metal 3|Metal Pad 3.mp3']
        },
        {
            name: "wood percussion",
            loops: ['Wood 1|Wood Percussion 1.mp3', 'Wood 2|Wood Percussion 2.mp3', 'Wood 3|Wood Percussion 3.mp3']
        },
        {
            name: "wurly",
            loops: ['Wurly 1.mp3', 'Wurly 2.mp3', 'Wurly 3.mp3']
        },
        {
            name: "sines",
            loops: ['Sines 1.mp3', 'Sines 2.mp3', 'Sines 3.mp3']
        }
    ];
    
    groups.forEach(function(group) {
        group.loops = group.loops.map(function(loop) {
            return {
                fileName: contains(loop, '|') ? after(loop, '|') : loop, 
                loopName: contains(loop, '|') ? before(loop, '|') : loop.replace('.mp3', '')
            }; 
        });
    });
    
    var loadedGroups = new ListMap();
    
    //TODO: Loading bar here!
    groups.forEach(function(group) {
        loadedGroups.add(group.name, {
            name: group.name,
            loops: group.loops.map(function(loop){
                return {
                    fileName: loop.fileName,
                    howl: new Howl({
                        urls: [baseDirectory + loop.fileName],
                        loop: true,
                        buffer: true
                    })
                };
            })
        });
    });
    
    var source   = $("#button-groups-template").html();
    var template = Handlebars.compile(source);
    Handlebars.registerPartial("button-container", $("#button-container-template").html()); 
    var context = {
        groups: groups
    };
    
    var resultingHtml = template(context);
    $("#button-scratchpad").html(resultingHtml);
    //the list of currently playing loops
    var playingLoops = [];
    //the loops we want to play the next time quantizeCallback() gets called and it's at an appropriate time
    var queuedLoops = [];
    //the interval we want to quantize the music to
    var quantizeInterval = 4.1025 * 1000;
    //the id we get from calling requestAnimationFrame, which we can use to cancel the quantization cycle
    var quantizeAnimationFrameID = null;
    //the last time (in milliseconds (MS)) when the quantizeCallback function was called by requestAnimationFrame 
    var lastAnimationFrameTime = null;
    //the difference in time (in MS) since we last played all the loops in queuedLoops
    // we play all the loops in queuedLoops when: (quantizeDelta > quantizeInterval) === true
    var quantizeDelta = 0;
    
    //The function that gets called by requestAnimationFrame
    function quantizeCallback() {
        //if this value doesn't currently have a value, we want to make it the current time in MS
        if (lastAnimationFrameTime === null) {
            // set it to the current time in milliseconds
            lastAnimationFrameTime = new Date().getTime();
            //call requestAnimationFrame, passing in this function to get re-called by the browser ASAP
            // ASAP usually being ~16 milliseconds
            // we keep track of the 
            quantizeAnimationFrameID = requestAnimationFrame(quantizeCallback);
            
            //return, because we just started looping, and quantizeDelta will still be 0.
            return;
        }
        
        //grab the current time in MS
        var currentTime = new Date().getTime();
        //get the difference between now and when we last called this function.
        quantizeDelta += currentTime - lastAnimationFrameTime;
        //set the last time we called this function to now, 
        // so that we can use it the next time this function gets called.
        lastAnimationFrameTime = currentTime;
        
        //if the time since we last played all the loops is greater than the quantization interval
        // play all the loops
        if (quantizeDelta > quantizeInterval) {
            //reset the quantizeDelta so it continues to count back up to the quantization interval
            quantizeDelta = 0;
            
            //while the queuedLoops list is not empty (since 0 is "falsy"),
            while(queuedLoops.length) {
                // remove each loop off the end of the list (using pop()) and
                // play it.
                var loop = queuedLoops.pop();
                //play it
                loop.howl.play();
                //add it to the list of playing loops for easy stoppage.
                playingLoops.push(loop);
            }
            // log for debugging purposes.
            console.log("quantized: " + (currentTime / 1000));
        }
        
        //request that this function be called ASAP (~16 MS from now)
        // we do this at the end, so that in case there is an error above,
        // this won't get called and throw that error ~60/second
        quantizeAnimationFrameID = requestAnimationFrame(quantizeCallback);
    }
    
    //stops the quantization loop by calling cancelAnimationFrame() with the current quantizeAnimationFrameID
    function stopQuantizeLoop() {
        // only try to cancel if the id exists
        if (quantizeAnimationFrameID) {
            cancelAnimationFrame(quantizeAnimationFrameID);
            //set the id to null so this function won't attempt to cancel an id that's already been cancelled if called again
            quantizeAnimationFrameID = null;
            //set the amount of time since last playing all loops to 0
            quantizeDelta = 0;
            //set the last time we called quantizeCallback to null so it gets initialized
            //  when quantizeCallback is called.
            lastAnimationFrameTime = null;
            //set queuedLoops to an empty list so we won't accidentally play loops we shouldn't
            queuedLoops = [];
        }
    }
    
    //starts the cycle of loop quantization or enqueues a loop to be played,
    // if that cycle is already in progress.
    function startOrEnqueue(loop) {
        //if we already are playing loops
        if (quantizeAnimationFrameID) {
            //add the loop to the list to be played
            queuedLoops.push(loop);
        } else {
            //play the loop
            loop.howl.play();
            //request that we call the quantizeCallback ASAP (~16 MS from now)
            //write down the quantization id so we can cancel it.
            quantizeAnimationFrameID = requestAnimationFrame(quantizeCallback);
        }
    }
    
    
    function playLoop(group, fileName) {
        if (!fileName) {
            throw TypedError("IllegalArgument", "fileName is required!");
        }
        var loops = loadedGroups.get(group).loops;
        
        loops.forEach(function(loop) {
            if (loop.fileName == fileName) {
                //TODO: Fix this! Already running loop shouldn't stop when clicked on
                loop.howl.stop();
                startOrEnqueue(loop);
            } else {
                loop.howl.stop();
            }
        });
    }
    
    function stopAll(){
        playingLoops.forEach(function(loop) {
            loop.howl.stop();
        });
        
        //cancel the current request for quantizeCallback to be called ASAP
        // and reset the variables it uses.
        stopQuantizeLoop();
        playingLoops = [];
    }
    
    $(".clip-button").click (function(){
        var $playButton = $(this);
        
        playLoop($playButton.attr("data-group"), $playButton.attr("data-clip"));
    });
    
    $(".stop-button").click (function(){
        stopAll();
    });
    
    $(".stop-group-button").click (function(){
        var $stopGroupButton = $(this);
        
        var group = $stopGroupButton.attr("data-group");
        
        var loadedGroup = loadedGroups.get(group);
        
        loadedGroup.loops.forEach(function(loop){
            removeFromList(playingLoops, loop, true);
            loop.howl.stop();
        });
    });
    
    $(".volume-control").change (function(){
        var volume = $(this).val();
        Howler.volume(volume);
    });
    
    function TypedError(type, message) {
        return {
            type: type,
            message: message,
            toString: function() { return type + ": " + message; }
        };
    }
    
    function contains(haystack, needle) {
        if (!haystack || !needle) {
            return false;
        }
        
        return haystack.indexOf(needle) > -1;
    }
    
    function before(string, delimiter) {
        return string.substring(0, string.indexOf(delimiter));
    }
    
    function after(string, delimiter) {
        return string.substring(string.indexOf(delimiter) + 1);
    }
    
    function removeFromList(list, thingToRemove, removeAllThings) {
        for (var i = 0; i < list.length; i++) {
            if(list[i] === thingToRemove) {
               list.splice(i, 1);
               
               if (!removeAllThings) {
                   break;
               }
               i--;
            }
        }
    }
});