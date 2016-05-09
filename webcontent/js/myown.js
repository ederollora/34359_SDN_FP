$( document ).ready(function() {

    var defaultDPID = '';
    var switches = {};
    var switchDPIDs = []
    
    var stockGraphActiveDPID = '';
    var overviewActiveDPID = '';

    var areaData = [];
    var areaconfig = {};
    var lineChartData = {};
    var packetType = ['OFPacketIn','OFFlowMod','OFPacketOut'];
    var switchPorts = {}
    var currentVPN='';

    var vpn1Nodes = [1,2,3,6];
    var vpn2Nodes = [];

    var vpn1Rules = {};
    var vpn2Rules = {};
    var homeGWvpn1 = {};
    var homeGWvpn2 = {};

    var stockChart;

    var vpn1Actions = {};
    var vpn2Actions = {};

    generateRules();
    console.log(vpn1Rules);
    console.log(vpn2Rules);


    $('#switches-table > tbody > tr').each(function() {
        //$(this).children('td').eq(1).text()
        var dpid = $(this).children('td:first').text();
        var dpidElems = dpid.split(':');
        var shortenedName = 'Switch '+dpidElems[dpidElems.length - 2]+':'+dpidElems[dpidElems.length - 1]
        //switches[dpid]['name'] = shortenedName;
        switches[dpid] = shortenedName;
        switchDPIDs.push(dpid);
    });

    console.log(switchDPIDs)
    console.log(switches)

    defaultDPID = switchDPIDs[0];
    stockGraphActiveDPID = defaultDPID;
    overviewActiveDPID = defaultDPID;

    update_hc_ddown(switches);

    

    //getSwitchPorts(switches,switchPorts);

    $('#vpn1').on("click",function(){
        sethomeGW1();
    })

    $('#vpn2').on("click",function(){
        sethomeGW2();
    })

    $('#installRules').on("click",function(){
        setVPNs();
    })

    $('#eraseRules').on("click",function(){
        $.getJSON('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher?query=/wm/staticflowentrypusher/clear/all/json',
            function(data) {
                console.log(data);                          
            }
        )
        .success(function() { 
            console.log("All rules erased"); 
        })
        .error(function() { 
            addErroneousRequest();
        });
    })

    $("#hc_ddown_filter li").on("click",function() {
        var id = $(this).find('a:first').attr('id');;
        if(id == "hc_down_clear"){
            for (var i = 0; i < stockChart.series.length; i++) {
               stockChart.series[0].remove();
            }
            stockChart.redraw();
        }else{
            stockGraphActiveDPID = $(this).find('a:first').attr('id');
            $('#hc_heading').html('<i class="fa fa-info-circle fa-fw"></i> Number of entries of '+switches[stockGraphActiveDPID]+' '+$("#hc_filter")[0].outerHTML);
            setStockChart();
        }
     });

    $("#overview_filter li").on("click",function() {
        var id = $(this).find('a:first').attr('id');
        if(id == "overview_clear"){
            for (var i = 0; i < packetType.length; i++) {
               $('#'+packetType[i]).text("0");
            }
        }else{
            overviewActiveDPID = $(this).find('a:first').attr('id');
            $('#overview_ph').html('<i class="fa fa-info-circle fa-fw"></i> Overview of '+switches[overviewActiveDPID]+' '+$("#ov_filter")[0].outerHTML);

        }
     });

    function update_hc_ddown(switches){

        $.each(switchDPIDs, function (index, value) {
            $("#hc_ddown_filter").append('<li ><a id="'+value+'">'+switches[value]+'</a></li>');
            $("#overview_filter").append('<li ><a id="'+value+'">'+switches[value]+'</a></li>');
            if(index == switchDPIDs.length - 1){
                $("#hc_ddown_filter").append('<li class="divider"></li>');
                $("#hc_ddown_filter").append('<li "><a id="hc_down_clear">Clear</a></li>');
                $("#overview_filter").append('<li class="divider"></li>');
                $("#overview_filter").append('<li ><a id="overview_clear">Clear</a></li>');
            }
        });

    }

    function updateDeviceList(){

    }

    function addErroneousRequest(){
        var num = parseInt($("#erroneousReqs").text(), 10) + 1;
        $("#erroneousReqs").text(num);
    }

    function setVPNs(){
        setVPN1();
        setVPN2();
    }

    function setVPN1(){

        $.each(vpn1Rules, function( key, value ) {
            $.post('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher', 
                {
                    url: '/wm/staticflowentrypusher/json', 
                    rule: JSON.stringify(value)
                }, 
                function(data) {
                    console.log(data); 
            });
        });
    }

    function setVPN2(){

        $.each(vpn2Rules, function( key, value ) {
            $.post('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher', 
                {
                    url: '/wm/staticflowentrypusher/json', 
                    rule: JSON.stringify(value)
                }, 
                function(data) {
                    console.log(data); 
            });
        });
    }

    function sethomeGW1(){

        $.getJSON('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher?query=/wm/staticflowentrypusher/clear/00:00:00:00:00:00:00:01/json',
            function(data) {
                console.log(data);                          
            }
        )
        .success(function() { 
            console.log("Home GW cleared");
            sethomeGWvpn1(); 
        })
        .error(function() { 
            addErroneousRequest();
        });
    }

    function sethomeGW2(){

        $.getJSON('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher?query=/wm/staticflowentrypusher/clear/00:00:00:00:00:00:00:01/json',
            function(data) {
                console.log(data);                          
            }
        )
        .success(function() { 
            console.log("Home GW cleared");
            sethomeGWvpn2(); 
        })
        .error(function() { 
            addErroneousRequest();
        });
    }

    function sethomeGWvpn1(){

        $.each(homeGWvpn1, function( key, value ) {
            $.post('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher', 
                {
                    url: '/wm/staticflowentrypusher/json', 
                    rule: JSON.stringify(value)
                }, 
                function(data) {
                    console.log(data); 
            });
        });
    }

    function sethomeGWvpn2(){

        $.each(homeGWvpn2, function( key, value ) {
            $.post('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher', 
                {
                    url: '/wm/staticflowentrypusher/json', 
                    rule: JSON.stringify(value)
                }, 
                function(data) {
                    console.log(data); 
            });
        });
    }

    function generateRules(){

        homeGWvpn1 = {

            "flow-mod-sw1-1": 
            {        
                "switch":"00:00:00:00:00:00:00:01", 
                "name":"flow-mod-sw1-1", 
                "priority":"32767", 
                "ingress-port":"3", 
                "active":"true", 
                "actions":"set-vlan-id=10,output=1"
            },
            "flow-mod-sw1-2":
            {        
                "switch":"00:00:00:00:00:00:00:01", 
                "name":"flow-mod-sw1-2", 
                "priority":"32767", 
                "ingress-port":"1", 
                "active":"true", 
                "actions":"strip-vlan,output=3"
            }
        }

        homeGWvpn2 = {
            "flow-mod-sw1-3": 
            {        
                "switch":"00:00:00:00:00:00:00:01", 
                "name":"flow-mod-sw1-3", 
                "priority":"32767", 
                "ingress-port":"3", 
                "active":"true", 
                "actions":"set-vlan-id=20,output=2"
            },
            "flow-mod-sw1-4":
            {        
                "switch":"00:00:00:00:00:00:00:01", 
                "name":"flow-mod-sw1-4", 
                "priority":"32767", 
                "ingress-port":"2", 
                "active":"true", 
                "actions":"strip-vlan,output=3"
            }
        }

        vpn1Rules = {

            "flow-mod-sw2-1":
            {        
                "switch":"00:00:00:00:00:00:00:02", 
                "name":"flow-mod-sw2-1", 
                "priority":"32767", 
                "ingress-port":"4",
                "vlan-id":"10",
                "active":"true", 
                "actions":"output=1"
            },
            "flow-mod-sw2-2":
            {        
                "switch":"00:00:00:00:00:00:00:02", 
                "name":"flow-mod-sw2-2", 
                "priority":"32767", 
                "ingress-port":"1",
                "vlan-id":"10",
                "active":"true", 
                "actions":"output=4"
            },
            "flow-mod-sw3-1":
            {        
                "switch":"00:00:00:00:00:00:00:03", 
                "name":"flow-mod-sw3-1", 
                "priority":"32767", 
                "ingress-port":"3",
                "vlan-id":"10",
                "active":"true", 
                "actions":"output=2"
            },
            "flow-mod-sw3-2":
            {        
                "switch":"00:00:00:00:00:00:00:03", 
                "name":"flow-mod-sw3-2", 
                "priority":"32767", 
                "ingress-port":"2",
                "vlan-id":"10",
                "active":"true", 
                "actions":"output=3"
            },
            "flow-mod-sw6-1":
            {        
                "switch":"00:00:00:00:00:00:00:06", 
                "name":"flow-mod-sw6-1", 
                "priority":"32767", 
                "ingress-port":"3", 
                "active":"true", 
                "actions":"strip-vlan,output=2"
            },
            "flow-mod-sw6-2":
            {        
                "switch":"00:00:00:00:00:00:00:06", 
                "name":"flow-mod-sw6-2", 
                "priority":"32767", 
                "ingress-port":"2", 
                "active":"true", 
                "actions":"set-vlan-id=10,output=3"
            }
        }

        vpn2Rules = {

            "flow-mod-sw4-1":
            {        
                "switch":"00:00:00:00:00:00:00:04", 
                "name":"flow-mod-sw4-1", 
                "priority":"32767", 
                "ingress-port":"4",
                "vlan-id":"20",
                "active":"true", 
                "actions":"output=2"
            },
            "flow-mod-sw4-2":
            {        
                "switch":"00:00:00:00:00:00:00:04", 
                "name":"flow-mod-sw4-2", 
                "priority":"32767", 
                "ingress-port":"2",
                "vlan-id":"20",
                "active":"true", 
                "actions":"output=4"
            },
            "flow-mod-sw7-1":
            {        
                "switch":"00:00:00:00:00:00:00:07", 
                "name":"flow-mod-sw7-1", 
                "priority":"32767", 
                "ingress-port":"4",
                "vlan-id":"20",
                "active":"true", 
                "actions":"output=2"
            },
            "flow-mod-sw7-2":
            {        
                "switch":"00:00:00:00:00:00:00:07", 
                "name":"flow-mod-sw7-2", 
                "priority":"32767", 
                "ingress-port":"2",
                "vlan-id":"20",
                "active":"true", 
                "actions":"output=4"
            },
            "flow-mod-sw9-1":
            {        
                "switch":"00:00:00:00:00:00:00:09", 
                "name":"flow-mod-sw9-1", 
                "priority":"32767", 
                "ingress-port":"2", 
                "active":"true", 
                "actions":"strip-vlan,output=1"
            },
            "flow-mod-sw9-2":
            {        
                "switch":"00:00:00:00:00:00:00:09", 
                "name":"flow-mod-sw9-2", 
                "priority":"32767", 
                "ingress-port":"1", 
                "active":"true", 
                "actions":"set-vlan-id=20,output=2"
            }
        }
    }

    /*function getSwitchPorts(switches){

        var portStats;

        $.getJSON('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher?query=/wm/core/switch/all/port/json',
            function(data) {
                if(data.length>0){
                    portStats = data;
                    $.each(switch, function(key, vaue) {
                        // key is switch address
                        portStats[key]
                    });
                    
                }                        
            }
        )
        .success(function() { /*console.log("OFFlowMod request: Success");})
        .error(function() { 
            console.log("OFFlowMod request: Error");
            addErroneousRequest();
         }),

    }*/



    Highcharts.setOptions({
        global : {
            useUTC : false
        }
    });

    function setStockChart(){

        stockChart = $('#hc-line-chart').highcharts('StockChart', {
            chart : {
                events : {
                    load : function () {

                        // set up the updating of the chart each second
                        var series = this.series[0];
                        setInterval(function () {

                            $.getJSON('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher?query=/wm/core/switch/all/flow/json',
                                function(data){

                                    //console.log(data)

                                    var x = (new Date()).getTime(), // current time
                                        y = 0;

                                    if(Object.keys(data[stockGraphActiveDPID]).length==0){
                                        y = 0;
                                    }else{
                                        y=data[stockGraphActiveDPID].length;
                                    }
                                    
                                    series.addPoint([x, y]);
                                }
                            )
                            .success(function() { 
                                $('#hc_heading').html('<i class="fa fa-info-circle fa-fw"></i> Number of entries of '+switches[stockGraphActiveDPID]+' '+$("#hc_filter")[0].outerHTML);

                            })
                            .error(function() { 
                                console.log("Flow tables request: Error");
                                addErroneousRequest();
                            })
                        }, 8000);
                    }
                }
            },

            rangeSelector: {
                buttons: [{
                    count: 1,
                    type: 'minute',
                    text: '1M'
                }, {
                    count: 5,
                    type: 'minute',
                    text: '5M'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                inputEnabled: false,
                selected: 0
            },

            title : {
                text : 'Data from controller'
            },

            exporting: {
                enabled: false
            },

            series : [{
                name: switches[stockGraphActiveDPID],
                data: 0
            }]
        });
    }

    setStockChart();

    setInterval(function () {
        $.when(
            $.getJSON('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher?query=/wm/core/counter/'+overviewActiveDPID+'/OFFlowMod/json',
                function(data) {
                    if(Object.keys(data).length>0){
                        var key = Object.keys(data[overviewActiveDPID])[0];
                        lineChartData['OFFlowMod'] = data[overviewActiveDPID][key];
                    }else{
                        lineChartData['OFFlowMod'] = 0;
                    }                             
                }
            )
            .success(function() { /*console.log("OFFlowMod request: Success");*/ })
            .error(function() { 
                console.log("OFFlowMod request: Error");
                addErroneousRequest();
             }),

            $.getJSON('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher?query=/wm/core/counter/'+overviewActiveDPID+'/OFPacketIn/json',
                function(data) {
                    if(Object.keys(data).length>0){
                        var key = Object.keys(data[overviewActiveDPID])[0];
                        lineChartData['OFPacketIn'] = data[overviewActiveDPID][key];
                    }else{
                        lineChartData['OFPacketIn'] = 0;
                    }          
                }
            )
            .success(function() { /*console.log("OFPacketIn request: Success");*/ })
            .error(function() { 
                console.log("OFPacketIn request: Error");
                addErroneousRequest();
             }),

            $.getJSON('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher?query=/wm/core/counter/'+overviewActiveDPID+'/OFPacketOut/json',
                function(data) {
                    if(Object.keys(data).length>0){
                        var key = Object.keys(data[overviewActiveDPID])[0];
                        lineChartData['OFPacketOut'] = data[overviewActiveDPID][key];
                    }else{
                        lineChartData['OFPacketOut'] = 0;
                    } 
                }
            )
            .success(function() { /*console.log("OFPacketOut request: Success");*/ })
            .error(function() { 
                console.log("OFPacketOut request: Error");
                addErroneousRequest();
            })
        ).then( function(){
            $('#overview_ph').html('<i class="fa fa-info-circle fa-fw"></i> Overview of '+switches[overviewActiveDPID]+' '+$("#ov_filter")[0].outerHTML);

            for (var i = 0; i < packetType.length; i++) {
                $('#'+packetType[i]).text(lineChartData[packetType[i]]);                
            }            
        });
    }, 10000);

    function gauge() {

        $('#gauge').highcharts({

            chart: {
                type: 'gauge',
                plotBackgroundColor: null,
                plotBackgroundImage: null,
                plotBorderWidth: 0,
                plotShadow: false
            },

            title: {
                text: 'Memory'
            },

            pane: {
                startAngle: -150,
                endAngle: 150,
                background: [{
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#FFF'],
                            [1, '#333']
                        ]
                    },
                    borderWidth: 0,
                    outerRadius: '109%'
                }, {
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#333'],
                            [1, '#FFF']
                        ]
                    },
                    borderWidth: 1,
                    outerRadius: '107%'
                }, {
                    // default background
                }, {
                    backgroundColor: '#DDD',
                    borderWidth: 0,
                    outerRadius: '105%',
                    innerRadius: '103%'
                }]
            },

            // the value axis
            yAxis: {
                min: 0,
                max: 200,

                minorTickInterval: 'auto',
                minorTickWidth: 1,
                minorTickLength: 10,
                minorTickPosition: 'inside',
                minorTickColor: '#666',

                tickPixelInterval: 30,
                tickWidth: 2,
                tickPosition: 'inside',
                tickLength: 10,
                tickColor: '#666',
                labels: {
                    step: 2,
                    rotation: 'auto'
                },
                title: {
                    text: 'MBytes'
                },
                plotBands: [{
                    id: 'green',
                    from: 0,
                    to: 120,
                    color: '#55BF3B' // green
                }, {
                    id: 'yellow',
                    from: 120,
                    to: 160,
                    color: '#DDDF0D' // yellow
                }, {
                    id: 'red',
                    from: 160,
                    to: 200,
                    color: '#DF5353' // red
                }]
            },

            series: [{
                name: 'Used',
                data: [0],
                tooltip: {
                    valueSuffix: ' MBytes'
                }
            }]

        },
        // Add some life
        function (chart) {
            if (!chart.renderer.forExport) {
                setInterval( function () {
                    $.getJSON('http://192.168.56.101:8090/SDNProjectWebsite/ProxyFetcher?query=/wm/core/memory/json',
                        function(data) {
                            if(Object.keys(data).length>0){
                                var point = chart.series[0].points[0];
                                var max = (parseInt(data['total'],10)/1000000>>0);
                                chart.yAxis[0].options.max = max;
                                
                                chart.yAxis[0].removePlotBand('red');
                                chart.yAxis[0].removePlotBand('green');
                                chart.yAxis[0].removePlotBand('yellow');

                                chart.yAxis[0].addPlotBand({
                                    id: 'red',
                                    from: max*0.33,
                                    to: max,
                                    color: '#DF5353' // red
                                });

                                chart.yAxis[0].addPlotBand({
                                    id: 'yellow',
                                    from: max*0.33,
                                    to: max*0.66,
                                    color: '#DDDF0D' // yellow
                                });

                                chart.yAxis[0].addPlotBand({
                                    id: 'green',
                                    from: 0,
                                    to: max*0.33,
                                    color: '#55BF3B'
                                });

                                point.update( ((parseInt(data['total'],10)-parseInt(data['free'],10))/1000000>>0) );
                            }else{

                            }                             
                        }
                    )
                    .success(function() {

                    })
                    .error(function() { 
                        console.log("OFFlowMod request: Error");
                        addErroneousRequest();
                    });

                }, 3000);
            }
        });
    }

    gauge();

});
