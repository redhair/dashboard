(function() {
  'use-strict';

  Dashboard.controller('productController', ['$scope', '$location', 'Product', function($scope, $location, Product) {
    $scope.title = "Products";
    $scope.backButton = true;
    $scope.pathname = window.location.pathname;
    $scope.slug_id = $scope.pathname.split("/")[2];
    $scope.category_id = $scope.pathname.split("/")[3];
    $scope.product_id = $scope.pathname.split("/")[4];
    $scope.action = $scope.pathname.split("/")[$scope.pathname.split("/").length - 1]; 

    console.log("controller: prods");
    console.log("action: " + $scope.action);
    if ($scope.action === 'settings') {
      $scope.title = "Product Settings";
      $scope.product = getSingleProduct($scope.product_id);

      $scope.handleBackButton = function() {
        $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
      }
    } else if ($scope.action === 'new') {
      $scope.title = "New Product";
      $scope.handleBackButton = function() {
        $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
      }
    } else if ($scope.action === 'all') {
      $scope.title = "All Products";
      $scope.products = getAllProducts();
    } else {
      $scope.title = "Products";
      $scope.products = getOrgProducts();
      $scope.handleBackButton = function() {
        $location.url('/organizations/' + $scope.slug_id + '/categories');
      }
    }

    function getAllProducts() {
      return Product.all(function() {
        console.log($scope.products)
      });
    }

    function getOrgProducts() {
      return Product.query({
        slug_id: $scope.slug_id,
        category: $scope.category_id
      }, function() {
        console.log($scope.products)
      });
    }

    function getSingleProduct(product_id) {
      return Product.get({
        slug_id: $scope.slug_id,
        category: $scope.category_id,
        product: product_id
      }, function(product) {
        $scope.product = product;
        $scope.colors = JSON.parse($scope.product[0].colors);
        $scope.sizes = JSON.parse($scope.product[0].sizes);
        console.log($scope.colors)
      });
    }

    $scope.createNewProduct = function createNewProduct() {
      var newProdForm = $('#new_product');
      var name = newProdForm.find('#name').val();
      var price = newProdForm.find('#price').val();
      var desc = newProdForm.find('#description').val();
      var image = newProdForm.find('#logo_image').val();
      var colors = {};
      var sizes = {};

      $('.colorOption').each(function() {
        var label = $(this).find('[id*="color_label_"]').val();
        var value = $(this).find('[id*="color_selection_"]').val();
        colors[label] = value;
      });

      $('.sizeOption').each(function() {
        var label = $(this).find('[id*="size_label_"]').val();
        var value = parseInt($(this).find('[id*="size_price_"]').val());
        sizes[label] = value;
      });

      console.log(colors, sizes)

      var productConfig = {
        "name": name,
        "desc": description,
        "price": price,
        "color": JSON.stringify(colors),
        "sizes": JSON.stringify(sizes)
      }

      console.log(productConfig)

      Product.save({
        slug_id: $scope.slug_id,
        category: $scope.category_id
      }, productConfig, function(msg) {
        $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
      });
    }

    $scope.updateProduct = function updateProduct() {
      var prodForm = $('#edit_product');
      var prodName = prodForm.find('#name').val();
      var prodPrice = prodForm.find('#price').val();
      var description = prodForm.find('#description').val();
      var colors = {};
      var sizes = {};

      $('.colorOption').each(function() {
        var label = $(this).find('[id*="color_label_"]').val();
        var value = $(this).find('[id*="color_selection_"]').val();
        colors[label] = value;
      });

      $('.sizeOption').each(function() {
        var label = $(this).find('[id*="size_label_"]').val();
        var value = parseInt($(this).find('[id*="size_price_"]').val());
        sizes[label] = value;
      });

      var prodConfig = {
        "name": prodName,
        "desc": description,
        "price": prodPrice,
        "color": JSON.stringify(colors),
        "sizes": JSON.stringify(sizes)
      };

      console.log(prodConfig)

      Product.update({
        slug_id: $scope.slug_id,
        category: $scope.category_id,
        product: $scope.product_id
      }, prodConfig, function(msg) {
        $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
      })
    }

    $scope.deleteProduct = function deleteProduct() {
      Product.remove({
        slug_id: $scope.slug_id,
        category: $scope.category_id,
        product: $scope.product_id
      }, function() {
        $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
      });
    }

    $scope.onFormChange = function onFormChange() {
      console.log('Form Changed');
      $scope.handleBackButton = function() {
        $('#promptLeave').modal();
      }
    }

    $scope.goBack = function goBack() {
      console.log("going back")
      $('#promptLeave').modal('hide');
      $('#promptLeave').on('hidden.bs.modal', function() {
        $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
        $scope.$apply()
      });
    }

    $scope.goTo = function goTo(location) {
      $location.url(location);
    }
  }]);
})();