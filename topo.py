#!/usr/bin/python

from mininet.topo import Topo
from mininet.net import Mininet
from mininet.node import CPULimitedHost
from mininet.link import TCLink
from mininet.util import dumpNodeConnections
from mininet.util import dumpNetConnections
from mininet.log import setLogLevel
from mininet.cli import CLI
from mininet.node import RemoteController


'''
This is the script to creat the topology for the firewall exercise in Lecture 3 from the 34359 SDN course

'''

class MyTopo(Topo):
      
    def __init__(self, **opts):
        Topo.__init__(self, **opts)

        switches = []
        hosts = []

        """connections = {
            's-1': ['s-2','s-4','h-1'],
            's-2': ['s-3','s-4','s-5'],
            's-3': ['s-5','s-6'],
            's-4': ['s-5','s-7'],
            's-5': ['s-7','s-8'],
            's-6': ['s-8','h-3','h-4','h-5'],
            's-7': ['s-8','s-9'],
            's-9': ['h-2']
        }"""

        connections = {
            's-1': ['s-2','s-4','h-1'],
            's-2': ['s-3','s-4','s-5'],
            's-3': ['s-5','s-6'],
            's-4': ['s-5','s-7'],
            's-5': ['s-7','s-8'],
            's-6': ['s-8','h-3'],
            's-7': ['s-8','s-9'],
            's-9': ['h-2']
        }

        for i in range(9):
            switches.append(self.addSwitch('s'+str(i + 1)))
       
        for i in range(3):
            hosts.append(self.addHost('h'+str(i+1)))


        for key, value in connections.iteritems():
            switchNum = int(key.split('-')[-1])
            for dest in value:
                parts = dest.split('-')
                device = parts[0]
                destNum = int(parts[-1])

                if(device == 's'):
                    self.addLink(switches[switchNum-1], switches[destNum-1], bw=100, max_queue_size=1000)
                else:
                    self.addLink(switches[switchNum-1], hosts[destNum-1], bw=100, max_queue_size=1000) 
        

topos = { 'mytopo': ( lambda: MyTopo() ) }  # this makes it possible to run the mininet with the parameter "--topo mytopo"


class FLController (RemoteController):

    def __init__ (self,name):
        RemoteController.__init__(self,'FLController','127.0.0.1',6633)


controllers={'flcontroller': FLController}   # this makes it possible to run mininet with the parameter "--controller flcontroller"

def perfTest():
    '''
    This function runs only when executing the script with python: "sudo python topo_one.py"
    If instead the script is executed like "sudo mn --custom topo_one.py ...." then you can only use the options added to "topos" and "controllers" list, by specifying parameters to the "sudo mn" command.
    '''
    web1="""<!doctype html><html lang=\"en\"><head> <meta charset=\"utf-8\"> <title>VPN 1</title>
         <meta name=\"description\" content=\"Website of VPN1\"> <meta name=\"author\" content=\"Eder Ollora Zaballa\">
         </head><body> <p>Connected to VPN 1</p></body></html>"""

    web2="""<!doctype html><html lang=\"en\"><head> <meta charset=\"utf-8\"> <title>VPN 2</title>
         <meta name=\"description\" content=\"Website of VPN 2\"> <meta name=\"author\" content=\"Eder Ollora Zaballa\">
         </head><body> <p>Connected to VPN 2</p></body></html>"""

    topo = MyTopo()
    net = Mininet(topo=topo,controller=FLController,link=TCLink, listenPort=6634)
   
    switchInterfaces = [3,4,3,4,5,3,4,3,2]
    hostInterfaces = [1,1,1]
    """hostIPs = [
        '10.0.0.1/24',
        '10.0.0.2/24',
        '192.168.1.3/24',
        '10.0.0.2/24',
        '192.168.1.5/24'
        ]"""

    hostIPs = [
        '10.0.0.1/24',
        '10.0.0.2/24',
        '10.0.0.2/24'
        ]

    hosts = net.hosts

    for i,numOfIntfs in enumerate(hostInterfaces):
        for j in range(1,numOfIntfs+1):
            if(i==1 or i==2):
                hosts[i].setMAC('00:00:00:00:0'+str(2)+':0'+str(j), intf='h'+str(i+1)+'-eth'+str(j-1))
            else:
                hosts[i].setMAC('00:00:00:00:0'+str(i+1)+':0'+str(j), intf='h'+str(i+1)+'-eth'+str(j-1))


        #intf = host.defaultIntf()
        hosts[i].setIP(hostIPs[i])
        #host.cmdPrint('ifconfig')
        #host.setDefaultRoute(intf)
        #host.cmdPrint('route')


    switches = net.switches

    for i,numOfIntfs in enumerate(switchInterfaces):
        for intf in range(1,numOfIntfs+1): 
        # +1 because we want to include last number (intfs 1 to 5, include as index 5). 
        # and +1 because we need 1 more for controller
            #print('s'+str(i+1)+'-eth'+str(intf))
            switches[i].setMAC('00:00:00:0'+str(i+1)+':00:0'+str(intf), intf='s'+str(i+1)+'-eth'+str(intf))



    net.start()
    print "Dumping host connections"
    dumpNodeConnections(net.hosts)
    dumpNetConnections(net)
    #hosts[1].cmd('mkdir www')
    hosts[1].cmd('cd www')
    #hosts[1].cmd('echo \"'+web2+'\" > index.html')
    hosts[1].cmd('python -m SimpleHTTPServer 80 &')
    #hosts[2].cmd('mkdir www2')
    hosts[2].cmd('cd www2')
    #hosts[2].cmd('echo \"'+web1+'\" > index.html')
    hosts[2].cmd('python -m SimpleHTTPServer 80 &')
    CLI(net)
    net.stop()

if __name__ == '__main__':
    '''
    Whenever the script is executed with python instead of being a parameter to "sudo mn"
    this part is executed. So the perfTest() function is called. 
    '''
    setLogLevel('info')   
    perfTest()

