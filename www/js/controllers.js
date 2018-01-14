angular.module('starter.controllers', ['ionic', 'starter', 'ngCordova'])

  .controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $http, $timeout, $state, $stateParams, $ionicLoading, $cordovaNetwork, $cordovaSQLite) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.init = function () {
      $scope.loading = false;
      $rootScope.messege = "";
      if(!$rootScope.usersname){
        $state.go('login');
      }else{}
      document.addEventListener("deviceready", onDeviceReady, false);
      function onDeviceReady() {
        document.addEventListener("backbutton", function (e) {
          // alert("back");
          if ($state.current.name == "app.dashboard") {
            e.preventDefault();
            e.stopPropogation();
          } else {
            window.history.back();
          }
        }, false);
      }
    };




    $scope.init();
    $scope.nstata = "";
    //Device internet status
    document.addEventListener("deviceready", function () {

      var type = $cordovaNetwork.getNetwork()

      var isOnline = $cordovaNetwork.isOnline()

      var isOffline = $cordovaNetwork.isOffline()

      console.log("type" + type);
      console.log("isOnline" + isOnline);
      console.log("isOffline" + isOffline);

      // listen for Online event
      $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
        var onlineState = networkState;
      })

      // listen for Offline event
      $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
        var offlineState = networkState;
      })
      $scope.nstata = isOnline;
      if (isOnline) {
        $rootScope.onlinestat = 'You are connected to ' + type + ' Network.';

      } else if (isOffline) {
        $rootScope.offlinestat = "No Internet Connection.";
      } else { }

    }, false);

    //Automaic redirect
    $scope.logo = function () {
      $timeout(function () {
        $ionicLoading.show({
          template: 'Loading...',
          duration: 3000
        }).then(function () {
          $timeout(function () {
            $state.go('login');
          }, 3000);
        });
      }, 3000);
    };

    $scope.loading_close = function () {
      $ionicLoading.hide().then(function () {
        console.log("The loading indicator is now hidden");
      });
    };
    //sync users fro remote server
    $scope.sync = function () {
      $scope.loading = true;
      $rootScope.messege = "";
      if ($scope.nstata) {
        $rootScope.messege = "Synchronizing Users...";
        $scope.syncusers();
        $rootScope.user_status = "";
      } else {
        $scope.messege = "No internet connection !";
        $scope.loading = false;
      }
    };

    // var link = 'http://himalayanpaint.com/perfect_web/';
    var link = 'http://192.168.0.106/perfect_web/';
    $scope.syncusers = function () {
      $cordovaSQLite.execute(db, 'SELECT * FROM users', [])
        .then(function (result) {
          $scope.selectlnth = result.rows.length;
          $scope.messege = "Updating users....";
        }, function (error) {
          $scope.messege = "Error on Updating users: " + error.message;
          $scope.loading = false;
        });
      var data = { users: 'users' };
      var config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;' } };
      //sync users by sending data users
      $http.post(link, data, config).then(function (res) {
        $scope.datamods = res.data;
        if ($scope.datamods.length == $scope.selectlnth) {
          $scope.datamods.forEach(function (res) {
            $cordovaSQLite.execute(db, 'UPDATE users SET name =?, user_id =?, password =?, user_type =? WHERE id =?', [res.name, res.user_id, res.password, res.type, res.id])
              .then(function (result) {
                $scope.messege = "Sync users successful!";
                $scope.loading = false;
              }, function (error) {
                $scope.messege = "Error on Sync: " + error.message;
                $scope.loading = false;
              });
          })
        } else {
          $cordovaSQLite.execute(db, 'DROP TABLE IF EXISTS users', [])
            .then(function (result) {
              $scope.messege = "DROP users successful, cheers!";
            }, function (error) {
              $scope.messege = "Error on DROP: " + error.message;
              $scope.loading = false;
            });
          $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, user_id TEXT, password TEXT, user_type TEXT)')
            .then(function (result) {

              $scope.messege = "CREATE users successful, cheers!";
            }, function (error) {
              $scope.messege = "Error on CREATE: " + error.message;
              $scope.loading = false;
            });


          $scope.datamods.forEach(function (res) {
            //console.log("res"+ res.name );
            $cordovaSQLite.execute(db, 'INSERT INTO users (name, user_id, password, user_type ) VALUES (?,?,?,?)', [res.name, res.user_id, res.password, res.type])
              .then(function (result) {
                $scope.messege = "Sync users successful!";
                $scope.loading = false;
              }, function (error) {
                $scope.messege = "Error on Sync: " + error.message;
                console.log("Error" + $scope.messege);
                $scope.loading = false;
              });
          })
        }
      });
    };
    /* Form data for the login modal*/
    $scope.loginData = {};
    // Perform the login action when the user submits the login form
    $scope.login = function () {

      $scope.userss = [];
      $cordovaSQLite.execute(db, 'SELECT * FROM users WHERE user_id =? AND password =? ', [$scope.loginData.username, $scope.loginData.password])
        .then(function (res) {
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
              $scope.userss.push({ 'id': res.rows.item(i).id, 'name': res.rows.item(i).name, 'user_id': res.rows.item(i).user_id, 'password': res.rows.item(i).password, 'user_type': res.rows.item(i).user_type });
            }
            $rootScope.messege = "Login Successfull...";
            angular.forEach($scope.userss, function (row) {
              $rootScope.usersname = row.name;
            });
            console.log("rootScope.usersname" + $rootScope.usersname);

            $state.go('app.dashboard', $rootScope.usersname);
          } else {
            $rootScope.messege = "Invalid Username or Password";
          }

        },
        function (error) {
          $rootScope.messege = "Error on loading: " + error.message;
        });

      // $state.go('app.add_lr');
    };

    $scope.logout = function () {
      $rootScope.messege = "Successfully LogOut...";
      $state.go('login', $rootScope.messege);
    };

    $scope.goAddlr = function () {
      $state.go('app.add_lr');
    }

    $scope.goAddMemo = function () {
      $state.go('app.add_memo');
    }

    //addnew_consignment modal

    $scope.addconsignment = {};
    $scope.add_lr_init = function () {
      $tempObject = null;

      $scope.addconsignment.servicetaxno = 'MHA0068501';
      $scope.addconsignment.Lr_Date = new Date('d/m/Y');
    };

    $scope.addnew_lr = function (consignment) {
      //alert("addnew_consignment"+ JSON.stringify($scope.addconsignment));

      //alert("addnew_consignment lr_no"+ $scope.addconsignment.lrno);
      $scope.addconsignment = consignment;
      if (confirm("This will submit the data to the server. Do you want to continue?") == true) {
        var tmp = {};
        if ($scope.addconsignment.servicetaxno) {
          tmp['servicetaxno'] = $scope.addconsignment.servicetaxno;
        } else {
          tmp['servicetaxno'] = "";
        }
        
        // if ($scope.usersname) {
        //   tmp['usersname'] = $scope.usersname;
        // }else{
        //   tmp['usersname'] = "";
        // }

        if ($scope.addconsignment.invDiv) {
          tmp['invoice_div'] = $scope.addconsignment.invDiv;
          // console.log("invdiv=="+ $scope.addconsignment.invDiv);
        } else {
          tmp['invoice_div'] = "";
        }

        if ($scope.addconsignment.lrno) {
          tmp['lrno'] = $scope.addconsignment.lrno;
        } else {
          tmp['lrno'] = "";
        }

        if ($scope.addconsignment.Lr_Date) {
          tmp['Lr_Date'] = $scope.addconsignment.Lr_Date;
        } else {
          tmp['Lr_Date'] = "";
        }

        if ($scope.addconsignment.from) {
          tmp['from'] = $scope.addconsignment.from;
        } else {
          tmp['from'] = "";
        }

        if ($scope.addconsignment.to) {
          tmp['to'] = $scope.addconsignment.to;
        } else {
          tmp['to'] = "";
        }

        if ($scope.addconsignment.consigner_name) {
          tmp['consigner_name'] = $scope.addconsignment.consigner_name;
        } else {
          tmp['consigner_name'] = "";
        }

        if ($scope.addconsignment.consigner_Addr) {
          tmp['consigner_Addr'] = $scope.addconsignment.consigner_Addr;
        } else {
          tmp['consigner_Addr'] = "";
        }

        if ($scope.addconsignment.consignee_name) {
          tmp['consignee_name'] = $scope.addconsignment.consignee_name;
        } else {
          tmp['consignee_name'] = "";
        }

        if ($scope.addconsignment.consignee_Addr_l1) {
          tmp['consignee_Addr_l1'] = $scope.addconsignment.consignee_Addr_l1;
        } else {
          tmp['consignee_Addr_l1'] = "";
        }

        if ($scope.addconsignment.consignee_Addr_l2) {
          tmp['consignee_Addr_l2'] = $scope.addconsignment.consignee_Addr_l2;
        } else {
          tmp['consignee_Addr_l2'] = "";
        }

        if ($scope.addconsignment.consignee_Addr_l3) {
          tmp['consignee_Addr_l3'] = $scope.addconsignment.consignee_Addr_l3;
        } else {
          tmp['consignee_Addr_l3'] = "";
        }

        if ($scope.addconsignment.consignee_state) {
          tmp['consignee_state'] = $scope.addconsignment.consignee_state;
        } else {
          tmp['consignee_state'] = "";
        }

        if ($scope.addconsignment.consignee_state_cd) {
          tmp['consignee_state_cd'] = $scope.addconsignment.consignee_state_cd;
        } else {
          tmp['consignee_state_cd'] = "";
        }

        if ($scope.addconsignment.consignee_gstn) {
          tmp['consignee_gstn'] = $scope.addconsignment.consignee_gstn;
        } else {
          tmp['consignee_gstn'] = "";
        }      

        if ($scope.addconsignment.invoice_no) {
          tmp['invoice_no'] = $scope.addconsignment.invoice_no;
        } else {
          tmp['invoice_no'] = "";
        }

        if ($scope.addconsignment.vehicle_no) {
          tmp['vehicle_no'] = $scope.addconsignment.vehicle_no;
        } else {
          tmp['vehicle_no'] = "";
        }

        if ($scope.addconsignment.material_type) {
          tmp['material_type'] = $scope.addconsignment.material_type;
        } else {
          tmp['material_type'] = "";
        }

        if ($scope.addconsignment.num_packages) {
          tmp['num_packages'] = $scope.addconsignment.num_packages;
        } else {
          tmp['num_packages'] = "";
        }

        if ($scope.addconsignment.actual_weight) {
          tmp['actual_weight'] = $scope.addconsignment.actual_weight;
        } else {
          tmp['actual_weight'] = "";
        }

        if ($scope.addconsignment.gst_tax) {
          tmp['gst_tax'] = $scope.addconsignment.gst_tax;
        } else {
          tmp['gst_tax'] = "";
        }

        /*if ($scope.addconsignment.vehicle_type) { 
          tmp['vehicle_type'] = $scope.addconsignment.vehicle_type;
        }else{
          tmp['vehicle_type'] = "";
        }

        if ($scope.addconsignment.frieght_rate) { 
          tmp['frieght_rate'] = $scope.addconsignment.frieght_rate;
        }else{
          tmp['frieght_rate'] = "";
        }

        if ($scope.addconsignment.detaintion) { 
          tmp['detaintion'] = $scope.addconsignment.detaintion;
        }else{
          tmp['detaintion'] = "";
        }

        if ($scope.addconsignment.loading_charge) { 
          tmp['loading_charge'] = $scope.addconsignment.loading_charge;
        }else{
          tmp['loading_charge'] = "";
        }

        if ($scope.addconsignment.unloading_charge) {
          tmp['unloading_charge'] = $scope.addconsignment.unloading_charge;                
        }else{
          tmp['unloading_charge'] = "";
        }*/

        // console.log("After--->" + JSON.stringify(tmp));

        /*Post to server*/
        var data = { data: tmp };
        var config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;' } };
        $ionicLoading.show({
          template: 'Uploading...',
          duration: 3000
        });
        $http.post(link, data, config)
          .success(function (data, status, headers, config) {
            // console.log(data);
            // console.log(status);
            // console.log(headers);
            // console.log(config);

            $timeout(function () {
              alert("Data Submitted successfully");
              $ionicLoading.hide().then(function () {
                // console.log("The loading indicator is now hidden");
              });
            }, 1000, true);
            $rootScope.messege = "Successfully Sent...";
            $timeout(function () { $state.go("app.dashboard", $rootScope.messege); }, 1000, true);
          })
          .error(function (data, status, headers, config) {
            // console.log(data);
            // console.log(status);
            // console.log(headers);
            // console.log(config);
            alert("Failed to connect to server . Please try again later... ");
            $ionicLoading.hide().then(function () {
              // console.log("The loading indicator is now hidden");
            });
            return false;
          });
      } else { }//if confirm    
    }; //addnew_lr () ends


    $scope.addnew_memo = function (addmemo) {
      alert("addnew_memo" + JSON.stringify(addmemo));
      $scope.addmemo = addmemo;
      if (confirm("This will submit the data to the server. Do you want to continue?") == true) {
        var tmp = {};
        tmp['memo'] = "memo";

        if ($scope.addmemo.from) {
          tmp['memo_from'] = $scope.addmemo.from;
        } else {
          tmp['memo_from'] = "";
        }

        if ($scope.addmemo.to) {
          tmp['memo_to'] = $scope.addmemo.to;
        } else {
          tmp['memo_to'] = "";
        }

        if ($scope.addmemo.lr_no) {
          tmp['lr_no'] = $scope.addmemo.lr_no;
        } else {
          tmp['lr_no'] = "";
        }

        if ($scope.addmemo.invoice_no) {
          tmp['invoice_no'] = $scope.addmemo.invoice_no;
        } else {
          tmp['invoice_no'] = "";
        }

        if ($scope.addmemo.lorry_no) {
          tmp['lorry_no'] = $scope.addmemo.lorry_no;
          // console.log("invdiv=="+ $scope.addmemo.invDiv);
        } else {
          tmp['lorry_no'] = "";
        }

        if ($scope.addmemo.date) {
          tmp['date'] = $scope.addmemo.date;
        } else {
          tmp['date'] = "";
        }

        if ($scope.addmemo.veh_type) {
          tmp['veh_type'] = $scope.addmemo.veh_type;
        } else {
          tmp['veh_type'] = "";
        }

        if ($scope.addmemo.freight) {
          tmp['freight'] = $scope.addmemo.freight;
        } else {
          tmp['freight'] = "";
        }


        // console.log("After--->" + JSON.stringify(tmp));

        /*Post to server*/
        var data = { data: tmp };
        var config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;' } };
        $ionicLoading.show({
          template: 'Uploading...',
          duration: 3000
        });
        $http.post(link, data, config)
          .success(function (data, status, headers, config) {
            // console.log(data);
            // console.log(status);
            // console.log(headers);
            // console.log(config);

            $timeout(function () {
              alert("Data Submitted successfully");
              $ionicLoading.hide().then(function () {
                // console.log("The loading indicator is now hidden");
              });
            }, 1000, true);
            $rootScope.messege = "Successfully Sent...";
            $timeout(function () { $state.go("app.dashboard", $rootScope.messege); }, 1000, true);
          })
          .error(function (data, status, headers, config) {
            // console.log(data);
            // console.log(status);
            // console.log(headers);
            // console.log(config);
            alert("Failed to connect to server . Please try again later... ");
            $ionicLoading.hide().then(function () {
              // console.log("The loading indicator is now hidden");
            });
            return false;
          });
      } else { }//if confirm
    }//addnew_memo ends
  });
