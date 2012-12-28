dojoConfig = {
  has: {
    "dojo-debug-messages": true
  },

  async: true,

  parseOnLoad: false,

  aliases: [
    [ "eventemitter2","rosjs/dist/eventemitter2"],
    [ "actionclient", "actionlibjs/actionclient"],
    [ "map","map2djs/map"]
  ],

  packages: [ 
    { name:"jquery", location:"/jquery_common"},
    { name:"robotwebtools", location:"/robotwebtools_amd"},
    { name:"rosjs", location:"/robotwebtools_amd/rosjs"},
    { name:"map2djs", location:"/robotwebtools_amd/map2djs"},
    { name:"actionlibjs", location:"/robotwebtools_amd/actionlibjs"},
    { name:"interactivemarersjs", location:"/robotwebtools_amd/interactivemarersjs"},
    { name:"nav2djs", location:"/robotwebtools_amd/nav2djs"},
    { name:"yujin_webtools", location:"/yujin_webtools"},
  ],
}

