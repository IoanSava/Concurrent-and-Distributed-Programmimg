import argparse
import socket
import threading
import struct

# valid values for optional arguments
PROTOCOLS = ["TCP", "UDP"]
MECHANISMS = ["streaming", "stop-and-wait"]
MESSAGE_SIZE_LOWER_BOUND = 1
MESSAGE_SIZE_UPPER_BOUND = 65535

FILE_PATH = "resources/file.out"


def build_argument_parser(default_protocol="TCP", default_mechanism="streaming", default_message_size=1024):
    arg_parser = argparse.ArgumentParser()

    # optional arguments
    arg_parser.add_argument("-p", "--protocol",
                            help="Communication protocol: TCP or UDP. Default: {}.".format(default_protocol),
                            default=default_protocol,
                            choices=PROTOCOLS)

    arg_parser.add_argument("-m", "--mechanism",
                            help="Communication mechanism: streaming or stop-and-wait. Default: {}.".format(
                                default_mechanism),
                            default=default_mechanism,
                            choices=MECHANISMS)

    arg_parser.add_argument("-ms", "--message-size",
                            help="Message size in bytes (between {} and {}). Default: {}.".format(
                                MESSAGE_SIZE_LOWER_BOUND, MESSAGE_SIZE_UPPER_BOUND, default_message_size),
                            default=default_message_size,
                            type=int,
                            choices=range(MESSAGE_SIZE_LOWER_BOUND, MESSAGE_SIZE_UPPER_BOUND + 1),
                            metavar="[{}, {}]".format(MESSAGE_SIZE_LOWER_BOUND, MESSAGE_SIZE_UPPER_BOUND))

    # mandatory arguments
    arg_parser.add_argument("--host",
                            help="Server host.",
                            required=True)

    arg_parser.add_argument("--port",
                            help="Server port.",
                            type=int,
                            required=True)

    return arg_parser


class UDPServer(object):
    def __init__(self, address, msg_size, used_mechanism):
        self.msg_size = msg_size

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.socket.bind(address)

        if used_mechanism == "streaming":
            self.receive_file = self.__receive_file_streaming
        else:
            self.receive_file = self.__receive_file_stop_and_wait

    def __receive_file_streaming(self):
        number_of_read_messages = 0
        number_of_read_bytes = 0

        with open(FILE_PATH, "wb") as out:
            try:
                while True:
                    received_data, _ = self.socket.recvfrom(self.msg_size)
                    out.write(received_data)
                    number_of_read_bytes += len(received_data)
                    number_of_read_messages += 1
                    if not received_data:
                        break
            except Exception as exception:
                print("[SERVER][EXCEPTION] {}".format(exception))

        print("[SERVER][INFO] Used protocol: UDP")
        print("[SERVER][INFO] Number of read messages: {}".format(number_of_read_messages))
        print("[SERVER][INFO] Number of read bytes: {}".format(number_of_read_bytes))

    def __receive_file_stop_and_wait(self):
        number_of_read_messages = 0
        number_of_read_bytes = 0

        with open(FILE_PATH, "wb") as out:
            try:
                previous_received_data = None
                while True:
                    received_data, client_address = self.socket.recvfrom(self.msg_size)
                    number_of_read_bytes += len(received_data)
                    if previous_received_data != received_data:
                        previous_received_data = received_data
                        out.write(received_data)
                        number_of_read_messages += 1
                    self.socket.sendto(struct.pack("!i", number_of_read_messages), ("127.0.0.1", 2001))
                    if not previous_received_data:
                        break
            except Exception as exception:
                print("[SERVER][EXCEPTION] {}".format(exception))

        print("[SERVER][INFO] Used protocol: UDP")
        print("[SERVER][INFO] Number of read messages: {}".format(number_of_read_messages))
        print("[SERVER][INFO] Number of read bytes: {}".format(number_of_read_bytes))


class TCPServer(object):
    def __init__(self, address, msg_size, used_mechanism):
        self.msg_size = msg_size

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(address)

        if used_mechanism == "streaming":
            self.receive_file = self.__receive_file_streaming
        else:
            self.receive_file = self.__receive_file_stop_and_wait

    def listen(self):
        self.socket.listen(5)
        while True:
            client, address = self.socket.accept()
            client.settimeout(60)
            threading.Thread(target=self.receive_file, args=[client]).start()

    def __receive_file_streaming(self, client):
        number_of_read_messages = 0
        number_of_read_bytes = 0

        with open(FILE_PATH, "wb") as out:
            try:
                while True:
                    received_data = client.recv(self.msg_size)
                    out.write(received_data)
                    number_of_read_bytes += len(received_data)
                    number_of_read_messages += 1
                    if not received_data:
                        break
            except Exception as exception:
                print("[SERVER][EXCEPTION] {}".format(exception))

        print("[SERVER][INFO] Used protocol: TCP")
        print("[SERVER][INFO] Number of read messages: {}".format(number_of_read_messages))
        print("[SERVER][INFO] Number of read bytes: {}".format(number_of_read_bytes))

    def __receive_file_stop_and_wait(self, client):
        number_of_read_messages = 0
        number_of_read_bytes = 0

        with open(FILE_PATH, "wb") as out:
            try:
                previous_received_data = None
                while True:
                    received_data = client.recv(self.msg_size)
                    number_of_read_bytes += len(received_data)
                    if previous_received_data != received_data:
                        previous_received_data = received_data
                        out.write(received_data)
                        number_of_read_messages += 1
                    client.send(struct.pack("!i", number_of_read_messages))
                    if not received_data:
                        break
            except Exception as exception:
                print("[SERVER][EXCEPTION] {}".format(exception))

        print("[SERVER][INFO] Used protocol: TCP")
        print("[SERVER][INFO] Number of read messages: {}".format(number_of_read_messages))
        print("[SERVER][INFO] Number of read bytes: {}".format(number_of_read_bytes))


if __name__ == '__main__':
    argument_parser = build_argument_parser()
    arguments = argument_parser.parse_args()
    print("[SERVER][INFO] Received arguments: {}".format(arguments))

    protocol = arguments.protocol
    mechanism = arguments.mechanism
    message_size = arguments.message_size

    host = arguments.host
    port = arguments.port

    if protocol == "UDP":
        UDPServer((host, port), message_size, mechanism).receive_file()
    else:
        TCPServer((host, port), message_size, mechanism).listen()
