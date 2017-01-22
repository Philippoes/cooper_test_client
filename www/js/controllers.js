angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($rootScope, $scope, $ionicModal, $timeout, $auth, $ionicLoading, $ionicPopup) {

      // With the new view caching in Ionic, Controllers are only called
      // when they are recreated or on app start, instead of every page change.
      // To listen for when this page is active (for example, to refresh data),
      // listen for the $ionicView.enter event:
      //$scope.$on('$ionicView.enter', function(e) {
      //});

      // Form data for the login modal
      $scope.loginData = {};

      // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.modal = modal;
      });

      // Triggered in the login modal to close it
      $scope.closeLogin = function () {
        $scope.modal.hide();
      };

      // Open the login modal
      $scope.login = function () {
        $scope.modal.show();
      };

      // Perform the login action when the user submits the login form
      $scope.doLogin = function () {
        $ionicLoading.show({
          template: 'Logging in...'
        });
        $auth.submitLogin($scope.loginData)
          .then(function (resp) {
            $ionicLoading.hide();
            $scope.closeLogin();
            $ionicLoading.show({
              template: 'Successfully logged in!',
              duration: 1000
            });
          })
          .catch(function (error) {
            $ionicLoading.hide();
            $scope.errorMessage = error;
            $scope.showAlert('Failure', 'Invalid email or password')
          });

        $scope.showAlert = function (message, content) {
          var alertPopup = $ionicPopup.alert({
            title: message,
            template: content
          });
          alertPopup.then(function (res) {

          })
        };

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
          $scope.closeLogin();
        }, 1000);
      };
      $rootScope.$on('auth:login-success', function (ev, user) {
        $scope.currentUser = angular.extend(user, $auth.retrieveData('auth_headers'));
      });
    }
  )

  .controller('TestController', function ($scope) {
    $scope.gender = ['Male', 'Female'];
    $scope.ageValues = {
      min: 13,
      max: 60,
      value: 20
    };
    $scope.distanceValues = {
      min: 1000,
      max: 3500,
      value: 1000
    };
    $scope.data = {};
    $scope.calculateCooper = function () {
      var person = new Person({
        gender: $scope.data.gender,
        age: $scope.data.age
      });
      person.assessCooper($scope.data.distance);
      $scope.person = person;
      console.log($scope.person)
    }
  })

  .controller('PerformanceCtrl', function ($scope, performanceData, $ionicLoading, $ionicPopup, $state) {

    $scope.saveData = function () {
      var data = {performance_data: {data: {message: $scope.person.cooperMessage}}};
      $ionicLoading.show({
        template: 'Saving data...'
      });
      performanceData.save(data, function (response) {
        $ionicLoading.hide();
        $ionicLoading.show({
          template: (response.message),
          duration: 1000
        });
      }, function (error) {
        $ionicLoading.hide();
        $scope.showAlert('Failure', error.statusText)
      })
    };

    $scope.retrieveData = function () {
      $ionicLoading.show({
        template: "Fetching data..."
      });
      performanceData.get({}, function (response) {
        $state.go('app.data', {savedDataCollection: response.entries});
        $ionicLoading.hide();
      }, function (error) {
        $ionicLoading.hide();
        $scope.showAlert('Failure', error.statusText);
      });
    };

    $scope.showAlert = function (message, content) {
      var alertPopup = $ionicPopup.alert({
        title: message,
        template: content
      });
      alertPopup.then(function (res) {

      });
    }
  })

  .controller('DataCtrl', function ($scope, $stateParams) {
    $scope.$on('$ionicView.enter', function () {
      $scope.savedDataCollection = $stateParams.savedDataCollection;
      $scope.labels = getLabels($scope.savedDataCollection);
      $scope.data = [];
      angular.forEach($scope.labels, function (label) {
        $scope.data.push(getCount($scope.savedDataCollection, label));
      });
      $scope.radardata = [$scope.data];
    });

    function getLabels(collection) {
      var uniqueLabels = [];
      for (i = 0; i < collection.length; i++) {
        if (collection[i].data.message && uniqueLabels.indexOf(collection[i].data.message) === -1) {
          uniqueLabels.push(collection[i].data.message);
        }
      }
      return uniqueLabels;
    }

    function getCount(arr, value) {
      var count = 0;
      angular.forEach(arr, function (entry) {
        count += entry.data.message == value ? 1 : 0;
      });
      return count;
    }
  });
