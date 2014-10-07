function ListMap(_map) {
    var self = this;
    var list = [];
    
    var map = {};
    
    this.get = function(key) {
        if (!(key in map)) {
            return null;
        }
        return map[key];
    }
    
    this.getList = function() {
        return list;
    }
    
    this.clear = function() {
        list = [];
        map = {};
    }
    
    this.add = function(key, value) {
        if (!key || typeof value === 'undefined' || value === null) {
            throw TypedError("IllegalArgument", "Must have both a key and value!");
        }
        //adds to list map with the same key should overwrite the value, and as such remove it from the list if it existed before
        self.remove(key);
        
        list.push(value);
        map[key] = value;
    }
    
    this.copy = function() {
        return new ListMap(map);
    }
    
    this.remove = function(key) {
        if (key in map) {
            var value = map[key];
            
            var index = list.indexOf();
            if (index > -1) {
                list.splice(map[key], 1);
            }
            
            return value;
        }
    }
    
    if (_map && typeof _map === 'object') {
        for (var property in _map) {
            if (_map.hasOwnProperty(property)) {
                this.add(property, _map[property]);
            }
        }
    }

    function TypedError(type, message) {
        return {
            type: type,
            message: message,
            toString: function() { return type + ": " + message; }
        };
    }
}