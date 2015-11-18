(function () {

    // store a reference to the application object that will be created
    // later on so that we can use it if need be
    var app;

    // create an object to store the models for each view
    window.APP = {

        models: {
            // DataModel for the whole application
            user: {
                firstname: '',
                lastname: '',
                email: '',
                birthday: '',
                session: '',
                lastLogin: '',
                // Calculated fields
                name: function () {
                    return (this.get("firstname").trim() + " " + this.get("lastname").trim()).trim();
                }
            },
            
            account: {
                accountNumber: '',
                fromDate: '',
				status: '',
                points: 0,
                rentalsPoints: 0,
                rentalsCash: 0,
                // Calculated fields
                pointsText: function () {
                    return this.get("points") + " points";
                },
                rentals: function() {
                    return this.get("rentalsPoints") + this.get("rentalsCash");
                }
            },
            
            currentMovie: {},
			
			dsMovie: {
				searchMovies: {
					rqAuthentication: '',
					rqDataMode: 'var/json',
					rqService: 'dsMovie:searchMovies',
					ipiMaxRecords: 100,
				
					clear: function() {
						this.rqAuthentication = window.APP.models.user.get('session');
						// console.log('Cleared the dsMovie.searchMovies request:\n');
					}
				}
			},


            // Models per page
            home: {
                title: 'MIP DVDStore'
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
                            ipiMaxRecords: 100
                        },
                        success: function (pData) {
							var DataSource = window.APP.models.browse.data;
							// console.log('The whole data object returned from successful AJAX call: \n', pData);

							// First clear the data, then assign it to the response
							DataSource.fetch(function () { DataSource.data([]); });
							DataSource.fetch(function () {
								DataSource.data(pData.rqResponse.dsMovie.ttMovie);
								// console.log("DataSource:", DataSource);
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
				session: function() {
				  return window.APP.models.user.get('session');
				},
                show: function() {
                    // Pull the movie obj number from the query string
                    var movieData =  window.APP.models.browse.data;
                    var location = window.location.toString();
                    var params = location.split('?')[1].split('&');
                    var obj = parseInt(params[0].split('=')[1]);

                    // Filter the DataSource bt ISBN to get the selected record
                    movieData.filter({ field: "dMovieObj", operator: "eq", value: obj });
                    
                    window.APP.models.currentMovie = movieData.view()[0];
                    // console.log("Current Movie:", window.APP.models.currentMovie);
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
                title: 'Login',
				userName: '',
				password: '',
				
				show: function() {
					this.login.password = '';
				},


				login: function() {
					var Response;
					var UserData = window.APP.models.user;

                    $.ajax({
                        type: 'GET',
                        url: 'http://trn.coretech.mip.co.za/cgi-bin/wspd_cgi.sh/WService=wsb_000trn/rest.w',
                        data: {
                            rqAuthentication: 'user:' + this.login.get('userName') + '|' + this.login.get('password'),
                            rqDataMode: 'var/json',
                            rqService: 'miSession:establishSession'
                        },

                        success: function (pData) {
							Response = pData.rqResponse.rqAuthentication.split(':');
							UserData.session = (Response[0] == 'Session' ? Response[1] : '');
                        },  // success

                        error: function (data, error, code) {
                            alert('Ajax Error:', data, error, code);
                        }  // error
                    });  // $.ajax()

					
					// Get user details and populate User and Account objects
					$.ajax({
						type: 'GET',
						url: 'http://trn.coretech.mip.co.za/cgi-bin/wspd_cgi.sh/WService=wsb_000trn/rest.w',
						data: {
							rqAuthentication: Response,
							rqDataMode: 'var/json',
							rqService: 'miUser:getUserDetails',
							ipcUserMnemonic: "mimus",
							ipcUserCode: this.login.get('userName')
						},
						success: function (pData) {
							// Get user details and populate User and Account objects
							Response = pData.rqResponse;
							var Fullname = Response.opcUserName.split(' ');

							console.log("This", typeof this, this);
							console.log("Response:\n", Response);
							console.log(this.login.get('userName'));

							UserData.firstname = Fullname[0];
							UserData.lastname  = Fullname[1];
							UserData.email     = Response.opcUserEmail;
							UserData.lastLogin = new Date();
							UserData.lastLogin = UserData.lastLogin.toLocaleString();

							console.log("User:\n", firstname, lastname, email, lastLogin);
						},  // success
						error: function (data, error, code) {
							alert('Ajax Error!');
							console.log('Ajax Error:\n', data, '\n', error, '\n', code);
						}  // error

					});  // $.ajax()
					
					app.navigate("views/home.html");
				}   // login
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
            window.APP.models.user.session = '';
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