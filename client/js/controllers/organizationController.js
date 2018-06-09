(function() {
  'use-strict';

  Dashboard.controller('organizationController', ['$scope', '$http', '$location', '$route', 'Organization', function($scope, $http, $location, $route, Organization) {
    const params = $route.current.params;
    const action = getAction();
    $scope.title = "Organizations";
    $scope.backButton = true;
    
    if (action === 'new') {
      $scope.title = "New Organization";
      $scope.createNew = true;
      $scope.org = new Organization();
      $scope.org.primary_color = "#ffffff";
      $scope.org.secondary_color = "#000000";
      $scope.handleBackButton = function() {
        $location.url('/organizations');
      }
    } else if (action === 'settings') {
      Organization.get({
        slug_id: params.slug_id
      }, function(res) {
        $scope.org = res[0];
        $scope.title = $scope.org.organization_name + " Settings";
      });
      $scope.editSettings = true;
      $scope.handleBackButton = function() {
        $location.url('/organizations');
      }
    } else {
      $scope.organizations = getAllOrganizations();
      $scope.backButton = false;
    }

    $scope.copyUrl = function($event) {
      var url = "localhost:3000/" + this.org.slug_id;

      var txt = document.createElement("textarea");
      txt.value = url;
      document.body.appendChild(txt);
      txt.select();

      try {
        var successful = document.execCommand('copy');
        if (successful) {
          fadeIn($event.currentTarget.querySelector('.copied-msg'));
        } else {
          throw('unable to copy');
        }
      } catch(err) {
        console.warn("Something went wrong: ", err);
      }

      document.body.removeChild(txt);
    }


    function getAllOrganizations() {
      return Organization.query();
    }

    function getSingleOrganization(slug_id) {
      return Organization.get({ slug_id: slug_id }, function(org) {
        $scope.title = org[0].organization_name + " Settings";
      });
    }

    $scope.createResource = function createResource() {
      var orgConfig = {
        'name': $scope.org.organization_name,
        'slug_id': slugify($scope.org.organization_name),
        'primary': $scope.org.primary_color,
        'secondary': $scope.org.secondary_color,
        'image': 'https://picsum.photos/500/200/?random',
      };
      
      var fileChooser = document.getElementById('logo_image');
      var file = fileChooser.files[0];

      if (file) {
        $('.overlay').fadeIn(800);
        Organization.upload(function(data) {

          fetch(data.url, {
            'method': 'PUT',
            'body': file,
            'headers': {
              'Content-Type': file.type
            }
          }).then(function(response) {
            orgConfig.image = 'https://my-advanced-node-blog.s3.amazonaws.com/' + data.key;

            Organization.save(orgConfig, function(res) {
              $location.url('/organizations');
            });
          });
        });
      } else {
        Organization.save(orgConfig, function() {
          $location.url('/organizations');
        });
      }
    }

    $scope.updateResource = function updateResource() {
      var orgConfig = {
        'name': $scope.org.organization_name,
        'slug_id': slugify($scope.org.organization_name),
        'primary': $scope.org.primary_color,
        'secondary': $scope.org.secondary_color,
        'id': $scope.org.organization_id
      };

      var fileChooser = document.getElementById('logo_image');
      var file = fileChooser.files[0];

      if (file) {
        $('.overlay').fadeIn(800);
        Organization.upload(function(data) {
          orgConfig.image = 'https://my-advanced-node-blog.s3.amazonaws.com/' + data.key;

          fetch(data.url, {
            method: 'PUT',
            body: file,
            headers: {
              Content-Type: file.type
            }
          }).then(function(response) {
            Organization.update({
              slug_id: params.slug_id
            }, orgConfig, function(res) {
              $location.url('/organizations');
            });
          });
        });
      } else {
        Organization.update({
          slug_id: params.slug_id
        }, orgConfig, function(msg) {
          $location.url('/organizations');
        });
      }
    }

    $scope.deleteResource = function deleteResource() {
      $('#promptDelete').on('hidden.bs.modal', function() {
        Organization.remove({
          'slug_id': params.slug_id
        }, function() {
          $location.url('/organizations');
        });
      });
      $('#promptDelete').modal('hide');
    }

    $scope.getCategories = function getCategories(org, $event) {
      if ($event.target.className.includes("btn") ||
          $event.target.className.includes("switch")) {
        event.stopPropagation();
        return;
      }

      $location.url('/organizations/' + org.slug_id + '/categories');
    }

    $scope.goTo = function goTo(location) {
      $location.url(location);
    }

    $scope.toggleActive = function toggleActive(org) {
      org.active = !org.active;
      Organization.update({
        'slug_id': org.slug_id
      }, {
        'active': org.active,
        'id': org.organization_id
      }, function(res) {});
    }

    function slugify(string) {
        return string.toString().toLowerCase()
          .replace(/\s+/g, '-')           // Replace spaces with -
          .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
          .replace(/\-\-+/g, '-')         // Replace multiple - with single -
          .replace(/^-+/, '')             // Trim - from start of text
          .replace(/-+$/, '');            // Trim - from end of text
    }

    function fadeIn(msg) {
      msg.style.opacity = '100';
      setTimeout(function() {
            msg.style.opacity = '0';
      }, 2000);
    }

    function getAction() {
      var path = window.location.pathname.split('/');
      return path[path.length - 1];
    }
  }]);
})();