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
                session: 'user:mip|mip',
                lastLogin: '15/07/2015 12:50',
                // Calculated fields
                name: function () {
                    return (this.get("firstname").trim() + " " + this.get("lastname").trim()).trim();
                }
            },
            
            account: {
                accountNumber: 'NIC097',
                fromDate: '04/03/2006',
				status: 'Active',                
                points: 420,
                rentalsPoints: 10,
                rentalsCash: 7,
                // Calculated fields
                pointsText: function () {
                    return this.get("points") + " points";
                },
                rentals: function() {
                    return this.get("rentalsPoints") + this.get("rentalsCash");
                }
            },
            
            currentMovie: {},
			
/*			dsMovie: {
				searchMovies {
					rqAuthentication: '',
					rqDataMode: 'var/json',
					rqService: 'dsMovie:searchMovies',
					ipiMaxRecords: 100,
				
					clear: function() {
						this.rqAuthentication = window.APP.models.user.get('session');
						console.log('Cleared the dsMovie.searchMovies request:\n',);
					}
				}
			},
*/

            // Models per page
            home: {
                title: 'MIP DVD Store'
            },
            
            browse: {
                data: new kendo.data.DataSource({}),
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
                searchMovies: function () {
                    $("#criteria").data("kendoMobileModalView").close();
					
					// dsMovie.searchMovies.clear();

                    $.ajax({
                        type: 'GET',
                        url: 'http://trn.coretech.mip.co.za/cgi-bin/wspd_cgi.sh/WService=wsb_000trn/rest.w',
                        data: {
                            rqAuthentication: window.APP.models.user.get('session'),
                            rqDataMode: 'var/json',
                            rqService: 'dsMovie:searchMovies',
							ipcMovieTitle: this.browse.get('title'),
							ipiMovieYearFrom: this.browse.get('yearFrom'),
							ipiMovieYearTo: this.browse.get('yearTo'),
							ipcMovieTypeKey: this.browse.get('type'),
							ipcSearchMethod: 'begins',
                            ipiMaxRecords: 50
                        },
                        success: function (pData) {

							var DataSource   = window.APP.models.browse.data;
							var CurrentMovie = window.APP.models.currentMovie;

							console.log('The whole data object returned from successful AJAX call: \n', pData);

							// First clear the data, then assign it to the response
							DataSource.fetch(function () { DataSource.data([]); });
							DataSource.fetch(function () {
								DataSource.data(pData.rqResponse.dsMovie.ttMovie);
								console.log("DataSource:", DataSource);
							});

                        },  // success

                        error: function (data, error, code) {
                            alert('Ajax Error:', data, error, code);
                        }  // error
                    });
                    
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
            
            profile: {
                title: 'Profile'
            },

            register: {
                title: 'Register'
            },

            login: {
                title: 'Login'
            },

            accounts: {
                title: 'Account'
            },

            transactions: {
                title: 'Transactions'
            },

            rentals: {
                title: 'Rentals'
            },

            prices: {
                title: 'Prices'
            },

            settings: {
                title: 'Settings'
            }
        },

        // General Functions
        back: function() {
            app.navigate("#:back");
        },
        
        confirmLogout: function() {
            navigator.notification.confirm('Are you sure you want to log out?', APP.logout, "Confirm Logout" );
        },

        logout: function(pButton) {
            if (pButton > 1) return;
            
            var d = new Date();
            var n = d.toLocaleString();
            console.log("DateString:",n);

            window.APP.models.user.session = '';
            window.APP.models.user.lastLogin = n;

            app.navigate("views/login.html");
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
            initial: (window.APP.models.user.session == '' ? 'views/login.html' : 'views/home.html')
        });

    }, false);


}());