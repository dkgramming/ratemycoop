'use strict';

/**
 * @ngdoc function
 * @name ratemycoopApp.controller:ReviewformCtrl
 * @description
 * # ReviewformCtrl
 * Controller of the ratemycoopApp
 */
angular.module('ratemycoopApp')
  .controller('ReviewformCtrl', function ($scope, Company, Major, City, $routeParams) {
    $scope.loading = true;

    /**
     * Get company info on-load
     */
    $scope.company = Company.findOne({
        filter: {
          where: {name: $routeParams.companyname},
          include: ['perks', 'majors', 'reviews', {'locations': 'region'}]
        }
      },
      function (successData) {
        $scope.loading = false;
      }
    );

    /**
     * Get major info on-load
     */
    $scope.majors = Major.find({},
      function (successData) {
        angular.forEach(successData, function (result) {
          result.title = result.name;
          result.description = result.code;
        });

        $('#majorSearch').search({
          source: $scope.majors,
          maxResults: 4,
          searchFields: ['code', 'name'],

        })
      }
    );

    $scope.cities = [];


    $scope.searchCity = function (query) {
      $scope.cities = City.find({
          filter: {
            limit: 50,
            where: {
              query: query
            }
          }
        },
        function (successData) {
          //$('#locationSearch').search({
          //  source: $scope.cities,
          //  searchFields: ['name'],
          //  onSearchQuery: function (query) {
          //    console.log('searching query');
          //    $scope.searchCity(query);
          //  }
          //});
        }
      );
    };

    /**
     * Wizard variables.
     * @type {{currStep: string, s1: string, s2: string, s3: string}}
     */
    $scope.wizard = {
      currStep: "wizardStepOne",
      s1: "wizardStepOne",
      s2: "wizardStepTwo",
      s3: "wizardStepThree"
    };


    $scope.formData = {
      overallRating: 0,
      difficultyRating: 0,
      cultureRating: 0,

      descriptionGood: "",
      descriptionBad: "",
      descriptionOverall: "",

      payTypes: ['Hourly', 'Salary', 'Stipend'],
      perks: [],

      returnOffer: false,
      recommend: false,
      anonymous: false

    };

    angular.element(document).ready(function () {
      setTimeout(setupSemantic, 1000);
    });

    function setupSemantic() {
      $('.ui.accordion').accordion();
      $('.ui.selection.dropdown').dropdown();
      $('.rating').rating();
      $('.ui.checkbox').checkbox();
      $('#locationSearch').search({
        source: $scope.cities,
        searchFields: ['name'],
        onSearchQuery: function (query) {
          console.log('searching query');
          $scope.searchCity(query);
        }

      });

    }


  });
