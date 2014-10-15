var app = angular.module('ide', ['ide.services', 'ide.directives']);

var services = angular.module('ide.services', []);
var directives = angular.module('ide.directives', []);

services.factory('projectService', ['$http', function($http) {
    var projectService = {
        loadProject: function(path) {
            return $http.get('http://localhost:8080/load/' + encodeURIComponent(path));
        }
    };
    return projectService;
}]);

directives.directive('ideArea', ['projectService', function(projectService) {
    return {
        restrict: 'A',
        scope: {},
        controller: function($scope, $element, $attrs) {
            this.loadProject = function(project) {
                return projectService.loadProject('hejsa');
            };
        }
    };
}]);

directives.directive('ideTree', [function() {
    return {
        require: '^ideArea',
        restrict: 'E',
        scope: {},
        replace: true,
        templateUrl: 'templates/tree.html',
        link: function(scope, element, attrs, ideCtrl) {
            ideCtrl.loadProject('').then(function(response) {
                var references = window.ide.extractReferences(response.data.Project);
                var folders = window.ide.extractFolders(response.data.Project);
                
                scope.tree = {
                    references: references,
                    folders: folders
                };
                /*var files = [];
                var references = [];
                var itemGroup = response.data.Project.ItemGroup;
                for (var i=0; i < itemGroup.length; i++) {
                    for(var prop in itemGroup[i]) {
                        console.log(prop, itemGroup[i]);
                        for(var j = 0; j < itemGroup[i][prop].length; j++) {
                            //console.log(itemGroup[i][prop][j]);
                            //console.log(itemGroup[i][prop][j]['$']);
                        }
                    }
                }*/
            });
        }
    };
}]);

directives.directive('ideEditor', [function() {
  return {
    restrict: 'E',
    scope: {},
    require: '^ideArea',
    link: function(scope, element, attrs, ideCtrl) {
    }
  };
}]);


window.ide = (function() {
    var extractReferences = function(project) {
        var itemGroup = project.ItemGroup;
        return _.map(extractPart(project.ItemGroup, 'Reference'), function(reference) { 
            return { 
                include: reference['$'].Include.split(',')[0],
                hintPath: _.has(reference, 'HintPath') ? reference['HintPath'][0] : null,
                private: _.has(reference, 'Private') ? reference['Private'][0] === 'True' : false
            }; 
        });
    };
    
    var extractFolders = function(project) {
        var itemGroup = project.ItemGroup;
        var folders = _.map(extractPart(project.ItemGroup, 'Folder'), function(folder) { 
            return { 
                include: folder['$'].Include
            }; 
        });
        folders.push({ include: 'root' });
        return folders;
    };
    
    var extractPart = function(itemGroup, key) {
        for (var i=0; i < itemGroup.length; i++) {
            if (_.has(itemGroup[i], key)) {
                return itemGroup[i][key];
            }
        }
    };

    return {
        extractReferences: extractReferences,
        extractFolders: extractFolders
    };
})();