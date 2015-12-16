/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
  --------------------------------------------------------------------------------
  File        : public/app/main/project/projectdetailCtrl.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 
*/
/*
  Date          Author   Version     Description
  ------------------------------------------------------------------------
  10/09/2015   subin       v1        Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/
angular.module('app').controller('projectdetailCtrl', function($scope, $http, $routeParams, $stateParams, mvIdentity, $location, $log, $timeout, $filter, $translate, mvAuth, Notification, $rootScope, generalServices, Upload) {

    var customerId = mvIdentity.currentUser.customerId;
    $scope.identity = mvIdentity;
    var projectId = $stateParams.projectId;
    $scope.projectId = projectId;
    var srId = $stateParams.srId;
    $scope.priority = 5;
    $scope.max = mvIdentity.currentUser.maxPriority;
    $scope.isReadonly = false;
    $scope.progressbar = false;
    $scope.isDisabled = false;
    $scope.maxAttachment = mvIdentity.currentUser.maxAttachment;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };


    $scope.planningStart = {
        opened: false
    };
    $scope.readyToTest = {
        opened: false
    };
    $scope.due = {
        opened: false
    };

    $scope.type = 'Pie';
    // Chart.js Options
    $scope.options = {
        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: true,

        //String - The colour of each segment stroke
        segmentStrokeColor: "#fff",

        //Number - The width of each segment stroke
        segmentStrokeWidth: 2,

        //Number - The percentage of the chart that we cut out of the middle
        percentageInnerCutout: 30, // This is 0 for Pie charts

        //Number - Amount of animation steps
        animationSteps: 100,

        //String - Animation easing effect
        animationEasing: "easeOutBounce",

        //Boolean - Whether we animate the rotation of the Doughnut
        animateRotate: false,

        //Boolean - Whether we animate scaling the Doughnut from the centre
        animateScale: false,

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%> <%=segments[i].label%>&nbsp &nbsp<%=segments[i].value%><%}%></li><%}%></ul>"
    };

    $scope.newTask = {
        attachments: []
    };
    $scope.addMoreHide = false;

    /*---------------------------------------------------------------------------
      Name: sorting
      Description: sorting by title, priority, assignee, status  in srDetail
      Author: RuchiDhami
    ------------------------------------------------------------------------------*/
    $scope.predicate = 'sr_id';
    $scope.reverse = false;
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : true;
        $scope.predicate = predicate;
    };

    $scope.sr_statuses = [];
    $scope.resolutionType = false;
    $http.get("/api/getSrStatus/" + $scope.identity.currentUser.customerId).success(function(result) {
        angular.forEach(result, function(value, key) {
            var status = {
                "order": value.setting.sr_status.order,
                "name": value.setting.sr_status.name,
                "value": value.setting.sr_status.value,
                "_id": value.setting.sr_status._id
            };
            $scope.sr_statuses.push(status);
            //$scope.checkedStatus is the array needed for filtering SRs
            $scope.checkedStatus.push(status.order);
            $scope.checkedStatus_.push(status.order);
        });
    });
    $scope.getStatusNameByOrder = function(statusOrder) {
        $scope.statusName = $filter('filter')($scope.sr_statuses, {
            order: statusOrder
        });
        if($scope.statusName[0]) {
            return $scope.statusName[0].name;
        }
        else return 'Status Removed';
    }
    /*------------------------------------------------------------------------------
      Name        : showStatus
      Description : displays selection menu for selecting the status of SR
      Input param :
      Output param: returns selected SR status
      Author      : Rikesh Bhansari
      Created     : 2015/09/15                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    ---------------------------------------------------------------------------------*/
    $scope.showStatus = function() {
        $scope.selected = $filter('filter')($scope.sr_statuses, {
            order: $scope.srStatus
        });

        if ($scope.selected[0] != undefined) {
            if ($scope.identity.currentUser.resolutionType && $scope.selected[0].order == '8000') {
                $scope.resolutionType = true;
            } else {
                $scope.resolutionType = false;
            }
        } else {
            $scope.resolutionType = false;
        }
        return ($scope.srStatus && $scope.selected.length) ? $scope.selected[0].name : 'Not set';
    };

    /*----------------------------------------------------------------------------------------------------
        Name: getResolutionType
        Description: function to get all Resolution Type from the database 
        Author: Prasanna Shrestha
    -----------------------------------------------------------------------------------------------------*/
    $scope.getResolutionType = function(customerId) {
        $http.get("/api/resolutionType/" + customerId).success(function(result) {
            $scope.resolutionTypes = result.setting.resolutionTypes;
        })
    }

    $scope.showResolutionType = function() {
        //$scope.statuses = ['New', 'Open', 'Waiting for Info', 'On Hold', 'In Progress', 'Resolved'];
        $scope.selectedResolution = $filter('filter')($scope.resolutionTypes, {
            _id: $scope.resolutionId
        });
        return ($scope.resolutionId && $scope.selectedResolution.length) ? $scope.selectedResolution[0].name : 'Not set';
    };

    /*------------------------------------------------------------------------------
      Name        : showAssignee
      Description : displays selection menu for selecting the assignee(one of the project members) for the SR
      Input param :
      Output param: returns selected project member
      Author      : Rikesh Bhansari
      Created     : 2015/09/15                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    ------------------------------------------------------------------------*/
    $scope.showAssignee = function() {
        var selectedAssignee = $filter('filter')($scope.projectMembers, {
            user_id: $scope.assignee
        });
        return ($scope.assignee && selectedAssignee.length) ? selectedAssignee[0].fullname : 'Not set';
    };

    /*------------------------------------------------------------------------------
      Name        : showUserRoles
      Description : displays selection menu for selecting the assignee(one of the project members) for the SR
      Input param :
      Output param: returns selected project member role
      Author      : Prasanna Shrestha
      Created     : 2015/12/07                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    ------------------------------------------------------------------------*/
    
    $scope.showUserRoles = function(groupName) {
        $scope.groupName = groupName;
        var selectedRole = $filter('filter')($scope.roleLists, {
            group_name: groupName
        });
        console.log(selectedRole[0].group_name);
        console.log(groupName);
        return ($scope.groupName && selectedRole.length) ? selectedRole[0].group_name : 'Role Not Set';
    };

    /*----------------------------------------------------------------------------------------------------
      Description:  gets project detail by project ID to be displayed on clicking one project
      Author: SubinJoshi        
     ------------------------------------------------------------------------------------------------------*/
    if (projectId) {
        $http.get("/api/getProjectDetail/" + projectId).success(function(data) {
            $scope.projectDetail = data;
            $scope.projectDetail.project_startDate = new Date(data.project_startDate);
            $scope.projectDetail.project_endDate = new Date(data.project_endDate)
            $scope.projectMembers = $scope.projectDetail.members;
            $scope.projectStatus = $scope.projectDetail.projectstatus;

            //data management for SR filter based on projectMembers
            for(var i=0; i<$scope.projectMembers.length; i++) {
                newMemberObj = {};
                newMemberObj.id = $scope.projectMembers[i].user_id;
                newMemberObj.label = $scope.projectMembers[i].fullname;
                //$scope.projectMembersList is an array that consists of all the project members
                $scope.projectMembersList.push(newMemberObj);
                //for checking all the assignees by default
                $scope.selectedAssignees.push(newMemberObj);
                selectedAssignees_.push(newMemberObj);
            }

            angular.forEach($scope.projectMembers, function(value) {
                mvAuth.getUserName(value.user_id).then(function(user) {
                    
                    value.memberPic = user.proPic;
                }, function(reason) {
                    mvNotifier.error(reason);
                });
            });
        })
    }
    mvAuth.getUserList().then(function(userNameData) {
        //$scope.editproject = data;
        $scope.userNameList = userNameData.data;
        // console.log("UserData : " + $scope.userNameList);
    });
    /*----------------------------------------------------------------------------------------------------
      Description:  get all getPriorityList to get priorityTitles
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------*/
    $scope.priorityTitle = [];
    generalServices.getPriorityList().then(function(response) {
        angular.forEach(response, function(value, key) {
            $scope.priorityTitle.push(value.meaning);
        });
        /*$http.get("/api/getAllSr").success(function(srData) {
            $scope.srList = srData;
        })*/

    });


    /*----------------------------------------------------------------------------------------------------
     Description:   gets name of users of one domain to be displayed for option in add member 
     Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    /*$scope.userNameList = [];
    $http.get("/api/customerUsers/name").success(function(userNameData) {
        $scope.userNameList = userNameData;

    });*/

    /*----------------------------------------------------------------------------------------------
      Name: addMore
      Description: adds attachment fields during sr-create to upload more than one file
      Author: Rikesh Bhansari
      Created: 2015/10/28
    ------------------------------------------------------------------------------------------------*/
    $scope.addMore = function(file) {
        var tempFileObj = {};

        if (file && $scope.newTask.attachments.length < $scope.maxAttachment) {
            //prevents adding more attachment fields if no file has been attached to the available field
            if (file.file) {
                angular.extend(tempFileObj, file);
                $scope.newTask.attachments.push(tempFileObj);

                $scope.attachment.file = '';
                $scope.attachment.description = '';
            }
        }
        if ($scope.newTask.attachments.length == $scope.maxAttachment - 1) {
            $scope.addMoreHide = true;
        }
        $scope.invalidFile = false;
    }

    $scope.removeAttachment = function(index) {
        $scope.addMoreHide = false;
        $scope.newTask.attachments.splice(index, 1);
    }

    /*----------------------------------------------------------------------------------------------------
      Name: createSr
      Description:   function to create new SR with project ID and form data on create SR button 
      Author: SubinJoshi        
     ------------------------------------------------------------------------------------------------------
      Date       Version Author           Description
      -----------------------------------------------------------------------------------------------------
      17/11/2015 v1      Rikesh   modified the function to upload file before creating SR                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
    ----------------------------------------------------------------------------------------------------*/
    $scope.createSr = function(newTaskData, projectId) {
        $scope.submitted = true;
        if ($scope.form.$valid) {
            if ($scope.attachment) {
                $scope.addMore($scope.attachment);
            }
            var attachmentsCount = newTaskData.attachments.length;

            if (attachmentsCount < 1) {
                console.log("no attachments");
                insertSr(newTaskData, projectId);
            }

            var files = newTaskData.attachments;

            var count = 0;
            angular.forEach(files, function(file, key) {
                file.upload = Upload.upload({
                    url: 'api/upload?projectId=' + projectId,
                    data: {
                        file: file
                    }
                });

                file.upload.then(function(response) {
                    newTaskData.attachments[key].filename = response.data.filename;
                    newTaskData.attachments[key].path = response.data.path;
                    newTaskData.attachments[key].uploaded_date = Date();
                    newTaskData.attachments[key].uploaded_by = $scope.identity.currentUser.app_users._id;

                    //to avoid saving file in mongo document
                    delete newTaskData.attachments[key].file;

                    count++;
                    //console.log(newTaskData, 'finished', newTaskData.attachments.length, key);
                    $scope.isDisabled = true;
                    if (newTaskData.attachments.length == count) {
                        insertSr(newTaskData, projectId);
                    }
                }, function(response) {
                    if (response.status > 0)
                        $scope.errorMsg = response.status + ': ' + response.data;
                }, function(evt) {
                    // Math.min is to fix IE which reports 200% sometimes
                    file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                });
            });

            //function to create SRs (with or without attachments) --RikeshBhansari --2015/10/26
            function insertSr(newTaskData, projectId) {
                newTaskData.customerId = $scope.identity.currentUser.customerId;
                newTaskData.sr_createdBy = $scope.identity.currentUser.app_users._id;
                delete newTaskData.file;
                $http.post("/api/createNewSr/" + projectId, newTaskData).success(function(data) {
                    Notification.info('New Task has been created successfully');
                    $scope.isDisabled = true;
                    $location.path('/dashboard/projectdetail/' + projectId);
                })
            }
        }
    }

    /*----------------------------------------------------------------------------------------------------
      Description:    gets all SR of project by Project ID to be displayed on click project at sidebar 
      Author: SubinJoshi        
     ------------------------------------------------------------------------------------------------------*/

    $scope.showSR = true;
    /*$http.get("/api/getSRlists/" + id).success(function(data) {
        $scope.projectSrData = data;
        
        if ($scope.projectSrData.length == 0) {
            $scope.showSR = false;
        } 
    })*/

    /*----------------------------------------------------------------------------------------------------
      Name: getAllSRList
      Description: function to get All SR list by Project Id 
      Author: Prasanna Shrestha        
    ------------------------------------------------------------------------------------------------------*/
    $scope.getAllSRList = function() {
        $http.get("/api/getSRlists/" + projectId).success(function(data) {
            $scope.projectSrData = data;

            if ($scope.projectSrData.length == 0) {
                $scope.showSR = false;
            }
        })
    }

    /** 
      function to get SR detail by SR ID to display SR detail 
      @subinjoshi
    **/

    $scope.showSRDetails = function(srId) {
        $scope.selectSR = srId;
        $http.get("/api/getSrDetail/" + srId).success(function(srData) {
            $scope.attachmentDetails = srData.attachments;
            $scope.selectedId = srData;
            $scope.commentList = srData.comment;
            $scope.showDetails = false;
            sr_createdBy = srData.sr_createdBy;

            if ($scope.selectedId) {
                $scope.srStatus = $scope.selectedId.sr_status;
                $scope.assignee = $scope.selectedId.assignee;
                $scope.resolutionId = $scope.selectedId.resolution_type;

                mvAuth.getUserName(sr_createdBy).then(function(user) {
                    $scope.srCreator = user.name;
                }, function(reason) {
                    mvNotifier.error(reason);
                });

                angular.forEach($scope.commentList, function(value) {
                    mvAuth.getUserName(value.user_id).then(function(user) {
                        value.commentBy = user.name;
                        value.commentorPic = user.proPic;
                    }, function(reason) {
                        mvNotifier.error(reason);
                    });
                });

                angular.forEach($scope.attachmentDetails, function(value) {
                    mvAuth.getUserName(value.uploaded_by).then(function(user) {
                        value.uploader = user.name;
                    }, function(reason) {
                        mvNotifier.error(reason);
                    });
                });
            }
        })
    }
    /*----------------------------------------------------------------------------------------------------
      Name: getAssigneeBySrId
      Description: function to get Assignee id by SR Id 
      Author: Prasanna Shrestha        
    ------------------------------------------------------------------------------------------------------*/
    $scope.getAssigneeBySrId = function(srId) {
        $scope.selectSR = srId;
        $http.get("/api/getSrDetail/" + srId).success(function(srData) {
            $scope.selectedId = srData;
            if ($scope.selectedId) {
                $scope.assignee = $scope.selectedId.assignee;
            }
        })
    }

    /*----------------------------------------------------------------------------------------------------
          Name: totalSR
          Description:function to count and get the total Sr 
          Author: RuchiDhami        
    ------------------------------------------------------------------------------------------------------*/
    $scope.totalSR = function(projectId) {
        $http.post("/api/countTotalSr/" + projectId).success(function(response) {
            $scope.totalSr = response.data;
        })
    }

    /*----------------------------------------------------------------------------------------------------
      Name: editSR
      Description:    function to get SR detail by SR ID on clicking edit task button to display in popup with SR data
      Author: SubinJoshi        
     ------------------------------------------------------------------------------------------------------*/
    $scope.editSR = function(srId) {
        $http.get("/api/getSrDetail/" + srId).success(function(srEditData) {
            $scope.newSr = srEditData;
        })
    }

    /*----------------------------------------------------------------------------------------------------
      Name: updateSr
      Description:    function to update SR detail with form SR data by SR ID
      Author: SubinJoshi        
     ------------------------------------------------------------------------------------------------------*/
    $scope.updateSr = function(srData, srId) {
        $http.put("/api/updateSrDetail/" + srId, srData).success(function(srDetailData) {
            //mvNotifier.notify('Task has been Updated successfully');
            Notification.info('Task has been Updated successfully');
        })
    }

    /*----------------------------------------------------------------------------------------------------
      Name: editProject
      Description:  function to update project detail with form data from popup by project ID
      Author: SubinJoshi        
     ------------------------------------------------------------------------------------------------------*/
    $scope.editProject = function(projectId, editproject) {
        $http.put("/api/updateProject/" + projectId, editproject).success(function(data) {
            //mvNotifier.notify('Project has been updated successfully');
            Notification.info('Project has been updated successfully');
        })
    }

    /*----------------------------------------------------------------------------------------------------
      Name: selectMemberRole
      Description:   function to display role 
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.selectMemberRole = function(memberData, projectId) {
        $scope.newRole = memberData;
        $scope.editedProjectId = projectId;
        //$scope.user_id = memberId;
    }

    /*----------------------------------------------------------------------------------------------------
      Description:  get all Roles list to assign in project
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/

    $http.get("/api/getRoles").success(function(roleData) {
        $scope.roleLists = roleData;
    })

    /*----------------------------------------------------------------------------------------------------
      Name: getUserName
      Description:   function to display userName by its userId 
      Author: Prasanna Shrestha        
    ------------------------------------------------------------------------------------------------------*/
    $scope.getUserName = function(userId) {
        console.log(userId);
        var username;
        if(userId){
            mvAuth.getUserName(userId).then(function(user) {
                console.log(user);
                username = user.name;
            }, function(reason) {
                  mvNotifier.error(reason);            
            });
            //return username;
        }
    }

    /*----------------------------------------------------------------------------------------------------
      Name: assignRole
      Description: function to assign role to member in project on clicking assign role button
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.assignRole = function(projectId, roleData) {
        //console.log(roleData);
        //console.log(projectId);
        $http.put("/api/updateMemberRole/" + projectId, {group_name:roleData}).success(function(data) {
            //console.log(data,' successfully assign role');
            $scope.userRole = roleData;
            Notification.info('Role has been assigned successfully');
        })
    }

    /*----------------------------------------------------------------------------------------------------
      Name: addComment
      Description:   function to add SR comment in SR by its SR ID
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.addComment = function(comment, srId) {
        // validation for comment if comment is null or empty 
        //@RuchiDhami
        if (comment != null && comment != '') {
            var srData = {
                user_id: mvIdentity.currentUser.app_users._id,
                comment: comment
            }
            $http.post("/api/addNewComment/" + srId, srData).success(function(data) {
                $scope.commentList = [];
                $scope.showSRDetails(srId);
                console.log($scope.commentList, "commentList");
                Notification.info('Your comment has been added successfully');
                $scope.comment = '';
                $scope.error = '';
            })
        } else {
            $scope.error = 'This is required field!';
            console.log($scope.error);
        }
    }

    /*----------------------------------------------------------------------------------------------------
      Name: updateSrComment
      Description:    function to update sr comment by comment ID
      Author: SubinJoshi
     ------------------------------------------------------------------------------------------------------
     Date         Author  Description
     ------------------------------------------------------------------------------------------------------
     23/09/2015   Rikesh  update/delete sr comment
    -----------------------------------------------------------------------------------------------------*/
    $scope.updateSrComment = function(comment, commentId, srId) {
        var dataObject = {
            srId: srId,
            comment: comment
        }

        $http.put("/api/updateSrComment/" + commentId, dataObject).success(function(data) {
            console.log('success', data.deleted);
            $scope.showSRDetails(srId);
            if (!data.deleted) {
                Notification.info('Your comment has been updated successfully');
            } else if (data.deleted) {
                Notification.info('Your comment has been deleted successfully');
            }
        })
    }

    /*----------------------------------------------------------------------------------------------------
      Name: search
      Description:  for searching query word
      Author: SubinJoshi        
     ------------------------------------------------------------------------------------------------------*/
    $scope.search = function(queryData) {
        return $http.post('/api/search/' + $scope.identity.currentUser.customerId, {
            queryTerm: queryData
        }).then(function(response) {
            return response.data;

        });
    }

    /*----------------------------------------------------------------------------------------------------
      Name: searchOnClickButton
      Description:   function to search and query on click search button
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.searchOnClickButton = function(queryData) {
        $http.post('/api/search/' + $scope.identity.currentUser.customerId, {
            queryTerm: queryData
        }).success(function(data) {
            console.log('success');
            $scope.searchData = data;
        })
    }

    /*----------------------------------------------------------------------------------------------------
      Name: onSelect
      Description:   function to redirect to detail of SR , Project
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.onSelect = function($item, $model, $label) {
        $scope.$item = $item;
        $scope.$model = $model;
        $scope.$label = $label;
        if ($item.type == "Project") {
            $location.path('/dashboard/project/' + $scope.$item.id);
        } else if ($item.type == "SR") {
            $location.path('/dashboard/project-detail/' + $scope.$item.project_id + '/sr-detail/' + $scope.$item.id);
        } else if ($item.type == "User") {
            $location.path('/dashboard/setting/user');
        }

    }

    /*----------------------------------------------------------------------------------------------------
      Name: updateSrElement
      Description:   function to update the sr_status or assignee from the SR edit form
      Author: Rikesh Bhansari        
      -------------------------------------------------------------------------------------------------------
      Date       Author  Description
      ------------------------------------------------------------------------------------------------------
      23/09/2015 Rikesh to update sr_description or sr_title from the SR edit form
    -----------------------------------------------------------------------------------------------------*/
    $scope.updateSrElement = function(srId, changedValue, field) {
            if (changedValue.length < 1) {
                //mvNotifier.notify('Field cannot be empty');
                $scope.showSRDetails(srId);
            } else {
                var key;
                switch (field) {
                    case 'status':
                        key = 'sr_status';
                        break;
                    case 'assignee':
                        key = 'assignee';
                        break;
                    case 'description':
                        key = 'sr_description';
                        break;
                    case 'title':
                        key = 'sr_title';
                        break;
                    case 'resolution_type':
                        key = 'resolution_type';
                        break;
                    default:
                        console.log('Incorrect parameters. This shouldn\'t be happening.');
                }
                var dataObject = {
                    key: key,
                    value: changedValue
                }
                $http.put("/api/updateSrElement/" + srId, dataObject).success(function(data) {
                    //console.log(field + ' successfully updated!!' + changedValue);
                    //mvNotifier.notify('SR has been updated successfully');
                    Notification.info("SR has been updated successfully");
                    //$scope.showSRDetails(srId);

                    var selectedSR = $filter('filter')($scope.projectSrData, {
                        _id: srId
                    })[0];
                    //get selected SR index to update changeValue in that index
                    $scope.index = $scope.projectSrData.indexOf(selectedSR);
                    //update changedValue in that particular Sr attribute                   
                    $scope.selectedId[key] = changedValue;
                    //update selectedSR in $scope.projectSrData array to reflect changes/updates after we update in DB
                    $scope.projectSrData[$scope.index] = $scope.selectedId;
                    //console.log($scope.projectSrData);
                });
            }
        }
    /*---------------------------------------------------------------------------
      Name: hoveringOver
      Description: function to hover the priority value
      Author: RuchiDhami
    ----------------------------------------------------------------------------*/

    $scope.hoveringOver = function(value) {
        $scope.overStar = value;

    };

    /*---------------------------------------------------------------------------
      Name: passValue
      Description: set the value of priority in the database
      Author: RuchiDhami
    ----------------------------------------------------------------------------*/
    $scope.passValue = function(value) {
        // function to update the priority vlaue
        $scope.updatePriority = function(srId) {
            $http.put('api/updatePriority/' + srId, {
                'priority': value
            }).success(function(response) {
                // mvNotifier.notify('updated successfully');
                Notification.info("Priority Successfully Updated");
            })
        };
    }

    /*----------------------------------------------------------------------------------------------------
      Name: getAssignee
      Description:   function to display the name of assignee in service-request-details.html
      Input Params: userId of the assignee of SR
      Output Params: fullname of the assignee
      Author: Rikesh Bhansari        
    ------------------------------------------------------------------------------------------------------*/
    $scope.getAssignee = function(userId) {
        if (userId != null && userId != '' && $scope.projectMembers) {

            /*var result = $.grep($scope.projectMembers, function(e) {
                //returns the object which matches the condition e.user_id == userId after searching in the array $scope.projectMembers
                return e.user_id == userId;
            });
            return result[0].fullname;*/
            var result = $filter('filter')($scope.projectMembers, {
                user_id: userId
            });
            return result[0].fullname;

        } else {
            return 'Assignee Not Set';
        }
    }

    /*---------------------------------------------------------------------------
      Name: showProgressBar
      Description:show and hide the progressBar in frontend 
      Author: RuchiDhami
    ----------------------------------------------------------------------------*/
    $scope.showProgressBar = function() {
        $scope.progressbar = true;
        // function to update the ProgressBar value
        $scope.updateProgressBar = function(value, srId) {
            $http.put("api/setProgressbar/" + srId, {
                'progress': value
            }).success(function(response) {
                console.log('update progress bar successfully' + response)
                $scope.progressbar = false;
                //mvNotifier.notify(' updated successfully');
            })
        };
    }

    /*----------------------------------------------------------------------------------------------------
       Name           : getLabelDetails
       Description    : gets all the information relating to the translation label
       Input param    : translation label, customerId
       Output param   : calls a factory method passing the same input params
       Author         : Rikesh Bhansari
       created        : 11/09/2015
    ------------------------------------------------------------------------------------------------------*/
    $scope.getLabelDetails = function(label, customerId) {
        mvAuth.getlabelDetails(label, customerId).then(function(response) {
            $scope.data = response;
        });
    }

    /*----------------------------------------------------------------------------------------------------
       Name           : updateLabelDescription
       Description    : updates the translation in database when user(superadmin) changes the translations and saves, and reloads the page
       Input param    : the details obtained from getLabelDetails, and updated labelValue(translation)
       Output param   : calls a factory method passing the same input params
       Author         : Rikesh Bhansari
       created        : 11/09/2015
    ------------------------------------------------------------------------------------------------------*/
    $scope.updateLabelDescription = function(editedLabelValue, labelId, countryId, labelCode, labelCountry) {
        console.log('inside update label description');
        var customerId = mvIdentity.currentUser.customerId;

        mvAuth.updateLabelDescription(editedLabelValue, labelId, countryId, labelCode, labelCountry, customerId).then(function(response) {
            //window.location.reload(true);
        })
    }

    /*----------------------------------------------------------------------------------------------------
      Name: openPlanningStart
      Description:  function to open datepicker in planned_start  and of 'from this day' in SR filter 
      Author: RuchiDhami        
    ------------------------------------------------------------------------------------------------------*/
    $scope.openPlanningStart = function($event) {
        $scope.planningStart.opened = true;
    };
    /*----------------------------------------------------------------------------------------------------
      Name: openReadyToTest
      Description:  function to open datepicker in ready_to_test
      Author: RuchiDhami        
    ------------------------------------------------------------------------------------------------------*/
    $scope.openReadyToTest = function($event) {
        $scope.readyToTest.opened = true;
    };

    /*----------------------------------------------------------------------------------------------------
      Name: openDueDatePicker
      Description:  function to open datepicker of 'due' and of 'before this day' in SR filter after clicking button
      Author: RuchiDhami        
    ------------------------------------------------------------------------------------------------------*/
    $scope.openDueDatePicker = function($event) {
        $scope.due.opened = true;
    }

    /*----------------------------------------------------------------------------------------------------
      Name: disabled
      Description:function to the disabled date which is less than startDate
      Author: RuchiDhami        
    ------------------------------------------------------------------------------------------------------*/
    $scope.disabled = function(date, mode) {
        return (mode === 'planning_start' && (date.getDay() === 0 || date.getDay() === 6));
    }

    /*---------------------------------------------------------------------------------------------------------
        Name :srType
        Description: get all Sr type added in the general page
        Author: RuchiDhami
    -----------------------------------------------------------------------------------------------------*/
    $scope.getSrType = function(customerId) {
        var srTypes = [];
        $http.get("/api/getSrType/" + customerId).success(function(result) {
           for (var i = 0; i < result.setting.sr_type.length; i++) {
               $scope.srType = result.setting.sr_type[i].name;
               srTypes.push($scope.srType)
           }
           $scope.srTypes = srTypes;
        });
    }

    /*---------------------------------------------------------------------------------------------------------
        Name :getSrStatus
        Description: get all Sr status from the database in the general page 
        Author: RuchiDhami
    -----------------------------------------------------------------------------------------------------*/
    $scope.getSrStatus = function(customerId) {
        var srStatus = [];
        $http.get("/api/getSrStatus/" + customerId).success(function(result) {
            $scope.srStatuses = result;
            $scope.sr_statuses = result;
        })
    }

    /*---------------------------------------------------------------------------------------------------------
        Name : cancel
        Description : cancel the file upload from sr-detail page
        Author : Rikesh Bhansari
    -----------------------------------------------------------------------------------------------------*/
    $scope.cancel = function() {
        $scope.attach.description = null;
        $scope.attach.file = null;
        $scope.invalidFile = false;
        angular.element('#upload-file').modal('hide');
    }

    /*---------------------------------------------------------------------------------------------------------
        Name : uploadSingleFile
        Description: uploads single file from sr-detail page
        Author: Rikesh Bhansari
    -----------------------------------------------------------------------------------------------------*/
    $scope.uploadSingleFile = function(attach) {
        if (!attach) {
            angular.element('#upload-file').modal('hide');
        }
        file = attach.file;
        console.log('projectId: ', projectId, 'srId: ', $scope.selectSR, 'file: ', file);
        file.upload = Upload.upload({
            url: 'api/upload?projectId=' + projectId + '&srId=' + $scope.selectSR,
            data: {
                file: file,
                desc: attach.description
            }
        });

        file.upload.then(function(response) {
            $scope.showSRDetails($scope.selectSR);
            $scope.attachmentDetails.push(response.data);
        }, function(response) {
            if (response.status > 0)
                $scope.errorMsg = response.status + ': ' + response.data;
        }, function(evt) {
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
        $scope.attach.description = null;
        $scope.attach.file = null;
        angular.element('#upload-file').modal('hide');
    }

    //for storing sr_statuses that need to be filtered
    $scope.checkedStatus = [];
    $scope.checkedStatus_ = [];

    /*---------------------------------------------------------------------------------------------------------
        Name : checkAllIncomplete
        Description: function to select all incomplete sr_statuses
        Author: Rikesh Bhansari
        Date: 2015/12/08
    ----------------------------------------------------------------------------------------------------------*/    
    $scope.checkAllIncomplete = function () {
        angular.forEach($scope.sr_statuses, function (s) {
            if(s.order < 6000) {
                s.Selected = $scope.allIncomplete;
                if ($scope.checkedStatus.indexOf(s.order) == -1) {
                    if($scope.allIncomplete) {
                        $scope.checkedStatus.push(s.order);
                    }
                } else {
                    if ($scope.checkedStatus.indexOf(s.order) !== -1) {
                        if(!$scope.allIncomplete) {
                            index = $scope.checkedStatus.indexOf(s.order);
                            $scope.checkedStatus.splice(index, 1);
                        }
                    }
                }
            }
        });
    };
    
    //for storing assignees that should be filtered
    $scope.projectMembersList = [];
    $scope.selectedAssignees = [];
    var selectedAssignees_ = [];

    //for modifying display of assignee selection for filtering
    $scope.assigneeSelectSettings = {
        scrollableHeight: '200px',
        //for scrollable list of assignees for filtering SRs
        scrollable: true
    };
    //for changing the text on button to select assignees for filter
    $scope.assigneeSelectTexts = {buttonDefaultText: 'Select Assignees'};

    //object to hold dates for filtering SRs
    $scope.dateObjForFilter = {
    };

    //function to reset filter options
    $scope.resetFilter = function() {
        $scope.checkedStatus = angular.copy($scope.checkedStatus_);
        angular.forEach($scope.sr_statuses, function (s) {
            s.Selected = true;
        });
        $("#incompleteSrs").prop("checked", true);
        $scope.selectedAssignees = angular.copy(selectedAssignees_);
        $scope.priorityValue = null;
        $("#recentlyCreated").prop("checked", false);
        $scope.recentlyCreatedSrOnly = false;
        $scope.dateObjForFilter.filterStartDate = null;
        $scope.dateObjForFilter.filterFinishDate = null;
    }
});
