(function () {
    'use strict';
    angular.module('houseRest', []).service('houseRest', houseRest);
    houseRest.$inject = ['$http', '$q'];
	
    function houseRest($http, $q) {

        this.getAll = getAll;
		this.getAvgM2Price = getAvgM2Price;
		this.getAvgPublishedDate =getAvgPublishedDate;
        this.getAvailableCities = getAvailableCities;
		this.downloadPdf = downloadPdf;
		this.update = update;
		
		function getAll(filters, sort) {
			var params="";
			if(filters && sort){
				params = "?filters="+encodeURIComponent(JSON.stringify(filters)) + "&sort="+encodeURIComponent(JSON.stringify(sort));
			}
			else if(filters){
				params = "?filters="+encodeURIComponent(JSON.stringify(filters));
			}
			else if(sort){
				params = "?sort="+encodeURIComponent(JSON.stringify(sort));
			}
				
            return $http.get('/api/houses'+params).then(function (response) {
                return response.data;
            });
        }
		
		function getAvgM2Price(filters) {
			var params="";
			if(filters){
				params = "?filters="+encodeURIComponent(JSON.stringify(filters));
			}
				
            return $http.get('/api/stats/avgm2price'+params).then(function (response) {
                return response.data;
            });
        }
		
		function getAvgPublishedDate(filters) {
			var params="";
			if(filters){
				params = "?filters="+encodeURIComponent(JSON.stringify(filters));
			}
				
            return $http.get('/api/stats/avgpubdate'+params).then(function (response) {
                return response.data;
            });
        }
		
		function getAvailableCities() {
            return $http.get('/api/cities').then(function (response) {
                return response.data;
            });
        }
		
		function downloadPdf(houseId){
			window.open('/api/houses/'+houseId+'/pdf');
		}
		
		function update(houseId, houseUpdate){
			return $http.put('/api/houses/'+houseId, houseUpdate).then(function (response) {
                return response.data;
            });
		}
    }
})();