var Dashboard = (function() {
	'use-strict';

	var $port = 80;
	var $url  = 'http://dashboard.allcountyapparel.com';
	var $api  = $url + ':' + $port + '/api';

	return angular.module('Dashboard', ['ngRoute', 'ngResource', 'ngMessages', 'ngStorage', 'ngAnimate'])
		.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
			$httpProvider.interceptors.push('httpRequestInterceptor');

			$routeProvider.when('/register', {templateUrl: 'views/register.html', controller: 'loginController'});
			$routeProvider.when('/login', {templateUrl: 'views/login.html', controller: 'loginController'});
			$routeProvider.when('/orders', {templateUrl: 'views/orders.html', controller: 'orderController'});
			$routeProvider.when('/organizations', {templateUrl: 'views/organizations.html', controller: 'organizationController'});
			$routeProvider.when('/organizations/new', {templateUrl: 'views/orgForm.html', controller: 'organizationController'});
			$routeProvider.when('/organizations/:slug_id/settings', {templateUrl: 'views/orgForm.html', controller: 'organizationController'});
			$routeProvider.when('/organizations/:slug_id/categories', {templateUrl: 'views/categories.html', controller: 'categoryController'});
			$routeProvider.when('/organizations/:slug_id/categories/new', {templateUrl: 'views/new_category.html', controller: 'categoryController'});
			$routeProvider.when('/organizations/:slug_id/:category/settings', {templateUrl: 'views/categorysettings.html', controller: 'categoryController'});
			$routeProvider.when('/organizations/:slug_id/:category', {templateUrl: 'views/products.html', controller: 'productController'});
			$routeProvider.when('/organizations/:slug_id/:category/new', {templateUrl: 'views/productForm.html', controller: 'productController'});
			$routeProvider.when('/organizations/:slug_id/:category/:product/settings', {templateUrl: 'views/productForm.html', controller: 'productController'});
			$routeProvider.when('/products/all', {templateUrl: 'views/products.html', controller: 'productController'});
			$routeProvider.otherwise({redirectTo: '/login'});

			$locationProvider.html5Mode({enabled: true, requireBase: false});
		}])
		.controller('mainController', ['$scope', '$localStorage', function($scope, $localStorage) {
			$scope.$on('$viewContentLoaded', function(event) {
			    setTimeout(function() {
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
		.factory('Order', function($resource) {
			return $resource($api + '/order', {}, {
				'get': {
					isArray: true
				}
			});
		})
		.factory('Organization', function($resource) {
			return $resource($api + '/organizations/:slug_id', {}, {
				'get': {
					isArray: true
				},
				'update': {
					method: 'PUT'
				},
				'upload': {
					method: 'GET',
					url: $api + '/upload'
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
				},
				'delete': {
					method: 'DELETE'
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
					method: 'POST',
					url: $api + '/organizations/:slug_id/:category',
					isArray: false,
					transformResponse: function (data, headers) {
			            if (data == '') {
			                return;
			            }

			            return { data: JSON.parse(data) };
			        }
				},
				'update': {
					method: 'PUT'
				},
				'all': {
					method: 'GET',
					isArray: true,
					url: $api + '/products/all'
				},
				'upload': {
					method: 'GET',
					url: $api + '/upload'
				},
				'saveImage': {
					method: 'POST'
				},
				'updateImage': {
					method: 'PUT',
					url: $api + '/organizations/:slug_id/:category/:product/:image_id'
				},
				'deleteImage': {
					method: 'DELETE',
					url: $api + '/organizations/:slug_id/:category/:product/:image_id'
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
				        for(var p in obj) {
				        	str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
				        }
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
				delete $localStorage.currentUser;
				$http.defaults.headers.common.Authorization = '';
			}
		})
		.factory('httpRequestInterceptor', function($localStorage, $location) {
		  return {
		    request: function(config) {
		      if ($localStorage.currentUser) {
		      	config.headers['Authorization'] = 'Bearer ' + $localStorage.currentUser.token;
		      }

		      return config;
		    },
		    response: function(response) {
		  		return response;
		  	},
		  	responseError: function(rejection) {
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