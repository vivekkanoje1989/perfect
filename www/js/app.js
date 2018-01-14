// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers'])

  .run(function ($ionicPlatform, $cordovaSQLite, $window, $rootScope, $cordovaNetwork) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
   
    //sqlite create and open datbase
    try {
      db = $cordovaSQLite.openDB({ name: "perfect.db", location: 'default' });

      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, user_id TEXT, password TEXT, user_type TEXT)');
      $cordovaSQLite.execute(db, 'SELECT * FROM users', [])
        .then(function (result) {
          if (result.rows.length > 0) {
            console.log("users successfull");
          } else {
            $rootScope.user_status = "You can't log In, Sync data first...";
            console.log("users have no record");
          }
        }, function (error) {
          console.log("Error on Sync: " + error.message);
        });

      /*$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS consignments (id INTEGER PRIMARY KEY AUTOINCREMENT, servicetax_no TEXT, sr_no TEXT, lr_no TEXT, reporting_date TEXT, from_l TEXT, to_l TEXT, consignee_name TEXT, invice_no TEXT, vehicle_no TEXT, num_package TEXT, vehicle_type TEXT, frieght_rate TEXT, detaintion TEXT, loading_charge TEXT, unloading_charge TEXT)');
      $cordovaSQLite.execute(db, 'SELECT * FROM consignments', [])
      .then(function(result) {
        if(result.rows.length > 0){
          console.log("consignments successfull");
        }else{                    
          console.log("consignments have no record");
        }
      }, function(error) {
        console.log("Error on Sync: " + error.message);
      });*/

    } catch (error) {
      alert(error);
      console.log("error" + error);
    }
  });

  })

  .config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('logo', {
      url: '/logo',
      templateUrl: 'templates/logo.html',
      controller: 'AppCtrl'
    })

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'AppCtrl'
    })

    /*.state('app.search', {
      url: '/search',
      views: {
        'menuContent': {
          templateUrl: 'templates/search.html'
        }
      }
    })*/

    .state('app.add_lr', {
      cache: false,
      url: '/add_lr',
      views: {
        'menuContent': {
          templateUrl: 'templates/add_lr.html',
          controller: 'AppCtrl'
        }
      }
    })

    .state('app.add_memo', {
      cache: false,
      url: '/add_memo',
      views: {
        'menuContent': {
          templateUrl: 'templates/add_memo.html',
          controller: 'AppCtrl'
        }
      }
    })

    .state('app.dashboard', {
      cache: false,
      url: '/dashboard',
      views: {
        'menuContent': {
          templateUrl: 'templates/dashboard.html',
          controller: 'AppCtrl'
        }
      }
    })
    /*.state('app.consignments', {
      url: '/consignments',
      views: {
        'menuContent': {
          templateUrl: 'templates/consignments.html',
          controller: 'AppCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/consignment/:consignmentId',
    views: {
      'menuContent': {
        templateUrl: 'templates/consignment.html',
        controller: 'AppCtrl'
      }
    }
  })*/;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('logo');
});
