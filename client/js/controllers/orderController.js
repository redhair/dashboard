(function() {
  'use-strict';

  Dashboard.controller('orderController', ['$scope', '$http', '$location', '$route', 'Order', function($scope, $http, $location, $route, Order) {
    const params = $route.current.params;
    $scope.title = "Orders";
    $scope.orders = getAllOrders();
    //$scope.products = JSON.parse($scope.orders.products);
    $scope.backButton = false;

    function getAllOrders() {
      return Order.query(function(orders) {
        $scope.products = JSON.parse(orders[0].products);
      });
    }
  }]);
})();