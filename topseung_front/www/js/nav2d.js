/*********************************************************************
 *
 * Software License Agreement (BSD License)
 *
 *  Copyright (c) 2012, Worcester Polytechnic Institute
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above
 *     copyright notice, this list of conditions and the following
 *     disclaimer in the documentation and/or other materials provided
 *     with the distribution.
 *   * Neither the name of the Worcester Polytechnic Institute nor the 
 *     names of its contributors may be used to endorse or promote 
 *     products derived from this software without specific prior 
 *     written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 *  FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 *  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 *  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 *  LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 *
 *   Author: Russell Toris
 *  Version: October 8, 2012
 *  
 *  Converted to AMD by Jihoon Lee
 *  Version: September 27, 2012
 *
 *********************************************************************/

/* Modified version for topseung interface
   It uses a bridge node to send a navigation goal 
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([ 'eventemitter2', 'actionclient', 'map' ], factory);
  } else {
    root.Nav2D = factory(root.EventEmitter2, root.ActionClient, root.Map);
  }
}
    (
        this,
        function(EventEmitter2, ActionClient, Map) {
          var Nav2D = function(options) {
            var nav2D = this;
            options = options || {};
            nav2D.ros = options.ros;
            nav2D.mapTopic = options.mapTopic || '/map';
            nav2D.continuous = options.continuous;
            nav2D.canvasID = options.canvasID;
            // optional (used if you do not want to stream /map or use a custom image)
            nav2D.image = options.image;
            nav2D.mapMetaTopic = options.mapMetaTopic || '/map_metadata';
            // optional color settings
            nav2D.clickColor = options.clickColor || '#543210';
            nav2D.robotColor = options.robotColor || '#012345';
            nav2D.initialPoseTopic = options.initialPoseTopic || '/topseung/initialpose';
            nav2D.commandSrv = options.commandSrv || '/topseung/webbridge/command';
            nav2D.commandSrvType = options.commandSrvType || '/topseung_webbridge/Command';
            nav2D.resultTopic = options.resultTopic || '/topseung/move_base/result';
            nav2D.resultTopicType = options.resultTopicType || '/move_base_msgs/MoveBaseActionResult';
            nav2D.goalTopic = options.goalTopic || '/topseung/move_base/goal';
            nav2D.goalTopicType = options.goalTopicType || '/move_base_msgs/MoveBaseActionGoal';

            // draw robot 
            nav2D.drawrobot = options.drawrobot;
            
            nav2D.mode = 'none';
            
            // current robot pose message
            nav2D.robotPose = null;
            // current goal
            nav2D.goalMessage = null;

            // icon information for displaying robot and click positions
            var clickRadius = 1;
            var clickUpdate = true;
            var maxClickRadius = 5;
            var robotRadius = 1;
            var robotRadiusGrow = true;
            var maxRobotRadius = 10;

            // position information
            var robotX;
            var robotY;
            var robotRotZ;

            // goal pose information
            var goalX=null;
            var goalY;
            var goalRotZ;

            // inprogress drawing
            var ismousedown = false;
            var clickX;
            var clickY;
            var clickZX;
            var clickZY;
            var downX;
            var downY;


            // map and metadata
            var map;
            var mapWidth;
            var mapHeight;
            var mapResolution;
            var mapX;
            var mapY;
            var drawInterval;

            // flag to see if everything (map image, metadata, and robot pose) is available
            var available = false;

            // grab the canvas
            var canvas = document.getElementById(nav2D.canvasID);


            /////////////////////////////////////////////////////////
            // Load Map
            //////////////////////////////////////////////////////////
            // check if we need to fetch a map or if an image was provided
            if (nav2D.image) {
              // set the image
              map = new Image();
              map.src = nav2D.image;

              // get the meta information
              var metaListener = new nav2D.ros.Topic({
                name : nav2D.mapMetaTopic,
                messageType : 'nav_msgs/MapMetaData'
              });
              metaListener.subscribe(function(metadata) {
                // set the metadata
                mapWidth = metadata.width;
                mapHeight = metadata.height;
                mapResolution = metadata.resolution;
                mapX = metadata.origin.position.x;
                mapY = metadata.origin.position.y;

                // we only need the metadata once
                metaListener.unsubscribe();
              });
            } else {
              // create a map object
              var mapFetcher = new Map({
                ros : nav2D.ros,
                mapTopic : nav2D.mapTopic,
                continuous : nav2D.continuous
              });
              mapFetcher.on('available', function() {
                // store the image
                map = mapFetcher.image;

                // set the metadata
                mapWidth = mapFetcher.info.width;
                mapHeight = mapFetcher.info.height;
                mapResolution = mapFetcher.info.resolution;
                mapX = mapFetcher.info.origin.position.x;
                mapY = mapFetcher.info.origin.position.y;
              });
            }
            /////////////////////////////////////////////////////////////////
            // robot Pose Listener
            ///////////////////////////////////////////////////////////////
            // setup a listener for the robot pose
            var poseListener = new nav2D.ros.Topic({
              name : '/robot_pose',
              messageType : 'geometry_msgs/Pose',
              throttle_rate : 100,
            });
            poseListener
                .subscribe(function(pose) {
                  // set the public field
                  nav2D.robotPose = pose;
                  
                  // only update once we know the map metadata
                  if (mapWidth && mapHeight && mapResolution) {


                    // compute pose 
                    p = nav2D.getCanvasPose(pose);

                    robotX = p[0];
                    robotY = p[1];
                    robotRotZ = p[2];

                    // check if this is the first time we have all information
                    if (!available) {
                      available = true;
                      // notify the user we are available
                      nav2D.emit('available');
                      // set the interval for the draw function
                      drawInterval = setInterval(draw, 30);
                    }
                  }
                });

            nav2D.getCanvasPose = function(pose) {

              // get the current canvas size
              var canvasWidth = canvas.getAttribute('width');
              var canvasHeight = canvas.getAttribute('height');

              // set the pixel location with (0, 0) at the top left
              var x = ((pose.position.x - mapX) / mapResolution)
                  * (canvasWidth / mapWidth);
              var y = canvasHeight
                  - (((pose.position.y - mapY) / mapResolution) * (canvasHeight / mapHeight));

              // get the rotation Z
              var q0 = pose.orientation.w;
              var q1 = pose.orientation.x;
              var q2 = pose.orientation.y;
              var q3 = pose.orientation.z;
              
              var rotZ = -Math.atan2(2 * ( q0 * q3 + q1 * q2) , 1 - 2 * (Math.pow(q2,2) +Math.pow(q3,2)));

              return [x, y, rotZ];
            };


            ///////////////////////////////////////////////////////////////////////////////
            // Draw Robot
            ////////////////////////////////////////////////////////////////////////////////

            var robotIcon = new Image();
            robotIcon.src ="data:image/png;base64,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";
            // robots
            var robotsize = 23;
            var robotinc = 0.1;

            nav2D.drawrobot = nav2D.drawrobot || function(context,rX,rY,rRotZ) {
              var offset = robotsize/2;

              context.save();
              context.translate(rX,rY);
              context.rotate(rRotZ);
              context.drawImage(robotIcon,0,0,robotsize,robotsize);

              if(robotsize >= 30)
                robotinc = -0.3;
              else if(robotsize <= 25)
                robotinc = 0.3;

              robotsize += robotinc;
              context.restore();
            };

            ///////////////////////////////////////////////////////////////
            // draw goal
            ///////////////////////////////////////////////////////////////
            var goalsize = 4;
            var goalinc = 0.5;
            nav2D.drawgoal = nav2D.drawgoal || function(context,rX,rY,rRotZ) {
              var offset = goalsize/2;

              context.save();
              context.translate(rX,rY);
              context.rotate(rRotZ);
              context.drawImage(robotIcon,0,0,robotsize,robotsize);

              if(robotsize >= 30)
                robotinc = -0.3;
              else if(robotsize <= 25)
                robotinc = 0.3;

              robotsize += robotinc;
              context.restore();
            };





            ///////////////////////////////////////////////////////
            // draw inprogress
            ////////////////////////////////////////////////////
            nav2D.drawInprogress = function(context)
            {
              var angle;

              if(ismousedown) {
                angle = Math.atan2((clickZY - clickY),(clickZX-clickX));
                context.save();
                context.fillStyle = '#FA0';
                context.strokeStyle = '#FA0';
                context.lineWidth = 4;
                context.translate(clickX,clickY);
                context.rotate(angle);
                nav2D.drawTriangle(context,goalsize);
                context.restore();
              }
            };

            nav2D.drawTriangle = function(context,size) {
              context.beginPath();
              context.lineTo(0,3+size);
              context.lineTo(25+size,0);
              context.lineTo(0,-3-size);
              context.lineTo(0,0);
              context.fill();
              context.stroke();
              context.closePath();
            };

            /////////////////////////////////////////////////////////////////
            // draw 
            ///////////////////////////////////////////////////////////////////
            // create the draw function
            var draw = function() {
              // grab the drawing context
              var context = canvas.getContext('2d');

              // grab the current sizes
              var width = canvas.getAttribute('width');
              var height = canvas.getAttribute('height');

              // add the image back to the canvas
              context.drawImage(map, 0, 0, width, height);

              // draw the robot location
              nav2D.drawrobot(context,robotX,robotY,robotRotZ);

              // draw Goal
              if(goalX != null)
                nav2D.drawgoal(context,goalX,goalY,goalRotZ);

              // draw inprogress initpose or goal
              nav2D.drawInprogress(context);
            };

            //////////////////////////////////////////////////////////////////////////////


            // setup the services send_goal, cancel, result, status
            var commandClient = new ros.Service({
                name: nav2D.commandSrv,
                servicesType : nav2D.commandSrvType
            });

            var resultTopic = new ros.Topic({
                name: nav2D.resultTopic,
                messageType : nav2D.resultTopicType 
            });

            resultTopic.subscribe(function(msg) {
                if(msg.status.text.search('another goal') < 0)
                {
                  goalX = null;
                }
              });

            var goalTopic = new ros.Topic({
                name: nav2D.goalTopic,
                messageType : nav2D.goalTopicType
            });
            goalTopic.subscribe(function(msg) {
                var p = nav2D.getCanvasPose(msg.goal.target_pose.pose);
                goalX = p[0];
                goalY = p[1];
                goalRotZ = p[2];
                nav2D.setmode('moving');
            });

            nav2D.cancel = function() {
              var req = new ros.ServiceRequest({
                command : 'cancel_goal',
                pose : {
                  header : {
                    frame_id : '/map'
                  },
                  pose : {
                    position : {
                      x : 0,
                      y : 0,
                      z : 0
                    },
                    orientation : {
                      x : 0,
                      y : 0,
                      z : 0,
                      w : 1
                    }
                  }
                }
              });
              commandClient.callService(req,function(resp) {
                });   
            };


            // get the position in the world from a point clicked by the user
            nav2D.getPoseFromEvent = function(event) {
              // only go if we have the map data
              if (available) {
                // get the y location with (0, 0) at the top left
                var offsetLeft = 0;
                var offsetTop = 0;
                var element = canvas;
                var offX;
                var offY;
                while (element && !isNaN(element.offsetLeft)
                    && !isNaN(element.offsetTop)) {
                  offsetLeft += element.offsetLeft - element.scrollLeft;
                  offsetTop += element.offsetTop - element.scrollTop;
                  element = element.offsetParent;
                }
                offX = event.pageX - offsetLeft;
                offY = event.pageY - offsetTop;

                // convert the pixel location to a pose
                var canvasWidth = canvas.getAttribute('width');
                var canvasHeight = canvas.getAttribute('height');
                var x = (offX * (mapWidth / canvasWidth) * mapResolution)
                    + mapX;
                var y = ((canvasHeight - offY) * (mapHeight / canvasHeight) * mapResolution)
                    + mapY;
                return [ x, y , offX,offY];
              } else {
                return null;
              }
            };

            // a function to send the robot to the given goal location
            nav2D.sendGoalPose = function(x, y,quat) {
              // create a goal
              var req = new ros.ServiceRequest({
                command : 'send_goal',
                pose : {
                  header : {
                    frame_id : '/map'
                  },
                  pose : {
                    position : {
                      x : x,
                      y : y,
                      z : 0
                    },
                    orientation : {
                      x : quat[0],
                      y : quat[1],
                      z : quat[2],
                      w : quat[3]
                    }
                  }
                }
              });
              commandClient.callService(req,function(resp) {
                });
            };

           nav2D.getQuatFromRPY = function(roll,pitch,yaw) {
             var halfyaw = yaw * 0.5;
             var halfpitch = pitch * 0.5;
             var halfroll = roll * 0.5;
             var cosyaw = Math.cos(halfyaw);
             var sinyaw = Math.sin(halfyaw);
             var cospitch = Math.cos(halfpitch);
             var sinpitch = Math.sin(halfpitch);
             var cosroll = Math.cos(halfroll);
             var sinroll = Math.sin(halfroll);
             var value = [ sinroll * cospitch * cosyaw - cosroll * sinpitch * sinyaw, // x
                           cosroll * sinpitch * cosyaw + sinroll * cospitch * sinyaw, // y
                           cosroll * cospitch * sinyaw - sinroll * sinpitch * cosyaw, // z
                           cosroll * cospitch * cosyaw + sinroll * sinpitch * sinyaw]; // w

             return value;
           }




           var canvasMouseDownEvent = function(event) {
             if(nav2D.mode == 'goal' || nav2D.mode =='init') {

               var poses = nav2D.getPoseFromEvent(event);

               downX = poses[0];
               downY = poses[1];
               clickX = clickZX = poses[2];
               clickY = clickZY = poses[3];

               if(nav2D.mode =='goal') {
                 ismousedown = true;
               }
               else if(nav2D.mode == 'init') {
                 ismousedown = true;
               }
               else {
                 nav2D.emit('error','mode error');
               }
             }
           };

           var canvasMoveEvent = function(event) {
               if(ismousedown) {
                 var poses = nav2D.getPoseFromEvent(event);
                console.log("touch move");
                console.log(poses[2]);
                console.log(poses[3]);

                 clickZX = poses[2];
                 clickZY = poses[3];
               }
           };

           var canvasMouseUpEvent = function(event) {
              if(ismousedown) {
                var poses = nav2D.getPoseFromEvent(event);
                // commented out touchend returned weird pageX and pageY
//                clickZX = poses[2];
//                clickZY = poses[3];
                 
                var angle = Math.atan2((clickZY - clickY),(clickZX-clickX));
                var quat = nav2D.getQuatFromRPY(0,0,-angle);
                                                                                       
                ismousedown = false;

                if(nav2D.mode == 'init') {
                  nav2D.sendInitPose(downX, downY,quat);
                  nav2D.setmode('none');
                }
                else if(nav2D.mode == 'goal')
                {
                  nav2D.sendGoalPose(downX, downY,quat);
                  nav2D.setmode('none');
                }
                else {
                  nav2D.emit('error','mode error');
                }
              }
            };

           var canvasTouchDownEvent = function(event) {
             canvasMouseDownEvent(event);
             event.preventDefault();
           };

           canvas.addEventListener('mousedown',canvasMouseDownEvent);
           canvas.addEventListener('touchstart',canvasTouchDownEvent);

           var canvasTouchMoveEvent = function(event) {
             canvasMoveEvent(event);
             event.preventDefault();
           };

           canvas.addEventListener('mousemove',canvasMoveEvent);
           canvas.addEventListener('touchmove',canvasTouchMoveEvent);

           var canvasTouchUpEvent = function(event) {
             canvasMouseUpEvent(event);
             event.preventDefault();
           };

           canvas.addEventListener('mouseup',canvasMouseUpEvent);
           canvas.addEventListener('touchend',canvasMouseUpEvent);

           nav2D.setmode = function(mode) {
              nav2D.mode = mode;
           };

            nav2D.initPosePub = new nav2D.ros.Topic({
              name : nav2D.initialPoseTopic,
              type : 'geometry_msgs/PoseWithCovarianceStamped',
            });

            nav2D.sendInitPose = function(x,y,quat) {
              var pose_msg = new ros.Message({
                header : {
                    frame_id : '/map'
                },
                pose : {
                  pose : {
                    position: {
                      x : x,
                      y : y,
                      z : 0,
                    },
                    orientation : {
                      x : quat[0],
                      y : quat[1],
                      z : quat[2],
                      w : quat[3],
                    },
                  },
                  covariance: [0.25, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.25, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.06853891945200942]
                },
              });
              nav2D.initPosePub.publish(pose_msg);
            };

          };
          Nav2D.prototype.__proto__ = EventEmitter2.prototype;
          return Nav2D;
        }));
