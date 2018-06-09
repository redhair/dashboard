(function() {
  'use-strict';

  Dashboard.controller('categoryController', ['$scope', '$location', '$http', '$route', 'Category', function($scope, $location, $http, $route, Category) {
    const params = $route.current.params;
    const action = getAction();
    $scope.title = "Categories";
    $scope.backButton = true;
    $scope.pathname = window.location.pathname;
    $scope.slug_id = $scope.pathname.split("/")[2];

    if (action === 'categories') {
      $scope.title = "Categories";
      $scope.categories = getAllCategories();
      $scope.handleBackButton = function() {
        $location.url('/organizations');
      }
    } else if (action === 'settings') {
      $scope.title = "Category Settings";
      $scope.editSettings = true;
      var category = decodeURIComponent($scope.pathname.split("/")[3]);
      $scope.category = getSingleCategory(category);
      $scope.handleBackButton = function() {
        console.log($scope.slug_id);
        $location.url('/organizations/' + $scope.slug_id + '/categories');
      }
    } else if (action === 'new') {
      $scope.title = "New Category";
      $scope.createNew = true;
      $scope.handleBackButton = function() {
        $location.url('/organizations/' + $scope.slug_id + '/categories');
      }
    }

    function getAllCategories() {
      console.log("in")
      return Category.query({
        slug_id: $scope.slug_id 
      });
    }

    function getSingleCategory(category) {
      return Category.get({
        slug_id: $scope.slug_id,
        category: category
      }, function(res) {
        //console.log(res)
        $scope.category = res[0];
      });
    }

    $scope.createResource = function createResource() {
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

      Category.save({
        slug_id: $scope.slug_id
      }, catConfig, function(res) {
        $location.url('/organizations/' + $scope.slug_id + '/categories');
      });
    }

    $scope.updateResource = function updateResource() {
      var catForm = $('#edit_popshop');
      var catName = catForm.find('#name').val();
      var description = catForm.find('#description').val();

      console.log($scope.category)

      var catConfig = {
        name: catName,
        id: $scope.category.category_id
      };

      console.log("updating cat:")
      console.log(catConfig)

      Category.update({
        slug_id: $scope.slug_id
      }, catConfig, function(msg) {
        console.log(msg)
        $location.url('/organizations/' + $scope.slug_id + '/categories');
      })
    }

    $scope.deleteResource = function deleteResource() {
      $('#promptDelete').on('hidden.bs.modal', function() {
        var deleteConfig = {
          'name': $scope.category.category_name
        };

        console.log($scope.slug_id)
        console.log(deleteConfig)

        /*
        Category.delete({
          slug_id: $scope.slug_id
        }, deleteConfig, function(res) {
          console.log(res);
          $location.url('/organizations/' + $scope.slug_id + '/categories');
        });
        */

        $http({
          method: 'DELETE',
          url: 'http://206.189.176.175/api/organizations/' + $scope.slug_id + '/categories',
          data: deleteConfig,
          headers: {'Content-Type': 'application/json'}
        }).then(function() {
          $location.url('/organizations/' + $scope.slug_id + '/categories');
        });
        
      });
      $('#promptDelete').modal('hide');
    }

    $scope.goTo = function goTo(location) {
      $location.url(location);
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

    function getAction() {
      var path = window.location.pathname.split('/');
      return path[path.length - 1];
    }
  }]);
})();