$(function() {
    var bpm = 117;
    var baseDirectory = 'loops/space-loops-mp3/';
    var loadedGroups = { };
    
    /**
     *  Todo:
     *   - template the button groups' html
     *   - hook up volume slider
     *   - quantize music playback
     *   - think about design / additional features
     *   - node server to automate group creation
     *     - maybe introduce the jungle loops with a different loop set
     *     - setup an openshift node server
     *   - when ready, put on github pages
     */
    
    var groups = [
        {
            name: "drums",
            loops: ['Drumset 1.mp3', 'Drumset 2.mp3', 'Drumset 2.mp3']
        },
        {
            name: "bass",
            loops: ['Bass 1.mp3', 'Bass 2.mp3', 'Bass 3.mp3']
        },
        {
            name: "fm percussion",
            loops: ['FM Percussion 1.mp3', 'FM Percussion 2.mp3', 'FM Percussion 3.mp3']
        },
        {
            name: "jazzy",
            loops: ['Jazzy Chords 1.mp3', 'Jazzy Chords 2.mp3', 'Jazzy Chords 3.mp3']
        }
    ];
    
    if (false) {
        groups.forEach(function(group) {
            loadedGroups[group.name] = {
                name: group.name,
                loops: group.loops.map(function(loopName){
                    return new Howl({
                        urls: [baseDirectory + loopName],
                        loop: false
                    });
                })
            };
        });
    }
    
    var playingLoops = [];
    
    function playLoop(fileName, callback) {
        if (!fileName) {
            throw TypedError("IllegalArgument", "fileName is required!");
        }
        var loop = new Howl({
          urls: [baseDirectory + fileName],
          loop: false,
          onplay: function(){
              if (callback && typeof callback == "function") {
                  callback();
              }
          }
        });
        loop.play();
        playingLoops.push(loop);
    }
    
    function stopAll(){
        playingLoops.forEach(function(loop) {
            loop.stop();
            loop.unload();
        });
        
        playingLoops = [];
    }
    
    function TypedError(type, message) {
        return {
            type: type,
            message: message,
            toString: function() { return type + ": " + message; }
        };
    }
    
    $(".clip-button").click (function(){
        //stopAll();
        var $playButton = $(this);
        
        playLoop($playButton.attr("data-clip"), function() {
        });
    });
    
    $(".stop-button").click (function(){
        stopAll();
    });
    
//     function getGroupHtml(group) {
        
//     }
    
//     var button = $('<span class="btn btn-primary">Bass1</span>');
    
//     groups.forEach(function(group) {
//         // $("#groups").insert()
//     });
});