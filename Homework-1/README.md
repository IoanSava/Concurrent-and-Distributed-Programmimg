# Homework 1

## Server

### Optional arguments

* ```-p / --protocol```
  * Communication protocol: ```TCP``` or ```UDP```.
  * default: ```TCP```
* ```-m / --mechanism```
  * Communication mechanism: ```streaming``` or ```stop-and-wait```. 
  * default: ```streaming```
* ```-ms / --message-size```
  * Message size in bytes (between 1 and 65535).
  * default: ```1024```

### Mandatory arguments

* ```--host```
  * Server host
* ```--port```
  * Server port

### How to run a TCP streaming server

```py ./server.py -p TCP -m streaming -ms 30000 --host 127.0.0.1 --port 2000```

## Client

### Optional arguments

* ```-p / --protocol```
    * Communication protocol: ```TCP``` or ```UDP```.
    * default: ```TCP```
* ```-m / --mechanism```
    * Communication mechanism: ```streaming``` or ```stop-and-wait```.
    * default: ```streaming```
* ```-ms / --message-size```
    * Message size in bytes (between 1 and 65535).
    * default: ```1024```

### Mandatory arguments

* ```-f / --file```
  * File to send to the server.
* ```--server-host```
  * Server host
* ```--server-port```
  * Server port
* ```--client-host```
  * Client host
* ```--client-port```
  * Client port

### How to run a TCP streaming client

```py ./client.py -p TCP -m streaming -ms 30000 -f resources/file.in --server-host 127.0.0.1 --server-port 2000 --client-host 127.0.0.1 --client-port 2001```

### How to generate a file of 1GB (1024 block of 1MB)

```dd if=/dev/urandom of=file.in bs=1MB count=1024```

## Results

### Setup

* Ran locally (on an Ubuntu Virtual Machine)
* Message size: 30000 bytes
* Sent one file of 1 GB

### TCP server + streaming mechanism

* Client
```
[CLIENT][INFO] Transmission time: 10.152331829071045 seconds
[CLIENT][INFO] Number of sent messages: 34135
[CLIENT][INFO] Number of sent bytes: 1024000000
```

* Server
```
[SERVER][INFO] Used protocol: TCP
[SERVER][INFO] Number of read messages: 37572
[SERVER][INFO] Number of read bytes: 1024000000
```

### TCP server + stop-and-wait mechanism

* Client
```
[CLIENT][INFO] Transmission time: 15.380125522613525 seconds
[CLIENT][INFO] Number of sent messages: 34135
[CLIENT][INFO] Number of sent bytes: 1024000000
```

* Server
```
[SERVER][INFO] Used protocol: TCP
[SERVER][INFO] Number of read messages: 34135
[SERVER][INFO] Number of read bytes: 1024000000
```

### UDP server + streaming mechanism

* Client
```
[CLIENT][INFO] Transmission time: 4.285385608673096 seconds
[CLIENT][INFO] Number of sent messages: 34135
[CLIENT][INFO] Number of sent bytes: 1024000000
```

* Server
```
[SERVER][INFO] Used protocol: UDP
[SERVER][INFO] Number of read messages: 21136
[SERVER][INFO] Number of read bytes: 634030000
```

### UDP server + stop-and-wait mechanism

* Client
```
[CLIENT][INFO] Transmission time: 8.016743183135986 seconds
[CLIENT][INFO] Number of sent messages: 34135
[CLIENT][INFO] Number of sent bytes: 1024000000
```

* Server
```
[SERVER][INFO] Used protocol: UDP
[SERVER][INFO] Number of read messages: 34135
[SERVER][INFO] Number of read bytes: 1024000000
```