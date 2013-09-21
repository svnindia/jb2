App.Helpers = {
    timeAgoFormat: function( _date ){
        _date = new Date(_date);

        var seconds = Math.floor( ( new Date().getTime() ) - _date ) / 1000;

        function checkPlurality(interval){
            return interval > 1 ? 's': '';
        }

        var interval = Math.floor( seconds / 31536000 );
        if(interval >= 1){
            return interval + " year" + checkPlurality(interval);
        }
        interval = Math.floor( seconds / 2592000 );
        if(interval >= 1){
            return interval + " month" + checkPlurality(interval);
        }

        interval = Math.floor( seconds / 86400 );
        if(interval >= 1){
            return interval + " day" + checkPlurality(interval);
        }

        interval = Math.floor( seconds / 3600);
        if(interval >= 1){
            return interval + " hour" + checkPlurality(interval);
        }

        interval = Math.floor( seconds / 60);
        if(interval >= 1){
            return interval + " minute" + checkPlurality(interval);
        }
        return Math.floor(seconds) + " second" + checkPlurality(interval);

    }
};
