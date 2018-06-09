(function() {
	'use-strict';

	Dashboard.controller('loginController', ['$scope', '$http', '$location', 'Authentication', 'User', function($scope, $http, $location, Authentication, User) {
		$scope.login = login;
		$scope.register = register;

		initController();

		function initController() {
		    //reset login status
		    Authentication.Logout();
		};

		function register() {
			var email = $('#email').val();
			var password = $('#password').val();
			var confirmation = $('#confirmPassword').val();

			if (!email || !password || !confirmation) {
				return;
			}

			if (password === confirmation) {
				var userConfig = {
					email: email,
					pass: password
				}

				User.save(userConfig, function() {
					$location.url('/login');
				});
			} else {
				$scope.error = 'Passwords do not match';
			}
		}

		function login() {
			var email = $('#email').val();
			var password = $('#password').val();

			if (!email || !password) {
				return;
			}

			Authentication.Login(email, password, function(err, result) {
				if (err) {
					if (err.status === 401) {
						$scope.error = 'Username or password is incorrect';
						$location.path('/login');
					}
				}

				if (result === true) {
					$location.path('/organizations');
				} else {
					$scope.error = 'Username or password is incorrect';
				}
			});
		};
	}]);
})();