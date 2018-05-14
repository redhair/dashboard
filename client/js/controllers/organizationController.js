(function() {
  'use-strict';

  Dashboard.controller('organizationController', ['$scope', '$http', '$location', 'Organization', function($scope, $http, $location, Organization) {
    $scope.title = "Organizations";
    $scope.backButton = true;
    $scope.pathname = window.location.pathname;
    $scope.action = $scope.pathname.split("/")[$scope.pathname.split("/").length - 1]; 

    console.log("controller: orgs");
    console.log("action: "+$scope.action);
    if ($scope.action === 'organizations') {
      $scope.title = "Organizations";
      $scope.organizations = getAllOrganizations();
      $scope.backButton = false;
    } else if ($scope.action === 'settings') {
      $scope.title = "Organization Settings"
      $scope.slug_id = $scope.pathname.split("/")[2];
      $scope.org = getSingleOrganization($scope.slug_id);
      console.log($scope.org)
      $scope.handleBackButton = function() {
        $location.url('/organizations');
      }
    } else if ($scope.action === 'new') {
      $scope.title = "New Organization";
      $scope.handleBackButton = function() {
        $location.url('/organizations');
      }
    }

    $scope.copyUrl = function($event) {
      var url = "/ps/" + this.org.slug_id;

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
      console.log("getting all orgs")
      return Organization.query();
    }

    function getSingleOrganization(slug_id) {
      return Organization.query({ slug_id: slug_id });
    }

    $scope.createNewOrganization = function createNewOrganization() {
      $scope.loading = true;
      var newOrgForm = $('#new_organization');
      var orgName = newOrgForm.find('#name').val();
      var description = newOrgForm.find('#description').val();
      var orgPrimaryColor = newOrgForm.find('#primary_color').val();
      var orgSecondaryColor = newOrgForm.find('#secondary_color').val();

      //send logo file to S3 server, then store that url
      var bucket = new AWS.S3({params: {Bucket: 'monteyne'}});
      var fileChooser = document.getElementById('logo_image');
      var file = fileChooser.files[0];
      /*
      if (file) {
        var params = { Key: file.name, ContentType: file.type, Body: file };
        bucket.upload(params).on('httpUploadProgress', function(evt) {
          var percentage = parseInt((evt.loaded * 100) / evt.total);
          $('#image_upload_percentage').css({ width: percentage + "%" }).text(percentage + "%");
        }).send(function(err, data) {
          console.log(data);
          var orgConfig = {
            "name": orgName,
            "image": data.Location,
            "slug_id": slugify(orgName)
          }

          Organization.save(orgConfig, function() {
            $scope.loading = false;
            $location.url('/organizations');
          });
        });
      } else {
        //"http://via.placeholder.com/350x150"
      }
      */
      var orgConfig = {
        "name": orgName,
        "image": "https://picsum.photos/500/200/?random",
        "primary": orgPrimaryColor,
        "secondary": orgSecondaryColor,
        "slug_id": slugify(orgName)
      };

      Organization.save(orgConfig, function() {
        $scope.loading = false;
        $location.url('/organizations');
      });
    }

    $scope.updateOrganization = function updateOrganization() {
      var orgForm = $('#edit_organization');
      var orgName = orgForm.find('#name').val();
      var description = orgForm.find('#description').val();
      var orgPrimaryColor = orgForm.find('#primary_color').val();
      var orgSecondaryColor = orgForm.find('#secondary_color').val();

      var orgConfig = {
        "name": orgName,
        "slug_id": slugify(orgName),
        "primary": orgPrimaryColor,
        "secondary": orgSecondaryColor,
        "id": $scope.org[0].organization_id
      };

      console.log("updating org:")
      console.log(orgConfig)

      Organization.update({slug_id: $scope.slug_id}, orgConfig, function(msg) {
        $location.url('/organizations');
      });
    }

    $scope.deleteOrganization = function deleteOrganization(slug_id) {
      $('#promptDelete').on('hidden.bs.modal', function() {
        Organization.remove({ slug_id: slug_id }, function() {
          $location.url('/organizations');
        });
      });
      $('#promptDelete').modal('hide');
    }

    $scope.getCategories = function getCategories(org, $event) {
      console.log($event.target.className)

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
      console.log(org)
      org.active = !org.active;
      Organization.update({slug_id: org.slug_id}, {
        "active": org.active,
        "id": org.organization_id
      }, function(msg) {
        //$scope.$applyAsync();
        //$scope.organizations = getAllOrganizations();
        //$location.url('/organizations');
      });
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
      msg.style.opacity = "100";
      setTimeout(function() {
            msg.style.opacity = "0";
      }, 2000);
    }

    function validate_fileupload(fileName) {
        var allowed_extensions = new Array("jpg","png","gif");
        var file_extension = fileName.split('.').pop().toLowerCase();

        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i]==file_extension) {
                return true; // valid file extension
            }
        }

        return false;
    }

    $('#logo_image').on('change', function(e) {
      var fileName = e.target.files[0].name;
      $('label[for="logo_image"').text(fileName);
      var valid = validate_fileupload(fileName);
      console.log(valid)
      if (valid) {
        //uploadImage();
      }
    });

    $('#primary_color_selection').on('change', function(e) {
      $('#primary_color').val($(this).val());
    });

    $('#primary_color').on('keyup', function(e) {
      $('#primary_color_selection').val($(this).val());
    });

    $('#secondary_color_selection').on('change', function(e) {
      $('#secondary_color').val($(this).val());
    });

    $('#secondary_color').on('keyup', function(e) {
      $('#secondary_color_selection').val($(this).val());
    });
  }]);
})();