#!/usr/bin/env python
"""
    roswww_pack pack.py
    it crawls all www directory in rospackage path and copy them into destination directory

    adopted some code from roswww
"""

import rospy
import subprocess
import os
import argparse

def run(*args) :
    ''' run the provided command and return its stdout'''
    args = sum([(arg if type(arg) == list else [arg]) for arg in args], [])
    return subprocess.Popen(args, stdout=subprocess.PIPE).communicate()[0].strip()

def split_words(text):
    ''' return a list of lines where each line is a list of words '''
    return [line.strip().split() for line in text.split('\n')]

def get_packages():
    """Find the names and locations of all packages """
    line = split_words(run('rospack','list'))
    packages = [{'name': name, 'path':path} for name, path in line]
    return packages

def parse_args():
    parser = argparse.ArgumentParser(description='Crawls all www directory in ros package path')
    parser.add_argument('-d','--destination',type=str,required=True,nargs=1,help='/home/yourdir/www')
    args = parser.parse_args()
    return args

# www only for now. We can copy other directories later.
def copy_directories(packs,subdir,dest):
    print "Start Copying..."
    for p in packs:
        path = p['path'] + '/' + subdir
        name = p['name']
        destination = dest +'/'+name
        print "\tCopying " + name
        run('cp','-r',path,destination)
    print "Done"



if __name__=='__main__':
    subdir = 'www'
    args = parse_args()
    packages = get_packages()
    packages = [ p for p in packages if os.path.exists(p['path']+'/'+subdir)]
    
    try:         
        os.mkdir(args.destination[0])
    except OSError as e:
        print str(args.destination[0]) + "is directory already exist. Please choose different directory name"

    copy_directories(packages,'www',args.destination[0])
