(function () {
    var currentMovie;
    var movieData =  window.APP.models.browse.data;
    window.movieDetail = {
        show: function() {
            // Pull the movie obj number from the query string
            var location = window.location.toString();
            var params = location.split('?')[1].split('&');
            var obj = parseInt(params[0].split('=')[1]);
            
            // Filter the DataSource bt ISBN to get the selected record
            movieData.filter({ field: "dMovieObj", operator: "eq", value: obj });
            currentMovie = movieData.view()[0];
        },
        hide: function() {
            // When the user navigates away from the page, remove the filter
           movieData.filter([]);
        }
        /*
        openLink : function() {
            // Will use the Cordova InAppBrowser plugin when deployed to a device. Opens a new window in
            // the simulator
            window.open(currentBook.amazon_url, '_blank', 'location=yes');
        }
        */
	};
}());
