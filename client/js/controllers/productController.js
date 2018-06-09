(function() {
  'use-strict';

  Dashboard.controller('productController', ['$scope', '$location', '$route', 'Product', function($scope, $location, $route, Product) {
    const params = $route.current.params;
    const action = getAction();
    $scope.title = "Products";
    $scope.backButton = true;
    $scope.slug_id = params.slug_id;
    $scope.category_id = params.category;
    $scope.product_id = params.product;

    if (action === 'settings') {
      $scope.title = "Product Settings";
      $scope.product = getSingleProduct();
      $scope.editSettings = true;

      $scope.handleBackButton = function() {
        $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
      }
    } else if (action === 'new') {
      $scope.title = "New Product";
      $scope.createNew = true;
      $scope.product = new Product();
      $scope.product.images = [];
      $scope.product.colors = [];
      $scope.product.sizes = [];
      $scope.product.custom_fields = [];

      $scope.handleBackButton = function() {
        $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
      }
    } else if (action === 'all') {
      $scope.title = "All Products";
      $scope.backButton = false;
      $scope.products = getAllProducts();
    } else {
      $scope.title = "Products";
      $scope.products = getOrgProducts();

      $scope.handleBackButton = function() {
        $location.url('/organizations/' + $scope.slug_id + '/categories');
      }
    }

    function getAllProducts() {
      return Product.all(function() {});
    }

    function getOrgProducts() {
      return Product.query({
        slug_id: $scope.slug_id,
        category: $scope.category_id
      }, function() {});
    }

    function getSingleProduct() {
      return Product.get({
        slug_id: $scope.slug_id,
        category: $scope.category_id,
        product: $scope.product_id
      }, function(product) {
        $scope.product = product[0];
        $scope.product.colors = JSON.parse($scope.product.colors);
        $scope.product.sizes = JSON.parse($scope.product.sizes);
        $scope.product.custom_fields = JSON.parse($scope.product.custom_fields);
        for (var i = 0; i < $scope.product.images.length; i++) {
          $scope.product.images[i].associations = JSON.parse($scope.product.images[i].associations);
        }
      });
    }

    $scope.createResource = function createResource() {
      Product.save({
        slug_id: $scope.slug_id,
        category: $scope.category_id
      }, {
        name:  $scope.product.product_name,
        desc:  $scope.product.description,
        price: $scope.product.price,
        sku: $scope.product.sku,
        color: JSON.stringify($scope.product.colors),
        sizes: JSON.stringify($scope.product.sizes),
        custom_fields: JSON.stringify($scope.product.custom_fields)
      }, function(res) {
        $scope.product_id = res.data[0];
        updateImages();
      });
    }

    $scope.updateResource = function updateResource() {
      Product.update({
        slug_id: $scope.slug_id,
        category: $scope.category_id,
        product: $scope.product_id
      }, {
        name:  $scope.product.product_name,
        desc:  $scope.product.description,
        price: $scope.product.price,
        sku: $scope.product.sku,
        color: JSON.stringify($scope.product.colors),
        sizes: JSON.stringify($scope.product.sizes),
        custom_fields: JSON.stringify($scope.product.custom_fields)
      }, function(res) {
        updateImages();
      });
    }

    $scope.showImageConfig = function showImageConfig(img) {
      $scope.activeImage = img;
      $('#promptImageConfig').modal();
    }

    $scope.updateAssociations = function updateAssociations() {
      var img = $scope.product.images[$scope.product.images.indexOf($scope.activeImage)];

      img.associations = [];

      $('.mappingOption').each(function() {
        var attrLabel = $(this).find('[id*="attr_label_"]')[0].innerHTML;
        var checked = $(this).find('[id*="attr_checked_"]')[0].checked;

        img.associations.push({
          'label': attrLabel,
          'checked': checked
        });
      });
    }

    $scope.deleteImage = function deleteImage(that) {
      if (!that.image.hasOwnProperty('file')) {
        Product.deleteImage({
          slug_id: $scope.slug_id,
          category: $scope.category_id,
          product: $scope.product_id,
          image_id: that.image.image_id
        }, function(res) {});
      }

      $scope.product.images = $scope.product.images.filter(function(image) {
        return image.image_url !== that.image.image_url;
      });
    }

    //TODO: make so you dont have to update
    //images if no changes were made
    function updateImages() {
      var images = $scope.product.images;

      if (images.length > 0) {
        $('.overlay').fadeIn(800);
        [...images].reduce((p, _, i) => 
          p.then(_ => new Promise(resolve =>
            setTimeout(function() {
              if (images[i].hasOwnProperty('file')) {
                createImage(images[i]);
                resolve();
              } else {
                Product.updateImage({
                  slug_id: $scope.slug_id,
                  category: $scope.category_id,
                  product: $scope.product_id,
                  image_id: images[i].image_id
                }, {
                  associations: JSON.stringify(images[i].associations)
                }, function(res) {});
                resolve();
              }
            }, 1000)
        )), Promise.resolve())
        .then(() => {
          $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
          //$scope.$apply();
        });
      } else {
        $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
      }
    }

    function createImage(image) {
      Product.upload(function(data) {
        fetch(data.url, {
          method: 'PUT',
          body: image.file,
          headers: {
            'Content-Type': image.file.type
          }
        }).then(function(response) {
          Product.saveImage({
            slug_id: $scope.slug_id,
            category: $scope.category_id,
            product: $scope.product_id
          }, {
            name: data.key,
            url: 'https://my-advanced-node-blog.s3.amazonaws.com/' + data.key,
            associations: JSON.stringify(image.associations)
          }, function(imgRes) {});
        });
      });
    }

    $scope.deleteResource = function deleteResource() {
      $('#promptDelete').on('hidden.bs.modal', function() {
        Product.remove({
          slug_id: $scope.slug_id,
          category: $scope.category_id,
          product: $scope.product_id
        }, function() {
          $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
        });
      });
      $('#promptDelete').modal('hide');
    }

    $scope.showThumbnail = function showThumbnail(event) {
      var files = event.target.files;

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (function(file) {
          return function(e) {
            imageIsLoaded(e, file);
          }
        })(file);
      }
    }

    function imageIsLoaded(e, file) {
      $scope.$apply(function() {
          $scope.product.images.push({
          'image_url': e.target.result,
          'file': file,
          'associations': []
        });
      });
    }

    $scope.onFormChange = function onFormChange() {
      $scope.handleBackButton = function() {
        $('#promptLeave').modal();
      }
    }

    $scope.goBack = function goBack() {
      $('#promptLeave').modal('hide');
      $('#promptLeave').on('hidden.bs.modal', function() {
        $location.url('/organizations/' + $scope.slug_id + '/' + $scope.category_id);
        $scope.$apply()
      });
    }

    $scope.goTo = function goTo(location) {
      $location.url(location);
    }

    function getAction() {
      var path = window.location.pathname.split('/');
      return path[path.length - 1];
    }

    $scope.isEmpty = function isEmpty(obj) {
      for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
          return false;
      }

      return true;
    }

    $scope.addColor = function addColor() {
      $scope.product.colors.push({
        label: '',
        value: ''
      });
    }

    $scope.removeColor = function removeColor(colorToRemove) {
      $scope.product.colors = $scope.product.colors.filter(function(color) {
        return color.$$hashKey !== colorToRemove.$$hashKey;
      });
    }

    $scope.addSize = function addSize() {
      $scope.product.sizes.push({
        label: '',
        value: ''
      });
    }

    $scope.removeSize = function removeSize(sizeToRemove) {
      $scope.product.sizes = $scope.product.sizes.filter(function(size) {
        return size.$$hashKey !== sizeToRemove.$$hashKey;
      });
    }

    $scope.addPersonalization = function addSize() {
      $scope.product.custom_fields.push({
        label: '',
        type: 'Type',
        price: ''
      });
    }

    $scope.removePersonalization = function removeSize(personalizationToRemove) {
      $scope.product.custom_fields = $scope.product.custom_fields.filter(function(personalization) {
        return personalization.$$hashKey !== personalizationToRemove.$$hashKey;
      });
    }
  }]);
})();