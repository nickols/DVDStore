(function () {

    // store a reference to the application object that will be created
    // later on so that we can use it if need be
    var app;

    // create an object to store the models for each view
    window.APP = {
        models: {
            // DataModel for the whole application
            user: {
                firstname: 'Corne',
                lastname: 'Nickols',
                email: 'cornen@mip.co.za',
                birthday: '04/08/1979',
                session: 'user:guest|guest',
                lastLogin: '15/07/2015 12:50',
                // Calculated fields
                name: function () {
                    return (this.get("firstname").trim() + " " + this.get("lastname").trim()).trim();
                }
            },
            
            account: {
                fromDate: '04/03/2006',
                accountNumber: 'NIC097',
                points: 420,
                rentals: 17,
                // Calculated fields
                pointsText: function () {
                    return this.get("points") + " points";
                }
            },
            
            currentMovie: {},

            // Models per page
            home: {
                title: 'MIP DVD Store'
            },
            
            browse: {
                data: new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "mockmovies.js",
                            type: "get",
                            dataType: "json"
                        }
                    },
                    schema: {
                        data: "rqResponse.dsMovie.ttMovie"
                    }
                }),
                title: '',
                year: '',
                yearFrom: '',
                yearTo: '',
                type: '',
                // Calculated fields
                description: function () {
                    return this.get("title").trim() + " (" + this.get("year") + ")";
                },
                // Functions
                criteria: function () {
                    console.log("Get search criteria pop-up window");

                },
                searchMovies: function () {
                    console.log("Movie Title:", this.browse.get("title"),
                                "\nYear:", this.browse.get("yearFrom"), "-", this.browse.get("yearTo"),
                                "\nType:", this.browse.get("type"));
                    $("#criteria").data("kendoMobileModalView").close();
                },
                close: function() {
      				$("#criteria").data("kendoMobileModalView").close();
 				},
                show: function() {
                    window.APP.models.browse.data.filter([]);
                }
            },
            
            detail: {
                title: 'Movie Details',
                
                show: function() {
                    // Pull the movie obj number from the query string
                    var movieData =  window.APP.models.browse.data;
                    var location = window.location.toString();
                    var params = location.split('?')[1].split('&');
                    var obj = parseInt(params[0].split('=')[1]);

                    // Filter the DataSource bt ISBN to get the selected record
                    movieData.filter({ field: "dMovieObj", operator: "eq", value: obj });
                    window.APP.models.currentMovie = movieData.view()[0];
                    console.log("Current Movie:", window.APP.models.currentMovie);
                },
                hide: function() {
                    // When the user navigates away from the page, remove the filter
                   window.APP.models.browse.data.filter([]);
                }
            },

            settings: {
                title: 'Settings'
            },
            
            contacts: {
                title: 'Contacts',
                ds: new kendo.data.DataSource({
                    data: [{id: 1, name: 'Bob'}, {id: 2, name: 'Mary'}, {id: 3, name: 'John'}]
                }),
                alert: function (e) {
                    alert(e.data.name);
                }
            }
        },

        // General Functions
        back: function() {
            app.navigate("#:back");
        }
    };

    // this function is called by Cordova when the application is loaded by the device
    document.addEventListener('deviceready', function () {

        // hide the splash screen as soon as the app is ready. otherwise
        // Cordova will wait 5 very long seconds to do it for you.
        navigator.splashscreen.hide();

        app = new kendo.mobile.Application(document.body, {

            // comment out the following line to get a UI which matches the look
            // and feel of the operating system
            skin: 'flat',

            // the application needs to know which view to load first
            initial: 'views/home.html'
        });

    }, false);


}());