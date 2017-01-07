(function () {
    'use strict';
    angular.module('MainCtrl', []).controller('MainController', MainController);
    MainController.$inject = ['houseRest','$scope'];
	
    function MainController(houseRest,$scope) {
        var vm = this;
		vm.toggleSearchOpen = toggleSearchOpen;
		vm.toggleStatsOpen = toggleStatsOpen;
		vm.openPdf = openPdf;
		vm.launchSearch = launchSearch;
		vm.removeHouse = removeHouse;
		init();

		function init() {
			vm.isSearchOpen = false;
			vm.isStatOpen = false;
			vm.houses = [];
			vm.citiesAvailable =  [];
			vm.avgM2price = undefined;
			vm.avgPublishedDate = undefined;

			vm.fields = [
				'date_last','date_init','price_last','ges','ces', 'm2price_last'
			];
			vm.sortForm = {field:'date_init',asc:false}
			vm.searchForm = {
				city: '', 
				priceMin: 0, 
				priceMax: 400000, 
				surfaceMin: 0, 
				surfaceMax: 500, 
				m2priceMin: 0, 
				m2priceMax: 4000, 
				isPro: undefined, 
				priceStatus:'all', 
				deleteStatus:false
			};
			
			houseRest.getAvailableCities().then(function (cities) {
				vm.citiesAvailable= cities;
			});
			launchSearch();
		}
		
		function toggleStatsOpen() {
			vm.isStatsOpen=!vm.isStatsOpen;
		}
		
		function toggleSearchOpen() {
			vm.isSearchOpen=!vm.isSearchOpen;
		}
		
		function openPdf(houseId) {
			houseRest.downloadPdf(houseId);
		}
		
		function launchSearch() {
			var filters = getFilters();
			var sort = getSort();
			houseRest.getAll(filters,sort).then(function (houses) {
				loadHouses(houses);
			});
			houseRest.getAvgM2Price(filters).then(function (avgM2price) {
				vm.avgM2price = avgM2price;
			});
			houseRest.getAvgPublishedDate(filters).then(function (avgPublishedDate) {
				vm.avgPublishedDate = avgPublishedDate;
			});
			
		}
		
		//Private functions
		function loadHouses(houses){
			vm.houses = [];
			angular.forEach(houses, function(house){
				augmentHouse(house);
				vm.houses.push(house);
			});
		}
		
		function augmentHouse(house){
			house.price_down = false;
			house.price_up = false;
			if(house.price_last && house.price_last > house.price_init){
				house.price_up = true;
			}
			if(house.price_last && house.price_last < house.price_init){
				house.price_down = true;
			}
			
			if(house.price_last){
				house.price = house.price_last;
			}
			else {
				house.price = house.price_init;
			}
									
			if(house.date_last){
				house.date = house.date_last;
			}
			else {
				house.date = house.date_init;
			}
			
			var d1 = moment(house.date_init);
			var d2 = moment(new Date());
			var days = moment.duration(d2.diff(d1)).asDays();
			house.date_diff = parseInt(days);
		}
		
		function getFilters(){
			var filters = {};
			filters.ignore = {$ne:true};
			if(vm.searchForm.city && vm.searchForm.city !== ''){
				filters.city = vm.searchForm.city;
			}
			
			if(vm.searchForm.priceMin && vm.searchForm.priceMax ){
				filters.price_last = {$gte: vm.searchForm.priceMin, $lte: vm.searchForm.priceMax};
			}
			else if(vm.searchForm.priceMin){
				filters.price_last = {$gte: vm.searchForm.priceMin};
			}
			else if(vm.searchForm.priceMax){
				filters.price_last = {$lte: vm.searchForm.priceMax};
			}
			
			if(vm.searchForm.surfaceMin && vm.searchForm.surfaceMax ){
				filters.surface = {$gte: vm.searchForm.surfaceMin, $lte: vm.searchForm.surfaceMax};
			}
			else if(vm.searchForm.surfaceMin){
				filters.surface = {$gte: vm.searchForm.surfaceMin};
			}
			
			else if(vm.searchForm.surfaceMax){
				filters.surface = {$lte: vm.searchForm.surfaceMax};
			}
			
			if(vm.searchForm.m2priceMin && vm.searchForm.m2priceMax ){
				filters.m2price_last = {$gte: vm.searchForm.m2priceMin, $lte: vm.searchForm.m2priceMax};
			}
			else if(vm.searchForm.m2priceMin){
				filters.m2price_last = {$gte: vm.searchForm.m2priceMin};
			}
			
			else if(vm.searchForm.m2priceMax){
				filters.m2price_last = {$lte: vm.searchForm.m2priceMax};
			}
			
			if(vm.searchForm.isPro != undefined){
				filters.isPro = vm.searchForm.isPro;
			}
			if(vm.searchForm.deleteStatus != undefined){
				filters.deleted = vm.searchForm.deleteStatus;
			}
			
			if(vm.searchForm.priceStatus && vm.searchForm.priceStatus !== 'all'){
				if(vm.searchForm.priceStatus === 'up'){
					filters.$where =  "this.price_last > this.price_init";
				}
				else {
					filters.$where =  "this.price_last < this.price_init";
				}
			}
			console.log(filters);
			return filters;
		}
		
		function getSort(){
			var sort = {};
			sort[vm.sortForm.field] = vm.sortForm.asc ? 1 : -1;
			return sort;
		}
		
		function removeHouse(houseId){
			vm.houses = vm.houses.filter(function(house){
				return house._id != houseId;
			});
			houseRest.update(houseId, {"$set":{"ignore": true}});
		}
	};
})();