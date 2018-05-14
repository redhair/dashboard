(function() {
  'use-strict';

  Dashboard.controller('categoryController', ['$scope', '$location', '$http', 'Category', function($scope, $location, $http, Category) {
    $scope.title = "Categories";
    $scope.backButton = true;
    $scope.pathname = window.location.pathname;
    $scope.action = $scope.pathname.split("/")[$scope.pathname.split("/").length - 1];
    $scope.slug_id = $scope.pathname.split("/")[2]; 

    console.log("controller: cats");
    console.log("action: "+$scope.action);
    if ($scope.action === 'categories') {
      $scope.title = "Categories";
      $scope.categories = getAllCategories();
      $scope.handleBackButton = function() {
        $location.url('/organizations');
      }
    } else if ($scope.action === 'settings') {
      $scope.title = "Category Settings";
      var category = decodeURIComponent($scope.pathname.split("/")[3]);
      $scope.category = getSingleCategory(category);
      $scope.handleBackButton = function() {
        $location.url('/organizations/' + $scope.slug_id + '/categories');
      }
    } else if ($scope.action === 'new') {
      $scope.title = "New Category";
      $scope.handleBackButton = function() {
        $location.url('/organizations/' + $scope.slug_id + '/categories');
      }
    }

    function getAllCategories() {
      return Category.query({
        slug_id: $scope.slug_id 
      });
    }

    function getSingleCategory(category) {
      return Category.get({
        slug_id: $scope.slug_id,
        category: category
      }, function() {
        console.log("returning ")
        console.log($scope.category);
      });
    }

    $scope.createNewCategory = function createNewCategory() {
      var newCatForm = $('#new_popshop');
      var catName = newCatForm.find('#name').val();
      var description = newCatForm.find('#description').val();

      //send logo file to S3 server, then store that url in logo variable
      //var logo = newOrgForm.find('#logo_image').val();
      console.log(description);

      var catConfig = {
        "name": catName,
        "image": "http://via.placeholder.com/350x150",
        "description": description
      }

      Category.save({slug_id: $scope.slug_id}, catConfig, function(res) {
        $location.url('/organizations/' + $scope.slug_id + '/categories');
      });
    }

    $scope.updateCategory = function updateCategory() {
      var catForm = $('#edit_popshop');
      var catName = catForm.find('#name').val();
      var description = catForm.find('#description').val();

      console.log($scope.category)

      var catConfig = {
        name: catName,
        id: $scope.category[0].category_id
      };

      console.log("updating cat:")
      console.log(catConfig)

      Category.update({slug_id: $scope.slug_id}, catConfig, function(msg) {
        console.log(msg)
        $location.url('/organizations/' + $scope.slug_id + '/categories');
      })
    }

    $scope.deleteCategory = function deleteCategory() {
      console.log($scope.category[0].category_name)

      var deleteConfig = {
        name: $scope.category[0].category_name
      };

      $http({
        method: 'DELETE',
        url: 'http://localhost:3001/organizations/' + $scope.slug_id + '/categories',
        data: deleteConfig,
        headers: {'Content-Type': 'application/json;charset=utf-8'}
      }).then(function() {
        $location.url('/organizations/' + $scope.slug_id + '/categories');
      })
    }

    $scope.getProducts = function getProducts(cat, $event) {
      console.log($event.target.className)

      if ($event.target.className.includes("btn") ||
          $event.target.className.includes("switch")) {
        event.stopPropagation();
        return;
      }

      $location.url('/organizations/' + $scope.slug_id + '/' + cat.category_id);
    }
  }]);
})();