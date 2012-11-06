#!/usr/bin/env python
import roslib; roslib.load_manifest('topseung_webbridge')
import rospy
import actionlib
from move_base_msgs.msg import *
from actionlib_msgs.msg import *
from topseung_webbridge.srv import *
from rosbridge_server.msg import *

"""
    Bridge node for web clients. This will assumes that there is just one client all the time.

    1. Keep watching rosbridge client list to see which client comes in and out.
"""

class TopseungWebbridge(object):
    sub_clientinfo_topic = '/rosbridge/client_info'
    sub_clientinfo = None

    srv_status_name = '/topseung/webbridge/status'
    srv_status     = None

    srv_command_name = '/topseung/webbridge/command'
    srv_command    = None

    action_bridge = {} 
    pub_bridge = {}
    action_name = '/topseung/move_base'
    action = None

    last_goal = None
    
    def __init__(self):

        self.status = "Ready"
        self.initilized = False
        self.isDisconnected = False

        # Receive rosbridge client info
        sub_clientinfo = rospy.Subscriber(self.sub_clientinfo_topic,ClientInfo, self.processClientInfo)

        # action client for navigation
        self.action = actionlib.SimpleActionClient(self.action_name,MoveBaseAction)
        self.action_result = rospy.Subscriber(self.action_name + '/result',MoveBaseActionResult,self.processResult)
        self.action.wait_for_server()

        # status for front-end
        srv_status = rospy.Service(self.srv_status_name,Status,self.processStatusService)
        srv_command = rospy.Service(self.srv_command_name,Command,self.processCommandService)
        
    def processStatusService(self,srv):
        print "Status : " + self.status
        return StatusResponse(self.status) 

    def processCommandService(self,srv):
        print "Command : " + str(srv.command)
        if srv.command == "send_goal":
            goal = MoveBaseGoal()             
            goal.target_pose = srv.pose
            self.last_goal = srv.pose
            rospy.sleep(1.0)
            self.action.send_goal(goal)
        elif srv.command == "cancel_goal":
            self.action.cancel_goal()
        elif srv.command == "last_goal":
            goal = MoveBaseGoal()             
            goal.target_pose = self.last_goal
            self.action.send_goal(goal)
        else:
            print "Error"

        return CommandResponse("OK","OK")
    def processResult(self,msg):
        if self.isDisconnected:
            self.status = "Disconnected"
            self.isDisconnected = False
        else:
            self.status = "Ready"
            self.last_goal = None

    def processClientInfo(self,msg):
        if self.initilized == False and len(msg.client_seed) > 0:
            print "set"
            self.initilized = True
        elif self.initilized == True and len(msg.client_seed) == 0:
            if self.last_goal:
                self.isDisconnected = True
                rospy.loginfo("Client disconncted. Canceling goal..")
                self.action.cancel_goal()
            self.initilized  = False


    def spin(self):
        rospy.spin()



if __name__ == '__main__':
    rospy.init_node('topseung_webbridge')
    
    c = TopseungWebbridge()
    rospy.loginfo('Initialized')
    c.spin()
    rospy.loginfo('Bye bye')
