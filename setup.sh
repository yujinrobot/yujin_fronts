#!/bin/sh

TARGET_PATH=tt
mkdir $TARGET_PATH

#Path to your robot webtools
#robotwebtool_path=/path/to/your/robotwebtool/
robotwebtool_path=~/research/yujin/robotwebtools

#Path to the webtools_commmon
webtools_common_path=~/research/yujin/webtools_common

# Creat link to robotwebtools_amd
dir=$webtools_common_path/robotwebtools_amd/www
rm -rf $dir 
mkdir $dir

  for file in `ls $robotwebtool_path`; do
    ln -sf $robotwebtool_path/$file $dir/$file
  done 

  for file in `ls $webtools_common_path`; do
    ln -sf $webtools_common_path/$file/www $TARGET_PATH/$file
  done
