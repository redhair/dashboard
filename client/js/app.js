var Dashboard = (function() {
	'use-strict';

	var $port = 5000;
	var $url  = 'http://localhost';
	var $api  = $url + ':' + $port + '/api';

	return angular.module('Dashboard', ['ngRoute', 'ngResource', 'ngMessages', 'ngStorage', 'ngAnimate'])
		.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
			$httpProvider.interceptors.push('httpRequestInterceptor');

			$routeProvider.when('/register', {templateUrl: 'views/register.html', controller: 'loginController'});
			$routeProvider.when('/login', {templateUrl: 'views/login.html', controller: 'loginController'});
			$routeProvider.when('/organizations', {templateUrl: 'views/organizations.html', controller: 'organizationController'});
			$routeProvider.when('/organizations/new', {templateUrl: 'views/new_organization.html', controller: 'organizationController'});
			$routeProvider.when('/organizations/:slug_id/settings', {templateUrl: 'views/orgsettings.html', controller: 'organizationController'});
			$routeProvider.when('/organizations/:slug_id/categories', {templateUrl: 'views/categories.html', controller: 'categoryController'});
			$routeProvider.when('/organizations/:slug_id/categories/new', {templateUrl: 'views/new_category.html', controller: 'categoryController'});
			$routeProvider.when('/organizations/:slug_id/:category/settings', {templateUrl: 'views/categorysettings.html', controller: 'categoryController'});
			$routeProvider.when('/organizations/:slug_id/:category', {templateUrl: 'views/products.html', controller: 'productController'});
			$routeProvider.when('/organizations/:slug_id/:category/new', {templateUrl: 'views/new_product.html', controller: 'productController'});
			$routeProvider.when('/organizations/:slug_id/:category/:product/settings', {templateUrl: 'views/productsettings.html', controller: 'productController'});
			$routeProvider.when('/products/all', {templateUrl: 'views/products.html', controller: 'productController'});
			$routeProvider.otherwise({redirectTo: '/organizations'});

			$locationProvider.html5Mode({enabled: true, requireBase: false});

		}])
		.controller('mainController', ['$scope', '$localStorage', function($scope, $localStorage) {
			$scope.$on('$viewContentLoaded', function(event) {
			    setTimeout(function(){
			      $('.overlay').fadeOut(800);
			    }, 0);
			});

			if ($localStorage.theme) {
				$scope.myTheme = $localStorage.theme;
			} else {
				$localStorage.theme = 'light';
				$scope.myTheme = $localStorage.theme;
			}

			$scope.newTheme = function() {
				$localStorage.theme = $('#inputTheme').val();
				$scope.myTheme = $localStorage.theme;
			}
		}])
		.factory('Organization', function($resource) {
			return $resource($api + '/organizations/:slug_id', {}, {
				'update': {
					method: 'PUT'
				}
			});
		})
		.factory('Category', function($resource) {
			return $resource($api + '/organizations/:slug_id/categories', {}, {
				'get': {
					method: 'GET',
					url: $api + '/organizations/:slug_id/:category',
					isArray: true
				},
				'save': {
					method: 'POST',
					isArray: true
				},
				'update': {
					method: 'PUT'
				}
			});
		})
		.factory('Product', function($resource) {
			return $resource($api + '/organizations/:slug_id/:category/:product', {}, {
				'query': {
					method: 'GET',
					url: $api + '/organizations/:slug_id/categories/:category',
					isArray: true
				},
				'get': {
					isArray: true
				},
				'save': {
					method: 'POST'
				},
				'update': {
					method: 'PUT'
				},
				'all': {
					method: 'GET',
					isArray: true,
					url: $api + '/products/all'
				}
			});
		})
		.factory('User', function($resource) {
			return $resource($api + '/signup', {}, {});
		})
		.factory('Authentication', function($http, $localStorage) {
			var service = {};
	 
			service.Login = Login;
			service.Logout = Logout;
	 
			return service;
	 
			function Login(email, password, callback) {
				$http({
					method: 'POST',
					url: $api + '/login',
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					transformRequest: function(obj) {
				        var str = [];
				        for(var p in obj)
				        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
				        return str.join('&');
				    },
					data: { email: email, password: password }
				}).success(function(response) {
					if (response.token) {
						$localStorage.currentUser = { email: email, token: response.token };
						callback(null, true);
					} else {
						callback({ 'error': 'No token recieved' }, false);
					}
				}).catch(function(err) {
					callback(err, false)
				});
			}
	 
			function Logout() {
				// remove user from local storage and clear http auth header
				delete $localStorage.currentUser;
				$http.defaults.headers.common.Authorization = '';
			}
		})
		.factory('httpRequestInterceptor', function($localStorage, $location) {
		  return {
		    request: function(config) {
		      console.log(config)
		      if ($localStorage.currentUser) {
		      	config.headers['Authorization'] = 'Bearer ' + $localStorage.currentUser.token;
		      }

		      return config;
		    },
		    response: function(response) {
		  		console.log(response.status)

		  		return response;
		  	},
		  	responseError: function(rejection) {
		  		console.log(rejection);
		  		if (rejection.status === 401) {
		  			$location.path('/login');
		  		}

		  		return rejection;
		  	}
		  };
		})
		.directive('backImg', function() {
			return function(scope, element, attrs){
				var url = attrs.backImg;
				element.css({
					'background-image': 'url(' + url + ')',
					'background-size': 'auto 100%'
				});
			};
		})
})();