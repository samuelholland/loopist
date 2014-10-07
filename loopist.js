$(function() {
    var bpm = 117;
    var baseDirectory = 'loops/space-loops-mp3/';
    
    /**
     *  Todo:
     *   - quantize music playback
     *   - think about design / additional features
     *   - node server to automate group creation
     *     - setup an openshift node server
     *     - maybe introduce the jungle loops with a different loop set
     *   - when ready, put on github pages
     *   - UI design
     * 
     *  ToDONE:
     *   - hook up volume slider
     *   - template the button groups' html using partial templates
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
    
    var playingLoops = [];
    
    function playLoop(group, fileName) {
        if (!fileName) {
            throw TypedError("IllegalArgument", "fileName is required!");
        }
        var groupLoops = loadedGroups.get(group).loops;
        
        groupLoops.forEach(function(loop) {
            if (loop.fileName == fileName) {
                loop.howl.stop();
                loop.howl.play();
                playingLoops.push(loop);
            } else {
                loop.howl.stop();
            }
        });
    }
    
    function stopAll(){
        playingLoops.forEach(function(loop) {
            loop.howl.stop();
        });
        
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